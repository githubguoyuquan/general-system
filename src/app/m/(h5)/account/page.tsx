import { redirect } from "next/navigation";
import { MobileAccountClient } from "@/features/account/mobile-account-client";
import { auth } from "@/lib/auth";

export default async function MAccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/m/login?callbackUrl=/m/account");
  }

  const u = session.user;

  return (
    <MobileAccountClient
      user={{
        id: u.id,
        email: u.email ?? "",
        name: u.name ?? null,
        image: u.image ?? null,
        role: u.role,
      }}
    />
  );
}
