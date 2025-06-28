import { green, yellow, red, cyan, gray } from "colorette";
import { formatDate } from "./formatters/date";

export type LogLocation =
  | "Database"
  | "Startup"
  | "Handlers"
  | "Transcripts"
  | "API"
  | "Webhooks"
  | "Tickets"
  | "Scheduler"
  | "Commands"
  | "System"
  | "Redis"
  | "Buttons"
  | "Modals"
  | "Select Menus"
  | "Hooks"
  | (string & {});

export const logger = (
  location: LogLocation,
  type: "Info" | "Warn" | "Error",
  ...content: string[]
) => {
  const padType = (str: string, width: number) => {
    if (str.length >= width) return str;
    const totalPadding = width - str.length;
    const left = Math.floor(totalPadding / 2);
    const right = totalPadding - left;
    return " ".repeat(left) + str + " ".repeat(right);
  };

  const typeColor = {
    Info: green,
    Warn: yellow,
    Error: red,
  };

  const coloredType = typeColor[type](padType(`${location} - ${type}`, 21));

  console.log(
    gray("["),
    cyan(formatDate(new Date(), "DD-MM-YY HH:mm:ss")),
    gray("]"),
    `${gray("[")}${coloredType}${gray("]")}`,
    ...content
  );
};
