import type { Metadata } from "next";

import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Review your Ricemania order and send it to the kitchen.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
