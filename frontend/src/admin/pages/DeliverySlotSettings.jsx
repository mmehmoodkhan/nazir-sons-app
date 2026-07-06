import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./DeliverySlotSettings.css";

const emptySlot = {
  startTime: "09:00",
  endTime: "11:00",
  type: "free",
  isActive: true,
};

function DeliverySlotSettings() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSlots = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/delivery-slots/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load slots.");
      setSlots(data.slots || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    async function loadSlots() {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch("/api/delivery-slots/admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load slots.");
        if (!ignore) setSlots(data.slots || []);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSlots();
    return () => {
      ignore = true;
    };
  }, []);

  const updateSlot = (index, field, value) => {
    setSlots((current) =>
      current.map((slot, i) =>
        i === index
          ? {
              ...slot,
              [field]: field === "isActive" ? Boolean(value) : value,
            }
          : slot,
      ),
    );
  };

  const addSlot = () => {
    setSlots((current) => [...current, { ...emptySlot }]);
  };

  const removeSlot = (index) => {
    setSlots((current) => current.filter((_, i) => i !== index));
  };

  const saveSlots = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/delivery-slots/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slots }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to save slots.");

      setSlots(data.slots || []);
      setMessage("Delivery slots updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="delivery-settings-wrapper">
      <div className="sidebar_hide">
        <Sidebar />
      </div>
      <div className="admin_outer">
        <div className="db_topbar">
          <Navbar title="Delivery Slots" />
        </div>

        <section className="delivery-settings-main">
          <div className="delivery-settings-header">
            <div>
              <h2>Delivery slot times</h2>
              <p>Set the time windows customers can choose during checkout.</p>
            </div>
            <button type="button" onClick={addSlot}>
              Add Slot
            </button>
          </div>

          {loading ? (
            <p className="delivery-settings-state">Loading slots...</p>
          ) : (
            <form onSubmit={saveSlots} className="delivery-settings-form">
              {slots.length === 0 ? (
                <p className="delivery-settings-state">No slots added yet.</p>
              ) : (
                <div className="delivery-slot-list">
                  {slots.map((slot, index) => (
                    <div className="delivery-slot-row" key={slot._id || index}>
                      <label>
                        <span>Start</span>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(event) =>
                            updateSlot(index, "startTime", event.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        <span>End</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(event) =>
                            updateSlot(index, "endTime", event.target.value)
                          }
                          required
                        />
                      </label>

                      <label>
                        <span>Type</span>
                        <select
                          value={slot.type}
                          onChange={(event) =>
                            updateSlot(index, "type", event.target.value)
                          }
                        >
                          <option value="free">Free</option>
                          <option value="express">Express</option>
                        </select>
                      </label>

                      <label className="delivery-slot-toggle">
                        <input
                          type="checkbox"
                          checked={slot.isActive !== false}
                          onChange={(event) =>
                            updateSlot(index, "isActive", event.target.checked)
                          }
                        />
                        <span>Active</span>
                      </label>

                      <button
                        type="button"
                        className="delivery-slot-remove"
                        onClick={() => removeSlot(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="delivery-settings-error">{error}</p>}
              {message && <p className="delivery-settings-success">{message}</p>}

              <div className="delivery-settings-actions">
                <button type="button" onClick={fetchSlots} disabled={saving}>
                  Refresh
                </button>
                <button type="submit" disabled={saving || slots.length === 0}>
                  {saving ? "Saving..." : "Save Slots"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

export default DeliverySlotSettings;
