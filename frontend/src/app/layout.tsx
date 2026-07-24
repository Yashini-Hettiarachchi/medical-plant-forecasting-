/**
 * =============================================================================
 * ROOT LAYOUT FILE - The Master Template for the Entire Website
 * =============================================================================
 * 
 * What this file does:
 * This is the main layout template that wraps every page on the website.
 * Think of it like the frame of a picture - the frame stays the same, but
 * different pictures (pages) go inside it.
 * 
 * It sets up:
 * - Page title and description (what shows in browser tab and search results)
 * - Fonts used across the entire website
 * - Basic HTML structure (language, styling)
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load Geist font family for regular text (the main font used everywhere)
const geistSans = Geist({
  variable: "--font-geist-sans",  // Store this font in a CSS variable so pages can use it
  subsets: ["latin"],             // Only load Latin characters (English letters)
});

// Load Geist Mono font for code/technical text (monospace = all letters same width)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",  // Store this font in a CSS variable
  subsets: ["latin"],
});

// Define metadata - information about the website shown in browser tabs and search engines
export const metadata: Metadata = {
  title: "HerbHeal Research Dashboard",                                    // Text in browser tab
  description: "Climate forecasting and medicinal plant suitability dashboard for Sri Lanka.", // Description in search results
};

// RootLayout: The main wrapper component that applies to all pages
// It receives 'children' (the actual page content) and wraps it with HTML structure
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;  // 'children' = any page/content passed to this layout
}>) {
  return (
    <html                       // HTML root tag - declares this is an HTML document
      lang="en"                 // Language is English (for accessibility and search engines)
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}  // Apply fonts and styling
    >
      {/* body = main container for all page content */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
