import Navbar from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>

      <Navbar />
      {children}
      <Footer />
    </>
  );
}
