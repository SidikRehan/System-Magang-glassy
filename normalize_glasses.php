<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach(\App\Models\SheetGlass::all() as $g) {
    $g->name = preg_replace('/(\d+)\s*mm/i', '$1 mm', $g->name);
    $g->save();
}

foreach(\App\Models\ScrapGlass::all() as $s) {
    $s->glass_type = preg_replace('/(\d+)\s*mm/i', '$1 mm', $s->glass_type);
    $s->save();
}

echo "Done\n";
