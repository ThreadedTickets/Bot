import { logger } from "../../logger";
import { registerHook } from "../index";

registerHook("TestEvent", async (message) => {
  logger("Hooks", "Info", `Message: ${message}`);
});
