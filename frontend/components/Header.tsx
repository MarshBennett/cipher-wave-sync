"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-lg bg-background/80">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CipherWaveSync</h1>
              <p className="text-xs text-muted-foreground">Encrypted Message System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
