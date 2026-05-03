<?php

namespace App\Http\Controllers\Api;

use App\Enums\RoomStatus;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController
{
    public function index(Request $request)
    {
        $query = Room::with(['roomType']);

        if ($request->has('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('floor')) {
            $query->where('floor', $request->floor);
        }

        $paginated = $query->paginate(20);

        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');

        $paginated->getCollection()->transform(function (Room $room) use ($checkIn, $checkOut) {
            $status = $room->status ?? RoomStatus::Available;
            $isBlockedByStatus = in_array($status, [RoomStatus::Occupied, RoomStatus::Reserved, RoomStatus::Maintenance], true);

            $isBlockedByReservation = false;
            if ($checkIn && $checkOut) {
                $isBlockedByReservation = ! $room->isAvailable($checkIn, $checkOut);
            }

            $isAvailableForBooking = ! $isBlockedByStatus && ! $isBlockedByReservation && $status === RoomStatus::Available;

            $room->setAttribute('is_available_for_booking', $isAvailableForBooking);

            return $room;
        });

        return response()->json([
            'data' => RoomResource::collection($paginated),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show($id)
    {
        $room = Room::with(['roomType', 'reservations'])->find($id);
        if (! $room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json(new RoomResource($room));
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $room = Room::find($request->room_id);

        if (! $room) {
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
            'status' => 'nullable|string|in:available,occupied,maintenance,reserved',
            'floor' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
        ]);

        $validated['status'] = $validated['status'] ?? RoomStatus::Available->value;

        $room = Room::create($validated);

        return (new RoomResource($room->load(['roomType'])))->response()->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $room = Room::find($id);
        if (! $room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'room_number' => 'unique:rooms,room_number,'.$id,
            'room_type_id' => 'exists:room_types,id',
            'status' => 'nullable|string|in:available,occupied,maintenance,reserved',
            'floor' => 'integer|min:1',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
        ]);

        $room->update($validated);

        return response()->json(new RoomResource($room->load(['roomType'])));
    }

    public function destroy($id)
    {
        $room = Room::find($id);
        if (! $room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $room->delete();

        return response()->json(null, 204);
    }
}
