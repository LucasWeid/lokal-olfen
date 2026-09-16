import Link from "next/link";
import { getBusinessData, BusinessRowStatus } from "@/lib/businesses";
import BusinessStatusActionButton from "@/components/BusinessStatusActionButton";
export const dynamic = "force-dynamic";

export default function DatencheckPage() {
  const data = getBusinessData();

  const errors = data.issues.filter((issue) => issue.type === "error");
  const warnings = data.issues.filter((issue) => issue.type === "warning");

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasIssues = data.issues.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
              Datencheck
            </h1>

            <p className="mt-4 max-w-2xl text-slate-600">
              Prüfe hier, ob die CSV-Datei korrekt eingelesen wird. Zeilen mit
              Fehlern oder Warnungen sind farblich markiert.
            </p>
          </div>

<div className="flex flex-wrap gap-3">
  <Link
    href="/admin/datencheck/neu"
    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
  >
    + Neuen Anbieter hinzufügen
  </Link>

  <Link
  href="/admin/datencheck/import"
  className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
>
  CSV importieren
</Link>

  <Link
    href="/"
    className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
  >
    Zur Karte
  </Link>

  <Link
    href="/api/businesses"
    target="_blank"
    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700"
  >
              JSON öffnen
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            label="CSV-Zeilen"
            value={data.totalRows}
            description="Gelesene Datenzeilen"
          />

          <StatCard
            label="Gültige Anbieter"
            value={data.validRows}
            description="Werden auf der Website angezeigt"
          />

          <StatCard
            label="Fehler"
            value={errors.length}
            description="Diese Einträge werden nicht geladen"
            tone={hasErrors ? "error" : "success"}
          />

          <StatCard
            label="Warnungen"
            value={warnings.length}
            description="Diese Einträge sollten geprüft werden"
            tone={hasWarnings ? "warning" : "success"}
          />
        </section>

        {!hasIssues && (
          <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-xl font-semibold text-green-900">
              Alles sieht gut aus
            </h2>

            <p className="mt-2 text-sm text-green-800">
              Es wurden keine Fehler oder Warnungen in der CSV-Datei gefunden.
            </p>
          </section>
        )}

        {hasIssues && (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-slate-900">
                Fehler und Warnungen
              </h2>

              <p className="text-sm text-slate-500">
                Hier siehst du direkt, welche CSV-Zeile und welcher Anbieter
                betroffen ist.
              </p>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Typ</th>
                    <th className="px-4 py-3 font-semibold">Zeile</th>
                    <th className="px-4 py-3 font-semibold">Anbieter</th>
                    <th className="px-4 py-3 font-semibold">Feld</th>
                    <th className="px-4 py-3 font-semibold">Meldung</th>
                    <th className="px-4 py-3 font-semibold">Aktion</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.issues.map((issue, index) => (
                    <tr key={`${issue.line}-${issue.field}-${index}`}>
                      <td className="px-4 py-3 align-top">
                        {issue.type === "error" ? (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Fehler
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                            Warnung
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 align-top text-slate-700">
                        {issue.line}
                      </td>

                      <td className="px-4 py-3 align-top text-slate-700">
                        {issue.businessName ||
                          issue.businessId ||
                          "Unbekannter Eintrag"}
                      </td>

                      <td className="px-4 py-3 align-top text-slate-700">
                        {issue.field ?? "—"}
                      </td>

                      <td className="px-4 py-3 align-top text-slate-700">
                        {issue.message}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <Link
                          href={`/admin/datencheck/bearbeiten?line=${issue.line}`}
                          className="rounded-lg bg-white px-2.5 py-1.5 text-sm shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                          title="Eintrag bearbeiten"
                        >
                          ✏️
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-slate-900">
              CSV-Einträge
            </h2>

            <p className="text-sm text-slate-500">
              Diese Tabelle zeigt alle CSV-Zeilen. Fehlerhafte Zeilen sind rot,
              Warnungen gelb markiert.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Zeile</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Kategorie</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Adresse</th>
                  <th className="px-4 py-3 font-semibold">Hinweise</th>
                  <th className="px-4 py-3 font-semibold">Aktion</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.rows.map((row) => (
                  <tr key={row.line} className={getRowClassName(row)}>
                    <td className="px-4 py-3 align-top">
                      {row.hasErrors ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Fehler
                        </span>
                      ) : row.hasWarnings ? (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                          Warnung
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          OK
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top text-slate-700">
                      {row.line}
                    </td>

                    <td className="px-4 py-3 align-top font-medium text-slate-900">
                      {row.name || "—"}
                    </td>

<td className="px-4 py-3 align-top text-slate-700">
  {row.category || "—"}
</td>

<td className="px-4 py-3 align-top">
  <span className={getStatusBadgeClassName(row.status)}>
    {row.status || "aktiv"}
  </span>
</td>

<td className="px-4 py-3 align-top text-slate-700">
  {row.address || "—"}
</td>

                    <td className="px-4 py-3 align-top text-slate-700">
                      {row.issues.length === 0 ? (
                        <span className="text-slate-400">Keine Hinweise</span>
                      ) : (
                        <ul className="space-y-1">
                          {row.issues.map((issue, index) => (
                            <li key={`${issue.field}-${index}`}>
                              <span
                                className={
                                  issue.type === "error"
                                    ? "font-medium text-red-700"
                                    : "font-medium text-yellow-700"
                                }
                              >
                                {issue.field ?? "Hinweis"}:
                              </span>{" "}
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>

<td className="px-4 py-3 align-top">
  <div className="flex gap-2">
    {row.business && (
      <Link
        href={`/anbieter/${row.business.id}`}
        className="rounded-lg bg-white px-2.5 py-1.5 text-sm shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
        title="Detailseite öffnen"
      >
        🔎
      </Link>
    )}

    <Link
      href={`/admin/datencheck/bearbeiten?line=${row.line}`}
      className="rounded-lg bg-white px-2.5 py-1.5 text-sm shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
      title="Eintrag bearbeiten"
    >
      ✏️
    </Link>

    <BusinessStatusActionButton
      line={row.line}
      currentStatus={row.status || "aktiv"}
      businessName={row.name}
    />
  </div>
</td>
                  </tr>
                ))}

                {data.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Keine CSV-Einträge gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-lg font-semibold text-blue-950">
            Hinweise zur CSV-Pflege
          </h2>

          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-blue-900">
            <li>Jede ID darf nur einmal vorkommen.</li>
            <li>Name, Adresse, Breitengrad und Längengrad sind Pflichtfelder.</li>
            <li>
              Kategorien müssen exakt mit den erlaubten Kategorien
              übereinstimmen.
            </li>
            <li>
              Website-Links sollten mit <code>https://</code> oder{" "}
              <code>http://</code> beginnen.
            </li>
            <li>
              Setze <code>coordinatesVerified</code> auf <code>true</code>,
              wenn du die Position geprüft hast.
            </li>
          </ul>
        </section>
      </section>
    </main>
  );
}

function getRowClassName(row: BusinessRowStatus) {
  if (row.hasErrors) {
    return "bg-red-50/60 hover:bg-red-50";
  }

  if (row.hasWarnings) {
    return "bg-yellow-50/60 hover:bg-yellow-50";
  }

  return "bg-white hover:bg-slate-50";
}

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  tone?: "default" | "success" | "warning" | "error";
};

function StatCard({
  label,
  value,
  description,
  tone = "default",
}: StatCardProps) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-slate-900",
    success: "border-green-200 bg-green-50 text-green-900",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-900",
    error: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>

      <p className="mt-2 text-4xl font-bold">{value}</p>

      <p className="mt-2 text-sm opacity-75">{description}</p>
    </article>
  );
}
function getStatusBadgeClassName(status?: string) {
  if (status === "aktiv") {
    return "rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700";
  }

  if (status === "entwurf") {
    return "rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700";
  }

  if (status === "deaktiviert") {
    return "rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600";
  }

  return "rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700";
}