<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fustans', function (Blueprint $table) {
            $table->foreignId('kategoria_id')
                ->nullable()
                ->after('kategoria')
                ->constrained('categories')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('fustane', function (Blueprint $table) {
            $table->dropConstrainedForeignId('kategoria_id');
        });
    }
};