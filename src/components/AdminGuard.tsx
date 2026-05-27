"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // NO LOGUEADO
    if (!user) {
      router.push("/login");
      return;
    }

    // CAMBIAR POR TU CORREO
    const adminEmail = "alexccapa@gmail.com";

    // NO ES ADMIN
    if (user.email !== adminEmail) {
      router.push("/");
      return;
    }

    setLoading(false);
  }

  if (loading) {
    return <p>Cargando...</p>;
  }

  return <>{children}</>;
}