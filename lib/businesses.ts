import fs from "node:fs";
import path from "node:path";
import { Business, BusinessCategory, BusinessStatus } from "@/types/business";

export const allowedCategories: BusinessCategory[] = [
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

export const allowedStatuses: BusinessStatus[] = [
  "aktiv",
  "entwurf",
  "deaktiviert",
];

export type BusinessDataIssue = {
  line: number;
  type: "error" | "warning";
  field?: string;
  businessId?: string;
  businessName?: string;
  message: string;
};

export type BusinessRowStatus = {
  line: number;
  raw: Record<string, string>;
  business: Business | null;
  issues: BusinessDataIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
  id?: string;
  name?: string;
  category?: string;
  address?: string;
  status?: string;
};

export type BusinessDataResult = {
  businesses: Business[];
  rows: BusinessRowStatus[];
  issues: BusinessDataIssue[];
  totalRows: number;
  validRows: number;
};

type CsvDocument = {
  headers: string[];
  rows: Array<{
    line: number;
    row: Record<string, string>;
  }>;
};

function getDataDirectoryPath() {
  return process.env.BUSINESS_DATA_DIR ?? path.join(process.cwd(), "data");
}

function getCsvFilePath() {
  return path.join(getDataDirectoryPath(), "businesses.csv");
}

function getSeedCsvFilePath() {
  return path.join(process.cwd(), "data", "businesses.csv");
}

function ensureBusinessCsvExists() {
  const csvFilePath = getCsvFilePath();

  if (fs.existsSync(csvFilePath)) {
    return;
  }

  const dataDirectoryPath = getDataDirectoryPath();

  fs.mkdirSync(dataDirectoryPath, {
    recursive: true,
  });

  const seedCsvFilePath = getSeedCsvFilePath();

  if (!fs.existsSync(seedCsvFilePath)) {
    throw new Error("Es wurde keine businesses.csv gefunden.");
  }

  fs.copyFileSync(seedCsvFilePath, csvFilePath);
}

function isBusinessCategory(value: string): value is BusinessCategory {
  return allowedCategories.includes(value as BusinessCategory);
}

function isBusinessStatus(value: string): value is BusinessStatus {
  return allowedStatuses.includes(value as BusinessStatus);
}

function parseBoolean(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();

  return (
    normalized === "true" ||
    normalized === "ja" ||
    normalized === "yes" ||
    normalized === "1"
  );
}

function parseNumber(value: string | undefined): number {
  if (!value) {
    return Number.NaN;
  }

  return Number.parseFloat(value.trim().replace(",", "."));
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === ";" && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current.trim());

  return result;
}

