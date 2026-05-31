"use client";

import React, { use, useEffect, useState, useRef, useMemo } from "react";
import { ArrowLeft, MessageCircle, Send, Clock, Loader2, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getStatusBadge } from "@/lib/statusServices";
import { socket } from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { useUser } from "@/hooks/useUser";
import { useStatuses } from "@/features/admin/statuses/hooks";
import { usePersonMappings } from "@/features/admin/person-mappings/hooks";
import { useRequestDetail, useRequestChat } from "@/features/portal/hooks";

// ---- Types ----
interface ServiceRequest {
  ServiceRequestID: string;
  Title: string;
  Description: string;
  Priority: string;
  StatusID: string | null;
  Created: string;
  ServiceRequestTypeID: string | null;
  AssignedToID: string | null;
  ServiceRequestType?: { RequestTypeName: string } | null;
  ServiceRequestStatus?: {
    ServiceRequestStatusName: string;
    ServiceRequestStatusCssClass: string;
    IsTerminal?: boolean | null;
    IsDefault?: boolean | null;
  } | null;
  ServiceDeptPerson?: {
    Users?: {
      FullName: string;
    } | null;
  } | null;
}

interface Reply {
  ReplyID: string;
  Message: string;
  Created: string;
  RepliedByID: string | null;
  StatusID: string | null;
  Users?: { FullName: string; Role?: string } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetails({ params }: PageProps) {
  const resolvedParams = use(params);
  const ServiceRequestID = resolvedParams.id;
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useUser();
  const { data: statusesData = [], isLoading: statusesLoading } = useStatuses();
  const statuses = statusesData as any[];

  const { data: request, isLoading: requestLoading } = useRequestDetail(ServiceRequestID);
  const { data: messages = [], isLoading: chatLoading } = useRequestChat(ServiceRequestID);
  
  const { data: mappings = [] } = usePersonMappings();

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loading = userLoading || statusesLoading || requestLoading || chatLoading;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Role-aware back navigation: technicians go to /technician, others to /request-details
  const backHref = useMemo(() => {
    const role = user?.Role?.toLowerCase();
    if (role === "technician") return "/technician";
    return "/request-details";
  }, [user]);

  useEffect(() => {
    // join the room where both users join on same service request id 
    socket.emit("join_request", ServiceRequestID);
  }, [ServiceRequestID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---- Send reply ----
  const sendMessage = () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);

    // If socket is entirely disconnected, throw immediately
    if (!socket.connected) {
      setError("Lost connection to chat server. Trying to reconnect...");
      setSending(false);
      return;
    }

    socket.emit("send_message", {
      message,
      ReplyByID: user?.UserID,
      Status: 1,
      ServiceRequestID: ServiceRequestID,
    });

    setMessage("");
  };

  useEffect(() => {
    // When a message is successfully received back via socket:
    const handleReceiveMessage = (data: any) => {
      queryClient.setQueryData<any[]>(queryKeys.portal.requestChat(ServiceRequestID), (old) => {
        return old ? [...old, data] : [data];
      });
      setSending(false);
      setError(null);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [ServiceRequestID, queryClient]);

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
          <Link href={backHref}>Go back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="p-3 bg-card rounded-2xl border text-muted-foreground hover:text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Request SR-{ServiceRequestID}
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
              const isOwn = reply.RepliedByID === user?.UserID;
              const senderName = reply.Users?.FullName || "User";
              const initials = senderName.split(" ").map((n: string) => n[0]).join("").substring(0, 2);

              return (
                <div
                  key={reply.ReplyID}
                  className={`flex gap-3 max-w-[85%] ${isOwn ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 mt-auto shrink-0 border border-primary/10">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`p-4 rounded-2xl border flex flex-col ${
                    isOwn 
                      ? "rounded-br-sm bg-primary text-primary-foreground border-primary" 
                      : "rounded-bl-sm bg-muted/40 border-border/50"
                  }`}>
                    {!isOwn && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {senderName}
                        </span>
                        {reply.Users?.Role && (
                          <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            {reply.Users.Role}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <p className={`text-sm leading-relaxed ${isOwn ? "text-primary-foreground/90" : "text-card-foreground/90"}`}>
                      {reply.Message}
                    </p>
                    
                    <span className={`text-[10px] mt-2 font-bold uppercase ${isOwn ? "text-primary-foreground/60 text-right" : "text-muted-foreground"}`}>
                      {new Date(reply.Created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
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
          <div className="p-6 border-t bg-card/50">
            {error && (
              <div className="flex items-center gap-2 text-destructive mb-3 px-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}
            <div className={`flex gap-3 bg-muted/40 p-2 rounded-2xl border transition-all ${
              sending ? "opacity-70 pointer-events-none" : "focus-within:ring-4 ring-primary/10 border-primary/20"
            }`}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-medium"
              />
              <Button
                size="icon"
                onClick={sendMessage}
                disabled={!message.trim() || sending}
                className="rounded-xl shrink-0"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send size={18} />
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
              {getStatusBadge(request, statuses)}
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