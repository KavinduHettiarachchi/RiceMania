import type { Metadata } from "next";
import { Suspense } from "react";

import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My orders",
  description: "Track your Ricemania orders from the kitchen to your door.",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <OrdersClient />
    </Suspense>
  );
}
