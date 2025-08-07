"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="d95956dc-0ca8-5f0b-9091-353bd073a204")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApi = startApi;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const MessageCreator_1 = require("./database/modals/MessageCreator");
const validateMessage_1 = require("./utils/bot/validateMessage");
const getServer_1 = require("./utils/bot/getServer");
const invalidateCache_1 = require("./utils/database/invalidateCache");
const limits_1 = __importDefault(require("./constants/limits"));
const generateId_1 = require("./utils/database/generateId");
const GroupCreator_1 = require("./database/modals/GroupCreator");
const Guild_1 = require("./database/modals/Guild");
const Panel_1 = require("./database/modals/Panel");
const ApplicationCreator_1 = require("./database/modals/ApplicationCreator");
const TicketTriggerCreator_1 = require("./database/modals/TicketTriggerCreator");
const _1 = require(".");
const os_1 = __importDefault(require("os"));
const discord_hybrid_sharding_1 = require("discord-hybrid-sharding");
const duration_1 = require("./utils/formatters/duration");
const updateCache_1 = require("./utils/database/updateCache");
const Tag_1 = require("./database/modals/Tag");
const logger_1 = __importDefault(require("./utils/logger"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token || token !== process.env["API_TOKEN"]) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    next();
}
const app = (0, express_1.default)();
// Auth middleware
app.use(authMiddleware);
app.use(express_1.default.json());
// Rate limiter middleware for Prometheus endpoint
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 10000, // 5 requests per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
});
// Exportable function to start the metrics server
function startApi(port) {
    app.get(`/`, limiter, async (req, res) => {
        res.json({
            message: `Welcome to the Threaded API! The time for me is ${new Date().toISOString()}`,
        });
    });
    app.post("/create/message/save", async (req, res) => {
        const creatorId = req.query.id;
        const { content, embeds, attachments, components } = req.body;
        if (!creatorId) {
            res.status(400).json({
                message: "Please provide a creatorId ID (?id=) and data in the body",
            });
            return;
        }
        try {
            const creator = await MessageCreator_1.MessageCreatorSchema.findById(creatorId);
            if (!creator)
                throw new Error("Invalid editor - Error 0002");
            if (!creator.name)
                throw new Error("Creator name is required to save the message");
            if (!creator.guildId)
                throw new Error("Creator guildId is required to save the message");
            // Perform message checks
            const validation = (0, validateMessage_1.validateDiscordMessage)({
                content,
                embeds,
                attachments,
                components,
            });
            if (validation.length)
                throw new Error(`Errors found when saving message: ${validation
                    .map((e) => e.message)
                    .join(", ")}`);
            const messages = await (0, getServer_1.getServerMessages)(creator.guildId);
            if (messages.length > limits_1.default.free.messages.amount)
                throw new Error(`Too many messages: 0003`);
            const id = creator.metadata.link || (0, generateId_1.generateId)("GM");
            if (!creator.metadata.link) {
                // Create new message
                const message = {
                    _id: id,
                    content,
                    embeds,
                    attachments,
                    components,
                    server: creator.guildId,
                    name: creator.name,
                };
                await Guild_1.MessageSchema.create(message);
            }
            else {
                const message = await (0, getServer_1.getServerMessage)(creator.metadata.link, creator.guildId);
                if (!message) {
                    throw new Error("Message to update not found: 0001");
                }
                message.content = content;
                message.embeds = embeds;
                message.attachments = attachments;
                message.components = components;
                message.name = creator.name;
                await message.save();
                await (0, invalidateCache_1.invalidateCache)(`message:${creator.metadata.link}`);
            }
            await MessageCreator_1.MessageCreatorSchema.findByIdAndDelete(creatorId);
            await (0, invalidateCache_1.invalidateCache)(`messageCreators:${creatorId}`);
            await (0, invalidateCache_1.invalidateCache)(`messages:${creator.guildId}`);
            res.status(200).json({ message: "Message saved successfully" });
        }
        catch (error) {
            res
                .status(500)
                .json({ message: `Error when saving message: ${error.message}` });
        }
    });
    app.post("/create/group/save", async (req, res) => {
        const creatorId = req.query.id;
        const { name, roles, extraMembers, permissions } = req.body;
        if (!creatorId) {
            res.status(400).json({
                message: "Please provide a creatorId ID (?id=) and data in the body",
            });
            return;
        }
        try {
            const creator = await GroupCreator_1.GroupCreatorSchema.findById(creatorId);
            if (!creator)
                throw new Error("Invalid editor - Error 0002");
            if (!creator.guildId)
                throw new Error("Creator guildId is required to save the message");
            if (!(0, Guild_1.GroupSchemaValidator)({
                name,
                roles,
                permissions,
                extraMembers,
            }))
                throw new Error(`Modified document: 0004`);
            const groups = await (0, getServer_1.getServerGroups)(creator.guildId);
            if (groups.length > limits_1.default.free.groups.amount)
                throw new Error(`Too many groups: 0003`);
            const id = creator.metadata.link || (0, generateId_1.generateId)("GG");
            if (!creator.metadata.link) {
                // Create new group
                const group = {
                    _id: id,
                    name,
                    roles,
                    permissions,
                    extraMembers,
                    server: creator.guildId,
                };
                await Guild_1.GroupSchema.create(group);
            }
            else {
                const group = await (0, getServer_1.getServerGroup)(creator.metadata.link, creator.guildId);
                if (!group) {
                    throw new Error("Group to update not found: 0001");
                }
                group.name = name;
                group.extraMembers = extraMembers;
                group.roles = roles;
                group.permissions = permissions;
                await group.save();
                await (0, invalidateCache_1.invalidateCache)(`group:${creator.metadata.link}`);
            }
            await GroupCreator_1.GroupCreatorSchema.findByIdAndDelete(creatorId);
            await (0, invalidateCache_1.invalidateCache)(`groupCreators:${creatorId}`);
            await (0, invalidateCache_1.invalidateCache)(`groups:${creator.guildId}`);
            res.status(200).json({ message: "Group saved successfully" });
        }
        catch (error) {
            res
                .status(500)
                .json({ message: `Error when saving group: ${error.message}` });
        }
    });
    app.post("/create/application/save", async (req, res) => {
        const creatorId = req.query.id;
        if (!creatorId) {
            res.status(400).json({
                message: "Please provide a creatorId ID (?id=) and data in the body",
            });
            return;
        }
        try {
            const creator = await ApplicationCreator_1.ApplicationCreatorSchema.findById(creatorId);
            if (!creator)
                throw new Error("Invalid editor - Error 0002");
            if (!creator.guildId)
                throw new Error("Creator guildId is required to save the message");
            if (!(0, Panel_1.ApplicationSchemaValidator)(req.body))
                throw new Error(`Modified document: 0004`);
            const applications = await (0, getServer_1.getServerApplications)(creator.guildId);
            if (applications.length > limits_1.default.free.applications.amount)
                throw new Error(`Too many applications: 0003`);
            const id = creator.metadata.link || (0, generateId_1.generateId)("AT");
            if (!creator.metadata.link) {
                // Create new application
                const application = {
                    _id: id,
                    server: creator.guildId,
                    ...req.body,
                };
                await Panel_1.ApplicationTriggerSchema.create(application);
            }
            else {
                let application = await (0, getServer_1.getServerApplication)(creator.metadata.link, creator.guildId);
                if (!application) {
                    throw new Error("Application to update not found: 0001");
                }
                const { _id, server, ...safeBody } = req.body;
                // Apply safe updates
                application.set(safeBody);
                await application.save();
                await (0, invalidateCache_1.invalidateCache)(`application:${creator.metadata.link}`);
            }
            await ApplicationCreator_1.ApplicationCreatorSchema.findByIdAndDelete(creatorId);
            await (0, invalidateCache_1.invalidateCache)(`applicationCreators:${creatorId}`);
            await (0, invalidateCache_1.invalidateCache)(`applications:${creator.guildId}`);
            res.status(200).json({ message: "Application saved successfully" });
        }
        catch (error) {
            res
                .status(500)
                .json({ message: `Error when saving application: ${error.message}` });
        }
    });
    app.post("/create/ticket/save", async (req, res) => {
        const creatorId = req.query.id;
        if (!creatorId) {
            res.status(400).json({
                message: "Please provide a creatorId ID (?id=) and data in the body",
            });
            return;
        }
        try {
            const creator = await TicketTriggerCreator_1.TicketTriggerCreatorSchema.findById(creatorId);
            if (!creator)
                throw new Error("Invalid editor - Error 0002");
            if (!creator.guildId)
                throw new Error("Creator guildId is required to save the message");
            if (!(0, Panel_1.TicketTriggerSchemaValidator)(req.body))
                throw new Error(`Modified document: 0004`);
            const triggers = await (0, getServer_1.getServerApplications)(creator.guildId);
            if (triggers.length > limits_1.default.free.ticketTriggers.amount)
                throw new Error(`Too many ticket triggers: 0003`);
            const id = creator.metadata.link || (0, generateId_1.generateId)("TT");
            if (!creator.metadata.link) {
                // Create new application
                const trigger = {
                    _id: id,
                    server: creator.guildId,
                    ...req.body,
                };
                await Panel_1.TicketTriggerSchema.create(trigger);
            }
            else {
                let trigger = await (0, getServer_1.getServerTicketTrigger)(creator.metadata.link, creator.guildId);
                if (!trigger) {
                    throw new Error("Trigger to update not found: 0001");
                }
                const { _id, server, ...safeBody } = req.body;
                // Apply safe updates
                trigger.set(safeBody);
                await trigger.save();
                await (0, invalidateCache_1.invalidateCache)(`ticketTrigger:${creator.metadata.link}`);
            }
            await TicketTriggerCreator_1.TicketTriggerCreatorSchema.findByIdAndDelete(creatorId);
            await (0, invalidateCache_1.invalidateCache)(`ticketTriggerCreators:${creatorId}`);
            await (0, invalidateCache_1.invalidateCache)(`ticketTriggers:${creator.guildId}`);
            await (0, invalidateCache_1.invalidateCache)(`ticketTrigger:${id}`);
            res.status(200).json({ message: "Ticket trigger saved successfully" });
        }
        catch (error) {
            res.status(500).json({
                message: `Error when saving ticket trigger: ${error.message}`,
            });
        }
    });
    app.post("/forceCache", async (req, res) => {
        try {
            const { type, _id } = req.body;
            if (!_id || !type) {
                res.status(400).json({ message: "Not all fields were provided" });
                return;
            }
            switch (type) {
                case "server":
                    const server = await Guild_1.GuildSchema.findOne({ _id: _id });
                    if (!server) {
                        res.status(400).json({ message: "That server doesn't exist" });
                        return;
                    }
                    await (0, updateCache_1.updateCachedData)(`guilds:${_id}`, 30, server);
                    res.status(200).json({
                        message: `Server has been added to the cache. It can be accessed through guilds:${_id}`,
                        key: `guilds:${_id}`,
                    });
                    break;
                case "message":
                    const msg = await Guild_1.MessageSchema.findOne({ _id: _id });
                    if (!msg) {
                        res.status(400).json({ message: "That message doesn't exist" });
                        return;
                    }
                    await (0, updateCache_1.updateCachedData)(`message:${_id}`, 30, msg);
                    res.status(200).json({
                        message: `Message has been added to the cache. It can be accessed through message:${_id}`,
                        key: `message:${_id}`,
                    });
                    break;
                // In this case _id is of the server we want the messages of
                case "messages":
                    const msgs = await Guild_1.MessageSchema.find({ server: _id });
                    await (0, updateCache_1.updateCachedData)(`messages:${_id}`, 30, msgs.map((m) => {
                        return {
                            _id: m._id,
                            name: m.name,
                        };
                    }));
                    res.status(200).json({
                        message: `Messages have been added to the cache. It can be accessed through messages:${_id}`,
                        key: `messages:${_id}`,
                    });
                    break;
                case "tag":
                    const tag = await Tag_1.TagSchema.findOne({ _id: _id });
                    if (!tag) {
                        res.status(400).json({ message: "That tag doesn't exist" });
                        return;
                    }
                    await (0, updateCache_1.updateCachedData)(`tag:${_id}`, 30, tag);
                    res.status(200).json({
                        message: `Tag has been added to the cache. It can be accessed through tag:${_id}`,
                        key: `tag:${_id}`,
                    });
                    break;
                // In this case _id is of the server we want the messages of
                case "tags":
                    const tags = await Tag_1.TagSchema.find({ server: _id });
                    await (0, updateCache_1.updateCachedData)(`tags:${_id}`, 30, tags);
                    res.status(200).json({
                        message: `Tags have been added to the cache. It can be accessed through tags:${_id}`,
                        key: `tags:${_id}`,
                    });
                    break;
                case "interactive":
                    const interactive = [
                        ...(await Tag_1.TagSchema.find({ server: _id })).map((t) => ({
                            _id: t._id,
                            name: t.name,
                        })),
                        ...(await Panel_1.ApplicationTriggerSchema.find({ server: _id })).map((t) => ({ _id: t._id, name: t.name })),
                        ...(await Panel_1.TicketTriggerSchema.find({ server: _id })).map((t) => ({
                            _id: t._id,
                            name: t.label,
                        })),
                    ];
                    await (0, updateCache_1.updateCachedData)(`interactive:${_id}`, 30, interactive);
                    res.status(200).json({
                        message: `Interactive components have been added to the cache. It can be accessed through interactive:${_id}`,
                        key: `interactive:${_id}`,
                    });
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            res.status(500).json({
                message: `Error when caching: ${error.message}`,
            });
        }
    });
    app.get("/api/health", async (req, res) => {
        const uptime = process.uptime();
        const memoryUsageMB = process.memoryUsage().rss / 1024 / 1024;
        // Get CPU usage over 100ms
        const cpuUsageStart = process.cpuUsage();
        const timeStart = Date.now();
        await new Promise((r) => setTimeout(r, 100));
        const cpuUsageEnd = process.cpuUsage(cpuUsageStart);
        const elapsedMs = Date.now() - timeStart;
        const cpuPercent = ((cpuUsageEnd.user + cpuUsageEnd.system) /
            1000 /
            elapsedMs /
            os_1.default.cpus().length) *
            100;
        // Guild count across all shards this cluster handles
        const guildCount = _1.client.guilds.cache.size;
        res.json({
            clusterId: (0, discord_hybrid_sharding_1.getInfo)().CLUSTER,
            shardIds: (0, discord_hybrid_sharding_1.getInfo)().SHARD_LIST,
            uptime: (0, duration_1.formatDuration)(uptime * 1000),
            guildCount,
            ramUsage: memoryUsageMB,
            cpuUsage: cpuPercent,
        });
    });
    app.listen(port, () => {
        logger_1.default.info(`API server running at http://localhost:${port}`);
    });
}
//# sourceMappingURL=apiServer.js.map
//# debugId=d95956dc-0ca8-5f0b-9091-353bd073a204
