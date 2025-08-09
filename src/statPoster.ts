import { Client } from "discord.js";
import AutoPoster from "topgg-autoposter";
import logger from "./utils/logger";

export default function statPoster(client: Client) {
  const topGgPost = AutoPoster(process.env["TOP_GG_TOKEN"], client);

  topGgPost.on("posted", () => logger.debug("Posted top.gg stats"));
  topGgPost.on("error", (error) =>
    logger.debug("Failed to post top.gg stats", error)
  );
}
