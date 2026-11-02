'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { doc, onSnapshot, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface NavItem {
  title: string;
  href: string;
}

export interface SocialLink {
  id: string;
  platform: string; // 'twitter' | 'github' | 'email' | 'linkedin' | 'instagram' | 'youtube' | 'custom'
  name: string;
  url: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  href: string;
  imageUrl: string;
}

export interface PostItem {
  id: string;
  title: string;
  description: string;
  date: string;
  slug: string;
  readingTime: number;
  imageUrl: string;
  content?: string;
  author?: string;
  tags?: string[];
  createdAt?: string;
}

export interface SiteStats {
  totalVisits: number;
  homeVisits: number;
  aboutVisits: number;
  projectsVisits: number;
  postsVisits: number;
  adminVisits: number;
  uploadsCount: number;
  downloadsCount: number;
  lastUpdated?: string;
}

export interface SiteData {
  header: {
    siteName: string;
    author: string;
    navItems: NavItem[];
  };
  footer: {
    copyright: string;
    socialLinks: SocialLink[];
  };
  home: {
    greeting: string;
    description: string;
    viewAboutBtn: string;
    readPostsBtn: string;
    heroImage: string;
  };
  about: {
    title: string;
    description: string;
    profileImage: string;
    skills: string[];
    experienceTitle: string;
    experiences: ExperienceItem[];
    connectTitle: string;
    connectDescription: string;
    emailUrl: string;
    twitterUrl?: string;
    resumeUrl?: string;
    certificateUrl?: string;
  };
  projects: {
    title: string;
    description: string;
    items: ProjectItem[];
  };
  posts: {
    title: string;
    description: string;
    searchPlaceholder: string;
    items: PostItem[];
  };
  settings: {
    themeMode: 'light' | 'dark' | 'system';
  };
  stats: SiteStats;
}

export const cleanSiteStats: SiteStats = {
  totalVisits: 0,
  homeVisits: 0,
  aboutVisits: 0,
  projectsVisits: 0,
  postsVisits: 0,
  adminVisits: 0,
  uploadsCount: 0,
  downloadsCount: 0,
};

export const cleanSiteData: SiteData = {
  header: {
    siteName: '',
    author: '',
    navItems: [
      { title: 'Home', href: '/' },
      { title: 'About', href: '/about' },
      { title: 'Projects', href: '/projects' },
      { title: 'Posts', href: '/posts' },
    ],
  },
  footer: {
    copyright: '',
    socialLinks: [],
  },
  home: {
    greeting: '',
    description: '',
    viewAboutBtn: 'View About',
    readPostsBtn: 'Read Posts',
    heroImage: '',
  },
  about: {
    title: 'About',
    description: '',
    profileImage: '',
    skills: [],
    experienceTitle: 'Work Experience',
    experiences: [],
    connectTitle: "Let's Connect",
    connectDescription: '',
    emailUrl: '',
    twitterUrl: '',
    resumeUrl: '',
    certificateUrl: '',
  },
  projects: {
    title: 'Projects',
    description: '',
    items: [],
  },
  posts: {
    title: 'Posts',
    description: '',
    searchPlaceholder: 'Search posts by title...',
    items: [],
  },
  settings: {
    themeMode: 'dark',
  },
  stats: cleanSiteStats,
};

// Helper to normalize nav items to exactly 4 items with valid paths
export function normalizeNavItems(items?: any[]): NavItem[] {
  const defaultItems: NavItem[] = [
    { title: 'Home', href: '/' },
    { title: 'About', href: '/about' },
    { title: 'Projects', href: '/projects' },
    { title: 'Posts', href: '/posts' },
  ];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return defaultItems;
  }

  const result: NavItem[] = [];
  for (let i = 0; i < 4; i++) {
    const existing = items[i];
    result.push({
      title: existing?.title !== undefined && existing?.title !== null ? String(existing.title) : defaultItems[i].title,
      href: existing?.href ? String(existing.href) : defaultItems[i].href,
    });
  }
  return result;
}

