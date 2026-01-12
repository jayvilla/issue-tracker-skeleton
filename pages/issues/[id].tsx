import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useIssue } from "@/lib/swr/useIssue";
import { IssueStatus } from "@/lib/types";

export default function IssueDetail() {
  const router = useRouter();
  const { id } = router.query;
  const issueId = typeof id === "string" ? id : null;

  const { issue, isLoading, isError, mutate } = useIssue(issueId);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form fields when issue loads
  useEffect(() => {
    if (issue && !isEditing) {
      setTitle(issue.title);
      setDescription(issue.description);
    }
  }, [issue, isEditing]);

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!issueId) return;

    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // ISSUE_TRACKER_TODO_2: Implement optimistic UI update here
      // Update the local cache optimistically before the server responds
      // Use mutate() with the optimistic data, then revalidate
      await mutate();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!issueId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update issue");
      }

      setIsEditing(false);
      await mutate();
    } catch (error) {
      console.error("Error updating issue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            Loading issue...
          </div>
        </div>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Error loading issue. Issue not found.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Issues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Issues
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
                  {issue.title}
                </h1>
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

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
                  Description
                </h2>
                <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                  {issue.description}
                </p>
              </div>

              <div className="mb-6 text-sm text-zinc-500 dark:text-zinc-500">
                <p>Created: {new Date(issue.createdAt).toLocaleString()}</p>
                <p>Updated: {new Date(issue.updatedAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit
                </button>

                <div className="flex gap-2">
                  <label className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md">
                    Change Status:
                  </label>
                  {(["OPEN", "IN_PROGRESS", "DONE"] as IssueStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={issue.status === status}
                        className={`px-4 py-2 rounded-md ${
                          issue.status === status
                            ? "bg-blue-600 text-white cursor-not-allowed"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="edit-title"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="edit-description"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}