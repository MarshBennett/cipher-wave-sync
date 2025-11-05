import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Send } from "lucide-react";
import { useAccount } from 'wagmi';

const EncryptedMessageForm = ({ onSubmit }: { onSubmit: (content: string) => Promise<void> }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isConnected } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to submit messages",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to submit",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message);
      setMessage('');
      toast({
        title: "Message Submitted",
        description: "Your encrypted message has been submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit message",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Submit Encrypted Message</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="message">Message Content</Label>
          <Input
            id="message"
            type="text"
            placeholder="Enter your message (numeric value)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            For demo purposes, enter a numeric value that will be encrypted
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full gap-2" 
          disabled={isSubmitting || !isConnected}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Encrypted Message'}
        </Button>
      </form>
    </Card>
  );
};

export default EncryptedMessageForm;
