<?php

namespace App\Http\Requests\Api;

use App\Models\Room;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'check_in' => $this->input('check_in', $this->input('check_in_date')),
            'check_out' => $this->input('check_out', $this->input('check_out_date')),
            'special_requests' => $this->input('special_requests', $this->input('specialRequests')),
            'promotion_code' => $this->input('promotion_code', $this->input('promotionCode')),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'check_in' => ['required', 'date', 'after:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'number_of_guests' => [
                'required',
                'integer',
                'min:1',
                function ($attribute, $value, $fail) {
                    $room = Room::with('roomType')->find($this->input('room_id'));
                    if ($room && $room->roomType && $value > $room->roomType->capacity) {
                        $fail('The number of guests exceeds the room capacity of '.$room->roomType->capacity.'.');
                    }
                },
            ],
            'promotion_code' => ['nullable', 'string', 'exists:promotions,code'],
            'special_requests' => ['nullable', 'string'],
        ];
    }
}
