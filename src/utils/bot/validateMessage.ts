type Message = {
  content: string;
  embeds: any[];
  attachments: any[];
  components: any[];
};

type ValidationError = {
  type: string;
  message: string;
};

export function validateDiscordMessage(message: Message): ValidationError[] {
  const errors: ValidationError[] = [];

  // Content validation
  if (
    !message.content &&
    message.embeds.length === 0 &&
    message.attachments.length === 0
  ) {
    errors.push({
      type: "content",
      message: "Message must contain content, an embed, or an attachment.",
    });
  }

  if (message.content.length > 2000) {
    errors.push({
      type: "content",
      message: `Message content exceeds 2000 characters (${message.content.length}).`,
    });
  }

  // Embed validation
  if (message.embeds.length > 10) {
    errors.push({
      type: "embed",
      message: "Cannot include more than 10 embeds in a single message.",
    });
  }

  for (let i = 0; i < message.embeds.length; i++) {
    const embed = message.embeds[i];
    const indexLabel = `Embed #${i + 1}`;

    if (embed.title && embed.title.length > 256) {
      errors.push({
        type: "embed",
        message: `${indexLabel} title exceeds 256 characters.`,
      });
    }

    if (embed.description && embed.description.length > 4096) {
      errors.push({
        type: "embed",
        message: `${indexLabel} description exceeds 4096 characters.`,
      });
    }

    if (embed.fields?.length > 25) {
      errors.push({
        type: "embed",
        message: `${indexLabel} has more than 25 fields.`,
      });
    }

    embed.fields?.forEach((field: any, j: number) => {
      if (field.name.length > 256 || field.value.length > 1024) {
        errors.push({
          type: "embed",
          message: `${indexLabel} field #${
            j + 1
          } has a name or value that is too long.`,
        });
      }
    });

    if (embed.footer?.text?.length > 2048) {
      errors.push({
        type: "embed",
        message: `${indexLabel} footer text exceeds 2048 characters.`,
      });
    }

    if (embed.author?.name?.length > 256) {
      errors.push({
        type: "embed",
        message: `${indexLabel} author name exceeds 256 characters.`,
      });
    }
  }

  // Attachment validation
  if (message.attachments.length > 10) {
    errors.push({
      type: "attachment",
      message: "Cannot include more than 10 attachments in a message.",
    });
  }

  // Components validation could be added here if you use buttons, selects, etc.

  return errors;
}
