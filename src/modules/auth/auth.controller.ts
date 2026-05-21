import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utility/sendResponse";

const signup = async (req: Request, res: Response) => {
  try {
    const result = await authService.createUser(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: result.rows[0],
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signup,
};
