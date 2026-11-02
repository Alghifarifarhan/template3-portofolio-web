'use client';

import Link from "next/link";
import { formatGoogleDriveUrl } from "@/lib/firebase";

interface PostCardProps {
  title: string;
  description: string;
  date: string;
  href?: string;
  pattern?: 'dots' | 'grid' | 'waves' | 'circles';
  imageUrl?: string;
  readingTime: number;
  onClick?: () => void;
}

export default function PostCard({
  title,
  description,
  date,
  href = '#',
  pattern = 'dots',
  imageUrl = '',
  readingTime,
  onClick
}: PostCardProps) {
  const patterns = {
    dots: "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#404040_1px,transparent_1px)]",
    grid: "bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[linear-gradient(#404040_1px,transparent_1px),linear-gradient(90deg,#404040_1px,transparent_1px)]",
    waves: "bg-[linear-gradient(45deg,transparent_25%,#e5e7eb_25%,#e5e7eb_50%,transparent_50%,transparent_75%,#e5e7eb_75%)] [background-size:20px_20px] dark:bg-[linear-gradient(45deg,transparent_25%,#404040_25%,#404040_50%,transparent_50%,transparent_75%,#404040_75%)]",
    circles: "bg-[radial-gradient(circle_at_center,#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_center,#404040_1px,transparent_1px)]"
  };

  const formattedImg = imageUrl && imageUrl.trim() !== '' ? formatGoogleDriveUrl(imageUrl) : '';

  const cardContent = (
    <div className="relative border border-transparent cursor-pointer p-4 sm:p-6 group rounded-2xl">
      <div className="absolute inset-0 z-20 w-full h-full duration-300 ease-out bg-white dark:bg-neutral-950 border border-dashed rounded-2xl border-neutral-300 dark:border-neutral-700 group-hover:-translate-x-1 group-hover:-translate-y-1">
        <div className={`absolute inset-0 ${patterns[pattern]} opacity-40 rounded-2xl`}></div>
      </div>
      <div className="absolute inset-0 z-10 w-full h-full duration-300 ease-out border border-dashed rounded-2xl border-neutral-300 dark:border-neutral-700 group-hover:translate-x-1 group-hover:translate-y-1"></div>
      <div className="relative z-30 duration-300 ease-out group-hover:-translate-x-1 group-hover:-translate-y-1">
        <div className="flex flex-col-reverse sm:flex-row gap-6 sm:gap-8 items-start sm:items-center">
          <div className="flex-1 w-full">
            <h2 className="flex items-center mb-3">
              <span className="text-lg font-bold leading-tight tracking-tight sm:text-xl text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {title}
              </span>
              <svg className="group-hover:translate-x-0 flex-shrink-0 translate-y-0.5 -translate-x-1 w-4 h-4 stroke-current ml-1.5 transition-all ease-in-out duration-200 transform opacity-0 group-hover:opacity-100 text-neutral-600 dark:text-neutral-400" viewBox="0 0 13 15" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                  <g id="svg" transform="translate(0.666667, 2.333333)" stroke="currentColor" strokeWidth="2.4">
                    <g>
                      <polyline className="transition-all duration-200 ease-out opacity-0 delay-0 group-hover:opacity-100" points="5.33333333 0 10.8333333 5.5 5.33333333 11"></polyline>
                      <line className="transition-all duration-200 ease-out transform -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:ml-0" x1="10.8333333" y1="5.5" x2="0.833333333" y2="5.16666667"></line>
                    </g>
                  </g>
                </g>
              </svg>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span>Posted on {date}</span>
              <span>•</span>
              <span className="flex items-center">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {readingTime} min read
              </span>
            </div>
          </div>

          {formattedImg && (
            <div className="w-full sm:w-48 lg:w-56 h-40 sm:h-36 aspect-[16/10] rounded-xl overflow-hidden flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
              <img
                src={formattedImg}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className="block w-full text-left animate-fade-in-up focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={href} className="block w-full animate-fade-in-up">
      {cardContent}
    </Link>
  );
}