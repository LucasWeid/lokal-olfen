import Link from "next/link";
import { Business } from "@/types/business";

type BusinessCardProps = {
  business: Business;
};

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {business.category}
          </p>

          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {business.name}
          </h3>
        </div>

        {business.coordinatesVerified ? (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            Position geprüft
          </span>
        ) : (
          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
            Position prüfen
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-600">{business.description}</p>

      <p className="mt-3 text-sm text-slate-500">{business.address}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {business.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          href={`/anbieter/${business.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          Details ansehen
        </Link>

        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-600 hover:text-slate-900"
          >
            Website öffnen
          </a>
        )}
      </div>

      {business.sourceName && business.sourceUrl && (
        <p className="mt-3 text-xs text-slate-400">
          Quelle:{" "}
          <a
            href={business.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-600"
          >
            {business.sourceName}
          </a>
        </p>
      )}
    </article>
  );
}