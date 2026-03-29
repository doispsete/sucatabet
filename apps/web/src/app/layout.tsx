import "./globals.css";
import { Inter } from "next/font/google";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { AuthProvider } from "@/lib/context/auth-context";
import { ModalProvider } from "@/lib/context/modal-context";
import { ToastContainer } from "@/components/ui/components";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sucata Bet | Sistema de Surebet",
  description: "Plataforma profissional de gestão de apostas e arbitragem financeira.",
};

const STITCH_RESOURCES = (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
  </>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className="dark">
      <head>
        {STITCH_RESOURCES}
      </head>
      <body className={`${inter.className} bg-black text-[#e5e2e1] min-h-screen selection:bg-[#00ff88]/30 selection:text-[#00ff88] overflow-x-hidden transition-colors`}>
        <AuthProvider>
          <ModalProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <ToastContainer />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
