<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Fustan;
use Illuminate\Http\Request;

class PublicFustanController extends Controller
{
    public function index(Request $request)
{
    $query = Fustan::with('category')->where('sasia', '>', 0);

    if ($request->filled('kategoria_id')) {
        $query->where('kategoria_id', $request->query('kategoria_id'));
    }

    if ($request->filled('madhesia')) {
        $query->where('madhesia', $request->query('madhesia'));
    }

    if ($request->filled('min_price')) {
        $query->where('cmimi_qirase', '>=', $request->query('min_price'));
    }

    if ($request->filled('max_price')) {
        $query->where('cmimi_qirase', '<=', $request->query('max_price'));
    }

    return $query->latest()->get()->map(fn (Fustan $f) => $this->transform($f));
}

    public function show(string $fustan)
    {
        $dress = Fustan::with('category')->findOrFail($fustan);

        return $this->transform($dress, withReservations: true);
    }

    private function transform(Fustan $fustan, bool $withReservations = false): array
    {
        $data = [
            'id' => $fustan->id,
            'code' => $fustan->code,
            'emri' => $fustan->emri,
            'madhesia' => $fustan->madhesia,
            'ngjyra' => $fustan->ngjyra,
            'kategoria' => $fustan->category?->emri,
            'cmimi_qirase' => $fustan->cmimi_qirase,
            'foto_url' => $fustan->foto_url,
        ];

        if ($withReservations) {
            $data['zene'] = $fustan->reservations()
                ->where('end_date', '>=', now()->toDateString())
                ->get(['start_date', 'end_date']);
        }

        return $data;
    }

    /**
 * Opsionet e disponueshme për filtrat (kategoritë dhe madhësitë ekzistuese).
 */
public function filterOptions()
{
    $categories = Category::orderBy('emri')->get(['id', 'emri']);

    $sizes = Fustan::where('sasia', '>', 0)
        ->distinct()
        ->orderBy('madhesia')
        ->pluck('madhesia');

    return response()->json([
        'categories' => $categories,
        'sizes' => $sizes,
    ]);
}
}