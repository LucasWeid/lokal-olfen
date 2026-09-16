import Link from "next/link";
import BusinessCreateForm from "@/components/BusinessCreateForm";

export const dynamic = "force-dynamic";

export default function NewBusinessPage() {
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
            Neuer CSV-Eintrag
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
            Neuen Anbieter hinzufügen
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Der neue Anbieter wird als neue Zeile in{" "}
            <code>data/businesses.csv</code> gespeichert. Nach dem Speichern
            prüft der Datencheck automatisch, ob noch Fehler oder Warnungen
            vorhanden sind.
          </p>
        </header>

        <BusinessCreateForm />
      </section>
    </main>
  );
}