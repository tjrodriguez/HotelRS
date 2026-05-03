<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tables = DB::connection('sqlite')->select("SELECT name FROM sqlite_master WHERE type='table'");
echo "SQLite tables:\n";
foreach ($tables as $table) {
    $count = DB::connection('sqlite')->table($table->name)->count();
    echo "  {$table->name}: {$count} rows\n";
}
