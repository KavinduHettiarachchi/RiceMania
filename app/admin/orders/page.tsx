import { Suspense } from "react";

import AdminOrdersClient from "./AdminOrdersClient";

export const metadata = { title: "Orders" };

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-3xl shimmer" />}>
      <AdminOrdersClient />
    </Suspense>
  );
}
