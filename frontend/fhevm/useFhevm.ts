"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { createFhevmInstance } from "./index";
import type { FhevmInstance } from "./index";

interface UseFhevmOptions {
  chainId: number;
  gatewayUrl?: string;
}

// Simplified mock for local network - creates handles that the mock FHEVM accepts
interface MockEncryptedInput {
  add64: (value: bigint | number) => MockEncryptedInput;
  add32: (value: number) => MockEncryptedInput;
  encrypt: () => { handles: `0x${string}`[]; inputProof: `0x${string}` };
}

interface MockFhevmInstance {
  createEncryptedInput: (contractAddress: string, userAddress: string) => MockEncryptedInput;
}

let mockHandleCounter = BigInt(0);

const createMockFhevmInstance = (): MockFhevmInstance => {
  return {
    createEncryptedInput: (_contractAddress: string, _userAddress: string) => {
      const handleCount = { value: 0 };
      
      const inputBuilder: MockEncryptedInput = {
        add64: () => {
          handleCount.value++;
          return inputBuilder;
        },
        add32: () => {
          handleCount.value++;
          return inputBuilder;
        },
        encrypt: () => {
          const handles: `0x${string}`[] = [];
          for (let i = 0; i < handleCount.value; i++) {
            mockHandleCounter = mockHandleCounter + BigInt(1);
            handles.push(("0x" + mockHandleCounter.toString(16).padStart(64, "0")) as `0x${string}`);
          }
          return {
            handles,
            inputProof: "0x" as `0x${string}`,
          };
        },
      };
      return inputBuilder;
    },
  };
};

// Union type for both real and mock instances
type AnyFhevmInstance = FhevmInstance | MockFhevmInstance;

export const useFhevm = (options: UseFhevmOptions) => {
  const { chainId, gatewayUrl } = options;
  const publicClient = usePublicClient();

  const [instance, setInstance] = useState<AnyFhevmInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as loading
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [initializedChainId, setInitializedChainId] = useState<number | null>(null);

  // Initialize on mount or when chainId changes
  useEffect(() => {
    const isLocalNetwork = chainId === 31337 || chainId === 1337;
    
    console.log("[useFhevm] useEffect triggered, chainId:", chainId, "isLocalNetwork:", isLocalNetwork, "initializedChainId:", initializedChainId);
    
    // If already initialized for this chainId, skip
    if (initializedChainId === chainId) {
      return;
    }
    
    // Reset state when chainId changes
    if (initializedChainId !== null && initializedChainId !== chainId) {
      console.log("[useFhevm] ChainId changed, reinitializing...");
      setInstance(null);
      setIsLoading(true);
      setError(null);
      setStatus("idle");
    }

    if (isLocalNetwork) {
      // Use mock instance for local network immediately
      console.log("[useFhevm] Using mock FHEVM instance for local network");
      setInstance(createMockFhevmInstance());
      setStatus("ready");
      setIsLoading(false);
      setInitializedChainId(chainId);
      return;
    }

    // For non-local networks, wait for publicClient
    if (!publicClient) {
      console.log("[useFhevm] Waiting for publicClient...");
      return;
    }

    const abortController = new AbortController();
    
    const initInstance = async () => {
      console.log("[useFhevm] initInstance called for non-local network");
      setIsLoading(true);
      setError(null);

      try {
        const provider = publicClient.transport;

        const fhevmInstance = await createFhevmInstance({
          provider: (provider as { url?: string }).url || "http://localhost:8545",
          chainId,
          gatewayUrl,
          signal: abortController.signal,
          onStatusChange: (newStatus) => {
            setStatus(newStatus);
          },
        });

        setInstance(fhevmInstance);
        setStatus("ready");
        setInitializedChainId(chainId);
      } catch (err) {
        console.error("Failed to initialize FHEVM:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    initInstance();
    
    return () => {
      abortController.abort();
    };
  }, [chainId, publicClient, gatewayUrl, initializedChainId]);

  const reinit = useCallback(() => {
    setInitializedChainId(null);
    setInstance(null);
    setIsLoading(true);
  }, []);

  return {
    instance,
    isLoading,
    error,
    status,
    reinit,
  };
};
