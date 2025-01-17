# 重力桥中继语义

本文档旨在帮助开发人员实现替代 Gravity 中继器。与以太坊交互的 Orchestrator 的两个主要组件。 Gravity 桥的设计是为了提高效率，而不是为了易于使用。这意味着这些外部二进制文件有许多隐含的要求，本文档最好明确说明这些要求。

Gravity `orchestrator` 在 [overview.md](overview.md) 中有描述，它是三个不同角色的组合，需要由 Gravity 桥中的外部二进制文件执行。本文档重点介绍了“中继器”的要求，它是“编排器”中包含的角色之一。

## 验证器集更新中继的语义

### Validator 集和签名的排序和排序

在更新 Gravity 合约中的验证器集时，您必须提供旧验证器集的副本。此_必须_仅取自以太坊链上的最后一个 ValsetUpdated 事件。

提供旧的验证器集是存储优化的一部分，而不是将整个验证器集存储在以太坊存储中，而是由每个调用者提供并存储在便宜得多的以太坊事件队列中。 Gravity 合约中不进行任何排序，这意味着验证者列表及其新签名必须以与上次调用完全相同的顺序提交。

出于正常操作的目的，此要求可以缩短为“按功率降序对验证器进行排序，并按功率相等的 Eth 地址字节排序”。由于 Cosmos 模块生成验证器集，因此它们应始终按顺序排列。但是这种排序方法中的一个缺陷会导致未排序的验证器集进入链中，这将停止 valset 更新并基本上解耦桥，除非您的实现足够聪明以查看最后提交的顺序而不是盲目地遵循排序。

### 决定什么验证器设置为中继
Cosmos 链只是产生一个验证器集流，它不会对它们的中继方式做出任何判断。 由中继器实现决定如何优化此中继操作的 gas 成本。

例如，假设我们有验证器集“A、B、C 和 D”，当存储中的最后一个 Gravity 验证器集快照与当前活动的验证器集之间存在 5% 的功率差异时，会创建每个验证器集。

5% 是一个任意常数。 此处选择的特定值是链在以太坊验证器集的更新程度与保持更新的成本之间进行的权衡。 该值越高，在最坏的情况下劫持网桥所需的投票验证器集的部分就越低。 如果我们更新每个区块 66% 需要串通的新验证器集，那么 5% 的更改阈值意味着在给定验证器集中串通的总投票权的 61% 可能能够窃取桥中的资金。

```
A -> B -> C -> D
     5%  10%   15%
```

中继器应该遍历 Gravity Ethereum 合约的事件历史，它将确定验证器集 A 当前位于 Gravity 桥中。它可以选择中继验证者集 B、C 和 D，或者简单地提交验证者集 D。如果所有验证者都签署了 D，则它拥有超过 66% 的投票权，并且可以自行传递。无需在 EThereum 中额外支付数百美元来中继中间集。

在提交交易之前以某种方式在本地执行此检查对于具有成本效益的中继器实现至关重要。您可以使用本地以太坊签名实现并自己总结权力和签名，或者您可以简单地使用“eth_call()”以太坊 RPC 来模拟 EThereum 节点上的调用。

请注意，`eth_call()` 经常有一些有趣的问题。如果您没有任何以太坊来支付 gas，那么基于 Geth 的所有调用都会失败，而在基于 Parity 的实现中，您的 gas 输入大多被忽略，并返回准确的 gas 使用量。

## 交易批量中继的语义

为了提交交易批次，您还需要提交最后一组验证器及其权力，如[验证器集部分](###验证器集和签名的排序和排序)中所述。这是为了促进那里提到的相同存储优化。

### 决定要中继的批次

决定中继哪个批次与决定中继哪个验证器非常不同。批量中继的主要动机是费用，而不是维护网桥完整性的愿望。因此，决定主要归结为费用计算，“批量请求”的概念使这一点更加复杂。这是一个未经许可的事务，它请求 Gravity 模块为特定的令牌类型生成一个新批次。

批量请求旨在允许用户随时从发送到以太坊 tx 池中提取他们的代币，直到中继者表现出对实际中继它们的兴趣为止。当交易在池中时，如果允许用户通过发送 MsgCancelSendToEth 来提取它们，就不会有双花的风险。一旦交易由于不再是“请求批次”而进入批次并且用户资金必须保持锁定状态，直到 Oracle 通知 Gravity 模块包含用户令牌的批次已变得无法提交或已被执行在以太坊上。

中继器使用查询端点 `BatchFees` 迭代发送到每个令牌类型的 Eth tx 池，然后中继器可以观察在 dex 上中继的 ERC20 令牌的价格并计算执行批处理的燃料成本(通过`eth_call()`) 以及在需要时清算 dex 收益的 gas 成本。一旦中继器确定批次良好且有利可图，它可以发送“MsgRequestBatch”，并且将为中继器创建批次以进行中继。

也有现有的批次，中继者也应该判断其盈利能力，并尝试使用几乎相同的方法进行中继。
