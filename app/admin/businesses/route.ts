import { NextResponse } from "next/server";
import { updateBusinessRowByLine } from "@/lib/businesses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const lineNumber = Number(body?.line);

    if (!Number.isInteger(lineNumber)) {
      return NextResponse.json(
        {
          message: "Ungültige CSV-Zeilennummer.",
        },
        {
          status: 400,
        }
      );
    }

    if (!body?.updates || typeof body.updates !== "object") {
      return NextResponse.json(
        {
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