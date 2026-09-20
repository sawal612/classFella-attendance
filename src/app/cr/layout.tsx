import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MobileResponsiveLayout from "./MobileResponsiveLayout";

export default async function CRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <MobileResponsiveLayout>{children}</MobileResponsiveLayout>;
}
