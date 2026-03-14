"use client";

import React, { use, useEffect, useState, useRef } from "react";
import { ArrowLeft, MessageCircle, Send, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { socket } from "@/lib/socket";
// ---- Types ----
interface ServiceRequest {
  ServiceRequestID: string;
  Title: string;
  Description: string;
  Priority: string;
  StatusID: string | null;
  Created: string;
  ServiceRequestType?: { RequestTypeName: string } | null;
}

interface Reply {
  ReplyID: string;
  Message: string;
  Created: string;
  RepliedByID: string | null;
  StatusID: string | null;
  Users?: { FullName: string } | null;
}

interface UserInfo {
  userId: string;
  fullName: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetails({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ---- Fetch user info ----
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get<UserInfo[]>("/api/auth/me");
        if (res.success && res.data?.[0]) {
          setUser(res.data[0] as unknown as UserInfo);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // ---- Fetch request details ----
  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<ServiceRequest[]>(`/api/portal/requestor/${id}`);
        if (res.success && res.data?.[0]) {
          setRequest(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch request:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  //fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any[]>(`/api/chat/${id}`);
        if (res.success && res.data) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [id]);

  // ---- Status helper ----
  const getStatusLabel = (statusId: string | null) => {
    if (!statusId) return "Pending";
    const sid = Number(statusId);
    if (sid === 1) return "Pending";
    if (sid === 2) return "Assigned";
    if (sid === 3) return "In Progress";
    if (sid === 4) return "Completed";
    return "Pending";
  };

  const getStatusClass = (statusId: string | null) => {
    const label = getStatusLabel(statusId);
    if (label === "Completed") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (label === "In Progress") return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  useEffect(() => {

    socket.emit("join_request", id);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
      setSending(false);
    });

    return () => {
      socket.off("receive_message");
    };

  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // ---- Send reply (placeholder — you can add a reply API later) ----
  const sendMessage = () => {
    if (!message.trim() || sending) return;
    setSending(true);

    socket.emit("send_message", {
      message,
      ReplyByID: user?.userId,
      Status: 1,
      ServiceRequestID: id,
    });

    setMessage("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <p className="text-lg font-medium">Request not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/request-details">Go back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <Link
          href="/request-details"
          className="p-3 bg-card rounded-2xl border text-muted-foreground hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Request #SR-{id}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
            Conversation Timeline
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Thread */}
        <div className="lg:col-span-2 flex flex-col h-[600px] bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <MessageCircle size={18} className="text-primary" /> Activity Log
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Original request as first message */}
            <div className="bg-muted/50 p-5 rounded-2xl border max-w-[80%]">
              <p className="text-sm font-bold text-foreground mb-1">
                {request.Title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {request.Description || "No description provided."}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">
                {new Date(request.Created).toLocaleString()}
              </p>
            </div>

            {/* Replies */}
            {messages.map((reply) => {
              const isOwn = reply.RepliedByID === user?.userId;
              return (
                <div
                  key={reply.ReplyID}
                  className={`p-5 rounded-2xl border max-w-[80%] ${
                    isOwn
                      ? "ml-auto bg-primary/5 border-primary/20"
                      : "bg-muted/50"
                  }`}
                >
                  <p className="text-sm font-bold text-foreground mb-1">
                    {reply.Users?.FullName || "User"}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reply.Message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">
                    {new Date(reply.Created).toLocaleString()}
                  </p>
                </div>
              );
            })}

            {messages.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No replies yet. Start the conversation below.
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Box */}
          <div className="p-6 border-t">
            <div className="flex gap-4 bg-muted/50 p-2 rounded-2xl border focus-within:ring-4 ring-primary/5 transition-all">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium"
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="rounded-xl"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-8 h-fit space-y-6">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Request Info
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Status</span>
              <Badge className={`text-[10px] px-2 py-1 font-bold uppercase ${getStatusClass(request.StatusID)}`}>
                {getStatusLabel(request.StatusID)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Type</span>
              <span className="text-sm font-semibold">
                {request.ServiceRequestType?.RequestTypeName || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Priority</span>
              <span className="text-sm font-semibold">
                {request.Priority ? (
                  Number(request.Priority) >= 4 ? "Urgent" :
                  Number(request.Priority) === 3 ? "High" :
                  Number(request.Priority) === 2 ? "Medium" : "Low"
                ) : "—"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Created</span>
              <span className="text-sm font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(request.Created).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}