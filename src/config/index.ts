import dotenv from "dotenv";
import path from "path";
import { env } from "process";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
  quiet: true,
});

const config = {
  port: env.PORT as string,
  database_url: env.DATABASE_URL as string,
  node_env: env.NODE_ENV as string,
  secret: env.SECRET as string,
};

export default config;
