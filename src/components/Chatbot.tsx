import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const workerUrl = (import.meta as any).env.VITE_CHATBOT_WORKER_URL || 'https://klimata-chatbot-worker.daivanfebrijuansetiya.workers.dev';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; text: string; time: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    setError(null);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = { role: 'user', content: input.trim() };
    
    setMessages((m) => [...m, { role: 'user', text: input.trim(), time: now }]);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: 'google/gemini-2.5-flash-lite', 
          messages: [{ 
            role: 'user', 
            content: [{ type: 'text', text: userMessage.content }] 
          }], 
          max_chars: 2000 
        }),
      });

      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(`Worker error ${resp.status}: ${t}`);
      }

      const data = await resp.json();

      let assistantText = '';

      if (data?.choices && Array.isArray(data.choices) && data.choices.length) {
        const msg = data.choices[0].message;
        const content = msg?.content;
        if (Array.isArray(content)) {
          assistantText = content
            .map((c: any) => (c.type === 'text' ? c.text : JSON.stringify(c)))
            .join('\n');
        } else if (typeof content === 'string') {
          assistantText = content;
        }
      }

      if (!assistantText) {
        if (Array.isArray(data?.message?.content)) {
          assistantText = data.message.content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
        } else if (data?.message?.content) {
          assistantText = data.message.content;
        }
      }

      if (!assistantText) assistantText = JSON.stringify(data, null, 2);

      setMessages((m) => [...m, { 
        role: 'assistant', 
        text: assistantText, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } catch (err: any) {
      setError(err?.message || String(err));
      setMessages((m) => [...m, { 
        role: 'assistant', 
        text: 'Terjadi kesalahan saat memproses permintaan.', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setLoading(false);
    }
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

        <DialogContent className="w-full sm:w-[min(95vw,64rem)] max-w-full sm:max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b shrink-0">
            <DialogTitle className="text-base sm:text-lg">Chatbot Informasi Bencana & Perubahan Iklim</DialogTitle>
          </DialogHeader>

          <section className="flex flex-col flex-1 overflow-hidden">
            <div ref={containerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">Belum ada percakapan. Tanyakan sesuatu terkait bencana atau perubahan iklim.</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} transition-opacity duration-200`}>
                  {m.role === 'assistant' && (
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <AvatarFallback>
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[85%] sm:max-w-[70%] bg-card/80 border border-border p-2 sm:p-3 rounded-2xl shadow-sm">
                        <div className="text-xs sm:text-sm prose prose-sm max-w-none whitespace-pre-wrap break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 text-right">{m.time}</div>
                      </div>
                    </div>
                  )}

                  {m.role === 'user' && (
                    <div className="flex items-end gap-2 sm:gap-3">
                      <div className="max-w-[85%] sm:max-w-[70%] bg-primary text-primary-foreground p-2 sm:p-3 rounded-2xl shadow-md self-end">
                        <div className="text-xs sm:text-sm prose prose-sm max-w-none whitespace-pre-wrap break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        </div>
                        <div className="text-xs text-primary-foreground/80 mt-1 sm:mt-2 text-right">{m.time}</div>
                      </div>
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <AvatarFallback>
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background shrink-0">
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full resize-none rounded-lg border border-border p-2 sm:p-3 bg-background text-foreground placeholder:text-muted-foreground text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Tulis pertanyaan tentang bencana atau perubahan iklim..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  disabled={loading}
                />
                
                <div className="flex items-center justify-between gap-2">
                  {error && <div className="text-xs sm:text-sm text-destructive flex-1">Kesalahan: {error}</div>}
                  <Button 
                    onClick={send} 
                    disabled={loading || !input.trim()}
                    className="min-w-[80px] sm:min-w-[100px] ml-auto"
                    size="sm"
                  >
                    {loading ? 'Mengirim...' : 'Kirim'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
