export const role = ["contributor", "maintainer"] as const;

export type Role = (typeof role)[number];

export type User = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type Issue = {
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
};

export type IssueQuery = {
  sort: string;
  type?: string;
  status?: string;
};
