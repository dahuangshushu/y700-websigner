'use client';

import { useState, useRef, useEffect } from 'react';
import AVBSigner from '@/components/AVBSigner';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              AVB 2.0 签名工具
            </h1>
            <p className="text-slate-300">
              Android Verified Boot 2.0 签名工具 - Y700 四代平板专用
            </p>
          </header>
          <AVBSigner />
        </div>
      </div>
    </main>
  );
}