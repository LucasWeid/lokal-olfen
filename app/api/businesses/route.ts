import { NextResponse } from "next/server";
import { getBusinessData } from "@/lib/businesses";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = getBusinessData();

  return NextResponse.json({
    summary: {
      totalRows: data.totalRows,
      validRows: data.validRows,
      issueCount: data.issues.length,
      errorCount: data.issues.filter((issue) => issue.type === "error").length,
      warningCount: data.issues.filter((issue) => issue.type === "warning")
        .length,
    },
    issues: data.issues,
    businesses: data.businesses,
  });
}