import type { NextFunction, Request, Response } from "express";
import type { Role } from "../types";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

export const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "Token is missing",
        });
      }

      const decoded = jwt.verify(token as string, config.secret) as JwtPayload;

      if (!decoded) {
        sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access",
        });
      }

      const userData = await pool.query(
        `
    SELECT *FROM users WHERE email=$1
    `,
        [decoded.email],
      );

      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found!",
        });
      }

      const user = userData.rows[0];

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!! You don't have permission.",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