function formatCsvValue(value: string): string {
  const needsQuotes =
    value.includes(";") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  if (!needsQuotes) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function formatCsvLine(values: string[]): string {
  return values.map(formatCsvValue).join(";");
}

function getCell(
  row: Record<string, string>,
  key: string
): string | undefined {
  const value = row[key];

  if (!value || value.trim() === "") {
    return undefined;
  }

  return value.trim();
}

function readCsvDocument(): CsvDocument {
ensureBusinessCsvExists();

  const filePath = getCsvFilePath();

  if (!fs.existsSync(filePath)) {
    throw new Error("Die Datei data/businesses.csv wurde nicht gefunden.");
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");

  const rawLines = fileContent.split(/\r?\n/);

  const meaningfulLines = rawLines
    .map((line, index) => ({
      line: index + 1,
      content: line.trim(),
    }))
    .filter((item) => item.content.length > 0);

  const [headerItem, ...dataItems] = meaningfulLines;

  if (!headerItem) {
    return {
      headers: [],
      rows: [],
    };
  }

  const headers = parseCsvLine(headerItem.content);

  const rows = dataItems.map((item) => {
    const values = parseCsvLine(item.content);

    const row = headers.reduce<Record<string, string>>(
      (currentRow, header, index) => {
        currentRow[header] = values[index] ?? "";
        return currentRow;
      },
      {}
    );

    return {
      line: item.line,
      row,
    };
  });

  return {
    headers,
    rows,
  };
}

function validateWebsiteUrl(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return value.startsWith("https://") || value.startsWith("http://");
}

function validateEmail(value: string | undefined): boolean {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function makeIssue(input: {
  line: number;
  type: "error" | "warning";
  field?: string;
  businessId?: string;
  businessName?: string;
  message: string;
}): BusinessDataIssue {
  return input;
}

function validateBusinessRow(
  line: number,
  row: Record<string, string>,
  idCounts: Map<string, number>
): BusinessRowStatus {
  const issues: BusinessDataIssue[] = [];

  const id = getCell(row, "id");
  const name = getCell(row, "name");
  const categoryValue = getCell(row, "category") ?? "Sonstiges";
  const description = getCell(row, "description") ?? "";
  const address = getCell(row, "address");
  const phone = getCell(row, "phone");
  const email = getCell(row, "email");
  const website = getCell(row, "website");
  const latitude = parseNumber(getCell(row, "latitude"));
  const longitude = parseNumber(getCell(row, "longitude"));
  const sourceName = getCell(row, "sourceName");
  const sourceUrl = getCell(row, "sourceUrl");
  const coordinateSource = getCell(row, "coordinateSource");
  const coordinatesVerified = parseBoolean(getCell(row, "coordinatesVerified"));
const statusValue = getCell(row, "status") ?? "aktiv";

  const issueContext = {
    businessId: id,
    businessName: name,
  };

  if (!id) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "id",
        message: "Die ID fehlt.",
        ...issueContext,
      })
    );
  }

  if (id && (idCounts.get(id) ?? 0) > 1) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "id",
        message: `Die ID "${id}" kommt mehrfach vor. IDs müssen eindeutig sein.`,
        ...issueContext,
      })
    );
  }

  if (!name) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "name",
        message: "Der Name fehlt.",
        ...issueContext,
      })
    );
  }

  if (!address) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "address",
        message: "Die Adresse fehlt.",
        ...issueContext,
      })
    );
  }

  if (!Number.isFinite(latitude)) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "latitude",
        message: "Der Breitengrad fehlt oder ist ungültig.",
        ...issueContext,
      })
    );
  }

  if (!Number.isFinite(longitude)) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "longitude",
        message: "Der Längengrad fehlt oder ist ungültig.",
        ...issueContext,
      })
    );
  }

  if (Number.isFinite(latitude) && (latitude < -90 || latitude > 90)) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "latitude",
        message: "Der Breitengrad muss zwischen -90 und 90 liegen.",
        ...issueContext,
      })
    );
  }

  if (Number.isFinite(longitude) && (longitude < -180 || longitude > 180)) {
    issues.push(
      makeIssue({
        line,
        type: "error",
        field: "longitude",
        message: "Der Längengrad muss zwischen -180 und 180 liegen.",
        ...issueContext,
      })
    );
  }

  if (!isBusinessCategory(categoryValue)) {
    issues.push(
      makeIssue({
        line,
        type: "warning",
        field: "category",
        message: `Die Kategorie "${categoryValue}" ist nicht bekannt. Der Anbieter wird als "Sonstiges" angezeigt.`,
        ...issueContext,
      })
    );
  }

  if (!isBusinessStatus(statusValue)) {
  issues.push(
    makeIssue({
      line,
      type: "warning",
      field: "status",
      message: `Der Status "${statusValue}" ist nicht bekannt. Der Anbieter wird als "entwurf" behandelt.`,
      ...issueContext,
    })
  );
}

  if (!validateWebsiteUrl(website)) {
    issues.push(
      makeIssue({
        line,
        type: "warning",
        field: "website",
        message:
          "Die Website sollte mit https:// oder http:// beginnen, sonst funktioniert der Link eventuell nicht korrekt.",
        ...issueContext,
      })
    );
  }

  if (!validateEmail(email)) {
    issues.push(
      makeIssue({
        line,
        type: "warning",
        field: "email",
        message: "Die E-Mail-Adresse sieht ungültig aus.",
        ...issueContext,
      })
    );
  }

  if (sourceName && !sourceUrl) {
    issues.push(
      makeIssue({
        line,
        type: "warning",
        field: "sourceUrl",
        message:
          "Es ist ein Quellenname vorhanden, aber keine Quellen-URL angegeben.",
        ...issueContext,
      })
    );
  }

  if (!coordinatesVerified) {
    issues.push(
      makeIssue({
        line,
        type: "warning",
        field: "coordinatesVerified",
        message: "Die Koordinaten sind noch nicht als geprüft markiert.",
        ...issueContext,
      })
    );
  }

  const hasErrors = issues.some((issue) => issue.type === "error");
  const hasWarnings = issues.some((issue) => issue.type === "warning");

  if (hasErrors || !id || !name || !address) {
    return {
      line,
      raw: row,
      business: null,
      issues,
      hasErrors,
      hasWarnings,
      id,
      name,
      category: categoryValue,
      address,
      status: statusValue,
    };
  }

  const category: BusinessCategory = isBusinessCategory(categoryValue)
    ? categoryValue
    : "Sonstiges";

  const status: BusinessStatus = isBusinessStatus(statusValue)
  ? statusValue
  : "entwurf";

  const tags =
    getCell(row, "tags")
      ?.split("|")
      .map((tag) => tag.trim())
      .filter(Boolean) ?? [];

  const business: Business = {
    id,
    name,
    category,
    status,
    description,
    address,
    phone,
    email,
    website,
    latitude,
    longitude,
    tags,
    sourceName,
    sourceUrl,
    coordinatesVerified,
    coordinateSource,
  };

  return {
    line,
    raw: row,
    business,
    issues,
    hasErrors,
    hasWarnings,
    id,
    name,
    category,
    address,
    status,
  };
}

