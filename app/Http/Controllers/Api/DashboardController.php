<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Enums\ReservationStatus;
use App\Models\ActivityLog;
use App\Models\Payment;
use App\Models\Promotion;
use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;

class DashboardController
{
    public function stats(Request $request)
    {
        $today = now()->toDateString();

        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0;

        $todayRevenue = Payment::where('status', PaymentStatus::Completed)
            ->whereDate('paid_at', $today)
            ->sum('amount');

        $checkInsToday = Reservation::whereDate('check_in_date', $today)
            ->whereIn('status', [ReservationStatus::Confirmed, ReservationStatus::Pending])
            ->count();

        $checkOutsToday = Reservation::whereDate('check_out_date', $today)
            ->whereIn('status', [ReservationStatus::CheckedIn, ReservationStatus::Completed])
            ->count();

        $activePromotions = Promotion::validToday()->count();

        $weeklyRevenue = [];
        $weekDays = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $weekDays[] = $date->format('D');
            $weeklyRevenue[] = (float) Payment::where('status', PaymentStatus::Completed)
                ->whereDate('paid_at', $date->toDateString())
                ->sum('amount');
        }

        $recentActivity = ActivityLog::with('user')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function (ActivityLog $log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'user_name' => $log->user->name,
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'stats' => [
                'occupancy_rate' => $occupancyRate,
                'occupied_rooms' => $occupiedRooms,
                'total_rooms' => $totalRooms,
                'today_revenue' => round($todayRevenue, 2),
                'check_ins_today' => $checkInsToday,
                'check_outs_today' => $checkOutsToday,
                'active_promotions' => $activePromotions,
            ],
            'weekly_revenue' => [
                'labels' => $weekDays,
                'values' => $weeklyRevenue,
            ],
            'recent_activity' => $recentActivity,
        ]);
    }
}
