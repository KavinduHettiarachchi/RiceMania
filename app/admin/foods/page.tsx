import { Suspense } from "react";

import AdminFoodsClient from "./AdminFoodsClient";

export const metadata = { title: "Menu items" };

export default function AdminFoodsPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-3xl shimmer" />}>
      <AdminFoodsClient />
    </Suspense>
  );
}
