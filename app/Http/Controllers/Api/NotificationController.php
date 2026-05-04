<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;

class NotificationController
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->limit(30)
            ->get()
            ->map(function ($notification) {
                $payload = $notification->data ?? [];

                return [
                    'id' => $notification->id,
                    'title' => $payload['title'] ?? 'Notification',
                    'message' => $payload['message'] ?? 'No message available.',
                    'type' => $payload['type'] ?? 'general',
                    'meta' => $payload['meta'] ?? [],
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            })
            ->values();

        return response()->json([
            'data' => $notifications,
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markAsRead(string $id, Request $request)
    {
        $notification = $request->user()->notifications()->find($id);

        if (! $notification) {
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
