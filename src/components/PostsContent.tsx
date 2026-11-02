"use client";

import { useState, useEffect } from "react";
import { useSiteData, PostItem } from "@/context/SiteDataContext";
import { formatGoogleDriveUrl } from "@/lib/firebase";
import PostCard from "@/components/PostCard";
import PostModal from "@/components/PostModal";

const POSTS_PER_PAGE = 5;

export default function PostsContent() {
  const { siteData, recordVisit } = useSiteData();
  const { title, items = [] } = siteData.posts;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  useEffect(() => {
    recordVisit('posts');
  }, []);

  // Sort posts by date / upload time descending (newest first)
  const sortedPosts = [...items].sort((a, b) => {
    const parseTime = (item: typeof a) => {
      if (item.createdAt) {
        const t = new Date(item.createdAt).getTime();
        if (!isNaN(t)) return t;
      }
      if (item.date) {
        const t = new Date(item.date).getTime();
        if (!isNaN(t)) return t;
      }
      const numId = Number(item.id);
      if (!isNaN(numId) && numId > 1000000) return numId;
      return 0;
    };
    return parseTime(b) - parseTime(a);
  });

  const filteredPosts = sortedPosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return (
    <section className="relative z-20 max-w-5xl w-full mx-auto mt-24 sm:mt-32 mb-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={siteData.posts.searchPlaceholder || "Search posts..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          <svg
            className="absolute right-3 top-2.5 w-4 h-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-stretch w-full gap-5">
        {items.length === 0 ? (
          <div className="my-8 p-12 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-inner">
              ✍️
            </div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">Belum Ada Artikel</h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
              Belum ada artikel atau tulisan yang dipublikasikan. Anda dapat menambahkan artikel baru melalui Panel Admin.
            </p>
          </div>
        ) : currentPosts.length > 0 ? (
          currentPosts.map((post, index) => {
            // Normalize slug link format
            const cleanSlug = post.slug.replace(/^posts\//, '').replace(/^\//, '');
            const hasImg = post.imageUrl && post.imageUrl.trim() !== '';
            const imgUrl = hasImg ? formatGoogleDriveUrl(post.imageUrl) : '';

            return (
              <PostCard
                key={post.id || cleanSlug || index}
                title={post.title}
                description={post.description}
                date={post.date}
                href={`/posts/${cleanSlug}`}
                onClick={() => setSelectedPost(post)}
                pattern="dots"
                imageUrl={imgUrl}
                readingTime={post.readingTime}
              />
            );
          })
        ) : (
          <p className="text-center py-12 text-neutral-500 dark:text-neutral-400 text-sm">
            Tidak ada artikel yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className={`px-3 py-1 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              aria-current={index + 1 === currentPage ? "page" : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium ${
                index + 1 === currentPage
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className={`px-3 py-1 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Post Detail Popup Modal */}
      <PostModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </section>
  );
}