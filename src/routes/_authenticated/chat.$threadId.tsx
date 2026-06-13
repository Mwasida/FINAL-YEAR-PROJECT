import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { getThreadMessages } from "@/lib/threads.functions";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff, Loader2, Leaf, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () => ({ meta: [{ title: "AI Chat — AgriSage" }] }),
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getMsgs = useServerFn(getThreadMessages);
  const { data, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => getMsgs({ data: { id: threadId } }),
  });

  if (isLoading) {
    return <div className="grid h-full place-items-center p-8 text-muted-foreground">Loading…</div>;
  }
  if (!data) return null;

  return (
    <ChatView
      key={threadId}
      threadId={threadId}
      title={data.thread.title}
      initial={data.messages as never[]}
      onLeave={() => {
        qc.invalidateQueries({ queryKey: ["threads"] });
        navigate({ to: "/chat" });
      }}
    />
  );
}

function ChatView({ threadId, title, initial }: {
  threadId: string;
  title: string;
  initial: Array<{ id: string; role: string; parts: unknown }>;
  onLeave: () => void;
}) {
  const initialMessages: UIMessage[] = initial.map((m) => ({
    id: m.id,
    role: m.role as UIMessage["role"],
    parts: Array.isArray(m.parts) ? (m.parts as UIMessage["parts"]) : [{ type: "text", text: "" }],
  }));

  const transport = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      body: { threadId },
      fetch: async (input, init) => {
        const { data } = await supabase.auth.getSession();
        const headers = new Headers(init?.headers);
        if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
        return fetch(input, { ...init, headers });
      },
    }),
  ).current;

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
  });

  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recogRef = useRef<unknown>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, status]);

  useEffect(() => {
    if (error) toast.error("Chat error — please try again");
  }, [error]);

  function toggleMic() {
    type SR = { start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; continuous: boolean; interimResults: boolean; lang: string };
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice not supported in this browser"); return; }
    if (listening) { (recogRef.current as SR | null)?.stop(); setListening(false); return; }
    const r = new Ctor();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " : "") + t);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  }

  async function submit() {
    const text = input.trim();
    if (!text || status === "streaming" || status === "submitted") return;
    setInput("");
    await sendMessage({ text });
  }

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[100dvh] flex-col lg:h-screen">
      <header className="flex items-center gap-3 border-b border-border bg-background/80 px-6 py-4 backdrop-blur">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-leaf text-primary-foreground">
          <Leaf className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-lg font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">AgriSage · Agricultural advisor</div>
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="rounded-3xl border border-dashed p-8 text-center">
              <p className="font-display text-xl">Hello! 🌱</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask me about pest control, fertilizers, disease symptoms, irrigation — anything agricultural.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> AgriSage is thinking…
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-border bg-card p-2 shadow-soft">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleMic}
            className={listening ? "text-destructive" : "text-muted-foreground"}
          >
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={1}
            placeholder="Ask about your crop, disease, or fertilizer…"
            className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button onClick={submit} disabled={busy || !input.trim()} size="icon" className="rounded-2xl">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => ("text" in p && typeof p.text === "string" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`grid h-9 w-9 flex-none place-items-center rounded-xl ${isUser ? "bg-accent text-accent-foreground" : "bg-leaf text-primary-foreground"}`}>
        {isUser ? <UserIcon className="h-4 w-4" /> : <Leaf className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "rounded-3xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground" : "rounded-3xl rounded-tl-md bg-muted px-4 py-3"}`}>
        <div className="prose prose-sm max-w-none text-current prose-p:my-1 prose-ul:my-1 prose-headings:my-2 prose-li:my-0">
          <ReactMarkdown>{text || "…"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
