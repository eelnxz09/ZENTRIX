import React, { useCallback } from 'react';
import { Upload, X, FileImage } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

export const FileUploadZone = ({
  onFileSelect,
  accept = 'image/*',
  label = 'Upload File',
  hint = 'Drag & drop or click to browse',
  file = null,
  preview = null,
  uploading = false,
  progress = 0,
  onClear,
  className = '',
  required = false,
}) => {
  const inputRef = React.useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) onFileSelect?.(droppedFile);
  }, [onFileSelect]);

  const handleDragOver = (e) => e.preventDefault();

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect?.(selected);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
          {label}
          {required && <span className="text-pink-400 ml-1">*</span>}
        </label>
      )}

      {file || preview ? (
        <div className="relative glass-card rounded-xl p-4 flex items-center gap-3">
          {preview && (
            <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{file?.name || 'Uploaded file'}</p>
            {file && (
              <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
            )}
            {uploading && <ProgressBar value={progress} className="mt-2" />}
          </div>
          {onClear && !uploading && (
            <button
              onClick={onClear}
              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-cyan-400/30 hover:bg-white/[0.02] transition-all border-dashed border-2 border-white/10 min-h-[120px]"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Upload size={18} className="text-slate-500" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-300">{hint}</p>
            <p className="text-[10px] text-slate-600 mt-1">
              {accept === 'image/*' ? 'PNG, JPG, WebP (max 10MB)' : accept}
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};
