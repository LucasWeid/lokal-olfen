export type BusinessCategory =
  | "Einzelhandel"
  | "Handwerk"
  | "Gesundheit"
  | "Gastronomie"
  | "Beratung"
  | "Mobilität"
  | "Industrie"
  | "Freizeit"
  | "Öffentliche Einrichtung"
  | "Sonstiges";

export type BusinessStatus = "aktiv" | "entwurf" | "deaktiviert";

export type Business = {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude: number;
  longitude: number;
  tags: string[];
  sourceName?: string;
  sourceUrl?: string;
  coordinatesVerified?: boolean;
  coordinateSource?: string;
  status: BusinessStatus;
};