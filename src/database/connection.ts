import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectToMongooseDatabase = async () => {
  if (!process.env["MONGOOSE_URI"]) {
    logger("Database", "Error", "To connect to the database you must provide a connection URI, username and password");
    process.exit(1);
  }

  try {
    const databaseClient = await mongoose.connect(process.env["MONGOOSE_URI"] ?? "");
    databaseClient.connection.useDb("ThreadedTs");

    logger("Database", "Info", `Connected to the database ${databaseClient.connection.db?.namespace} successfully`);
  } catch (err) {
    logger("Database", "Error", "Failed to connect to database:", err as string);
    process.exit(1);
  }
};
