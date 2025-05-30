import { handlePrefixMessage } from "../handlers/commandHandler";
import { EventData } from "../handlers/eventHandler";
import { Event } from "../types/Event";

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  once: false,
  async execute(client, data, message) {
    handlePrefixMessage(client, data as EventData, message);
  },
};

export default event;
