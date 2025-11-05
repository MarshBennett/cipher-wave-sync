import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Lock, Calendar } from "lucide-react";
import { useAccount } from 'wagmi';

interface Message {
  id: number;
  content: string;
  timestamp: number;
  decrypted: boolean;
}

interface MessageListProps {
  messages: Message[];
  onDecrypt: (id: number) => Promise<void>;
}

const MessageList = ({ messages, onDecrypt }: MessageListProps) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <Card className="p-6 border-border/50 text-center">
        <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Connect your wallet to view your encrypted messages
        </p>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="p-6 border-border/50 text-center">
        <p className="text-muted-foreground">
          No messages yet. Submit your first encrypted message above.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="p-4 border-border/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Message #{message.id}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(message.timestamp * 1000).toLocaleString()}</span>
                </div>
                
                <div className="font-mono text-sm bg-muted p-3 rounded">
                  {message.decrypted ? (
                    <span className="text-primary">Decrypted: {message.content}</span>
                  ) : (
                    <span className="text-muted-foreground">Encrypted: ***********</span>
                  )}
                </div>
              </div>
            </div>
            
            {!message.decrypted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecrypt(message.id)}
                className="ml-4 gap-2"
              >
                <Eye className="h-4 w-4" />
                Decrypt
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MessageList;