// Default site data is identical to cleanSiteData (purely empty and clean)
export const defaultSiteData: SiteData = {
  ...cleanSiteData,
  header: {
    ...cleanSiteData.header,
    navItems: [...cleanSiteData.header.navItems],
  },
  footer: {
    ...cleanSiteData.footer,
    socialLinks: [...cleanSiteData.footer.socialLinks],
  },
  home: {
    ...cleanSiteData.home,
  },
  about: {
    ...cleanSiteData.about,
    skills: [...cleanSiteData.about.skills],
    experiences: [...cleanSiteData.about.experiences],
  },
  projects: {
    ...cleanSiteData.projects,
    items: [...cleanSiteData.projects.items],
  },
  posts: {
    ...cleanSiteData.posts,
    items: [...cleanSiteData.posts.items],
  },
  settings: {
    ...cleanSiteData.settings,
  },
  stats: {
    ...cleanSiteStats,
  },
};

export const LOCAL_CACHE_KEY = 'portfolio_site_data_cache_v1';

// Helper to safely read cached data synchronously from browser localStorage
export function getCachedSiteData(): SiteData {
  if (typeof window === 'undefined') {
    return cleanSiteData;
  }
  try {
    const cached = localStorage.getItem(LOCAL_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return {
          header: {
            siteName: parsed.header?.siteName ?? '',
            author: parsed.header?.author ?? '',
            navItems: normalizeNavItems(parsed.header?.navItems),
          },
          footer: {
            copyright: parsed.footer?.copyright ?? '',
            socialLinks: parsed.footer?.socialLinks ?? [],
          },
          home: {
            greeting: parsed.home?.greeting ?? '',
            description: parsed.home?.description ?? '',
            viewAboutBtn: parsed.home?.viewAboutBtn ?? 'View About',
            readPostsBtn: parsed.home?.readPostsBtn ?? 'Read Posts',
            heroImage: parsed.home?.heroImage ?? '',
          },
          about: {
            title: parsed.about?.title ?? 'About',
            description: parsed.about?.description ?? '',
            profileImage: parsed.about?.profileImage ?? '',
            skills: parsed.about?.skills ?? [],
            experienceTitle: parsed.about?.experienceTitle ?? 'Work Experience',
            experiences: parsed.about?.experiences ?? [],
            connectTitle: parsed.about?.connectTitle ?? "Let's Connect",
            connectDescription: parsed.about?.connectDescription ?? '',
            emailUrl: parsed.about?.emailUrl ?? '',
            twitterUrl: parsed.about?.twitterUrl ?? '',
            resumeUrl: parsed.about?.resumeUrl ?? '',
            certificateUrl: parsed.about?.certificateUrl ?? '',
          },
          projects: {
            title: parsed.projects?.title ?? 'Projects',
            description: parsed.projects?.description ?? '',
            items: parsed.projects?.items ?? [],
          },
          posts: {
            title: parsed.posts?.title ?? 'Posts',
            description: parsed.posts?.description ?? '',
            searchPlaceholder: parsed.posts?.searchPlaceholder ?? 'Search posts by title...',
            items: parsed.posts?.items ?? [],
          },
          settings: {
            themeMode: parsed.settings?.themeMode ?? 'dark',
          },
          stats: {
            totalVisits: parsed.stats?.totalVisits ?? 0,
            homeVisits: parsed.stats?.homeVisits ?? 0,
            aboutVisits: parsed.stats?.aboutVisits ?? 0,
            projectsVisits: parsed.stats?.projectsVisits ?? 0,
            postsVisits: parsed.stats?.postsVisits ?? 0,
            adminVisits: parsed.stats?.adminVisits ?? 0,
            uploadsCount: parsed.stats?.uploadsCount ?? 0,
            downloadsCount: parsed.stats?.downloadsCount ?? 0,
            lastUpdated: parsed.stats?.lastUpdated,
          },
        };
      }
    }
  } catch (e) {
    console.warn('Error reading from localStorage cache:', e);
  }
  return cleanSiteData;
}

