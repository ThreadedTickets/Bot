import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    server: {
      type: String,
      required: true,
    },
    validUntil: {
      type: Date,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const WhitelabelSchema = mongoose.model("Whitelabels", schema);
