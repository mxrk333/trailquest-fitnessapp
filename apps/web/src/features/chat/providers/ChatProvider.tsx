import { createContext, useContext, useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore'
import { useAuth } from '@/features/auth/providers/AuthProvider'
import { Message } from '@repo/shared'
import { toast } from 'react-hot-toast'

interface ChatContextType {
  activeChatUser: { uid: string; displayName: string } | null
  isOpen: boolean
  messages: Message[]
  loading: boolean
  unreadCount: number
  openChat: (user: { uid: string; displayName: string } | null) => void
  closeChat: () => void
  sendMessage: (content: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType>({
  activeChatUser: null,
  isOpen: false,
  messages: [],
  loading: false,
  unreadCount: 0,
  openChat: () => {},
  closeChat: () => {},
  sendMessage: async () => {},
})

export const useChat = () => useContext(ChatContext)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [activeChatUser, setActiveChatUser] = useState<{ uid: string; displayName: string } | null>(
    null
  )
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastReadTimes, setLastReadTimes] = useState<Record<string, number>>({})

  const openChat = (chatUser: { uid: string; displayName: string } | null) => {
    setActiveChatUser(chatUser)
    setIsOpen(true)

    // Mark messages as read when opening a chat
    if (chatUser && user) {
      const now = Date.now()
      const readKey = `lastRead_${user.uid}_${chatUser.uid}`
      localStorage.setItem(readKey, now.toString())
      // Update state to trigger unread count recalculation
      setLastReadTimes(prev => ({ ...prev, [chatUser.uid]: now }))
    }
  }

  const closeChat = () => {
    setIsOpen(false)
    setActiveChatUser(null)
  }

  const sendMessage = async (content: string) => {
    if (!user || !activeChatUser) return

    try {
      const now = Timestamp.now()
      // Expires in 24 hours
      const expiresAt = new Timestamp(now.seconds + 24 * 60 * 60, now.nanoseconds)

      const participants = [user.uid, activeChatUser.uid].sort()

      await addDoc(collection(db, 'messages'), {
        participants,
        senderId: user.uid,
        senderName: user.displayName || 'User',
        content,
        createdAt: now,
        expiresAt: expiresAt,
      })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  // Subscribe to ALL messages for unread count (global listener)
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const q = query(collection(db, 'messages'), where('participants', 'array-contains', user.uid))

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        let count = 0
        const now = new Date().getTime()

        snapshot.forEach(doc => {
          const data = doc.data()
          const expiry = data.expiresAt?.toMillis() || 0

          // Only count messages from others that haven't expired
          if (data.senderId !== user.uid && expiry > now) {
            // Check if this message was read
            const otherUserId = data.participants.find((uid: string) => uid !== user.uid)

            // Use state first, fallback to localStorage
            const stateReadTime = lastReadTimes[otherUserId] || 0
            const readKey = `lastRead_${user.uid}_${otherUserId}`
            const storageReadTime = parseInt(localStorage.getItem(readKey) || '0', 10)
            const lastReadTime = Math.max(stateReadTime, storageReadTime)

            const messageTime = data.createdAt?.toMillis() || 0

            // Only count if message is newer than last read time
            if (messageTime > lastReadTime) {
              count++
            }
          }
        })

        setUnreadCount(count)
      },
      error => {
        console.error('Error fetching unread count:', error)
      }
    )

    return () => unsubscribe()
  }, [user, lastReadTimes])

  // Subscribe to messages when a chat is open
  useEffect(() => {
    if (!user || !activeChatUser || !isOpen) {
      setMessages([])
      return
    }

    setLoading(true)

    // Sort UIDs to ensure consistent querying if needed, but array-contains works too
    // For specific pair chat, we usually verify both are in participants
    // A simpler way is: participants array-contains MY_UID
    // AND THEN filter client-side or use a compound query if index exists.
    // Optimal query: participants array-contains user.uid AND participants array-contains activeChatUser.uid
    // But Firestore doesn't support multiple array-contains.
    // So we'll query for messages where *I* am a participant, and then filter for the *other* person.

    // Actually, a better way for 1:1 chat is generating a unique chat ID (uid1_uid2 sorted).
    // But keeping it simple with array-contains logic for now as per plan.
    // Let's rely on constructing a query that fetches messages involving ME, and then filtr for the active user.
    // However, for scalability, let's just use the `participants` array exact match check?
    // Firestore only supports `in` or `array-contains`.
    // Let's use: where('participants', 'array-contains', user.uid)
    // Then client-side filter for now. It's safe enough for this scale.

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid)
      // Removed orderBy to avoid composite index requirement
    )

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const msgs: Message[] = []
        const now = new Date().getTime()

        snapshot.forEach(doc => {
          const data = doc.data()
          // Check if the other participant is the one we are talking to
          if (data.participants.includes(activeChatUser.uid)) {
            // Client-side expiry check (visual only logic as per plan)
            const expiry = data.expiresAt?.toMillis() || 0
            if (expiry > now) {
              msgs.push({ id: doc.id, ...data } as Message)
            }
          }
        })

        // Client-side sort
        msgs.sort((a, b) => {
          const tA = a.createdAt?.toMillis() || 0
          const tB = b.createdAt?.toMillis() || 0
          return tA - tB
        })

        setMessages(msgs)
        setLoading(false)
      },
      error => {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, activeChatUser, isOpen])

  // Update last read time when viewing messages in an active chat
  useEffect(() => {
    if (user && activeChatUser && isOpen && messages.length > 0) {
      const now = Date.now()
      const readKey = `lastRead_${user.uid}_${activeChatUser.uid}`
      localStorage.setItem(readKey, now.toString())
      // Update state to trigger unread count recalculation
      setLastReadTimes(prev => ({ ...prev, [activeChatUser.uid]: now }))
    }
  }, [user, activeChatUser, isOpen, messages])

  return (
    <ChatContext.Provider
      value={{
        activeChatUser,
        isOpen,
        messages,
        loading,
        unreadCount,
        openChat,
        closeChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
