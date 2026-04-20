import "./globals.css";
import { Inter } from "next/font/google";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { AuthProvider } from "@/lib/context/auth-context";
import { ModalProvider } from "@/lib/context/modal-context";
import { ToastContainer } from "@/components/ui/components";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorManager } from "@/components/GlobalErrorManager";

import { StripeRefetchHandler } from "@/components/StripeRefetchHandler";
import { PresenceHeartbeat } from "@/components/PresenceHeartbeat";
import { AnimatedFavicon } from "@/components/AnimatedFavicon";
import { GlobalPollingHandler } from "@/components/GlobalPollingHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sucata Bet | Sistema de Surebet",
  description: "Plataforma profissional de gestão de apostas e arbitragem financeira.",
};

import Script from "next/script";

const STITCH_RESOURCES = (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    <Script 
      src="https://www.googletagmanager.com/gtag/js?id=G-NDLP89QDVT" 
      strategy="afterInteractive" 
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-NDLP89QDVT');
      `}
    </Script>
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
        <meta name="referrer" content="no-referrer" />
        {STITCH_RESOURCES}
      </head>
      <body className={`${inter.className} bg-black text-[#e5e2e1] min-h-screen selection:bg-[#00ff88]/30 selection:text-[#00ff88] overflow-x-hidden transition-colors`}>
        <ErrorBoundary>
          <GlobalErrorManager />
          <AuthProvider>
            <AnimatedFavicon />
            <StripeRefetchHandler />
            <PresenceHeartbeat />
            <GlobalPollingHandler />
            <ModalProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <ToastContainer />
            </ModalProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
