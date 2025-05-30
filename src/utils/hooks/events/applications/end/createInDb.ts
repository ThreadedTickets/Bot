import { Client } from "discord.js";
import { registerHook, runHooks } from "../../..";
import { CompletedApplicationSchema } from "../../../../../database/modals/CompletedApplications";
import {
  Application,
  ApplicationQuestion,
} from "../../../../../types/Application";
import { generateId } from "../../../../database/generateId";
import { invalidateCache } from "../../../../database/invalidateCache";

registerHook(
  "ApplicationEnd",
  async ({
    application,
    responses,
    owner,
    client,
  }: {
    application: Application;
    responses: {
      applicationId: string;
      startTime: Date;
      server: string;
      questionNumber: number;
      questions: ApplicationQuestion[];

      responses: { question: string; response: string }[];
    };
    owner: string;
    client: Client;
  }) => {
    const id = generateId("CA");
    await CompletedApplicationSchema.create({
      _id: id,
      application: application._id,
      createdAt: new Date(),
      owner: owner,
      responses: responses.responses,
    });

    invalidateCache(`runningApplications:${owner}`);
    invalidateCache(`completedApps:${application._id}:${owner}:all`);
    invalidateCache(`completedApps:${application._id}:Pending`);

    runHooks("ApplicationFinal", { application, responses, owner, client, id });
  },
  10
);
