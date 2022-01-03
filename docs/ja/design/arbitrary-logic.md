# 任意のロジック機能

Gravityには、他のイーサリアムコントラクトを任意に呼び出す機能が含まれています。これは、コスモスチェーンがイーサリアムに対してアクションを実行できるようにするために使用できます。この機能は非常に一般的です。ブリッジのコアトークン転送機能を実装するために使用することもできます。ただし、重要な注意点が1つあります。これらの任意のロジックコントラクトはERC20トークンとトランザクションできますが、ERC721などの他の種類のアセットとはトランザクションできません。 ERC20以外のアセットとやり取りするには、コアGravityコントラクトを変更する必要があります。

# Build

`SetOutgoingLogicCall`

Gravityは、他のモジュールから呼び出して発信ロジック呼び出しを作成できるメソッドを提供します。このメソッドを使用するには、呼び出し元のモジュールが最初にロジック呼び出しをアセンブルする必要があります(これについては後で詳しく説明します)。次に、これは `SetOutgoingLogicCall`を使用してGravityモジュールに送信されます。ここから、バリデーターによって署名されます。十分な署名があれば、Gravityリレーがそれを受け取り、EthereumのGravity契約に送信します。

`OutgoingLogicCall`

`SetOutgoingLogicCall`は、引数として` OutgoingLogicCall`を取ります。そのパラメータの説明は次のとおりです。

```golang
//OutgoingLogicCall represents an individual logic call from Gravity to ETH
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

-転送:これらは、実行される前にロジックコントラクトに送信されるトークンです。その後、コントラクトはトークンを使用してアクションを実行できます。たとえば、Gravityは、ロジックコントラクトにいくつかのUniswap LPトークンを送信し、それを使用してUniswapから流動性を引き換えることができます。
-料金:これらは、ロジック呼び出しを実行するために、コアGravity.solコントラクトによってGravityリレーに支払われるトークンです。料金はロジックコントラクトの実行後に支払われるため、ロジックコントラクトが実行後に受け取ったトークンを中継者に支払い、コアグラビティコントラクトに送り返すことができます。
--LogicContractAddress:これは、コアGravityコントラクトが任意のロジックを実行するために呼び出すロジックコントラクトのアドレスです。注:これは実際のロジックコントラクトである場合もあれば、ロジックコントラクトを何度も呼び出すバッチコントラクトである場合もあります。 `/solidity/test`フォルダーにあるこの例。
-ペイロード:これは、ロジックコントラクトで実行されるEthereumabiでエンコードされた関数呼び出しです。バッチミドルウェアコントラクトを使用している場合、このabiエンコードされた関数呼び出し自体に、実際のロジックコントラクトでのabiエンコードされた関数呼び出しの配列が含まれます。
-タイムアウト:イーサリアムのブロックタイムスタンプがこのタイムアウトの値よりも高い場合、ロジックコールは実行されません。
--InvalidationScopeおよびInvalidationNonce:以下の詳細:


## 無効化

`invalidation_id`と` invalidation_nonce`は、Gravityの任意のロジック呼び出し機能でリプレイ保護として使用されます。

submitLogicCallトランザクションがEthereumコントラクトに送信されると、コントラクトチェックは `invalidation_id`を使用して無効化マッピングのキーにアクセスします。このキーの値は、指定された `invalidation_nonce`に対してチェックされます。ロジックコールは、指定された `invalidation_nonce`の方が高い場合にのみ通過できます。

これは、さまざまな無効化スキームを実装するために使用できます。

### 最も簡単:タイムアウトのみの無効化
これが何を意味するのかわからない場合は、Cosmos側からGravityモジュールにロジック呼び出しを送信するときに、モジュールで追跡する増分整数に `invalidation_id`を設定するだけです。毎回 `invalidation_nonce`をゼロに設定します。これにより、ロジックバッチごとにイーサリアムの無効化マッピングに新しいエントリが作成され、リプレイ保護が提供されると同時に、バッチを完全に独立させることができます。

### 順次無効化
後のロジック呼び出しの後に初期のロジック呼び出しを送信できないようにする場合は、代わりに、毎回 `invalidation_id`をゼロに設定し、` invalidation_nonce`に増分整数を使用できます。これにより、正常に送信されたロジック呼び出しは、以前のすべてのロジック呼び出しを無効にします。

### 例:トークンベースの無効化
GravityのコアsubmitBatch機能では、特定のトークンのトランザクションのバッチがそのトークンの以前のバッチを無効にしますが、他のトークンの以前のバッチは無効にしません。これをsubmitLogicCallメソッドの上に実装するには、 `invalidation_id`をトークンアドレスに設定し、トークンごとに増分ナンスを維持します。