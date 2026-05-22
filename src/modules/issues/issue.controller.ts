import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import type { IssueQuery } from "../../types";

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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    // const { sort = "newest", type, status } = req.query;

    const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";

    const type =
      typeof req.query.type === "string" ? req.query.type : undefined;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    // Allowed values
    const sortOptions = ["newest", "oldest"];
    const typeOptions = ["bug", "feature_request"];
    const statusOptions = ["open", "in_progress", "resolved"];

    // Validation
    if (!sortOptions.includes(sort)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid sort value",
      });
    }

    if (type && !typeOptions.includes(type)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type value",
      });
    }

    if (status && !statusOptions.includes(status)) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status value",
      });
    }

    const query: IssueQuery = { sort };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const result = await issueService.getAllIssuesFromDB(query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
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

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await issueService.getSingleIssueFromDB(id as string);
    // console.log(result);

    sendResponse(res, {
      statusCode: 200,
      success: true,
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

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
};
