'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteData, defaultSiteData } from '@/context/SiteDataContext';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const pathname = usePathname();
  const { siteData } = useSiteData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    if (isMenuOpen) {
      closeMenu();
    }
  }, [pathname]);

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      setIsClosing(false);
      setIsMenuOpen(true);
    }
  };

  const closeMenu = () => {
    if (isMenuOpen && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 220);
    }
  };

  if (!mounted) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Nav items from siteData
  const navItems = siteData?.header?.navItems || [];

  const authorName = siteData?.header?.author || siteData?.header?.siteName || '';

  return (
    <header id="header" className="absolute top-0 z-40 w-full h-20">
      <div className="flex items-center justify-between h-full max-w-7xl px-4 sm:px-6 mx-auto border-b border-transparent select-none">
        {/* Brand Logo / Author Name */}
        <Link
          href="/"
          className="h-5 text-base group relative z-30 flex items-center space-x-1.5 text-neutral-900 dark:text-white font-semibold whitespace-nowrap active:scale-95 transition-transform"
        >
          <span className="text-xl -translate-y-0.5 group-hover:-rotate-12 group-hover:scale-[1.2] ease-in-out duration-300 text-indigo-600 dark:text-indigo-400">✦</span>
          <span className="-translate-y-0.5">{authorName || 'Portfolio'}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center space-x-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {navItems.map((item, idx) => (
            <Link
              key={item.href + idx}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 hover:text-neutral-900 dark:hover:text-white active:scale-95 ${
                isActive(item.href) ? 'text-neutral-900 dark:text-white font-bold bg-neutral-100 dark:bg-neutral-800/80 shadow-xs' : ''
              }`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <div className="sm:hidden relative z-50">
          <button
            onClick={toggleMenu}
            className="p-2.5 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-90 transition-all duration-200 flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center gap-[5px] relative">
              <span
                className={`w-5 h-[2px] bg-current rounded-full transition-all duration-300 ease-out origin-center ${
                  isMenuOpen && !isClosing ? 'rotate-45 translate-y-[3.5px]' : ''
                }`}
              />
              <span
                className={`w-5 h-[2px] bg-current rounded-full transition-all duration-200 ease-out ${
                  isMenuOpen && !isClosing ? 'opacity-0 scale-x-0' : 'opacity-100'
                }`}
              />
              <span
                className={`w-5 h-[2px] bg-current rounded-full transition-all duration-300 ease-out origin-center ${
                  isMenuOpen && !isClosing ? '-rotate-45 -translate-y-[10.5px]' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Backdrop & Container */}
      {(isMenuOpen || isClosing) && (
        <>
          <div
            onClick={closeMenu}
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden ${
              isClosing ? 'animate-fade-out' : 'animate-fade-in'
            }`}
          />
          <div
            className={`fixed top-[70px] left-4 right-4 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-1.5 sm:hidden ${
              isClosing ? 'animate-mobile-menu-out' : 'animate-mobile-menu-in'
            }`}
          >
            {navItems.map((item, idx) => (
              <Link
                key={item.href + idx}
                href={item.href}
                onClick={closeMenu}
                style={{ animationDelay: `${idx * 60 + 40}ms` }}
                className={`w-full px-4 py-3 text-center text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] ${
                  isClosing ? '' : 'animate-fade-in-up'
                } ${
                  isActive(item.href)
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md'
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </>
      )}
    </header>
  );
}