<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Api\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController
{
    public function index(Request $request)
    {
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

        $paginated = $query->paginate(20);

        return response()->json([
            'data' => UserResource::collection($paginated),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show($id, Request $request)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, $id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $user->update($request->validated());

        return response()->json(new UserResource($user));
    }

    public function destroy($id, Request $request)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account'], 422);
        }

        $user->delete();

        return response()->json(null, 204);
    }
}
