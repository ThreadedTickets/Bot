"use strict";
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="cd7c188e-abe9-5a73-8c16-2193f423ff3c")}catch(e){}}();

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../../../constants/permissions");
const pterodactyl_ts_1 = require("pterodactyl.ts");
const Whitelabel_1 = require("../../../database/modals/Whitelabel");
const __1 = require("../../..");
const logger_1 = __importDefault(require("../../../utils/logger"));
const config_1 = __importDefault(require("../../../config"));
const pClient = config_1.default.isWhiteLabel
    ? null
    : new pterodactyl_ts_1.ApplicationClient({
        apikey: process.env["PTERODACTYL_API_KEY"],
        panel: process.env["PTERODACTYL_PANEL_URL"],
    });
const uClient = config_1.default.isWhiteLabel
    ? null
    : new pterodactyl_ts_1.UserClient({
        apikey: process.env["PTERODACTYL_API_KEY"],
        panel: process.env["PTERODACTYL_PANEL_URL"],
    });
const command = {
    testGuild: true,
    permissionLevel: permissions_1.CommandPermission.Owner,
    type: "slash",
    data: new discord_js_1.SlashCommandBuilder()
        .setName("whitelabel_bot")
        .setDescription(".")
        .addSubcommand((o) => o
        .setName("get")
        .setDescription(".")
        .addStringOption((o) => o
        .setName("instance")
        .setDescription(".")
        .setAutocomplete(true)
        .setRequired(true)))
        .addSubcommand((o) => o
        .setName("delete")
        .setDescription(".")
        .addStringOption((o) => o
        .setName("instance")
        .setDescription(".")
        .setAutocomplete(true)
        .setRequired(true)))
        .addSubcommand((o) => o
        .setName("reinstall")
        .setDescription(".")
        .addStringOption((o) => o
        .setName("instance")
        .setDescription(".")
        .setAutocomplete(true)
        .setRequired(false)))
        .addSubcommand((o) => o
        .setName("restart")
        .setDescription(".")
        .addStringOption((o) => o
        .setName("instance")
        .setDescription(".")
        .setAutocomplete(true)
        .setRequired(false)))
        .addSubcommand((o) => o
        .setName("new")
        .setDescription(".")
        .addUserOption((o) => o.setName("owner").setDescription(".").setRequired(true))
        .addStringOption((o) => o.setName("token").setDescription(".").setRequired(true))
        .addStringOption((o) => o.setName("client_id").setDescription(".").setRequired(true))
        .addStringOption((o) => o.setName("servers").setDescription(".").setRequired(true))
        .addStringOption((o) => o.setName("redis_prefix").setDescription(".").setRequired(false))
        .addStringOption((o) => o.setName("prefix").setDescription(".").setRequired(false))
        .addStringOption((o) => o
        .setName("status")
        .setDescription(".")
        .setRequired(false)
        .setChoices([
        {
            name: "Online",
            value: "online",
        },
        {
            name: "Offline",
            value: "invisible",
        },
        {
            name: "Idle",
            value: "idle",
        },
        {
            name: "Do not disturb",
            value: "dnd",
        },
    ]))
        .addStringOption((o) => o.setName("activity_text").setDescription(".").setRequired(false))
        .addStringOption((o) => o.setName("activity_url").setDescription(".").setRequired(false))
        .addStringOption((o) => o
        .setName("activity_type")
        .setDescription(".")
        .setRequired(false)
        .setChoices([
        {
            name: "Playing",
            value: "Playing",
        },
        {
            name: "Streaming",
            value: "Streaming",
        },
        {
            name: "Watching",
            value: "Watching",
        },
        {
            name: "Competing",
            value: "Competing",
        },
        {
            name: "Listening",
            value: "Listening",
        },
    ]))),
    async autocomplete(client, interaction) {
        if (!interaction.guildId)
            return;
        const focused = interaction.options.getFocused(true).name;
        if (focused === "instance") {
            const focusedValue = interaction.options.getString("instance", true);
            const instances = await Whitelabel_1.WhitelabelSchema.find();
            if (!instances.length) {
                interaction.respond([
                    {
                        name: "There are no instances",
                        value: "",
                    },
                ]);
                return;
            }
            const filtered = instances.filter((m) => m.url.includes(focusedValue.toLowerCase()) ||
                m.owner.includes(focusedValue.toLowerCase()) ||
                m.clientId.includes(focusedValue));
            interaction.respond(filtered
                .map((m) => ({
                name: `${m.url.split("/")[4]} | OWNER:${m.owner} | CLIENT:${m.clientId}`.slice(0, 100),
                value: `${m._id}`,
            }))
                .slice(0, 25));
        }
    },
    async execute(client, data, interaction) {
        const action = interaction.options.getSubcommand(true);
        await interaction.reply({
            content: "Wait",
            flags: [discord_js_1.MessageFlags.Ephemeral],
        });
        if (action === "new") {
            const token = interaction.options.getString("token", true);
            const owner = interaction.options.getUser("owner", true);
            const clientId = interaction.options.getString("client_id", true);
            const servers = [
                "1377961138557423657",
                ...interaction.options
                    .getString("servers", true)
                    .split(",")
                    .map((i) => i.trim()),
            ];
            const redisPrefix = interaction.options.getString("redis_prefix", false) || "";
            const prefix = interaction.options.getString("prefix", false) || ">";
            const status = interaction.options.getString("status", false) || "online";
            const activityText = interaction.options.getString("activity_text", false) || "";
            const activityType = interaction.options.getString("activity_type", false) || "";
            const activityUrl = interaction.options.getString("activity_url", false) || "";
            const nodeId = process.env["PTERODACTYL_NODE"];
            const node = await pClient.getNode(parseInt(nodeId, 10));
            const allocation = node.allocations.filter((a) => !a.assigned)[0];
            if (!allocation)
                return interaction.editReply({
                    content: `There are no allocations free on [this node](${pClient.panel}/admin/nodes/${nodeId}/allocation)`,
                });
            const pServer = await pClient.createServer(new pterodactyl_ts_1.ServerBuilder()
                .setName(`Threaded Whitelabel ${owner.username} - ${owner.id}`)
                .setAllocationId(allocation.id)
                .setDockerImage("ghcr.io/parkervcp/yolks:nodejs_20")
                .setOwnerId(parseInt(process.env["PTERODACTYL_OWNER"], 10))
                .setEggId(parseInt(process.env["PTERODACTYL_EGG"], 10))
                .setLimits({
                cpu: 50,
                disk: 1024 * 5,
                io: 500,
                memory: 512,
                swap: 64,
                threads: undefined,
            })
                .setStartup("npm run build:whitelabel")
                .startServerWhenInstalled(true)
                .addEnvironmentVariable("IS_WHITELABEL", "true")
                .addEnvironmentVariable("WHITELABEL_SERVER_IDS", servers.join(", "))
                .addEnvironmentVariable("REDIS_PREFIX", redisPrefix)
                .addEnvironmentVariable("PREFIX", prefix)
                .addEnvironmentVariable("BOT_STATUS", status)
                .addEnvironmentVariable("BOT_ACTIVITY_TYPE", activityType)
                .addEnvironmentVariable("BOT_ACTIVITY_TEXT", activityText)
                .addEnvironmentVariable("BOT_ACTIVITY_URL", activityUrl)
                .addEnvironmentVariable("DISCORD_TOKEN", token)
                .addEnvironmentVariable("DISCORD_CLIENT_ID", clientId)
                .addEnvironmentVariable("DISCORD_TEST_GUILD", servers[0])
                .addEnvironmentVariable("MONGOOSE_URI", process.env["MONGOOSE_URI"])
                .addEnvironmentVariable("THREADED_API_URL", process.env["THREADED_API_URL"])
                .addEnvironmentVariable("THREADED_API_TOKEN", process.env["THREADED_API_TOKEN"])
                .addEnvironmentVariable("REDIS_HOST", process.env["REDIS_HOST"])
                .addEnvironmentVariable("REDIS_PORT", process.env["REDIS_PORT"])
                .addEnvironmentVariable("REDIS_PASSWORD", process.env["REDIS_PASSWORD"]));
            if (!pServer)
                return interaction.editReply({
                    content: "Failed to make server",
                });
            Whitelabel_1.WhitelabelSchema.create({
                clientId,
                owner: owner.id,
                url: `${pClient.panel}/server/${pServer.identifier}`,
                _id: pServer.id,
                fullId: pServer.uuid,
            });
            interaction.editReply({
                content: `Made server ${pClient.panel}/server/${pServer.identifier}`,
            });
        }
        else if (action === "get") {
            const id = interaction.options.getString("instance", true);
            const dbEntry = await Whitelabel_1.WhitelabelSchema.findOne({ _id: { $eq: id } });
            if (!dbEntry)
                return interaction.editReply({ content: "Not found" });
            try {
                const fullServer = await uClient.getServer(dbEntry.fullId);
                const usage = await fullServer.getUsage();
                const json = {
                    created: dbEntry.createdAt.toISOString(),
                    owner: dbEntry.owner,
                    clientId: dbEntry.clientId,
                    url: dbEntry.url,
                    status: await fullServer.getStatus(),
                    usage: usage.resources,
                };
                interaction.editReply({
                    content: `\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\``,
                    components: [
                        new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                            .setURL(dbEntry.url)
                            .setLabel("View")
                            .setStyle(discord_js_1.ButtonStyle.Link)),
                    ],
                });
            }
            catch (error) {
                interaction.editReply({ content: error.message });
            }
        }
        else if (action === "delete") {
            const id = interaction.options.getString("instance", true);
            const dbEntry = await Whitelabel_1.WhitelabelSchema.findOne({ _id: { $eq: id } });
            if (!dbEntry)
                return interaction.editReply({ content: "Not found" });
            const server = await pClient.getServer(dbEntry._id);
            await Whitelabel_1.WhitelabelSchema.findOneAndDelete({ _id: { $eq: id } });
            interaction.editReply({
                content: `Deleted from db, please delete the server manually: ${pClient.panel}/admin/servers/view/${server.id}/delete`,
            });
            // The package is broken atm so delete ptero server manually
            // if (server) await server.delete(true);
            // interaction.editReply({
            //   content: `deleted`,
            // });
        }
        else if (action === "reinstall") {
            const id = interaction.options.getString("instance", false);
            if (id) {
                const dbEntry = await Whitelabel_1.WhitelabelSchema.findOne({ _id: { $eq: id } });
                if (!dbEntry)
                    return interaction.editReply({ content: "Not found" });
                const server = await pClient.getServer(dbEntry._id);
                server.reinstall();
                interaction.editReply({
                    content: "Reinstalling 1 server",
                });
            }
            else {
                const servers = await uClient.getServers();
                interaction.editReply({
                    content: `Reinstalling ${servers.length} servers`,
                });
                for (const server of servers) {
                    try {
                        await server.reinstall(); // Trigger reinstall
                        // Wait 1 second before the next iteration
                        await (0, __1.wait)(1000);
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to reinstall ${server.name}:`, error);
                    }
                }
                interaction.editReply({
                    content: `done`,
                });
            }
        }
        else if (action === "restart") {
            const id = interaction.options.getString("instance", false);
            if (id) {
                const dbEntry = await Whitelabel_1.WhitelabelSchema.findOne({ _id: { $eq: id } });
                if (!dbEntry)
                    return interaction.editReply({ content: "Not found" });
                const server = await uClient.getServer(String(dbEntry._id));
                server.reinstall();
                interaction.editReply({
                    content: "restarting 1 server",
                });
            }
            else {
                const servers = await uClient.getServers();
                interaction.editReply({
                    content: `restarting ${servers.length} servers`,
                });
                for (const server of servers) {
                    try {
                        await server.restart(); // Trigger reinstall
                        // Wait 1 second before the next iteration
                        await (0, __1.wait)(1000);
                    }
                    catch (error) {
                        logger_1.default.error(`Failed to restart ${server.name}:`, error);
                    }
                }
                interaction.editReply({
                    content: `done`,
                });
            }
        }
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/interactions/slash/whitelabel.js.map
//# debugId=cd7c188e-abe9-5a73-8c16-2193f423ff3c
