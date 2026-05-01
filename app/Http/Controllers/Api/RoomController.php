<?php

namespace App\Http\Controllers\Api;

use App\Models\Room;
use Illuminate\Http\Request;

class RoomController {
    public function index(Request $request) {
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

        return response()->json($query->paginate(20));
    }

    public function show($id) {
        $room = Room::with(['roomType', 'roomStatus', 'reservations'])->find($id);
        if (!$room) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($room);
    }

    public function store(Request $request) {

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

    public function update(Request $request, $id) {
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

    public function destroy($id) {
        $room = Room::find($id);
        if (!$room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $room->delete();

        return response()->json(null, 204);
    }

    public function checkAvailability(Request $request) {
        $validated = $request->validate([
            'room_type_id' => 'required|exists:room_types,id',
            'check_in' => 'required|date_format:Y-m-d',
            'check_out' => 'required|date_format:Y-m-d|after:check_in',
            'number_of_guests' => 'required|integer|min:1',
        ]);

        $rooms = Room::where('room_type_id', $validated['room_type_id'])
            ->with('roomType')
            ->get()
            ->filter(function ($room) use ($validated) {
                return $room->roomType->max_capacity >= $validated['number_of_guests']
                    && $room->isAvailable($validated['check_in'], $validated['check_out']);
            });

        return response()->json($rooms->values());
    }
}
