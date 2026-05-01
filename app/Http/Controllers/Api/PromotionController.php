<?php

namespace App\Http\Controllers\Api;

use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController {
    public function index() {
        return response()->json(Promotion::paginate(20));
    }

    public function show($id) {
        $promotion = Promotion::find($id);
        if (!$promotion) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json($promotion);
    }

    public function validate(Request $request) {
        $validated = $request->validate([
            'code' => 'required|string|exists:promotions,code',
        ]);

        $promotion = Promotion::where('code', $validated['code'])->first();

        if (!$promotion || !$promotion->isValid()) {
            return response()->json(['message' => 'Invalid or expired promotion code'], 422);
        }

        return response()->json($promotion);
    }

    public function store(Request $request) {

        $validated = $request->validate([
            'code' => 'required|unique:promotions',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'max_uses' => 'nullable|integer|min:1',
        ]);

        $promotion = Promotion::create($validated);

        return response()->json($promotion, 201);
    }

    public function update(Request $request, $id) {
        $promotion = Promotion::find($id);
        if (!$promotion) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'code' => 'unique:promotions,code,' . $id,
            'description' => 'nullable|string',
            'discount_type' => 'in:percentage,fixed',
            'discount_value' => 'numeric|min:0',
            'valid_from' => 'date',
            'valid_until' => 'date|after:valid_from',
            'max_uses' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $promotion->update($validated);

        return response()->json($promotion);
    }

    public function destroy($id) {
        $promotion = Promotion::find($id);
        if (!$promotion) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $promotion->delete();

        return response()->json(null, 204);
    }
}
