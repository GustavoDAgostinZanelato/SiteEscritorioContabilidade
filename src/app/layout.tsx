//Esse arquivo cria um layout padrão, que será aplicado automaticamente a todas as páginas que estão dentro da pasta app/

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; //As demais config de design do site veem do globals.css

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
