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

    existingTrigger: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const TicketTriggerCreatorSchema = mongoose.model(
  "Ticket Trigger Creators",
  schema
);
