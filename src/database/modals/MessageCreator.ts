import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },

    metadata: {
      type: Object,
      default: null,
    },

    existingMessage: {
      type: {
        _id: {
          type: String,
          default: null,
        },
        content: {
          type: String,
          default: null,
        },
        embeds: {
          type: Array,
          default: [],
        },
        components: {
          type: Array,
          default: [],
        },
        attachments: {
          type: Array,
          default: [],
        },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const MessageCreatorSchema = mongoose.model("Message Creators", schema);
