import useSWR from "swr";
import { IssueStatus } from "@/lib/types";

export type Issue = {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
};

type IssuesResponse = {
  issues: Issue[];
};

type ErrorResponse = {
  error: string;
};

const fetcher = async (url: string): Promise<IssuesResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.error || "Failed to fetch issues");
  }
  return res.json();
};

export function useIssues(status?: string) {
  const queryParam = status ? `?status=${status}` : "";
  const { data, error, isLoading, mutate } = useSWR<IssuesResponse>(
    `/api/issues${queryParam}`,
    fetcher,
    {
      // ISSUE_TRACKER_TODO_3: Configure error retry logic here
      // Add onErrorRetry callback to customize retry behavior (e.g., don't retry on 404)
      // Consider adding revalidateOnFocus and revalidateOnReconnect options
    },
  );

  return {
    issues: data?.issues || [],
    isLoading,
    isError: error,
    mutate,
  };
}