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
    _id: {
      type: Number,
      required: true,
    },
    fullId: {
      type: String,
      required: true,
    },
    url: {
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
