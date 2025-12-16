# CipherWaveSync - FHEVM Encrypted Messages

## 问题诊断和解决方案

### 原始错误
您遇到的错误 `JSON-RPC error -32603` 是由于在不支持 FHEVM 的环境中尝试运行完全同态加密操作导致的。

### 根本原因
1. **FHEVM 未正确初始化**: 本地开发环境和生产环境都没有正确配置 Zama FHEVM 支持
2. **网络兼容性**: 应用程序试图在不支持 FHEVM 的网络上运行加密操作
3. **依赖配置**: FHEVM 插件需要特殊的配置才能正常工作

## 解决方案

### 1. 本地开发环境设置

#### 启动本地 FHEVM 节点
```bash
# 在项目根目录
npm run node
```

#### 运行前端应用
```bash
cd frontend
npm run dev
```

#### 重要说明
- **只在本地网络测试**: 当前配置只支持本地 Hardhat 网络 (chainId: 31337)
- **使用模拟模式**: 本地环境使用 FHEVM 模拟器，不需要真实的加密硬件
- **钱包连接**: 需要连接到本地网络的钱包（如 MetaMask 连接到 localhost:8545）

### 2. 生产环境部署

#### 支持的网络
目前只在本地测试网络上验证过。要在生产环境中使用，需要：

1. **部署到支持 FHEVM 的网络**:
   - Zama 测试网
   - 其他支持 FHEVM 的网络

2. **配置网络设置**:
   ```typescript
   // 在 hardhat.config.ts 中添加
   networks: {
     zamaTestnet: {
       url: "https://devnet.zama.ai",
       accounts: [PRIVATE_KEY],
       chainId: 8009, // Zama 测试网 chainId
     }
   }
   ```

3. **更新合约地址**:
   - 部署合约到目标网络
   - 更新 `frontend/abi/EncryptedMessagesAddresses.ts`

### 3. 代码修复

#### 前端错误处理改进
- 添加了 FHEVM 可用性检查
- 改进了错误消息，提供更清晰的故障排除信息
- 防止在不支持的网络上运行加密操作

#### 本地开发模式
- 本地网络自动使用模拟加密
- 无需真实的 FHEVM 支持即可测试 UI 和基本功能

## 测试应用

### 本地测试步骤
1. 启动 Hardhat 节点: `npm run node`
2. 在新终端启动前端: `cd frontend && npm run dev`
3. 打开浏览器访问 `http://localhost:3000`
4. 连接 MetaMask 到本地网络 (localhost:8545)
5. 提交消息测试功能

### 验证功能
- ✅ 合约部署和基本功能
- ✅ 本地网络模拟加密
- ✅ 前端用户界面
- ✅ 钱包集成

## 故障排除

### 常见错误及解决方案

#### 1. "FHEVM is not available on this network"
**原因**: 尝试在不支持 FHEVM 的网络上运行
**解决**: 使用本地网络进行测试，或部署到支持 FHEVM 的网络

#### 2. "Transaction reverted: function returned an unexpected amount of data"
**原因**: FHEVM 函数在非模拟环境中调用
**解决**: 确保使用正确的网络和配置

#### 3. "Internal JSON-RPC error" (代码 -32603)
**原因**: 节点不支持 FHEVM 操作
**解决**: 使用本地 Hardhat 节点或支持 FHEVM 的网络

#### 4. 前端显示 "连接钱包" 按钮被禁用
**原因**: 钱包未连接或网络不匹配
**解决**: 连接钱包并切换到本地网络 (localhost:8545)

### 环境要求
- Node.js >= 20
- npm >= 7.0.0
- 支持 EIP-1193 的钱包 (如 MetaMask)
- 本地网络配置正确

## 架构说明

### 合约功能
- `submitMessage`: 使用真实 FHE 加密提交消息
- `submitMessageMock`: 本地测试用的模拟函数
- `getEncryptedContent`: 获取加密内容
- `getMessageMetadata`: 获取消息元数据

### 前端架构
- **本地网络**: 使用模拟 FHEVM，无需真实加密
- **生产网络**: 使用真实 FHEVM，需要网络支持
- **自动检测**: 根据网络类型自动选择合适的模式

## 后续步骤

1. **测试完成**: 在本地环境验证所有功能
2. **生产部署**: 部署到支持 FHEVM 的网络
3. **用户文档**: 为最终用户创建使用指南
4. **安全审核**: 在生产部署前进行安全审核

## 支持

如果仍然遇到问题，请提供：
- 完整的错误信息
- 网络配置
- 使用的命令和步骤

