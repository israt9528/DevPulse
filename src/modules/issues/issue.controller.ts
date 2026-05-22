import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    // if (!req.user) {
    //   sendResponse(res, {
    //     statusCode: 401,
    //     success: false,
    //     message: "Unauthorized access",
    //   });
    // }
    const id = req.user?.id;

    const result = await issueService.createIssueIntoDB(req.body, id);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "issue created successfully",
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

export const issueController = {
  createIssue,
};
