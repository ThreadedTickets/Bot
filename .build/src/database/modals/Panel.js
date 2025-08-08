"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationTriggerSchema = exports.TicketTriggerSchema = exports.TicketTriggerSchemaValidator = exports.ApplicationSchemaValidator = void 0;
const ajv_1 = __importDefault(require("ajv"));
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const ajv = new ajv_1.default();
const ApplicationQuestionSchema = new mongoose_1.default.Schema({
    question: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ["number", "text", "choice"],
    },
    message: {
        type: String,
        default: null,
    },
    // Generic minium thing, could be length, choices, value
    minimum: {
        type: Number,
        default: null,
    },
    maximum: {
        type: Number,
        default: null,
    },
    choices: {
        type: [String],
        default: null,
    },
}, { _id: false });
const applicationTriggerSchema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    server: {
        type: String,
        ref: "Guilds",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    questions: {
        type: [ApplicationQuestionSchema],
        default: [],
    },
    groups: {
        type: [String],
        default: [],
    },
    acceptedMessage: {
        type: String,
        ref: "Messages",
        required: false,
        default: null,
    },
    rejectedMessage: {
        type: String,
        ref: "Messages",
        required: false,
        default: null,
    },
    submissionMessage: {
        type: String,
        ref: "Messages",
        required: false,
        default: null,
    },
    confirmationMessage: {
        type: String,
        ref: "Messages",
        required: false,
        default: null,
    },
    cancelMessage: {
        type: String,
        ref: "Messages",
        required: false,
        default: null,
    },
    submissionsChannel: {
        type: String,
        default: null,
        required: true,
    },
    // Dates at which this application will open and close
    open: { type: Date, default: null },
    close: { type: Date, default: null },
    acceptingResponses: { type: Boolean, default: false },
    // The total number of people who can apply to this application
    applicationLimit: { type: Number, default: null },
    // The total number of attempts a user is allowed on an application (lifetime)
    // Deleting applications will completely wipe them from the db
    allowedAttempts: { type: Number, default: null },
    // Cooldown between getting a verdict and retaking the application
    applicationCooldown: { type: Number, default: 10 },
    // An action to perform when a user leaves the server with an open application
    actionOnUserLeave: {
        type: String,
        default: "nothing",
        enum: ["nothing", "delete", "approve", "reject"],
    },
    linkedTicketTrigger: {
        type: String,
        default: null,
    },
    sendCopyOfApplicationInTicket: {
        type: Boolean,
        default: true,
    },
    blacklistRoles: {
        type: [String],
        default: [],
    },
    addRolesOnAccept: {
        type: [String],
        default: [],
    },
    removeRolesOnAccept: {
        type: [String],
        default: [],
    },
    addRolesOnReject: {
        type: [String],
        default: [],
    },
    removeRolesOnReject: {
        type: [String],
        default: [],
    },
    addRolesWhenPending: {
        type: [String],
        default: [],
    },
    removeRolesWhenPending: {
        type: [String],
        default: [],
    },
    pingRoles: {
        type: [String],
        default: [],
    },
    // ALL these roles must be on the user to apply
    requiredRoles: {
        type: [String],
        default: [],
    },
});
const avjApplicationSchema = {
    type: "object",
    required: [
        "name",
        "questions",
        "groups",
        "acceptedMessage",
        "rejectedMessage",
        "submissionMessage",
        "confirmationMessage",
        "cancelMessage",
        "submissionsChannel",
        "open",
        "acceptingResponses",
        "close",
        "applicationLimit",
        "allowedAttempts",
        "applicationCooldown",
        "actionOnUserLeave",
        "linkedTicketTrigger",
        "sendCopyOfApplicationInTicket",
        "blacklistRoles",
        "addRolesOnAccept",
        "removeRolesOnAccept",
        "addRolesOnReject",
        "removeRolesOnReject",
        "addRolesWhenPending",
        "removeRolesWhenPending",
        "pingRoles",
        "requiredRoles",
    ],
    properties: {
        questions: {
            type: "array",
            minItems: 1,
            maxItems: 50,
            items: {
                type: "object",
                required: [
                    "question",
                    "type",
                    "message",
                    "minimum",
                    "maximum",
                    "choices",
                ],
                properties: {
                    question: { type: "string", maxLength: 500 },
                    type: { type: "string", enum: ["number", "text", "choice"] },
                    message: { type: ["string", "null"], default: null },
                    minimum: {
                        type: ["number", "null"],
                        default: null,
                    },
                    maximum: {
                        type: ["number", "null"],
                        default: null,
                    },
                    choices: {
                        type: ["array", "null"],
                        maxItems: 25,
                        minItems: 1,
                        items: { type: "string", maxLength: 100 },
                        default: null,
                    },
                },
                additionalProperties: false,
            },
        },
        groups: {
            type: "array",
            maxItems: 10,
            items: { type: "string" },
            default: [],
        },
        _id: { type: "string" },
        server: { type: "string" },
        __v: { type: "number" },
        acceptedMessage: { type: ["string", "null"], default: null },
        rejectedMessage: { type: ["string", "null"], default: null },
        submissionMessage: { type: ["string", "null"], default: null },
        confirmationMessage: { type: ["string", "null"], default: null },
        cancelMessage: { type: ["string", "null"], default: null },
        submissionsChannel: { type: "string" },
        name: { type: "string" },
        open: { type: ["string", "null"], default: null },
        close: { type: ["string", "null"], default: null },
        acceptingResponses: { type: "boolean", default: false },
        applicationLimit: { type: ["number", "null"], default: null, minimum: 0 },
        allowedAttempts: { type: ["number", "null"], default: null, minimum: 0 },
        applicationCooldown: { type: "number", default: 10, minimum: 0 },
        actionOnUserLeave: {
            type: "string",
            enum: ["nothing", "delete", "approve", "reject"],
            default: "nothing",
        },
        linkedTicketTrigger: { type: ["string", "null"], default: null },
        sendCopyOfApplicationInTicket: { type: "boolean", default: true },
        blacklistRoles: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        addRolesOnAccept: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        removeRolesOnAccept: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        addRolesOnReject: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        removeRolesOnReject: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        addRolesWhenPending: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        removeRolesWhenPending: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        pingRoles: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
        requiredRoles: {
            type: "array",
            items: { type: "string" },
            default: [],
            maxItems: 15,
        },
    },
    additionalProperties: false,
};
exports.ApplicationSchemaValidator = ajv.compile(avjApplicationSchema);
const TicketFormSchema = new mongoose_1.default.Schema({
    question: {
        type: String,
        required: true,
    },
    placeholder: {
        type: String,
        default: null,
    },
    defaultValue: {
        type: String,
        default: null,
    },
    multilineResponse: {
        type: Boolean,
        default: false,
    },
    requiredResponse: {
        type: Boolean,
        default: true,
    },
    minimumCharactersRequired: { type: Number, default: null },
    maximumCharactersRequired: { type: Number, default: null },
}, { _id: false });
const ticketTriggerSchema = new mongoose_1.default.Schema({
    _id: { type: String, required: true },
    server: {
        type: String,
        ref: "Guilds",
        required: true,
    },
    label: { type: String, default: "New Ticket" },
    description: { type: String, default: null },
    emoji: { type: String, default: null },
    colour: {
        type: Number,
        default: 1,
        enum: [
            discord_js_1.ButtonStyle.Danger,
            discord_js_1.ButtonStyle.Primary,
            discord_js_1.ButtonStyle.Secondary,
            discord_js_1.ButtonStyle.Success,
        ],
    },
    message: {
        type: String,
        ref: "Messages",
        default: null,
    },
    form: {
        type: [TicketFormSchema],
        default: [],
    },
    // These are treated as the staff roles/user roles. They should be able to customize all the required permissions though this
    groups: {
        type: [String],
        default: [],
    },
    openChannel: { type: String, default: null },
    closeChannel: { type: String, default: null },
    isThread: { type: Boolean, default: true },
    addRolesOnOpen: { type: [String], default: [] },
    addRolesOnClose: { type: [String], default: [] },
    removeRolesOnOpen: { type: [String], default: [] },
    removeRolesOnClose: { type: [String], default: [] },
    requiredRoles: { type: [String], default: [] },
    bannedRoles: { type: [String], default: [] },
    hideUsersInTranscript: { type: Boolean, default: false },
    allowRaising: { type: Boolean, default: true },
    allowReopening: { type: Boolean, default: true },
    defaultToRaised: { type: Boolean, default: false },
    dmOnClose: { type: String, default: null },
    closeOnLeave: { type: Boolean, default: false },
    sendCopyOfFormInTicket: { type: Boolean, default: true },
    notifyStaff: { type: [String], default: [] }, // Forced to be the group staff for threaded tickets
    channelNameFormat: {
        type: String,
        default: "ticket-{user.username}",
    },
    userLimit: { type: Number, default: 1 },
    serverLimit: { type: Number, default: null },
    takeTranscripts: { type: Boolean, default: true },
    allowAutoresponders: { type: Boolean, default: true },
    syncChannelPermissionsWhenMoved: { type: Boolean, default: true },
    categoriesAvailableToMoveTicketsTo: { type: [String], default: [] },
});
const ticketTriggerSchemaAjv = {
    type: "object",
    properties: {
        _id: { type: "string" },
        server: { type: "string" },
        __v: { type: "number" },
        label: { type: "string", maxLength: 100 },
        description: { type: ["string", "null"], maxLength: 100 },
        emoji: { type: ["string", "null"], maxLength: 50 },
        colour: {
            type: "number",
            enum: [
                discord_js_1.ButtonStyle.Danger,
                discord_js_1.ButtonStyle.Primary,
                discord_js_1.ButtonStyle.Secondary,
                discord_js_1.ButtonStyle.Success,
            ],
        },
        message: { type: ["string", "null"] },
        form: {
            type: "array",
            maxItems: 5,
            items: {
                type: "object",
                properties: {
                    question: { type: "string", maxLength: 45 },
                    multilineResponse: { type: "boolean" },
                    requiredResponse: { type: "boolean" },
                    defaultValue: {
                        type: ["string", "null"],
                        minLength: 0,
                        maxLength: 4000,
                    },
                    placeholder: {
                        type: ["string", "null"],
                        minLength: 0,
                        maxLength: 4000,
                    },
                    minimumCharactersRequired: {
                        type: ["number", "null"],
                        minimum: 0,
                        maximum: 4000,
                    },
                    maximumCharactersRequired: {
                        type: ["number", "null"],
                        minimum: 0,
                        maximum: 4000,
                    },
                },
                required: [
                    "question",
                    "multilineResponse",
                    "requiredResponse",
                    "minimumCharactersRequired",
                    "maximumCharactersRequired",
                    "defaultValue",
                    "placeholder",
                ],
                additionalProperties: false,
            },
        },
        groups: {
            maxItems: 10,
            type: "array",
            items: { type: "string" },
        },
        openChannel: { type: ["string", "null"] },
        closeChannel: { type: ["string", "null"] },
        isThread: { type: "boolean" },
        dmOnClose: { type: ["string", "null"] },
        allowAutoresponders: { type: "boolean" },
        syncChannelPermissionsWhenMoved: { type: "boolean" },
        categoriesAvailableToMoveTicketsTo: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        addRolesOnOpen: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        requiredRoles: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        bannedRoles: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        addRolesOnClose: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        removeRolesOnOpen: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        removeRolesOnClose: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        hideUsersInTranscript: { type: "boolean" },
        allowRaising: { type: "boolean" },
        allowReopening: { type: "boolean" },
        defaultToRaised: { type: "boolean" },
        closeOnLeave: { type: "boolean" },
        sendCopyOfFormInTicket: { type: "boolean" },
        notifyStaff: {
            type: "array",
            maxItems: 15,
            items: { type: "string" },
        },
        channelNameFormat: { type: "string" },
        userLimit: { type: "number", minimum: 0 },
        serverLimit: { type: ["number", "null"], minimum: 0 },
        takeTranscripts: { type: "boolean" },
    },
    required: [
        "dmOnClose",
        "label",
        "takeTranscripts",
        "requiredRoles",
        "bannedRoles",
        "description",
        "allowAutoresponders",
        "syncChannelPermissionsWhenMoved",
        "categoriesAvailableToMoveTicketsTo",
        "emoji",
        "colour",
        "message",
        "form",
        "groups",
        "openChannel",
        "closeChannel",
        "isThread",
        "addRolesOnOpen",
        "addRolesOnClose",
        "removeRolesOnOpen",
        "removeRolesOnClose",
        "hideUsersInTranscript",
        "allowRaising",
        "allowReopening",
        "defaultToRaised",
        "closeOnLeave",
        "sendCopyOfFormInTicket",
        "notifyStaff",
        "channelNameFormat",
        "userLimit",
        "serverLimit",
    ],
    additionalProperties: false,
};
exports.TicketTriggerSchemaValidator = ajv.compile(ticketTriggerSchemaAjv);
exports.TicketTriggerSchema = mongoose_1.default.model("Ticket Triggers", ticketTriggerSchema);
exports.ApplicationTriggerSchema = mongoose_1.default.model("Application Triggers", applicationTriggerSchema);
//# sourceMappingURL=/src/database/modals/Panel.js.map