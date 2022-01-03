# スラッシュスペック

このファイルは、Gravityで使用するさまざまなスラッシュ条件に名前を付けて文書化します。

## GRAVSLASH-01:偽のバリデーターセットまたはtxバッチ証拠に署名する

このスラッシュ条件は、バリデーターがCosmosに存在したことのないバリデーターセットとナンスに署名するのを防ぐことを目的としています。これは証拠メカニズムを介して機能し、誰でも偽のバリデーターセットを介してバリデーターの署名を含むメッセージを送信できます。これは、偽のバリデーターセットを提出することを意図してバリデーターのカルテルが形成された場合、1人の亡命者がそれらすべてを大幅に削減できるという効果を生み出すことを目的としています。

**実装に関する考慮事項:**

このスラッシュ条件の最も難しい部分は、バリデーターセットがCosmosに存在したことがないことを確認することです。スペースを節約するために、古いバリデーターセットをクリーンアップする必要があります。 KVストアでバリデーターセットハッシュのマッピングをtrueに維持し、それを使用してバリデーターセットが存在したかどうかを確認できます。これは、バリデーターセット全体を保存するよりも効率的ですが、その成長には制限がありません。他の暗号化方式を使用して、このマッピングのサイズを削減できる可能性があります。このマッピングから非常に古いエントリをプルーニングしても問題ない場合がありますが、プルーニングを行うと、このスラッシュ条件の抑止力が低下します。

## GRAVSLASH-02:バリデーターセットの更新またはtxバッチへの署名に失敗しました

このスラッシュ条件は、バリデーターがGravityCosmosモジュールによって生成されたバリデーターセットの更新またはトランザクションバッチに署名しない場合にトリガーされます。これにより、2つの悪いシナリオが防止されます-

1.バリデーターは、システム上で正しいバイナリーを実行し続けることを気にしません。
2. 1/3を超えるバリデーターのカルテルは、結合を解除してから更新への署名を拒否し、バリデーターセットの更新がGravityEthereum契約に送信するのに十分な署名を取得できないようにします。 Cosmosの非結合期間より長くバリデーターセットの更新を妨げた場合、偽のバリデーターセットの更新とtxバッチ(GRAVSLASH-01およびGRAVSLASH-02)を送信したことで罰せられることはなくなります。

シナリオ2に対処するために、GRAVSLASH-02は、検証を行っていないが、まだ結合解除期間にあるバリデーターもスラッシュする必要があります。これは、バリデーターがバリデーターセットを離れるとき、2週間機器を実行し続ける必要があることを意味します。これはCosmosチェーンでは珍しく、バリデーターによって受け入れられない場合があります。結合解除期間が完全に終了する前にバリデーターが署名を停止できるようにする方法についての研究が進行中です。

## GRAVSLASH-03:誤ったEthオラクルクレームを送信-意図的に実装されていません

イーサリアムのオラクルコード(現在、ほとんどがattestation.goに含まれています)は、Gravityの重要な部分です。これにより、Gravityモジュールは、デポジットや実行されたバッチなど、イーサリアムで発生したイベントを知ることができます。 GRAVSLASH-03は、イーサリアムで発生したことのないイベントの申し立てを提出したバリデーターを罰することを目的としています。

**実装に関する考慮事項**

イーサリアムでイベントが発生したかどうかを知る唯一の方法は、イーサリアムイベントオラクル自体を使用することです。したがって、このスラッシュ条件を実装するために、バリデーターの2/3以上によって観察されたイベントと同じナンスで、異なるイベントのクレームを送信したバリデーターをスラッシュします。

善意ではありますが、このスラッシュ条件は、Gravityのほとんどのアプリケーションにはお勧めできません。これは、インストールされているCosmosチェーンの機能をEthereumチェーンの正しい機能に結び付けるためです。イーサリアムチェーンの深刻な分岐点がある場合、正直に振る舞うさまざまなバリデーターは、同じイベントナンスでさまざまなイベントを確認し、独自の過失によって大幅に削減される可能性があります。広範囲にわたる不当な斬撃は、コスモスチェーンの社会構造に非常に混乱をもたらすでしょう。

たぶんGRAVSLASH-03はまったく必要ありません:

このスラッシュ条件の実際の有用性は、バリデーターの2/3以上がカルテルを形成して、すべてが特定のナンスで偽のイベントを送信する場合、一部のバリデーターがカルテルから脱落して実際のイベントを送信できるようにすることです。そのナンスで。実際のイベントが観察されるのに十分な数の欠陥のあるカルテルメンバーがいる場合、残りのカルテルメンバーはこの条件によって大幅に削減されます。ただし、これには、ほとんどの条件でカルテルメンバーの1/2以上が欠陥を起こす必要があります。

カルテルの欠陥が十分でない場合、どちらのイベントも観察されず、イーサリアムのオラクルはただ停止します。これは、GRAVSLASH-03が実際にトリガーされるシナリオよりもはるかに可能性の高いシナリオです。

また、カルテルが成功した場合、GRAVSLASH-03は正直なバリデーターに対してトリガーされます。これは、形成中のカルテルが参加したくないバリデーターを脅かすのを容易にするように機能する可能性があります。

## GRAVSLASH-04:Ethoracleクレームの送信に失敗しました

これはGRAVSLASH-03に似ていますが、観察されたオラクルクレームを送信しないバリデーターに対してトリガーされます。 GRAVSLASH-03とは対照的に、GRAVSLASH-04は、オラクルへの参加を完全に停止したバリデーターを罰することを目的としています。

**私補足に関する考慮事項**

残念ながら、GRAVSLASH-04には、Cosmosチェーンの正しい動作をEthereumチェーンに結び付けるという点で、GRAVSLASH-03と同じ欠点があります。また、それは正しい行動の方法であまりインセンティブを与えない可能性があります。 GRAVSLASH-04のトリガーを回避するには、バリデーターは、観察されることに近いクレームをコピーする必要があります。このクレームのコピーは、commit-revealスキームによって防ぐことができますが、「レイジーバリデーター」がパブリックEthereumフルノードまたはブロックエクスプローラーを使用するだけで、セキュリティに同様の影響を与えることは簡単です。したがって、GRAVSLASH-04の実際の有用性はおそらく最小限です

GRAVSLASH-03およびGRAVSLASH-04がない場合、Ethereumイベントオラクルは、バリデーターの2/3以上が自発的に正しいクレームを送信した場合にのみ機能し続けます。 GRAVSLASH-03とGRAVSLASH-04に対する議論は説得力がありますが、この事実に満足しているかどうかを判断する必要があります。チェーンのパラメータでGRAVSLASH-03とGRAVSLASH-04を有効または無効にできるようにする必要があります。