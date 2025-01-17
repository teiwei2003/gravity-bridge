# Slash规范

该文件命名并记录了我们在 Gravity 中使用的各种Slash条件。

## GRAVSLASH-01:签署假验证器集或交易批次证据

这种削减条件旨在阻止验证者对 Cosmos 上从未存在过的验证者集和随机数进行签名。它通过证据机制工作，任何人都可以通过伪造的验证器集提交包含验证器签名的消息。这旨在产生这样的效果:如果形成一个验证者卡特尔以提交虚假验证者集，则一个叛逃者可能会导致他们全部被削减。

**实施注意事项:**

这种削减条件中最棘手的部分是确定 Cosmos 上从未存在过验证器集。为了节省空间，我们需要清理旧的验证器集。我们可以在 KV 存储中保留验证器集哈希到 true 的映射，并使用它来检查验证器集是否曾经存在过。这比存储整个验证器集更有效，但它的增长仍然是无限的。可能可以使用其他加密方法来减少此映射的大小。从此映射中修剪非常旧的条目可能没问题，但任何修剪都会降低这种削减条件的威慑力。

## GRAVSLASH-02:未能签署验证人集更新或交易批次

当验证者未签署由 Gravity Cosmos 模块生成的验证者集更新或交易批次时，会触发此削减条件。这可以防止两种糟糕的情况-

1. 验证者根本不会费心让正确的二进制文件在他们的系统上运行，
2. 超过 1/3 验证者的卡特尔解除绑定，然后拒绝签署更新，阻止任何验证者集更新获得足够的签名以提交给 Gravity 以太坊合约。如果他们阻止验证者集更新的时间超过 Cosmos 解绑期，他们将不再因提交虚假验证者集更新和 tx 批次(GRAVSLASH-01 和 GRAVSLASH-02)而受到惩罚。

为了应对场景 2，GRAVSLASH-02 还需要削减不再进行验证但仍处于解绑期的验证者。这意味着当验证者离开验证者集时，他们将需要继续运行他们的设备 2 周。这对于 Cosmos 链来说是不寻常的，并且可能不被验证者接受。正在研究允许验证者在解除绑定期完全结束之前停止签名的方法。

## GRAVSLASH-03:提交不正确的 Eth oracle 声明 - 有意未实施

以太坊预言机代码(目前主要包含在 attestation.go 中)是 Gravity 的关键部分。它允许 Gravity 模块了解以太坊上发生的事件，例如存款和执行的批次。 GRAVSLASH-03 旨在惩罚为以太坊上从未发生过的事件提交索赔的验证者。

**实施注意事项**

我们知道以太坊上是否发生了事件的唯一方法是通过以太坊事件预言机本身。因此，为了实现这种削减条件，我们削减了在与超过 2/3 秒的验证者观察到的事件相同的随机数下提交了针对不同事件的声明的验证者。

尽管出于善意，但对于 Gravity 的大多数应用程序来说，这种削减条件可能是不可取的。这是因为它将安装的 Cosmos 链的功能与以太坊链的正确功能联系起来。如果以太坊链出现严重的分叉，那么诚实的不同验证者可能会在同一个事件随机数中看到不同的事件，并且不会因为他们自己的过错而被削减。广泛的不公平砍价将对 Cosmos 链的社会结构造成极大破坏。

也许 GRAVSLASH-03 根本没有必要:

这种削减条件的真正用途是，如果超过 2/3 的验证者组成一个卡特尔，在某个特定的随机数提交一个假事件，那么他们中的一些人可以脱离卡特尔并提交真实事件在那一刻。如果有足够多的叛逃卡特尔成员使真实事件被观察到，那么剩余的卡特尔成员将因这种情况而受到削减。然而，在大多数情况下，这将需要 >1/2 的卡特尔成员背叛。

如果卡特尔缺陷不够多，那么这两个事件都不会被观察到，以太坊预言机就会停止。与实际触发 GRAVSLASH-03 的情况相比，这种情况更有可能发生。

此外，如果卡特尔成功，将针对诚实的验证者触发 GRAVSLASH-03。这可能会使形成的卡特尔更容易威胁不想加入的验证者。

## GRAVSLASH-04:未能提交 Eth oracle 声明

这类似于 GRAVSLASH-03，但它是针对未提交已观察到的预言机声明的验证者触发的。与 GRAVSLASH-03 相比，GRAVSLASH-04 旨在惩罚完全停止参与预言机的验证者。

**实施注意事项**

不幸的是，GRAVSLASH-04 与 GRAVSLASH-03 具有相同的缺点，因为它将 Cosmos 链的正确操作与以太坊链联系起来。此外，它可能不会以正确的行为方式激励太多。为避免触发 GRAVSLASH-04，验证者只需复制即将被观察到的声明。提交-显示方案可以防止这种声明的复制，但对于“懒惰的验证者”来说，简单地使用公共以太坊完整节点或区块浏览器仍然很容易，对安全性有类似的影响。因此，GRAVSLASH-04 的真正用处可能很小

如果没有 GRAVSLASH-03 和 GRAVSLASH-04，以太坊事件预言机只有在超过 2/3 的验证者自愿提交正确声明时才会继续运行。尽管反对 GRAVSLASH-03 和 GRAVSLASH-04 的论点令人信服，但我们必须决定我们是否对这一事实感到满意。我们应该可以在链的参数中启用或禁用 GRAVSLASH-03 和 GRAVSLASH-04。