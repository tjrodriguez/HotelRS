<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $wallet = $user->wallet ?? Wallet::create(['user_id' => $user->id, 'balance' => 0]);

        return response()->json(['balance' => $wallet->balance]);
    }

    public function topUp(Request $request)
    {
        $request->validate(['amount' => ['required', 'numeric', 'min:0.01']]);

        $user = $request->user();
        $wallet = $user->wallet ?? Wallet::create(['user_id' => $user->id, 'balance' => 0]);

        $wallet->balance = $wallet->balance + $request->input('amount');
        $wallet->save();

        return response()->json(['balance' => $wallet->balance]);
    }
}
