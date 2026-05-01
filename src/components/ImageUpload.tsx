import React, { useState, useCallback, useEffect } from 'react';
import { Camera, Loader2, X, Upload } from 'lucide-react';
import { storage, ref, uploadBytes, getDownloadURL } from '../lib/firebase';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  onUploading?: (isUploading: boolean) => void;
  currentImage?: string;
  folder: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, onUploading, currentImage, folder }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const setStatus = useCallback((status: boolean) => {
    setLoading(status);
    if (onUploading) onUploading(status);
  }, [onUploading]);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem é muito grande (máximo 2MB). Por favor, escolha uma imagem menor ou use um compressor online.');
      return;
    }

    if (!file.type.match(/image\/(jpeg|png|webp|jpg)/)) {
      alert('Formato inválido. Por favor, use JPG, PNG ou WEBP.');
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setStatus(true);
    setProgress(0);

    try {
      let fileToUpload = file;

      // Optimize image
      const options = {
        maxSizeMB: 0.5, // Target 500KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8,
        onProgress: (p: number) => setProgress(p),
      };

      try {
        console.log('Starting compression...');
        const compressedFile = await imageCompression(file, options);
        fileToUpload = compressedFile instanceof File 
          ? compressedFile 
          : new File([compressedFile], file.name, { type: file.type });
        console.log('Compression successful');
      } catch (error) {
        console.warn("Compression failed, using original file", error);
      }

      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      console.log('Uploading to Storage:', fileName);
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      const url = await getDownloadURL(snapshot.ref);
      
      console.log('Upload successful! URL:', url);
      onUpload(url);
    } catch (error: any) {
      console.error("Upload error details:", error);
      alert(`Falha no upload: ${error.message || 'Verifique sua conexão e se o Firebase Storage está ativado.'}`);
    } finally {
      setStatus(false);
      setProgress(0);
    }
  }, [folder, onUpload, setStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  // Paste support
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) uploadFile(file);
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [uploadFile]);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const handleManualUrlSubmit = () => {
    if (manualUrl) {
      const trimmed = manualUrl.trim();
      onUpload(trimmed);
      setPreview(trimmed);
      setShowUrlInput(false);
      setManualUrl('');
    }
  };

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  return (
    <div className="space-y-4">
      <div 
        className={`relative w-full aspect-video rounded-3xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden group ${
          isDragging 
            ? 'border-brand-orange bg-orange-50 scale-[1.02]' 
            : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview && preview.trim() !== '' ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white text-center">
                <Upload size={24} className="mx-auto mb-1" />
                <p className="text-[10px] font-bold">SOLTE PARA TROCAR</p>
              </div>
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation();
                  setPreview(''); 
                  onUpload(''); 
                }}
                className="p-3 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 active:scale-95 transition-transform"
              >
                <X size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Camera className="h-8 w-8 text-brand-orange" />
            </div>
            <p className="text-sm font-bold text-gray-700">Arraste e solte ou clique</p>
            <p className="text-xs text-gray-400 mt-1">Formatos: JPG, PNG, WEBP (Max 2MB)</p>
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-x-0 bottom-0 top-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <Loader2 className="animate-spin text-brand-orange" size={48} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Upload size={16} className="text-brand-orange" />
              </div>
            </div>
            <p className="text-sm font-black text-brand-orange uppercase tracking-widest text-center px-4">
              {progress > 0 && progress < 100 
                ? `Otimizando... ${Math.round(progress)}%` 
                : 'Enviando Doçura...'}
            </p>
            {progress > 0 && progress < 100 && (
              <div className="w-32 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-orange transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          accept="image/*"
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-2">
        <button 
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] uppercase font-bold text-gray-400 hover:text-brand-orange transition-colors"
        >
          {showUrlInput ? 'Ocultar Link Manual' : 'Ou cole um link direto da imagem'}
        </button>
        
        {showUrlInput && (
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-grow px-4 py-2 bg-gray-50 border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleManualUrlSubmit}
              className="px-4 py-2 bg-brand-orange text-white rounded-xl text-xs font-bold"
            >
              Ok
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
