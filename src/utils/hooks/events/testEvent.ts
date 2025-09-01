import logger from "../../logger";
import { registerHook } from "../index";

registerHook("TestEvent", async (message) => {
  logger.info(`Message: ${message}`);
});
