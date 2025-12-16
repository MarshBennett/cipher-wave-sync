"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled 
          ? "border-border/80 backdrop-blur-xl bg-background/90 shadow-lg shadow-primary/5" 
          : "border-border/50 backdrop-blur-lg bg-background/80"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md group-hover:opacity-100 opacity-0 transition-opacity duration-300" />
              <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                <Shield className="h-6 w-6 text-primary-foreground group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                CipherWaveSync
              </h1>
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">Encrypted Message System</p>
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span className="font-medium">FHEVM Powered</span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
