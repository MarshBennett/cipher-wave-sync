"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Lock, Calendar, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useState } from "react";

interface Message {
  id: number;
  content: string;
  timestamp: number;
  decrypted: boolean;
  isDecrypting?: boolean;
}

interface MessageListProps {
  messages: Message[];
  onDecrypt: (id: number) => Promise<void>;
  isLoading: boolean;
}

const MessageList = ({ messages, onDecrypt, isLoading }: MessageListProps) => {
  const { isConnected } = useAccount();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (!isConnected) {
    return (
      <Card className="p-6 border-border/50 text-center bg-card/80 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
            <Lock className="h-12 w-12 text-primary mx-auto relative z-10 animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            Connect your wallet to view your encrypted messages
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 border-border/50 text-center bg-card/80 backdrop-blur-sm">
        <div className="relative inline-block mb-4">
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-8 w-8 text-primary mx-auto relative z-10 animate-spin" />
        </div>
        <p className="text-muted-foreground">Loading your messages...</p>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="p-6 border-border/50 text-center bg-card/80 backdrop-blur-sm relative overflow-hidden group hover:border-primary/30 transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">
            No messages yet. Submit your first encrypted message above.
          </p>
        </div>
      </Card>
    );
  }

  const sortedMessages = [...messages].sort((a, b) => b.id - a.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          {messages.length} {messages.length === 1 ? 'message' : 'messages'} found
        </p>
      </div>
      {sortedMessages.map((message, index) => (
        <Card 
          key={message.id} 
          className="p-4 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 group relative overflow-hidden animate-slide-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
          onMouseEnter={() => setHoveredId(message.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Shimmer effect on hover */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ${hoveredId === message.id ? 'translate-x-full' : ''}`} />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Lock className={`h-4 w-4 text-primary relative z-10 transition-transform ${message.decrypted ? 'scale-110' : ''}`} />
                </div>
                <span className="text-sm font-medium group-hover:text-primary transition-colors">Message #{message.id}</span>
                {message.decrypted && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Decrypted
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 text-primary/70" />
                  <span>
                    {message.timestamp > 0
                      ? new Date(message.timestamp * 1000).toLocaleString()
                      : "Pending..."}
                  </span>
                </div>

                <div className={`font-mono text-sm p-3 rounded-lg border transition-all duration-300 ${
                  message.decrypted 
                    ? 'bg-primary/10 border-primary/30 text-primary' 
                    : 'bg-muted/50 border-border/50 text-muted-foreground'
                }`}>
                  {message.decrypted ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="break-all">Decrypted: {message.content}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 flex-shrink-0" />
                      <span className="tracking-wider">Encrypted: ****************************</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!message.decrypted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecrypt(message.id)}
                disabled={message.isDecrypting}
                className="ml-4 gap-2 relative overflow-hidden group/btn hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
                aria-label={`Decrypt message ${message.id}`}
              >
                <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-300" />
                {message.isDecrypting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin relative z-10" aria-hidden="true" />
                    <span className="relative z-10">Decrypting...</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 relative z-10 group-hover/btn:scale-110 transition-transform" aria-hidden="true" />
                    <span className="relative z-10">Decrypt</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;
