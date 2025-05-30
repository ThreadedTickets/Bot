import path from "path";
import { loadHandlersRecursively } from "./loadHandlers";
import {
  ButtonHandler,
  ModalHandler,
  SelectMenuHandler,
} from "../types/Interactions";

export const buttonHandlers = new Map<string, ButtonHandler>();
export const modalHandlers = new Map<string, ModalHandler>();
export const selectMenuHandlers = new Map<string, SelectMenuHandler>();

export const loadInteractionHandlers = async () => {
  const baseDir = path.join(__dirname, "../interactions");

  const buttonFiles = loadHandlersRecursively(path.join(baseDir, "buttons"));
  for (const file of buttonFiles) {
    const handler: ButtonHandler = (await import(file)).default;
    if (handler?.customId) buttonHandlers.set(handler.customId, handler);
  }

  const modalFiles = loadHandlersRecursively(path.join(baseDir, "modals"));
  for (const file of modalFiles) {
    const handler: ModalHandler = (await import(file)).default;
    if (handler?.customId) modalHandlers.set(handler.customId, handler);
  }

  const selectMenuFiles = loadHandlersRecursively(
    path.join(baseDir, "selectMenus")
  );
  for (const file of selectMenuFiles) {
    const handler: SelectMenuHandler = (await import(file)).default;
    if (handler?.customId) selectMenuHandlers.set(handler.customId, handler);
  }
};
