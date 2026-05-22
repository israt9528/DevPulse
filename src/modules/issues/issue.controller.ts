import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import type { IssueQuery } from "../../types";
import type { JwtPayload } from "jsonwebtoken";

const createIssue = async (req: Request, res: Response) => {
  try {
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
      statusCode: 500,
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

const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await issueService.updateIssueIntoDB(
      id as string,
      user as JwtPayload,
      payload,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
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

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await issueService.deleteIssueFromDB(id as string);
    if (result.rowCount === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error,
    });
  }
};

export const issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
