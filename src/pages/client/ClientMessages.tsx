import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebaseconfig";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "user";
  content: string;
  createdAt?: any;
}

interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  category: string;
  lastMessage: string;
  updatedAt?: any;
  unreadForClient: boolean;
  unreadForAdmin: boolean;
}

const categories = ["All", "Ads", "Designs", "Website", "SEO", "Support"];

const ClientMessages = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newThreadText, setNewThreadText] = useState("");
  const [newThreadCategory, setNewThreadCategory] = useState("Support");
  const [activeCategory, setActiveCategory] = useState("All");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const formatTime = (timestamp?: any) => {
    if (!timestamp) return "";
    if (timestamp.toDate) return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (typeof timestamp.toMillis === "function") return new Date(timestamp.toMillis()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return String(timestamp);
  };

  const sortThreads = (items: Conversation[]) => {
    return [...items].sort((a, b) => {
      const aMs = a.updatedAt?.toMillis?.() ?? 0;
      const bMs = b.updatedAt?.toMillis?.() ?? 0;
      return bMs - aMs;
    });
  };

  useEffect(() => {
    if (!user) return;
    const threadsRef = collection(db, "threads");
    const q = query(threadsRef, where("clientId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded = sortThreads(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as Conversation[]);
        setThreads(loaded);
        if (!activeThread && loaded.length > 0) {
          setActiveThread(loaded[0].id);
        }
      },
      (error) => {
        console.error("Failed to load message threads", error);
        toast({ title: "Unable to load messages", description: error.message || "Try again later.", variant: "destructive" });
      }
    );
    return unsubscribe;
  }, [user, toast, activeThread]);

  useEffect(() => {
    if (!activeThread) {
      setMessages([]);
      return;
    }
    const messagesRef = collection(db, "threads", activeThread, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as Message[]);
    });
    return unsubscribe;
  }, [activeThread]);

  const createNewThread = async () => {
    if (!user || !newThreadText.trim()) return;
    const clientName = user.businessName || user.fullName || user.email || "Client";
    try {
      const threadRef = await addDoc(collection(db, "threads"), {
        clientId: user.uid,
        clientName,
        category: newThreadCategory,
        lastMessage: newThreadText.trim(),
        updatedAt: serverTimestamp(),
        unreadForAdmin: true,
        unreadForClient: false,
      });
      await addDoc(collection(threadRef, "messages"), {
        senderId: user.uid,
        senderName: clientName,
        senderRole: "user",
        content: newThreadText.trim(),
        createdAt: serverTimestamp(),
      });
      setNewThreadText("");
      setActiveThread(threadRef.id);
      toast({ title: "Conversation started" });
    } catch (error) {
      console.error("Failed to create message thread", error);
      toast({ title: "Unable to start conversation", description: error.message || "Please try again.", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThread || !user) return;
    try {
      const threadRef = doc(db, "threads", activeThread);
      await addDoc(collection(threadRef, "messages"), {
        senderId: user.uid,
        senderName: user.businessName || user.fullName || user.email || "You",
        senderRole: "user",
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(threadRef, {
        lastMessage: newMessage.trim(),
        updatedAt: serverTimestamp(),
        unreadForAdmin: true,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message", error);
      toast({ title: "Message not sent", description: error.message || "Please try again.", variant: "destructive" });
    }
  };

  const selectThread = async (threadId: string) => {
    setActiveThread(threadId);
    try {
      await updateDoc(doc(db, "threads", threadId), { unreadForClient: false });
    } catch (error) {
      console.error("Failed to mark thread read", error);
    }
  };

  const filtered = activeCategory === "All" ? threads : threads.filter((thread) => thread.category === activeCategory);
  const currentThread = threads.find((thread) => thread.id === activeThread);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading messages...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="client" />
      <main className="flex-1 flex flex-col lg:flex-row">
        <div className={`${isMobile ? "w-full" : "w-96"} border-r border-border bg-card flex flex-col`}>
          <div className="p-5 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Messages</p>
                <h2 className="mt-2 text-2xl font-semibold text-card-foreground">Chat with admin</h2>
                <p className="mt-1 text-sm text-muted-foreground">Ask questions, share details, and track what admin says.</p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{filtered.length} threads</div>
            </div>

            <div className="mt-6 grid gap-2">
              <div className="rounded-3xl border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">Start a new conversation</p>
                    <p className="text-xs text-muted-foreground">Pick a topic and send a request to admin.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <select
                    value={newThreadCategory}
                    onChange={(e) => setNewThreadCategory(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-muted px-3 py-2 text-sm text-foreground"
                  >
                    {categories.filter((cat) => cat !== "All").map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <Textarea
                    placeholder="What do you need help with today?"
                    value={newThreadText}
                    onChange={(e) => setNewThreadText(e.target.value)}
                    className="min-h-[110px] rounded-3xl border border-border bg-background px-4 py-3"
                  />
                  <Button className="w-full" onClick={createNewThread} disabled={!newThreadText.trim()}>
                    Start conversation
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
                No conversations yet. Use the form above to message admin directly.
              </div>
            ) : (
              filtered.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => selectThread(thread.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    activeThread === thread.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-card-foreground truncate">{thread.category}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{thread.lastMessage}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{formatTime(thread.updatedAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{thread.clientName}</span>
                    {thread.unreadForClient && <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">New</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50">
          {currentThread ? (
            <>
              <div className="p-5 border-b border-border bg-white shadow-sm flex items-center justify-between gap-4">
                {isMobile && (
                  <button onClick={() => setActiveThread(null)} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{currentThread.category}</p>
                  <h3 className="mt-1 text-xl font-semibold text-card-foreground">Conversation with admin</h3>
                  <p className="text-sm text-muted-foreground">{currentThread.clientName} · {formatTime(currentThread.updatedAt)}</p>
                </div>
                {currentThread.unreadForClient && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">New response</span>}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="rounded-3xl bg-white p-8 text-center text-sm text-muted-foreground">No messages yet. Send the first message to begin the conversation.</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`relative max-w-[75%] rounded-3xl px-5 py-4 shadow-sm ${msg.senderRole === "user" ? "bg-primary text-primary-foreground" : "bg-white text-foreground"}`}>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{msg.senderRole === "user" ? "You" : "Admin"}</p>
                        <p className="text-sm leading-6 whitespace-pre-wrap">{msg.content}</p>
                        <p className="mt-3 text-[11px] text-muted-foreground">{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-5 border-t border-border bg-white">
                <div className="space-y-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write your reply..."
                    className="min-h-[110px] rounded-3xl border border-border bg-muted px-4 py-3"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSend} disabled={!newMessage.trim()}>
                      Send message
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Select a thread on the left, or start a new conversation to speak with admin.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientMessages;
