import type { Metadata } from "next";

import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Ricemania account to order rice, curry and kottu online.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
