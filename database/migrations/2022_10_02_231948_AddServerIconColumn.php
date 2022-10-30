<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddServerIconColumn extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->text('icon')->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('servers', function (Blueprint $table) {
            $table->dropColumn('icon');
        });
    }
}
