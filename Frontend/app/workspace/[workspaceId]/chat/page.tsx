"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { backendApi, getWsBaseUrl, type ChannelResponse, type MessageResponse } from "@/lib/api";
import { Loader2, MessageCircle, Plus } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const workspaceId = Number(params.workspaceId);

  const [token, setToken] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChannelResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [usersById, setUsersById] = useState<Record<number, { user_id: number; email: string }>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem("smart-study-access-token"));
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setIsLoading(true);
    const tokenChecked = token;
    async function load() {
      try {
        const [cList, mList] = await Promise.all([
          backendApi.getWorkspaceChannels(tokenChecked, workspaceId),
          backendApi.getWorkspaceMessages(tokenChecked, workspaceId),
        ]);

        if (cancelled) return;
        setChannels(cList);
        setMessages(mList.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        setSelectedChannelId((s) => s ?? cList[0]?.channel_id ?? null);

        // fetch user info for members and existing message senders
        const userIds = new Set<number>();
        mList.forEach((m) => userIds.add(m.sender_id));
        const userPromises: Promise<any>[] = [];
        userIds.forEach((id) => userPromises.push(backendApi.getUser(token, id)));
        const userResults = await Promise.allSettled(userPromises);
        const map: Record<number, { user_id: number; email: string }> = {};
        userResults.forEach((res) => {
          if (res.status === "fulfilled") {
            map[res.value.user_id] = res.value;
          }
        });
        setUsersById(map);
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, workspaceId]);

  // WebSocket for realtime messages
  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(`${getWsBaseUrl()}/ws/workspaces/${workspaceId}/messages?token=${encodeURIComponent(token)}`);
    wsRef.current = socket;

    socket.onmessage = (event) => {
    try {
        const payload = JSON.parse(event.data) as {
        event: string;
        message?: MessageResponse;
        };

        if (payload.event === "message.created" && payload.message) {
        const message = payload.message;

        setMessages((current) => [...current, message]);

        // fetch user if missing
        const senderId = message.sender_id;

        if (!usersById[senderId]) {
            backendApi
            .getUser(token, senderId)
            .then((u) => {
                setUsersById((prev) => ({
                ...prev,
                [u.user_id]: u,
                }));
            })
            .catch(() => {});
        }
        }
    } catch (e) {
        // ignore
    }
    };

    socket.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      socket.close();
    };
  }, [token, workspaceId, usersById]);

  useEffect(() => {
    // scroll to bottom on new messages for selected channel
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChannelId]);

  async function handleSendMessage() {
    if (!token || !selectedChannelId || !newMessage.trim()) return;
    setIsSending(true);
    try {
      await backendApi.createMessage(token, workspaceId, newMessage.trim(), selectedChannelId);
      setNewMessage("");
    } catch (err) {
      // show error briefly
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  async function handleCreateChannel() {
    if (!token || !newChannelName.trim()) return;
    setIsCreatingChannel(true);
    try {
      const ch = await backendApi.createChannel(token, workspaceId, { name: newChannelName.trim() });
      setChannels((c) => [...c, ch]);
      setSelectedChannelId(ch.channel_id);
      setNewChannelName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingChannel(false);
    }
  }

  if (isLoading) return <div className="panel"><Loader2 className="animate-spin"/> Loading chat...</div>;

  const filtered = messages.filter((m) => m.channel_id === selectedChannelId);

  return (
    <div className="section-shell py-6">
      <div className="max-w-6xl grid grid-cols-3 gap-6">
        <aside className="col-span-1 panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-accent" />
              <h3 className="font-semibold">Channels</h3>
            </div>
            <div className="text-xs text-slate-500">{channels.length}</div>
          </div>

          <div className="space-y-2 max-h-[56vh] overflow-auto">
            {channels.map((c) => (
              <button
                key={c.channel_id}
                onClick={() => setSelectedChannelId(c.channel_id)}
                className={`w-full text-left rounded-2xl px-3 py-2 flex items-center gap-3 ${selectedChannelId === c.channel_id ? "bg-teal-600 text-white" : "bg-white"}`}
              >
                <div className="h-8 w-8 rounded-full" style={{ background: c.color }} />
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.description ?? ""}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="New channel" className="flex-1 rounded-2xl border px-3 py-2 text-sm outline-none" />
            <button className="secondary-button flex-shrink-0" onClick={handleCreateChannel} disabled={isCreatingChannel}>
              <Plus className="mr-2" /> Create
            </button>
          </div>
        </aside>

        <main className="col-span-2">
          <div className="panel h-[64vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{channels.find((c) => c.channel_id === selectedChannelId)?.name ?? "Channel"}</h3>
                <div className="text-xs text-slate-500">{filtered.length} messages</div>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-3" style={{ paddingRight: 8 }}>
              {filtered.map((m) => (
                <div key={m.message_id} className="rounded-2xl border p-3 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">{usersById[m.sender_id]?.email?.charAt(0).toUpperCase() ?? "U"}</div>
                    <div className="flex-1">
                      <div className="font-medium">{usersById[m.sender_id]?.email ?? `User #${m.sender_id}`}</div>
                      <div className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">{m.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-3">
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={3} placeholder="Write a message..." className="w-full rounded-2xl border px-4 py-3 text-sm outline-none" />
              <div className="mt-2 flex justify-end">
                <button className="primary-button" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                  {isSending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <MessageCircle className="mr-2" />} Send
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
