/**
 * Root Layout Component
 * 
 * The main layout component for the Tech Media Hub application.
 * Defines the HTML structure, metadata, fonts, and global styling
 * that applies to all pages in the application.
 * 
 * Features:
 * - Google Fonts integration (Geist Sans and Geist Mono)
 * - Global CSS imports and styling
 * - SEO metadata configuration
 * - Font variable definitions for consistent typography
 * - Antialiased text rendering for better readability
 * 
 * This layout wraps all pages and provides the foundational
 * structure for the entire application.
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Font Configurations
// Geist Sans: Primary font for body text and UI elements
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono: Monospace font for code and technical content
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Application Metadata
 * Defines SEO and browser metadata for the application
 */
export const metadata: Metadata = {
  title: "CC Tech & Media Production",
  description: "Campion College Technology and Media Production"
};

/**
 * RootLayout Component
 * 
 * The root layout that wraps all pages in the application.
 * Provides HTML structure, font variables, and global styling.
 * 
 * @param children - The page content to render within the layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
