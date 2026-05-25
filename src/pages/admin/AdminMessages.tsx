import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebaseconfig";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "admin" | "user";
  content: string;
  createdAt?: any;
}

interface Thread {
  id: string;
  clientId: string;
  clientName: string;
  category: string;
  lastMessage: string;
  updatedAt?: any;
  unreadForAdmin: boolean;
  unreadForClient: boolean;
}

const categories = ["All", "Ads", "Designs", "Website", "SEO", "Support"];

const AdminMessages = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const formatTime = (timestamp?: any) => {
    if (!timestamp) return "";
    if (timestamp.toDate) return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (typeof timestamp.toMillis === "function") return new Date(timestamp.toMillis()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return String(timestamp);
  };

  useEffect(() => {
    const threadsRef = collection(db, "threads");
    const q = query(threadsRef, orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) })) as Thread[];
        setThreads(loaded);
        if (!activeThread && loaded.length > 0) {
          setActiveThread(loaded[0].id);
        }
      },
      (error) => {
        console.error("Failed to load client threads", error);
        toast({ title: "Unable to load messages", description: error.message || "Try again later.", variant: "destructive" });
      }
    );
    return unsubscribe;
  }, [activeThread, toast]);

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

  const handleSend = async () => {
    if (!newMessage.trim() || !activeThread || !user) return;
    try {
      const threadRef = doc(db, "threads", activeThread);
      await addDoc(collection(threadRef, "messages"), {
        senderId: user.uid,
        senderName: user.fullName || user.email || "Admin",
        senderRole: "admin",
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
      });
      await updateDoc(threadRef, {
        lastMessage: newMessage.trim(),
        updatedAt: serverTimestamp(),
        unreadForClient: true,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send admin message", error);
      toast({ title: "Message not sent", description: error.message || "Please try again.", variant: "destructive" });
    }
  };

  const selectThread = async (threadId: string) => {
    setActiveThread(threadId);
    try {
      await updateDoc(doc(db, "threads", threadId), { unreadForAdmin: false });
    } catch (error) {
      console.error("Failed to mark thread read", error);
    }
  };

  const filtered = activeCategory === "All" ? threads : threads.filter((thread) => thread.category === activeCategory);
  const currentThread = threads.find((thread) => thread.id === activeThread);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 flex flex-col lg:flex-row">
        <div className={`${isMobile ? "w-full" : "w-96"} border-r border-border bg-card flex flex-col`}>
          <div className="p-5 border-b border-border">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Client Messages</p>
            <h2 className="mt-3 text-2xl font-semibold text-card-foreground">Manage client chats</h2>
            <p className="mt-2 text-sm text-muted-foreground">View active requests and reply to clients in one place.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
                No conversations yet. Clients will appear here once they start a message.
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
                      <p className="text-sm font-semibold text-card-foreground truncate">{thread.clientName}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{thread.lastMessage}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{formatTime(thread.updatedAt)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{thread.category}</span>
                    {thread.unreadForAdmin && <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground">New</span>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-slate-50">
          {currentThread ? (
            <>
              <div className="p-5 border-b border-border bg-white shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{currentThread.category}</p>
                  <h3 className="mt-2 text-xl font-semibold text-card-foreground">{currentThread.clientName}</h3>
                  <p className="text-sm text-muted-foreground">{formatTime(currentThread.updatedAt)}</p>
                </div>
                {isMobile && (
                  <button onClick={() => setActiveThread(null)} className="rounded-full border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                    Back
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="rounded-3xl bg-white p-8 text-center text-sm text-muted-foreground">No message yet. Start the chat with a clear reply.</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === "user" ? "justify-start" : "justify-end"}`}>
                      <div className={`relative max-w-[80%] rounded-3xl px-5 py-4 shadow-sm ${msg.senderRole === "user" ? "bg-white text-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">{msg.senderRole === "admin" ? "You" : msg.senderName}</p>
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
                    placeholder="Write your reply to the client..."
                    className="min-h-[120px] rounded-3xl border border-border bg-muted px-4 py-3"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
              Select a conversation from the left panel to review and respond.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminMessages;
