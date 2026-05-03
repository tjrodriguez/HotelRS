<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Fix sqlite database path explicitly
config(['database.connections.sqlite.database' => database_path('database.sqlite')]);
DB::purge('sqlite');
DB::reconnect('sqlite');

$tables = DB::connection('sqlite')->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
foreach ($tables as $table) {
    $count = DB::connection('sqlite')->table($table->name)->count();
    echo "{$table->name}: {$count}\n";
}
