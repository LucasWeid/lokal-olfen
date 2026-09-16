import Link from "next/link";
import BusinessImportForm from "@/components/BusinessImportForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <section className="mx-auto max-w-4xl space-y-6">
        <header>
          <Link
            href="/admin/datencheck"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Zurück zum Datencheck
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            CSV-Import
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
            Anbieter per CSV importieren
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Lade eine vorbereitete CSV-Datei hoch, um mehrere Anbieter auf
            einmal in die Plattform zu übernehmen.
          </p>
        </header>

        <BusinessImportForm />
      </section>
    </main>
  );
}