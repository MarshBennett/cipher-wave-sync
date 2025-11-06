import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { FhevmInstance } from '@/fhevm';
import { useFhevm } from '@/fhevm/useFhevm';
import { useToast } from '@/hooks/use-toast';
import { EncryptedMessagesABI } from '@/contracts/EncryptedMessagesABI';
import { getContractAddress } from '@/contracts/addresses';

// Contract ABI is imported from generated file
const CONTRACT_ABI = EncryptedMessagesABI;

interface Message {
  id: number;
  content: string;
  timestamp: number;
  decrypted: boolean;
}

export const useEncryptedMessages = () => {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Determine gateway URL based on network
  const gatewayUrl = chain?.id === 31337 || chain?.id === 1337
    ? 'http://localhost:7077'
    : undefined; // Use default for testnets

  // Use the new FHEVM hook
  const { instance: fhevmInstance, isLoading: fhevmLoading, error: fhevmError } = useFhevm({
    chainId: chain?.id || 31337,
    gatewayUrl,
  });

  const contractAddress = getContractAddress(chain?.id);

  // Load user messages
  const loadMessages = async () => {
    if (!contractAddress || !publicClient || !address) return;

    setIsLoading(true);
    try {
      // Get user message IDs
      const messageIds = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getUserMessages',
        args: [],
      }) as bigint[];

      // Fetch metadata for each message
      const messagesData: Message[] = [];
      for (const id of messageIds) {
        const metadata = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getMessageMetadata',
          args: [id],
        }) as [string, bigint, boolean];

        messagesData.push({
          id: Number(id),
          content: '',
          timestamp: Number(metadata[1]),
          decrypted: false,
        });
      }

      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit encrypted message
  const submitMessage = async (content: string) => {
    if (!contractAddress || !walletClient || !fhevmInstance || !address) {
      throw new Error('Not ready to submit');
    }

    try {
      // Convert message to number
      const numContent = BigInt(content);
      const timestamp = BigInt(Math.floor(Date.now() / 1000));

      // Create encrypted inputs
      const input = fhevmInstance.createEncryptedInput(contractAddress, address);
      input.add64(numContent);
      input.add32(Number(timestamp));
      const encrypted = input.encrypt();

      // Submit transaction
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'submitMessage',
        args: [encrypted.handles[0], encrypted.handles[1], encrypted.inputProof],
      });

      // Wait for confirmation
      await publicClient.waitForTransactionReceipt({ hash });

      // Reload messages
      await loadMessages();
    } catch (error) {
      console.error('Failed to submit message:', error);
      throw error;
    }
  };

  // Decrypt message
  const decryptMessage = async (messageId: number) => {
    if (!contractAddress || !fhevmInstance || !publicClient) {
      throw new Error('Not ready to decrypt');
    }

    try {
      // Get encrypted content
      const encryptedContent = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getEncryptedMessage',
        args: [BigInt(messageId)],
      });

      // Decrypt
      const decryptedValue = await fhevmInstance.decrypt(contractAddress, encryptedContent);

      // Update message
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: decryptedValue.toString(), decrypted: true }
          : msg
      ));
    } catch (error) {
      console.error('Failed to decrypt message:', error);
      toast({
        title: 'Error',
        description: 'Failed to decrypt message',
        variant: 'destructive',
      });
    }
  };

  // Load messages when connected
  useEffect(() => {
    if (isConnected && contractAddress) {
      loadMessages();
    }
  }, [isConnected, contractAddress]);

  // Show FHEVM initialization error
  useEffect(() => {
    if (fhevmError) {
      toast({
        title: 'FHEVM Initialization Error',
        description: fhevmError.message,
        variant: 'destructive',
      });
    }
  }, [fhevmError, toast]);

  return {
    messages,
    isLoading: isLoading || fhevmLoading,
    fhevmReady: !!fhevmInstance && !fhevmLoading && !fhevmError,
    submitMessage,
    decryptMessage,
    loadMessages,
  };
};
