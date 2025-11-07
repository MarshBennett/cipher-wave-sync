"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Send } from "lucide-react";

interface EncryptedMessageFormProps {
  onSubmit: (content: string) => Promise<void>;
  isReady: boolean;
  isConnected: boolean;
}

const EncryptedMessageForm = ({ onSubmit, isReady, isConnected }: EncryptedMessageFormProps) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

    if (!isReady) {
      toast({
        title: "Not Ready",
        description: "FHEVM is initializing, please wait...",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a numeric value to encrypt",
        variant: "destructive",
      });
      return;
    }

    // Validate numeric input
    const numValue = parseInt(message.trim(), 10);
    if (isNaN(numValue) || numValue < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid positive number",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message);
      setMessage("");
      toast({
        title: "Message Submitted",
        description: "Your encrypted message has been submitted successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit message";
      toast({
        title: "Submission Failed",
        description: errorMessage,
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
            placeholder="Enter a numeric value to encrypt"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a positive integer that will be encrypted using FHE
          </p>
        </div>

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={isSubmitting || !isConnected || !isReady}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Encrypting & Submitting..." : "Submit Encrypted Message"}
        </Button>

        {!isConnected && (
          <p className="text-xs text-muted-foreground text-center">
            Connect your wallet to submit messages
          </p>
        )}
      </form>
    </Card>
  );
};

export default EncryptedMessageForm;