// Helper to save site data to browser localStorage
export function saveToLocalCache(data: SiteData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Error saving to localStorage cache:', e);
  }
}

export function isUsingSampleData(data?: SiteData): boolean {
  if (!data) return false;
  const isDefaultGreeting = Boolean(data.home?.greeting && data.home.greeting.includes("Kai"));
  const isDefaultHero = Boolean(data.home?.heroImage && data.home.heroImage.includes('tech-background'));
  const isDefaultCoder = Boolean(data.about?.profileImage && data.about.profileImage.includes('coder.jpg'));
  const isDefaultProjects = Boolean(data.projects?.items?.some(p => p.imageUrl?.includes('/assets/images/projects/')));
  const isDefaultPosts = Boolean(data.posts?.items?.some(p => p.imageUrl?.includes('/assets/images/posts/')));
  const isDefaultAuthor = data.header?.author === "Kai" || data.header?.author === "Your Name";
  return isDefaultGreeting || isDefaultHero || isDefaultCoder || isDefaultProjects || isDefaultPosts || isDefaultAuthor;
}

interface SiteDataContextType {
  siteData: SiteData;
  loading: boolean;
  updateSiteData: (newData: SiteData) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  cleanAllSampleData: () => Promise<void>;
  recordVisit: (pageName: 'home' | 'about' | 'projects' | 'posts' | 'admin') => Promise<void>;
  recordActivity: (type: 'upload' | 'download') => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  // Synchronously initialize state from instant local cache (0ms delay / zero flash)
  const [siteData, setSiteData] = useState<SiteData>(getCachedSiteData);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Realtime listener to Firestore document `site_content/main`
    const docRef = doc(db, 'site_content', 'main');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Partial<SiteData>;
          const mergedData: SiteData = {
            header: {
              siteName: remoteData.header?.siteName ?? '',
              author: remoteData.header?.author ?? '',
              navItems: normalizeNavItems(remoteData.header?.navItems),
            },
            footer: {
              copyright: remoteData.footer?.copyright ?? '',
              socialLinks: remoteData.footer?.socialLinks ?? [],
            },
            home: {
              greeting: remoteData.home?.greeting ?? '',
              description: remoteData.home?.description ?? '',
              viewAboutBtn: remoteData.home?.viewAboutBtn ?? 'View About',
              readPostsBtn: remoteData.home?.readPostsBtn ?? 'Read Posts',
              heroImage: remoteData.home?.heroImage ?? '',
            },
            about: {
              title: remoteData.about?.title ?? 'About',
              description: remoteData.about?.description ?? '',
              profileImage: remoteData.about?.profileImage ?? '',
              skills: remoteData.about?.skills ?? [],
              experienceTitle: remoteData.about?.experienceTitle ?? 'Work Experience',
              experiences: remoteData.about?.experiences ?? [],
              connectTitle: remoteData.about?.connectTitle ?? "Let's Connect",
              connectDescription: remoteData.about?.connectDescription ?? '',
              emailUrl: remoteData.about?.emailUrl ?? '',
              twitterUrl: remoteData.about?.twitterUrl ?? '',
              resumeUrl: remoteData.about?.resumeUrl ?? '',
              certificateUrl: remoteData.about?.certificateUrl ?? '',
            },
            projects: {
              title: remoteData.projects?.title ?? 'Projects',
              description: remoteData.projects?.description ?? '',
              items: remoteData.projects?.items ?? [],
            },
            posts: {
              title: remoteData.posts?.title ?? 'Posts',
              description: remoteData.posts?.description ?? '',
              searchPlaceholder: remoteData.posts?.searchPlaceholder ?? 'Search posts by title...',
              items: remoteData.posts?.items ?? [],
            },
            settings: {
              themeMode: remoteData.settings?.themeMode ?? 'dark',
            },
            stats: {
              totalVisits: remoteData.stats?.totalVisits ?? 0,
              homeVisits: remoteData.stats?.homeVisits ?? 0,
              aboutVisits: remoteData.stats?.aboutVisits ?? 0,
              projectsVisits: remoteData.stats?.projectsVisits ?? 0,
              postsVisits: remoteData.stats?.postsVisits ?? 0,
              adminVisits: remoteData.stats?.adminVisits ?? 0,
              uploadsCount: remoteData.stats?.uploadsCount ?? 0,
              downloadsCount: remoteData.stats?.downloadsCount ?? 0,
              lastUpdated: remoteData.stats?.lastUpdated,
            },
          };

