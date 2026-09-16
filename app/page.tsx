import BusinessDirectory from "@/components/BusinessDirectory";
import { getBusinesses } from "@/lib/businesses";

export default function HomePage() {
  const businesses = getBusinesses();

  return <BusinessDirectory businesses={businesses} />;
}