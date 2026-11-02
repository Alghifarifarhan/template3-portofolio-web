'use client';

import Link from 'next/link';
import { useSiteData, SocialLink } from '@/context/SiteDataContext';

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === 'twitter' || p === 'x') {
    return (
      <svg className="w-5 h-5 dark:stroke-black stroke-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M95 50c0 24.853-20.147 45-45 45S5 74.853 5 50 25.147 5 50 5s45 20.147 45 45Zm-51.21 2.688-21.51-28.76h16.578l14.1 18.855 17.453-18.855h4.872L55.135 45.694l22.72 30.377H61.279L45.967 55.598l-18.95 20.473h-4.873L43.79 52.688Zm-6.73-25.172h-7.616l33.63 44.967h7.616L37.06 27.516Z" fill="currentColor" />
      </svg>
    );
  }
  if (p === 'github') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    );
  }
  if (p === 'email') {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  if (p === 'linkedin') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
      </svg>
    );
  }
  if (p === 'instagram') {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    );
  }
  if (p === 'youtube') {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

export default function Footer() {
  const { siteData } = useSiteData();
  const author = siteData.header.author || siteData.header.siteName || "Portfolio";
  const socialLinks = siteData.footer.socialLinks || [];

  // Remove any redundant trailing "All rights reserved" from custom copyright text if exists
  const rawCopyright = siteData.footer.copyright;
  const cleanCopyright = rawCopyright
    ? rawCopyright.replace(/\.?\s*all\s*rights\s*reserved\.?\s*$/i, '').trim().replace(/\.+$/, '')
    : '';

  return (
    <section className="text-gray-700 bg-white border-t dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <div className="container flex flex-col items-center justify-center min-h-[40px] mx-auto px-7 max-w-7xl sm:flex-row sm:min-h-[50px] py-3 sm:py-0">
        <Link href="/" className="h-5 text-base group relative z-30 flex items-center space-x-1.5 text-black dark:text-white font-semibold mt-3 sm:mt-0">
          <span className="text-xl -translate-y-0.5 group-hover:-rotate-12 group-hover:scale-[1.2] ease-in-out duration-300 text-indigo-600 dark:text-indigo-400">✦</span>
          <span className="-translate-y-0.5">{author}</span>
        </Link>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 sm:ml-4 sm:pl-4 sm:border-l sm:border-neutral-300 dark:sm:border-neutral-700 sm:mt-0 text-center sm:text-left">
          <span>{cleanCopyright ? `${cleanCopyright}. ` : `© ${new Date().getFullYear()} ${author}. `}</span>
          <span>
            All rights reserved by{' '}
            <a
              href="https://github.com/tomcomtang"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-black dark:hover:text-white transition-colors text-neutral-800 dark:text-neutral-200"
            >
              tomcomtang
            </a>{' '}
            Distributed by{' '}
            <a
              href="https://themewagon.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-black dark:hover:text-white transition-colors text-neutral-800 dark:text-neutral-200"
            >
              ThemeWagon
            </a>.
          </span>
        </p>

        {socialLinks.length > 0 && (
          <span className="inline-flex justify-center mt-3 mb-3 sm:mb-0 space-x-4 sm:ml-auto sm:mt-0 sm:justify-start">
            {socialLinks.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                title={item.name}
              >
                <span className="sr-only">{item.name}</span>
                <SocialIcon platform={item.platform} />
              </a>
            ))}
          </span>
        )}
      </div>
    </section>
  );
}