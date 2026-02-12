import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/providers/ChatProvider'
import { useAuth } from '@/providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'
import { getTrainerClients, getAllTrainers } from '@/services/firestore/trainers'

export function ChatDrawer() {
  const { user, profile } = useAuth()
  const { isOpen, closeChat, activeChatUser, messages, sendMessage, loading, openChat } = useChat()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch contacts for the list view
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['chatContacts', user?.uid],
    queryFn: async () => {
      if (!user || !profile) return []

      try {
        if (profile.role === 'trainer') {
          return await getTrainerClients(user.uid)
        } else if ((profile.role === 'trainee' || profile.role === 'hiker') && profile.trainerId) {
          const trainers = await getAllTrainers()
          const myTrainer = trainers.find(t => t.uid === profile.trainerId)
          return myTrainer ? [myTrainer] : []
        }
      } catch (err) {
        console.error('Error fetching contacts', err)
      }
      return []
    },
    enabled: !!user && isOpen && !activeChatUser, // Only fetch if drawer is open and no active chat
  })

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    await sendMessage(inputValue)
    setInputValue('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 md:inset-y-0 md:right-0 md:left-auto w-full md:w-96 bg-surface-dark md:border-l border-white/10 shadow-2xl z-50 flex flex-col">
      {/* View: Contact List */}
      {!activeChatUser && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 md:p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-white">Messages</h2>
            <button
              onClick={closeChat}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 md:p-2">
            {loadingContacts ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 md:p-8 text-center text-gray-500">
                <span className="material-icons text-4xl mb-2 opacity-50">people_outline</span>
                <p className="text-sm md:text-base">No contacts found.</p>
                {profile?.role === 'trainer' && (
                  <p className="text-xs mt-1">Your clients will appear here.</p>
                )}
                {(profile?.role === 'trainee' || profile?.role === 'hiker') && (
                  <p className="text-xs mt-1">Your assigned trainer will appear here.</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {contacts.map(contact => (
                  <button
                    key={contact.uid}
                    onClick={() =>
                      openChat({ uid: contact.uid, displayName: contact.displayName || 'User' })
                    }
                    className="w-full flex items-center gap-3 p-3 md:p-3 rounded-xl hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                        {contact.photoURL ? (
                          <img
                            src={contact.photoURL}
                            alt={contact.displayName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          (contact.displayName?.charAt(0) || contact.uid.charAt(0)).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate group-hover:text-primary transition-colors text-sm md:text-base">
                        {contact.displayName || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate capitalize">{contact.role || 'User'}</p>
                    </div>
                    <span className="material-icons text-gray-600 group-hover:text-primary text-sm flex-shrink-0">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* View: Chat Interface */}
      {activeChatUser && (
        <>
          {/* Header */}
          <div className="p-3 md:p-4 border-b border-white/10 bg-black/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <button
                onClick={() => openChat(null)}
                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white flex-shrink-0"
              >
                <span className="material-icons text-lg md:text-xl">arrow_back</span>
              </button>

              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden flex-shrink-0">
                {(activeChatUser.displayName?.charAt(0) || 'U').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-sm md:text-base truncate">{activeChatUser.displayName}</h3>
                <p className="text-[10px] md:text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></span>
                  24h Chat Active
                </p>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-black/10">
            {loading ? (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                <span className="material-icons text-4xl">forum</span>
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Messages disappear after 24 hours</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === user?.uid
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-4 md:py-3 text-sm ${
                        isMe
                          ? 'bg-primary text-background-dark rounded-br-none'
                          : 'bg-white/10 text-white rounded-bl-none'
                      }`}
                    >
                      <p className="break-words text-xs md:text-sm">{msg.content}</p>
                      <div
                        className={`text-[9px] md:text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'text-black/50' : 'text-gray-400'}`}
                      >
                        {msg.createdAt?.seconds
                          ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Sending...'}
                        {msg.expiresAt && (
                          <span className="material-icons text-[9px] md:text-[10px]" title="Expires in 24h">
                            timer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-white/10 bg-surface-dark flex-shrink-0">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-black/30 border border-white/10 rounded-xl pl-3 md:pl-4 pr-12 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-icons text-sm md:text-base">send</span>
              </button>
            </div>
            <p className="text-[9px] md:text-[10px] text-gray-500 mt-2 text-center">
              Messages are automatically deleted after 24 hours
            </p>
          </form>
        </>
      )}
    </div>
  )
}
