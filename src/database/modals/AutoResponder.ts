import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    server: {
      type: String,
      required: true,
      ref: "Guilds",
    },
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    matcherType: {
      type: String,
      required: true,
      enum: ["exact", "includes", "starts", "ends", "regex"],
    },
    matcherScope: {
      type: Object,
      required: true,
      default: {
        clean: Boolean,
        normalized: Boolean,
      },
    },
    matcher: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

export const AutoResponderSchema = mongoose.model("AutoResponders", schema);
