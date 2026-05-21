export const role = ["contributor", "maintainer"] as const;

export type Role = (typeof role)[number];
