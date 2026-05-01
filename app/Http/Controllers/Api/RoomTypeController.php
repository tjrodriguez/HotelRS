<?php

namespace App\Http\Controllers\Api;

use App\Models\RoomType;
use Illuminate\Http\Request;

class RoomTypeController {
    public function index() {
        return response()->json(RoomType::all());
    }

    public function show($id) {
        $roomType = RoomType::find($id);
        if (!$roomType) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($roomType);
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'name' => 'required|unique:room_types',
            'description' => 'nullable|string',
            'max_capacity' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
        ]);

        $roomType = RoomType::create($validated);

        return response()->json($roomType, 201);
    }

    public function update(Request $request, $id) {
        $roomType = RoomType::find($id);
        if (!$roomType) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'unique:room_types,name,' . $id,
            'description' => 'nullable|string',
            'max_capacity' => 'integer|min:1',
            'base_price' => 'numeric|min:0',
        ]);

        $roomType->update($validated);

        return response()->json($roomType);
    }

    public function destroy($id) {
        $roomType = RoomType::find($id);
        if (!$roomType) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $roomType->delete();

        return response()->json(null, 204);
    }
}
