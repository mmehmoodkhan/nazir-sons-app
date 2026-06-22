import mongoose from "mongoose";

const deliverySlotItemSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: {
      type: String,
      enum: ["free", "express"],
      default: "free",
    },
    label: { type: String, default: "Free" },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

const deliverySlotSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    slots: { type: [deliverySlotItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("DeliverySlot", deliverySlotSchema);
