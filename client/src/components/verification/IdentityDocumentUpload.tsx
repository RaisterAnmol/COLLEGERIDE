import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Eye,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface IdentityDocumentUploadProps {
  label: string;
  description: string;
  required?: boolean;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
}

export const IdentityDocumentUpload: React.FC<IdentityDocumentUploadProps> = ({
  label,
  description,
  required = false,
  file,
  onFileSelect,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Sync preview url when file prop changes
  React.useEffect(() => {
    if (file) {
      if (file.type === "application/pdf") {
        setIsPdf(true);
        setPreviewUrl(null);
      } else if (file.type.startsWith("image/")) {
        setIsPdf(false);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    } else {
      setPreviewUrl(null);
      setIsPdf(false);
    }
  }, [file]);

  const handleValidateAndSetFile = (selectedFile: File) => {
    setError(null);
    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (selectedFile.size > maxBytes) {
      setError("File exceeds 5MB size limit. Please upload a smaller document.");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(selectedFile.type)) {
      setError("Invalid file format. Only JPEG, PNG, WebP or PDF are accepted.");
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleValidateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleValidateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          {label}
          {required && <span className="text-emerald-600 font-bold">*</span>}
        </label>
        {file && (
          <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {(file.size / 1024).toFixed(0)} KB Attached
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500">{description}</p>

      {/* Upload Zone or Preview */}
      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
            disabled
              ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
              : isDragging
              ? "border-[#143D32] bg-emerald-50/60 shadow-sm"
              : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <Upload className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-800">
                Click or drag & drop document here
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, WebP, or PDF up to 5MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border border-slate-200 bg-white rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm group">
          <div className="flex items-center gap-3 min-w-0">
            {previewUrl ? (
              <div
                onClick={() => setIsZoomOpen(true)}
                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 cursor-pointer relative group/thumb"
                title="Click to zoom preview"
              >
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[#143D32]/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 flex flex-col items-center justify-center text-rose-600 flex-shrink-0">
                <FileText className="w-5 h-5" />
                <span className="text-[9px] font-bold uppercase mt-0.5">PDF</span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {file.name}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                <span className="uppercase">{file.type.split("/")[1] || "FILE"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {previewUrl && (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title="Inspect document"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              title="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Modal Zoom Viewer */}
      {isZoomOpen && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-[#143D32]/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald-900 bg-[#143D32] flex items-center justify-between text-white">
              <div>
                <h3 className="text-sm font-semibold text-white">{label} Preview</h3>
                <p className="text-xs text-emerald-200/80">{file?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(s + 0.25, 3))}
                  className="p-1.5 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(s - 0.25, 0.5))}
                  className="p-1.5 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="p-1.5 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="p-1.5 text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0B1E19] min-h-[300px]">
              <img
                src={previewUrl}
                alt="Document Zoom View"
                style={{ transform: `scale(${zoomScale})`, transition: "transform 0.15s ease-out" }}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg origin-center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
