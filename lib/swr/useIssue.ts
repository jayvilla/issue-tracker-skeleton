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

type IssueResponse = {
  issue: Issue;
};

type ErrorResponse = {
  error: string;
};

const fetcher = async (url: string): Promise<IssueResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: ErrorResponse = await res.json();
    throw new Error(error.error || "Failed to fetch issue");
  }
  return res.json();
};

export function useIssue(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<IssueResponse>(
    id ? `/api/issues/${id}` : null,
    fetcher,
    {
      // ISSUE_TRACKER_TODO_3: Configure error retry logic here
      // Add onErrorRetry callback to customize retry behavior
      // Consider adding revalidateOnFocus and revalidateOnReconnect options
    },
  );

  return {
    issue: data?.issue,
    isLoading,
    isError: error,
    mutate,
  };
}