import { AccountClient } from "@/features/account/account-client";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const u = session.user;

  return (
    <AccountClient
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
