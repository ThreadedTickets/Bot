import { Client, Guild, Interaction, Message, User } from "discord.js";
import { Application, ApplicationQuestion } from "../../types/Application";
import { Locale } from "../../types/Locale";
import { logger } from "../logger";
import { TicketFormResponse, TicketTrigger } from "../../types/Ticket";
import { onError } from "../onError";

// hooks/index.ts
type HookHandler = (data: any) => Promise<void> | void;

interface RegisteredHook {
  handler: HookHandler;
  priority: number;
}

const hookRegistry: Record<string, RegisteredHook[]> = {};

/**
 * Register a hook for an event, with an optional priority.
 * Higher priority hooks run before lower ones.
 *
 * @param event - the hook event name
 * @param handler - the callback
 * @param priority - hook priority (default 0). Higher priorities are run first
 */
export function registerHook(
  event: string,
  handler: HookHandler,
  priority = 0
) {
  if (!hookRegistry[event]) hookRegistry[event] = [];
  hookRegistry[event].push({ handler, priority });
}

type HookEventMap = {
  TestEvent: string;
  ApplicationStart: {
    lang: Locale;
    application: Application;
    user: User;
    server: Guild;
  };
  ApplicationEnd: {
    client: Client;
    application: Application;
    responses: {
      applicationId: string;
      startTime: Date;
      server: string;
      questionNumber: number;
      questions: ApplicationQuestion[];

      responses: { question: string; response: string }[];
    };
    owner: string;
  };
  ApplicationFinal: {
    client: Client;
    application: Application;
    responses: {
      applicationId: string;
      startTime: Date;
      server: string;
      questionNumber: number;
      questions: ApplicationQuestion[];

      responses: { question: string; response: string }[];
    };
    owner: string;
    id: string;
  };
  TicketCreate: {
    client: Client;
    trigger: TicketTrigger;
    guild: Guild;
    responses: TicketFormResponse[];
    owner: string;
    messageOrInteraction: Message | Interaction;
    lang: Locale;
    user: User;
  };
};

type HookEvent = {
  [K in keyof HookEventMap]: {
    event: K;
    data: HookEventMap[K];
  };
}[keyof HookEventMap];

/**
 * Run all hooks for an event, sorted by descending priority.
 */
export async function runHooks<K extends keyof HookEventMap>(
  event: K,
  data: HookEventMap[K]
) {
  const list = hookRegistry[event];
  if (!list || list.length === 0) return;

  // sort by priority DESC
  const sorted = list
    .slice() // copy
    .sort((a, b) => b.priority - a.priority);

  for (const { handler } of sorted) {
    try {
      await handler(data);
    } catch (err: any) {
      logger("Hooks", "Error", `Error with hook ${event}: ${err}`);
      onError("Hooks", `Hook error: ${event}`, { stack: err.stack });
    }
  }
}
