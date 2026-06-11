'use client';

import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCaptureModal({ isOpen, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<'preview' | 'captured'>('preview');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setPhase('preview');
    setCapturedUrl(null);
    setError(null);
    setIsStarting(true);
    startCamera();

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStarting(false);
      }
    } catch (err: any) {
      setIsStarting(false);
      if (err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera device found. Please connect a camera and try again.');
      } else {
        setError('Unable to access camera: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedUrl(dataUrl);
    setPhase('captured');
    stopCamera();
  };

  const retake = () => {
    setCapturedUrl(null);
    setPhase('preview');
    setIsStarting(true);
    startCamera();
  };

  const confirmCapture = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `product-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.92);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[15px] font-black text-white">
                {phase === 'captured' ? 'Review Photo' : 'Take Photo'}
              </h3>
              <p className="text-[11px] text-white/50 font-medium">
                {phase === 'captured' ? 'Looks good? Use this photo or retake.' : 'Position your product and press capture.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Camera View / Preview */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-white font-bold text-[14px] text-center mb-2">Camera Unavailable</p>
              <p className="text-white/60 text-[12px] text-center">{error}</p>
            </div>
          )}

          {/* Starting spinner */}
          {isStarting && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-[12px] font-medium">Starting camera…</p>
            </div>
          )}

          {/* Live video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${phase !== 'preview' || isStarting ? 'hidden' : ''}`}
          />

          {/* Captured image */}
          {phase === 'captured' && capturedUrl && (
            <img src={capturedUrl} alt="Captured" className="w-full h-full object-cover" />
          )}

          {/* Camera overlay guides */}
          {phase === 'preview' && !isStarting && !error && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner guides */}
              <div className="absolute top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-emerald-400 rounded-tl-lg opacity-70" />
              <div className="absolute top-6 right-6 w-8 h-8 border-r-2 border-t-2 border-emerald-400 rounded-tr-lg opacity-70" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-l-2 border-b-2 border-emerald-400 rounded-bl-lg opacity-70" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-emerald-400 rounded-br-lg opacity-70" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <span className="text-white/50 text-[11px] font-medium bg-black/40 px-3 py-1 rounded-full">
                  Position product in frame
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="px-6 py-5 bg-gray-900 flex items-center justify-center gap-4">
          {phase === 'preview' ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={capturePhoto}
                disabled={!!error || isStarting}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>

              <div className="w-[90px]" />
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>

              <button
                onClick={confirmCapture}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-[13px] font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-900/30 active:scale-95"
              >
                <Check className="w-4 h-4" />
                Use This Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
