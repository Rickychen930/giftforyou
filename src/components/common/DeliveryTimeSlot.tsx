/**
 * Delivery Time Slot Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/DeliveryTimeSlot.css";

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

interface DeliveryTimeSlotState {
  // No state needed, but keeping for consistency
}

/**
 * Delivery Time Slot Component
 * Class-based component for delivery time slot selection
 */
class DeliveryTimeSlot extends Component<DeliveryTimeSlotProps, DeliveryTimeSlotState> {
  private baseClass: string = "deliveryTimeSlot";

  private getTimeSlots(): TimeSlot[] {
    const { selectedDate } = this.props;
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
  }

  private handleSlotClick = (slot: TimeSlot): void => {
    const { disabled, onSelect } = this.props;
    if (slot.available && !disabled) {
      onSelect(slot.id);
    }
  };

  private renderSlot(slot: TimeSlot): React.ReactNode {
    const { selectedSlot, disabled = false } = this.props;
    const isSelected = selectedSlot === slot.id;

    return (
      <button
        key={slot.id}
        type="button"
        className={`${this.baseClass}__option ${
          isSelected ? `${this.baseClass}__option--selected` : ""
        } ${!slot.available ? `${this.baseClass}__option--unavailable` : ""}`}
        onClick={() => this.handleSlotClick(slot)}
        disabled={disabled || !slot.available}
        aria-label={`Pilih waktu ${slot.label} (${slot.time})`}
        aria-pressed={isSelected}
      >
        <span className={`${this.baseClass}__option-label`}>{slot.label}</span>
        <span className={`${this.baseClass}__option-time`}>{slot.time}</span>
      </button>
    );
  }

  render(): React.ReactNode {
    const slots = this.getTimeSlots();

    if (slots.length === 0) {
      return (
        <div className={this.baseClass}>
          <p className={`${this.baseClass}__unavailable`}>
            Same-day delivery tidak tersedia untuk tanggal ini. Pilih tanggal lain atau pesan sebelum 14:00.
          </p>
        </div>
      );
    }

    return (
      <div className={this.baseClass}>
        <label className={`${this.baseClass}__label`}>Pilih Waktu Pengiriman (Opsional)</label>
        <div className={`${this.baseClass}__grid`}>
          {slots.map((slot) => this.renderSlot(slot))}
        </div>
      </div>
    );
  }
}

export default DeliveryTimeSlot;

