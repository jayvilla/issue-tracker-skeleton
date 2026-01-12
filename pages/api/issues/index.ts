import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { IssueStatus } from "@/lib/types";

type ErrorResponse = {
  error: string;
};

type IssueResponse = {
  issue: {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    createdAt: Date;
    updatedAt: Date;
  };
};

type IssuesResponse = {
  issues: IssueResponse["issue"][];
};

type CreateIssueRequest = {
  title: string;
  description: string;
  status?: IssueStatus;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IssuesResponse | IssueResponse | ErrorResponse>,
) {
  if (req.method === "GET") {
    try {
      const status = req.query.status as string | undefined;

      const where = status
        ? { status: status.toUpperCase() as IssueStatus }
        : undefined;

      const issues = await prisma.issue.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({ issues });
    } catch (error) {
      console.error("Error fetching issues:", error);
      return res.status(500).json({ error: "Failed to fetch issues" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body as CreateIssueRequest;

      if (!body.title || !body.description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const issue = await prisma.issue.create({
        data: {
          title: body.title,
          description: body.description,
          status: body.status || IssueStatus.OPEN,
        },
      });

      return res.status(201).json({ issue });
    } catch (error) {
      console.error("Error creating issue:", error);
      return res.status(500).json({ error: "Failed to create issue" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}