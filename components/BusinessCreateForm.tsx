"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const allowedCategories = [
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
const allowedStatuses = ["aktiv", "entwurf", "deaktiviert"];

function createIdFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BusinessCreateForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    id: "",
    name: "",
    category: "Sonstiges",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    latitude: "",
    longitude: "",
    tags: "",
    sourceName: "",
    sourceUrl: "",
    coordinatesVerified: "false",
    coordinateSource: "",
    status: "entwurf",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof typeof form, value: string) {
    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [field]: value,
      };

      if (field === "name" && currentForm.id.trim() === "") {
        nextForm.id = createIdFromName(value);
      }

      return nextForm;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business: form,
        }),
      });

      const responseText = await response.text();

      let data: {
        success?: boolean;
        message?: string;
      } | null = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ??
            `Speichern fehlgeschlagen. HTTP-Status: ${response.status}. Antwort: ${responseText}`
        );
      }

      router.push("/admin/datencheck");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Der Anbieter konnte nicht angelegt werden."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="ID"
          value={form.id}
          onChange={(value) => updateField("id", value)}
          help="Wird aus dem Namen vorgeschlagen. Muss eindeutig sein."
        />

        <TextField
          label="Name"
          value={form.name}
          onChange={(value) => updateField("name", value)}
        />

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Kategorie
          </span>

          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          >
            {allowedCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>

        <TextField
          label="Adresse"
          value={form.address}
          onChange={(value) => updateField("address", value)}
        />

        <TextField
          label="Telefon"
          value={form.phone}
          onChange={(value) => updateField("phone", value)}
        />

        <TextField
          label="E-Mail"
          value={form.email}
          onChange={(value) => updateField("email", value)}
        />

        <TextField
          label="Website"
          value={form.website}
          onChange={(value) => updateField("website", value)}
          help="Am besten mit https:// beginnen."
        />

        <TextField
          label="Breitengrad"
          value={form.latitude}
          onChange={(value) => updateField("latitude", value)}
          help="Beispiel: 51.7079"
        />

        <TextField
          label="Längengrad"
          value={form.longitude}
          onChange={(value) => updateField("longitude", value)}
          help="Beispiel: 7.3786"
        />

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Koordinaten geprüft?
          </span>

          <select
            value={form.coordinatesVerified}
            onChange={(event) =>
              updateField("coordinatesVerified", event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label>

            <label className="space-y-2">
  <span className="text-sm font-semibold text-slate-700">
    Status
  </span>

  <select
    value={form.status}
    onChange={(event) => updateField("status", event.target.value)}
    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
  >
    {allowedStatuses.map((status) => (
      <option key={status}>{status}</option>
    ))}
  </select>

  <span className="block text-xs text-slate-500">
    Nur Anbieter mit Status „aktiv“ erscheinen öffentlich auf der Karte.
  </span>
</label>

        <TextField
          label="Koordinatenquelle"
          value={form.coordinateSource}
          onChange={(value) => updateField("coordinateSource", value)}
          help="Zum Beispiel: OpenStreetMap manuell geprüft"
        />

        <TextField
          label="Quellenname"
          value={form.sourceName}
          onChange={(value) => updateField("sourceName", value)}
        />

        <TextField
          label="Quellen-URL"
          value={form.sourceUrl}
          onChange={(value) => updateField("sourceUrl", value)}
        />

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            Beschreibung
          </span>

          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Tags</span>

          <input
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
          />

          <span className="block text-xs text-slate-500">
            Tags mit | trennen, zum Beispiel: Apotheke|Gesundheit|Beratung
          </span>
        </label>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Speichern..." : "Anbieter hinzufügen"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/datencheck")}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
};

function TextField({ label, value, onChange, help }: TextFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
      />

      {help && <span className="block text-xs text-slate-500">{help}</span>}
    </label>
  );
}