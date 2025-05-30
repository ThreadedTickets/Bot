import { Client, ClientEvents } from "discord.js";
import { EventData } from "../handlers/eventHandler";

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (
    client: Client,
    data?: EventData,
    ...args: ClientEvents[K]
  ) => unknown;
}
