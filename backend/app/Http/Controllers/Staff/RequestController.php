<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RequestController extends Controller
{
    /**
     * Lista e kërkesave, më të rejat së pari. Opsionalisht filtrohet sipas statusit.
     */
    public function index(Request $request)
    {
        $query = ReservationRequest::with('dress')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        return $query->get();
    }

    /**
     * Aprovon kërkesën: kontrollon konfliktet dhe krijon rezervimin real.
     */
    public function approve(string $reservationRequest)
    {
        $req = ReservationRequest::findOrFail($reservationRequest);

        if ($req->status !== 'pending') {
            return response()->json([
                'message' => 'Kjo kërkesë është trajtuar tashmë.',
            ], 422);
        }

        $conflict = Reservation::where('fustan_id', $req->fustan_id)
            ->where('start_date', '<=', $req->end_date)
            ->where('end_date', '>=', $req->start_date)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'start_date' => ['Ky fustan është tashmë i rezervuar në këto data. Nuk mund ta aprovosh këtë kërkesë.'],
            ]);
        }

        $reservation = Reservation::create([
            'fustan_id' => $req->fustan_id,
            'client_name' => $req->client_name,
            'client_phone' => $req->client_phone,
            'start_date' => $req->start_date,
            'end_date' => $req->end_date,
        ]);

        $req->status = 'approved';
        $req->save();

        return response()->json([
            'message' => 'Kërkesa u aprovua dhe rezervimi u krijua me sukses.',
            'reservation' => $reservation->load('dress'),
        ]);
    }

    /**
     * Refuzon kërkesën, pa krijuar asnjë rezervim.
     */
    public function reject(string $reservationRequest)
    {
        $req = ReservationRequest::findOrFail($reservationRequest);

        if ($req->status !== 'pending') {
            return response()->json([
                'message' => 'Kjo kërkesë është trajtuar tashmë.',
            ], 422);
        }

        $req->status = 'rejected';
        $req->save();

        return response()->json(['message' => 'Kërkesa u refuzua.']);
    }
}