'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useSiteData } from '@/context/SiteDataContext';
import { formatGoogleDriveUrl } from '@/lib/firebase';

function ThemeAwareImage({ heroImage }: { heroImage?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const hasCustomImage = heroImage && heroImage.trim() !== '';

  if (hasCustomImage) {
    const formattedUrl = formatGoogleDriveUrl(heroImage);
    return (
      <div className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[500px] aspect-square flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-neutral-900/50 animate-scale-in group cursor-pointer">
        <img
          src={formattedUrl}
          alt="Hero visual"
          className="w-full h-full object-cover group-hover:scale-105 group-hover:rotate-1 transition-all duration-500 ease-out"
        />
      </div>
    );
  }

  // Modern minimal interactive card when no image is uploaded
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] aspect-square flex items-center justify-center rounded-3xl overflow-hidden shadow-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-neutral-900/80 animate-scale-in group cursor-pointer backdrop-blur-sm p-6">
      <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
      <div className="relative z-10 flex flex-col items-center justify-center text-center gap-4 p-6 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800/80 shadow-lg group-hover:scale-105 transition-transform duration-500">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl sm:text-4xl shadow-inner group-hover:rotate-6 transition-transform duration-300">
          ✦
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Creative Space</span>
          <span className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-200">Personal Portfolio</span>
        </div>
      </div>
    </div>
  );
}

export default function HomeContent() {
  const { siteData, recordVisit } = useSiteData();
  const { greeting, description, viewAboutBtn, readPostsBtn, heroImage } = siteData.home || {};

  useEffect(() => {
    recordVisit('home');
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] pt-24 pb-12">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 gap-8 md:gap-12">
        <div className="w-full md:w-[50%] text-center md:text-left flex flex-col items-center md:items-start">
          {greeting ? (
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight animate-fade-in-up">
              {greeting}
            </h1>
          ) : null}
          {description ? (
            <p className="mt-3 text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 animate-fade-in-up animation-delay-150">
              {description}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 mt-6 animate-fade-in-up animation-delay-300">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            >
              {viewAboutBtn || 'View About'}
              <svg 
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </Link>

            <Link
              href="/posts"
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-neutral-900 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            >
              {readPostsBtn || 'Read Posts'}
              <svg 
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="w-full md:w-[45%] flex items-center justify-center animate-scale-in animation-delay-200">
          <ThemeAwareImage heroImage={heroImage} />
        </div>
      </div>
    </div>
  );
}