# 状態

## パラメータ

Paramsは、システムパラメータを格納するモジュール全体の構成構造です。
ステーキングモジュールの全体的な機能を定義します。

-パラメータ: `Paramsspace(" gravity ")-> legend_amino(params)`

+++ <https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/genesis.proto#L72-L104>


### BatchTx

2つの可能な方法で保存されます。1つは高さあり、2つ目は高さなし(安全ではない)です。 Unsafeは、状態のテストとエクスポートおよびインポートに使用されます。

| key          | Value | Type   | Encoding               |
|--------------|-------|--------|------------------------|
| `[]byte{0xa} + common.HexToAddress(tokenContract).Bytes() + nonce (big endian encoded)` | A batch of outgoing transactions | `types.BatchTx` | Protobuf encoded |

### ValidatorSet

これは、ブリッジのバリデーターセットです。

2つの可能な方法で保存されます。1つは高さあり、2つ目は高さなし(安全ではない)です。 Unsafeは、状態のテストとエクスポートおよびインポートに使用されます。

| key          | Value | Type   | Encoding               |
|--------------|-------|--------|------------------------|
| `[]byte{0x2} + nonce (big endian encoded)` | Validator set | `types.Valset` | Protobuf encoded |

### ValsetNonce

最新のバリデーターセットナンス。この値は書き込みごとに更新されます。

| key          | Value | Type   | Encoding               |
|--------------|-------|--------|------------------------|
| `[]byte{0xf6}` | Nonce | `uint64` | encoded via big endian |

### SlashedValeSetNonce

最新のバリデーターはスラッシュナンスを設定しました。 これは、どのバリデーターセットをスラッシュする必要があり、どれがすでにスラッシュされているかを追跡するために使用されます。

| Key            | Value | Type   | Encoding               |
|----------------|-------|--------|------------------------|
| `[]byte{0xf5}` | Nonce | uint64 | encoded via big endian |

### Validator Set Confirmation

バリデーターがバリデーターセットに署名すると、これは「valSetConfirmation」と見なされ、現在のナンスとオーケストレーターアドレスを介して保存されます。


| Key                                         | Value                  | Type                     | Encoding         |
|---------------------------------------------|------------------------|--------------------------|------------------|
| `[]byte{0x3} + (nonce + []byte(AccAddress)` | Validator Confirmation | `types.MsgSubmitEthereumTxConfirmation` | Protobuf encoded |

### ConfirmBatch

バリデーターがバッチを確認すると、確認バッチストアに追加されます。 オーケストレーター、トークンコントラクト、ナンスをキーとして保存されます。

| Key                                                                 | Value                        | Type                    | Encoding         |
|---------------------------------------------------------------------|------------------------------|-------------------------|------------------|
| `[]byte{0xe1} + common.HexToAddress(tokenContract).Bytes() + nonce + []byte(AccAddress)` | Validator Batch Confirmation | `types.MsgConfirmBatch` | Protobuf encoded |

### OrchestratorValidator

バリデーターが投票権を別のキーに委任したい場合。 値は、オーケストレーターアドレスをキーとして使用して保存されます

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xe8} + []byte(AccAddress)` | Orchestrator address assigned by a validator | `[]byte` | Protobuf encoded |

### EthAddress

バリデーターには、カウンターチェーンアドレスが関連付けられています。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0x1} + []byte(ValAddress)` | Ethereum address assigned by a validator | `[]byte` | Protobuf encoded |


### ContractCallTx

ユーザーが論理呼び出しを反対側のチェーンで実行するように要求すると、それは重力モジュール内のストアに格納されます。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xde} + []byte(invalidationId) + nonce (big endian encoded)` | A user created logic call to be sent to the counter chain | `types.ContractCallTx` | Protobuf encoded |

### ConfirmLogicCall

ロジックコールが実行されると、バリデーターが実行を確認します。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
|`[]byte{0xae} + []byte(invalidationId) + nonce (big endian encoded) + []byte(AccAddress)` | Confirmation of execution of the logic call | `types.MsgConfirmLogicCall` | Protobuf encoded |

### OutgoingTx

バッチに含まれるアプリケーショントランザクションプールに送信トランザクションを設定します。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0x6} + id (big endian encoded)` | User created transaction to be included in a batch | `types.OutgoingTx` | Protobuf encoded |

### IDS

### SlashedBlockHeight

最新のスラッシュブロックの高さを表します。 保存される値は常に1つだけです。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf7}` | Latest height a batch slashing occurred | `uint64` | Big endian encoded |

### TokenContract & Denom

もともとカウンターチェーンからのものであるデノムは、契約からのものになります。 トークコントラクトとデノムは2つの方法で保存されます。 まず、デノムがキーとして使用され、値はトークンコントラクトです。 次に、コントラクトがキーとして使用されます。値は、トークンコントラクトが表すデノムです。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf3} + []byte(denom)` | Token contract address | `[]byte` | stored in byte format |

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf4} + common.HexToAddress(tokenContract).Bytes()` | Latest height a batch slashing occurred | `[]byte` | stored in byte format |

### LastEventNonce

最後に観測されたイベントナンス。 これは、 `TryAttestation()`が呼び出されたときに設定されます。 このストアには常に単一の値しかありません。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf2}` | Last observed event nonce| `uint64` | Big endian encoded |

### LastObservedEthereumHeight 

これは、イーサリアムで最後に観測された高さです。 このストアには常に単一の値のみが保存されます。

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0xf9}` | Last observed Ethereum Height| `uint64` | Protobuf encoded |

### Attestation

| Key                                 | Value                                        | Type     | Encoding         |
|-------------------------------------|----------------------------------------------|----------|------------------|
| `[]byte{0x5} + evenNonce (big endian encoded) + []byte(claimHash)` | Attestation of occurred events/claims| `types.Attestation` | Protobuf encoded |
