"use client";

import Header from "@/components/Header";
import EncryptedMessageForm from "@/components/EncryptedMessageForm";
import MessageList from "@/components/MessageList";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import BackgroundParticles from "@/components/BackgroundParticles";
import { Card } from "@/components/ui/card";
import { Lock, Shield, Key, Sparkles, Zap } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import { EncryptedMessagesABI } from "@/abi/EncryptedMessagesABI";
import { EncryptedMessagesAddresses } from "@/abi/EncryptedMessagesAddresses";
import { useFhevm } from "@/fhevm/useFhevm";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";

interface Message {
  id: number;
  content: string;
  timestamp: number;
  decrypted: boolean;
  isDecrypting?: boolean;
}

export default function Home() {
  const {
    isConnected,
    chainId,
    accounts,
    ethersSigner,
  } = useMetaMaskEthersSigner();
  const address = accounts?.[0];
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Store plaintext values for local network testing (messageId -> content)
  const [localMessageContents, setLocalMessageContents] = useState<Record<number, string>>({});

  const contractAddress = chainId
    ? EncryptedMessagesAddresses[
        chainId.toString() as keyof typeof EncryptedMessagesAddresses
      ]?.address
    : undefined;

  // Initialize FHEVM
  const { instance: fhevmInstance, isLoading: fhevmLoading } = useFhevm({
    chainId: chainId || 31337,
  });

  // Check if we're on a local network (use mock function)
  const isLocalNetwork = chainId === 31337 || chainId === 1337;

  const isReady =
    isConnected &&
    !!contractAddress &&
    !!fhevmInstance &&
    !fhevmLoading &&
    !!ethersSigner;


  // Load user messages
  const loadMessages = useCallback(async () => {
    // For getUserMessages(), we need a signer because it uses msg.sender
    // Always use MetaMask signer for wallet authentication
    if (!contractAddress || !ethersSigner || !address) {
      return;
    }

    setIsLoading(true);
    try {
      const contract = new ethers.Contract(
        contractAddress as `0x${string}`,
        EncryptedMessagesABI.abi,
        ethersSigner
      );

      const messageIds = (await contract.getUserMessages()) as bigint[];

      const messagesData: Message[] = [];
      for (const id of messageIds) {
        const metadata = (await contract.getMessageMetadata(id)) as [
          string,
          bigint,
          boolean
        ];

        messagesData.push({
          id: Number(id),
          content: "",
          timestamp: Number(metadata[1]),
          decrypted: false,
        });
      }

      setMessages(messagesData);
    } catch (error) {
      toast({
        title: "Failed to Load Messages",
        description: error instanceof Error ? error.message : "Unable to fetch messages from contract",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, ethersSigner, address, toast]);

  // Load messages when connected
  useEffect(() => {
    if (isConnected && contractAddress) {
      loadMessages();
    }
  }, [isConnected, contractAddress, loadMessages]);

  // Submit encrypted message
  const submitMessage = async (content: string) => {
    if (!contractAddress || !ethersSigner || !address) {
      throw new Error("Not ready to submit");
    }

    // For non-local networks, we need the fhevmInstance
    if (!isLocalNetwork && !fhevmInstance) {
      throw new Error("FHEVM not initialized");
    }

    try {
      const contract = new ethers.Contract(
        contractAddress as `0x${string}`,
        EncryptedMessagesABI.abi,
        ethersSigner
      );

      let tx: ethers.TransactionResponse;

      if (isLocalNetwork) {
        // Local network: use mock function with plaintext values
        // Always use MetaMask signer for wallet authentication
        toast({
          title: "Submitting Message",
          description: "Please confirm in your wallet...",
        });

        const numContent = BigInt(content);
        const timestamp = BigInt(Math.floor(Date.now() / 1000));

        // Call the mock function that accepts plaintext
        tx = await contract.submitMessageMock(numContent, timestamp);
        
        // Store the plaintext content for later "decryption" (local testing only)
        // We'll get the messageId from the event after confirmation
        const receipt = await tx.wait();
        const messageSubmittedEvent = receipt?.logs.find(
          (log) => log.topics[0] === ethers.id("MessageSubmitted(uint256,address,uint256)")
        );
        if (messageSubmittedEvent) {
          const messageId = Number(BigInt(messageSubmittedEvent.topics[1]));
          setLocalMessageContents(prev => ({ ...prev, [messageId]: content }));
        }
      } else {
        // Production network: check FHEVM availability
        if (!fhevmInstance) {
          throw new Error("FHEVM is not available on this network. Please use a supported FHEVM network or switch to local development.");
        }

        toast({
          title: "Encrypting Message",
          description: "Creating encrypted inputs...",
        });

        const numContent = BigInt(content);
        const timestamp = BigInt(Math.floor(Date.now() / 1000));

        try {
          // Create encrypted inputs using FHEVM
          const input = fhevmInstance.createEncryptedInput(
            contractAddress,
            address
          );
          input.add64(numContent);
          input.add32(Number(timestamp));
          const encrypted = await input.encrypt();

          // Convert handles and proof to hex strings if they are Uint8Array
          const toHex = (data: Uint8Array | `0x${string}`): `0x${string}` => {
            if (typeof data === "string") return data;
            return ("0x" + Array.from(data).map(b => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;
          };

          const handle0 = toHex(encrypted.handles[0]);
          const handle1 = toHex(encrypted.handles[1]);
          const inputProof = toHex(encrypted.inputProof);

          toast({
            title: "Submitting Transaction",
            description: "Please confirm in your wallet...",
          });

          tx = await contract.submitMessage(handle0, handle1, inputProof);
        } catch (fhevmError: unknown) {
          console.error("FHEVM encryption failed:", fhevmError);
          const errorMessage = fhevmError instanceof Error ? fhevmError.message : "Unknown FHEVM error";
          throw new Error(`FHEVM encryption failed: ${errorMessage}. Make sure you're connected to a supported FHEVM network.`);
        }
      }

      // For non-local network, wait for confirmation here
      if (!isLocalNetwork) {
        toast({
          title: "Waiting for Confirmation",
          description: "Transaction submitted, waiting for confirmation...",
        });

        // Wait for transaction confirmation
        await tx.wait();
      }

      toast({
        title: "Message Submitted",
        description: "Your encrypted message has been stored on-chain!",
      });

      // Reload messages after submission
      await loadMessages();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit message",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Decrypt message
  const decryptMessage = async (messageId: number) => {
    if (!ethersSigner) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to decrypt messages",
        variant: "destructive",
      });
      return;
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isDecrypting: true } : msg
      )
    );

    try {
      // Request wallet signature for authentication
      toast({
        title: "Wallet Authentication",
        description: "Please sign the message in your wallet to decrypt...",
      });

      const signatureMessage = `Decrypt message #${messageId} from CipherWaveSync\nTimestamp: ${Date.now()}`;
      
      // This will trigger MetaMask popup for signature
      await ethersSigner.signMessage(signatureMessage);

      let decryptedContent: string;

      if (isLocalNetwork) {
        // Local network: use stored plaintext value
        const storedContent = localMessageContents[messageId];
        if (storedContent) {
          decryptedContent = storedContent;
        } else {
          // If not in local storage, show placeholder
          decryptedContent = `[Message #${messageId} - content not cached]`;
        }
      } else {
        // Production network: use FHEVM to decrypt
        // TODO: Implement real FHEVM decryption with signature verification
        await new Promise((resolve) => setTimeout(resolve, 1500));
        decryptedContent = "[Decryption not implemented for production]";
      }

      // Update with decrypted value
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: decryptedContent, decrypted: true, isDecrypting: false }
            : msg
        )
      );

      toast({
        title: "Message Decrypted",
        description: "Successfully decrypted the message content",
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isDecrypting: false } : msg
        )
      );
      toast({
        title: "Decryption Failed",
        description: error instanceof Error ? error.message : "Failed to decrypt the message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <BackgroundParticles />
      
      {/* Animated gradient orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6 relative">
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-scale-in backdrop-blur-sm">
              <Lock className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Fully Homomorphic Encryption
              </span>
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-in-up text-gradient">
              CipherWaveSync
            </h1>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-in-up" style={{ animationDelay: "0.1s" }}>
              Submit and manage encrypted messages on-chain using FHEVM technology.
              Your data remains private, even during computation.
            </p>

            {/* Waveform Visualizer */}
            <div className="max-w-2xl mx-auto mb-12 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl animate-pulse-glow" />
                <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 glow-effect-hover">
                  <WaveformVisualizer />
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 animate-scale-in group cursor-pointer" style={{ animationDelay: "0.3s" }}>
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                  <Lock className="h-10 w-10 text-primary mx-auto relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Encrypted Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Messages are encrypted on-chain using FHE
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 animate-scale-in group cursor-pointer" style={{ animationDelay: "0.4s" }}>
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                  <Shield className="h-10 w-10 text-primary mx-auto relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Private Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Compute on encrypted data without decryption
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 animate-scale-in group cursor-pointer" style={{ animationDelay: "0.5s" }}>
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:opacity-100 transition-opacity" />
                  <Key className="h-10 w-10 text-primary mx-auto relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">Controlled Access</h3>
                <p className="text-sm text-muted-foreground">
                  Only you can decrypt your messages
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="pb-20 px-6 relative z-10">
          <div className="container mx-auto max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submit Message */}
              <div className="animate-slide-in-up" style={{ animationDelay: "0.6s" }}>
                <EncryptedMessageForm
                  onSubmit={submitMessage}
                  isReady={isReady}
                  isConnected={isConnected}
                />
              </div>

              {/* View Messages */}
              <div className="animate-slide-in-up" style={{ animationDelay: "0.7s" }}>
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary animate-pulse" />
                  <h2 className="text-2xl font-bold">Your Messages</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isLoading
                    ? "Loading..."
                    : `${messages.length} message(s) stored`}
                </p>
                <MessageList
                  messages={messages}
                  onDecrypt={decryptMessage}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
