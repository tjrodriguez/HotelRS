<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Reservation $reservation): bool
    {
        return $user->isAdmin() || $reservation->guest_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isGuest();
    }

    public function update(User $user, Reservation $reservation): bool
    {
        return $user->isAdmin();
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        return $user->isAdmin() || $reservation->guest_id === $user->id;
    }

    public function confirm(User $user, Reservation $reservation): bool
    {
        return $user->isAdmin();
    }

    public function decline(User $user, Reservation $reservation): bool
    {
        return $user->isAdmin();
    }
}
