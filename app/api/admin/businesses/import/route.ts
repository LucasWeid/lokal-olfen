import { NextResponse } from "next/server";
import {
  createBusinessCsvBackup,
  importBusinessCsv,
} from "@/lib/businesses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const modeValue = formData.get("mode");

    const mode = modeValue === "replace" ? "replace" : "append";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Es wurde keine gültige CSV-Datei hochgeladen.",
        },
        {
          status: 400,
        }
      );
    }

const csvContent = await file.text();

const backupFileName = createBusinessCsvBackup();

const data = importBusinessCsv(csvContent, mode);

return NextResponse.json({
  success: true,
  message:
    mode === "replace"
      ? "CSV wurde ersetzt."
      : "CSV-Einträge wurden angehängt.",
  backupFileName,
  summary: {
    totalRows: data.totalRows,
    validRows: data.validRows,
    issueCount: data.issues.length,
    errorCount: data.issues.filter((issue) => issue.type === "error")
      .length,
    warningCount: data.issues.filter((issue) => issue.type === "warning")
      .length,
  },
  issues: data.issues,
});

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Die CSV-Datei konnte nicht importiert werden.",
      },
      {
        status: 500,
      }
    );
  }
}