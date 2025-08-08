"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const permissions_1 = require("../../../constants/permissions");
const pterodactyl_ts_1 = require("pterodactyl.ts");
const pClient = new pterodactyl_ts_1.ApplicationClient({
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
    async execute(client, data, interaction) {
        const action = interaction.options.getSubcommand(true);
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
                return interaction.reply({
                    content: `There are no allocations free on [this node](${pClient.panel}/admin/nodes/${nodeId}/allocation)`,
                    flags: [discord_js_1.MessageFlags.Ephemeral],
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
                .setStartup("npm run build:dev")
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
            console.log(pServer);
        }
    },
};
exports.default = command;
//# sourceMappingURL=/src/commands/interactions/slash/whitelabel.js.map