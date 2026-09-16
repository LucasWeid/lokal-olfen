"use client";

import { useMemo, useState } from "react";
import { Business, BusinessCategory } from "@/types/business";
import BusinessMapLoader from "@/components/BusinessMapLoader";
import BusinessCard from "@/components/BusinessCard";

type BusinessDirectoryProps = {
  businesses: Business[];
};

type MobileView = "map" | "list";

const categories: Array<BusinessCategory | "Alle"> = [
  "Alle",
  "Einzelhandel",
  "Handwerk",
  "Gesundheit",
  "Gastronomie",
  "Beratung",
  "Mobilität",
  "Industrie",
  "Freizeit",
  "Öffentliche Einrichtung",
  "Sonstiges",
];

export default function BusinessDirectory({
  businesses,
}: BusinessDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<BusinessCategory | "Alle">("Alle");
  const [mobileView, setMobileView] = useState<MobileView>("map");

  const filteredBusinesses = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return businesses.filter((business) => {
      const matchesCategory =
        selectedCategory === "Alle" || business.category === selectedCategory;

      const searchableText = [
        business.name,
        business.category,
        business.description,
        business.address,
        business.phone,
        business.email,
        business.website,
        business.sourceName,
        business.coordinateSource,
        ...business.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchableText.includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [businesses, searchTerm, selectedCategory]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 || selectedCategory !== "Alle";

  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("Alle");
  }

  function selectCategory(category: BusinessCategory | "Alle") {
    setSelectedCategory(category);
  }

  function selectMobileView(view: MobileView) {
    setMobileView(view);
  }

  return (
    <main className="isolate min-h-screen bg-slate-50 px-4 py-5 md:px-8 md:py-6">
      <section className="mx-auto max-w-7xl space-y-5 md:space-y-6">
        <header className="relative z-30 rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Lokal Olfen
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 md:text-5xl">
                Gewerbe und Dienstleistungen in Olfen finden
              </h1>

              <p className="mt-4 max-w-2xl text-slate-600">
                Suche lokale Anbieter, Branchen und Dienstleistungen direkt auf
                der Karte.
                Das hat alles Tobi Sebbel die alte Maschine programmiert!
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-left md:text-right">
              <p className="text-sm text-slate-500">Aktive Anbieter</p>
              <p className="text-3xl font-bold text-slate-900">
                {businesses.length}
              </p>
            </div>
          </div>
        </header>

        <section className="relative z-40 space-y-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Suche
              </span>

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Suche nach Friseur, Bäckerei, Sanitär ..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className="relative z-50 w-full touch-manipulation rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 md:w-auto"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              Kategorien
            </p>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    onPointerUp={(event) => {
                      if (event.pointerType === "touch") {
                        event.preventDefault();
                        selectCategory(category);
                      }
                    }}
                    className={
                      isSelected
                        ? "relative z-50 shrink-0 touch-manipulation rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                        : "relative z-50 shrink-0 touch-manipulation rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    }
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <p>
              <strong className="text-slate-900">
                {filteredBusinesses.length}
              </strong>{" "}
              Treffer gefunden
              {selectedCategory !== "Alle" && (
                <>
                  {" "}
                  in der Kategorie{" "}
                  <strong className="text-slate-900">{selectedCategory}</strong>
                </>
              )}
            </p>

            {searchTerm.trim().length > 0 && (
              <p>
                Suchbegriff:{" "}
                <strong className="text-slate-900">{searchTerm}</strong>
              </p>
            )}
          </div>

          <div className="relative z-50 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 lg:hidden">
            <button
              type="button"
              onClick={() => selectMobileView("map")}
              onPointerUp={(event) => {
                if (event.pointerType === "touch") {
                  event.preventDefault();
                  selectMobileView("map");
                }
              }}
              className={
                mobileView === "map"
                  ? "relative z-50 touch-manipulation rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                  : "relative z-50 touch-manipulation rounded-xl px-4 py-2 text-sm font-medium text-slate-600"
              }
            >
              Karte
            </button>

            <button
              type="button"
              onClick={() => selectMobileView("list")}
              onPointerUp={(event) => {
                if (event.pointerType === "touch") {
                  event.preventDefault();
                  selectMobileView("list");
                }
              }}
              className={
                mobileView === "list"
                  ? "relative z-50 touch-manipulation rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                  : "relative z-50 touch-manipulation rounded-xl px-4 py-2 text-sm font-medium text-slate-600"
              }
            >
              Liste
            </button>
          </div>
        </section>

        <section className="relative z-0 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className={mobileView === "map" ? "block" : "hidden lg:block"}>
            <BusinessMapLoader businesses={filteredBusinesses} />
          </div>

          <aside
            className={
              mobileView === "list"
                ? "block space-y-3"
                : "hidden space-y-3 lg:block"
            }
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Anbieterübersicht
                </h2>

                <p className="text-sm text-slate-500">
                  {filteredBusinesses.length} von {businesses.length} aktiven
                  Anbietern
                </p>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 lg:max-h-[600px]">
              {filteredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}

              {filteredBusinesses.length === 0 && (
                <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">
                    Keine passenden Anbieter gefunden
                  </h3>

                  <p className="mt-2">
                    Passe den Suchbegriff an oder setze die Filter zurück.
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </aside>
        </section>

        <footer className="rounded-2xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
          <p>
            Kartendaten und teilweise Anbieterinformationen:{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              © OpenStreetMap-Mitwirkende
            </a>
          </p>
        </footer>
      </section>
    </main>
  );
}