'use client';

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatGoogleDriveUrl, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { PostItem } from "@/context/SiteDataContext";
import {
  X,
  Calendar,
  Clock,
  User as UserIcon,
  Tag,
  Share2,
  Check,
  MessageSquare,
  Send
} from "lucide-react";

interface CommentItem {
  id: string;
  postSlug: string;
  postId?: string;
  postTitle?: string;
  name: string;
  content: string;
  createdAt: string;
}

interface PostModalProps {
  post: PostItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ post, isOpen, onClose }: PostModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  // Clean slug
  const cleanSlug = post ? (post.slug || '').replace(/^posts\//, '').replace(/^\//, '') : '';
  const targetSlug = cleanSlug || (post?.id ?? '');

  // Handle closing with animation
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 220);
  };

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isClosing]);

  // Realtime comments listener from Firestore
  useEffect(() => {
    if (!isOpen || !targetSlug) {
      setComments([]);
      return;
    }

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
  }, [isOpen, targetSlug]);

  if (!isOpen && !isClosing) return null;
  if (!post) return null;
  if (!mounted || typeof document === 'undefined') return null;

  const heroImgSrc = post.imageUrl && post.imageUrl.trim() !== '' ? formatGoogleDriveUrl(post.imageUrl) : '';

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const postUrl = `${window.location.origin}/posts/${cleanSlug}`;
    const shareData = {
      title: post.title,
      text: post.description || `${post.title} - Baca selengkapnya di portofolio saya:`,
      url: postUrl,
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
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

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

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-modal-title"
      onClick={handleClose}
      className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-200 ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col max-h-[90vh] overflow-hidden ${
          isClosing ? 'animate-pop-out' : 'animate-pop-in'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/90 backdrop-blur-sm z-10 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Detail Post
              </span>
              {post.date && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  • {post.date}
                </span>
              )}
            </div>
            <h2
              id="post-modal-title"
              className="text-base sm:text-xl font-bold text-neutral-900 dark:text-white leading-snug line-clamp-2"
            >
              {post.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
              title="Salin link artikel"
              aria-label="Salin link artikel"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 hover:rotate-90 active:scale-95 transition-all cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
          {/* Metadata info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-neutral-500 dark:text-neutral-400 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
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

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
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

          {/* Featured Image */}
          {heroImgSrc && (
            <div className="w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-[16/9] border border-neutral-200 dark:border-neutral-800 shadow-sm animate-scale-in">
              <img
                src={heroImgSrc}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description Excerpt */}
          {post.description && (
            <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-600 text-sm sm:text-base italic text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {post.description}
            </div>
          )}

          {/* Main Content Markdown */}
          <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed pt-1">
            {post.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            ) : (
              <p>{post.description || "Belum ada teks konten rinci untuk artikel ini."}</p>
            )}
          </div>

          {/* ========================================================= */}
          {/* COMMENTS SECTION */}
          {/* ========================================================= */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Komentar ({comments.length})
                </h3>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Diskusi Publik
              </span>
            </div>

            {/* Comment Form */}
            <form
              onSubmit={handleCommentSubmit}
              className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col gap-3"
            >
              <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Tinggalkan Komentar Anda
              </h4>

              {submitSuccess && (
                <div className="p-2.5 text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>Terima kasih! Komentar Anda berhasil dipublikasikan.</span>
                </div>
              )}

              {submitError && (
                <div className="p-2.5 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nama Lengkap / Panggilan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Contoh: Alex Pratama"
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border rounded-xl bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Isi Komentar <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Tuliskan tanggapan, pertanyaan, atau feedback Anda mengenai artikel ini..."
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border rounded-xl bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting || !commentName.trim() || !commentText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      <span>Kirim Komentar</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div className="flex flex-col gap-3">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-800/80 flex-shrink-0">
                      {comment.name ? comment.name.charAt(0).toUpperCase() : "?"}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                          {comment.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-line leading-relaxed mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs">
                  Belum ada komentar untuk artikel ini. Jadilah yang pertama berkomentar!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-7 sm:py-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/90 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 active:scale-95 rounded-xl shadow-xs transition-all duration-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
