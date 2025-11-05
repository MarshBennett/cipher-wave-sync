import { Card } from "@/components/ui/card";
import { Lock, Users, Shield, Radio } from "lucide-react";
import WaveformVisualizer from "./WaveformVisualizer";
import { useNavigate } from "react-router-dom";

const StreamDashboard = () => {
  const navigate = useNavigate();
  const rooms = [
    { id: 1, name: "Tech Talk", listeners: 234, encrypted: true },
    { id: 2, name: "Music Lounge", listeners: 512, encrypted: true },
    { id: 3, name: "Private Discussion", listeners: 12, encrypted: true },
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Active Secure Streams</h2>
          <p className="text-muted-foreground text-lg">
            All streams encrypted end-to-end with FHE protection
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {rooms.map((room) => (
            <Card 
              key={room.id} 
              onClick={() => navigate(`/room/${room.id}`)}
              className="p-6 card-gradient border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-accent">LIVE</span>
                </div>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              
              <WaveformVisualizer />
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{room.listeners} listening</span>
                </div>
                <div className="flex items-center gap-1 text-primary text-sm">
                  <Lock className="h-4 w-4" />
                  <span>FHE</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 card-gradient border-border/50">
            <Radio className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Streaming</h3>
            <p className="text-muted-foreground text-sm">
              Crystal clear audio and text streaming with zero latency
            </p>
          </Card>
          
          <Card className="p-6 card-gradient border-border/50">
            <Lock className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">FHE Protection</h3>
            <p className="text-muted-foreground text-sm">
              Data processed while encrypted - true zero-knowledge analytics
            </p>
          </Card>
          
          <Card className="p-6 card-gradient border-border/50">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rainbow Wallet</h3>
            <p className="text-muted-foreground text-sm">
              Secure authentication and room access with Web3 wallets
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default StreamDashboard;
