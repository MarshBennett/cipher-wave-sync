// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Messages - A privacy-preserving message system
/// @author CipherWaveSync
/// @notice This contract allows users to submit and manage encrypted messages using FHEVM
contract EncryptedMessages is SepoliaConfig {
    struct Message {
        address sender;
        euint64 encryptedContent;
        euint32 encryptedTimestamp;
        uint256 createdAt;
        bool exists;
    }

    mapping(uint256 => Message) private messages;
    mapping(address => uint256[]) private userMessages;
    uint256 private messageCount;

    event MessageSubmitted(address indexed sender, uint256 indexed messageId, uint256 timestamp);
    event MessageDecrypted(address indexed sender, uint256 indexed messageId);

    /// @notice Submit an encrypted message
    /// @param encryptedContent The encrypted message content (as euint64)
    /// @param encryptedTimestamp The encrypted timestamp (as euint32)
    /// @param inputProof The proof for the encrypted input
    /// @return messageId The ID of the newly created message
    function submitMessage(
        externalEuint64 encryptedContent,
        externalEuint32 encryptedTimestamp,
        bytes calldata inputProof
    ) external returns (uint256 messageId) {
        // Convert external encrypted values to internal encrypted types
        euint64 content = FHE.fromExternal(encryptedContent, inputProof);
        euint32 timestamp = FHE.fromExternal(encryptedTimestamp, inputProof);

        messageId = messageCount++;

        messages[messageId] = Message({
            sender: msg.sender,
            encryptedContent: content,
            encryptedTimestamp: timestamp,
            createdAt: block.timestamp,
            exists: true
        });

        userMessages[msg.sender].push(messageId);

        // Allow this contract and the sender to access the encrypted data
        FHE.allowThis(content);
        FHE.allow(content, msg.sender);
        FHE.allowThis(timestamp);
        FHE.allow(timestamp, msg.sender);

        emit MessageSubmitted(msg.sender, messageId, block.timestamp);

        return messageId;
    }

    /// @notice Get the encrypted message content
    /// @param messageId The ID of the message
    /// @return The encrypted content
    function getEncryptedMessage(uint256 messageId) external view returns (euint64) {
        require(messages[messageId].exists, "Message does not exist");
        require(messages[messageId].sender == msg.sender, "Not authorized");
        
        return messages[messageId].encryptedContent;
    }

    /// @notice Get the encrypted timestamp
    /// @param messageId The ID of the message
    /// @return The encrypted timestamp
    function getEncryptedTimestamp(uint256 messageId) external view returns (euint32) {
        require(messages[messageId].exists, "Message does not exist");
        require(messages[messageId].sender == msg.sender, "Not authorized");
        
        return messages[messageId].encryptedTimestamp;
    }

    /// @notice Get message metadata (non-encrypted fields)
    /// @param messageId The ID of the message
    /// @return sender The address of the sender
    /// @return createdAt The block timestamp when message was created
    /// @return exists Whether the message exists
    function getMessageMetadata(uint256 messageId) 
        external 
        view 
        returns (address sender, uint256 createdAt, bool exists) 
    {
        Message storage message = messages[messageId];
        require(message.exists, "Message does not exist");
        require(message.sender == msg.sender, "Not authorized");
        
        return (message.sender, message.createdAt, message.exists);
    }

    /// @notice Get all message IDs for the caller
    /// @return Array of message IDs
    function getUserMessages() external view returns (uint256[] memory) {
        return userMessages[msg.sender];
    }

    /// @notice Get the total number of messages
    /// @return The total message count
    function getMessageCount() external view returns (uint256) {
        return messageCount;
    }

    /// @notice Check if a message exists
    /// @param messageId The ID of the message
    /// @return Whether the message exists
    function messageExists(uint256 messageId) external view returns (bool) {
        return messages[messageId].exists;
    }
}
