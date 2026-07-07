import { redirect } from "next/navigation";
import { isAuthorizedAdmin } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { AdminDashboardClient } from "./admin-dashboard-client";
import { ClerkProviderWrapper } from "@/components/clerk-provider-wrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage resume and site settings",
};

export default async function AdminDashboard() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  const authorized = await isAuthorizedAdmin();
  if (!authorized) {
    redirect("/");
  }

  return (
    <ClerkProviderWrapper>
      <AdminDashboardClient />
    </ClerkProviderWrapper>
  );
}
