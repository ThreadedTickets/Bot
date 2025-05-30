import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    context: {
      type: Object,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ErrorSchema = mongoose.model("Errors", schema);
