"use client";

import dynamic from "next/dynamic";
import { Business } from "@/types/business";

const BusinessMap = dynamic(() => import("@/components/BusinessMap"), {
  ssr: false,
});

type BusinessMapLoaderProps = {
  businesses: Business[];
};

export default function BusinessMapLoader({
  businesses,
}: BusinessMapLoaderProps) {
  return <BusinessMap businesses={businesses} />;
}