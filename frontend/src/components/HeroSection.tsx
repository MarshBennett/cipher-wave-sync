import { Button } from "@/components/ui/button";
import { Lock, Radio } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const navigate = useNavigate();
  const { isConnected, connectWallet } = useWallet();
  const { toast } = useToast();

  const handleStartStreaming = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to start streaming",
        variant: "destructive",
      });
      connectWallet();
      return;
    }
    navigate('/rooms');
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">Fully Homomorphic Encryption</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Stream Privately.
          <br />
          Analyze Safely.
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Secure live communication where audio and text streams are processed under FHE for complete zero-knowledge analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleStartStreaming} className="gap-2 glow-effect text-lg px-8">
            <Radio className="h-5 w-5" />
            Start Streaming
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/rooms')} className="text-lg px-8">
            Explore Rooms
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
