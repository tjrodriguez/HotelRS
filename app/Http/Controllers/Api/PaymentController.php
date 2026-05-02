<?php

namespace App\Http\Controllers\Api;

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

        return response()->json($query->paginate(20));
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

        return response()->json($payment);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:credit_card,debit_card,bank_transfer,cash',
        ]);

        $reservation = Reservation::find($validated['reservation_id']);

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = Payment::create([
            'reservation_id' => $validated['reservation_id'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'status' => 'pending',
        ]);

        // In a real system, you would process payment here
        // For now, we'll mark it as completed
        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'transaction_id' => 'TXN-'.str()->random(16),
        ]);

        // Update reservation status if full payment is made
        if ($payment->amount >= $reservation->total_price) {
            $reservation->update(['status' => 'confirmed']);
        }

        return response()->json($payment, 201);
    }

    public function refund($id, Request $request)
    {
        $payment = Payment::find($id);

        if (! $payment) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($payment->status !== 'completed') {
            return response()->json(['message' => 'Cannot refund this payment'], 422);
        }

        $payment->update(['status' => 'refunded']);
        $payment->reservation->update(['status' => 'cancelled']);

        return response()->json($payment);
    }
}
