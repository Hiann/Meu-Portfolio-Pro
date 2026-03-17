import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hiann Alexander — Dev Python & IA",
  description: "Portfólio de Hiann Alexander, Programador Python, Backend e Inteligência Artificial.",
  // É aqui que a mágica acontece no Next.js moderno:
  icons: {
    icon: "/raio.png",
    shortcut: "/raio.png",
  },
};

// ... resto do código acima (imports, fontes, etc)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Adicione o suppressHydrationWarning aqui 👇
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}