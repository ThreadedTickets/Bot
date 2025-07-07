type Message = {
  content?: string;
  embeds?: any[];
  attachments?: any[];
  components?: any[];
  flags?: number;
};

type ValidationError = {
  type: string;
  message: string;
};

const INTERACTIVE_COMPONENT_TYPES = [2, 3, 5, 6, 7, 8, 9, 10, 11]; // Components requiring custom_id

export function validateDiscordMessage(message: Message): ValidationError[] {
  const errors: ValidationError[] = [];
  const isV2 = message.components?.some((c) => c.type === 17);

  // === Content & Embed Validation ===
  if (isV2) {
    if (message.content) {
      errors.push({
        type: "structure",
        message: "V2 messages cannot contain content.",
      });
    }
    if (message.embeds?.length) {
      errors.push({
        type: "structure",
        message: "V2 messages cannot contain embeds.",
      });
    }
  } else {
    if (
      !message.content &&
      (!message.embeds || message.embeds.length === 0) &&
      (!message.attachments || message.attachments.length === 0)
    ) {
      errors.push({
        type: "content",
        message: "V1 message must contain content, an embed, or an attachment.",
      });
    }

    if (message.content?.length > 2000) {
      errors.push({
        type: "content",
        message: `Message content exceeds 2000 characters (${message.content.length}).`,
      });
    }

    if (message.embeds?.length > 10) {
      errors.push({
        type: "embed",
        message: "Cannot include more than 10 embeds in a single message.",
      });
    }

    message.embeds?.forEach((embed, i) => {
      const label = `Embed #${i + 1}`;
      if (embed.title?.length > 256)
        errors.push({
          type: "embed",
          message: `${label} title exceeds 256 characters.`,
        });
      if (embed.description?.length > 4096)
        errors.push({
          type: "embed",
          message: `${label} description exceeds 4096 characters.`,
        });
      if (embed.fields?.length > 25)
        errors.push({
          type: "embed",
          message: `${label} has more than 25 fields.`,
        });

      embed.fields?.forEach((field: any, j: number) => {
        if (field.name.length > 256 || field.value.length > 1024) {
          errors.push({
            type: "embed",
            message: `${label} field #${
              j + 1
            } has a name or value that is too long.`,
          });
        }
      });

      if (embed.footer?.text?.length > 2048)
        errors.push({
          type: "embed",
          message: `${label} footer text exceeds 2048 characters.`,
        });

      if (embed.author?.name?.length > 256)
        errors.push({
          type: "embed",
          message: `${label} author name exceeds 256 characters.`,
        });
    });
  }

  // === Attachments ===
  if (message.attachments?.length > 10) {
    errors.push({
      type: "attachment",
      message: "Cannot include more than 10 attachments in a message.",
    });
  }

  // === Components ===
  if (!message.components) return errors;

  const usedCustomIds = new Set<string>();

  if (isV2) {
    if (message.components.length > 5) {
      errors.push({
        type: "components",
        message: "V2: Cannot include more than 5 container components.",
      });
    }

    const validateV2Component = (
      component: any,
      path: string = "component"
    ) => {
      const {
        type,
        custom_id,
        children,
        options,
        label,
        placeholder,
        min_values,
        max_values,
      } = component;

      if (INTERACTIVE_COMPONENT_TYPES.includes(type)) {
        if (!custom_id || typeof custom_id !== "string") {
          errors.push({
            type: "components",
            message: `${path} is missing a valid custom_id.`,
          });
        } else if (usedCustomIds.has(custom_id)) {
          errors.push({
            type: "components",
            message: `${path} has a duplicate custom_id.`,
          });
        } else {
          usedCustomIds.add(custom_id);
        }
      }

      if (label && label.length > 80) {
        errors.push({
          type: "components",
          message: `${path} label exceeds 80 characters.`,
        });
      }

      if (placeholder && placeholder.length > 150) {
        errors.push({
          type: "components",
          message: `${path} placeholder exceeds 150 characters.`,
        });
      }

      if (options?.length > 25) {
        errors.push({
          type: "components",
          message: `${path} has more than 25 select options.`,
        });
      }

      if (
        (min_values !== undefined && (min_values < 0 || min_values > 25)) ||
        (max_values !== undefined && (max_values < 1 || max_values > 25))
      ) {
        errors.push({
          type: "components",
          message: `${path} has invalid min/max values. Must be between 0–25.`,
        });
      }

      if (children?.length) {
        if (children.length > 25) {
          errors.push({
            type: "components",
            message: `${path} has more than 25 children.`,
          });
        }

        children.forEach((child: any, index: number) =>
          validateV2Component(child, `${path}.children[${index}]`)
        );
      }
    };

    message.components.forEach((container, i) => {
      if (container.type !== 17) {
        errors.push({
          type: "components",
          message: `V2: Top-level component #${
            i + 1
          } is not a container (type 17).`,
        });
        return;
      }
      validateV2Component(container, `container[${i}]`);
    });
  } else {
    if (message.components.length > 5) {
      errors.push({
        type: "components",
        message: "V1: Cannot include more than 5 action rows.",
      });
    }

    message.components.forEach((row: any, i: number) => {
      if (row.type !== 1 || !Array.isArray(row.components)) {
        errors.push({
          type: "components",
          message: `V1: Action row #${i + 1} is invalid.`,
        });
        return;
      }

      if (row.components.length > 5) {
        errors.push({
          type: "components",
          message: `V1: Action row #${i + 1} has more than 5 components.`,
        });
      }

      row.components.forEach((component: any, j: number) => {
        const {
          type,
          custom_id,
          label,
          placeholder,
          options,
          min_values,
          max_values,
        } = component;
        const labelStr = `row[${i}].component[${j}]`;

        if (typeof type !== "number" || type < 2 || type > 11) {
          errors.push({
            type: "components",
            message: `V1: ${labelStr} has invalid type.`,
          });
        }

        if (INTERACTIVE_COMPONENT_TYPES.includes(type)) {
          if (!custom_id || typeof custom_id !== "string") {
            errors.push({
              type: "components",
              message: `V1: ${labelStr} is missing a valid custom_id.`,
            });
          } else if (usedCustomIds.has(custom_id)) {
            errors.push({
              type: "components",
              message: `V1: ${labelStr} has a duplicate custom_id.`,
            });
          } else {
            usedCustomIds.add(custom_id);
          }
        }

        if (label && label.length > 80) {
          errors.push({
            type: "components",
            message: `V1: ${labelStr} label exceeds 80 characters.`,
          });
        }

        if (placeholder && placeholder.length > 150) {
          errors.push({
            type: "components",
            message: `V1: ${labelStr} placeholder exceeds 150 characters.`,
          });
        }

        if (options?.length > 25) {
          errors.push({
            type: "components",
            message: `V1: ${labelStr} has more than 25 options.`,
          });
        }

        if (
          (min_values !== undefined && (min_values < 0 || min_values > 25)) ||
          (max_values !== undefined && (max_values < 1 || max_values > 25))
        ) {
          errors.push({
            type: "components",
            message: `V1: ${labelStr} has invalid min/max values.`,
          });
        }
      });
    });
  }

  return errors;
}
