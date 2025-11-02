import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { EncryptedMessages } from "../types";
import type { Signers } from "./types";
import { createMessageInputs, decrypt64, decrypt32 } from "./utils";

describe("EncryptedMessages", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.alice = signers[1];
    this.signers.bob = signers[2];
  });

  beforeEach(async function () {
    // Skip tests if not running on FHEVM mock
    if (!fhevm.isMock) {
      console.warn("Tests can only run on local FHEVM mock environment");
      this.skip();
    }

    const contractFactory = await ethers.getContractFactory("EncryptedMessages");
    this.contract = await contractFactory
      .connect(this.signers.admin)
      .deploy() as unknown as EncryptedMessages;
    await this.contract.waitForDeployment();
    this.contractAddress = await this.contract.getAddress();
  });

  it("should deploy successfully", async function () {
    expect(this.contractAddress).to.be.properAddress;
    const messageCount = await this.contract.getMessageCount();
    expect(messageCount).to.equal(0);
  });

  it("should submit an encrypted message", async function () {
    const messageContent = 123456n;
    const timestamp = 1699999999n;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    const tx = await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    const messageCount = await this.contract.getMessageCount();
    expect(messageCount).to.equal(1);

    const userMessages = await this.contract.connect(this.signers.alice).getUserMessages();
    expect(userMessages.length).to.equal(1);
    expect(userMessages[0]).to.equal(0);
  });

  it("should retrieve encrypted message content", async function () {
    const messageContent = 987654n;
    const timestamp = 1699999999n;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    const encryptedMsg = await this.contract
      .connect(this.signers.alice)
      .getEncryptedMessage(0);

    const decryptedContent = await decrypt64(
      this.signers.alice,
      this.contractAddress,
      encryptedMsg
    );

    expect(decryptedContent).to.equal(messageContent);
  });

  it("should retrieve encrypted timestamp", async function () {
    const messageContent = 111111n;
    const timestamp = 1699999999n;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    const encryptedTime = await this.contract
      .connect(this.signers.alice)
      .getEncryptedTimestamp(0);

    const decryptedTimestamp = await decrypt32(
      this.signers.alice,
      this.contractAddress,
      encryptedTime
    );

    expect(decryptedTimestamp).to.equal(timestamp);
  });

  it("should get message metadata", async function () {
    const messageContent = 222222n;
    const timestamp = 1699999999n;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    const [sender, createdAt, exists] = await this.contract
      .connect(this.signers.alice)
      .getMessageMetadata(0);

    expect(sender).to.equal(this.signers.alice.address);
    expect(exists).to.be.true;
    expect(createdAt).to.be.gt(0);
  });

  it("should allow multiple messages from the same user", async function () {
    const message1 = 111111n;
    const message2 = 222222n;
    const timestamp = 1699999999n;

    const encrypted1 = await createMessageInputs(this.contractAddress, this.signers.alice.address, message1, timestamp);
    const encrypted2 = await createMessageInputs(this.contractAddress, this.signers.alice.address, message2, timestamp);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted1.handles[0], encrypted1.handles[1], encrypted1.inputProof);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted2.handles[0], encrypted2.handles[1], encrypted2.inputProof);

    const userMessages = await this.contract.connect(this.signers.alice).getUserMessages();
    expect(userMessages.length).to.equal(2);

    const messageCount = await this.contract.getMessageCount();
    expect(messageCount).to.equal(2);
  });

  it("should prevent unauthorized access to messages", async function () {
    const messageContent = 333333n;
    const timestamp = 1699999999n;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    await expect(
      this.contract.connect(this.signers.bob).getEncryptedMessage(0)
    ).to.be.revertedWith("Not authorized");
  });

  it("should prevent access to non-existent messages", async function () {
    await expect(
      this.contract.connect(this.signers.alice).getEncryptedMessage(999)
    ).to.be.revertedWith("Message does not exist");
  });

  it("should check message existence correctly", async function () {
    const messageContent = 444444n;
    const timestamp = 1699999999n;

    expect(await this.contract.messageExists(0)).to.be.false;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    await this.contract
      .connect(this.signers.alice)
      .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);

    expect(await this.contract.messageExists(0)).to.be.true;
    expect(await this.contract.messageExists(1)).to.be.false;
  });

  it("should emit MessageSubmitted event", async function () {
    const messageContent = 555555n;
    const timestamp = 1699999999n;

    const encrypted = await createMessageInputs(this.contractAddress, this.signers.alice.address, messageContent, timestamp);

    await expect(
      this.contract
        .connect(this.signers.alice)
        .submitMessage(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof)
    )
      .to.emit(this.contract, "MessageSubmitted")
      .withArgs(this.signers.alice.address, 0, (val: any) => val > 0);
  });
});
