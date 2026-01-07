import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent } from './ui/dialog';
import { toast } from 'sonner';
import { Mic, MicOff, Image, Trash2, Play, Pause, Download, X } from 'lucide-react';

const TaskAttachments = ({ taskId, attachments = [], onAttachmentAdded, requireImages = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info('Grabando audio...');
    } catch (error) {
      toast.error('Error al acceder al micrófono');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success('Grabación finalizada');
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio-note.webm');
      formData.append('file_type', 'audio');

      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir audio');

      const data = await response.json();
      toast.success('Audio adjuntado exitosamente');
      setAudioBlob(null);
      if (onAttachmentAdded) onAttachmentAdded(data.attachment);
    } catch (error) {
      toast.error('Error al subir audio');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', 'image');

      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir imagen');

      const data = await response.json();
      toast.success('Imagen adjuntada exitosamente');
      if (onAttachmentAdded) onAttachmentAdded(data.attachment);
    } catch (error) {
      toast.error('Error al subir imagen');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const playAudio = (url, id) => {
    if (playingAudio === id) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAudio(id);
      }
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const images = attachments.filter(a => a.file_type === 'image');
  const audios = attachments.filter(a => a.file_type === 'audio');
  const hasImages = images.length > 0;

  return (
    <div className="space-y-4">
      <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />

      {/* Grabación de Audio */}
      <div>
        <Label>Notas de Audio</Label>
        <div className="flex gap-2 mt-2">
          {!isRecording ? (
            <Button
              type="button"
              variant="outline"
              onClick={startRecording}
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              disabled={uploading}
            >
              <Mic className="h-4 w-4 mr-2" />
              Grabar Audio
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={stopRecording}
              className="border-red-500 text-red-400 hover:bg-red-500/10 animate-pulse"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Detener Grabación
            </Button>
          )}

          {audioBlob && !isRecording && (
            <Button
              type="button"
              onClick={uploadAudio}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploading ? 'Subiendo...' : 'Guardar Audio'}
            </Button>
          )}
        </div>

        {audios.length > 0 && (
          <div className="mt-3 space-y-2">
            {audios.map((audio) => (
              <div key={audio.id} className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-700">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => playAudio(audio.file_url, audio.id)}
                  className="text-blue-400"
                >
                  {playingAudio === audio.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm text-slate-300 flex-1">{audio.filename}</span>
                <span className="text-xs text-slate-500">
                  {new Date(audio.uploaded_at).toLocaleDateString()}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadFile(audio.file_url, audio.filename)}
                  className="text-slate-400"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subida de Imágenes */}
      <div>
        <Label>
          Imágenes de Soporte {requireImages && !hasImages && <span className="text-red-400">*</span>}
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={uploadImage}
          className="hidden"
        />
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            disabled={uploading}
          >
            <Image className="h-4 w-4 mr-2" />
            Subir Imagen
          </Button>
        </div>

        {requireImages && !hasImages && (
          <p className="text-xs text-amber-400 mt-1">
            ⚠️ Debes subir al menos una imagen de soporte para esta tarea
          </p>
        )}

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.file_url}
                  alt={image.filename}
                  className="w-full h-32 object-cover rounded border border-slate-700"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingImage(image)}
                    className="text-white"
                  >
                    Ver
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadFile(image.file_url, image.filename)}
                    className="text-white"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">{image.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Vista de Imagen */}
      <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl p-0">
          <div className="relative">
            <Button
              onClick={() => setViewingImage(null)}
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
            {viewingImage && (
              <img
                src={viewingImage.file_url}
                alt={viewingImage.filename}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
            {viewingImage && (
              <div className="p-4 bg-slate-800 border-t border-slate-700">
                <p className="text-sm text-slate-300">{viewingImage.filename}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Subido el {new Date(viewingImage.uploaded_at).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskAttachments;
