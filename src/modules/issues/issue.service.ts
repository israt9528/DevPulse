import { pool } from "../../db";
import type { Issue } from "../../types";
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

const getSingleIssueFromDB = async (id: string) => {
  const issueData = await pool.query(
    `
       SELECT *FROM issues WHERE id=$1
        `,
    [id],
  );

  if (issueData.rows.length === 0) {
    throw new Error("Issue not found!");
  }

  const userData = await pool.query(
    `
    SELECT *FROM users WHERE id IN (SELECT reporter_id FROM issues)
    `,
  );
  //   console.log(userData);
  const user = userData.rows[0];

  const reporter = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  delete issueData.rows[0].reporter_id;

  const result = { ...issueData.rows[0], reporter };

  return result;
};

export const issueService = {
  createIssueIntoDB,
  getSingleIssueFromDB,
};
