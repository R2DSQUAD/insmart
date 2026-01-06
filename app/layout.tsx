import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

export const metadata: Metadata = {
  title: "계절 근로자 페이지",
  description: "계절 근로자 관련 정보와 지원 절차를 안내합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="root">
        <Header />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
