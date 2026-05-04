<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Enums\ReservationStatus;
use App\Http\Requests\Api\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\Reservation;
use Illuminate\Http\Request;

class PaymentController
{
    public function index(Request $request)
    {
        $query = Payment::with(['reservation']);

        if ($request->user()->isGuest()) {
            $query->whereHas('reservation', function ($q) {
                $q->where('guest_id', auth()->id());
            });
        }

        $paginated = $query->paginate(20);

        return response()->json([
            'data' => PaymentResource::collection($paginated),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show($id, Request $request)
    {
        $payment = Payment::with('reservation')->find($id);

        if (! $payment) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $payment->reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(new PaymentResource($payment));
    }

    public function store(StorePaymentRequest $request)
    {
        $validated = $request->validated();

        $reservation = Reservation::find($validated['reservation_id']);

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = Payment::create([
            'reservation_id' => $validated['reservation_id'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'status' => PaymentStatus::Pending,
        ]);

        // In a real system, you would process payment here
        // For now, we'll mark it as completed
        $payment->update([
            'status' => PaymentStatus::Completed,
            'paid_at' => now(),
            'transaction_id' => 'TXN-'.str()->random(16),
        ]);

        // Update reservation status if full payment (or more) is made
        if ((float) $reservation->paid_amount >= (float) $reservation->total_price) {
            $reservation->update(['status' => ReservationStatus::Confirmed]);
        }

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function refund($id, Request $request)
    {
        $payment = Payment::find($id);

        if (! $payment) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($payment->status !== PaymentStatus::Completed) {
            return response()->json(['message' => 'Cannot refund this payment'], 422);
        }

        $payment->update(['status' => PaymentStatus::Refunded]);

        return response()->json(new PaymentResource($payment));
    }
}
