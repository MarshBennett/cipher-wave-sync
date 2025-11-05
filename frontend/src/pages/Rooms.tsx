import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import StreamDashboard from '@/components/StreamDashboard';

const Rooms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <Button className="gap-2 glow-effect">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </div>
        </div>
      </header>

      <StreamDashboard />
    </div>
  );
};

export default Rooms;
