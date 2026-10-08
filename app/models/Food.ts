import mongoose, { Schema } from "mongoose";

const foodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // The kitchen cooks to order, so a dish is simply on or off today —
    // there is no inventory count to draw down.
    available: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;