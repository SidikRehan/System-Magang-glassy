<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with 8 Role Accounts.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            [
                'name' => 'Admin Toko Utama',
                'email' => 'toko@sypglass.co.id',
                'role' => 'admin_toko',
                'password' => $password,
            ],
            [
                'name' => 'Admin Gudang Manufaktur',
                'email' => 'gudang@sypglass.co.id',
                'role' => 'admin_gudang',
                'password' => $password,
            ],
            [
                'name' => 'Staff Divisi HT (Potong/Bor)',
                'email' => 'ht@sypglass.co.id',
                'role' => 'divisi_ht',
                'password' => $password,
            ],
            [
                'name' => 'Staff Divisi GM (Gosok Halus)',
                'email' => 'gm@sypglass.co.id',
                'role' => 'divisi_gm',
                'password' => $password,
            ],
            [
                'name' => 'Staff Divisi BV (Bevel)',
                'email' => 'bv@sypglass.co.id',
                'role' => 'divisi_bv',
                'password' => $password,
            ],
            [
                'name' => 'Staff Divisi Etsa (Blur)',
                'email' => 'etsa@sypglass.co.id',
                'role' => 'divisi_etsa',
                'password' => $password,
            ],
            [
                'name' => 'Pak Budi (Supir Driver DC)',
                'email' => 'driver@sypglass.co.id',
                'role' => 'driver',
                'password' => $password,
            ],
            [
                'name' => 'Owner & Tim Akuntan',
                'email' => 'owner@sypglass.co.id',
                'role' => 'owner',
                'password' => $password,
            ],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                $u
            );
        }

        $this->call([
            GlassSystemSeeder::class,
        ]);
    }
}
