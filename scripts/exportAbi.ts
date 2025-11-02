import * as fs from 'fs';
import * as path from 'path';

const artifactPath = path.join(__dirname, '../artifacts/contracts/EncryptedMessages.sol/EncryptedMessages.json');
const outputPath = path.join(__dirname, '../frontend/src/contracts/EncryptedMessagesABI.ts');

const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

const abiContent = 'export const EncryptedMessagesABI = ' + JSON.stringify(artifact.abi, null, 2) + ' as const;\n';

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, abiContent);

console.log('ABI exported to:', outputPath);