          setSiteData(mergedData);
          saveToLocalCache(mergedData);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore site_content snapshot error, using cached / clean data:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSiteData = async (newData: SiteData) => {
    // Instantly update local state and localStorage cache
    setSiteData(newData);
    saveToLocalCache(newData);

    const docRef = doc(db, 'site_content', 'main');
    await setDoc(docRef, newData, { merge: true });
  };

  const resetToDefaults = async () => {
    // Reset to clean empty data
    setSiteData(cleanSiteData);
    saveToLocalCache(cleanSiteData);

    const docRef = doc(db, 'site_content', 'main');
    await setDoc(docRef, cleanSiteData);
  };

  const cleanAllSampleData = async () => {
    setSiteData(cleanSiteData);
    saveToLocalCache(cleanSiteData);

    const docRef = doc(db, 'site_content', 'main');
    await setDoc(docRef, cleanSiteData);
  };

  const recordVisit = async (pageName: 'home' | 'about' | 'projects' | 'posts' | 'admin') => {
    try {
      const docRef = doc(db, 'site_content', 'main');
      const pageKey = `${pageName}Visits`;
      await updateDoc(docRef, {
        'stats.totalVisits': increment(1),
        [`stats.${pageKey}`]: increment(1),
        'stats.lastUpdated': new Date().toISOString(),
      });
    } catch (e) {
      setSiteData((prev) => {
        const next = {
          ...prev,
          stats: {
            ...prev.stats,
            totalVisits: prev.stats.totalVisits + 1,
            [`${pageName}Visits`]: (prev.stats[`${pageName}Visits` as keyof SiteStats] as number || 0) + 1,
          },
        };
        saveToLocalCache(next);
        return next;
      });
    }
  };

  const recordActivity = async (type: 'upload' | 'download') => {
    try {
      const docRef = doc(db, 'site_content', 'main');
      const key = type === 'upload' ? 'stats.uploadsCount' : 'stats.downloadsCount';
      await updateDoc(docRef, {
        [key]: increment(1),
        'stats.lastUpdated': new Date().toISOString(),
      });
    } catch (e) {
      setSiteData((prev) => {
        const next = {
          ...prev,
          stats: {
            ...prev.stats,
            [type === 'upload' ? 'uploadsCount' : 'downloadsCount']:
              (prev.stats[type === 'upload' ? 'uploadsCount' : 'downloadsCount'] || 0) + 1,
          },
        };
        saveToLocalCache(next);
        return next;
      });
    }
  };

  const isReady = mounted && !loading;

  useEffect(() => {
    if (isReady) {
      const loader = document.getElementById('initial-preloader');
      if (loader) {
        loader.style.transition = 'opacity 0.25s ease-out';
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        const timer = setTimeout(() => {
          loader.style.display = 'none';
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isReady]);

  return (
    <SiteDataContext.Provider value={{ siteData, loading, updateSiteData, resetToDefaults, cleanAllSampleData, recordVisit, recordActivity }}>
      <ThemeSync />
      {children}
    </SiteDataContext.Provider>
  );
}

function ThemeSync() {
  const { siteData } = useSiteData();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const remoteTheme = siteData?.settings?.themeMode;
    if (remoteTheme && (remoteTheme === 'light' || remoteTheme === 'dark')) {
      if (theme !== remoteTheme) {
        setTheme(remoteTheme);
      }
    }
  }, [siteData?.settings?.themeMode, setTheme, theme]);

  return null;
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
}

