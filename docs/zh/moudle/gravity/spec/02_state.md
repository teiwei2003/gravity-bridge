# 状态

## 参数

params 是一个模块范围的配置结构，用于存储系统参数
并定义了 staking 模块的整体功能。

- 参数:`Paramsspace("gravity") -> legacy_amino(params)`

+++ <https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/genesis.proto#L72-L104>


### BatchTx

以两种可能的方式存储，第一种有高度，第二种没有(不安全)。 Unsafe 用于测试和状态的导出和导入。

| key          | Value | Type   | Encoding               |
|--------------|-------|--------|------------------------|
| `[]byte{0xa} + common.HexToAddress(tokenContract).Bytes() + nonce (big endian encoded)` | A batch of outgoing transactions | `types.BatchTx` | Protobuf encoded |

### 验证器集

这是桥的验证器集。

以两种可能的方式存储，第一种有高度，第二种没有(不安全)。 Unsafe 用于测试和状态的导出和导入。

| key          | Value | Type   | Encoding               |
|--------------|-------|--------|------------------------|
| `[]byte{0x2} + nonce (big endian encoded)` | Validator set | `types.Valset` | Protobuf encoded |

### ValsetNonce

最新的验证器设置随机数，该值在每次写入时更新。

| key          | Value | Type   | Encoding               |
|--------------|-------|--------|------------------------|
| `[]byte{0xf6}` | Nonce | `uint64` | encoded via big endian |

### SlashedValeSetNonce

最新的验证器设置Slash随机数。 这用于跟踪哪些验证器集需要被削减，哪些已经被削减。

| Key            | Value | Type   | Encoding               |
|----------------|-------|--------|------------------------|
| `[]byte{0xf5}` | Nonce | uint64 | encoded via big endian |

### 验证器集确认

当验证器签署验证器集时，这被视为“valSetConfirmation”，这些通过当前随机数和协调器地址保存。


| Key                                         | Value                  | Type                     | Encoding         |
|---------------------------------------------|------------------------|--------------------------|------------------|
| `[]byte{0x3} + (nonce + []byte(AccAddress)` | Validator Confirmation | `types.MsgSubmitEthereumTxConfirmation` | Protobuf encoded |

### ConfirmBatch

当验证者确认一个批次时，它会被添加到确认批次存储中。 它使用编排器、令牌合约和随机数作为密钥存储。

| Key                                                                 | Value                        | Type                    | Encoding         |
|---------------------------------------------------------------------|------------------------------|-------------------------|------------------|
| `[]byte{0xe1} + common.HexToAddress(tokenContract).Bytes() + nonce + []byte(AccAddress)` | Validator Batch Confirmation | `types.MsgConfirmBatch` | Protobuf encoded |

### OrchestratorValidator

当验证者想将他们的投票权委托给另一个密钥时。 该值使用编排器地址作为键存储

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xe8} + []byte(AccAddress)` | Orchestrator address assigned by a validator | `[]byte` | Protobuf encoded |

### EthAddress

验证器具有关联的计数器链地址。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0x1} + []byte(ValAddress)` | Ethereum address assigned by a validator | `[]byte` | Protobuf encoded |


### ContractCallTx

当用户请求在反向链上执行逻辑调用时，它会存储在重力模块内的存储中。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xde} + []byte(invalidationId) + nonce (big endian encoded)` | A user created logic call to be sent to the counter chain | `types.ContractCallTx` | Protobuf encoded |

### ConfirmLogicCall

当执行逻辑调用时，验证器确认执行。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
|`[]byte{0xae} + []byte(invalidationId) + nonce (big endian encoded) + []byte(AccAddress)` | Confirmation of execution of the logic call | `types.MsgConfirmLogicCall` | Protobuf encoded |

### 传出Tx

将传出事务设置到应用程序事务池中以包含在批处理中。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0x6} + id (big endian encoded)` | User created transaction to be included in a batch | `types.OutgoingTx` | Protobuf encoded |

### IDS

### SlashedBlockHeight

表示最新的Slash块高度。 始终只存储一个单值。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf7}` | Latest height a batch slashing occurred | `uint64` | Big endian encoded |

### TokenContract & Denom

最初来自柜台链的面额将来自合约。 代币合约和分币以两种方式存储。 首先，denom作为key，value是token合约。 其次，以合约为key，value为代币合约所代表的面值。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf3} + []byte(denom)` | Token contract address | `[]byte` | stored in byte format |

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf4} + common.HexToAddress(tokenContract).Bytes()` | Latest height a batch slashing occurred | `[]byte` | stored in byte format |

### LastEventNonce

最后观察到的事件随机数。 这是在调用 `TryAttestation()` 时设置的。 此存储中始终只有一个值。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf2}` | Last observed event nonce| `uint64` | Big endian encoded |

### LastObservedEthereumHeight

这是在以太坊上观察到的最后一个高度。 该存储中始终只存储一个值。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf9}` | Last observed Ethereum Height| `uint64` | Protobuf encoded |

### Attestation

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0x5} + evenNonce (big endian encoded) + []byte(claimHash)` | Attestation of occurred events/claims| `types.Attestation` | Protobuf encoded |
