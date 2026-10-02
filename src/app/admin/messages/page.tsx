import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MessagesManager from "./MessagesManager";
import styles from "./messages.module.css";
import type { Message } from "@/lib/supabase/types";

export const metadata = {
  title: "Inbox | System Admin",
};

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  // Fetch the existing messages using the authenticated server client
  const { data: messages, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (fetchError) {
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.error} style={{ marginTop: "2rem" }}>
            Failed to load messages: {fetchError.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Messages Inbox</h1>
        <Link href="/admin" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </header>

      <main className={styles.main}>
        <MessagesManager initialMessages={(messages as Message[]) || []} />
      </main>
    </div>
  );
}
