# 任意逻辑功能

Gravity 包括对其他以太坊合约进行任意调用的功能。这可用于允许 Cosmos 链对以太坊采取行动。这个功能非常通用。它甚至可以用于实现桥的核心令牌传输功能。但是，有一个重要的警告:这些任意逻辑合约可以与 ERC20 代币进行交易，但不能与任何其他类型的资产进行交易，例如 ERC721。与非 ERC20 资产交互需要修改核心 Gravity 合约。

# 建筑学

`SetOutgoingLogicCall`

Gravity 提供了一种可以被其他模块调用以创建传出逻辑调用的方法。要使用此方法，调用模块必须首先组装一个逻辑调用(稍后会详细介绍)。然后使用“SetOutgoingLogicCall”将其提交给 Gravity 模块。从这里开始，它由验证器签名。一旦它有足够的签名，一个 Gravity 中继器就会把它捡起来并提交给以太坊上的 Gravity 合约。

`传出逻辑呼叫`

`SetOutgoingLogicCall` 将一个 `OutgoingLogicCall` 作为参数。下面是对其参数的解释:

```golang
// OutgoingLogicCall represents an individual logic call from Gravity to ETH
type OutgoingLogicCall struct {
	Transfers            []*ERC20Token `protobuf:"bytes,1,rep,name=transfers,proto3" json:"transfers,omitempty"`
	Fees                 []*ERC20Token `protobuf:"bytes,2,rep,name=fees,proto3" json:"fees,omitempty"`
	LogicContractAddress string        `protobuf:"bytes,3,opt,name=logic_contract_address,json=logicContractAddress,proto3" json:"logic_contract_address,omitempty"`
	Payload              []byte        `protobuf:"bytes,4,opt,name=payload,proto3" json:"payload,omitempty"`
	Timeout              uint64        `protobuf:"varint,5,opt,name=timeout,proto3" json:"timeout,omitempty"`
	InvalidationScope       []byte        `protobuf:"bytes,6,opt,name=invalidation_id,json=invalidationId,proto3" json:"invalidation_id,omitempty"`
	InvalidationNonce    uint64        `protobuf:"varint,7,opt,name=invalidation_nonce,json=invalidationNonce,proto3" json:"invalidation_nonce,omitempty"`
}
```

- 转移:这些是在执行之前发送到逻辑合约的代币。然后合约可以使用代币采取行动。例如，Gravity 可以向逻辑合约发送一些 Uniswap LP 代币，然后用于从 Uniswap 赎回流动性。
- 费用:这些是核心 Gravity.sol 合约支付给 Gravity 中继器以执行逻辑调用的代币。费用在逻辑合约执行后支付，因此可以将逻辑合约执行后收到的代币支付给中继者，然后发送回核心 Gravity 合约。
- LogicContractAddress:这是核心 Gravity 合约调用以执行任意逻辑的逻辑合约的地址。注意:这可能是实际的逻辑合约，也可能是多次调用逻辑合约的批处理合约。 `/solidity/test` 文件夹中的示例。
- Payload:这是将在逻辑合约上执行的以太坊 abi 编码的函数调用。如果您使用的是批处理中间件合约，则此 abi 编码函数调用本身将包含实际逻辑合约上的 abi 编码函数调用数组。
- 超时:如果以太坊上的区块时间戳高于此超时值，则不会执行逻辑调用。
- InvalidationScope 和 InvalidationNonce:有关以下内容的更多信息:


## 失效

`invalidation_id` 和 `invalidation_nonce` 在 Gravity 任意逻辑调用功能中用作重放保护。

当一个 submitLogicCall 交易被提交到以太坊合约时，合约检查使用 `invalidation_id` 来访问失效映射中的一个键。根据提供的“invalidation_nonce”检查该键的值。如果提供的`invalidation_nonce` 更高，则只允许逻辑调用通过。

这可用于实现许多不同的失效方案:

### 最简单的:仅超时失效
如果您不知道这一切意味着什么，当您从 Cosmos 端向 Gravity 模块发送逻辑调用时，只需将 `invalidation_id` 设置为您在模块中跟踪的递增整数。每次将 `invalidation_nonce` 设置为零。这将为每个逻辑批次在以太坊上的失效映射中创建一个新条目，提供重放保护，同时允许批次完全独立。

### 顺序失效
如果您不希望在稍后的逻辑调用之后提交早期的逻辑调用，您可以改为每次将 `invalidation_id` 设置为零，并为 `invalidation_nonce` 使用递增整数。这使得任何成功提交的逻辑调用都将使之前的所有逻辑调用无效。

### 例如:基于令牌的失效
在 Gravity 的核心 submitBatch 功能中，我们有给定代币的批量交易使该代币的早期批次无效，但其他代币的早期批次无效。为了在 submitLogicCall 方法之上实现这一点，我们将 `invalidation_id` 设置为令牌地址，并为每个令牌保持一个递增的随机数。