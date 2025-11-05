import Header from "@/components/Header";
import EncryptedMessageForm from "@/components/EncryptedMessageForm";
import MessageList from "@/components/MessageList";
import { useEncryptedMessages } from "@/hooks/useEncryptedMessages";
import { Lock, Shield, Key } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { messages, isLoading, submitMessage, decryptMessage } = useEncryptedMessages();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Lock className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary font-medium">Fully Homomorphic Encryption</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            CipherWaveSync
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Submit and manage encrypted messages on-chain using FHEVM technology.
            Your data remains private, even during computation.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="p-6 border-border/50">
              <Lock className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Encrypted Storage</h3>
              <p className="text-sm text-muted-foreground">
                Messages are encrypted on-chain using FHE
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <Shield className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Private Processing</h3>
              <p className="text-sm text-muted-foreground">
                Compute on encrypted data without decryption
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <Key className="h-10 w-10 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Controlled Access</h3>
              <p className="text-sm text-muted-foreground">
                Only you can decrypt your messages
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submit Message */}
            <div>
              <EncryptedMessageForm onSubmit={submitMessage} />
            </div>

            {/* View Messages */}
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${messages.length} message(s)`}
                </p>
              </div>
              <MessageList messages={messages} onDecrypt={decryptMessage} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
