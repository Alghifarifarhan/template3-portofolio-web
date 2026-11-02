'use client';

import React, { useState, useEffect } from "react";
import { useSiteData } from "@/context/SiteDataContext";
import { formatGoogleDriveUrl, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare, Send, Clock, Calendar, User as UserIcon, Tag, Check, Share2 } from "lucide-react";

import { useParams } from "next/navigation";

interface CommentItem {
  id: string;
  postSlug: string;
  postId?: string;
  postTitle?: string;
  name: string;
  content: string;
  createdAt: string;
}

export default function PostContent({ slug }: { slug?: string }) {
  const { siteData, loading } = useSiteData();
  const params = useParams();

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);

  // Normalize target slug from window.location.pathname, params, or prop
  const getCleanSlug = (inputSlug?: string): string => {
    if (typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/posts\/([^/]+)/);
      if (match && match[1] && match[1] !== '_') {
        return decodeURIComponent(match[1]).replace(/^posts\//, '').replace(/^\//, '');
      }
    }
    const paramSlug = params?.slug as string;
    if (paramSlug && paramSlug !== '_') {
      return decodeURIComponent(paramSlug).replace(/^posts\//, '').replace(/^\//, '');
    }
    if (inputSlug && inputSlug !== '_') {
      return decodeURIComponent(inputSlug).replace(/^posts\//, '').replace(/^\//, '');
    }
    return '';
  };

  const [targetSlug, setTargetSlug] = useState<string>(() => getCleanSlug(slug));

  useEffect(() => {
    const resolved = getCleanSlug(slug);
    if (resolved) {
      setTargetSlug(resolved);
    }
  }, [slug, params?.slug]);

  // Realtime comments listener from Firestore
  useEffect(() => {
    if (!targetSlug || targetSlug === '_') return;

    try {
      const commentsRef = collection(db, 'comments');
      const q = query(commentsRef, where('postSlug', '==', targetSlug));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: CommentItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<CommentItem, 'id'>) });
          });
          // Sort comments newest first
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setComments(list);
        },
        (error) => {
          console.warn("Error fetching comments from Firestore:", error);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore comments listener error:", err);
    }
  }, [targetSlug]);

  // Find post matching slug
  const post = siteData?.posts?.items?.find((p) => {
    if (!p) return false;
    const cleanSlug = (p.slug || '').replace(/^posts\//, '').replace(/^\//, '');
    const cleanId = (p.id || '').toString();
    return cleanSlug === targetSlug || cleanId === targetSlug || (targetSlug && cleanSlug.toLowerCase() === targetSlug.toLowerCase());
  });

  if (loading || (!post && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat artikel...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-neutral-950">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4 text-neutral-900 dark:text-white">Artikel Tidak Ditemukan</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Maaf, artikel yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
          <Link
            href="/posts"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow text-sm transition-colors inline-flex items-center gap-2"
          >
            ← Kembali ke Semua Posts
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedHeroImg = post.imageUrl && post.imageUrl.trim() !== '' ? formatGoogleDriveUrl(post.imageUrl) : '';

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const newComment = {
        postSlug: targetSlug,
        postId: post.id || targetSlug,
        postTitle: post.title,
        name: commentName.trim(),
        content: commentText.trim(),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'comments'), newComment);
      setCommentText("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      setSubmitError(err.message || "Gagal mengirim komentar. Pastikan koneksi internet aktif.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = window.location.href;
    const shareData = {
      title: post.title,
      text: post.description || `${post.title} - Baca selengkapnya di portofolio saya:`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formatCommentDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_48px] -z-10"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[1200px] w-[1200px] rounded-full bg-neutral-400 opacity-10 blur-[100px]"></div>
      </div>

      <Navbar />

      <main className="relative z-10 flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-28 sm:mt-32 mb-16">
        <article className="flex flex-col gap-6 animate-fade-in-up">
          {/* Top Bar: Back button & Share */}
          <div className="flex items-center justify-between">
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span>← Kembali ke Semua Posts</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
              title="Bagikan link artikel"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>

          {/* Post Header */}
          <header className="flex flex-col gap-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              {post.author && (
                <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                  {post.author}
                </span>
              )}
              {post.author && <span>•</span>}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime} min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <MessageSquare className="w-3.5 h-3.5" />
                {comments.length} Komentar
              </span>
            </div>

            {/* Tags if available */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {formattedHeroImg && (
            <div className="w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 aspect-[16/9] shadow-md my-2 animate-scale-in">
              <img
                src={formattedHeroImg}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Short Description Quote / Lead */}
          {post.description && (
            <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border-l-4 border-indigo-600 text-sm sm:text-base italic text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {post.description}
            </div>
          )}

          {/* Post Content Body with ReactMarkdown */}
          <div className="prose dark:prose-invert max-w-none text-base text-neutral-800 dark:text-neutral-200 leading-relaxed pt-2">
            {post.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            ) : (
              <p>{post.description || "Belum ada teks konten rinci untuk artikel ini."}</p>
            )}
          </div>
        </article>

        {/* ========================================================= */}
        {/* PUBLIC COMMENTS SECTION */}
        {/* ========================================================= */}
        <section className="mt-16 pt-10 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Komentar ({comments.length})
              </h2>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Diskusi Publik
            </span>
          </div>

          {/* Comment Form */}
          <form
            onSubmit={handleCommentSubmit}
            className="p-5 sm:p-6 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col gap-4"
          >
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Tinggalkan Komentar Anda
            </h3>

            {submitSuccess && (
              <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Terima kasih! Komentar Anda berhasil dipublikasikan.</span>
              </div>
            )}

            {submitError && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg">
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Nama Lengkap / Panggilan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Contoh: Alex Pratama"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border rounded-xl bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Isi Komentar <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tuliskan tanggapan, pertanyaan, atau feedback Anda mengenai artikel ini..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm border rounded-xl bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !commentName.trim() || !commentText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl shadow transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Komentar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Comment List */}
          <div className="flex flex-col gap-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex items-start gap-3.5"
                >
                  {/* Initial Avatar */}
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-200 dark:border-indigo-800/80 flex-shrink-0 shadow-xs">
                    {comment.name ? comment.name.charAt(0).toUpperCase() : "?"}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {comment.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                Belum ada komentar untuk artikel ini. Jadilah yang pertama berkomentar!
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}