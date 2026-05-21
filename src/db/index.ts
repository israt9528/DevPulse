import { Pool } from "pg";
import config from "../config";
import { createSchema } from "./schema";

export const pool = new Pool({
  connectionString: config.database_url,
});

export const initDB = async () => {
  createSchema();
  console.log("Database connected successfully");
};
