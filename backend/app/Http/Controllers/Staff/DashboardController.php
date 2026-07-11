<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Fustan;
use App\Models\Reservation;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();
        $weekFromNow = Carbon::today()->addDays(7)->toDateString();

        $totalFustane = Fustan::count();
        $totalReservations = Reservation::count();
        $totalCategories = Category::count();

        $activeReservations = Reservation::where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->count();

        $upcomingThisWeek = Reservation::whereBetween('start_date', [$today, $weekFromNow])
            ->orderBy('start_date')
            ->with('dress')
            ->get();

        // Të ardhurat totale: shuma e çmimit të qirasë të fustanit për çdo rezervim.
        $totalRevenue = Reservation::join('fustans', 'reservations.fustan_id', '=', 'fustans.id')
            ->sum('fustans.cmimi_qirase');

        // Fustani më i rezervuari.
        $mostReserved = Reservation::selectRaw('fustan_id, COUNT(*) as total')
            ->groupBy('fustan_id')
            ->orderByDesc('total')
            ->with('dress')
            ->first();

        // Rezervimet për 6 muajt e fundit, për grafikun.
        $reservationsPerMonth = [];
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = Carbon::today()->subMonths($i)->startOfMonth();
            $monthEnd = Carbon::today()->subMonths($i)->endOfMonth();

            $count = Reservation::whereBetween('start_date', [
                $monthStart->toDateString(),
                $monthEnd->toDateString(),
            ])->count();

            $reservationsPerMonth[] = [
                'label' => $monthStart->translatedFormat('M Y'),
                'count' => $count,
            ];
        }

        return response()->json([
            'total_fustane' => $totalFustane,
            'total_reservations' => $totalReservations,
            'total_categories' => $totalCategories,
            'active_reservations' => $activeReservations,
            'total_revenue' => round($totalRevenue, 2),
            'most_reserved' => $mostReserved ? [
                'dress' => $mostReserved->dress,
                'total_reservations' => $mostReserved->total,
            ] : null,
            'upcoming_this_week' => $upcomingThisWeek,
            'reservations_per_month' => $reservationsPerMonth,
        ]);
    }
}