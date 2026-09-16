import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusinessById } from "@/lib/businesses";

type BusinessDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BusinessDetailPage({
  params,
}: BusinessDetailPageProps) {
  const { id } = await params;

  const business = getBusinessById(id);

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-medium text-blue-600">
          ← Zurück zur Karte
        </Link>

        <article className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {business.category}
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                {business.name}
              </h1>
            </div>

            {business.coordinatesVerified ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                Position geprüft
              </span>
            ) : (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                Position noch prüfen
              </span>
            )}
          </div>

          <p className="mt-5 text-slate-700">{business.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {business.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <dl className="mt-8 space-y-5">
            <div>
              <dt className="text-sm font-semibold text-slate-500">Adresse</dt>
              <dd className="mt-1 text-slate-900">{business.address}</dd>
            </div>

            {business.phone && (
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  Telefon
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${business.phone.replaceAll(" ", "")}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {business.phone}
                  </a>
                </dd>
              </div>
            )}

            {business.email && (
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  E-Mail
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${business.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {business.email}
                  </a>
                </dd>
              </div>
            )}

            {business.website && (
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  Website
                </dt>
                <dd className="mt-1">
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Website öffnen
                  </a>
                </dd>
              </div>
            )}

            {business.sourceName && business.sourceUrl && (
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  Datenquelle
                </dt>
                <dd className="mt-1">
                  <a
                    href={business.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {business.sourceName}
                  </a>
                </dd>
              </div>
            )}

            {business.coordinateSource && (
              <div>
                <dt className="text-sm font-semibold text-slate-500">
                  Koordinatenquelle
                </dt>
                <dd className="mt-1 text-slate-900">
                  {business.coordinateSource}
                </dd>
              </div>
            )}
          </dl>
        </article>
      </section>
    </main>
  );
}