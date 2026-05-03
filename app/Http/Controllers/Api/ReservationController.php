<?php

namespace App\Http\Controllers\Api;

use App\Actions\Reservations\CreateReservation;
use App\Http\Requests\Api\StoreReservationRequest;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        if ($request->has('user_id') && $request->user()->isAdmin()) {
            $query->where('guest_id', $request->user_id);
        }

        $paginated = $query->paginate(20);

        $paginated->getCollection()->transform(function (Reservation $reservation) {
            return $this->decorateFinancials($reservation);
        });

        return response()->json($paginated);
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

        return response()->json($this->decorateFinancials($reservation));
    }

    public function store(StoreReservationRequest $request, CreateReservation $createReservation)
    {
        $reservation = $createReservation->handle($request->user(), $request->validated());

        $this->syncRoomStatus($reservation->room);

        return response()->json(
            $this->decorateFinancials(
                $reservation->fresh(['guest', 'room.roomType', 'room.roomStatus', 'promotion', 'payments'])
            ),
            201
        );
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

        if ($reservation->status === 'completed' || $reservation->status === 'cancelled') {
            return response()->json(['message' => 'Cannot cancel this reservation'], 422);
        }

        $reservation->update(['status' => 'cancelled']);
        $this->syncRoomStatus($reservation->room);

        return response()->json($this->decorateFinancials($reservation));
    }

    public function confirm(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $reservation->update(['status' => 'confirmed']);
        $this->syncRoomStatus($reservation->room);

        return response()->json($this->decorateFinancials($reservation));
    }

    public function decline(int $id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room.roomType', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($reservation->status === 'completed' || $reservation->status === 'cancelled') {
            return response()->json(['message' => 'Cannot decline this reservation'], 422);
        }

        $reservation->update(['status' => 'cancelled']);
        $this->syncRoomStatus($reservation->room);

        return response()->json($this->decorateFinancials($reservation));
    }

    private function decorateFinancials(Reservation $reservation): Reservation
    {
        $pricing = $reservation->calculatePrice();
        $storedTotal = (float) ($reservation->total_price ?? 0);
        $calculatedTotal = (float) ($pricing['total_price'] ?? 0);
        $effectiveTotal = $storedTotal > 0 ? $storedTotal : $calculatedTotal;

        $paidAmount = (float) $reservation->payments
            ->where('status', 'completed')
            ->sum('amount');

        $reservation->setAttribute('calculated_total_price', round($effectiveTotal, 2));
        $reservation->setAttribute('paid_amount', round($paidAmount, 2));
        $reservation->setAttribute('balance_due', round(max(0, $effectiveTotal - $paidAmount), 2));

        return $reservation;
    }

    public function getRoomReservations(int $id)
    {
        $room = Room::find($id);

        if (! $room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        // Get all active reservations (pending or confirmed, not cancelled or completed)
        $reservations = Reservation::where('room_id', $id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->select(['id', 'room_id', 'check_in_date', 'check_out_date', 'status'])
            ->orderBy('check_in_date')
            ->get();

        return response()->json($reservations);
    }

    private function syncRoomStatus(?Room $room): void
    {
        if (! $room) {
            return;
        }

        $hasConfirmedReservation = $room->reservations()
            ->where('status', 'confirmed')
            ->exists();

        $hasPendingReservation = $room->reservations()
            ->where('status', 'pending')
            ->exists();

        $targetStatus = 'Available';

        if ($hasConfirmedReservation) {
            $targetStatus = 'Occupied';
        } elseif ($hasPendingReservation) {
            $targetStatus = 'Reserved';
        }

        $statusId = DB::table('room_statuses')
            ->whereRaw('LOWER(status_name) = ?', [strtolower($targetStatus)])
            ->value('id');

        if ($statusId) {
            $room->update(['room_status_id' => $statusId]);
            $room->load('roomStatus');
        }
    }
}
