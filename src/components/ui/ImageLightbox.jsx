import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

export const ImageLightbox = ({ isOpen, onClose, src, alt = 'Image' }) => {
  const [zoom, setZoom] = React.useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  const handleDownload = () => {
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'zentrix-image';
    link.click();
  };

  React.useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center"
          onClick={onClose}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <ZoomIn size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Image */}
          <motion.img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `scale(${zoom})` }}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl border border-white/10 transition-transform duration-300"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
