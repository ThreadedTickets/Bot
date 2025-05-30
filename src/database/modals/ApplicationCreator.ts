import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: null,
    },

    existingApplication: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ApplicationCreatorSchema = mongoose.model(
  "Application Creators",
  schema
);
