<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDatabaseHostAlias extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('database_hosts', function (Blueprint $table) {
            $table->string('host_alias')->nullable()->after('host');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('database_hosts', function (Blueprint $table) {
            $table->dropColumn('host_alias');
        });
    }
}
