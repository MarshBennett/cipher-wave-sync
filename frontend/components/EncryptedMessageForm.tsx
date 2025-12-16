"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Send, Sparkles, Zap } from "lucide-react";

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
    <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm relative overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 shimmer opacity-0 group-hover:opacity-100" />
      
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl border border-primary/0 group-hover:border-primary/30 transition-all duration-300 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <Lock className="h-5 w-5 text-primary relative z-10 group-hover:scale-110 transition-transform" />
          </div>
          <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">Submit Encrypted Message</h2>
          <Sparkles className="h-4 w-4 text-primary animate-pulse ml-auto" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              Message Content
            </Label>
            <div className="relative">
              <Input
                id="message"
                type="text"
                placeholder="Enter a numeric value to encrypt"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                disabled={isSubmitting || !isConnected || !isReady}
                aria-describedby="message-hint"
                aria-required="true"
              />
              {message && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
            <p id="message-hint" className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Enter a positive integer that will be encrypted using FHE
            </p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 relative overflow-hidden group/btn hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
            disabled={isSubmitting || !isConnected || !isReady}
            aria-label={isSubmitting ? "Submitting encrypted message" : "Submit encrypted message"}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span className="relative z-10">Encrypting & Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" aria-hidden="true" />
                <span className="relative z-10">Submit Encrypted Message</span>
              </>
            )}
          </Button>

          {!isConnected && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Connect your wallet to submit messages
              </p>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
};

export default EncryptedMessageForm;
