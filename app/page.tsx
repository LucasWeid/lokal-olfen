import BusinessDirectory from "@/components/BusinessDirectory";
import { getBusinesses } from "@/lib/businesses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const businesses = getBusinesses();

  return <BusinessDirectory businesses={businesses} />;
}