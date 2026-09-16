import fs from "node:fs";
import path from "node:path";

const MAX_RESULTS = 50;

const outputDirectory = path.join(process.cwd(), "data", "import");
const outputFilePath = path.join(
  outputDirectory,
  "olfen_osm_import_50_entwurf.csv"
);
const rawFilePath = path.join(outputDirectory, "olfen_osm_raw.json");

const headers = [
  "id",
  "name",
  "category",
  "description",
  "address",
  "phone",
  "email",
  "website",
  "latitude",
  "longitude",
  "tags",
  "sourceName",
  "sourceUrl",
  "coordinatesVerified",
  "coordinateSource",
  "status",
];

const OLFEN_BBOX = "51.655,7.250,51.790,7.520";
// Format: südlich, westlich, nördlich, östlich

const overpassQuery = `
[out:json][timeout:90];

(
  node["shop"](${OLFEN_BBOX});
  way["shop"](${OLFEN_BBOX});
  relation["shop"](${OLFEN_BBOX});

  node["craft"](${OLFEN_BBOX});
  way["craft"](${OLFEN_BBOX});
  relation["craft"](${OLFEN_BBOX});

  node["office"](${OLFEN_BBOX});
  way["office"](${OLFEN_BBOX});
  relation["office"](${OLFEN_BBOX});

  node["healthcare"](${OLFEN_BBOX});
  way["healthcare"](${OLFEN_BBOX});
  relation["healthcare"](${OLFEN_BBOX});

  node["amenity"~"^(restaurant|cafe|bar|pub|fast_food|biergarten|ice_cream|pharmacy|doctors|dentist|clinic|veterinary|bank|fuel|car_wash|charging_station|post_office|marketplace)$"](${OLFEN_BBOX});
  way["amenity"~"^(restaurant|cafe|bar|pub|fast_food|biergarten|ice_cream|pharmacy|doctors|dentist|clinic|veterinary|bank|fuel|car_wash|charging_station|post_office|marketplace)$"](${OLFEN_BBOX});
  relation["amenity"~"^(restaurant|cafe|bar|pub|fast_food|biergarten|ice_cream|pharmacy|doctors|dentist|clinic|veterinary|bank|fuel|car_wash|charging_station|post_office|marketplace)$"](${OLFEN_BBOX});

  node["tourism"~"^(hotel|guest_house|apartment|camp_site|attraction|museum)$"](${OLFEN_BBOX});
  way["tourism"~"^(hotel|guest_house|apartment|camp_site|attraction|museum)$"](${OLFEN_BBOX});
  relation["tourism"~"^(hotel|guest_house|apartment|camp_site|attraction|museum)$"](${OLFEN_BBOX});

  node["leisure"~"^(fitness_centre|sports_centre|swimming_pool|golf_course|marina)$"](${OLFEN_BBOX});
  way["leisure"~"^(fitness_centre|sports_centre|swimming_pool|golf_course|marina)$"](${OLFEN_BBOX});
  relation["leisure"~"^(fitness_centre|sports_centre|swimming_pool|golf_course|marina)$"](${OLFEN_BBOX});

  node["man_made"="works"](${OLFEN_BBOX});
  way["man_made"="works"](${OLFEN_BBOX});
  relation["man_made"="works"](${OLFEN_BBOX});
);

out body center;
`;

async function main() {
  console.log("Frage OpenStreetMap/Overpass ab ...");

const data = await fetchOverpassData(overpassQuery);

  fs.mkdirSync(outputDirectory, {
    recursive: true,
  });

  fs.writeFileSync(rawFilePath, JSON.stringify(data, null, 2), "utf-8");

  const businesses = data.elements
    .map((element) => createBusinessFromOsmElement(element))
    .filter(Boolean)
    .filter((business, index, allBusinesses) => {
      return allBusinesses.findIndex((item) => item.id === business.id) === index;
    })
    .slice(0, MAX_RESULTS);

  const csvLines = [
    formatCsvLine(headers),
    ...businesses.map((business) =>
      formatCsvLine(headers.map((header) => business[header] ?? ""))
    ),
  ];

  fs.writeFileSync(outputFilePath, `${csvLines.join("\n")}\n`, "utf-8");

  console.log("");
  console.log(`Fertig. ${businesses.length} Einträge erstellt.`);
  console.log(`CSV-Datei: ${outputFilePath}`);
  console.log(`Rohdaten: ${rawFilePath}`);
  console.log("");
  console.log(
    "Hinweis: Die Einträge stehen auf status=entwurf und sollten im Datencheck geprüft werden."
  );
}

