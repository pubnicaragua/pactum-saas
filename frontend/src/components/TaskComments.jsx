import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Mic, 
  StopCircle,
  Play,
  Pause,
  Trash2,
  Download,
  X
} from 'lucide-react';

const TaskComments = ({ taskId, projectId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
  const token = localStorage.getItem('pactum_token');

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const loadComments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar comentarios');
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const formatChileTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Error al acceder al micrófono');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedImages.length > 5) {
      toast.error('Máximo 5 imágenes por comentario');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!newComment.trim() && !audioBlob && selectedImages.length === 0) {
      toast.error('Agrega un comentario, audio o imagen');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('task_id', taskId);
      formData.append('project_id', projectId);
      if (newComment.trim()) {
        formData.append('text', newComment.trim());
      }

      if (audioBlob) {
        formData.append('audio', audioBlob, 'audio-comment.webm');
      }

      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al crear comentario');

      toast.success('Comentario agregado');
      setNewComment('');
      setAudioBlob(null);
      setSelectedImages([]);
      setRecordingTime(0);
      await loadComments();
    } catch (error) {
      toast.error('Error al agregar comentario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      toast.success('Comentario eliminado');
      await loadComments();
    } catch (error) {
      toast.error('Error al eliminar comentario');
      console.error(error);
    }
  };

  const toggleAudioPlay = (audioUrl, commentId) => {
    if (playingAudio === commentId) {
      audioPlayerRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.play();
      audioPlayerRef.current.onended = () => setPlayingAudio(null);
      setPlayingAudio(commentId);
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Input */}
        <div className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="bg-slate-900 border-slate-700 text-white min-h-[80px]"
          />

          {/* Audio Recording */}
          <div className="flex items-center gap-2">
            {!isRecording && !audioBlob && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startRecording}
                className="border-slate-700"
              >
                <Mic className="h-4 w-4 mr-2" />
                Grabar Audio
              </Button>
            )}

            {isRecording && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={stopRecording}
                  className="border-red-500 text-red-400"
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Detener ({60 - recordingTime}s)
                </Button>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-400">Grabando...</span>
                </div>
              </div>
            )}

            {audioBlob && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Audio grabado ({recordingTime}s)
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAudioBlob(null);
                    setRecordingTime(0);
                  }}
                  className="h-6 px-2 text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-700"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Agregar Imágenes
            </Button>
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border border-slate-700"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 rounded-full"
                  >
                    <X className="h-3 w-3 text-white" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading || (!newComment.trim() && !audioBlob && selectedImages.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Comentario'}
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-center text-slate-500 py-8">No hay comentarios aún</p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{comment.user_name}</p>
                  <p className="text-xs text-slate-500">
                    {formatChileTime(comment.created_at)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteComment(comment.id)}
                  className="h-6 px-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {comment.text && (
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.text}</p>
              )}

              {comment.audio_url && (
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleAudioPlay(comment.audio_url, comment.id)}
                    className="h-8 px-2"
                  >
                    {playingAudio === comment.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-xs text-slate-400">Audio ({comment.audio_duration}s)</span>
                  <a
                    href={comment.audio_url}
                    download
                    className="ml-auto"
                  >
                    <Button size="sm" variant="ghost" className="h-6 px-2">
                      <Download className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              )}

              {comment.images && comment.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {comment.images.map((imageUrl, index) => (
                    <a
                      key={index}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="h-24 w-24 object-cover rounded border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskComments;
