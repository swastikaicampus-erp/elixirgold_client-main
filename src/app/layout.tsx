import type { Metadata } from "next";
import { Montserrat, Cinzel } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elixir Gold - Live Rates",
  description: "Live gold and silver rates with city-based pricing",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let isLoggedIn = false;
  let isAdmin = false;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      isLoggedIn = true;
      isAdmin = decoded.role === "admin" || decoded.role === "superadmin";
    }
  }

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${cinzel.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060606] text-[#f6e6b8]">
        <Header isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
        {children}
      </body>
    </html>
  );
}
