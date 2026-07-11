<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Fustan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class FustanController extends Controller
{
    public function index()
    {
        return Fustan::with('category')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'emri' => 'required|string|max:255',
            'madhesia' => 'required|string|max:50',
            'ngjyra' => 'required|string|max:100',
            'kategoria_id' => 'required|exists:categories,id',
            'cmimi_qirase' => 'required|numeric|min:0',
            'sasia' => 'required|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('fustane', 'public');
        }

        $fustan = Fustan::create($validated);

        return response()->json($fustan->load('category'), 201);
    }

    public function show(string $fustan)
{
    return Fustan::with(['category', 'reservations' => function ($query) {
        $query->orderByDesc('start_date');
    }])->findOrFail($fustan);
}

    public function update(Request $request, Fustan $fustan)
    {
        $validated = $request->validate([
            'emri' => 'sometimes|required|string|max:255',
            'madhesia' => 'sometimes|required|string|max:50',
            'ngjyra' => 'sometimes|required|string|max:100',
            'kategoria_id' => 'sometimes|required|exists:categories,id',
            'cmimi_qirase' => 'sometimes|required|numeric|min:0',
            'sasia' => 'sometimes|required|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($request->hasFile('foto')) {
            if ($fustan->foto) {
                Storage::disk('public')->delete($fustan->foto);
            }
            $validated['foto'] = $request->file('foto')->store('fustane', 'public');
        }

        $fustan->update($validated);

        return response()->json($fustan->load('category'));
    }

    public function destroy(Fustan $fustan)
    {
        if ($fustan->reservations()->exists()) {
            return response()->json([
                'message' => 'Ky fustan ka rezervime dhe nuk mund të fshihet.',
            ], 422);
        }

        if ($fustan->foto) {
            Storage::disk('public')->delete($fustan->foto);
        }

        $fustan->delete();

        return response()->json(['message' => 'Fustani u fshi me sukses.']);
    }

    /**
     * Kthen kodin QR si SVG për një fustan të caktuar.
     */
    public function qrCode(Fustan $fustan)
    {
        $svg = QrCode::size(240)->generate($fustan->code);

        return response($svg)->header('Content-Type', 'image/svg+xml');
    }

    /**
     * Kërkon një fustan sipas kodit (p.sh. F-001), për kërkim manual ose skanim.
     */
    public function findByCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $fustan = Fustan::with('category')
            ->where('code', $validated['code'])
            ->first();

        if (!$fustan) {
            return response()->json(['message' => 'Nuk u gjet asnjë fustan me këtë kod.'], 404);
        }

        return response()->json($fustan);
    }
}