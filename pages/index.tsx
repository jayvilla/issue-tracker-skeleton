/*
 * Issue Tracker - Main List Page
 *
 * This page demonstrates:
 * - Fetching data with SWR hooks
 * - Filtering data client-side and server-side
 * - Creating new resources via API
 * - Revalidating SWR cache after mutations
 *
 * TODO Exercises (search for ISSUE_TRACKER_TODO_*):
 * - ISSUE_TRACKER_TODO_1: Optimistic UI updates (update cache before server responds)
 * - ISSUE_TRACKER_TODO_4: Client-side form validation with inline error messages
 * - ISSUE_TRACKER_TODO_5: Empty state UI when no issues exist
 * - ISSUE_TRACKER_TODO_6: Extract issue list item into reusable component
 * - ISSUE_TRACKER_TODO_3: Error state UI and retry button (see useIssues hook)
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useIssues, Issue } from "@/lib/swr/useIssues";
import { IssueStatus } from "@/lib/types";

type StatusFilter = "all" | IssueStatus;

export default function Home() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter status for API call (send undefined for "all")
  const apiStatusFilter = statusFilter === "all" ? undefined : statusFilter;
  const { issues, isLoading, isError, mutate } = useIssues(apiStatusFilter);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      // Reset form
      setTitle("");
      setDescription("");

      // Revalidate the issues list
      // ISSUE_TRACKER_TODO_1: Implement optimistic UI update here
      // Instead of waiting for revalidation, optimistically add the new issue
      // to the cache using mutate() with the optimistic data
      await mutate();
    } catch (error) {
      console.error("Error creating issue:", error);
      // ISSUE_TRACKER_TODO_4: Display error message to user here
      // Show inline error message below the form
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">
          Issue Tracker
        </h1>

        {/* New Issue Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-4">
            Create New Issue
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                // ISSUE_TRACKER_TODO_4: Add client-side validation here
                // Validate that title is not empty and has reasonable length
                // Show inline error messages for validation failures
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                // ISSUE_TRACKER_TODO_4: Add client-side validation here
                // Validate description length and show inline error messages
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Issue"}
            </button>
          </form>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          {(["all", "OPEN", "IN_PROGRESS", "DONE"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-md ${
                  statusFilter === status
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </button>
            )
          )}
        </div>

        {/* Issues List */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              Error loading issues. Please try again.
            </p>
            {/* ISSUE_TRACKER_TODO_3: Add retry button here */}
            {/* Add a button that calls mutate() to retry fetching */}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            Loading issues...
          </div>
        )}

        {!isLoading && !isError && issues.length === 0 && (
          // ISSUE_TRACKER_TODO_5: Improve empty state UI here
          // Add a more polished empty state with icon/message suggesting to create first issue
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            No issues found.
          </div>
        )}

        {!isLoading && !isError && issues.length > 0 && (
          <div className="space-y-4">
            {issues.map((issue: Issue) => (
              // ISSUE_TRACKER_TODO_6: Extract this into a reusable IssueListItem component
              // Create lib/components/IssueListItem.tsx with proper TypeScript types
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                      {issue.description}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      Created: {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      issue.status === "OPEN"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : issue.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                    }`}
                  >
                    {issue.status.replace("_", " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
