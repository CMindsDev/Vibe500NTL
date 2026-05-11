import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { RouteTransition } from "@/components/RouteTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "500 | Explorar Startups",
  description: "Explorador inmersivo de startups con tarjetas glassmorphism."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <RouteTransition>{children}</RouteTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
