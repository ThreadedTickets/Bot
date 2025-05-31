import { PermissionFlagsBits } from "discord.js";
import mongoose from "mongoose";
import Ajv from "ajv";
const ajv = new Ajv();

export const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  server: {
    type: String,
    ref: "Guilds",
    required: true,
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
});

const validPermissions = Object.keys(PermissionFlagsBits);

const TicketPermissionsSchema = new mongoose.Schema(
  {
    canClose: { type: Boolean, default: false },
    canCloseIfOwn: { type: Boolean, default: false },
    canForceOpen: { type: Boolean, default: false },
    canMove: { type: Boolean, default: false },
    canLock: { type: Boolean, default: false },
    canUnlock: { type: Boolean, default: false },
    canViewTranscripts: { type: Boolean, default: false },
    canViewLockedTranscripts: { type: Boolean, default: false },
    channelPermissions: {
      type: new mongoose.Schema(
        {
          allow: {
            type: [String],
            default: [],
            validate: {
              validator: (vals: string[]) =>
                vals.every((val) => validPermissions.includes(val)),
              message: (vals: string[]) =>
                `Invalid permissions in allow: ${vals
                  .filter((val) => !validPermissions.includes(val))
                  .join(", ")}`,
            },
          },
          deny: {
            type: [String],
            default: [],
            validate: {
              validator: (vals: string[]) =>
                vals.every((val) => validPermissions.includes(val)),
              message: (vals: string[]) =>
                `Invalid permissions in deny: ${vals
                  .filter((val) => !validPermissions.includes(val))
                  .join(", ")}`,
            },
          },
        },
        { _id: false }
      ),
      default: () => ({ allow: [], deny: [] }),
    },
  },
  { _id: false }
);

const MessagesPermissionsSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const TagsPermissionsSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const AutoRespondersPermissionsSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const ApplicationsPermissionsSchema = new mongoose.Schema(
  {
    manage: { type: Boolean, default: false },
    respond: { type: Boolean, default: false },
  },
  { _id: false }
);

const PanelsPermissionsSchema = new mongoose.Schema(
  {
    manage: { type: Boolean, default: false },
  },
  { _id: false }
);

const PermissionsSchema = new mongoose.Schema(
  {
    tickets: { type: TicketPermissionsSchema, default: () => ({}) },
    messages: { type: MessagesPermissionsSchema, default: () => ({}) },
    tags: { type: TagsPermissionsSchema, default: () => ({}) },
    autoResponders: {
      type: AutoRespondersPermissionsSchema,
      default: () => ({}),
    },
    applications: { type: ApplicationsPermissionsSchema, default: () => ({}) },
    panels: { type: PanelsPermissionsSchema, default: () => ({}) },
  },
  { _id: false }
);

export const groupSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  server: { type: String, ref: "Guilds", required: true },
  roles: { type: [String], default: [] },
  extraMembers: { type: [String], default: [] },
  permissions: { type: PermissionsSchema, default: () => ({}) },
});

const LogChannelSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    channel: { type: String, default: null },
    webhook: { type: String, default: null },
  },
  { _id: false }
);

const LoggingSchema = new mongoose.Schema(
  {
    general: { type: LogChannelSchema, default: () => ({}) },
    tickets: {
      type: {
        feedback: { type: LogChannelSchema, default: () => ({}) },
        open: { type: LogChannelSchema, default: () => ({}) },
        close: { type: LogChannelSchema, default: () => ({}) },
        lock: { type: LogChannelSchema, default: () => ({}) },
        unlock: { type: LogChannelSchema, default: () => ({}) },
        raise: { type: LogChannelSchema, default: () => ({}) },
        lower: { type: LogChannelSchema, default: () => ({}) },
        move: { type: LogChannelSchema, default: () => ({}) },
        transcripts: { type: LogChannelSchema, default: () => ({}) },
      },

      default: () => ({}),
    },
    applications: {
      type: {
        create: { type: LogChannelSchema, default: () => ({}) },
        approve: { type: LogChannelSchema, default: () => ({}) },
        reject: { type: LogChannelSchema, default: () => ({}) },
        delete: { type: LogChannelSchema, default: () => ({}) },
      },
      default: () => ({}),
    },
  },
  { _id: false }
);

const SettingsSchema = new mongoose.Schema(
  {
    logging: { type: LoggingSchema, default: () => ({}) },
    autoResponders: {
      extraAllowedChannels: { type: [String], default: [] },
    },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    preferredLanguage: {
      type: String,
      default: "en",
    },

    settings: { type: SettingsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

export const GuildSchema = mongoose.model("Guilds", schema);
export const GroupSchema = mongoose.model("Groups", groupSchema);
export const MessageSchema = mongoose.model("Messages", messageSchema);

const ajvGroupSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    roles: {
      type: "array",
      items: { type: "string" },
      default: [],
    },
    extraMembers: {
      type: "array",
      items: { type: "string" },
      default: [],
    },
    permissions: {
      type: "object",
      properties: {
        tickets: {
          type: "object",
          properties: {
            canClose: { type: "boolean", default: false },
            canCloseIfOwn: { type: "boolean", default: false },
            canForceOpen: { type: "boolean", default: false },
            canMove: { type: "boolean", default: false },
            canLock: { type: "boolean", default: false },
            canUnlock: { type: "boolean", default: false },
            canViewTranscripts: { type: "boolean", default: false },
            canViewLockedTranscripts: { type: "boolean", default: false },
            channelPermissions: {
              type: "object",
              properties: {
                allow: {
                  type: "array",
                  items: { type: "string", enum: validPermissions },
                  default: [],
                },
                deny: {
                  type: "array",
                  items: { type: "string", enum: validPermissions },
                  default: [],
                },
              },
              required: ["allow", "deny"],
              additionalProperties: false,
              default: {},
            },
          },
          required: [
            "canClose",
            "canCloseIfOwn",
            "canForceOpen",
            "canMove",
            "canLock",
            "canUnlock",
            "canViewTranscripts",
            "canViewLockedTranscripts",
            "channelPermissions",
          ],
          additionalProperties: false,
          default: {},
        },
        messages: {
          type: "object",
          properties: {
            create: { type: "boolean", default: false },
            edit: { type: "boolean", default: false },
            delete: { type: "boolean", default: false },
          },
          required: ["create", "edit", "delete"],
          additionalProperties: false,
          default: {},
        },
        tags: {
          type: "object",
          properties: {
            create: { type: "boolean", default: false },
            edit: { type: "boolean", default: false },
            delete: { type: "boolean", default: false },
          },
          required: ["create", "edit", "delete"],
          additionalProperties: false,
          default: {},
        },
        autoResponders: {
          type: "object",
          properties: {
            create: { type: "boolean", default: false },
            edit: { type: "boolean", default: false },
            delete: { type: "boolean", default: false },
          },
          required: ["create", "edit", "delete"],
          additionalProperties: false,
          default: {},
        },
        applications: {
          type: "object",
          properties: {
            manage: { type: "boolean", default: false },
            respond: { type: "boolean", default: false },
          },
          required: ["manage", "respond"],
          additionalProperties: false,
          default: {},
        },
        panels: {
          type: "object",
          properties: {
            manage: { type: "boolean", default: false },
          },
          required: ["manage"],
          additionalProperties: false,
          default: {},
        },
      },
      required: [
        "tickets",
        "messages",
        "tags",
        "autoResponders",
        "applications",
        "panels",
      ],
      additionalProperties: false,
      default: {},
    },
  },
  required: ["name"],
  additionalProperties: false,
};

export const GroupSchemaValidator = ajv.compile(ajvGroupSchema);
