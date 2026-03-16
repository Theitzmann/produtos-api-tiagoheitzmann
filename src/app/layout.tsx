import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KLM Guindastes — Controle de Operações (Operations Control)",
  description: "Sistema de gestão e agendamento para KLM Guindastes — Qualidade com Segurança",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
