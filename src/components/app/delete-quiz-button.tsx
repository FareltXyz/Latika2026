"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteQuizButton({
  quizId,
  quizTitle,
}: {
  quizId: string;
  quizTitle: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteQuiz() {
    const confirmed = window.confirm(
      `Hapus kuis “${quizTitle}” beserta hasil pesertanya? Tindakan ini tidak dapat dibatalkan.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const raw = await response.text();
      let result: { error?: string } = {};
      if (raw) {
        try {
          result = JSON.parse(raw) as { error?: string };
        } catch {
          result = {};
        }
      }

      if (!response.ok) {
        throw new Error(result.error ?? "Kuis gagal dihapus.");
      }
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Kuis gagal dihapus.",
      );
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={deleteQuiz}
        disabled={deleting}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
      >
        {deleting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Hapus
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
