<?php

namespace App\Http\Controllers\Api;

use App\Actions\Reservations\CreateReservation;
use App\Http\Requests\Api\StoreReservationRequest;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController
{
    public function index(Request $request)
    {
        $query = Reservation::with(['guest', 'room', 'promotion', 'payments']);

        if ($request->user()->isGuest()) {
            $query->where('guest_id', $request->user()->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id') && $request->user()->isAdmin()) {
            $query->where('guest_id', $request->user_id);
        }

        return response()->json($query->paginate(20));
    }

    public function show($id, Request $request)
    {
        $reservation = Reservation::with(['guest', 'room', 'promotion', 'payments'])->find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->user()->isGuest() && $reservation->guest_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($reservation);
    }

    public function store(StoreReservationRequest $request, CreateReservation $createReservation)
    {
        $reservation = $createReservation->handle($request->user(), $request->validated());

        return response()->json($reservation, 201);
    }

    public function cancel($id, Request $request)
    {
        $reservation = Reservation::find($id);

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

        return response()->json($reservation);
    }

    public function confirm($id, Request $request)
    {
        $reservation = Reservation::find($id);

        if (! $reservation) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $reservation->update(['status' => 'confirmed']);

        return response()->json($reservation);
    }
}
