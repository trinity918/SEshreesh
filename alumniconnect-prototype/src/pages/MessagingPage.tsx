import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, MessageSquare } from 'lucide-react';

// TODO: Later → MongoDB 'messages' or 'conversations' collection
// In real system, messages should be end-to-end encrypted (e.g., AES-256 + secure key exchange)

interface MessagingPageProps {
  userRole: 'student' | 'alumni';
}

export const MessagingPage = ({ userRole }: MessagingPageProps) => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    activeConversation,
    loadConversations,
    loadMessages,
    sendNewMessage,
    setActiveConversation,
  } = useData();

  const [newMessage, setNewMessage] = useState('');

// In MessagingPage.tsx, in the useEffect that loads conversations
useEffect(() => {
  console.log('MessagingPage: Current user:', user);
  console.log('MessagingPage: User ID:', user?.id);
  loadConversations();
}, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendNewMessage(newMessage);
    setNewMessage('');
  };

  const getOtherParticipant = (conv: typeof conversations[0]) => {
    return conv.participants.find(p => p.id !== user?.id);
  };

  return (
    <DashboardLayout requiredRole={userRole}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground">Connect with your {userRole === 'student' ? 'mentors' : 'mentees'}</p>
        </div>

        <Card className="h-[calc(100vh-220px)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-80 border-r border-border">
              <CardHeader className="border-b border-border py-4">
                <CardTitle className="text-base">Conversations</CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                {conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    return (
                      <button
                        key={conv.id}
                        className={cn(
                          'flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/50',
                          activeConversation?.id === conv.id && 'bg-secondary'
                        )}
                        onClick={() => setActiveConversation(conv)}
                      >
                        <Avatar>
                          <AvatarImage src={other?.avatar} alt={other?.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {other?.name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground truncate">{other?.name}</p>
                            {conv.unreadCount > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex flex-1 flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <Avatar>
                      <AvatarImage src={getOtherParticipant(activeConversation)?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getOtherParticipant(activeConversation)?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{getOtherParticipant(activeConversation)?.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {getOtherParticipant(activeConversation)?.role}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwnMessage = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              'flex',
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <div
                              className={cn(
                                'max-w-[70%] rounded-2xl px-4 py-2',
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-secondary text-secondary-foreground rounded-bl-md'
                              )}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={cn(
                                  'mt-1 text-xs',
                                  isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                )}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
                  <p className="mt-4 text-lg font-medium text-foreground">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">Choose a conversation to start messaging</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
