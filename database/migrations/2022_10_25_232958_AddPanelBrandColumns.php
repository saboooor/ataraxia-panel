<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Migrations\Migration;

class AddPanelBrandColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('settings')->insertOrIgnore(
            [
            'key' => 'settings::app:icon',
            ]
        );
        DB::table('settings')->insertOrIgnore(
            [
            'key' => 'settings::app:logo',
            ]
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('settings')->where('key', 'settings::app:icon')->delete();
        DB::table('settings')->where('key', 'settings::app:logo')->delete();
    }
}
