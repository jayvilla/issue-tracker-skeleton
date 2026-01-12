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

type UpdateIssueRequest = {
  title?: string;
  description?: string;
  status?: IssueStatus;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IssueResponse | ErrorResponse>,
) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid issue ID" });
  }

  if (req.method === "GET") {
    try {
      const issue = await prisma.issue.findUnique({
        where: { id },
      });

      if (!issue) {
        return res.status(404).json({ error: "Issue not found" });
      }

      return res.status(200).json({ issue });
    } catch (error) {
      console.error("Error fetching issue:", error);
      return res.status(500).json({ error: "Failed to fetch issue" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const body = req.body as UpdateIssueRequest;

      // Only allow updating title, description, and status
      const updateData: {
        title?: string;
        description?: string;
        status?: IssueStatus;
      } = {};

      if (body.title !== undefined) {
        updateData.title = body.title;
      }
      if (body.description !== undefined) {
        updateData.description = body.description;
      }
      if (body.status !== undefined) {
        updateData.status = body.status;
      }

      const issue = await prisma.issue.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({ issue });
    } catch (error) {
      // Handle case where issue doesn't exist
      if ((error as { code?: string }).code === "P2025") {
        return res.status(404).json({ error: "Issue not found" });
      }
      console.error("Error updating issue:", error);
      return res.status(500).json({ error: "Failed to update issue" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.issue.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      // Handle case where issue doesn't exist
      if ((error as { code?: string }).code === "P2025") {
        return res.status(404).json({ error: "Issue not found" });
      }
      console.error("Error deleting issue:", error);
      return res.status(500).json({ error: "Failed to delete issue" });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: "Method not allowed" });
}