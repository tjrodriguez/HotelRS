<?php

namespace App\Http\Controllers\Api;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController
{
    public function index(Request $request)
    {
        $query = Room::with(['roomType', 'roomStatus']);

        if ($request->has('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }

        if ($request->has('room_status_id')) {
            $query->where('room_status_id', $request->room_status_id);
        }

        if ($request->has('floor')) {
            $query->where('floor', $request->floor);
        }

        // Filter by availability dates
        if ($request->has('check_in') && $request->has('check_out')) {
            $checkIn = $request->check_in;
            $checkOut = $request->check_out;

            $query->where(function ($q) use ($checkIn, $checkOut) {
                $q->whereDoesntHave('reservations', function ($subquery) use ($checkIn, $checkOut) {
                    $subquery->where(function ($q) use ($checkIn, $checkOut) {
                        $q->whereBetween('check_in_date', [$checkIn, $checkOut])
                            ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                            ->orWhere(function ($q) use ($checkIn, $checkOut) {
                                $q->where('check_in_date', '<=', $checkIn)
                                    ->where('check_out_date', '>=', $checkOut);
                            });
                    })
                    ->whereIn('status', ['confirmed', 'pending']);
                });
            });
        }

        return response()->json($query->paginate(20));
    }

    public function show($id)
    {
        $room = Room::with(['roomType', 'roomStatus', 'reservations'])->find($id);
        if (!$room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($room);
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $room = Room::find($request->room_id);

        if (!$room) {
            return response()->json(['message' => 'Room not found'], 404);
        }

        $available = $room->isAvailable($request->check_in, $request->check_out);

        return response()->json([
            'available' => $available,
            'room_id' => $room->id,
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|unique:rooms',
            'room_type_id' => 'required|exists:room_types,id',
            'room_status_id' => 'required|exists:room_statuses,id',
            'floor' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
        ]);

        $room = Room::create($validated);

        return response()->json($room->load(['roomType', 'roomStatus']), 201);
    }

    public function update(Request $request, $id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'room_number' => 'unique:rooms,room_number,' . $id,
            'room_type_id' => 'exists:room_types,id',
            'room_status_id' => 'exists:room_statuses,id',
            'floor' => 'integer|min:1',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
        ]);

        $room->update($validated);

        return response()->json($room->load(['roomType', 'roomStatus']));
    }

    public function destroy($id)
    {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $room->delete();

        return response()->json(null, 204);
    }
}
