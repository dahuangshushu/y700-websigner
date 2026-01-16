import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'AVB 2.0 签名工具 - Y700 四代',
  description: '为 Android boot.img 添加 AVB 2.0 签名（Y700 四代平板专用）',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <Script src="/coi-serviceworker.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}