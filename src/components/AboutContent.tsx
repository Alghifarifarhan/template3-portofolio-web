'use client';

import { useEffect } from 'react';
import { useSiteData } from "@/context/SiteDataContext";
import { formatGoogleDriveUrl } from "@/lib/firebase";

export default function AboutContent() {
  const { siteData, recordVisit, recordActivity } = useSiteData();
  const {
    title,
    description,
    profileImage,
    skills = [],
    experienceTitle,
    experiences = [],
    connectTitle,
    connectDescription,
    emailUrl,
    twitterUrl,
    resumeUrl,
    certificateUrl,
  } = siteData.about;

  useEffect(() => {
    recordVisit('about');
  }, []);

  const hasProfileImg = profileImage && profileImage.trim() !== '';
  const formattedProfileImg = hasProfileImg ? formatGoogleDriveUrl(profileImage) : '';

  const hasResume = resumeUrl && resumeUrl.trim() !== '';
  const hasCertificate = certificateUrl && certificateUrl.trim() !== '';
  const hasEmail = emailUrl && emailUrl.trim() !== '';
  const hasConnect = hasEmail || hasResume || hasCertificate || (connectDescription && connectDescription.trim() !== '');

  return (
    <section className="relative z-20 max-w-5xl w-full mx-auto mt-24 sm:mt-32 mb-12 px-4 sm:px-6 lg:px-8">
      <div className="relative z-20 w-full mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl text-left animate-fade-in-up">
          {title || "About"}
        </h2>
        <div className="flex flex-col-reverse md:flex-row gap-8 mt-4 sm:mt-6">
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            {description ? (
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base lg:text-lg animate-fade-in-up animation-delay-100 whitespace-pre-line">
                {description}
              </p>
            ) : null}
            {skills.length > 0 && (
              <div className="mt-6 pt-2 flex flex-wrap gap-2 animate-fade-in-up animation-delay-200">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{ animationDelay: `${index * 40 + 200}ms` }}
                    className="px-3 py-1 text-xs sm:text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full border border-neutral-200 dark:border-neutral-700 transition-all duration-200 hover:scale-110 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 cursor-default animate-fade-in-up"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end animate-scale-in animation-delay-200">
            <div className="group relative w-full max-w-[320px] sm:max-w-[360px] aspect-square rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-800 bg-gradient-to-tr from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center cursor-pointer">
              {hasProfileImg ? (
                <img
                  src={formattedProfileImg}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-105 group-hover:rotate-1 transition-all duration-500 ease-out"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-neutral-400 dark:text-neutral-500 p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl font-bold shadow-inner">
                    👤
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Profile Photo</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mt-16 sm:mt-20 gap-8">
        <div className="flex-1 animate-fade-in-up animation-delay-300">
          <h2 className="mb-4 text-xl sm:text-2xl font-bold dark:text-neutral-200">
            {experienceTitle || "Work Experience"}
          </h2>
          <div className="py-4 sm:py-6">
            {experiences.length > 0 ? (
              experiences.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{ animationDelay: `${index * 100 + 350}ms` }}
                  className="pb-8 border-l border-neutral-200 last:border-l-0 dark:border-neutral-700 animate-fade-in-up"
                >
                  <div className="relative flex flex-col justify-start pl-8 sm:pl-12 group">
                    <div className="absolute top-0 left-0 z-30 flex items-center justify-center -translate-x-1/2 bg-white border rounded-full dark:bg-neutral-950 w-10 sm:w-12 h-10 sm:h-12 border-neutral-300 dark:border-neutral-700 group-hover:scale-110 group-hover:border-indigo-500 transition-all duration-300">
                      <svg className="w-5 sm:w-6 h-5 sm:h-6 text-neutral-700 dark:text-neutral-300 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <p className="text-[11px] sm:text-xs uppercase text-neutral-400 dark:text-neutral-500 tracking-wider font-semibold">{item.period}</p>
                    <h3 className="my-1 text-base sm:text-lg font-bold dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.role}</h3>
                    <p className="mb-1 text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">{item.company}</p>
                    <p className="text-xs sm:text-sm font-light text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm">
                Belum ada riwayat pengalaman kerja yang ditambahkan. Anda dapat menambahkannya melalui Panel Admin.
              </div>
            )}
          </div>
        </div>

        {hasConnect && (
          <div className="w-full md:w-[320px] lg:w-[360px] flex-shrink-0 animate-fade-in-up animation-delay-400">
            <h2 className="mb-4 text-xl sm:text-2xl font-bold dark:text-neutral-200">{connectTitle || "Let's Connect"}</h2>
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 transition-colors duration-300">
              {connectDescription && (
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {connectDescription}
                </p>
              )}
              <div className="mt-4 flex flex-col gap-2.5 pt-2">
                {hasEmail && (
                  <a
                    href={emailUrl.startsWith('mailto:') ? emailUrl : `mailto:${emailUrl}`}
                    className="group text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5 active:scale-95 transition-all w-fit"
                  >
                    <span>📧 Email Me</span>
                    <span className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                )}
                {hasResume && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordActivity('download')}
                    className="group text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5 active:scale-95 transition-all w-fit"
                  >
                    <span>📄 My Resume</span>
                    <span className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                )}
                {hasCertificate && (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordActivity('download')}
                    className="group text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1.5 active:scale-95 transition-all w-fit"
                  >
                    <span>📜 My Certificate</span>
                    <span className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}