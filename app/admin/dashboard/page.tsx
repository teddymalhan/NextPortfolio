import { redirect } from "next/navigation";
import { getAdminUserId } from "@/lib/auth";
import { AdminDashboardClient } from "./admin-dashboard-client";
import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage resume and site settings",
};

export default async function AdminDashboard() {
  const userId = await getAdminUserId();
  if (!userId) {
    redirect("/");
  }

  return (
    <ClerkProviderWrapper>
      <AdminDashboardClient />
    </ClerkProviderWrapper>
  );
}
