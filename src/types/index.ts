export const role = ["contributor", "maintainer"] as const;

export type Role = (typeof role)[number];

export type User = {
  name: string;
  email: string;
  password: string;
  role: string;
};
