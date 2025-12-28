import React from "react";
import "../styles/DeliveryTimeSlot.css";

export interface TimeSlot {
  id: string;
  label: string;
  time: string;
  available: boolean;
}

interface DeliveryTimeSlotProps {
  selectedDate: string;
  selectedSlot?: string;
  onSelect: (slotId: string) => void;
  disabled?: boolean;
}

const DeliveryTimeSlot: React.FC<DeliveryTimeSlotProps> = ({
  selectedDate,
  selectedSlot,
  onSelect,
  disabled = false,
}) => {
  // Generate time slots based on selected date
  const getTimeSlots = (): TimeSlot[] => {
    const today = new Date();
    const selected = new Date(selectedDate);
    const isToday = selected.toDateString() === today.toDateString();
    const isTomorrow = selected.toDateString() === new Date(today.getTime() + 86400000).toDateString();
    const currentHour = today.getHours();

    const slots: TimeSlot[] = [];

    if (isToday && currentHour < 14) {
      // Same-day delivery available if before 14:00
      slots.push({
        id: "morning",
        label: "Pagi",
        time: "09:00 - 12:00",
        available: true,
      });
      slots.push({
        id: "afternoon",
        label: "Siang",
        time: "12:00 - 15:00",
        available: true,
      });
      slots.push({
        id: "evening",
        label: "Sore",
        time: "15:00 - 18:00",
        available: currentHour < 12,
      });
    } else if (isTomorrow || !isToday) {
      // Next day or later - all slots available
      slots.push({
        id: "morning",
        label: "Pagi",
        time: "09:00 - 12:00",
        available: true,
      });
      slots.push({
        id: "afternoon",
        label: "Siang",
        time: "12:00 - 15:00",
        available: true,
      });
      slots.push({
        id: "evening",
        label: "Sore",
        time: "15:00 - 18:00",
        available: true,
      });
    }

    return slots;
  };

  const slots = getTimeSlots();

  if (slots.length === 0) {
    return (
      <div className="deliveryTimeSlot">
        <p className="deliveryTimeSlot__unavailable">
          Same-day delivery tidak tersedia untuk tanggal ini. Pilih tanggal lain atau pesan sebelum 14:00.
        </p>
      </div>
    );
  }

  return (
    <div className="deliveryTimeSlot">
      <label className="deliveryTimeSlot__label">Pilih Waktu Pengiriman (Opsional)</label>
      <div className="deliveryTimeSlot__grid">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className={`deliveryTimeSlot__option ${selectedSlot === slot.id ? "deliveryTimeSlot__option--selected" : ""} ${!slot.available ? "deliveryTimeSlot__option--unavailable" : ""}`}
            onClick={() => slot.available && !disabled && onSelect(slot.id)}
            disabled={!slot.available || disabled}
            aria-label={`Pilih waktu ${slot.label} (${slot.time})`}
          >
            <div className="deliveryTimeSlot__icon">
              {slot.id === "morning" && "🌅"}
              {slot.id === "afternoon" && "☀️"}
              {slot.id === "evening" && "🌆"}
            </div>
            <div className="deliveryTimeSlot__content">
              <span className="deliveryTimeSlot__labelText">{slot.label}</span>
              <span className="deliveryTimeSlot__time">{slot.time}</span>
            </div>
            {selectedSlot === slot.id && (
              <div className="deliveryTimeSlot__check">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <p className="deliveryTimeSlot__hint">
        Pilih waktu pengiriman yang diinginkan. Jika tidak dipilih, kami akan menghubungi Anda untuk konfirmasi.
      </p>
    </div>
  );
};

export default DeliveryTimeSlot;

