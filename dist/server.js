
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/middleware/logger.ts
import fs from "fs";
import { blue, green, italic } from "kleur/colors";
var logger = (req, res, next) => {
  console.log(
    `[${green((/* @__PURE__ */ new Date()).toLocaleString())}]`,
    italic(req.method),
    blue(req.url)
  );
  const log = `
Method -> ${req.method} - Time -> [${(/* @__PURE__ */ new Date()).toLocaleString()}] - URL -> ${req.url}
`;
  fs.appendFile("logger.txt", log, (err) => {
  });
  next();
};
var logger_default = logger;

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
import { env } from "process";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
  quiet: true
});
var config = {
  port: env.PORT,
  database_url: env.DATABASE_URL,
  node_env: env.NODE_ENV,
  secret: env.SECRET
};
var config_default = config;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
    stack: config_default.node_env === "development" && err instanceof Error ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/db/schema.ts
var createSchema = async () => {
  await pool.query(`
       CREATE TABLE IF NOT EXISTS users(
       id SERIAL PRIMARY KEY,

       name VARCHAR(100) NOT NULL,

       email VARCHAR(255) UNIQUE NOT NULL,

       password TEXT NOT NULL,

       role VARCHAR(25) NOT NULL DEFAULT 'contributor'
       CHECK (role IN ('contributor', 'maintainer')),

       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
       ) 
        `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
       id SERIAL PRIMARY KEY,

       title VARCHAR(150) NOT NULL,

       description TEXT NOT NULL CHECK (LENGTH(description) >= 20),

       type VARCHAR(20) NOT NULL
       CHECK (type IN ('bug','feature_request')),

       status VARCHAR(20) NOT NULL DEFAULT 'open'
       CHECK (status IN ('open', 'in_progress', 'resolved')),

       reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

       created_at TIMESTAMP NOT NULL DEFAULT NOW(),
       updated_at TIMESTAMP NOT NULL DEFAULT NOW()
       ) 
            `);
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.database_url
});
var initDB = async () => {
  createSchema();
  console.log("Database connected successfully");
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var createUser = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
       INSERT INTO users(name,email,password,role) 
       VALUES($1,$2,$3,COALESCE($4,'contributor'))
       RETURNING *
        `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var validateUser = async (email, password) => {
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credential!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Incorrect password! Try again");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  delete user.password;
  return { token, user };
};
var authService = {
  createUser,
  validateUser
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var signup = async (req, res) => {
  try {
    const result = await authService.createUser(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.validateUser(email, password);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login Successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  signup,
  login
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signup);
router.post("/login", authController.login);
var authRoute = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
import "bcryptjs";
var createIssueIntoDB = async (payload, id) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
     INSERT INTO issues(title,description,type,status,reporter_id) 
       VALUES($1,$2,$3,COALESCE($4,'open'),$5)
       RETURNING *
    `,
    [title, description, type, status, id]
  );
  return result;
};
var getAllIssuesFromDB = async ({ sort, type, status }) => {
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
  const values = [];
  const conditions = [];
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
      role: issue.reporter_role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return formattedData;
};
var getSingleIssueFromDB = async (id) => {
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
    [id]
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
      role: issue.reporter_role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
  return result;
};
var updateIssueIntoDB = async (id, user, payload) => {
  const issueResult = await pool.query(
    `
        SELECT * FROM issues WHERE id=$1
        `,
    [id]
  );
  if (issueResult.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const issue = issueResult.rows[0];
  const userResult = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [user.email]
  );
  const dbUser = userResult.rows[0];
  const isMaintainer = dbUser.role === "maintainer";
  const isContributor = dbUser.role === "contributor";
  if (isContributor) {
    if (issue.reporter_id !== dbUser.id) {
      throw new Error("You can only update your own issue");
    }
    if (issue.status !== "open") {
      throw new Error("You can only update open issues");
    }
  }
  const { title, description, type } = payload;
  const result = await pool.query(
    `
        UPDATE issues
        SET 
        title=COALESCE($1,title),
        description=COALESCE($2,description),
        type=COALESCE($3,type),
        updated_at=NOW()

        WHERE id=$4
        RETURNING *
        `,
    [title, description, type, id]
  );
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1
        `,
    [id]
  );
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const id = req.user?.id;
    const result = await issueService.createIssueIntoDB(req.body, id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";
    const type = typeof req.query.type === "string" ? req.query.type : void 0;
    const status = typeof req.query.status === "string" ? req.query.status : void 0;
    const sortOptions = ["newest", "oldest"];
    const typeOptions = ["bug", "feature_request"];
    const statusOptions = ["open", "in_progress", "resolved"];
    if (!sortOptions.includes(sort)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid sort value"
      });
    }
    if (type && !typeOptions.includes(type)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid type value"
      });
    }
    if (status && !statusOptions.includes(status)) {
      return sendResponse_default(res, {
        statusCode: 400,
        success: false,
        message: "Invalid status value"
      });
    }
    const query = { sort };
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    const result = await issueService.getAllIssuesFromDB(query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await issueService.updateIssueIntoDB(
      id,
      user,
      payload
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "Token is missing"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      if (!decoded) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access"
        });
      }
      const userData = await pool.query(
        `
    SELECT *FROM users WHERE email=$1
    `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found!"
        });
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!! You don't have permission."
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth("contributor", "maintainer"),
  issueController.createIssue
);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch(
  "/:id",
  auth("maintainer", "contributor"),
  issueController.updateIssue
);
router2.delete("/:id", auth("maintainer"), issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(logger_default);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "DevPulse sever is running"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`DevPulse server listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map