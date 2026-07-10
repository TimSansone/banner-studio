import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Banner Studio — Custom Banner Mockup Tool", description: "Design, preview, save, and download a custom print-ready banner." };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
