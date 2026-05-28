import React, { useRef, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MultiImageUploaderProps {
  id: string;
  registration: UseFormRegisterReturn;
  previewUrls?: string[];
  className?: string;
  onImagesChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: (index: number) => void;
}

export const MultiImageUploader = ({ id, registration, previewUrls = [], className = '', onImagesChange, onRemove }: MultiImageUploaderProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  // We don't necessarily need local state for previews if the parent handles it, 
  // but we can manage local state if we want to.
  // In MasterProductFormPage, the parent already manages `multiplePreviews`.
  // We'll rely on `previewUrls` passed from the parent.

  const { ref, onChange, ...rest } = registration;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onImagesChange) {
      onImagesChange(e);
    }
    if (onChange) onChange(e);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden ${className}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          id={id}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          {...rest}
          onChange={handleFileChange}
          ref={(e) => {
            ref(e);
            inputRef.current = e;
          }}
        />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t('upload_images', 'Upload images')}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1">{t('image_formats', 'PNG, JPG, WEBP')}</p>
        </div>
        
        {/* We can show an overlay on hover similar to single uploader if images are present */}
        {previewUrls.length > 0 && (
           <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
             <div className="bg-background text-foreground px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg border border-border/50">
                <UploadCloud className="w-4 h-4 text-primary" />
                {t('change_images', 'Change images')}
             </div>
           </div>
        )}
      </div>

      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-2">
          {previewUrls.map((src, idx) => (
            <div key={idx} className="w-24 h-24 rounded-xl border border-border/60 overflow-hidden bg-muted/20 flex items-center justify-center relative group shadow-sm">
              <img src={src} alt={`${t('image_preview', 'Image preview')} ${idx + 1}`} className="max-w-full max-h-full object-cover transition-transform group-hover:scale-105" />
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                  className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-destructive-foreground p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
