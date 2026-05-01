<?php

namespace App\Http\Controllers\Api;

use App\Models\Reservation;
use App\Models\Promotion;
use Illuminate\Http\Request;

class ReservationController {
    public function index(Request $request) {
        $query = Reservation::with(['user', 'room', 'promotion', 'payments']);

        if ($request->user()->isGuest()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id') && $request->user()->isAdmin()) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json($query->paginate(20));
    }

    public function show($id, Request $request) {
        $reservation = Reservation::with(['user', 'room', 'promotion', 'payments'])->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($reservation);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date_format:Y-m-d H:i|after:now',
            'check_out' => 'required|date_format:Y-m-d H:i|after:check_in',
            'number_of_guests' => 'required|integer|min:1',
            'promotion_code' => 'nullable|string|exists:promotions,code',
            'special_requests' => 'nullable|string',
        ]);

        $room = \App\Models\Room::find($validated['room_id']);
        if (!$room->isAvailable($validated['check_in'], $validated['check_out'])) {
            return response()->json(['message' => 'Room not available for selected dates'], 422);
        }

        $promotion = null;
        $discountAmount = 0;

        if ($validated['promotion_code'] ?? null) {
            $promotion = Promotion::where('code', $validated['promotion_code'])->first();
            if ($promotion && $promotion->isValid()) {
                $basePrice = $room->roomType->base_price * ((new Reservation())->calculateNights());
                $discountAmount = $promotion->calculateDiscount($basePrice);
                $promotion->increment('current_uses');
            } else {
                return response()->json(['message' => 'Invalid or expired promotion code'], 422);
            }
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'room_id' => $validated['room_id'],
            'promotion_id' => $promotion->id ?? null,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'number_of_guests' => $validated['number_of_guests'],
            'special_requests' => $validated['special_requests'] ?? null,
            'status' => 'pending',
            'total_price' => 0,
            'discount_amount' => $discountAmount,
        ]);

        $pricing = $reservation->calculatePrice();
        $reservation->update([
            'total_price' => $pricing['total_price'],
            'discount_amount' => $pricing['discount_amount'],
        ]);

        return response()->json($reservation->load(['room', 'promotion', 'payments']), 201);
    }

    public function cancel($id, Request $request) {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($reservation->status === 'completed' || $reservation->status === 'cancelled') {
            return response()->json(['message' => 'Cannot cancel this reservation'], 422);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json($reservation);
    }

    public function confirm($id, Request $request) {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $reservation->update(['status' => 'confirmed']);

        return response()->json($reservation);
    }
}
