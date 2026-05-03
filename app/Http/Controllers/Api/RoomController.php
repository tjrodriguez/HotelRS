<?php

namespace App\Http\Controllers\Api;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $paginated = $query->paginate(20);

        $this->syncRoomsToReservationState($paginated->getCollection());

        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');

        $paginated->getCollection()->transform(function (Room $room) use ($checkIn, $checkOut) {
            $statusName = strtolower((string) ($room->roomStatus?->status_name ?? 'available'));
            $isBlockedByStatus = in_array($statusName, ['occupied', 'reserved', 'maintenance'], true);

            $isBlockedByReservation = false;
            if ($checkIn && $checkOut) {
                $isBlockedByReservation = ! $room->isAvailable($checkIn, $checkOut);
            }

            $isAvailableForBooking = ! $isBlockedByStatus && ! $isBlockedByReservation && in_array($statusName, ['available', 'vacant'], true);

            $displayStatus = 'Available';
            if ($statusName === 'occupied') {
                $displayStatus = 'Occupied';
            } elseif ($statusName === 'reserved') {
                $displayStatus = 'Reserved';
            } elseif ($statusName === 'maintenance') {
                $displayStatus = 'Maintenance';
            } elseif ($isBlockedByReservation) {
                $displayStatus = 'Occupied';
            }

            $room->setAttribute('availability_status', $displayStatus);
            $room->setAttribute('is_available_for_booking', $isAvailableForBooking);

            return $room;
        });

        return response()->json($paginated);
    }

    public function show($id)
    {
        $room = Room::with(['roomType', 'roomStatus', 'reservations'])->find($id);
        if (!$room) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $this->syncRoomsToReservationState(collect([$room]));

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

    private function syncRoomsToReservationState($rooms): void
    {
        $collection = collect($rooms);

        $collection->each(function (Room $room): void {
            $hasConfirmedReservation = $room->reservations()
                ->where('status', 'confirmed')
                ->exists();

            $hasPendingReservation = $room->reservations()
                ->where('status', 'pending')
                ->exists();

            $currentStatus = strtolower((string) ($room->roomStatus?->status_name ?? 'available'));
            $targetStatus = $currentStatus === 'maintenance'
                ? 'maintenance'
                : ($hasConfirmedReservation ? 'occupied' : ($hasPendingReservation ? 'reserved' : 'available'));

            $statusId = DB::table('room_statuses')
                ->whereRaw('LOWER(status_name) = ?', [$targetStatus])
                ->value('id');

            if ($statusId && (int) $room->room_status_id !== (int) $statusId) {
                $room->update(['room_status_id' => $statusId]);
            }

            $displayStatus = match ($targetStatus) {
                'occupied' => 'Occupied',
                'reserved' => 'Reserved',
                'maintenance' => 'Maintenance',
                default => 'Available',
            };

            $room->setAttribute('availability_status', $displayStatus);
            $room->setAttribute('is_available_for_booking', $targetStatus === 'available');
        });
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
