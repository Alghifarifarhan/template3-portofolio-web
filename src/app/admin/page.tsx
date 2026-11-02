'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User 
} from 'firebase/auth';
import { collection, doc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db, formatGoogleDriveUrl, isGoogleDriveUrl } from '@/lib/firebase';
import { useSiteData, SiteData, NavItem, SocialLink, ExperienceItem, ProjectItem, PostItem, cleanSiteData, isUsingSampleData, normalizeNavItems } from '@/context/SiteDataContext';
import Link from 'next/link';
import { Eye, EyeOff, Key, BarChart3, Eye as EyeIcon, ArrowUpCircle, ArrowDownCircle, MessageSquare, Trash2, ExternalLink, Sparkles, Eraser, ShieldCheck, Download, Upload, Database, FileJson, CheckCircle2 } from 'lucide-react';


// Helper to generate URL-safe slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Reusable Password Input with Show/Hide toggle button
function PasswordInput({
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  id,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <div className="relative w-full flex items-center">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 text-sm border rounded-lg bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2.5 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none cursor-pointer"
          title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
          aria-label={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// Google Drive Image Input Component with live preview & format detection
function DriveImageInput({
  label,
  value,
  onChange,
  placeholder = "Masukkan URL gambar atau paste link share Google Drive (Contoh: https://drive.google.com/file/d/...)...",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const isDrive = isGoogleDriveUrl(value);
  const formattedUrl = formatGoogleDriveUrl(value);

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isDrive && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="truncate">Google Drive Link Terdeteksi - Auto-converted untuk tampilan langsung!</span>
        </div>
      )}

      {value.trim() !== '' && (
        <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <div className="w-16 h-16 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 border">
            <img
              src={formattedUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-[10px] text-neutral-400">Preview</span>
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 min-w-0 flex-1">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">URL Gambar Efektif:</p>
            <p className="truncate font-mono text-[11px] select-all break-all">{formattedUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { theme, setTheme } = useTheme();
  const { siteData, updateSiteData, resetToDefaults, cleanAllSampleData, recordVisit, recordActivity } = useSiteData();

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Form State
  const [formData, setFormData] = useState<SiteData>(siteData);
  const [activeTab, setActiveTab] = useState<'stats' | 'header_footer' | 'home' | 'about' | 'projects' | 'posts' | 'comments' | 'settings'>('stats');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  // Database Import/Export State & Ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordStatus, setChangePasswordStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [changePasswordMsg, setChangePasswordMsg] = useState('');

  // Comments Management State
  const [allComments, setAllComments] = useState<{
    id: string;
    postSlug: string;
    postId?: string;
    postTitle?: string;
    name: string;
    content: string;
    createdAt: string;
  }[]>([]);
  const [commentSearch, setCommentSearch] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Sync formData with siteData when loaded or changed from Firestore
  useEffect(() => {
    setFormData(siteData);
  }, [siteData]);

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        recordVisit('admin');
      }
    });
    return () => unsubscribe();
  }, []);

  // Comments listener for Admin
  useEffect(() => {
    if (!user) return;
    try {
      const commentsRef = collection(db, 'comments');
      const unsubscribe = onSnapshot(
        commentsRef,
        (snapshot) => {
          const list: {
            id: string;
            postSlug: string;
            postId?: string;
            postTitle?: string;
            name: string;
            content: string;
            createdAt: string;
          }[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAllComments(list);
        },
        (err) => {
          console.warn("Firestore admin comments listener error:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Error setting up comments listener:", err);
    }
  }, [user]);

  const handleDeleteComment = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus komentar dari "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }
    setDeletingCommentId(id);
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err: any) {
      console.error("Error deleting comment:", err);
      alert("Gagal menghapus komentar: " + (err.message || 'Error'));
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setAuthError('Email atau password tidak valid. Pastikan akun telah didaftarkan di Firebase Auth.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Terlalu banyak percobaan login yang gagal. Silakan tunggu beberapa saat lagi.');
      } else {
        setAuthError(err.message || 'Gagal login ke Firebase Auth.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordMsg('');

    if (!user || !user.email) {
      setChangePasswordStatus('error');
      setChangePasswordMsg('Pengguna tidak terautentikasi.');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordStatus('error');
      setChangePasswordMsg('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordStatus('error');
      setChangePasswordMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    setChangePasswordStatus('loading');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setChangePasswordStatus('success');
      setChangePasswordMsg('Password admin berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setChangePasswordStatus('error');
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setChangePasswordMsg('Password saat ini salah.');
      } else if (err.code === 'auth/weak-password') {
        setChangePasswordMsg('Password terlalu lemah. Gunakan minimal 6 karakter.');
      } else if (err.code === 'auth/requires-recent-login') {
        setChangePasswordMsg('Sesi login telah lama. Silakan logout dan login kembali terlebih dahulu.');
      } else {
        setChangePasswordMsg(err.message || 'Gagal mengubah password admin.');
      }
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveMessage('');
    try {
      await updateSiteData(formData);
      await recordActivity('upload');
      setSaveStatus('saved');
      setSaveMessage('Perubahan berhasil disimpan ke Cloud Firestore!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error(err);
      setSaveStatus('error');
      setSaveMessage(err.message || 'Gagal menyimpan perubahan.');
    }
  };

  // Handle Real-time Theme Change & Sync to Firestore
  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    const updated = {
      ...formData,
      settings: {
        ...formData.settings,
        themeMode: newTheme,
      },
    };
    setFormData(updated);
    try {
      await updateSiteData(updated);
      setSaveStatus('saved');
      setSaveMessage(`Tema berhasil diubah ke ${newTheme === 'dark' ? 'Dark Mode 🌙' : 'Light Mode ☀️'} dan disinkronkan secara real-time!`);
      setTimeout(() => setSaveStatus('idle'), 3500);
    } catch (err: any) {
      console.warn("Error syncing theme to Firestore:", err);
    }
  };

  // Handle Download database.json
  const handleDownloadDatabase = async () => {
    try {
      const dataToExport = formData || siteData;
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToExport, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'database.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      await recordActivity('download');
      setSaveStatus('saved');
      setSaveMessage('File database.json berhasil diekspor dan diunduh!');
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error downloading database.json:', err);
      alert('Gagal mendownload database.json: ' + (err.message || 'Error'));
    }
  };

  // Handle Upload / Import database.json
  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so user can upload the same file again if desired
    e.target.value = '';

    if (!confirm(`Apakah Anda yakin ingin mengimpor database dari file "${file.name}"?\n\nTindakan ini akan menimpa seluruh konten dan pengaturan website dengan data yang ada di file JSON ini.`)) {
      return;
    }

    setImportStatus('loading');
    setImportMsg('Membaca dan memvalidasi file database.json...');

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Format file JSON tidak valid.');
      }

      const validatedData: SiteData = {
        header: {
          siteName: parsed.header?.siteName ?? '',
          author: parsed.header?.author ?? '',
          navItems: normalizeNavItems(parsed.header?.navItems),
        },
        footer: {
          copyright: parsed.footer?.copyright ?? '',
          socialLinks: Array.isArray(parsed.footer?.socialLinks) ? parsed.footer.socialLinks : [],
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
          skills: Array.isArray(parsed.about?.skills) ? parsed.about.skills : [],
          experienceTitle: parsed.about?.experienceTitle ?? 'Work Experience',
          experiences: Array.isArray(parsed.about?.experiences) ? parsed.about.experiences : [],
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
          items: Array.isArray(parsed.projects?.items) ? parsed.projects.items : [],
        },
        posts: {
          title: parsed.posts?.title ?? 'Posts',
          description: parsed.posts?.description ?? '',
          searchPlaceholder: parsed.posts?.searchPlaceholder ?? 'Search posts by title...',
          items: Array.isArray(parsed.posts?.items) ? parsed.posts.items : [],
        },
        settings: {
          themeMode: parsed.settings?.themeMode === 'light' ? 'light' : 'dark',
        },
        stats: {
          totalVisits: Number(parsed.stats?.totalVisits) || 0,
          homeVisits: Number(parsed.stats?.homeVisits) || 0,
          aboutVisits: Number(parsed.stats?.aboutVisits) || 0,
          projectsVisits: Number(parsed.stats?.projectsVisits) || 0,
          postsVisits: Number(parsed.stats?.postsVisits) || 0,
          adminVisits: Number(parsed.stats?.adminVisits) || 0,
          uploadsCount: Number(parsed.stats?.uploadsCount) || 0,
          downloadsCount: Number(parsed.stats?.downloadsCount) || 0,
          lastUpdated: new Date().toISOString(),
        },
      };

      setFormData(validatedData);
      await updateSiteData(validatedData);
      await recordActivity('upload');

      if (validatedData.settings.themeMode) {
        setTheme(validatedData.settings.themeMode);
      }

      setImportStatus('success');
      setImportMsg(`✨ File database "${file.name}" berhasil diimpor dan disinkronkan ke Cloud Firestore!`);
      setSaveStatus('saved');
      setSaveMessage(`✨ File "${file.name}" berhasil diimpor dan disinkronkan ke Firestore!`);
      setTimeout(() => {
        setImportStatus('idle');
        setSaveStatus('idle');
      }, 5000);
    } catch (err: any) {
      console.error('Error importing database.json:', err);
      setImportStatus('error');
      setImportMsg(err.message || 'Gagal mengimpor file database JSON.');
      alert('Gagal mengimpor database: ' + (err.message || 'Format JSON tidak valid.'));
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat Firebase Auth...</span>
        </div>
      </div>
    );
  }

  // Render Login Form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-950">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 animate-fade-in-up">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                Admin Login
              </h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Panel Manajemen Portofolio
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
            Masuk dengan Email dan Password akun Firebase Auth Anda untuk mengelola seluruh konten dan halaman website.
          </p>

          {authError && (
            <div className="mb-4 p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Email Admin
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <PasswordInput
              id="login-password"
              label="Password Admin"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />

            <button
              type="submit"
              className="mt-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-lg shadow transition-all cursor-pointer"
            >
              Masuk ke Panel Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Helper State Mutators
  const updateHeader = (fields: Partial<SiteData['header']>) => {
    setFormData((prev) => ({ ...prev, header: { ...prev.header, ...fields } }));
  };

  const updateFooter = (fields: Partial<SiteData['footer']>) => {
    setFormData((prev) => ({ ...prev, footer: { ...prev.footer, ...fields } }));
  };

  const updateHome = (fields: Partial<SiteData['home']>) => {
    setFormData((prev) => ({ ...prev, home: { ...prev.home, ...fields } }));
  };

  const updateAbout = (fields: Partial<SiteData['about']>) => {
    setFormData((prev) => ({ ...prev, about: { ...prev.about, ...fields } }));
  };

  const updateProjects = (fields: Partial<SiteData['projects']>) => {
    setFormData((prev) => ({ ...prev, projects: { ...prev.projects, ...fields } }));
  };

  const updatePosts = (fields: Partial<SiteData['posts']>) => {
    setFormData((prev) => ({ ...prev, posts: { ...prev.posts, ...fields } }));
  };

  // Cleaning Handlers
  const handleCleanAllData = async () => {
    if (confirm("⚠️ PERINGATAN PEMBERSIHAN DATA:\n\nApakah Anda yakin ingin MEMBERSIHKAN SELURUH DATA CONTOH bawaan template?\n\nTindakan ini akan:\n1. Mengosongkan teks sapaan (greeting), bio deskripsi, About, dan keahlian/skills.\n2. Menghapus seluruh proyek contoh & artikel blog contoh.\n3. Menghapus seluruh link gambar asset template (/assets/images/tech-background, coder.jpg, dll).\n4. Mengosongkan nama di navbar & link social media contoh.\n5. Mereset statistik total kunjungan menjadi 0.\n\nWebsite Anda akan langsung bersih dan siap diisi portofolio asli Anda.")) {
      try {
        setSaveStatus('saving');
        await cleanAllSampleData();
        setFormData(cleanSiteData);
        setSaveStatus('saved');
        setSaveMessage('✨ Seluruh data contoh berhasil dibersihkan! Website kini bersih dan siap diisi.');
        setTimeout(() => setSaveStatus('idle'), 5000);
      } catch (err: any) {
        console.error(err);
        setSaveStatus('error');
        setSaveMessage(err.message || 'Gagal membersihkan data contoh.');
      }
    }
  };

  const handleCleanHeader = () => {
    if (confirm("Kosongkan nama website, author navbar, dan social media links contoh?")) {
      updateHeader({ siteName: '', author: '' });
      updateFooter({ copyright: '', socialLinks: [] });
    }
  };

  const handleCleanHome = () => {
    if (confirm("Kosongkan teks sapaan (greeting), bio deskripsi, dan gambar di section Home?")) {
      updateHome({ greeting: '', description: '', heroImage: '' });
    }
  };

  const handleCleanAbout = () => {
    if (confirm("Kosongkan teks About, foto profil, dan link kontak?")) {
      updateAbout({ description: '', profileImage: '', emailUrl: '', twitterUrl: '', resumeUrl: '', certificateUrl: '', connectDescription: '' });
    }
  };

  const handleCleanSkills = () => {
    if (confirm("Kosongkan seluruh daftar skill badges?")) {
      updateAbout({ skills: [] });
    }
  };

  const handleCleanExperiences = () => {
    if (confirm("Kosongkan seluruh riwayat pengalaman kerja contoh?")) {
      updateAbout({ experiences: [] });
    }
  };

  const handleCleanProjects = () => {
    if (confirm("Kosongkan seluruh daftar proyek contoh?")) {
      updateProjects({ items: [] });
    }
  };

  const handleCleanPosts = () => {
    if (confirm("Kosongkan seluruh daftar artikel blog contoh?")) {
      updatePosts({ items: [] });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚙️</span>
            <div>
              <h1 className="text-base sm:text-lg font-bold">Admin CMS Dashboard</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[200px] sm:max-w-none">
                Logged in as <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Bersihkan Data Contoh Action */}
            <button
              onClick={handleCleanAllData}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-xs"
              title="Bersihkan seluruh data contoh bawaan website (teks, gambar asset, artikel & proyek dummy)"
            >
              <span>🧹 Bersihkan Data Contoh</span>
            </button>

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="Toggle Light / Dark Mode Real-time"
            >
              <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Lihat Web ↗
            </Link>

            <button
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow transition-all flex items-center gap-1 cursor-pointer"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>💾 Simpan Perubahan</>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Out
            </button>
          </div>
        </div>
      </header>

      {/* Sample Data Alert Banner if website still contains default template data */}
      {isUsingSampleData(formData) && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-amber-900 dark:text-amber-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>
                <strong className="font-bold">Website Masih Memuat Data Contoh Bawaan Template.</strong>
                <span className="hidden md:inline text-neutral-600 dark:text-neutral-300 ml-1.5">
                  Bersihkan seluruh teks contoh, foto dummy, asset background SVG, serta proyek & artikel bawaan dalam 1-klik agar website langsung siap diisi data asli.
                </span>
              </div>
            </div>
            <button
              onClick={handleCleanAllData}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer text-xs"
            >
              <span>🧹 Bersihkan Data Contoh Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Save status notification bar */}
      {saveMessage && (
        <div className={`px-4 py-2 text-xs text-center font-medium ${
          saveStatus === 'saved'
            ? 'bg-emerald-600 text-white'
            : saveStatus === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-indigo-600 text-white'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 items-start">
        {/* Sidebar / Top Horizontal Scroll Navigation on Mobile - Sticky on Desktop */}
        <aside className="md:col-span-1 md:sticky md:top-20 md:self-start flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto whitespace-nowrap gap-2 pb-2 md:pb-0 scrollbar-none md:max-h-[calc(100vh-6rem)]">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>📊</span> Statistik Website
          </button>

          <button
            onClick={() => setActiveTab('header_footer')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'header_footer'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>🧭</span> Header & Footer
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'home'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>🏠</span> Home Section
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'about'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>👤</span> About & Experience
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>💼</span> Projects Section
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'posts'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>📝</span> Posts & Articles
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-between gap-1.5 flex-shrink-0 ${
              activeTab === 'comments'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span>💬</span> Komentar Blog
            </div>
            {allComments.length > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'comments'
                  ? 'bg-white/20 text-white'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              }`}>
                {allComments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800'
            }`}
          >
            <span>⚙️</span> System & Theme
          </button>
        </aside>

        {/* Content Area */}
        <main className="md:col-span-3 bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm min-w-0">
          {/* TAB STATISTIK */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg sm:text-xl font-bold">Statistik Pengunjung & Aktivitas Website</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                  Realtime Sync
                </span>
              </div>

              {/* Metric Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Total Kunjungan</span>
                    <EyeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                    {siteData.stats?.totalVisits || 0}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Total akumulasi pengunjung di seluruh halaman</span>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Aktivitas Upload</span>
                    <ArrowUpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {siteData.stats?.uploadsCount || 0}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Pembaruan konten / gambar dari Admin Panel</span>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Download / View</span>
                    <ArrowDownCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                    {siteData.stats?.downloadsCount || 0}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Unduhan dokumen & rincian tampilan proyek</span>
                </div>
              </div>

              {/* Rincian Kunjungan Per Halaman */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
                <h3 className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                  Rincian Kunjungan Berdasarkan Halaman
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">Home</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{siteData.stats?.homeVisits || 0}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">About</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{siteData.stats?.aboutVisits || 0}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">Projects</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{siteData.stats?.projectsVisits || 0}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">Posts</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{siteData.stats?.postsVisits || 0}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-center">
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400">Admin</span>
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">{siteData.stats?.adminVisits || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Header, Footer & Social links */}
          {activeTab === 'header_footer' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">
                  Edit Header, Footer & Social Media Links
                </h2>
                <button
                  onClick={handleCleanHeader}
                  className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>🧹 Kosongkan Header & Social</span>
                </button>
              </div>

              {/* Header Settings */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Header & Navigasi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Nama Website</label>
                    <input
                      type="text"
                      value={formData.header.siteName}
                      onChange={(e) => updateHeader({ siteName: e.target.value })}
                      placeholder="Contoh: Portofolio John Doe"
                      className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Nama Author (Brand Logo Navbar)</label>
                    <input
                      type="text"
                      value={formData.header.author}
                      onChange={(e) => updateHeader({ author: e.target.value })}
                      placeholder="Contoh: John Doe"
                      className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Fixed 4 Nav Items */}
                <div className="mt-2">
                  <div className="flex flex-col gap-1 mb-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Menu Navigasi Website (Tepat 4 Menu)
                      </label>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                        4 Menu Terkunci
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Anda dapat mengubah teks judul masing-masing menu dan memilih tujuan section yang diarahkan.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {(() => {
                      const navList = normalizeNavItems(formData.header.navItems);
                      const sectionOptions = [
                        { label: 'Home Section (/)', value: '/' },
                        { label: 'About & Experience (/about)', value: '/about' },
                        { label: 'Projects Section (/projects)', value: '/projects' },
                        { label: 'Posts & Articles (/posts)', value: '/posts' },
                      ];
                      const defaultPlaceholders = [
                        'Contoh: Home',
                        'Contoh: About',
                        'Contoh: Projects',
                        'Contoh: Posts',
                      ];

                      return navList.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 border rounded-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 shadow-2xs"
                        >
                          <div className="flex items-center gap-1.5 sm:w-20 flex-shrink-0">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                              {index + 1}
                            </span>
                            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                              Menu
                            </span>
                          </div>

                          <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                              Teks Menu
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              placeholder={defaultPlaceholders[index] || 'Judul Menu'}
                              onChange={(e) => {
                                const newNavs = [...navList];
                                newNavs[index] = { ...newNavs[index], title: e.target.value };
                                updateHeader({ navItems: newNavs });
                              }}
                              className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
                              Pilihan Mengarah Ke Section
                            </label>
                            <select
                              value={item.href}
                              onChange={(e) => {
                                const newNavs = [...navList];
                                newNavs[index] = { ...newNavs[index], href: e.target.value };
                                updateHeader({ navItems: newNavs });
                              }}
                              className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                              {sectionOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Footer & Social Links Settings */}
              <div className="flex flex-col gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Footer & Social Media Links</h3>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Teks Hak Cipta Kustom / Pemilik Situs</label>
                  <input
                    type="text"
                    value={formData.footer.copyright}
                    onChange={(e) => updateFooter({ copyright: e.target.value })}
                    placeholder="Contoh: © 2025 John Doe. All rights reserved."
                    className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>
                      <strong className="font-semibold">Kredit Template Terkunci:</strong> Teks &ldquo;All rights reserved by <a href="https://github.com/tomcomtang" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-950 dark:hover:text-amber-100">tomcomtang</a> Distributed by <a href="https://themewagon.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-950 dark:hover:text-amber-100">ThemeWagon</a>.&rdquo; terpasang permanen di footer web dan tidak dapat diubah atau dihapus.
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Link Social Media Opsional</label>
                    <button
                      onClick={() => {
                        const newSocials = [
                          { id: Date.now().toString(), platform: 'github', name: 'GitHub', url: 'https://github.com' },
                          ...formData.footer.socialLinks,
                        ];
                        updateFooter({ socialLinks: newSocials });
                      }}
                      className="text-xs px-2.5 py-1 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg font-medium cursor-pointer"
                    >
                      + Tambah Social Link
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {formData.footer.socialLinks.map((item, index) => (
                      <div key={item.id || index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 border rounded-lg border-neutral-200 dark:border-neutral-800">
                        <select
                          value={item.platform}
                          onChange={(e) => {
                            const newSocials = [...formData.footer.socialLinks];
                            newSocials[index].platform = e.target.value;
                            updateFooter({ socialLinks: newSocials });
                          }}
                          className="px-2.5 py-1 text-xs border rounded bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700"
                        >
                          <option value="twitter">Twitter / X</option>
                          <option value="github">GitHub</option>
                          <option value="email">Email</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="instagram">Instagram</option>
                          <option value="youtube">YouTube</option>
                          <option value="custom">Web / Lainnya</option>
                        </select>

                        <input
                          type="text"
                          value={item.name}
                          placeholder="Nama Label (Contoh: GitHub)"
                          onChange={(e) => {
                            const newSocials = [...formData.footer.socialLinks];
                            newSocials[index].name = e.target.value;
                            updateFooter({ socialLinks: newSocials });
                          }}
                          className="w-full sm:w-44 px-2.5 py-1 text-xs border rounded bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700"
                        />

                        <input
                          type="text"
                          value={item.url}
                          placeholder="URL (Contoh: https://github.com/user atau mailto:name@example.com)"
                          onChange={(e) => {
                            const newSocials = [...formData.footer.socialLinks];
                            newSocials[index].url = e.target.value;
                            updateFooter({ socialLinks: newSocials });
                          }}
                          className="flex-1 px-2.5 py-1 text-xs border rounded bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700"
                        />

                        <button
                          onClick={() => {
                            const newSocials = formData.footer.socialLinks.filter((_, i) => i !== index);
                            updateFooter({ socialLinks: newSocials });
                          }}
                          className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded self-end sm:self-auto cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Home Section */}
          {activeTab === 'home' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">
                  Edit Section Home
                </h2>
                <button
                  onClick={handleCleanHome}
                  className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>🧹 Kosongkan Data Home</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Teks Greeting (Sapaan Utama)</label>
                <input
                  type="text"
                  value={formData.home.greeting}
                  onChange={(e) => updateHome({ greeting: e.target.value })}
                  placeholder="Contoh: Halo! Saya John Doe, Software Engineer & Web Developer."
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Deskripsi Singkat Bio</label>
                <textarea
                  rows={3}
                  value={formData.home.description}
                  onChange={(e) => updateHome({ description: e.target.value })}
                  placeholder="Contoh: Saya seorang web developer yang berfokus membangun aplikasi web modern, cepat, dan responsif dengan teknologi mutakhir..."
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Label Tombol 1 (View About)</label>
                  <input
                    type="text"
                    value={formData.home.viewAboutBtn}
                    onChange={(e) => updateHome({ viewAboutBtn: e.target.value })}
                    placeholder="Contoh: View About"
                    className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Label Tombol 2 (Read Posts)</label>
                  <input
                    type="text"
                    value={formData.home.readPostsBtn}
                    onChange={(e) => updateHome({ readPostsBtn: e.target.value })}
                    placeholder="Contoh: Read Posts"
                    className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <DriveImageInput
                label="Foto Banner / Gambar Hero Utama (Link Google Drive / Image URL)"
                value={formData.home.heroImage || ''}
                onChange={(val) => updateHome({ heroImage: val })}
                placeholder="Masukkan URL foto atau paste link share Google Drive (Contoh: https://drive.google.com/file/d/...)..."
              />
            </div>
          )}

          {/* TAB 3: About Section */}
          {activeTab === 'about' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">
                  Edit Halaman About & Pengalaman Kerja
                </h2>
                <button
                  onClick={handleCleanAbout}
                  className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>🧹 Kosongkan Data About</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Section About</label>
                  <input
                    type="text"
                    value={formData.about.title}
                    onChange={(e) => updateAbout({ title: e.target.value })}
                    placeholder="Contoh: About"
                    className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Experience Section</label>
                  <input
                    type="text"
                    value={formData.about.experienceTitle}
                    onChange={(e) => updateAbout({ experienceTitle: e.target.value })}
                    placeholder="Contoh: Work Experience"
                    className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Deskripsi Lengkap About</label>
                <textarea
                  rows={4}
                  value={formData.about.description}
                  onChange={(e) => updateAbout({ description: e.target.value })}
                  placeholder="Contoh: Tuliskan biografi lengkap Anda, latar belakang keahlian, minat di dunia teknologi, dan cerita perjalanan karir Anda..."
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <DriveImageInput
                label="Foto Profil About (Link Google Drive / Image URL)"
                value={formData.about.profileImage}
                onChange={(val) => updateAbout({ profileImage: val })}
                placeholder="Masukkan URL foto profil atau paste link share Google Drive..."
              />

              {/* Skills Badges */}
              <div className="flex flex-col gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Daftar Keahlian / Skills Badges</label>
                  {formData.about.skills.length > 0 && (
                    <button
                      onClick={handleCleanSkills}
                      className="text-[11px] text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      Hapus Semua Skill
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {formData.about.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-xs font-medium rounded-full border border-neutral-300 dark:border-neutral-700">
                      {skill}
                      <button
                        onClick={() => {
                          const newSkills = formData.about.skills.filter((_, i) => i !== index);
                          updateAbout({ skills: newSkills });
                        }}
                        className="hover:text-red-500 ml-1 font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const newSkill = prompt('Masukkan nama keahlian/skill baru (Contoh: React.js, TypeScript, Next.js):');
                      if (newSkill && newSkill.trim() !== '') {
                        updateAbout({ skills: [newSkill.trim(), ...formData.about.skills] });
                      }
                    }}
                    className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full font-semibold hover:bg-indigo-100 cursor-pointer"
                  >
                    + Tambah Skill
                  </button>
                </div>
              </div>

              {/* Work Experience Timeline */}
              <div className="flex flex-col gap-3 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Riwayat Pengalaman Kerja</h3>
                  <div className="flex items-center gap-2">
                    {formData.about.experiences.length > 0 && (
                      <button
                        onClick={handleCleanExperiences}
                        className="text-xs px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg font-medium cursor-pointer"
                      >
                        Kosongkan Pengalaman
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const isSample = formData.about.experiences.some(e => e.company?.includes('TechCorp') || e.company?.includes('Digital Agency') || e.company?.includes('Startup Hub'));
                        const baseList = isSample ? [] : formData.about.experiences;
                        const newExps = [
                          {
                            id: Date.now().toString(),
                            period: `${new Date().getFullYear()} - PRESENT`,
                            role: 'Role / Posisi',
                            company: 'Nama Perusahaan',
                            description: 'Deskripsi pekerjaan dan pencapaian Anda.',
                          },
                          ...baseList,
                        ];
                        updateAbout({ experiences: newExps });
                      }}
                      className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium cursor-pointer shadow-xs"
                    >
                      + Tambah Experience
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {formData.about.experiences.map((exp, index) => (
                    <div key={exp.id || index} className="p-3 sm:p-4 border rounded-xl border-neutral-200 dark:border-neutral-800 flex flex-col gap-2 relative bg-neutral-50/50 dark:bg-neutral-950/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-500">Experience #{index + 1}</span>
                        <button
                          onClick={() => {
                            const newExps = formData.about.experiences.filter((_, i) => i !== index);
                            updateAbout({ experiences: newExps });
                          }}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Periode (Contoh: 2023 - PRESENT)"
                          value={exp.period}
                          onChange={(e) => {
                            const newExps = [...formData.about.experiences];
                            newExps[index].period = e.target.value;
                            updateAbout({ experiences: newExps });
                          }}
                          className="px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Role / Jabatan (Contoh: Senior Frontend Developer)"
                          value={exp.role}
                          onChange={(e) => {
                            const newExps = [...formData.about.experiences];
                            newExps[index].role = e.target.value;
                            updateAbout({ experiences: newExps });
                          }}
                          className="px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Perusahaan / Instansi (Contoh: PT Teknologi Maju)"
                          value={exp.company}
                          onChange={(e) => {
                            const newExps = [...formData.about.experiences];
                            newExps[index].company = e.target.value;
                            updateAbout({ experiences: newExps });
                          }}
                          className="px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Deskripsi tugas dan rincian pekerjaan (Contoh: Mengembangkan fitur utama web dengan Next.js dan Tailwind...)"
                        value={exp.description}
                        onChange={(e) => {
                          const newExps = [...formData.about.experiences];
                          newExps[index].description = e.target.value;
                          updateAbout({ experiences: newExps });
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Connect Section */}
              <div className="flex flex-col gap-3 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Bagian Kontak / Connect Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Connect</label>
                    <input
                      type="text"
                      value={formData.about.connectTitle}
                      onChange={(e) => updateAbout({ connectTitle: e.target.value })}
                      placeholder="Contoh: Let's Connect"
                      className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Email Contact Link</label>
                    <input
                      type="text"
                      value={formData.about.emailUrl}
                      onChange={(e) => updateAbout({ emailUrl: e.target.value })}
                      placeholder="Contoh: mailto:johndoe@example.com"
                      className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Link My Resume (PDF / Google Drive)</label>
                    <input
                      type="text"
                      value={formData.about.resumeUrl || ''}
                      onChange={(e) => updateAbout({ resumeUrl: e.target.value, twitterUrl: e.target.value })}
                      placeholder="Contoh: https://drive.google.com/file/d/... atau /assets/resume.pdf"
                      className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Link My Certificate (Opsional)</label>
                    <input
                      type="text"
                      value={formData.about.certificateUrl || ''}
                      onChange={(e) => updateAbout({ certificateUrl: e.target.value })}
                      placeholder="Contoh: https://credential.net/... atau paste link Google Drive (opsional)"
                      className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Deskripsi Connect</label>
                  <textarea
                    rows={2}
                    value={formData.about.connectDescription}
                    onChange={(e) => updateAbout({ connectDescription: e.target.value })}
                    placeholder="Contoh: Terbuka untuk diskusi proyek baru, kolaborasi kreatif, maupun konsultasi pengembangan web..."
                    className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Projects Section */}
          {activeTab === 'projects' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Edit Section Projects</h2>
                <div className="flex items-center gap-2">
                  {formData.projects.items.length > 0 && (
                    <button
                      onClick={handleCleanProjects}
                      className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>🧹 Kosongkan Semua Proyek</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const isSample = formData.projects.items.some(p => p.imageUrl?.includes('/assets/images/projects/'));
                      const baseList = isSample ? [] : formData.projects.items;
                      const newProjects = [
                        {
                          id: Date.now().toString(),
                          title: 'Project Baru',
                          description: 'Deskripsi singkat project baru Anda...',
                          longDescription: 'Rincian dan fitur lengkap dari project baru Anda...',
                          href: 'https://',
                          imageUrl: '',
                        },
                        ...baseList,
                      ];
                      updateProjects({ items: newProjects });
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow cursor-pointer"
                  >
                    + Tambah Project Baru
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Section Projects</label>
                <input
                  type="text"
                  value={formData.projects.title}
                  onChange={(e) => updateProjects({ title: e.target.value })}
                  placeholder="Contoh: Projects"
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Deskripsi Subtitle Projects</label>
                <textarea
                  rows={2}
                  value={formData.projects.description}
                  onChange={(e) => updateProjects({ description: e.target.value })}
                  placeholder="Contoh: Kumpulan proyek terbaik dan aplikasi web yang telah saya kembangkan..."
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Projects List Cards */}
              <div className="flex flex-col gap-6 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Daftar Project Cards ({formData.projects.items.length})</h3>
                {formData.projects.items.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                    Belum ada project di daftar ini. Klik tombol <strong>+ Tambah Project Baru</strong> di atas untuk menambahkan.
                  </div>
                ) : (
                  formData.projects.items.map((proj, index) => (
                    <div key={proj.id || index} className="p-3 sm:p-4 border rounded-xl border-neutral-200 dark:border-neutral-800 flex flex-col gap-3 bg-neutral-50/50 dark:bg-neutral-950/50">
                      <div className="flex items-center justify-between border-b pb-2 border-neutral-200 dark:border-neutral-800">
                        <span className="text-xs font-bold text-neutral-500">Project #{index + 1}: {proj.title}</span>
                        <button
                          onClick={() => {
                            const newProjects = formData.projects.items.filter((_, i) => i !== index);
                            updateProjects({ items: newProjects });
                          }}
                          className="text-xs text-red-600 hover:underline cursor-pointer"
                        >
                          Hapus Project
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Project</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const newProjects = [...formData.projects.items];
                              newProjects[index].title = e.target.value;
                              updateProjects({ items: newProjects });
                            }}
                            placeholder="Contoh: E-Commerce Store Platform"
                            className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Target Link URL Project</label>
                          <input
                            type="text"
                            value={proj.href}
                            onChange={(e) => {
                              const newProjects = [...formData.projects.items];
                              newProjects[index].href = e.target.value;
                              updateProjects({ items: newProjects });
                            }}
                            placeholder="Contoh: https://project-demo.com atau https://github.com/user/repo"
                            className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Deskripsi Singkat (Tampil di Card)</label>
                        <input
                          type="text"
                          value={proj.description}
                          onChange={(e) => {
                            const newProjects = [...formData.projects.items];
                            newProjects[index].description = e.target.value;
                            updateProjects({ items: newProjects });
                          }}
                          placeholder="Contoh: Platform toko online modern dengan integrasi pembayaran otomatis dan CMS..."
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Deskripsi Rinci Lengkap (Tampil di Popup Modal ketika diklik)</label>
                        <textarea
                          rows={3}
                          placeholder="Contoh: Tuliskan deskripsi lengkap mengenai latar belakang proyek, arsitektur sistem, teknologi (Next.js, Tailwind, Firebase), fitur utama, dan tautan demo..."
                          value={proj.longDescription || ''}
                          onChange={(e) => {
                            const newProjects = [...formData.projects.items];
                            newProjects[index].longDescription = e.target.value;
                            updateProjects({ items: newProjects });
                          }}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                        />
                      </div>

                      <DriveImageInput
                        label="Foto Thumbnail Project (Link Google Drive / Image URL)"
                        value={proj.imageUrl}
                        onChange={(val) => {
                          const newProjects = [...formData.projects.items];
                          newProjects[index].imageUrl = val;
                          updateProjects({ items: newProjects });
                        }}
                        placeholder="Masukkan URL screenshot project atau paste link Google Drive..."
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Posts Section */}
          {activeTab === 'posts' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-2">
                <h2 className="text-lg sm:text-xl font-bold">Edit Halaman Posts & Articles</h2>
                <div className="flex items-center gap-2">
                  {formData.posts.items.length > 0 && (
                    <button
                      onClick={handleCleanPosts}
                      className="px-3 py-1.5 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>🧹 Kosongkan Semua Artikel</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const isSample = formData.posts.items.some(p => p.imageUrl?.includes('/assets/images/posts/'));
                      const baseList = isSample ? [] : formData.posts.items;
                      const defaultTitle = 'Artikel Baru';
                      const defaultSlug = slugify(defaultTitle);
                      const newPosts = [
                        {
                          id: Date.now().toString(),
                          title: defaultTitle,
                          description: 'Ringkasan singkat tentang isi artikel baru anda.',
                          content: 'Tuliskan isi konten lengkap artikel anda di sini...',
                          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                          slug: `posts/${defaultSlug}`,
                          readingTime: 5,
                          imageUrl: '',
                          createdAt: new Date().toISOString(),
                        },
                        ...baseList,
                      ];
                      updatePosts({ items: newPosts });
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow cursor-pointer"
                  >
                    + Tambah Artikel Baru
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Section Posts</label>
                <input
                  type="text"
                  value={formData.posts.title}
                  onChange={(e) => updatePosts({ title: e.target.value })}
                  placeholder="Contoh: Posts"
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Placeholder Pencarian Artikel</label>
                <input
                  type="text"
                  value={formData.posts.searchPlaceholder}
                  onChange={(e) => updatePosts({ searchPlaceholder: e.target.value })}
                  placeholder="Contoh: Search posts by title..."
                  className="w-full mt-1 px-3 py-2 text-xs sm:text-sm border rounded-lg bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Posts List */}
              <div className="flex flex-col gap-6 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <h3 className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Daftar Artikel Blog ({formData.posts.items.length})</h3>
                {formData.posts.items.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                    Belum ada artikel di daftar ini. Klik tombol <strong>+ Tambah Artikel Baru</strong> di atas untuk menulis artikel.
                  </div>
                ) : (
                  formData.posts.items.map((post, index) => (
                  <div key={post.id || index} className="p-3 sm:p-4 border rounded-xl border-neutral-200 dark:border-neutral-800 flex flex-col gap-3 bg-neutral-50/50 dark:bg-neutral-950/50">
                    <div className="flex items-center justify-between border-b pb-2 border-neutral-200 dark:border-neutral-800">
                      <span className="text-xs font-bold text-neutral-500">Post #{index + 1}: {post.title}</span>
                      <button
                        onClick={() => {
                          const newPosts = formData.posts.items.filter((_, i) => i !== index);
                          updatePosts({ items: newPosts });
                        }}
                        className="text-xs text-red-600 hover:underline cursor-pointer"
                      >
                        Hapus Post
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Judul Artikel</label>
                        <input
                          type="text"
                          value={post.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            const newPosts = [...formData.posts.items];
                            const prevAutoSlug = `posts/${slugify(post.title)}`;
                            const currentSlug = post.slug;
                            newPosts[index].title = newTitle;
                            // Auto-update slug if it was empty or matched the auto slug from previous title
                            if (!currentSlug || currentSlug === prevAutoSlug || currentSlug === slugify(post.title) || currentSlug.startsWith('post-')) {
                              newPosts[index].slug = `posts/${slugify(newTitle)}`;
                            }
                            updatePosts({ items: newPosts });
                          }}
                          placeholder="Contoh: Panduan Membangun Website Cepat dengan Next.js & Tailwind"
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Slug URL (/posts/slug)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const newPosts = [...formData.posts.items];
                              newPosts[index].slug = `posts/${slugify(post.title)}`;
                              updatePosts({ items: newPosts });
                            }}
                            title="Otomatis buat slug dari judul artikel"
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                          >
                            Auto dari Judul
                          </button>
                        </div>
                        <input
                          type="text"
                          value={post.slug}
                          placeholder={`posts/${slugify(post.title || 'slug-artikel')}`}
                          onChange={(e) => {
                            const newPosts = [...formData.posts.items];
                            newPosts[index].slug = e.target.value;
                            updatePosts({ items: newPosts });
                          }}
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Tanggal Publikasi</label>
                        <input
                          type="text"
                          value={post.date}
                          onChange={(e) => {
                            const newPosts = [...formData.posts.items];
                            newPosts[index].date = e.target.value;
                            updatePosts({ items: newPosts });
                          }}
                          placeholder="Contoh: May 24, 2025"
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Estimasi Menit Baca</label>
                        <input
                          type="number"
                          value={post.readingTime}
                          onChange={(e) => {
                            const newPosts = [...formData.posts.items];
                            newPosts[index].readingTime = Number(e.target.value);
                            updatePosts({ items: newPosts });
                          }}
                          placeholder="5"
                          className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Ringkasan / Description (Tampil di Card & Share Social Media)</label>
                      <textarea
                        rows={2}
                        value={post.description}
                        onChange={(e) => {
                          const newPosts = [...formData.posts.items];
                          newPosts[index].description = e.target.value;
                          updatePosts({ items: newPosts });
                        }}
                        placeholder="Contoh: Ringkasan menarik artikel yang akan tampil di kartu daftar postingan dan preview media sosial (WhatsApp, Twitter, Facebook)..."
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Isi Konten Rinci Artikel (Tampil di Halaman Detail Post)</label>
                      <textarea
                        rows={6}
                        placeholder="Contoh: Tuliskan isi artikel lengkap di sini. Mendukung pemisahan paragraf dan format Markdown seperti # Heading, - List, **Bold**, dll..."
                        value={post.content || ''}
                        onChange={(e) => {
                          const newPosts = [...formData.posts.items];
                          newPosts[index].content = e.target.value;
                          updatePosts({ items: newPosts });
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border rounded bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <DriveImageInput
                      label="Foto Thumbnail Post (Link Google Drive / Image URL)"
                      value={post.imageUrl}
                      onChange={(val) => {
                        const newPosts = [...formData.posts.items];
                        newPosts[index].imageUrl = val;
                        updatePosts({ items: newPosts });
                      }}
                      placeholder="Masukkan URL gambar cover artikel atau paste link Google Drive..."
                    />
                  </div>
                ))
              )}
              </div>
            </div>
          )}

          {/* TAB: Comments Management */}
          {activeTab === 'comments' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-lg sm:text-xl font-bold">Kelola Komentar Blog & Diskusi Publik</h2>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800">
                  Total: {allComments.length} Komentar
                </span>
              </div>

              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Cari komentar berdasarkan nama, isi komentar, atau judul artikel..."
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border rounded-xl bg-neutral-50 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Comments List */}
              <div className="flex flex-col gap-3">
                {(() => {
                  const filtered = allComments.filter((c) =>
                    c.name?.toLowerCase().includes(commentSearch.toLowerCase()) ||
                    c.content?.toLowerCase().includes(commentSearch.toLowerCase()) ||
                    (c.postTitle && c.postTitle.toLowerCase().includes(commentSearch.toLowerCase())) ||
                    (c.postSlug && c.postSlug.toLowerCase().includes(commentSearch.toLowerCase()))
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                        {commentSearch ? "Tidak ada komentar yang cocok dengan pencarian." : "Belum ada komentar yang masuk dari pengunjung."}
                      </div>
                    );
                  }

                  return filtered.map((c) => {
                    const cleanSlug = c.postSlug?.replace(/^posts\//, '').replace(/^\//, '') || '';
                    return (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex flex-col sm:flex-row items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-indigo-200 dark:border-indigo-800">
                            {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white">
                                {c.name}
                              </span>
                              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : ''}
                              </span>
                            </div>

                            {/* Linked Post Title */}
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                              <span>Pada artikel:</span>
                              <Link
                                href={`/posts/${cleanSlug}`}
                                target="_blank"
                                className="hover:underline flex items-center gap-1 max-w-[280px] sm:max-w-md truncate"
                              >
                                <span>{c.postTitle || c.postSlug || 'Artikel'}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </Link>
                            </div>

                            <p className="mt-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                              {c.content}
                            </p>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteComment(c.id, c.name)}
                          disabled={deletingCommentId === c.id}
                          className="px-3 py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:bg-red-600 border border-red-200 dark:border-red-800/80 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0 self-end sm:self-start cursor-pointer"
                        >
                          {deletingCommentId === c.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              <span>Menghapus...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus Komentar</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* TAB 6: Settings & Reset */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6">
              <h2 className="text-lg sm:text-xl font-bold border-b border-neutral-200 dark:border-neutral-800 pb-3">
                System & Security Settings
              </h2>

              {/* Ubah Password Admin */}
              <div className="p-5 border rounded-xl border-neutral-200 dark:border-neutral-800 flex flex-col gap-4 bg-white dark:bg-neutral-900/40">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
                    Pengaturan Keamanan (Ubah Password Admin)
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ubah password akun admin Firebase Auth Anda secara berkala demi keamanan data website.
                </p>

                {changePasswordMsg && (
                  <div className={`p-3 text-xs rounded-lg border ${
                    changePasswordStatus === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  }`}>
                    {changePasswordMsg}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5 max-w-md">
                  <PasswordInput
                    id="current-password"
                    label="Password Saat Ini"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    placeholder="Masukkan password lama Anda saat ini"
                    required
                  />

                  <PasswordInput
                    id="new-password"
                    label="Password Baru"
                    value={newPassword}
                    onChange={setNewPassword}
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                    required
                  />

                  <PasswordInput
                    id="confirm-password"
                    label="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="Ketik ulang password baru Anda untuk konfirmasi"
                    required
                  />

                  <button
                    type="submit"
                    disabled={changePasswordStatus === 'loading'}
                    className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow transition-colors w-fit cursor-pointer"
                  >
                    {changePasswordStatus === 'loading' ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mengubah Password...</span>
                      </>
                    ) : (
                      <span>Ubah Password Admin</span>
                    )}
                  </button>
                </form>
              </div>

              <div className="p-4 border rounded-xl border-neutral-200 dark:border-neutral-800 flex flex-col gap-3">
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">Pengaturan Tema Website (Dark / Light Mode)</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ubah mode tampilan aplikasi secara instan dari panel admin ini. Perubahan akan disinkronkan secara real-time ke semua perangkat dan halaman web.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    ☀️ Light Mode
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    🌙 Dark Mode
                  </button>
                </div>
              </div>

              {/* Database Backup & Restore (Download & Upload database.json) */}
              <div className="p-5 border rounded-xl border-neutral-200 dark:border-neutral-800 flex flex-col gap-4 bg-white dark:bg-neutral-900/40">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                        Database Firestore Backup & Restore (JSON)
                      </h3>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Ekspor seluruh database ke file <code className="text-indigo-600 dark:text-indigo-400 font-mono">database.json</code> atau impor file JSON untuk memperbarui database secara instan.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                    Realtime Sync
                  </span>
                </div>

                {importMsg && (
                  <div className={`p-3 text-xs rounded-lg border flex items-center gap-2 ${
                    importStatus === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : importStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    {importStatus === 'loading' && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                    {importStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    <span>{importMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Download Card */}
                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                        <Download className="w-4 h-4" />
                        <span>Ekspor / Download Database</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Unduh salinan cadangan lengkap seluruh data portofolio (Header, About, Skills, Experience, Projects, Posts, Settings) dalam format file <strong className="font-mono text-neutral-800 dark:text-neutral-200">database.json</strong>.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadDatabase}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download database.json</span>
                    </button>
                  </div>

                  {/* Upload Card */}
                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                        <Upload className="w-4 h-4" />
                        <span>Impor / Upload Database</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Unggah file <strong className="font-mono text-neutral-800 dark:text-neutral-200">database.json</strong> untuk memperbarui atau memulihkan seluruh data portofolio secara otomatis dan real-time ke Cloud Firestore.
                      </p>
                    </div>

                    {/* Hidden file input for database upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json,application/json"
                      onChange={handleImportDatabase}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={importStatus === 'loading'}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {importStatus === 'loading' ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengimpor Database...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Upload database.json</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bersihkan Semua Data Contoh Card */}
              <div className="p-5 border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">🧹</span>
                  <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">
                    Bersihkan Seluruh Data Contoh Bawaan (Fresh Clean Slate)
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Mengosongkan seluruh teks contoh (sapaan, bio, about, skills, pengalaman), menghapus seluruh proyek & artikel blog dummy, menghapus link asset gambar template, serta mereset statistik kunjungan ke 0. Website Anda akan langsung bersih dan siap diisi portofolio asli Anda.
                </p>
                <div>
                  <button
                    onClick={handleCleanAllData}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🧹 Bersihkan Semua Data Contoh Sekarang</span>
                  </button>
                </div>
              </div>

              {/* Reset to Clean Initial State */}
              <div className="p-5 border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 rounded-xl flex flex-col gap-3">
                <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm">Reset ke Kondisi Bersih</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Mengembalikan seluruh konten website ke kondisi awal yang bersih (string kosong dan array kosong), siap diisi data portofolio asli.
                </p>
                <div>
                  <button
                    onClick={async () => {
                      if (confirm('Apakah Anda yakin ingin mereset seluruh data website ke kondisi bersih? Tindakan ini akan mengosongkan seluruh konten.')) {
                        await resetToDefaults();
                        alert('Data berhasil di-reset ke kondisi bersih!');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-medium text-xs rounded-lg shadow transition-all cursor-pointer"
                  >
                    Reset ke Kondisi Bersih
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
