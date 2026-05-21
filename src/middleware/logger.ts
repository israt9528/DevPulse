import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import { blue, green, italic } from "kleur/colors";

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log(
    `[${green(new Date().toLocaleString())}]`,
    italic(req.method),
    blue(req.url),
  );
  const log = `\nMethod -> ${req.method} - Time -> [${new Date().toLocaleString()}] - URL -> ${req.url}\n`;

  fs.appendFile("logger.txt", log, (err) => {});
  next();
};

export default logger;
