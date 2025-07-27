import mongoose from "mongoose";

const response = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    default: "None",
  },
});

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    server: {
      type: String,
      required: true,
      ref: "Guilds",
    },
    trigger: {
      type: String,
      required: true,
      ref: "Ticket Triggers",
    },
    status: {
      type: String,
      default: "Open",
      enum: ["Open", "Closed", "Locked"],
    },
    isRaised: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: String,
      required: true,
    },
    groups: {
      type: [String],
      default: [],
    },
    channel: {
      type: String,
      required: true,
    },
    allowAutoResponders: {
      type: Boolean,
      default: true,
    },
    closeChannel: {
      type: String,
      default: null,
    },
    categoriesAvailableToMoveTicketsTo: {
      type: [String],
      default: [],
    },
    takeTranscripts: {
      type: Boolean,
      default: true,
    },
    closeOnLeave: {
      type: Boolean,
      default: true,
    },
    responses: {
      type: [response],
      default: [],
    },

    addRolesOnOpen: { type: [String], default: [] },
    addRolesOnClose: { type: [String], default: [] },
    removeRolesOnOpen: { type: [String], default: [] },
    removeRolesOnClose: { type: [String], default: [] },

    allowRaising: { type: Boolean, default: true },
    allowReopening: { type: Boolean, default: true },
    syncChannelPermissionsWhenMoved: { type: Boolean, default: false },

    dmOnClose: { type: String, default: null },
    createdAt: { type: Date, default: null, required: true },
    deletedAt: { type: Date, default: null },
    closeReason: { type: String, default: null },
  },
  {
    timestamps: false,
  }
);

export const TicketSchema = mongoose.model("Tickets", schema);
