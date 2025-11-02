import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk";

export interface Signers {
  admin: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
}

declare module "mocha" {
  export interface Context {
    signers: Signers;
    instance: FhevmInstance;
    contract: any;
    contractAddress: string;
  }
}
