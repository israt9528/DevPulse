import bcrypt from "bcryptjs";
import type { User } from "../../types";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUser = async (payload: User) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
       INSERT INTO users(name,email,password,role) 
       VALUES($1,$2,$3,COALESCE($4,'contributor'))
       RETURNING *
        `,
    [name, email, hashPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

const validateUser = async (email: string, password: string) => {
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
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
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, config.secret, { expiresIn: "1d" });
  return { token };
};

export const authService = {
  createUser,
};
