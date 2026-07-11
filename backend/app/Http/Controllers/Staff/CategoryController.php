<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::orderBy('emri')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'emri' => 'required|string|max:100|unique:categories,emri',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        return $category;
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'emri' => 'sometimes|required|string|max:100|unique:categories,emri,' . $category->id,
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Kategoria u fshi me sukses.']);
    }
}