# 重力桥

![重力桥](../gravity-bridge.svg)

重力桥是 Cosmos <-> 以太坊桥，旨在在 [Cosmos Hub](https://github.com/cosmos/gaia) 上运行，专注于最大程度的设计简单性和效率。

Gravity 可以将源自以太坊的 ERC20 资产转移到基于 Cosmos 的链，然后再转移回以太坊。

将源自 Cosmos 的资产转移到以太坊上的 ERC20 代表的能力将在几个月内实现。

## 地位

重力桥正在开发中，很快就会接受审核。提供了部署和使用说明，希望它们有用。

您有责任了解使用该软件的财务、法律和其他风险。不保证功能性或安全性。您完全自担风险使用 Gravity。

您可以通过观看我们的 [公开站会](https://www.youtube.com/playlist?list=PL1MwlVJloJeyeE23-UmXeIx2NSxs_CV4b) 来了解最新发展，随时加入并提出问题。
- Solidity 合约
  - [x] 多个 ERC20 支持
  - [x] 使用 100 多个验证器进行测试
  - [x] 每个抛出条件的单元测试
  - [x] 对源自以太坊的资产的审计
  - [ ] 支持在以太坊上发行 Cosmos 资产
- 宇宙模块
  - [x] 基本验证器集同步
  - [x] 基本交易批量生成
  - [x] Ethereum -> Cosmos Token 发行
  - [x] Cosmos -> 以太坊代币发行
  - [x] 引导
  - [x] Genesis 文件保存/加载
  - [x] 验证器设置同步边缘情况
  - [x] 削减
  - [x] 中继边缘情况
  - [ ] 事务批处理边缘情况
  - [ ] 支持在以太坊上发行 Cosmos 资产
  - [ ] 审计
- 编排器/中继器
  - [x] 验证器设置更新中继
  - [x] 以太坊 -> Cosmos Oracle
  - [x] 交易批量中继
  - [ ] Tendermint KMS 支持
  - [ ] 审计

## 重力桥的设计

- 对重力桥完整性的信任锚定在 Cosmos 一侧。为以太坊合约签署的欺诈验证器集更新和交易批次将受到 Cosmos 链上的大幅削减的惩罚。如果你信任 Cosmos 链，你就可以信任它运营的 Gravity 桥，只要它在一定的参数范围内运行。
- 挂钩区域验证器必须维护受信任的以太坊节点。这消除了通常由独立中继器产生的所有信任和博弈论影响，再次显着简化了设计。

## 关键设计组件

- 一种将 Cosmos 验证者投票映射到以太坊的高效方式。 Gravity Solidity 合约的验证器集更新成本约为 500,000 gas(2 美元 @ 20gwei)，在具有 125 个验证器的 Cosmos Hub 验证器集的快照上进行测试。验证验证者集的投票是 Gravity 必须执行的链上最昂贵的操作。我们高度优化的 Solidity 代码可节省大量成本。对于小到 8 个签名者的签名集，现有的桥会产生两倍多的 gas 成本。
- 从 Cosmos 到以太坊的交易是分批进行的，批次的基本成本约为 500,000 天然气(2 美元 @ 20gwei)。在每个区块的 ERC20 发送限制内，批次可能包含任意数量的交易，从而允许在大容量桥梁上大量摊销成本。

## 操作参数保证安全

- 每个 Cosmos 解绑期(通常为 2 周)至少调用一次 `updateValset` 方法，必须对以太坊合约进行验证器集更新。这是因为如果超过解绑期没有更新，以太坊合约存储的验证器集可能包含无法因不当行为而被削减的验证器。
- Cosmos 完整节点不验证来自以太坊的事件。这些事件完全根据当前验证者集的签名被接受到 Cosmos 状态。拥有 >2/3 股权的验证者有可能将事件置于以太坊上从未发生过的 Cosmos 状态。在这种情况下，两条链的观察者都需要“拉响警报”。我们已将此功能构建到中继器中。

## 现在使用 docker 运行重力桥

我们提供一键式集成测试，可部署完整的任意验证器 Cosmos 链和测试网 Geth 链，用于开发 + 验证。我们相信，拥有一个反映代码的完整部署和类似生产使用的深入测试环境对于生产性开发至关重要。

目前，在每次提交时，我们都会在我们的测试环境中发送数百个交易、数十个验证器集更新和几个交易批次。这为重力桥提供了高水平的质量保证。

因为测试在这个存储库中构建了绝对所有的东西，所以它们确实需要大量的时间来运行。您可能希望简单地推送到一个分支并让 Github CI 负责测试的实际运行。

要运行测试，只需安装并运行 docker。

`bash 测试/all-up-test.sh`

有针对特定功能的可选测试

Valset 压力随机改变验证功率 25 次，试图破坏验证器集同步

`bash 测试/all-up-test.sh VALSET_STRESS`

批次压力通过桥发送 300 笔交易，然后将 3 批次发送回以太坊。这段代码最多可以进行 10k 次交易，但 Github Actions 没有这个能力。

`bash 测试/all-up-test.sh BATCH_STRESS`

Validator out 测试未运行强制性以太坊节点的验证器。这个验证器将被削减，桥将保持运行。

`bash 测试/all-up-test.sh VALIDATOR_OUT`

# 开发者指南

## Solidity 合约

在“solidity”文件夹中

Run `HUSKY_SKIP_INSTALL=1 npm install`, then `npm run typechain`.

Run `npm run evm` in a separate terminal and then

Run `npm run test` to run tests.

修改solidity文件后，运行`npm run typechain`重新编译合约
类型定义。

Solidity 合约也包含在 Cosmos 模块测试中，每次集成测试运行时，它都会自动部署到开发容器内的 Geth 测试链，用于微测试网。

## 宇宙模块

我们提供了一个标准的基于容器的开发环境，可以自动引导 Cosmos 链和以太坊链进行测试。 我们相信开发环境的标准化和易于开发是必不可少的，因此如果您在开发流程中遇到问题，请提交问题。

### 去单元测试

它们不会运行整个链，而是单独测试部分 Go 模块代码。 要运行它们，请进入 `/module` 并运行 `make test`

### 快速手动测试您的更改

该方法与上述全部测试不同。 尽管它运行相同的组件，但在编辑单个组件时要快得多。
1. run `./tests/build-container.sh`
2. run `./tests/start-chains.sh`
3. switch to a new terminal and run `./tests/run-tests.sh`
4. Or, `docker exec -it gravity_test_instance /bin/bash` should allow you to access a shell inside the test container

更改代码，当你想再次测试时，重启`./tests/start-chains.sh`并运行`./tests/run-tests.sh`。

### 解释:

`./tests/build-container.sh` 构建基础容器并首次构建 Gravity 测试区。这会产生一个 Docker 容器，其中包含缓存的 Go 依赖项(基础容器)。

`./tests/start-chains.sh` 基于基础容器启动一个测试容器，并将当前源代码(包括您所做的任何更改)复制到其中。然后构建 Gravity 测试区，受益于缓存的 Go 依赖项。然后它会启动在您的新代码上运行的 Cosmos 链。它还启动了一个以太坊节点。这些节点在您启动它的终端中保持运行，查看日志会很有用。请注意，这也会将 Gravity 存储库文件夹安装到容器中，这意味着您所做的更改将反映在那里。

`./tests/run-tests.sh` 连接到正在运行的测试容器并运行在 `./tests/integration-tests.sh` 中找到的集成测试

### IDE 提示:

- 在 /solidity 中启动 VS Code 并启用solidity 扩展以获得solidity 合约的内联类型检查
- 在 /module/app 中启动 VS Code 并启用 go 扩展以获得虚拟宇宙链的内联类型检查

### 在容器内工作

在不重启容器的情况下修改、重新编译和重启测试网会很有用，例如，如果您正在容器中运行文本编辑器并且不希望它退出，或者如果您正在编辑存储在容器的`/ go/` 文件夹。

在此工作流中，您可以使用`./tests/reload-code.sh` 重新编译并重启测试网，而无需重启容器。

例如，您可以使用 VS Code 的“Remote-Container”扩展附加到以 `./tests/start-chains.sh` 启动的正在运行的容器，然后编辑容器内的代码，使用 `./tests` 重新启动测试网/reload-code.sh`，并使用 `./tests/integration-tests.sh` 运行测试。

## 调试器

要在 VS Code 中使用步进调试器，请按照上面的“在容器内工作”说明进行操作，但使用 `./tests/reload-code.sh 1` 设置单节点测试网。现在用`pkill Gravityd`杀死节点。从 VS Code 中启动调试器，您将拥有一个 1 节点的可调试测试网。