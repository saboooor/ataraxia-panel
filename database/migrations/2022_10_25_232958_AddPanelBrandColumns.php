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
        if (!Schema::hasColumn('settings', 'settings::app:icon')) {
            DB::table('settings')->insert(
                [
                'key' => 'settings::app:icon',
                ]
            );
        }
        if (!Schema::hasColumn('settings', 'settings::app:logo')) {
            DB::table('settings')->insert(
                [
                'key' => 'settings::app:logo',
                ]
            );
        }
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