async function fetchOverpassData(query) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`Nutze Overpass-Endpunkt: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent": "lokal-olfen-osm-import/1.0",
        },
        body: new URLSearchParams({
          data: query,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        lastError = new Error(
          `Overpass-Abfrage fehlgeschlagen. HTTP-Status: ${response.status}. Antwort: ${responseText.slice(
            0,
            500
          )}`
        );

        console.warn(lastError.message);
        continue;
      }

      return JSON.parse(responseText);
    } catch (error) {
      lastError = error;
      console.warn(
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler beim Overpass-Endpunkt."
      );
    }
  }

  throw lastError ?? new Error("Alle Overpass-Endpunkte sind fehlgeschlagen.");
}

function createBusinessFromOsmElement(element) {
  const tags = element.tags ?? {};
  const name = clean(tags.name);

  if (!name) {
    return null;
  }

  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (!latitude || !longitude) {
    return null;
  }

  const category = getCategory(tags);
  const osmTags = getBusinessTags(tags);

  return {
    id: createId(`${name}-${element.type}-${element.id}`),
    name,
    category,
    description: createDescription(tags),
    address: createAddress(tags),
    phone: clean(tags.phone ?? tags["contact:phone"]),
    email: clean(tags.email ?? tags["contact:email"]),
    website: clean(
      tags.website ?? tags["contact:website"] ?? tags.url ?? tags["contact:url"]
    ),
    latitude: String(latitude),
    longitude: String(longitude),
    tags: osmTags.join(", "),
    sourceName: "OpenStreetMap / Overpass",
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    coordinatesVerified: "false",
    coordinateSource: "OpenStreetMap / Overpass Export",
    status: "entwurf",
  };
}

function getCategory(tags) {
  if (tags.shop) {
    return "Einzelhandel";
  }

  if (tags.craft) {
    return "Handwerk";
  }

  if (
    tags.amenity === "restaurant" ||
    tags.amenity === "cafe" ||
    tags.amenity === "bar" ||
    tags.amenity === "pub" ||
    tags.amenity === "fast_food" ||
    tags.amenity === "biergarten" ||
    tags.amenity === "ice_cream"
  ) {
    return "Gastronomie";
  }

  if (
    tags.amenity === "pharmacy" ||
    tags.amenity === "doctors" ||
    tags.amenity === "dentist" ||
    tags.amenity === "clinic" ||
    tags.amenity === "veterinary" ||
    tags.healthcare
  ) {
    return "Gesundheit";
  }

  if (
    tags.amenity === "fuel" ||
    tags.amenity === "car_wash" ||
    tags.amenity === "charging_station"
  ) {
    return "Mobilität";
  }

  if (tags.office) {
    return "Beratung";
  }

  if (tags.man_made === "works") {
    return "Industrie";
  }

  if (tags.tourism || tags.leisure) {
    return "Freizeit";
  }

  return "Sonstiges";
}

function createDescription(tags) {
  const parts = [];

  if (tags.shop) {
    parts.push(`Einzelhandel: ${translateOsmValue(tags.shop)}`);
  }

  if (tags.craft) {
    parts.push(`Handwerk: ${translateOsmValue(tags.craft)}`);
  }

  if (tags.office) {
    parts.push(`Büro/Dienstleistung: ${translateOsmValue(tags.office)}`);
  }

  if (tags.amenity) {
    parts.push(`Einrichtung: ${translateOsmValue(tags.amenity)}`);
  }

  if (tags.healthcare) {
    parts.push(`Gesundheit: ${translateOsmValue(tags.healthcare)}`);
  }

  if (tags.tourism) {
    parts.push(`Tourismus: ${translateOsmValue(tags.tourism)}`);
  }

  if (tags.leisure) {
    parts.push(`Freizeit: ${translateOsmValue(tags.leisure)}`);
  }

  if (parts.length === 0) {
    return "Aus OpenStreetMap importierter Anbieter. Bitte prüfen und Beschreibung ergänzen.";
  }

  return `${parts.join(", ")}. Bitte prüfen und Beschreibung ergänzen.`;
}

function createAddress(tags) {
  const street = clean(tags["addr:street"]);
  const houseNumber = clean(tags["addr:housenumber"]);
  const postcode = clean(tags["addr:postcode"]);
  const city = clean(tags["addr:city"]) || "Olfen";

  const streetLine = [street, houseNumber].filter(Boolean).join(" ");
  const cityLine = [postcode, city].filter(Boolean).join(" ");

  return [streetLine, cityLine].filter(Boolean).join(", ");
}

function getBusinessTags(tags) {
  const result = [];

  for (const key of [
    "shop",
    "craft",
    "office",
    "amenity",
    "healthcare",
    "tourism",
    "leisure",
  ]) {
    if (tags[key]) {
      result.push(translateOsmValue(tags[key]));
    }
  }

  if (tags.brand) {
    result.push(tags.brand);
  }

  if (tags.operator) {
    result.push(tags.operator);
  }

  return [...new Set(result.map(clean).filter(Boolean))];
}

function translateOsmValue(value) {
  const translations = {
    bakery: "Bäckerei",
    butcher: "Metzgerei",
    supermarket: "Supermarkt",
    convenience: "Lebensmittel",
    clothes: "Bekleidung",
    shoes: "Schuhe",
    hairdresser: "Friseur",
    florist: "Blumen",
    optician: "Optiker",
    pharmacy: "Apotheke",
    restaurant: "Restaurant",
    cafe: "Café",
    bar: "Bar",
    pub: "Kneipe",
    fast_food: "Imbiss",
    biergarten: "Biergarten",
    ice_cream: "Eisdiele",
    doctors: "Arzt",
    dentist: "Zahnarzt",
    clinic: "Klinik",
    veterinary: "Tierarzt",
    bank: "Bank",
    fuel: "Tankstelle",
    car_wash: "Waschanlage",
    charging_station: "Ladestation",
    hotel: "Hotel",
    guest_house: "Pension",
    apartment: "Ferienwohnung",
    camp_site: "Campingplatz",
    fitness_centre: "Fitnessstudio",
    sports_centre: "Sportzentrum",
  };

  return translations[value] ?? String(value).replaceAll("_", " ");
}

function createId(value) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clean(value) {
  return String(value ?? "").trim();
}

function formatCsvLine(values) {
  return values.map(escapeCsvValue).join(";");
}

function escapeCsvValue(value) {
  const text = String(value ?? "");

  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

main().catch((error) => {
  console.error("");
  console.error("Fehler beim Erstellen der OSM-Importdatei:");
  console.error(error);
  console.error("");
  process.exit(1);
});