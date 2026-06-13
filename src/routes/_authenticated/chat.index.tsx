import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listThreads, createThread, deleteThread } from "@/lib/threads.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MessageSquareText, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/")({
  head: () => ({ meta: [{ title: "AI Chat — AgriSage" }] }),
  component: ChatList,
});

function ChatList() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);

  const { data: threads, isLoading } = useQuery({ queryKey: ["threads"], queryFn: () => list() });

  const newThread = useMutation({
    mutationFn: () => create({ data: { title: "New conversation" } }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
    },
    onError: () => toast.error("Couldn't create conversation"),
  });

  const removeThread = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">AI Chat</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Your conversations</h1>
        </div>
        <Button onClick={() => newThread.mutate()} disabled={newThread.isPending} className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> New chat
        </Button>
      </div>

      <Card className="mt-8 rounded-3xl border-border/60 p-2">
        {isLoading ? (
          <p className="p-8 text-center text-muted-foreground">Loading…</p>
        ) : threads && threads.length > 0 ? (
          <ul className="divide-y divide-border">
            {threads.map((t) => (
              <li key={t.id} className="flex items-center gap-2 p-2">
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="flex flex-1 items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-muted"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquareText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(t.updated_at).toLocaleString()}
                    </div>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-muted-foreground hover:text-destructive"
                  onClick={() => removeThread.mutate(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No conversations yet.</p>
            <Button onClick={() => newThread.mutate()} className="mt-4 rounded-full">
              <Plus className="mr-1 h-4 w-4" /> Start one
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
