<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Fustan;
use App\Models\ReservationRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReservationRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fustan_id' => 'required|exists:fustans,id',
            'client_name' => 'required|string|max:255',
            'client_phone' => 'required|string|max:50',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        // Kontrollo që fustani nuk ka tashmë një rezervim konfirmuar në ato data.
        $conflict = $validated['fustan_id']
            ? Fustan::findOrFail($validated['fustan_id'])
                ->reservations()
                ->where('start_date', '<=', $validated['end_date'])
                ->where('end_date', '>=', $validated['start_date'])
                ->exists()
            : false;

        if ($conflict) {
            throw ValidationException::withMessages([
                'start_date' => ['Ky fustan është tashmë i rezervuar në këto data.'],
            ]);
        }

        $requestRecord = ReservationRequest::create($validated + ['status' => 'pending']);

        return response()->json([
            'message' => 'Kërkesa juaj u dërgua me sukses. Do t\'ju kontaktojmë së shpejti.',
            'request' => $requestRecord,
        ], 201);
    }
    public function lookup(Request $request)
{
    $validated = $request->validate([
        'client_phone' => 'required|string',
    ]);

    return ReservationRequest::with('dress')
        ->where('client_phone', $validated['client_phone'])
        ->latest()
        ->get();
}
}