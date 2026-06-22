import mongoose from "mongoose";

const deliverySettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },
    shippingCharge: { type: Number, default: 30, min: 0 },
    freeShippingThreshold: { type: Number, default: 1000, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("DeliverySetting", deliverySettingSchema);
