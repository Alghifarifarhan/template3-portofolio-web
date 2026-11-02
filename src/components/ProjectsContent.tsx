'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSiteData, ProjectItem } from '@/context/SiteDataContext';
import { formatGoogleDriveUrl } from '@/lib/firebase';

export default function ProjectsContent() {
  const { siteData, recordVisit, recordActivity } = useSiteData();
  const { title, description, items = [] } = siteData.projects;
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    recordVisit('projects');
  }, []);

  // Keyboard Escape listener & body scroll lock
  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedProject, isClosingModal]);

  const handleOpenModal = (project: ProjectItem) => {
    setIsClosingModal(false);
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    if (selectedProject && !isClosingModal) {
      setIsClosingModal(true);
      setTimeout(() => {
        setSelectedProject(null);
        setIsClosingModal(false);
      }, 220);
    }
  };

  return (
    <section className="relative z-20 max-w-5xl mx-auto mt-24 mb-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="relative z-20 w-full mx-auto text-left animate-fade-in-up">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400 sm:leading-7 lg:leading-8 sm:text-base lg:text-lg animate-fade-in-up animation-delay-100">
          {description}
        </p>
      </div>

      {items.length > 0 ? (
        <div className="z-30 grid items-stretch w-full grid-cols-1 my-8 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project, index) => {
            const hasImg = project.imageUrl && project.imageUrl.trim() !== '';
            const imgUrl = hasImg ? formatGoogleDriveUrl(project.imageUrl) : '';

            return (
              <div
                key={project.id || index}
                onClick={() => handleOpenModal(project)}
                className="group relative flex flex-col items-stretch duration-300 ease-out p-4 rounded-2xl cursor-pointer bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg active:scale-[0.98] transition-all animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 80}ms` }}
              >
                <div className="block w-full overflow-hidden rounded-xl bg-gradient-to-tr from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 aspect-[16/9] mb-4 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center">
                  {hasImg ? (
                    <img
                      src={imgUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-neutral-400 dark:text-neutral-500">
                      <span className="text-2xl">💼</span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider">Project</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="flex items-center gap-1.5 text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <span>{project.title}</span>
                      <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <span>Lihat Detail Project</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="my-12 p-12 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-inner">
            💼
          </div>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">Belum Ada Proyek</h3>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md">
            Belum ada proyek yang ditambahkan ke portofolio Anda. Anda dapat menambahkan proyek baru melalui Panel Admin.
          </p>
        </div>
      )}

      {/* Project Detail Popup Modal */}
      {mounted && typeof document !== 'undefined' && (selectedProject || isClosingModal) && selectedProject &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={handleCloseModal}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/70 backdrop-blur-md transition-opacity duration-200 ${
              isClosingModal ? 'animate-fade-out' : 'animate-fade-in'
            }`}
          >
            <div
              className={`relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh] ${
                isClosingModal ? 'animate-pop-out' : 'animate-pop-in'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/90 backdrop-blur-sm z-10 flex-shrink-0">
                <h3 id="project-modal-title" className="text-base sm:text-xl font-bold text-neutral-900 dark:text-white truncate pr-4">
                  {selectedProject.title}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700/60 hover:rotate-90 active:scale-95 transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-7 overflow-y-auto flex flex-col gap-5 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700">
                {selectedProject.imageUrl && (
                  <div className="w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-[16/9] border border-neutral-200 dark:border-neutral-800 shadow-sm animate-scale-in">
                    <img
                      src={formatGoogleDriveUrl(selectedProject.imageUrl)}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 animate-fade-in-up">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Ringkasan Project
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 animate-fade-in-up">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Deskripsi Lengkap & Fitur
                  </h4>
                  <div className="text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300 whitespace-pre-line">
                    {selectedProject.longDescription || selectedProject.description || "Tidak ada deskripsi rinci tambahan."}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-7 sm:py-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/90 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 active:scale-95 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Tutup
                </button>
                {selectedProject.href && selectedProject.href !== '#!' && (
                  <a
                    href={selectedProject.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 rounded-xl shadow transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Kunjungi Project</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </section>
  );
}