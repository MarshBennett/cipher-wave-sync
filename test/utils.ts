import { ethers, fhevm } from "hardhat";
import type { Signer } from "ethers";
import { FhevmType } from "@fhevm/hardhat-plugin";

// Note: These utility functions are wrappers around the fhevm hardhat plugin
// The plugin provides built-in support for FHEVM operations

export const createMessageInputs = async (
  contractAddress: string,
  userAddress: string,
  content: bigint,
  timestamp: number | bigint
): Promise<{ handles: any[]; inputProof: any }> => {
  const input = await fhevm
    .createEncryptedInput(contractAddress, userAddress)
    .add64(content)
    .add32(Number(timestamp))
    .encrypt();

  return input;
};

export const decrypt32 = async (
  signer: Signer,
  contractAddress: string,
  handle: any
): Promise<bigint> => {
  const result = await fhevm.userDecryptEuint(
    FhevmType.euint32,
    handle,
    contractAddress,
    signer
  );
  return BigInt(result);
};

export const decrypt64 = async (
  signer: Signer,
  contractAddress: string,
  handle: any
): Promise<bigint> => {
  const result = await fhevm.userDecryptEuint(
    FhevmType.euint64,
    handle,
    contractAddress,
    signer
  );
  return BigInt(result);
};

