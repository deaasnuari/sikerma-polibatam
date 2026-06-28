<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'institution_name'  => fake()->company(),
            'username'          => fake()->unique()->regexify('[a-zA-Z][a-zA-Z0-9_]{7,14}'),
            'email'             => fake()->unique()->safeEmail(),
            'phone'             => '08' . fake()->numerify('#########'),
            'position'          => fake()->jobTitle(),
            'role'              => 'internal',
            'account_type'      => 'Industri',
            'approval_status'   => 'active',
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),
        ];
    }

    public function external(): static
    {
        return $this->state(fn () => ['role' => 'external']);
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function unverified(): static
    {
        return $this->state(fn () => ['email_verified_at' => null]);
    }
}