export function getBusinessData(): BusinessDataResult {
  const document = readCsvDocument();

  const idCounts = new Map<string, number>();

  for (const item of document.rows) {
    const id = getCell(item.row, "id");

    if (id) {
      idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
    }
  }

  const rows = document.rows.map((item) =>
    validateBusinessRow(item.line, item.row, idCounts)
  );

  const businesses = rows
    .map((row) => row.business)
    .filter((business): business is Business => business !== null);

  const issues = rows.flatMap((row) => row.issues);

  return {
    businesses,
    rows,
    issues,
    totalRows: rows.length,
    validRows: businesses.length,
  };
}

export function getBusinesses(): Business[] {
  return getBusinessData().businesses.filter(
    (business) => business.status === "aktiv"
  );
}

export function getBusinessById(id: string): Business | undefined {
  return getBusinesses().find((business) => business.id === id);
}

export function getBusinessRowByLine(
  line: number
): BusinessRowStatus | undefined {
  return getBusinessData().rows.find((row) => row.line === line);
}

export function updateBusinessRowByLine(
  line: number,
  updates: Record<string, string>
): BusinessDataResult {
  const document = readCsvDocument();

  const rowToUpdate = document.rows.find((item) => item.line === line);

  if (!rowToUpdate) {
    throw new Error(`CSV-Zeile ${line} wurde nicht gefunden.`);
  }

  const allowedHeaders = new Set(document.headers);

  for (const [key, value] of Object.entries(updates)) {
    if (allowedHeaders.has(key)) {
      rowToUpdate.row[key] = String(value ?? "").trim();
    }
  }

  const outputLines = [
    formatCsvLine(document.headers),
    ...document.rows.map((item) =>
      formatCsvLine(document.headers.map((header) => item.row[header] ?? ""))
    ),
  ];

  fs.writeFileSync(getCsvFilePath(), `${outputLines.join("\n")}\n`, "utf-8");

  return getBusinessData();
}
export function appendBusinessRow(
  newRow: Record<string, string>
): BusinessDataResult {
  const document = readCsvDocument();

  const row: Record<string, string> = {};

  for (const header of document.headers) {
    row[header] = String(newRow[header] ?? "").trim();
  }

  const outputLines = [
    formatCsvLine(document.headers),
    ...document.rows.map((item) =>
      formatCsvLine(document.headers.map((header) => item.row[header] ?? ""))
    ),
    formatCsvLine(document.headers.map((header) => row[header] ?? "")),
  ];

  fs.writeFileSync(getCsvFilePath(), `${outputLines.join("\n")}\n`, "utf-8");

  return getBusinessData();
}
export function importBusinessCsv(
  csvContent: string,
  mode: "append" | "replace"
): BusinessDataResult {
  const uploadedLines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (uploadedLines.length < 2) {
    throw new Error(
      "Die hochgeladene CSV muss eine Kopfzeile und mindestens eine Datenzeile enthalten."
    );
  }

  const uploadedHeaders = parseCsvLine(uploadedLines[0]);
  const uploadedRows = uploadedLines.slice(1);

  const currentDocument = readCsvDocument();

  const missingHeaders = currentDocument.headers.filter(
    (header) => !uploadedHeaders.includes(header)
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Die hochgeladene CSV enthält nicht alle benötigten Spalten. Fehlend: ${missingHeaders.join(
        ", "
      )}`
    );
  }

  const normalizedUploadedRows = uploadedRows.map((line) => {
    const values = parseCsvLine(line);

    const uploadedRow = uploadedHeaders.reduce<Record<string, string>>(
      (row, header, index) => {
        row[header] = values[index] ?? "";
        return row;
      },
      {}
    );

    return formatCsvLine(
      currentDocument.headers.map((header) => uploadedRow[header] ?? "")
    );
  });

  let outputLines: string[];

  if (mode === "replace") {
    outputLines = [
      formatCsvLine(currentDocument.headers),
      ...normalizedUploadedRows,
    ];
  } else {
    outputLines = [
      formatCsvLine(currentDocument.headers),
      ...currentDocument.rows.map((item) =>
        formatCsvLine(
          currentDocument.headers.map((header) => item.row[header] ?? "")
        )
      ),
      ...normalizedUploadedRows,
    ];
  }

  fs.writeFileSync(getCsvFilePath(), `${outputLines.join("\n")}\n`, "utf-8");

  return getBusinessData();
}
export function createBusinessCsvBackup(): string {
  const csvFilePath = getCsvFilePath();

  if (!fs.existsSync(csvFilePath)) {
    throw new Error("Die aktuelle businesses.csv wurde nicht gefunden.");
  }

 const backupDirectory = path.join(getDataDirectoryPath(), "backups");

  fs.mkdirSync(backupDirectory, {
    recursive: true,
  });

  const timestamp = new Date()
    .toISOString()
    .replace("T", "-")
    .replace(/\..+/, "")
    .replaceAll(":", "-");

  const backupFileName = `businesses-backup-${timestamp}.csv`;
  const backupFilePath = path.join(backupDirectory, backupFileName);

  fs.copyFileSync(csvFilePath, backupFilePath);

  return backupFileName;
}