"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function BusinessImportForm() {
  const router = useRouter();

  const [mode, setMode] = useState<"append" | "replace">("append");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!file) {
      setErrorMessage("Bitte wähle zuerst eine CSV-Datei aus.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);

      const response = await fetch("/api/admin/businesses/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Die CSV-Datei konnte nicht importiert werden."
        );
      }

      setMessage(
  `${data.message} Backup erstellt: ${data.backupFileName}. Gesamt: ${data.summary.totalRows}, gültig: ${data.summary.validRows}, Fehler: ${data.summary.errorCount}, Warnungen: ${data.summary.warningCount}.`
);

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Die CSV-Datei konnte nicht importiert werden."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="space-y-6">
        <div>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              CSV-Datei auswählen
            </span>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </label>

          <p className="mt-2 text-sm text-slate-500">
            Die CSV muss die gleiche Kopfzeile haben wie{" "}
            <code>data/businesses.csv</code>.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-700">
            Importmodus
          </legend>

          <label className="flex gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="radio"
              name="mode"
              value="append"
              checked={mode === "append"}
              onChange={() => setMode("append")}
            />

            <span>
              <span className="block font-semibold text-slate-900">
                Anhängen
              </span>
              <span className="block text-sm text-slate-500">
                Neue Einträge werden unten an die bestehende CSV angefügt.
              </span>
            </span>
          </label>

          <label className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <input
              type="radio"
              name="mode"
              value="replace"
              checked={mode === "replace"}
              onChange={() => setMode("replace")}
            />

            <span>
              <span className="block font-semibold text-red-900">
                Ersetzen
              </span>
              <span className="block text-sm text-red-700">
                Die bestehende CSV wird vollständig überschrieben.
              </span>
            </span>
          </label>
        </fieldset>

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isUploading}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Importiere..." : "CSV importieren"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/datencheck")}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
          >
            Zurück zum Datencheck
          </button>
        </div>
      </div>
    </form>
  );
}