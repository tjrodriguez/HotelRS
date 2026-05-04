<?php

namespace App\Enums;

enum RoomStatus: string
{
    case Available = 'available';
    case Occupied = 'occupied';
    case Maintenance = 'maintenance';
    case Cleaning = 'cleaning';
    case OutOfOrder = 'out_of_order';
}
