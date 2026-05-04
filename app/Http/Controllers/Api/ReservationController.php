<?php

namespace App\Http\Controllers\Api;

use App\Actions\Reservations\CreateReservation;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ReservationStatus;
use App\Enums\RoomStatus;
use App\Events\ReservationStatusChanged;
use App\Http\Requests\Api\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\RoleAlertNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ReservationController
{
    public function index(Request $request)
    {
        $query = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments']);

        if ($request->user()->isGuest()) {
            $query->where('guest_id', $request->user()->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('guest_id') && $request->user()->isAdmin()) {
            $query->where('guest_id', $request->guest_id);
        }

        $paginated = $query->paginate(20);

        $paginated->getCollection()->transform(function (Reservation $reservation) {
            return $this->decorateFinancials($reservation);
        });

        return response()->json([
            'data' => ReservationResource::collection($paginated),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(new ReservationResource($this->decorateFinancials($reservation)));
    }

    public function store(StoreReservationRequest $request, CreateReservation $createReservation)
    {
        $reservation = $createReservation->handle($request->user(), $request->validated());

        return (new ReservationResource(
            $this->decorateFinancials($reservation->fresh(['guest', 'room.roomType', 'promotion', 'payments']))
        ))->response()->setStatusCode(201);
    }

    public function cancel(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->status === ReservationStatus::Completed || $reservation->status === ReservationStatus::Cancelled) {
            return response()->json(['message' => 'Cannot cancel this reservation'], 422);
        }

        $previousStatus = $reservation->status->value;
        $reservation->update(['status' => ReservationStatus::Cancelled]);
        ReservationStatusChanged::dispatch($reservation, $previousStatus);

        return response()->json(new ReservationResource($this->decorateFinancials($reservation)));
    }

    public function confirm(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($reservation->status !== ReservationStatus::Pending) {
            return response()->json(['message' => 'Only pending reservations can be accepted.'], 422);
        }

        $deductedAmount = 0.0;
        $walletBalanceAfterDeduction = null;

        DB::transaction(function () use (&$reservation, &$deductedAmount, &$walletBalanceAfterDeduction): void {
            $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])
                ->lockForUpdate()
                ->findOrFail($reservation->id);

            $balanceDue = $this->calculateOutstandingBalance($reservation);
            $wallet = Wallet::firstOrCreate(['user_id' => $reservation->guest_id], ['balance' => 0]);

            if ($balanceDue > 0 && (float) $wallet->balance > 0) {
                $deductedAmount = round(min((float) $wallet->balance, $balanceDue), 2);

                if ($deductedAmount > 0) {
                    $wallet->balance = round((float) $wallet->balance - $deductedAmount, 2);
                    $wallet->save();

                    Payment::create([
                        'reservation_id' => $reservation->id,
                        'amount' => $deductedAmount,
                        'payment_method' => PaymentMethod::EWallet,
                        'status' => PaymentStatus::Completed,
                        'transaction_id' => 'WALLET-'.str()->upper(str()->random(12)),
                        'payment_details' => [
                            'source' => 'wallet_auto_deduction_on_accept',
                            'balance_due_before' => $balanceDue,
                        ],
                        'paid_at' => now(),
                    ]);
                }
            }

            $walletBalanceAfterDeduction = round((float) $wallet->balance, 2);

            $previousStatus = $reservation->status->value;
            $reservation->update(['status' => ReservationStatus::Confirmed]);
            ReservationStatusChanged::dispatch($reservation, $previousStatus);

            $reservation->load(['guest', 'room.roomType', 'promotion', 'payments']);
        });

        $this->notifyReservationAccepted($reservation, $request->user(), $deductedAmount, $walletBalanceAfterDeduction);

        return response()->json(new ReservationResource($this->decorateFinancials($reservation)));
    }

    private function calculateOutstandingBalance(Reservation $reservation): float
    {
        $storedTotal = (float) ($reservation->total_price ?? 0);
        $calculatedTotal = (float) ($reservation->calculatePrice()['total_price'] ?? 0);
        $effectiveTotal = $storedTotal > 0 ? $storedTotal : $calculatedTotal;

        $paidAmount = (float) $reservation->payments()
            ->where('status', PaymentStatus::Completed)
            ->sum('amount');

        return round(max(0, $effectiveTotal - $paidAmount), 2);
    }

    private function notifyReservationAccepted(Reservation $reservation, User $actingAdmin, float $deductedAmount, ?float $walletBalanceAfterDeduction): void
    {
        $guest = $reservation->guest;
        $roomNumber = $reservation->room?->room_number ?? $reservation->room_id;
        $walletAfter = $walletBalanceAfterDeduction ?? 0;

        $guest->notify(new RoleAlertNotification(
            title: 'Booking Accepted',
            message: sprintf(
                'Your reservation for Room %s was accepted. Wallet deducted: $%.2f. Remaining balance: $%.2f.',
                $roomNumber,
                $deductedAmount,
                $walletAfter,
            ),
            type: 'reservation_accepted',
            meta: [
                'reservation_id' => $reservation->id,
                'wallet_deducted' => $deductedAmount,
                'wallet_balance' => $walletAfter,
            ],
        ));

        $adminNotification = new RoleAlertNotification(
            title: 'Reservation Accepted',
            message: sprintf(
                '%s accepted reservation #%d. Wallet deducted from guest: $%.2f.',
                $actingAdmin->name,
                $reservation->id,
                $deductedAmount,
            ),
            type: 'reservation_accepted_admin',
            meta: [
                'reservation_id' => $reservation->id,
                'guest_id' => $reservation->guest_id,
                'wallet_deducted' => $deductedAmount,
            ],
        );

        $adminUsers = User::query()->where('role', 'admin')->get();

        if ($adminUsers->isNotEmpty()) {
            Notification::send($adminUsers, $adminNotification);
        }
    }

    public function decline(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($reservation->status === ReservationStatus::Completed || $reservation->status === ReservationStatus::Cancelled) {
            return response()->json(['message' => 'Cannot decline this reservation'], 422);
        }

        $previousStatus = $reservation->status->value;
        $reservation->update(['status' => ReservationStatus::Cancelled]);
        ReservationStatusChanged::dispatch($reservation, $previousStatus);

        return response()->json(new ReservationResource($this->decorateFinancials($reservation)));
    }

    private function decorateFinancials(Reservation $reservation): Reservation
    {
        $pricing = $reservation->calculatePrice();
        $storedTotal = (float) ($reservation->total_price ?? 0);
        $calculatedTotal = (float) ($pricing['total_price'] ?? 0);
        $effectiveTotal = $storedTotal > 0 ? $storedTotal : $calculatedTotal;

        $paidAmount = (float) $reservation->payments
            ->where('status', PaymentStatus::Completed)
            ->sum('amount');

        $reservation->setAttribute('calculated_total_price', round($effectiveTotal, 2));
        $reservation->setAttribute('paid_amount', round($paidAmount, 2));
        $reservation->setAttribute('balance_due', round(max(0, $effectiveTotal - $paidAmount), 2));

        return $reservation;
    }

    public function checkIn(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->status !== ReservationStatus::Confirmed) {
            return response()->json(['message' => 'Reservation must be confirmed before check-in.'], 422);
        }

        if ($reservation->checked_in_at !== null) {
            return response()->json(['message' => 'Guest already checked in.'], 422);
        }

        $previousStatus = $reservation->status->value;
        $reservation->update([
            'checked_in_at' => now(),
            'status' => ReservationStatus::CheckedIn,
        ]);
        $reservation->room->update(['status' => RoomStatus::Occupied]);
        ReservationStatusChanged::dispatch($reservation, $previousStatus);

        return response()->json(new ReservationResource($this->decorateFinancials($reservation)));
    }

    public function checkOut(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->checked_in_at === null) {
            return response()->json(['message' => 'Guest has not checked in yet.'], 422);
        }

        if ($reservation->checked_out_at !== null) {
            return response()->json(['message' => 'Guest already checked out.'], 422);
        }

        $previousStatus = $reservation->status->value;
        $reservation->update([
            'checked_out_at' => now(),
            'status' => ReservationStatus::Completed,
        ]);
        $reservation->room->update(['status' => RoomStatus::Available]);
        ReservationStatusChanged::dispatch($reservation, $previousStatus);

        return response()->json(new ReservationResource($this->decorateFinancials($reservation)));
    }

    public function getRoomReservations(int $id)
    {
        $room = Room::find($id);

        if (! $room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        // Get all active reservations (pending, confirmed, or checked in)
        $reservations = Reservation::where('room_id', $id)
            ->whereIn('status', [ReservationStatus::Pending, ReservationStatus::Confirmed, ReservationStatus::CheckedIn])
            ->select(['id', 'room_id', 'check_in_date', 'check_out_date', 'status'])
            ->orderBy('check_in_date')
            ->get();

        return response()->json(ReservationResource::collection($reservations));
    }
}
