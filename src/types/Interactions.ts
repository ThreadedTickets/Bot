import {
  AnySelectMenuInteraction,
  ButtonInteraction,
  Client,
  ModalSubmitInteraction,
} from "discord.js";
import { EventData } from "../handlers/eventHandler";

export interface ButtonHandler {
  customId: string;
  execute: (
    client: Client,
    data: EventData,
    interaction: ButtonInteraction
  ) => unknown;
}

export interface ModalHandler {
  customId: string;
  execute: (
    client: Client,
    data: EventData,
    interaction: ModalSubmitInteraction
  ) => unknown;
}

export interface SelectMenuHandler {
  customId: string;
  execute: (
    client: Client,
    data: EventData,
    interaction: AnySelectMenuInteraction
  ) => unknown;
}
