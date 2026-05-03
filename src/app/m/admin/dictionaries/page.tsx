import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listAll } from "@/services/dictionary.service";
import { DictionaryAdminClient } from "@/features/dictionary/dictionary-admin-client";

export default async function MAdminDictionariesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/m");
  }
  const initial = await listAll();
  return <DictionaryAdminClient initial={initial} />;
}
