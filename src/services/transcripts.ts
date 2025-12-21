import Service from ".";

export default class TranscriptService extends Service {
  constructor() {
    super("Transcript Server", {
      baseUrl: process.env.TRANSCRIPT_SERVER_URL,
      auth: process.env.TRANSCRIPT_SERVER_PASS,
      ping: {
        path: "ping",
      },
    });
  }

  public async create(transcriptId: string, guildId: string, raised: boolean) {
    super.run({
      method: "POST",
      path: "create",
      body: { transcriptId, guildId, raised },
    });
  }

  public async write(
    transcriptId: string,
    messageAuthorId: string,
    messageAuthorName: string,
    messageId: string,
    messageContent: string,
    messageCreated: Date,
    attachments: { filename: string; size: string; url: string }[]
  ) {
    super.run({
      method: "POST",
      path: `write/${transcriptId}`,
      body: {
        messageAuthorId,
        messageAuthorName,
        messageId,
        messageContent,
        messageCreated,
        attachments,
      },
    });
  }

  public async systemMessage(transcriptId: string, message: string) {
    super.run({
      method: "POST",
      path: `system/${transcriptId}`,
      body: {
        message,
      },
    });
  }

  public async raise(transcriptId: string, status: "0" | "1") {
    super.run({
      method: "POST",
      path: `raise/${transcriptId}/${status}`,
      body: {},
    });
  }

  public async event(
    transcriptId: string,
    type: "reply" | "edit" | "delete",
    messageId: string,
    content?: string,
    actor?: string
  ) {
    super.run({
      method: "POST",
      path: `event/${transcriptId}`,
      body: {
        type,
        messageId,
        messageContentNew: content,
        actor,
      },
    });
  }

  /**
   * Not really too much point in this cause you wont be able to see your edits if it is delayed
   * @param guildId
   * @param transcriptId
   * @param action
   * @param name
   */
  public async tag(guildId: string, transcriptId: string, action: "add" | "remove", name: string) {
    super.run({
      method: "POST",
      path: `tag/${action}/${guildId}/${transcriptId}/${name}`,
      body: {},
    });
  }

  public async complete(
    transcriptId: string,
    metadata: {
      openedAt: Date;
      openedBy: string;

      closedAt: Date;
      closedBy: string;
      closeReason: string;
    }
  ) {
    super.run({
      method: "POST",
      path: `complete/${transcriptId}`,
      body: {
        ...metadata,
      },
    });
  }
}
