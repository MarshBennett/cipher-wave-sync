# CipherWaveSync - Encrypted Message System

A fully homomorphic encryption (FHE) powered message system built on FHEVM, allowing users to submit, store, and decrypt messages on-chain while maintaining privacy.

## Project Structure

```
cipher-wave-sync/
├── contracts/           # Smart contracts
│   └── EncryptedMessages.sol
├── test/               # Contract tests
│   ├── EncryptedMessages.ts
│   ├── types.ts
│   └── utils.ts
├── deploy/             # Deployment scripts
│   └── deploy.ts
├── frontend/           # React frontend with RainbowKit
│   ├── src/
│   │   ├── components/  # UI components (DaisyUI + shadcn)
│   │   ├── hooks/       # Custom hooks including FHEVM integration
│   │   ├── contracts/   # Generated ABIs and addresses
│   │   └── config/      # Wagmi/RainbowKit configuration
├── .env                # Environment variables (private keys)
└── hardhat.config.ts   # Hardhat configuration

```

## Technology Stack

### Smart Contracts
- **Solidity 0.8.24**
- **FHEVM** (@fhevm/solidity) - Fully Homomorphic Encryption
- **Hardhat** - Development environment
- **TypeChain** - TypeScript bindings

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **RainbowKit** - Wallet connection
- **Wagmi** - React hooks for Ethereum
- **DaisyUI** - UI components (light theme)
- **shadcn/ui** - Additional UI components
- **@zama-fhe/relayer-sdk** - FHEVM SDK for encryption/decryption

## Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Configuration

The `.env` file is already configured with:
- `SEPOLIA_PRIVATE_KEY` - Private key for Sepolia testnet
- `LOCAL_PRIVATE_KEY` - Private key for local Hardhat network
- `SEPOLIA_RPC_URL` - Infura RPC URL for Sepolia
- `INFURA_API_KEY` - Infura project ID

### 3. Compile Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeChain types
- Output artifacts to `artifacts/` directory

### 4. Run Tests

```bash
# Run tests on local Hardhat network
npx hardhat test

# Run tests on Sepolia testnet (requires funded account)
npm run test:sepolia
```

### 5. Deploy Contracts

#### Local Deployment

```bash
# Start local Hardhat node (in one terminal)
npm run node

# Deploy to local network (in another terminal)
npx hardhat deploy --network localhost

# Update frontend contract address
# The deployment will save the address to:
# deployments/localhost/deployment.json
# Copy the contractAddress and update:
# frontend/src/contracts/addresses.ts
```

#### Sepolia Deployment

```bash
# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia

# Update frontend contract address
# The deployment will save the address to:
# deployments/sepolia/deployment.json
# Copy the contractAddress and update:
# frontend/src/contracts/addresses.ts
```

### 6. Export Contract ABI

After deployment, export the ABI for the frontend:

```bash
npx ts-node scripts/exportAbi.ts
```

This creates: `frontend/src/contracts/EncryptedMessagesABI.ts`

### 7. Run Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage Guide

### Contract Features

The `EncryptedMessages` contract provides:

1. **Submit Message** - Submit encrypted numeric messages
2. **Get Messages** - Retrieve list of your message IDs  
3. **Get Encrypted Content** - Get encrypted message data
4. **Get Metadata** - Get non-encrypted metadata (sender, timestamp)
5. **Decrypt Message** - Decrypt using FHEVM SDK

### Frontend Features

1. **Wallet Connection**
   - Connect wallet via RainbowKit (top right)
   - Supports MetaMask, WalletConnect, etc.
   - Switch between localhost and Sepolia networks

2. **Submit Encrypted Messages**
   - Enter a numeric value
   - Message is encrypted client-side using FHEVM SDK
   - Submitted to smart contract
   - Stored encrypted on-chain

3. **View Messages**
   - See all your submitted messages
   - Messages appear encrypted
   - Click "Decrypt" to decrypt individual messages
   - Decryption happens client-side

### Network Switching

The app supports two networks:

- **Localhost (Chain ID: 31337)** - For local development
- **Sepolia (Chain ID: 11155111)** - For testnet

Switch networks in your wallet to change networks.

## Development Workflow

1. **Make Contract Changes**
   ```bash
   # Edit contracts/EncryptedMessages.sol
   npm run compile
   npx hardhat test
   ```

2. **Deploy Updated Contract**
   ```bash
   npx hardhat deploy --network localhost
   # Update frontend/src/contracts/addresses.ts
   npx ts-node scripts/exportABI.ts
   ```

3. **Update Frontend**
   ```bash
   cd frontend
   npm run dev
   # Test in browser
   ```

## Key Files

### Smart Contract
- `contracts/EncryptedMessages.sol` - Main contract
- `test/EncryptedMessages.ts` - Comprehensive test suite

### Frontend
- `frontend/src/hooks/useEncryptedMessages.ts` - FHEVM integration hook
- `frontend/src/components/EncryptedMessageForm.tsx` - Message submission
- `frontend/src/components/MessageList.tsx` - Message display  
- `frontend/src/config/wagmi.ts` - Wallet configuration

### Configuration
- `hardhat.config.ts` - Hardhat networks and settings
- `frontend/tailwind.config.ts` - DaisyUI theme configuration
- `.env` - Private keys and API keys

## Security Notes

⚠️ **Important**: The `.env` file contains private keys. In a production environment:
- Never commit `.env` to version control
- Use environment variables or secret management
- The current keys are for development/testing only

## Architecture Highlights

### Encryption Flow
1. User enters message (numeric value)
2. Frontend encrypts using FHEVM SDK
3. Encrypted data + proof sent to contract
4. Contract stores encrypted data
5. User can later decrypt using FHEVM SDK

### Privacy Guarantees
- Messages remain encrypted on-chain
- Only the message owner can decrypt
- Contract can compute on encrypted data without decryption
- True end-to-end privacy with FHE

## Troubleshooting

### Contract Compilation Issues
```bash
npm run clean
npm run compile
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Network Connection Issues
- Ensure Hardhat node is running for localhost
- Check wallet is connected to correct network
- Verify contract address is correct for the network

## Next Steps

To extend this project:
1. Add more complex encrypted data types (strings, arrays)
2. Implement encrypted messaging between users
3. Add encrypted voting or polls
4. Create encrypted data aggregation features
5. Add encrypted token transfers

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [RainbowKit Docs](https://www.rainbowkit.com)
- [Hardhat Documentation](https://hardhat.org/docs)
- [DaisyUI Components](https://daisyui.com/components/)
