# 设计概述

这将贯穿技术设计的所有细节。 [`notes.md`](../notes.md) 可能是更好的参考
以获得概览。 我们将尝试在此处描述整个技术设计并分解出单独的文档
详细信息格式等。

## 工作流程

高级工作流程是:

激活步骤:

- Bootstrap Cosmos SDK 链
- 安装以太坊合约

代币转移步骤:

- 将原始 ERC20 代币从 ETH 转移到 Cosmos
- 将挂钩代币从 Cosmos 转移到 ETH
- 更新在 ETH 上设置的 Cosmos 验证器

前两步做一次，后三步重复多次。

## 定义

文字很重要，我们寻求术语的清晰性，因此我们可以清晰地思考和交流。
我们在下面提到的关键概念将在这里定义:
- `Operator` - 这是一个(或多个)控制 Cosmos SDK 验证器节点的人。这在 Cosmos SDK staking 部分也称为 `valoper` 或“Validator Operator”
- `完整节点` - 这是一个由运营商运行的 _Ethereum_ 完整节点
- `Validator` - 这是一个 Cosmos SDK 验证节点(签署区块)
- `Eth Signer`(名称 WIP)- 这是一个由运营商控制的独立二进制文件，持有以太坊私钥，用于签署交易，用于在两个链之间移动代币。
- `Oracle`(名称 WIP)——这是一个由运营商控制的单独二进制文件，它持有 Cosmos SDK 私钥，用于通过提交“声明”将数据从以太坊链传送到 Cosmos 链，这些声明聚合到一个“证明”中`
- `Orchestrator` - 一个单一的二进制文件，结合了 `Eth Signer`、`Oracle` 和 `Relayer` 以方便 `Operator` 使用
- `Relayer` - 这是一种向以太坊上的 Gravity 合约提交更新的节点。它从批量交易中赚取费用。
- `REST server` - 这是在端口 1317 上运行的 Cosmos SDK“REST 服务器”，在验证器节点或由 Operator 控制的另一个 Cosmos SDK 节点上
- `Ethereum RPC` - 这是以太坊全节点的 JSON-RPC 服务器。
- `Validator Set` - Cosmos SDK 链上的一组验证器，以及它们各自的投票权。这些是用于签署tendermint块的ed25519公钥。
- `Gravity Tx pool` - 是存在于 Cosmos 连锁店中的交易池 -> 以太坊交易等待放入交易批次
- `交易批次` - 交易批次是一组从 Gravity 以太坊合约同时发送的以太坊交易。这有助于降低提交批次的成本。批次有最大大小(目前大约 100 笔交易)并且只涉及 Cosmos -> Ethereum 流程
- `Gravity Batch pool` - 是一个类似结构的交易池，存在于链中进行存储，与 `Gravity Tx pool` 分开，它存储已被分批放置的交易，这些交易正在被签名或提交的过程中`Orchestrator Set`
- `EthBlockDelay` - 是商定的所有预言机证明延迟的以太坊块数。任何“Orchestrator”都不会证明在以太坊上发生过事件，直到他们信任的以太坊完整节点所表示的区块数量已经过去。这应该可以防止短分叉形式导致 Cosmos 方面的分歧。目前正在考虑的价值是 50 个区块。
- `Observed` - 当给定区块期间 66% 的活跃 Cosmos 验证器集的 `Eth Signers` 提交了证明看到该事件的 oracle 消息时，以太坊上的事件被认为是 `Observed`。
- `Validator set delta` - 这是当前在 Gravity Ethereum 合约中设置的验证器与 Cosmos 链上设置的实际验证器之间差异的术语。由于验证器集可能会更改每个单个块，因此基本上可以保证在任何给定时间都有一些非零的“验证器集增量”。
- `Allowed validator set delta` - 这是最大允许的 `Validator set delta` 这个参数用于确定 MsgProposeGravityContract 中的 Gravity 合约是否有一个“足够接近”的验证器集来接受。它还用于确定何时需要发送验证器集更新。这是由治理投票决定的 _before_ MsgProposeGravityContract 可以发送。
- `Gravity ID` - 这是一个随机的 32 字节值，需要包含在特定合约实例的所有 Gravity 签名中。它被传递到以太坊上的合约构造函数中，并用于在合约可能共享一个验证器集或验证器集的子集时防止签名重用。这也是通过治理投票设置的_before_ MsgProposeGravityContract 可以发送。
- `Gravity contract code hash` - 这是已知良好版本的 Gravity 合约可靠性代码的代码哈希。它将用于准确验证将部署哪个版本的网桥。
- `Start Threshold` - 这是在桥梁可以开始运行之前必须在线并参与重力操作的总投票权的百分比。
- `Claim`(名称 WIP)- 由单个 `Orchestrator` 实例签署并提交给 Cosmos 的以太坊事件
- `Attestation`(名称 WIP) - 最终被所有协调器“观察到”的声明聚合
- `Voucher` - 代表 Cosmos 端的桥接 ETH 代币。他们的名称有一个“gravity”前缀和一个由合约地址和合约代币构建的哈希。该分值在系统内被认为是唯一的。
- `Counterpart` - `Voucher` 是合约中锁定的 ETH 代币
- `委托密钥` - 当`Operator`设置`Eth Signer`和`Oracle`时，他们通过使用他们的`Validator`地址发送包含这些密钥的消息来分配`Delegate Keys`。有一个代表以太坊密钥，用于在以太坊上签署消息并在以太坊上代表这个“验证者”，还有一个代表 Cosmos 密钥，用于提交“Oracle”消息。
- `Gravity Contract` - `Gravity Contract` 是以太坊合约，持有以太坊一侧的所有重力桥堤。它包含使用“委托密钥”和规范化权力的 cosmos 验证器集的表示。例如，如果验证者拥有 5% 的 Cosmos 链验证者权力，他们的委托密钥将拥有“重力合约”中 5% 的投票权，这些值会定期更新，以保持 Cosmos 和以太坊链验证者集同步。

_Operator_ 是这里的关键信任单位。每个操作员负责维护 3 个安全流程:

1. Cosmos SDK Validator - 签署区块
1. 完全同步的以太坊全节点
1. `Eth Signer`，用 `Operator` 的 Eth 密钥对事物进行签名

## 安全问题

**Validator Set** 是背后有权益的实际密钥集，为了双重签名或其他
行为不当。我们通常将链的安全性视为 _Validator Set_ 的安全性。这取决于
每一条链，不过是我们的黄金标准。即使 IBC 提供的安全性也不比两个相关验证器集的最小值更高。

**Eth Signer** 是由验证器集与主 Cosmos 守护程序(`gaiad` 或等效程序)一起运行的二进制文件。它纯粹作为代码组织存在，负责签署以太坊交易，以及观察以太坊上的事件并将它们带入 Cosmos 状态。它使用以太坊密钥签署发往以太坊的交易，并使用 Cosmos SDK 密钥签署来自以太坊的事件。我们可以通过 _Validator Set_ 运行的任何 _Eth Signer_ 向任何错误签名的消息添加削减条件，并能够提供与 _Valiator Set_ 相同的安全性，只是一个不同的模块检测恶意证据并决定削减多少。如果我们可以证明由 _Validator Set_ 的任何 _Eth Signer_ 签署的交易是非法或恶意的，那么我们可以在 Cosmos 链端进行削减，并有可能提供 _Validator Set_ 的 100% 安全性。请注意，这也可以访问 3 周解除绑定
允许证据削减的时期，即使他们立即解除绑定。

**MultiSig Set** 是 _Validator Set_ 的(可能是旧的)镜像，但带有以太坊密钥，并存储在以太坊上
合同。如果我们确保 _MultiSig Set_ 比解绑期更频繁地更新(例如每周至少一次)，
那么我们可以保证 _MultiSig Set_ 的所有成员都有可用于不当行为的原子。然而，在一些极端
在股权转移的情况下，_MultiSig Set_ 和 _Validator Set_ 可能相距甚远，这意味着有
_MultiSig Set_ 中的许多成员不再是活跃的验证者，并且可能不会打扰传输 Eth 消息。
因此，为了避免审查攻击/不活动，我们也应该在每次有重大变化时更新
在验证器集中(例如 > 3-5%)。如果我们保持这两个条件，MultiSig Set 应该提供类似水平的
security 作为验证器集。

现在有 3 个条件可以被任何验证者削减: 使用来自
**Validator Set**，使用其 _Eth Signer_ 持有的 Cosmos SDK 密钥签署来自以太坊的无效/恶意事件，或
使用其 _Eth Signer_ 持有的以太坊密钥签署无效/恶意的以太坊交易。如果所有不当行为的条件都可以
归因于其中一组的签名，并在 **Cosmos 链** 上得到证明，那么我们可以争辩说 Gravity 提供
安全级别等于 Peg-Zone 验证器集的最小值，或重组以太坊链 50 块。
并提供等于或大于 IBC 的安全性。

## 引导

我们假设升级基于 Cosmos 的二进制文件以具有重力模块的行为已经完成，
正如在许多其他地方讨论的方法一样。这里我们关注 _activation_ 步骤。

1. 每个`Operator` 为其`EthSigner` 生成一个以太坊和Cosmos 私钥。这些地址由 MsgRegisterEthSigner 中的 Operators valoper 密钥签名和提交。 `EthSigner` 现在可以自由地将这些委托的密钥用于所有 Gravity 消息。
1. 对桥接参数进行治理投票，包括`Gravity ID`、`Allowed validator set delta`、`start threshold`和`Gravity contract code hash`
1. 任何人都可以使用已知的代码哈希和 Cosmos 区域的当前验证器集将 Gravity 合约部署到与以太坊兼容的区块链。
1. 每个`Operator` 可能会也可能不会使用上述 Gravity 合约地址配置他们的 `Eth Signer`
1. 如果配置了地址，“Eth Signer”会检查提供的地址。如果合约通过验​​证，`Eth Signer` 会签署并提交 MsgProposeGravityContract。验证被定义为在“允许的验证器集增量”中找到正确的“重力合约代码哈希”和匹配当前集的验证器集。
1. 当投票权超过“启动阈值”发送了具有相同以太坊地址的 MsgProposeGravityContract 时，认为合约地址被采用。
1. 由于验证者集合变化很快，未配置合约地址的“Eth Signers”观察 Cosmos 区块链提交。提交地址后，他们会对其进行验证并在通过时自行批准。这导致了一个工作流程，一旦提出有效合同，它将在几秒钟内得到批准。
1. 如果故意创建竞争条件导致少于 66% 的验证者权力批准多个有效的 Gravity Ethereum 合约，则采用过程可能会失败。在这种情况下，Orchestrator 将使用大多数权力(或在完全平局的情况下随机)检查合同地址并切换它的投票。这仅留下>33% 的“运营商”有意选择不同合约地址的可能边缘情况。这将是共识失败，桥梁无法进展。
1. 桥接流程完成，合约地址现在放置到store中进行引用，其他操作可以继续进行。

此时，我们知道我们在以太坊上有一个带有适当_MultiSig Set_的合约，_Orchestrator Set_的>`start threshold`在线并同意这个合约，并且Cosmos链已经存储了这个合约地址。只有这样我们才能开始接受交易来转移代币

注意:“启动阈值”是引导的一些安全因素。 67% 足够发布，但我们不想开始，直到在线出现误差幅度(不要因为投票权的微小变化而下降)。这可能是 70%、80%、90% 甚至 95%，具体取决于我们希望所有 _Orchestrators_ 在开始前都可以运行的程度。

## ETH 到 Cosmos Oracle

所有 `Operator` 都运行一个 `Oracle` 二进制文件。这个单独的过程监控以太坊节点是否有涉及以太坊链上“重力合约”的新事件。 `Oracle` 监控的每个事件都有一个事件随机数。该随机数是“声明”的唯一协调值。由于“Oracle”可能需要观察的每个事件都有一个唯一的事件随机数，因此“声明”总是可以通过指定事件随机数来引用唯一的事件。

- 一个 `Oracle` 在以太坊链上观察到一个事件，它将这个事件打包成一个 `Claim` 并将这个声明提交给 Cosmos 链
- 在 Gravity Cosmos 模块中，此 `Claim` 创建或添加到与 `Claim` 的详细信息匹配的现有 `Attestation` 中，一旦超过 66% 的活动 `Validator` 集已做出匹配的 `Claim`给定的 `Attestation` 执行 `Attestation`。这可能会铸造代币、销毁代币或任何适合此特定事件的东西。
- 如果验证者不能就单个“证明”达成超过 66% 的同意，则预言机将停止。这意味着在某些验证者更改投票之前，不会从以太坊中转任何新事件。对此没有削减条件，因为如果存在预期的以太坊分叉，那么拥有一个会危及链本身的活跃性。

## 将 Cosmos 中继到 ETH

- 当用户想要将代币转移到以太坊时，他们会发送 MsgSendToEth。这将从他们的帐户中扣除代币，并将交易放入“重力交易池”中
- 有人(未经许可)发送了一个 MsgRequestBatch，这会在 `Gravity Batch pool` 中产生一个新的 `Transaction batch`。该批次的创建发生在 CosmosSDK 中并且完全是确定性的，并且应该从`Gravity Tx Pool` 中的交易中创建最有利可图的批次。
  - `TransactionBatch` 包含一个批处理随机数。
  - 它还包括最新的`Valset`
  - 该批次中的交易从`Gravity Tx Pool`中移除，并且不能包含在新批次中。
- `Gravity Batch Pool` 中的批次由 `Validator Set` 的 `Eth Signers` 签署。
  - `Relayers` 现在可以尝试将这些批次提交给 Gravity 合约。如果一个批次有足够的签名(`Multisig Set` 的 2/3+1)，它的提交就会成功。是否尝试批量提交的决定完全取决于给定的“中继器”。
- 一旦“观察到”批次已成功提交到以太坊(这至少需要与“EthBlockDelay”一样长)，“重力批次池”中具有较低随机数且尚未成功提交的任何批次提交的交易将返回到“重力交易池”以在新批次中进行尝试。这是安全的，因为我们知道这些批次不可能再提交了，因为它们的 nonce 太低了。

- 当新的 MsgRequestBatch 进入新批次时，除非它比“重力批次池”中当前的任何批次更有利可图，否则不会产生新批次。这意味着当有批次积压时，批次 _must_ 变得越来越有利可图。