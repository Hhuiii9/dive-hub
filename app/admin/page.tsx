"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/admin/leads");
  }, [router]);

  return (
    <div className="py-20 flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400"></div>
    </div>
  );
}
