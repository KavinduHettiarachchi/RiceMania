import CartDrawer from "@/app/components/CartDrawer";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
