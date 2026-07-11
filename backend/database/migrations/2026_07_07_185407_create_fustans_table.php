<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fustans', function (Blueprint $table) {
            $table->id();
            $table->string('emri');
            $table->string('madhesia');
            $table->string('ngjyra');
            $table->string('kategoria');
            $table->decimal('cmimi_qirase', 8, 2);
            $table->integer('sasia')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fustans');
    }
};