<?php

namespace App\Http\Controllers\Api;

use App\Models\RoomStatus;
use Illuminate\Http\Request;

class RoomStatusController {
    public function index() {
        return response()->json(RoomStatus::all());
    }

    public function show($id) {
        $status = RoomStatus::find($id);
        if (!$status) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($status);
    }

    public function store(Request $request) {

        $validated = $request->validate([
            'name' => 'required|unique:room_statuses',
            'color' => 'required|string',
        ]);

        $status = RoomStatus::create($validated);

        return response()->json($status, 201);
    }

    public function update(Request $request, $id) {
        $status = RoomStatus::find($id);
        if (!$status) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'unique:room_statuses,name,' . $id,
            'color' => 'string',
        ]);

        $status->update($validated);

        return response()->json($status);
    }

    public function destroy($id) {
        $status = RoomStatus::find($id);
        if (!$status) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $status->delete();

        return response()->json(null, 204);
    }
}
