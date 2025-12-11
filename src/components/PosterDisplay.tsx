import React, { useState } from "react";

const PosterDisplay: React.FC = () => {
  // URL-encode the filename for safe URL usage
  const src = "/Penyuluhan%20(1).png";
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col items-center">
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka poster"
          className="w-full sm:w-3/4 md:w-2/3 shadow-lg rounded overflow-hidden focus:outline-none"
        >
          <img
            src={src}
            alt="Poster Penyuluhan"
            loading="lazy"
            className="w-full h-auto object-contain"
            srcSet={`${src} 1x, ${src} 2x`}
          />
        </button>

        <div className="mt-3 flex justify-center">
          <a
            href={src}
            download
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Unduh
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={src} alt="Poster Penyuluhan (full)" className="w-full h-auto rounded" />
            <div className="mt-2 flex justify-center gap-2">
              <a href={src} download className="px-4 py-2 bg-emerald-600 text-white rounded">
                Unduh
              </a>
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-red-600 text-white rounded">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterDisplay;
