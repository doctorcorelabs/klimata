import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ContentItem =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'video_url'; video_url: { url: string } }
  | { type: 'input_audio'; input_audio: { data: string; format: string } }
  | { type: 'image_base64'; image_base64: { data: string; mime?: string; name?: string } };

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: ContentItem[];
};

// Use Vite env if set; otherwise fall back to the deployed worker URL for quick testing.
// In production you should set VITE_CHATBOT_WORKER_URL in `.env.local` and remove the hard fallback.
const workerUrl = (import.meta as any).env.VITE_CHATBOT_WORKER_URL || 'https://klimata-chatbot-worker.daivanfebrijuansetiya.workers.dev';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMime, setAudioMime] = useState<string | null>(null);
  const supportsRecording = typeof window !== 'undefined' && !!(navigator.mediaDevices && (window as any).MediaRecorder) && (typeof window.isSecureContext !== 'undefined' ? window.isSecureContext : true);
  const [messages, setMessages] = useState<Array<{ role: string; text?: string; time?: string; audio?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() && !fileBase64 && !audioBase64) return;
    setError(null);

    const userContent: ContentItem[] = [];
    if (input.trim()) userContent.push({ type: 'text', text: input.trim() });
    if (fileBase64) {
      const imgData = `data:${fileMime || 'image/png'};base64,${fileBase64}`;
      userContent.push({ type: 'image_base64', image_base64: { data: imgData, mime: fileMime || 'image/png', name: fileName || 'upload.png' } });
    }
    if (audioBase64) {
      const audioData = `data:${audioMime || 'audio/webm'};base64,${audioBase64}`;
      userContent.push({ type: 'input_audio', input_audio: { data: audioData, format: audioMime || 'audio/webm' } });
    }

    // If the message contains only non-text content (audio/image), add a short text hint so provider won't treat it as empty.
    const hasText = userContent.some((c) => (c as any).type === 'text' && (c as any).text && String((c as any).text).trim().length > 0);
    if (!hasText) {
      userContent.unshift({ type: 'text', text: audioBase64 ? 'Pesan suara terlampir. Mohon transkripsikan dan jawab.' : '(image)'});
    }

    const userMessage: Message = { role: 'user', content: userContent };

    // optimistic UI (add timestamp)
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const optimisticText = input || (fileBase64 ? '(image)' : audioBase64 ? '(audio)' : '');
    const optimisticMsg: any = { role: 'user', text: optimisticText, time: now };
    if (audioBase64 && audioPreview) optimisticMsg.audio = audioPreview;
    setMessages((m) => [...m, optimisticMsg]);
    setInput('');
    setFileBase64(null);
    setFileMime(null);
    setFileName(null);
    setFilePreview(null);
    setAudioBase64(null);
    setAudioMime(null);
    // clear input-area preview but keep the object URL referenced by the optimistic message
    setAudioPreview(null);
    setLoading(true);

    try {
      const resp = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'google/gemini-2.5-flash-lite', messages: [userMessage], max_chars: 2000 }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Worker error ${resp.status}: ${t}`);
      }

      const data = await resp.json();

      // Try to extract assistant text from typical OpenRouter response
      let assistantText = '';

      // OpenRouter typical: data.choices[0].message.content -> array
      if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
        const msg = data.choices[0].message;
        const content = msg?.content;
        if (Array.isArray(content)) {
          assistantText = content
            .map((c: any) => (c.type === 'text' ? c.text : c.type === 'image_url' ? `[image] ${c.image_url?.url}` : JSON.stringify(c)))
            .join('\n');
        } else if (typeof content === 'string') {
          assistantText = content;
        }
      }

      // fallback: if data.message or data.response exists
      if (!assistantText) {
        if (Array.isArray(data?.message?.content)) {
          assistantText = data.message.content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
        } else if (data?.message?.content) {
          assistantText = data.message.content;
        }
      }

      // last resort: stringify
      if (!assistantText) assistantText = JSON.stringify(data, null, 2);

      // Use the assistant text as returned (we request max_chars server-side)
      setMessages((m) => [...m, { role: 'assistant', text: assistantText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } catch (err: any) {
      setError(err?.message || String(err));
      setMessages((m) => [...m, { role: 'assistant', text: 'Terjadi kesalahan saat memproses permintaan.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFileBase64(null);
      setFileMime(null);
      setFileName(null);
      setFilePreview(null);
      return;
    }
    // Size validation: limit to 2 MB
    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
    if (f.size > MAX_BYTES) {
      setError('Ukuran file terlalu besar. Maksimum 2 MB.');
      // clear any previous selection
      e.currentTarget.value = '';
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like: data:<mime>;base64,<data>
      const m = result.match(/^data:(.*);base64,(.*)$/s);
      if (m) {
        setFileMime(m[1]);
        setFileBase64(m[2]);
        setFilePreview(result);
        setFileName(f.name);
      } else {
        // fallback: keep whole data url as preview
        setFilePreview(result);
        setFileBase64(null);
        setFileMime(f.type || 'image/png');
        setFileName(f.name);
      }
    };
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFileBase64(null);
    setFileMime(null);
    setFileName(null);
    setFilePreview(null);
  };

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Failed to convert blob to base64'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const audioBufferToWavBlob = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numOfChan, true);
    /* sample rate */
    view.setUint32(24, buffer.sampleRate, true);
    /* byte rate (sampleRate * blockAlign) */
    view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numOfChan * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, buffer.length * numOfChan * 2, true);

    // write interleaved data
    let offset = 44;
    const channels: Float32Array[] = [];
    for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        let sample = Math.max(-1, Math.min(1, channels[ch][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, sample, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  const startRecording = async () => {
    setError(null);
    if (!supportsRecording) {
      setError('Perekaman suara tidak didukung. Pastikan menggunakan HTTPS dan browser mendukung MediaRecorder.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      let mr: MediaRecorder;
      try {
        const opts: any = { audioBitsPerSecond: 128000 };
        // Coba format yang lebih compatible untuk mobile
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/mp4')) {
          opts.mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          opts.mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm')) {
          opts.mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          opts.mimeType = 'audio/ogg;codecs=opus';
        }
        mr = new MediaRecorder(stream, opts);
      } catch (e) {
        mr = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = mr;
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        // prefer object URL for playback; if browser can't play recorded mime, transcode to WAV
        let playbackBlob = blob;
        const testAudio = document.createElement('audio');
        const canPlay = testAudio.canPlayType(playbackBlob.type || '');
        if (!canPlay) {
          try {
            const arrayBuffer = await blob.arrayBuffer();
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            const wavBlob = audioBufferToWavBlob(audioBuffer);
            playbackBlob = wavBlob;
            audioCtx.close?.();
          } catch (e) {
            // if transcoding fails, keep original blob
            console.warn('Transcoding to WAV failed', e);
          }
        }

        const url = URL.createObjectURL(playbackBlob);
        setAudioPreview(url);
        const dataUrl = await blobToBase64(blob); // Kirim original blob ke server
        const m = dataUrl.match(/^data:(.*);base64,(.*)$/s);
        if (m) {
          setAudioMime(m[1]);
          setAudioBase64(m[2]);
        } else {
          setAudioBase64(dataUrl);
          setAudioMime(blob.type || 'audio/webm');
        }
        stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        setRecording(false);
      };
      mr.start();
      setRecording(true);
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg.includes('Permission') || msg.includes('denied') ? 'Izin mikrofon ditolak. Silakan izinkan akses mikrofon di pengaturan browser.' : 'Gagal mengakses mikrofon. Periksa izin dan coba lagi.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const clearAudio = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
      setAudioPreview(null);
    }
    setAudioBase64(null);
    setAudioMime(null);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="hero"
            size="icon"
            className="fixed right-6 bottom-6 z-50 shadow-lg"
            aria-label="Buka Chatbot"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[min(95vw,64rem)] mx-auto max-w-3xl rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle>Chatbot Informasi Bencana & Perubahan Iklim</DialogTitle>
          </DialogHeader>

          <section className="flex flex-col gap-4">
            <div ref={containerRef} className="space-y-4 mb-2 max-h-[60vh] overflow-auto pr-2">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">Belum ada percakapan. Tanyakan sesuatu terkait bencana atau perubahan iklim.</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} transition-opacity duration-200`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[70%] bg-card/80 border border-border p-3 rounded-2xl shadow-sm">
                        <div className="text-sm prose max-w-none whitespace-pre-wrap">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 text-right">{m.time}</div>
                      </div>
                    </div>
                  )}

                  {m.role === 'user' && (
                    <div className="flex items-end gap-3">
                      <div className="max-w-[70%] bg-primary text-primary-foreground p-3 rounded-2xl shadow-md self-end">
                        <div className="text-sm prose max-w-none whitespace-pre-wrap">
                          {m.audio ? (
                            <div className="flex items-center gap-2">
                              <audio src={m.audio} controls className="w-full" />
                            </div>
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                          )}
                        </div>
                        <div className="text-xs text-primary-foreground/80 mt-2 text-right">{m.time}</div>
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex-1 min-w-0">
                <textarea
                  className="w-full resize-none rounded-lg border border-border p-3 bg-background text-foreground placeholder:text-muted-foreground text-base"
                  placeholder="Tulis pertanyaan..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={2}
                  disabled={loading}
                />
                
                {/* Preview Section - Fixed Height untuk mencegah layout shift */}
                <div className="mt-2 min-h-[60px] sm:min-h-0">
                  {filePreview && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-2">
                      <img src={filePreview} alt={fileName || 'preview'} className="w-16 h-16 object-cover rounded-md border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{fileName}</p>
                      </div>
                      <button onClick={clearFile} className="text-xs text-destructive px-2 py-1 hover:bg-destructive/10 rounded flex-shrink-0">Hapus</button>
                    </div>
                  )}

                  {audioPreview && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-2">
                      <audio 
                        src={audioPreview} 
                        controls 
                        className="flex-1 h-10" 
                        style={{ maxWidth: '100%' }}
                        preload="metadata"
                      />
                      <button onClick={clearAudio} className="text-xs text-destructive px-2 py-1 hover:bg-destructive/10 rounded flex-shrink-0 whitespace-nowrap">Hapus</button>
                    </div>
                  )}

                  {!supportsRecording && (
                    <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md mb-2">
                      ⚠️ Perekaman tidak didukung — butuh HTTPS / browser modern
                    </div>
                  )}
                </div>

                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-muted-foreground px-3 py-2 rounded-md hover:bg-muted transition-colors flex-shrink-0">
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={loading} />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Gambar</span>
                      <span className="sm:hidden">📷</span>
                    </label>

                    {!recording ? (
                      <button 
                        onClick={startRecording} 
                        disabled={loading || !supportsRecording} 
                        className="inline-flex items-center justify-center gap-2 text-sm bg-red-600 text-white px-3 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors flex-shrink-0 min-w-[90px]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span>Rekam</span>
                      </button>
                    ) : (
                      <button 
                        onClick={stopRecording} 
                        className="inline-flex items-center justify-center gap-2 text-sm bg-yellow-500 text-black px-3 py-2 rounded-md hover:bg-yellow-600 transition-colors animate-pulse flex-shrink-0 min-w-[90px]"
                      >
                        <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                        <span>Stop</span>
                      </button>
                    )}
                  </div>

                  <Button 
                    onClick={send} 
                    disabled={loading}
                    className="sm:ml-auto w-full sm:w-auto min-h-[40px]"
                  >
                    {loading ? 'Mengirim...' : 'Kirim'}
                  </Button>
                </div>
              </div>
            </div>

            {error && <div className="text-sm text-destructive mt-3">Kesalahan: {error}</div>}
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
