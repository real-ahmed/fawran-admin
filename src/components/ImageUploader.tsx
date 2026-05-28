import React, { useRef, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  id: string;
  registration: UseFormRegisterReturn;
  previewUrl?: string;
  className?: string;
  accept?: string;
}

export const ImageUploader = ({ id, registration, previewUrl, className = '', accept = 'image/*' }: ImageUploaderProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  // We merge the react-hook-form ref with our local ref so we can trigger clicks
  const { ref, onChange, ...rest } = registration;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
    }
    // Call react-hook-form's onChange
    if (onChange) onChange(e);
  };

  const currentPreview = localPreview || previewUrl;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden ${className}`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        {...rest}
        onChange={handleFileChange}
        ref={(e) => {
          ref(e);
          inputRef.current = e;
        }}
      />

      {currentPreview ? (
        <div className="relative w-full h-full flex items-center justify-center p-3">
           <img src={currentPreview} alt={t('image_preview')} className="max-h-full max-w-full object-contain rounded-md drop-shadow-sm" />
           <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
             <div className="bg-background text-foreground px-4 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg border border-border/50">
                <UploadCloud className="w-4 h-4 text-primary" />
                {t('change_image')}
             </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <ImagePlus className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-foreground">{t('upload_image')}</p>
          <p className="text-xs font-medium text-muted-foreground mt-1">{t('image_formats')}</p>
        </div>
      )}
    </div>
  );
};
