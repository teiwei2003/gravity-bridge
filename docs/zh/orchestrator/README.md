# Orchestrator 文件夹

### 客户/

此文件夹构建一个二进制文件，它是重力系统的客户端应用程序。它包含以下命令:
- `cosmos-to-eth`
- `eth-to-cosmos`
- `deploy-erc20-representation`

### 宇宙引力/

这是一个用于与 Cosmos 链进行查询和交易交互的库。它基本上包装了`gravity_proto`。

### ethereum_gravity/

这是一个包含与交易对手以太坊链交互的代码的库。

### gravity_proto/

`prost` 生成用于处理重力 protobuf 对象的绑定。

### gravity_utils/

用于处理 `gravity` 代码的各种实用程序。

### 编排器/

用于构建 orchestartor 二进制文件的包。

### proto_build/

在这个文件夹中运行 `cargo run` 来构建 `gravity_proto` 还要注意，这会生成太多的文件。只需要`gravity.v1.rs`。

### register_delegate_keys/

这是一个单独的二进制文件，用于运行为验证器注册委托密钥的命令。注意:这需要现在在 `gentx` 中完成，所以这可能不再需要了。

### 中继器/

这是为了将中继器逻辑(即从宇宙到以太坊)构建为单独的二进制文件。它还包含中继器的库。

### 脚本/

支持此库的 bash 脚本

### test_runner/

针对 Cosmos 链运行测试的二进制文件


## 命令行界面

### 当前的

```
client cosmos-to-eth --cosmos-phrase=<key> --cosmos-grpc=<url> --cosmos-prefix=<prefix> --cosmos-denom=<denom> --amount=<amount> --eth-destination=<dest> [--no-batch] [--times=<number>]
client eth-to-cosmos --ethereum-key=<key> --ethereum-rpc=<url> --cosmos-prefix=<prefix> --contract-address=<addr> --erc20-address=<addr> --amount=<amount> --cosmos-destination=<dest> [--times=<number>]
client deploy-erc20-representation --cosmos-grpc=<url> --cosmos-prefix=<prefix> --cosmos-denom=<denom> --ethereum-key=<key> --ethereum-rpc=<url> --contract-address=<addr> --erc20-name=<name> --erc20-symbol=<symbol> --erc20-decimals=<decimals>
orchestrator --cosmos-phrase=<key> --ethereum-key=<key> --cosmos-grpc=<url> --address-prefix=<prefix> --ethereum-rpc=<url> --fees=<denom> --contract-address=<addr>
register-delegate-key --validator-phrase=<key> --address-prefix=<prefix> [--cosmos-phrase=<key>] [--ethereum-key=<key>] --cosmos-grpc=<url> --fees=<denom>
relayer --ethereum-key=<key> --cosmos-grpc=<url> --address-prefix=<prefix> --ethereum-rpc=<url> --contract-address=<addr> --cosmos-grpc=<gurl>
test_runner 
```

## 建议的

为二进制文件提议名称`gorc`。 这是“gravity-orchestrator”的缩写。

```
gorc
  tx
    eth
      send-to-cosmos [from-eth-key] [to-cosmos-addr] [erc20 conract] [erc20 amount] [[--times=int]]
      send [from-key] [to-addr] [amount] [token-contract]
    cosmos
      send-to-eth [from-cosmos-key] [to-eth-addr] [erc20-coin] [[--times=int]]
      send [from-key] [to-addr] [coin-amount]
  query
    eth
      balance [key-name]
      contract
    cosmos
      balance [key-name]
      gravity-keys [key-name]
  deploy
    cosmos-erc20 [denom] [erc20_name] [erc20_symbol] [erc20_decimals]
  start
    orchestrator [contract-address] [fee-denom]
    relayer
  tests
    runner
  keys
    eth
      add [name]
      import [name] [privkey]
      delete [name]
      update [name] [new-name]
      list
      show [name]
    cosmos 
      add [name]
      import [name] [mnemnoic]
      delete [name]
      update [name] [new-name]
      list
      show [name]
```

```json
[gravity]
	contract = "0x6b175474e89094c44da98b954eedeac495271d0f"
	
[ethereum]
key = "testkey"
rpc = "http://localhost:8545"

[cosmos]
key = "testkey"
grpc = "http://localhost:9090"
prefix = "cosmos"
```
