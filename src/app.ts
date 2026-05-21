import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import logger from "./middleware/logger";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();

app.use(express.json());
app.use(logger);

app.get("/", (req: Request, res: Response) => {
  throw new Error("server is dying");
  //   res.status(200).json({
  //     message: "DevPulse sever is running",
  //   });
});

app.use(globalErrorHandler);

export default app;
