<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fustans', function (Blueprint $table) {
            $table->dropColumn('kategoria');
        });
    }

    public function down(): void
    {
        Schema::table('fustans', function (Blueprint $table) {
            $table->string('kategoria')->nullable();
        });
    }
};