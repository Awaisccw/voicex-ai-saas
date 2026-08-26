import * as React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Toaster } from "react-hot-toast";
import { authOptions } from "@/lib/auth";
import { prisma } from "@saas/db";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/studio");
  }

  // Fetch live credits from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      credits: true,
      tier: true,
    },
  });

  const credits = user?.credits ?? session.user.credits ?? 0;
  const tier = user?.tier ?? session.user.tier ?? "FREE";
  const name = user?.name ?? session.user.name ?? "User";
  const email = user?.email ?? session.user.email;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "!bg-card !text-foreground !border !border-border/80 !shadow-card !text-xs !font-medium",
          duration: 4000,
        }}
      />

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        userEmail={email}
        userName={name}
        userTier={tier}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          initialCredits={credits}
          tier={tier}
          userName={name}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
