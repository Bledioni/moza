<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredencialet e dhëna janë të gabuara.'],
            ]);
        }

        // Vetëm admin mund të hyjë në panel
        if ($user->role !== 'admin') {
            throw ValidationException::withMessages([
                'email' => ['Nuk keni qasje në panelin e administratës.'],
            ]);
        }

        $token = $user->createToken('staff-panel')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'U dolët me sukses.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}