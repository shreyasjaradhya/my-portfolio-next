"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./admin.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className={styles.logoutBtn}>
      Terminate Session
    </button>
  );
}
