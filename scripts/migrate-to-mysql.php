<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

// Fix sqlite database path explicitly since .env DB_DATABASE is set for MySQL
config(['database.connections.sqlite.database' => database_path('database.sqlite')]);
DB::purge('sqlite');
DB::reconnect('sqlite');

// MySQL connection
$mysql = DB::connection('mysql');

// Disable foreign key checks on MySQL
$mysql->statement('SET FOREIGN_KEY_CHECKS = 0');

// Tables in dependency order (migrations skipped — managed by Laravel on MySQL)
$tables = [
    'users',
    'password_reset_tokens',
    'room_types',
    'rooms',
    'promotions',
    'reservations',
    'payments',
    'activity_logs',
    'personal_access_tokens',
    'sessions',
    'cache',
    'cache_locks',
    'jobs',
    'job_batches',
    'failed_jobs',
];

foreach ($tables as $table) {
    try {
        $sqliteExists = DB::connection('sqlite')->select("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [$table]);
        if (empty($sqliteExists)) {
            echo "Table: {$table} (not found in SQLite — skipping)\n";
            continue;
        }

        $sqliteCount = DB::connection('sqlite')->table($table)->count();
        echo "Table: {$table} ({$sqliteCount} rows in SQLite)\n";

        if ($sqliteCount === 0) {
            continue;
        }

        // Truncate MySQL table
        $mysql->table($table)->delete();
        $mysql->statement("ALTER TABLE {$table} AUTO_INCREMENT = 1");

        // Get columns
        $columns = DB::connection('sqlite')->getSchemaBuilder()->getColumns($table);
        $columnNames = array_map(fn ($c) => $c['name'], $columns);

        // Determine ordering column
        $orderCol = in_array('id', $columnNames) ? 'id' : $columnNames[0];

        // Copy in chunks to avoid memory issues
        DB::connection('sqlite')->table($table)->orderBy($orderCol)->chunk(500, function ($rows) use ($mysql, $table, $columnNames) {
            $insertData = [];
            foreach ($rows as $row) {
                $data = [];
                foreach ($columnNames as $col) {
                    $value = $row->{$col} ?? null;
                    $data[$col] = $value;
                }
                $insertData[] = $data;
            }
            if (count($insertData) > 0) {
                $mysql->table($table)->insert($insertData);
            }
        });

        $mysqlCount = $mysql->table($table)->count();
        echo "  -> {$mysqlCount} rows in MySQL\n";
    } catch (Throwable $e) {
        echo "  ERROR on {$table}: " . $e->getMessage() . "\n";
        throw $e;
    }
}

// Re-enable foreign key checks
$mysql->statement('SET FOREIGN_KEY_CHECKS = 1');

echo "Migration complete.\n";
