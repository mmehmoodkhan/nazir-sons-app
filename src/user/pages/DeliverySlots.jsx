import { useEffect, useMemo, useRef, useState } from "react";
import "./DeliverySlots.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FALLBACK_SLOTS = [
  { time: "9:00 AM - 11:00 AM", startHour: 9, type: "express", label: "Express" },
  { time: "11:00 AM - 1:00 PM", startHour: 11, type: "free", label: "Free" },
  { time: "1:00 PM - 3:00 PM", startHour: 13, type: "free", label: "Free" },
  { time: "3:00 PM - 5:00 PM", startHour: 15, type: "free", label: "Free" },
  { time: "5:00 PM - 7:00 PM", startHour: 17, type: "express", label: "Express" },
  { time: "7:00 PM - 9:00 PM", startHour: 19, type: "free", label: "Free" },
];

function getRelLabel(i) {
  if (i === 0) return "Today";
  if (i === 1) return "Tomorrow";
  return `${i} days`;
}

function generateDates(count = 7) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { date: d, rel: getRelLabel(i), index: i };
  });
}

function getTodaySlots(now, baseSlots) {
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return baseSlots.map((slot) => {
    const isPassed = slot.startHour <= currentHour + 1;
    return {
      ...slot,
      type: isPassed ? "passed" : slot.type,
      label: isPassed ? "Passed" : slot.label,
    };
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DateChip({ entry, active, onClick }) {
  const d = entry.date;
  return (
    <div
      className={`date-chip ${active ? "active" : ""}`}
      onClick={onClick}
      role="button"
      aria-pressed={active}
    >
      <span className={`chip-day ${active ? "active" : ""}`}>
        {DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()}
      </span>
      <span className={`chip-rel ${active ? "active" : ""}`}>{entry.rel}</span>
    </div>
  );
}

function SlotCard({ slot, active, onClick }) {
  const unavailable = slot.type === "full" || slot.type === "passed";
  return (
    <div
      className={`slot-card ${active ? "active" : ""} ${unavailable ? "unavailable" : ""}`}
      onClick={unavailable ? undefined : onClick}
      role={unavailable ? undefined : "button"}
      aria-pressed={active}
      aria-disabled={unavailable}
    >
      <span className={`slot-time ${active ? "active" : ""}`}>{slot.time}</span>
      <span className={`badge badge-${slot.type}`}>{slot.label}</span>
      {slot.type === "passed" && <div className="strikethrough" />}
    </div>
  );
}

export default function DeliverySlots({ onConfirm }) {
  const [now, setNow] = useState(new Date());
  const [baseSlots, setBaseSlots] = useState(FALLBACK_SLOTS);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotError, setSlotError] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchSlots() {
      setLoadingSlots(true);
      setSlotError("");

      try {
        const res = await fetch("/api/delivery-slots");
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Could not load slots.");
        if (!ignore && Array.isArray(data.slots) && data.slots.length > 0) {
          setBaseSlots(data.slots);
        }
      } catch {
        if (!ignore) setSlotError("Showing default slots until vendor slots load.");
      } finally {
        if (!ignore) setLoadingSlots(false);
      }
    }

    fetchSlots();
    return () => {
      ignore = true;
    };
  }, []);

  const dates = useMemo(() => generateDates(7), []);
  const slots = useMemo(
    () => (selectedDate === 0 ? getTodaySlots(now, baseSlots) : baseSlots),
    [baseSlots, now, selectedDate],
  );

  const d = dates[selectedDate].date;
  const selectedSlotData = selectedSlot !== null ? slots[selectedSlot] : null;
  const selectedSlotAvailable =
    selectedSlotData &&
    selectedSlotData.type !== "passed" &&
    selectedSlotData.type !== "full";

  function handleDateSelect(i) {
    setSelectedDate(i);
    setSelectedSlot(null);
  }

  function handleConfirm() {
    if (!selectedSlotAvailable) return;
    const slot = selectedSlotData;
    const info = {
      date: d,
      dateLabel: `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`,
      time: slot.time,
      type: slot.type,
    };
    if (onConfirm) onConfirm(info);
    else alert(`Delivery confirmed!\n${info.dateLabel} - ${info.time}`);
  }

  const confirmLabel =
    selectedSlotAvailable
      ? `Confirm - ${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${selectedSlotData.time}`
      : "Select a slot then click here to confirm";

  const availableToday =
    selectedDate === 0
      ? slots.filter((s) => s.type !== "passed" && s.type !== "full").length
      : null;

  return (
    <div>
      <p className="subheading">Select a date and time slot that works for you</p>

      <div className="live-clock">
        <div className="clock-badge">
          <span className="clock-dot" />
          Live - {formatTime(now)}
        </div>

        <div className="scroll-hint">Swipe to see more</div>
      </div>

      <div ref={scrollRef} className="date-row">
        {dates.map((entry) => (
          <DateChip
            key={entry.index}
            entry={entry}
            active={selectedDate === entry.index}
            onClick={() => handleDateSelect(entry.index)}
          />
        ))}
      </div>

      <div className="divider" />

      <div className="slots-header">
        <span className="slots-label">
          {DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()} - Slots
        </span>
        {selectedDate === 0 && availableToday !== null && (
          <span className="today-note">{availableToday} available now</span>
        )}
      </div>

      {slotError && <p className="slots-message">{slotError}</p>}
      {loadingSlots && <p className="slots-message">Loading vendor slots...</p>}

      <div className="slots-grid">
        {slots.map((slot, i) => (
          <SlotCard
            key={slot._id || `${slot.time}-${i}`}
            slot={slot}
            active={selectedSlot === i}
            onClick={() => setSelectedSlot(i)}
          />
        ))}
      </div>

      <button
        className="confirm-btn"
        onClick={handleConfirm}
        disabled={!selectedSlotAvailable}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
