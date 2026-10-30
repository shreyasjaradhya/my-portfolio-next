"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import styles from "./admin.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  return (
    <button onClick={handleLogout} className={styles.logoutBtn}>
      Terminate Session
    </button>
  );
}
