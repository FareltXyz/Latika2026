"use client";

import { CheckCircle2, LoaderCircle, Pencil, Save, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/types";

type ApiResponse = {
  error?: string;
};

async function readApiResponse(response: Response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ApiResponse;
  } catch {
    return {};
  }
}

export function QuestionEditor({
  quizId,
  question,
  canEdit,
  onSaved,
}: {
  quizId: string;
  question: Question;
  canEdit: boolean;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [options, setOptions] = useState(() => [...question.options]);
  const [correctIndex, setCorrectIndex] = useState(question.correct_index ?? 0);
  const [explanation, setExplanation] = useState(question.explanation ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setPrompt(question.prompt);
    setOptions([...question.options]);
    setCorrectIndex(question.correct_index ?? 0);
    setExplanation(question.explanation ?? "");
    setError("");
    setEditing(true);
  }

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  async function saveQuestion() {
    if (prompt.trim().length < 3 || options.some((option) => !option.trim())) {
      setError("Pertanyaan dan seluruh pilihan jawaban wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/quizzes/${quizId}/questions/${question.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            prompt: prompt.trim(),
            options: options.map((option) => option.trim()),
            correctIndex,
            explanation: explanation.trim(),
          }),
        },
      );
      const result = await readApiResponse(response);
      if (!response.ok) {
        throw new Error(result.error ?? "Soal gagal disimpan.");
      }
      await onSaved();
      setEditing(false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Soal gagal disimpan.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <article className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Edit soal {question.position + 1}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Pilih lingkaran pada jawaban yang benar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={saving}
            aria-label="Batalkan edit soal"
            className="flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:text-neutral-900 disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <label className="mt-4 block text-xs font-bold text-neutral-700">
          Pertanyaan
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={500}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm font-medium leading-relaxed outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <fieldset className="mt-4 space-y-2">
          <legend className="text-xs font-bold text-neutral-700">
            Pilihan dan kunci jawaban
          </legend>
          {options.map((option, index) => (
            <label
              key={String.fromCharCode(65 + index)}
              className={`flex items-center gap-3 rounded-xl border p-2.5 transition ${
                correctIndex === index
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <input
                type="radio"
                name={`correct-answer-${question.id}`}
                checked={correctIndex === index}
                onChange={() => setCorrectIndex(index)}
                className="size-4 accent-emerald-600"
              />
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-black text-neutral-600">
                {String.fromCharCode(65 + index)}
              </span>
              <input
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                maxLength={240}
                aria-label={`Pilihan ${String.fromCharCode(65 + index)}`}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-800 outline-none"
              />
              {correctIndex === index && (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              )}
            </label>
          ))}
        </fieldset>

        <label className="mt-4 block text-xs font-bold text-neutral-700">
          Pembahasan
          <textarea
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            maxLength={500}
            rows={2}
            className="mt-2 w-full resize-y rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(false)}
            disabled={saving}
            className="rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => void saveQuestion()}
            disabled={saving}
            className="rounded-xl bg-orange-600 font-bold text-white hover:bg-orange-700"
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Simpan
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
      <div className="flex items-start gap-3">
        <details className="group min-w-0 flex-1 open:bg-white">
          <summary className="cursor-pointer list-none pr-3 text-sm font-bold leading-relaxed text-neutral-900">
            <span className="mr-2 text-orange-600">
              {question.position + 1}.
            </span>
            {question.prompt}
          </summary>
          <div className="mt-4 space-y-2">
            {question.options.map((option, index) => (
              <p
                key={`${index}-${option}`}
                className={`rounded-lg px-3 py-2 text-sm ${
                  index === question.correct_index
                    ? "bg-emerald-50 font-semibold text-emerald-800"
                    : "bg-white text-neutral-600"
                }`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </p>
            ))}
            <p className="pt-2 text-xs leading-relaxed text-neutral-500">
              {question.explanation || "Belum ada pembahasan."}
            </p>
          </div>
        </details>
        {canEdit && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-50"
          >
            <Pencil className="size-3.5" /> Edit
          </button>
        )}
      </div>
    </article>
  );
}
