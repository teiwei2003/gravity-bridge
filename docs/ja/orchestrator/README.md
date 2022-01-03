# オーケストレーターフォルダー

### クライアント/

このフォルダーは、重力システムのクライアントアプリケーションであるバイナリを構築します。次のコマンドが含まれています。
-`cosmos-to-eth`
-`eth-to-cosmos`
-`deploy-erc20-representation`

### cosmos_gravity/

これは、クエリとトランザクションの両方でコスモスチェーンと対話するためのライブラリです。実質的に `gravity_proto`をラップします。

### ethereum_gravity/

これは、カウンターパーティのイーサリアムチェーンとの相互作用のためのコードを含むライブラリです。

### gravity_proto/

`prost`は、重力protobufオブジェクトを操作するためのバインディングを生成しました。

### gravity_utils/

`gravity`コードを操作するためのさまざまなユーティリティ。

### オーケストレーター/

orchestartorバイナリをビルドするためのパッケージ。

### proto_build/

このフォルダで `cargo run`を実行して、` gravity_proto`をビルドします。これには、生成されるファイルが多すぎることに注意してください。 `gravity.v1.rs`のみが必要です。

### register_delegate_keys/

これは、バリデーターのデリゲートキーを登録するコマンドを実行するための個別のバイナリです。注:これは `gentx`で実行する必要があるため、これはもう必要ない可能性があります。

### リレー/

これは、リレーロジック(つまり、コスモスからイーサリアム)を個別のバイナリとして構築するためのものです。また、中継器用のライブラリも含まれています。

### スクリプト/

このライブラリのbashスクリプトのサポート

### test_runner/

コスモスチェーンに対してテストを実行するバイナリ


## CLI

### 現在

```
client cosmos-to-eth --cosmos-phrase=<key> --cosmos-grpc=<url> --cosmos-prefix=<prefix> --cosmos-denom=<denom> --amount=<amount> --eth-destination=<dest> [--no-batch] [--times=<number>]
client eth-to-cosmos --ethereum-key=<key> --ethereum-rpc=<url> --cosmos-prefix=<prefix> --contract-address=<addr> --erc20-address=<addr> --amount=<amount> --cosmos-destination=<dest> [--times=<number>]
client deploy-erc20-representation --cosmos-grpc=<url> --cosmos-prefix=<prefix> --cosmos-denom=<denom> --ethereum-key=<key> --ethereum-rpc=<url> --contract-address=<addr> --erc20-name=<name> --erc20-symbol=<symbol> --erc20-decimals=<decimals>
orchestrator --cosmos-phrase=<key> --ethereum-key=<key> --cosmos-grpc=<url> --address-prefix=<prefix> --ethereum-rpc=<url> --fees=<denom> --contract-address=<addr>
register-delegate-key --validator-phrase=<key> --address-prefix=<prefix> [--cosmos-phrase=<key>] [--ethereum-key=<key>] --cosmos-grpc=<url> --fees=<denom>
relayer --ethereum-key=<key> --cosmos-grpc=<url> --address-prefix=<prefix> --ethereum-rpc=<url> --contract-address=<addr> --cosmos-grpc=<gurl>
test_runner 
```

## PROPOSED

バイナリの名前 `gorc`を提案します。 これは `gravity-orchestrator`の略です。

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
