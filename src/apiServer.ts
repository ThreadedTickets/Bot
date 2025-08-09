import express, { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { MessageCreatorSchema } from "./database/modals/MessageCreator";
import { validateDiscordMessage } from "./utils/bot/validateMessage";
import {
  getServerApplication,
  getServerApplications,
  getServerGroup,
  getServerGroups,
  getServerMessage,
  getServerMessages,
  getServerTicketTrigger,
} from "./utils/bot/getServer";
import { invalidateCache } from "./utils/database/invalidateCache";
import limits from "./constants/limits";
import { generateId } from "./utils/database/generateId";
import { GroupCreatorSchema } from "./database/modals/GroupCreator";
import {
  GroupSchema,
  GroupSchemaValidator,
  GuildSchema,
  MessageSchema,
} from "./database/modals/Guild";
import {
  ApplicationSchemaValidator,
  ApplicationTriggerSchema,
  TicketTriggerSchema,
  TicketTriggerSchemaValidator,
} from "./database/modals/Panel";
import { ApplicationCreatorSchema } from "./database/modals/ApplicationCreator";
import { TicketTriggerCreatorSchema } from "./database/modals/TicketTriggerCreator";
import { client } from ".";
import os from "os";
import { getInfo } from "discord-hybrid-sharding";
import { formatDuration } from "./utils/formatters/duration";
import { updateCachedData } from "./utils/database/updateCache";
import { TagSchema } from "./database/modals/Tag";
import logger from "./utils/logger";
import { AutoResponderSchema } from "./database/modals/AutoResponder";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token || token !== process.env["API_TOKEN"]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

const app = express();

// Auth middleware
app.use(authMiddleware);
app.use(express.json());

// Rate limiter middleware for Prometheus endpoint
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10_000, // 5 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

type Body = {
  _id?: string;
  server?: string;
  [key: string]: any;
};

// Exportable function to start the metrics server
export function startApi(port: number) {
  app.get(`/`, async (req: Request, res: Response) => {
    res.json({
      message: `Welcome to the Threaded API! The time for me is ${new Date().toISOString()}`,
    });
  });

  app.post("/create/message/save", async (req: Request, res: Response) => {
    const creatorId = req.query.id;
    const { content, embeds, attachments, components } = req.body as Body;

    if (!creatorId || typeof creatorId !== "string") {
      res.status(400).json({
        message:
          "Please provide a valid creatorId (?id=) as a string and data in the body",
      });
      return;
    }

    try {
      const creator = await MessageCreatorSchema.findById(creatorId);
      if (!creator) throw new Error("Invalid editor - Error 0002");
      if (!creator.name)
        throw new Error("Creator name is required to save the message");
      if (!creator.guildId)
        throw new Error("Creator guildId is required to save the message");

      // Perform message checks
      const validation = validateDiscordMessage({
        content,
        embeds,
        attachments,
        components,
      });
      if (validation.length)
        throw new Error(
          `Errors found when saving message: ${validation
            .map((e) => e.message)
            .join(", ")}`
        );

      const messages = await getServerMessages(creator.guildId);
      if (messages.length > limits.free.messages.amount)
        throw new Error(`Too many messages: 0003`);

      const id = creator.metadata.link || generateId("GM");
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

        await MessageSchema.create(message);
      } else {
        const message = await getServerMessage(
          creator.metadata.link,
          creator.guildId
        );
        if (!message) {
          throw new Error("Message to update not found: 0001");
        }

        message.content = content;
        message.embeds = embeds;
        message.attachments = attachments;
        message.components = components;
        message.name = creator.name;

        await message.save();
        await invalidateCache(`message:${creator.metadata.link}`);
      }

      await MessageCreatorSchema.findByIdAndDelete(creatorId);
      await invalidateCache(`messageCreators:${creatorId}`);
      await invalidateCache(`messages:${creator.guildId}`);
      res.status(200).json({ message: "Message saved successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error when saving message: ${error.message}` });
    }
  });

  app.post("/create/group/save", async (req: Request, res: Response) => {
    const creatorId = req.query.id;
    const { name, roles, extraMembers, permissions } = req.body as Body;

    if (!creatorId || typeof creatorId !== "string") {
      res.status(400).json({
        message: "Please provide a creatorId ID (?id=) and data in the body",
      });
      return;
    }

    try {
      const creator = await GroupCreatorSchema.findById(creatorId);
      if (!creator) throw new Error("Invalid editor - Error 0002");
      if (!creator.guildId)
        throw new Error("Creator guildId is required to save the message");

      if (
        !GroupSchemaValidator({
          name,
          roles,
          permissions,
          extraMembers,
        })
      )
        throw new Error(`Modified document: 0004`);

      const groups = await getServerGroups(creator.guildId);
      if (groups.length > limits.free.groups.amount)
        throw new Error(`Too many groups: 0003`);

      const id = creator.metadata.link || generateId("GG");
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

        await GroupSchema.create(group);
      } else {
        const group = await getServerGroup(
          creator.metadata.link,
          creator.guildId
        );
        if (!group) {
          throw new Error("Group to update not found: 0001");
        }

        group.name = name;
        group.extraMembers = extraMembers;
        group.roles = roles;
        group.permissions = permissions;
        await group.save();
        await invalidateCache(`group:${creator.metadata.link}`);
      }

      await GroupCreatorSchema.findByIdAndDelete(creatorId);
      await invalidateCache(`groupCreators:${creatorId}`);
      await invalidateCache(`groups:${creator.guildId}`);
      res.status(200).json({ message: "Group saved successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error when saving group: ${error.message}` });
    }
  });

  app.post("/create/application/save", async (req: Request, res: Response) => {
    const creatorId = req.query.id;

    if (!creatorId || typeof creatorId !== "string") {
      res.status(400).json({
        message: "Please provide a creatorId ID (?id=) and data in the body",
      });
      return;
    }

    try {
      const creator = await ApplicationCreatorSchema.findById(creatorId);
      if (!creator) throw new Error("Invalid editor - Error 0002");
      if (!creator.guildId)
        throw new Error("Creator guildId is required to save the message");

      if (!ApplicationSchemaValidator(req.body))
        throw new Error(`Modified document: 0004`);

      const applications = await getServerApplications(creator.guildId);
      if (applications.length > limits.free.applications.amount)
        throw new Error(`Too many applications: 0003`);

      const id = creator.metadata.link || generateId("AT");
      if (!creator.metadata.link) {
        // Create new application
        const application = {
          _id: id,
          server: creator.guildId,
          ...(req.body as Body),
        };

        await ApplicationTriggerSchema.create(application);
      } else {
        let application = await getServerApplication(
          creator.metadata.link,
          creator.guildId
        );
        if (!application) {
          throw new Error("Application to update not found: 0001");
        }

        const { _id, server, ...safeBody } = req.body as Body;

        // Apply safe updates
        application.set(safeBody);
        await application.save();
        await invalidateCache(`application:${creator.metadata.link}`);
      }

      await ApplicationCreatorSchema.findByIdAndDelete(creatorId);
      await invalidateCache(`applicationCreators:${creatorId}`);
      await invalidateCache(`applications:${creator.guildId}`);
      res.status(200).json({ message: "Application saved successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: `Error when saving application: ${error.message}` });
    }
  });

  app.post("/create/ticket/save", async (req: Request, res: Response) => {
    const creatorId = req.query.id;

    if (!creatorId || typeof creatorId !== "string") {
      res.status(400).json({
        message: "Please provide a creatorId ID (?id=) and data in the body",
      });
      return;
    }

    try {
      const creator = await TicketTriggerCreatorSchema.findById(creatorId);
      if (!creator) throw new Error("Invalid editor - Error 0002");
      if (!creator.guildId)
        throw new Error("Creator guildId is required to save the message");

      if (!TicketTriggerSchemaValidator(req.body))
        throw new Error(`Modified document: 0004`);

      const triggers = await getServerApplications(creator.guildId);
      if (triggers.length > limits.free.ticketTriggers.amount)
        throw new Error(`Too many ticket triggers: 0003`);

      const id = creator.metadata.link || generateId("TT");
      if (!creator.metadata.link) {
        // Create new application
        const trigger = {
          _id: id,
          server: creator.guildId,
          ...(req.body as Body),
        };

        await TicketTriggerSchema.create(trigger);
      } else {
        let trigger = await getServerTicketTrigger(
          creator.metadata.link,
          creator.guildId
        );
        if (!trigger) {
          throw new Error("Trigger to update not found: 0001");
        }

        const { _id, server, ...safeBody } = req.body as Body;

        // Apply safe updates
        trigger.set(safeBody);
        await trigger.save();
        await invalidateCache(`ticketTrigger:${creator.metadata.link}`);
      }

      await TicketTriggerCreatorSchema.findByIdAndDelete(creatorId);
      await invalidateCache(`ticketTriggerCreators:${creatorId}`);
      await invalidateCache(`ticketTriggers:${creator.guildId}`);
      await invalidateCache(`ticketTrigger:${id}`);
      res.status(200).json({ message: "Ticket trigger saved successfully" });
    } catch (error: any) {
      res.status(500).json({
        message: `Error when saving ticket trigger: ${error.message}`,
      });
    }
  });

  app.post("/forceCache", async (req: Request, res: Response) => {
    try {
      const { type, _id } = req.body as Body;
      if (!_id || !type) {
        res.status(400).json({ message: "Not all fields were provided" });
        return;
      }
      switch (type) {
        case "server":
          const server = await GuildSchema.findOne({ _id: { $eq: _id } });
          if (!server) {
            res.status(400).json({ message: "That server doesn't exist" });
            return;
          }
          await updateCachedData(`guilds:${_id}`, 30, server);
          res.status(200).json({
            message: `Server has been added to the cache. It can be accessed through guilds:${_id}`,
            key: `guilds:${_id}`,
          });
          break;
        case "message":
          const msg = await MessageSchema.findOne({ _id: { $eq: _id } });
          if (!msg) {
            res.status(400).json({ message: "That message doesn't exist" });
            return;
          }
          await updateCachedData(`message:${_id}`, 30, msg);
          res.status(200).json({
            message: `Message has been added to the cache. It can be accessed through message:${_id}`,
            key: `message:${_id}`,
          });
          break;
        // In this case _id is of the server we want the messages of
        case "messages":
          const msgs = await MessageSchema.find({ server: { $eq: _id } });
          await updateCachedData(
            `messages:${_id}`,
            30,
            msgs.map((m) => {
              return {
                _id: m._id,
                name: m.name,
              };
            })
          );
          res.status(200).json({
            message: `Messages have been added to the cache. It can be accessed through messages:${_id}`,
            key: `messages:${_id}`,
          });
          break;
        case "responder":
          const resp = await AutoResponderSchema.findOne({ _id: { $eq: _id } });
          if (!resp) {
            res.status(400).json({ message: "That responder doesn't exist" });
            return;
          }
          await updateCachedData(`responder:${_id}`, 30, resp);
          res.status(200).json({
            message: `Responder has been added to the cache. It can be accessed through responder:${_id}`,
            key: `responder:${_id}`,
          });
          break;
        // In this case _id is of the server we want the messages of
        case "responders":
          const resps = await AutoResponderSchema.find({
            server: { $eq: _id },
          });
          await updateCachedData(`responders:${_id}`, 30, resps);
          res.status(200).json({
            message: `responders have been added to the cache. It can be accessed through responders:${_id}`,
            key: `responders:${_id}`,
          });
          break;
        case "tag":
          const tag = await TagSchema.findOne({ _id: { $eq: _id } });
          if (!tag) {
            res.status(400).json({ message: "That tag doesn't exist" });
            return;
          }
          await updateCachedData(`tag:${_id}`, 30, tag);
          res.status(200).json({
            message: `Tag has been added to the cache. It can be accessed through tag:${_id}`,
            key: `tag:${_id}`,
          });
          break;
        // In this case _id is of the server we want the messages of
        case "tags":
          const tags = await TagSchema.find({ server: { $eq: _id } });
          await updateCachedData(`tags:${_id}`, 30, tags);
          res.status(200).json({
            message: `Tags have been added to the cache. It can be accessed through tags:${_id}`,
            key: `tags:${_id}`,
          });
          break;
        case "group":
          const group = await GroupSchema.findOne({ _id: { $eq: _id } });
          if (!group) {
            res.status(400).json({ message: "That group doesn't exist" });
            return;
          }
          await updateCachedData(`group:${_id}`, 30, group);
          res.status(200).json({
            message: `group has been added to the cache. It can be accessed through group:${_id}`,
            key: `group:${_id}`,
          });
          break;
        // In this case _id is of the server we want the messages of
        case "groups":
          const groups = await GroupSchema.find({ server: { $eq: _id } });
          await updateCachedData(
            `groups:${_id}`,
            30,
            groups.map((g) => ({ _id: g._id, name: g.name }))
          );
          res.status(200).json({
            message: `groups have been added to the cache. It can be accessed through groups:${_id}`,
            key: `groups:${_id}`,
          });
          break;
        case "trigger":
          const trigger = await TicketTriggerSchema.findOne({
            _id: { $eq: _id },
          });
          if (!trigger) {
            res.status(400).json({ message: "That trigger doesn't exist" });
            return;
          }
          await updateCachedData(`trigger:${_id}`, 30, trigger);
          res.status(200).json({
            message: `trigger has been added to the cache. It can be accessed through trigger:${_id}`,
            key: `trigger:${_id}`,
          });
          break;
        // In this case _id is of the server we want the messages of
        case "triggers":
          const triggers = await TicketTriggerSchema.find({
            server: { $eq: _id },
          });
          await updateCachedData(
            `triggers:${_id}`,
            30,
            triggers.map((t) => ({ _id: t._id, name: t.label }))
          );
          res.status(200).json({
            message: `triggers have been added to the cache. It can be accessed through triggers:${_id}`,
            key: `triggers:${_id}`,
          });
          break;
        case "interactive":
          const interactive = [
            ...(await TagSchema.find({ server: { $eq: _id } })).map((t) => ({
              _id: t._id,
              name: t.name,
            })),
            ...(
              await ApplicationTriggerSchema.find({ server: { $eq: _id } })
            ).map((t) => ({ _id: t._id, name: t.name })),
            ...(await TicketTriggerSchema.find({ server: { $eq: _id } })).map(
              (t) => ({
                _id: t._id,
                name: t.label,
              })
            ),
          ];
          await updateCachedData(`interactive:${_id}`, 30, interactive);
          res.status(200).json({
            message: `Interactive components have been added to the cache. It can be accessed through interactive:${_id}`,
            key: `interactive:${_id}`,
          });
          break;
        default:
          break;
      }
    } catch (error: any) {
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
    const cpuPercent =
      ((cpuUsageEnd.user + cpuUsageEnd.system) /
        1000 /
        elapsedMs /
        os.cpus().length) *
      100;

    // Guild count across all shards this cluster handles
    const guildCount = client.guilds.cache.size;

    res.json({
      clusterId: getInfo().CLUSTER,
      shardIds: getInfo().SHARD_LIST,
      uptime: formatDuration(uptime * 1000),
      guildCount,
      ramUsage: memoryUsageMB,
      cpuUsage: cpuPercent,
    });
  });

  app.listen(port || 10002, () => {
    logger.info(`API server running at http://localhost:${port}`);
  });
}
