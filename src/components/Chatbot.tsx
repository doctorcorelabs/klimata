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
  const [imageUrl, setImageUrl] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; text: string; time?: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim() && !imageUrl.trim() && !fileBase64) return;
    setError(null);

    const userContent: ContentItem[] = [];
    if (input.trim()) userContent.push({ type: 'text', text: input.trim() });
    if (imageUrl.trim()) userContent.push({ type: 'image_url', image_url: { url: imageUrl.trim() } });
    if (fileBase64) userContent.push({ type: 'image_base64', image_base64: { data: fileBase64, mime: fileMime || 'image/png', name: fileName || 'upload.png' } });

    const userMessage: Message = { role: 'user', content: userContent };

    // optimistic UI (add timestamp)
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((m) => [...m, { role: 'user', text: input || '(image)', time: now }]);
    setInput('');
    setImageUrl('');
    setFileBase64(null);
    setFileMime(null);
    setFileName(null);
    setFilePreview(null);
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

        <DialogContent className="max-w-2xl">
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
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
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

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  className="w-full resize-none rounded-lg border border-border p-3 bg-background text-foreground placeholder:text-muted-foreground"
                  placeholder="Tulis pertanyaan..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={2}
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" disabled={loading} />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3v4M8 3v4m8 4l-4 4-4-4" />
                      </svg>
                      <span>Upload gambar</span>
                    </label>
                    {filePreview && <span className="text-xs text-muted-foreground">{fileName}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="input input-sm"
                      placeholder="https://...jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      disabled={loading}
                    />
                    <Button onClick={send} disabled={loading}>
                      {loading ? 'Mengirim...' : 'Kirim'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="text-sm text-destructive mt-3">Error: {error}</div>}
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
