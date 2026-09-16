"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BusinessStatusActionButtonProps = {
  line: number;
  currentStatus: string;
  businessName?: string;
};

export default function BusinessStatusActionButton({
  line,
  currentStatus,
  businessName,
}: BusinessStatusActionButtonProps) {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isDeactivated = currentStatus === "deaktiviert";
  const nextStatus = isDeactivated ? "aktiv" : "deaktiviert";

  async function handleClick() {
    const confirmationMessage = isDeactivated
      ? `Möchtest du "${businessName ?? "diesen Anbieter"}" wieder aktivieren?`
      : `Möchtest du "${businessName ?? "diesen Anbieter"}" deaktivieren? Der Anbieter verschwindet dann von der öffentlichen Karte.`;

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          line,
          updates: {
            status: nextStatus,
          },
        }),
      });

      const responseText = await response.text();

      let data: {
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
            `Status konnte nicht gespeichert werden. HTTP-Status: ${response.status}`
        );
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status konnte nicht gespeichert werden."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isSaving}
        className={
          isDeactivated
            ? "rounded-lg bg-green-50 px-2.5 py-1.5 text-sm shadow-sm ring-1 ring-green-200 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
            : "rounded-lg bg-red-50 px-2.5 py-1.5 text-sm shadow-sm ring-1 ring-red-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        }
        title={isDeactivated ? "Anbieter aktivieren" : "Anbieter deaktivieren"}
      >
        {isSaving ? "..." : isDeactivated ? "↩️" : "🚫"}
      </button>

      {errorMessage && (
        <p className="max-w-[180px] text-xs text-red-700">{errorMessage}</p>
      )}
    </div>
  );
}