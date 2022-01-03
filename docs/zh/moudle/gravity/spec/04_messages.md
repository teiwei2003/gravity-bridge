# 消息

在本节中，我们将描述重力消息的处理以及对状态的相应更新。每个消息指定的所有创建/修改状态对象都在 [state](./02_state_transitions.md) 部分中定义。

### MsgDelegateKeys

允许验证者将他们的投票职责委托给给定的密钥。此密钥可用于验证 oracle 声明。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L38-L40

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L56-60

如果出现以下情况，此消息预计会失败:

- 验证器地址不正确。
  - 地址为空 (`""`)
  - 不是 20 的长度
  - Bech32 解码失败
- 编排器地址不正确。
  - 地址为空 (`""`)
  - 不是 20 的长度
  - Bech32 解码失败
- 以太坊地址不正确。
  - 地址为空 (`""`)
  - 不是 42 的长度
  - 不以 0x 开头
- 验证器不存在于验证器集中。

### MsgSubmitEthereumTxConfirmation

当重力守护进程见证重力模块内的完整验证器集时，验证器提交包含整个验证器集的消息的签名。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L79-84

如果出现以下情况，此消息预计会失败:

- 如果验证器集不存在。
- 签名编码不正确。
- 以太坊密钥的签名验证失败。
- 如果提交的签名之前已经提交过。
- 验证器地址不正确。
  - 地址为空 (`""`)
  - 不是 20 的长度
  - Bech32 解码失败


### MsgSendToEthereum

当用户想要将资产桥接到 EVM 时。如果代币源自 Cosmos 链，它将被保存在一个模块帐户中。如果令牌最初来自以太坊，它将在 Cosmos 一侧被烧毁。

> 注意:此消息稍后将在包含在批处理中时被删除。


+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L100-109

如果出现以下情况，此消息将失败:

- 发件人地址不正确。
  - 地址为空 (`""`)
  - 不是 20 的长度
  - Bech32 解码失败
- 不支持denom。
- 如果令牌是宇宙起源的
  - 向模块账户发送令牌失败
- 如果令牌是非宇宙起源的。
  - 如果发送到模块帐户失败
  - 如果令牌燃烧失败

### MsgRequestBatchTx

当一个批次中添加了足够多的交易时，用户或验证者可以调用发送此消息，以便通过桥发送一批交易。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L122-125

如果出现以下情况，此消息将失败:

- 不支持denom。
- 无法建立一批交易。
- 如果协调器地址不存在于验证器集中

### MsgConfirmBatch

当观察到一个 `MsgRequestBatchTx` 时，验证者需要对批处理请求进行签名，以表明这不是恶意创建的批处理并避免被削减。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L137-143

如果出现以下情况，此消息将失败:

- 该批次不存在
- 如果检查点生成失败
- 如果没有验证人地址或委托地址
- 如果计数器链地址为空或不正确。
- 如果计数器链地址未通过签名验证
- 如果签名已经出现在之前的消息中

### MsgConfirmLogicCall

当发出逻辑调用请求时，需要桥验证器确认。每个验证器都必须提交对正在执行的逻辑调用的确认。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L155-161

如果出现以下情况，此消息将失败:

- id 编码不正确
- 无法找到已确认的呼出逻辑调用
- 无效的检查点生成
- 签名解码失败
- 调用此函数的地址不是验证器或其委托的密钥
- 计数器链地址不正确或为空
- 交易对手签名验证失败
- 观察到重复签名

### MsgDepositClaim

当创建将资金存入重力合约的消息时，将省略一个事件，并观察到将提交一条确认存款的消息。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L170-181

如果出现以下情况，此消息将失败:

- 验证者未知
- 验证器不在活动集中
- 如果创建证明失败

### MsgWithdrawClaim

当用户请求退出重力合约时，交易对手链将忽略一个事件。此事件将由桥接验证器观察并提交给重力模块。


+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L187-193

如果出现以下情况，此消息将失败:

- 验证者未知
- 验证器不在活动集中
- 如果创建证明失败

### MsgERC20DeployedClaim

该消息允许 Cosmos 链从对方链中了解有关 denom 的信息。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L200-209

如果出现以下情况，此消息将失败:

- 验证者未知
- 验证器不在活动集中
- 如果创建证明失败

### MsgLogicCallExecutedClaim

这会通知链已执行逻辑调用。当桥验证器观察到包含有关逻辑调用的详细信息的事件时，此消息由桥验证器提交。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L215-221

如果出现以下情况，此消息将失败:

- 提交索赔的验证者未知
- 验证器不在活动集中
- 创建证明失败。