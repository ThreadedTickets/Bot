import { Client } from "discord.js";
import { Application, ApplicationQuestion } from "../../types/Application";
import { runHooks } from "../hooks";

export async function handleApplicationSubmit(
  application: Application,
  responses: {
    applicationId: string;
    startTime: Date;
    server: string;
    questionNumber: number;
    questions: ApplicationQuestion[];

    responses: { question: string; response: string }[];
  },
  owner: string,
  client: Client
) {
  await runHooks("ApplicationEnd", { application, client, responses, owner });
}
