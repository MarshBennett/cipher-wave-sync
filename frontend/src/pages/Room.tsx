import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Mic, MicOff, Users, Lock, Shield } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import { useToast } from '@/hooks/use-toast';

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(true);
  
  const rooms: { [key: string]: { name: string; listeners: number } } = {
    '1': { name: 'Tech Talk', listeners: 234 },
    '2': { name: 'Music Lounge', listeners: 512 },
    '3': { name: 'Private Discussion', listeners: 12 },
  };

  const room = rooms[roomId || '1'];

  const handleToggleMic = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to speak",
        variant: "destructive",
      });
      return;
    }
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Microphone On" : "Microphone Off",
      description: isMuted ? "You can now speak" : "You are muted",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                <span className="text-sm font-medium text-accent">LIVE</span>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">{room?.name || 'Room'}</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="text-lg">{room?.listeners || 0} listening</span>
            </div>
          </div>

          <Card className="p-8 card-gradient border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-6 text-primary text-sm">
              <Lock className="h-4 w-4" />
              <span>End-to-End FHE Encrypted</span>
            </div>
            
            <WaveformVisualizer />
            
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                variant={isMuted ? "secondary" : "default"}
                onClick={handleToggleMic}
                className="gap-2"
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 card-gradient border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Encryption</div>
              <div className="text-lg font-semibold text-primary">FHE Active</div>
            </Card>
            <Card className="p-4 card-gradient border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Latency</div>
              <div className="text-lg font-semibold">&lt; 50ms</div>
            </Card>
            <Card className="p-4 card-gradient border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Quality</div>
              <div className="text-lg font-semibold">HD Audio</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
