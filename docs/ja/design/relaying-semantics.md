# 重力ブリッジリレーセマンティクス

このドキュメントは、開発者が代替のGravityリレーを実装するのを支援することを目的としています。イーサリアムと相互作用するオーケストレーションの2つの主要なコンポーネント。 Gravityブリッジは、使いやすさではなく、効率を高めるように設計されています。これは、これらの外部バイナリには多くの暗黙的な要件があることを意味します。このドキュメントでは、明示的にするのが最善です。

Gravityの `オーケストレーター`は[overview.md](overview.md)で説明されています。これは、Gravityブリッジの外部バイナリによって実行される必要がある3つの異なる役割の組み合わせです。このドキュメントでは、「オーケストレーター」に含まれる役割の1つである「リレイヤー」の要件に焦点を当てています。

## バリデーターセット更新リレーのセマンティクス

### バリデーターセットと署名の並べ替えと順序付け

Gravityコントラクトのバリデーターセットを更新するときは、古いバリデーターセットのコピーを提供する必要があります。この_MUST_は、イーサリアムチェーンの最後のValsetUpdatedイベントからのみ取得されます。

古いバリデーターセットを提供することは、ストレージ最適化の一部であり、バリデーターセット全体をイーサリアムストレージに保存する代わりに、各呼び出し元によって提供され、はるかに安価なイーサリアムイベントキューに保存されます。 Gravityコントラクトでは、いかなる種類のソートも実行されません。つまり、バリデーターのリストとその新しい署名は、最後の呼び出しとまったく同じ順序で送信する必要があります。

通常の操作の目的で、この要件を短縮して、「電力の降順、および電力が等しいE番目のアドレスバイトでバリデーターをソートする」ことができます。 Cosmosモジュールはバリデーターセットを生成するので、それらは常に順番に並んでいる必要があります。しかし、ソートされていないバリデーターセットがチェーンに入る原因となったこのソート方法の欠陥は、実装がソートに盲目的に続くのではなく、最後に送信された注文を確認するのに十分賢くない限り、valsetの更新を停止し、本質的にブリッジを切り離します。

### どのバリデーターがリレーに設定するかを決定する

Cosmosチェーンは、バリデーターセットのストリームを生成するだけであり、それらがどのように中継されるかについては何の判断もしません。この中継操作のガスコストを最適化する方法を決定するのは、中継器の実装次第です。

たとえば、ストア内の最後のGravityバリデーターセットスナップショットと現在アクティブなバリデーターセットの間に5％の電力差がある場合に、バリデーターセット `A、B、C、およびD`がそれぞれ作成されたとします。

5％は任意の定数です。ここで選択された特定の値は、Ethereumバリデーターセットがどれだけ最新であるかと、それを最新の状態に保つためのコストとの間のチェーンによって行われるトレードオフです。この値が高いほど、最悪の場合にブリッジをハイジャックするために必要な投票バリデーターセットの部分が少なくなります。 66％が共謀する必要があるブロックごとに新しいバリデーターセットを更新した場合、5％の変更しきい値は、特定のバリデーターセットで共謀する総投票権の61％がブリッジの資金を盗むことができる可能性があることを意味します。

```
A -> B -> C -> D
     5%  10%   15%
```

中継者は、Gravity Ethereumコントラクトのイベント履歴を反復処理する必要があります。これにより、バリデーターセットAが現在Gravityブリッジにあると判断されます。バリデーターセットB、C、Dのいずれかを中継するか、バリデーターセットDを送信するかを選択できます。すべてのバリデーターがDに署名している場合、66％以上の投票権があり、独自に渡すことができます。中間セットを中継するためにEThereumで潜在的にさらに数百ドルを支払うことなく。

トランザクションを送信する前に、何らかの方法でこのチェックをローカルで実行することは、費用効果の高いリレーの実装に不可欠です。ローカルのイーサリアム署名実装を使用してパワーと署名を自分で合計するか、単に `eth_call()`イーサリアムRPCを使用してEThereumノードでの呼び出しをシミュレートすることができます。

`eth_call()`にはしばしば面白い落とし穴があることに注意してください。ガスの代金を支払うイーサリアムがない場合、Gethベースの実装ではすべての呼び出しが失敗しますが、Parityベースの実装では、ガス入力はほとんど無視され、正確なガス使用量が返されます。

##トランザクションバッチリレーのセマンティクス

トランザクションバッチを送信するには、[バリデーターセットセクション](###バリデーターセットと署名の並べ替えと順序付け)で概説されているように、バリデーターの最後のセットとその権限も送信する必要があります。これは、ここで説明したのと同じストレージの最適化を容易にするためです。

### リレーするバッチを決定する

どのバッチをリレーするかを決定することは、どのバリデーターをリレーするように設定するかを決定することとは大きく異なります。バッチリレーは、ブリッジの整合性を維持したいという願望ではなく、主に料金によって動機付けられます。したがって、決定は主に料金の計算に帰着します。これは、「バッチ要求」の概念によってさらに複雑になります。これは、Gravityモジュールが特定のトークンタイプの新しいバッチを生成することを要求する許可されていないトランザクションです。

バッチリクエストは、リレーラーが実際にトークンをリレーすることに関心を示すまで、ユーザーがいつでもイーサリアムtxプールへの送信からトークンを引き出すことができるように設計されています。トランザクションがプール内にある間、ユーザーがMsgCancelSendToEthを送信してトランザクションを撤回することを許可されている場合、二重支払いのリスクはありません。 「リクエストバッチ」が原因でトランザクションがバッチに入ると、Oracleは、ユーザートークンを含むバッチが送信に対して何らかの理由で無効になったか、実行されたことをGravityモジュールに通知するまで、ユーザーの資金をロックしたままにする必要があります。イーサリアムで。

中継者はクエリエンドポイント `BatchFees`を使用して、トークンタイプごとにEth txプールへの送信を繰り返します。次に、中継者はdexで中継されているERC20トークンの価格を監視し、バッチを実行するためのガスコストを計算できます( `eth_call()`)と、必要に応じてdexで収益を清算するためのガスコスト。中継者がバッチが良好で収益性があると判断すると、 `MsgRequestBatch`を送信でき、中継者が中継するためのバッチが作成されます。

既存のバッチもあり、中継者も収益性を判断し、ほぼ同じ方法で中継を試みる必要があります。