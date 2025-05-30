import mongoose from "mongoose";
import { groupSchema } from "./Guild";

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

    existingGroup: {
      type: groupSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const GroupCreatorSchema = mongoose.model("Group Creators", schema);
