<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Fustan;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with('dress')->latest();

        if ($request->has('fustan_id')) {
            $query->where('fustan_id', $request->query('fustan_id'));
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fustan_id' => 'required|exists:fustans,id',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $this->assertNoOverlap($validated['fustan_id'], $validated['start_date'], $validated['end_date']);

        $reservation = Reservation::create($validated);

        return response()->json($reservation->load('dress'), 201);
    }

    public function show(string $reservation)
    {
        return Reservation::with('dress')->findOrFail($reservation);
    }

    public function update(Request $request, string $reservation)
    {
        $reservation = Reservation::findOrFail($reservation);

        $validated = $request->validate([
            'fustan_id' => 'sometimes|required|exists:fustans,id',
            'client_name' => 'sometimes|required|string|max:255',
            'client_phone' => 'sometimes|required|string|max:50',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
        ]);

        $fustanId = $validated['fustan_id'] ?? $reservation->fustan_id;
        $startDate = $validated['start_date'] ?? $reservation->start_date;
        $endDate = $validated['end_date'] ?? $reservation->end_date;

        $this->assertNoOverlap($fustanId, $startDate, $endDate, excludeReservationId: $reservation->id);

        $reservation->update($validated);

        return response()->json($reservation->load('dress'));
    }

    public function destroy(string $reservation)
    {
        $reservation = Reservation::findOrFail($reservation);
        $reservation->delete();

        return response()->json(['message' => 'Rezervimi u fshi me sukses.']);
    }

    /**
     * Kontrollon që fustani nuk është i rezervuar tashmë në ato data.
     */
    private function assertNoOverlap(int $fustanId, string $startDate, string $endDate, ?int $excludeReservationId = null): void
    {
        $overlapping = Reservation::where('fustan_id', $fustanId)
            ->where('start_date', '<=', $endDate)
            ->where('end_date', '>=', $startDate)
            ->when($excludeReservationId, fn ($query) => $query->where('id', '!=', $excludeReservationId))
            ->exists();

        if ($overlapping) {
            throw ValidationException::withMessages([
                'start_date' => ['Ky fustan është tashmë i rezervuar në këto data.'],
            ]);
        }
    }
}