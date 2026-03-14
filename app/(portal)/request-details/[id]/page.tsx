"use client";

import React, { use, useEffect, useState, useRef } from "react";
import { ArrowLeft, MessageCircle, Send, Clock, Loader2, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  ServiceRequestTypeID: string | null;
  AssignedToID: string | null;
  ServiceRequestType?: { RequestTypeName: string } | null;
  ServiceRequestStatus?: {
    ServiceRequestStatusName: string;
    ServiceRequestStatusCssClass: string;
  } | null;
  ServiceDeptPerson?: {
    Users?: {
      FullName: string;
    } | null;
  } | null;
}

interface ServiceRequestStatus {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  ServiceRequestStatusCssClass: string;
}

interface Reply {
  ReplyID: string;
  Message: string;
  Created: string;
  RepliedByID: string | null;
  StatusID: string | null;
  Users?: { FullName: string; Role?: string } | null;
}

interface UserInfo {
  userId: string;
  fullName: string;
  role: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RequestDetails({ params }: PageProps) {
  const resolvedParams = use(params);
  const ServiceRequestID = resolvedParams.id;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mappings, setMappings] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  // ---- Fetch Statuses ----
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await apiClient.get<ServiceRequestStatus[]>("/api/admin/status-master");
        if (res.success && res.data) {
          setStatuses(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
      }
    };
    fetchStatuses();
  }, []);

  // ---- Fetch request details ----
  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ServiceRequest[]>(`/api/portal/requestor/${ServiceRequestID}`);
      if (res.success && res.data?.[0]) {
        setRequest(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch request:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [ServiceRequestID]);

  // ---- Fetch Mappings for Assigning (if HOD) ----
  useEffect(() => {
    const fetchMappings = async () => {
      try {
        const res = await apiClient.get<any[]>("/api/admin/person-mapping");
        if (res.success && res.data) {
          setMappings(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch mappings:", err);
      }
    };
    if (user?.role?.toLowerCase() === "hod") {
      fetchMappings();
    }
  }, [user]);

  // ---- Handle Assign/Re-assign (HOD only) ----
  const handleAssign = async (assignToId: string) => {
    if (!request) return;
    setAssigning(true);
    try {
      const res = await apiClient.patch(`/api/hod/${request.ServiceRequestID}`, {
        AssignedToID: assignToId
      });
      if (res.success) {
        await fetchRequest();
      } else {
        alert("Failed to assign request: " + (res.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Assignment error:", err);
      alert("An error occurred while assigning.");
    } finally {
      setAssigning(false);
    }
  };

  //fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<any[]>(`/api/chat/${ServiceRequestID}`);
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
  }, [ServiceRequestID]);

  // ---- Status helper ----
  const getStatusLabel = (statusId: string | null) => {
    if (!statusId) return "Pending";
    const id = Number(statusId);
    const status = statuses.find(s => s.ServiceRequestStatusID === id);
    if (status) return status.ServiceRequestStatusName;
    return "Pending";
  };

  const getStatusClass = (statusId: string | null) => {
    if (!statusId) return "bg-slate-100 text-slate-700 hover:bg-slate-100";
    const id = Number(statusId);
    const status = statuses.find(s => s.ServiceRequestStatusID === id);
    if (status && status.ServiceRequestStatusCssClass) return status.ServiceRequestStatusCssClass;
    
    // Fallback classes if dynamic is missing
    const label = getStatusLabel(statusId);
    if (label === "Completed") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (label === "In Progress") return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

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

    // Prepare state timeout in case the response event never returns
    const timeoutId = setTimeout(() => {
      setSending((isStillSending) => {
        if (isStillSending) {
          setError("Message delivery timeout. Please try sending again.");
          return false;
        }
        return isStillSending;
      });
    }, 5000);

    socket.emit("send_message", {
      message,
      ReplyByID: user?.userId,
      Status: 1,
      ServiceRequestID: ServiceRequestID,
    });

    // We keep message content in case they need to re-send it due to error,
    // so we clear it only on successful `receive_message` inside the socket.on listener!
    // But for smoother UI feeling immediately, we can clear it and only set loading:
    setMessage("");
  };

  useEffect(() => {
    // When a message is successfully received back via socket:
    const handleReceiveMessage = (data: any) => {
      setMessages((prev) => [...prev, data]);
      setSending(false);
      setError(null);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

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
              const isOwn = reply.RepliedByID === user?.userId;
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
              <Badge className={`text-[10px] px-2 py-1 font-bold uppercase ${request.ServiceRequestStatus?.ServiceRequestStatusCssClass || getStatusClass(request.StatusID)}`}>
                {request.ServiceRequestStatus?.ServiceRequestStatusName || getStatusLabel(request.StatusID)}
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

            {/* Assignment Block */}
            <div className="pt-4 mt-4 border-t border-border/50">
              <div className="flex flex-col space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase">Assigned To</span>
                
                {user?.role?.toLowerCase() === "hod" ? (
                  <Select
                    disabled={assigning || getStatusLabel(request.StatusID) === "Completed" || String(request.StatusID) === "4"}
                    value={request.AssignedToID ? String(request.AssignedToID) : ""}
                    onValueChange={handleAssign}
                  >
                    <SelectTrigger className="w-full text-sm font-semibold h-10 bg-muted/40 border-primary/20 hover:bg-muted/60 transition-colors">
                      <SelectValue placeholder="Assign technician..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mappings
                        .filter(m => String(m.ServiceRequestTypeID) === String(request.ServiceRequestTypeID))
                        .map((m) => (
                          <SelectItem key={String(m.ServicePersonID)} value={String(m.ServicePersonID)}>
                            {m.ServiceDeptPerson?.Users?.FullName || `Technician #${m.ServicePersonID}`}
                          </SelectItem>
                        ))}
                      {mappings.filter(m => String(m.ServiceRequestTypeID) === String(request.ServiceRequestTypeID)).length === 0 && (
                        <SelectItem value="none" disabled>
                          No technicians mapped for this type
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm font-semibold bg-muted px-3 py-2 rounded-lg border border-border/50">
                    {request.ServiceDeptPerson?.Users?.FullName || (request.AssignedToID ? "Loading..." : "Unassigned")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}