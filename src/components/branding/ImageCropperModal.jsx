import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageCropperModal({ imageFile, onCancel, onCrop }) {
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        drawCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, scale]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      onCrop(blob);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card border border-white/5 rounded-xl w-full max-w-md shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Crop className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Crop Logo</h2>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5">
          <div className="space-y-4">
            <div className="bg-secondary rounded-lg p-4 flex items-center justify-center max-h-64 overflow-hidden">
              <canvas
                ref={canvasRef}
                style={{
                  maxHeight: '240px',
                  maxWidth: '100%',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end p-5 border-t border-white/5">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCrop}>
            <UploadIcon className="w-3.5 h-3.5 mr-1.5" /> Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}