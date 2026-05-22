import { pool } from "../../db";
import type { Issue, IssueQuery } from "../../types";
import sendResponse from "../../utility/sendResponse";

const createIssueIntoDB = async (payload: Issue, id: number) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
     INSERT INTO issues(title,description,type,status,reporter_id) 
       VALUES($1,$2,$3,COALESCE($4,'open'),$5)
       RETURNING *
    `,
    [title, description, type, status, id],
  );

  return result;
};

const getAllIssuesFromDB = async ({ sort, type, status }: IssueQuery) => {
  let query = `
    SELECT 
      issues.id,
      issues.title,
      issues.description,
      issues.type,
      issues.status,

      users.id AS reporter_id,
      users.name AS reporter_name,
      users.role AS reporter_role,

      issues.created_at,
      issues.updated_at

    FROM issues
    JOIN users
    ON issues.reporter_id = users.id
  `;
  const values: string[] = [];
  const conditions: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  // Sorting
  query += ` ORDER BY created_at ${sort === "newest" ? "DESC" : "ASC"}`;

  const result = await pool.query(query, values);

  const formattedData = result.rows.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter: {
      id: issue.reporter_id,
      name: issue.reporter_name,
      role: issue.reporter_role,
    },

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return formattedData;
};

const getSingleIssueFromDB = async (id: string) => {
  const issueData = await pool.query(
    `
       SELECT
      issues.id,
      issues.title,
      issues.description,
      issues.type,
      issues.status,

      users.id AS reporter_id,
      users.name AS reporter_name,
      users.role AS reporter_role,

      issues.created_at,
      issues.updated_at

    FROM issues

    JOIN users
    ON issues.reporter_id = users.id

    WHERE issues.id = $1
        `,
    [id],
  );

  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!");
  }

  const issue = issueData.rows[0];

  const result = {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,

    reporter: {
      id: issue.reporter_id,
      name: issue.reporter_name,
      role: issue.reporter_role,
    },

    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };

  return result;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
};
