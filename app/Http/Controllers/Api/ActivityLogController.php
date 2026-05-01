<?php

namespace App\Http\Controllers\Api;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController {
    public function index(Request $request) {
        $query = ActivityLog::with('user');

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        return response()->json($query->orderByDesc('created_at')->paginate(50));
    }

    public function show($id, Request $request) {
        $log = ActivityLog::with('user')->find($id);

        if (!$log) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($log);
    }

    public static function log($action, $modelType, $modelId, $changes = null) {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'changes' => $changes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
