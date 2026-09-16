import { NextResponse } from "next/server";
import {
  appendBusinessRow,
  getBusinessData,
  updateBusinessRowByLine,
} from "@/lib/businesses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = getBusinessData();

  return NextResponse.json({
    success: true,
    message: "Admin-Businesses-API ist erreichbar.",
    summary: {
      totalRows: data.totalRows,
      validRows: data.validRows,
      issueCount: data.issues.length,
      errorCount: data.issues.filter((issue) => issue.type === "error").length,
      warningCount: data.issues.filter((issue) => issue.type === "warning")
        .length,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.business || typeof body.business !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Es wurden keine gültigen Anbieterdaten übergeben.",
        },
        {
          status: 400,
        }
      );
    }

    const data = appendBusinessRow(body.business);

    const createdId = String(body.business.id ?? "").trim();
    const createdRow = data.rows.find((row) => row.id === createdId);

    return NextResponse.json({
      success: true,
      message: "Anbieter wurde angelegt.",
      row: createdRow,
      summary: {
        totalRows: data.totalRows,
        validRows: data.validRows,
        issueCount: data.issues.length,
        errorCount: data.issues.filter((issue) => issue.type === "error")
          .length,
        warningCount: data.issues.filter((issue) => issue.type === "warning")
          .length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Der Anbieter konnte nicht angelegt werden.",
      },
      {
        status: 500,
      }
    );
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const lineNumber = Number(body?.line);

    if (!Number.isInteger(lineNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Ungültige CSV-Zeilennummer.",
          receivedLine: body?.line,
        },
        {
          status: 400,
        }
      );
    }

    if (!body?.updates || typeof body.updates !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Es wurden keine gültigen Änderungen übergeben.",
        },
        {
          status: 400,
        }
      );
    }

    const data = updateBusinessRowByLine(lineNumber, body.updates);

    const updatedRow = data.rows.find((row) => row.line === lineNumber);

    return NextResponse.json({
      success: true,
      message: "Änderung wurde gespeichert.",
      row: updatedRow,
      summary: {
        totalRows: data.totalRows,
        validRows: data.validRows,
        issueCount: data.issues.length,
        errorCount: data.issues.filter((issue) => issue.type === "error")
          .length,
        warningCount: data.issues.filter((issue) => issue.type === "warning")
          .length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Die Änderung konnte nicht gespeichert werden.",
      },
      {
        status: 500,
      }
    );
  }
}