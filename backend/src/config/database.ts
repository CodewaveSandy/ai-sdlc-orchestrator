import mongoose from "mongoose";

import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB");

    if (error instanceof Error) {
      console.error(error.message);
    }

    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();

  console.log("MongoDB disconnected");
};

