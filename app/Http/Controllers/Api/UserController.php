<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;

class UserController {
    public function index(Request $request) {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function show($id, Request $request) {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request, $id) {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $id,
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'in:admin,guest',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id, Request $request) {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
