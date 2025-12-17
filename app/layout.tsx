import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { ToastProvider } from "@/components/Toast";

const interTight = localFont({
  src: [
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../assets/fonts/inter-tight/static/InterTight-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrandLocus Admin",
  description: "BrandLocus Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${interTight.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
