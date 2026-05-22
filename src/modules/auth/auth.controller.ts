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
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.validateUser(email, password);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Login Successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signup,
  login,
};
