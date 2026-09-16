import Link from "next/link";
import { notFound } from "next/navigation";
import BusinessEditForm from "@/components/BusinessEditForm";
import { getBusinessRowByLine } from "@/lib/businesses";

export const dynamic = "force-dynamic";

type EditBusinessPageProps = {
  searchParams: Promise<{
    line?: string;
  }>;
};

export default async function EditBusinessPage({
  searchParams,
}: EditBusinessPageProps) {
  const { line } = await searchParams;
  const lineNumber = Number(line);

  if (!Number.isInteger(lineNumber)) {
    notFound();
  }

  const row = getBusinessRowByLine(lineNumber);

  if (!row) {
    notFound();
  }

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
            CSV-Zeile {row.line}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
            Eintrag bearbeiten
          </h1>

          <p className="mt-4 max-w-2xl text-slate-600">
            Änderungen werden direkt in <code>data/businesses.csv</code>{" "}
            gespeichert.
          </p>
        </header>

        {row.issues.length > 0 && (
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Hinweise zu diesem Eintrag
            </h2>

            <ul className="mt-3 space-y-2 text-sm">
              {row.issues.map((issue, index) => (
                <li
                  key={`${issue.field}-${index}`}
                  className={
                    issue.type === "error"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }
                >
                  <strong>
                    {issue.type === "error" ? "Fehler" : "Warnung"}
                    {issue.field ? ` bei ${issue.field}` : ""}:
                  </strong>{" "}
                  {issue.message}
                </li>
              ))}
            </ul>
          </section>
        )}

        <BusinessEditForm line={row.line} initialValues={row.raw} />
      </section>
    </main>
  );
}