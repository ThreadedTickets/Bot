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
  },
  {
    timestamps: false,
  }
);

export const TagSchema = mongoose.model("Tags", schema);
