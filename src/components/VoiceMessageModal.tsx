import React, { useState, useRef } from 'react';
import { Mic, X, Play, Square, Trash2, Send, Info, CheckCircle2 } from 'lucide-react';

interface VoiceMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceMessageModal: React.FC<VoiceMessageModalProps> = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setStatus('recorded');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setStatus('error');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleDelete = () => {
    setAudioURL(null);
    setStatus('idle');
    audioChunksRef.current = [];
  };

  const handleSend = () => {
    setStatus('queued');
    // In a real app, this would upload the audioBlob to a server
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => {
        onClose();
        handleDelete();
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100">
        <button onClick={() => { handleDelete(); onClose(); }} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-indigo-700" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">Voice Message</h3>
            <p className="text-xs text-slate-500">Real Audio Recording</p>
          </div>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex gap-3">
            <Info className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-800">
              Microphone access denied or not supported by your browser. Please grant permissions to record.
            </p>
          </div>
        )}

        {status === 'queued' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
            <p className="text-sm text-blue-800 font-bold">Uploading voice message (QUEUED)...</p>
          </div>
        )}

        {status === 'sent' && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-bold">Message sent successfully!</p>
          </div>
        )}

        {(status === 'idle' || status === 'recording') && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg
              ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-indigo-100 hover:bg-indigo-200'}`}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
            >
              {isRecording ? <Square className="w-10 h-10 text-red-600 fill-red-600" /> : <Mic className="w-10 h-10 text-indigo-600" />}
            </div>
            <p className="text-sm font-bold text-slate-600">
              {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
            </p>
          </div>
        )}

        {status === 'recorded' && audioURL && (
          <div className="space-y-4">
            <div className="bg-slate-100 rounded-2xl p-4">
              <audio src={audioURL} controls className="w-full h-10" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleSend}
                className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
