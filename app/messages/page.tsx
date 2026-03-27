"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Participant {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
  sellerProfile?: { businessName: string } | null
}

interface ThreadMessage {
  id: string
  body: string
  senderId: string
  createdAt: string
  isRead: boolean
  sender: Participant
}

interface Thread {
  id: string
  participantA: Participant
  participantB: Participant
  lastMessageAt: string
  messages: ThreadMessage[]
}

function displayName(p: Participant) {
  return p.sellerProfile?.businessName || [p.firstName, p.lastName].filter(Boolean).join(" ") || "User"
}

function initials(p: Participant) {
  const name = displayName(p)
  return name.slice(0, 2).toUpperCase()
}

export default function MessagesPage() {
  const { userId: clerkId, isLoaded } = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [myUserId, setMyUserId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoaded) return
    fetchThreads()
  }, [isLoaded])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchThreads = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()
      setThreads(data.threads || [])
    } finally {
      setLoading(false)
    }
  }

  const openThread = async (thread: Thread) => {
    setSelected(thread)
    const res = await fetch(`/api/messages/${thread.id}`)
    const data = await res.json()
    setMessages(data.thread?.messages || [])
    const me = data.thread?.participantA?.clerkId === clerkId
      ? data.thread?.participantA?.id
      : data.thread?.participantB?.id
    setMyUserId(me || "")
    fetchThreads()
  }

  const sendMessage = async () => {
    if (!body.trim() || !selected) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages(prev => [...prev, data.message])
        setBody("")
        fetchThreads()
      }
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = (thread: Thread): Participant => {
    if (!myUserId) return thread.participantA
    return thread.participantAId === myUserId ? thread.participantB : thread.participantA
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" /> Messages
      </h1>

      <div className="border rounded-xl overflow-hidden flex h-[600px]">
        <div className={`w-80 border-r flex flex-col ${selected ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-600">Conversations</p>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : threads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
              <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No conversations yet.<br />Message a seller from a product page.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y">
              {threads.map(thread => {
                const other = myUserId
                  ? (thread.participantA.id === myUserId ? thread.participantB : thread.participantA)
                  : thread.participantA
                const lastMsg = thread.messages[0]
                const unread = lastMsg && !lastMsg.isRead && lastMsg.senderId !== myUserId
                return (
                  <button
                    key={thread.id}
                    onClick={() => { setMyUserId(thread.participantA.id); openThread(thread) }}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id === thread.id ? "bg-amber-50" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={other.imageUrl || ""} />
                        <AvatarFallback className="bg-[#8B2635] text-white text-xs">{initials(other)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm truncate">{displayName(other)}</p>
                          {lastMsg && (
                            <span className="text-xs text-gray-400 shrink-0 ml-1">
                              {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className={`text-xs truncate ${unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                            {lastMsg.body}
                          </p>
                        )}
                      </div>
                      {unread && <Badge className="bg-[#8B2635] text-white text-xs px-1.5 py-0.5 rounded-full shrink-0">•</Badge>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {selected ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelected(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {(() => {
                const other = selected.participantA.id === myUserId ? selected.participantB : selected.participantA
                return (
                  <>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={other.imageUrl || ""} />
                      <AvatarFallback className="bg-[#8B2635] text-white text-xs">{initials(other)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{displayName(other)}</p>
                    </div>
                  </>
                )
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === myUserId
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-[#8B2635] text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                      <p>{msg.body}</p>
                      <p className={`text-xs mt-1 ${isMe ? "text-red-200" : "text-gray-400"}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white flex gap-2">
              <Input
                placeholder="Type a message…"
                value={body}
                onChange={e => setBody(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!body.trim() || sending} className="bg-[#8B2635] hover:bg-[#7a1f2e] text-white">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-16 w-16 opacity-20 mb-4" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose from your existing messages or start a new one from a product page.</p>
          </div>
        )}
      </div>
    </div>
  )
}
