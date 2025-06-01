import mongoose from "mongoose";

const response = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  // Im gonna say that knowing the server shouldn't matter in this case, we should be able to get it from the application
  application: {
    type: String,
    ref: "Application Triggers",
    required: true,
  },

  // This will be the owner of the attempt
  owner: {
    type: String,
    required: true,
  },

  messageLink: {
    type: String,
    required: false,
    default: null,
  },

  createdAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "Accepted", "Rejected"],
  },
  // This is when a status other than pending is set, used for cooldowns
  closedAt: {
    type: Date,
    required: false,
    default: null,
  },

  responses: {
    type: [response],
    required: true,
  },
});

export const CompletedApplicationSchema = mongoose.model(
  "Completed Applications",
  schema
);
