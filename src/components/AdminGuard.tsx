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
    async function checkAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // 1. SI NO ESTÁ LOGUEADO
        if (!user) {
          router.replace("/login");
          return;
        }

        // 2. CORREO DEL ADMINISTRADOR
        const adminEmail = "alexccapa@gmail.com";

        // 3. SI NO ES EL ADMIN
        if (user.email !== adminEmail) {
          router.replace("/");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error validando administrador:", error);
        router.replace("/");
      }
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600 animate-pulse">
            🔒 Verificando credenciales...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}