import { useState, useRef, useEffect } from "react";
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

// All slots defined with startHour (24h) for clock comparison
const ALL_SLOTS = [
  { time: "9:00 – 11:00 AM", startHour: 9, type: "express", label: "Express" },
  { time: "11:00 AM – 1:00 PM", startHour: 11, type: "free", label: "Free" },
  { time: "1:00 – 3:00 PM", startHour: 13, type: "free", label: "Free" },
  { time: "3:00 – 5:00 PM", startHour: 15, type: "free", label: "Free" },
  { time: "5:00 – 7:00 PM", startHour: 17, type: "express", label: "Express" },
  { time: "7:00 – 9:00 PM", startHour: 19, type: "free", label: "Free" },
];

const FUTURE_SLOTS = ALL_SLOTS.map((s) => ({ ...s }));

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

// Returns today's slots, marking past ones as "passed" (with 1hr lead-time buffer)
function getTodaySlots(now) {
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return ALL_SLOTS.map((slot) => {
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

// ─── Styles ────────────────────────────────────────────────────────────────

// ─── Sub-components ────────────────────────────────────────────────────────

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

// ─── Main Component ────────────────────────────────────────────────────────

export default function DeliverySlots({ onConfirm }) {
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const scrollRef = useRef(null);

  // Tick every minute — slots auto-update as time passes
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const dates = generateDates(7);
  const slots = selectedDate === 0 ? getTodaySlots(now) : FUTURE_SLOTS;

  // Auto-deselect if the selected slot becomes passed after a tick
  useEffect(() => {
    if (selectedDate === 0 && selectedSlot !== null) {
      const s = slots[selectedSlot];
      if (s && (s.type === "passed" || s.type === "full")) {
        setSelectedSlot(null);
      }
    }
  }, [now, selectedDate, selectedSlot, slots]);

  const d = dates[selectedDate].date;

  function handleDateSelect(i) {
    setSelectedDate(i);
    setSelectedSlot(null);
  }

  function handleConfirm() {
    if (selectedSlot === null) return;
    const slot = slots[selectedSlot];
    const info = {
      date: d,
      dateLabel: `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`,
      time: slot.time,
      type: slot.type,
    };
    if (onConfirm) onConfirm(info);
    else alert(`Delivery confirmed!\n${info.dateLabel} · ${info.time}`);
  }

  const confirmLabel =
    selectedSlot !== null
      ? `Confirm — ${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${slots[selectedSlot].time}`
      : "Choose a slot to continue";

  const availableToday =
    selectedDate === 0
      ? slots.filter((s) => s.type !== "passed" && s.type !== "full").length
      : null;

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .clock-dot { animation: blink 1.8s ease-in-out infinite; }
      `}</style>

      <div>
        <p className="subheading">Select a date and time that works for you</p>

        {/* Live clock badge */}
        <div className="live-clock">
          <div className="clock-badge">
            <span className="clock-dot" />
            Live · {formatTime(now)}
          </div>

          <div className="scroll-hint">↔ Swipe to see more</div>
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
            {DAYS[d.getDay()]}, {MONTHS[d.getMonth()]} {d.getDate()} — Slots
          </span>
          {selectedDate === 0 && availableToday !== null && (
            <span className="today-note">{availableToday} available now</span>
          )}
        </div>

        <div className="slots-grid">
          {slots.map((slot, i) => (
            <SlotCard
              key={i}
              slot={slot}
              active={selectedSlot === i}
              onClick={() => setSelectedSlot(i)}
            />
          ))}
        </div>

        <button
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={selectedSlot === null}
        >
          {confirmLabel}
        </button>
      </div>
    </>
  );
}
