## Building

最初の実行時:
proto-update-depsを作成します
プロトツールを作成する
構築するには:
作る

## 初期のMVP

ハッピーパスの実装

### Oracle

#### 前提条件

-オーケストレーターは、メッセージを使用して複数のクレームを送信したい場合があります(撤回バッチ更新+ MultiSigセット更新)
-ナンスはコンテキストなしでは一意ではありません(撤回ナンスとMultiSigセットの更新は同じナンス(=高さ)を持つことができます)
-ナンスはそのコンテキストで一意であり、再利用されることはありません
-同じETHイベントに対するオーケストレーターによる複数のクレームは禁止されています
-事前にETHイベントタイプを知っています(そしてそれらをClaimTypesとして扱います)
-アテステーションの**監視**ステータスの場合、電力とカウントのしきい値を超える必要があります
-分数タイプでは、％よりも高精度の計算が可能です。たとえば2/3

プロセスに従うための良いスタートは、 `x/gravity/handler_test.go`ファイルです。

### 送信TXプール

#### 特徴

-コスモスの重力バウチャーのユニークな分母(🚧v0.38.4のSDKの制限により、15文字にカットされ、セパレーターはありません)
-バウチャーの燃焼🔥(テストでの造幣⛏️)
-ブリッジされたETH分母と契約を保存/解決する
-永続的なトランザクションプール
-手数料でソートされたトランザクション(2番目のインデックス)
-拡張テストセットアップ

#### 前提条件

-chainIDとETHの契約は1つだけです

### 送信TXをバッチにバンドル

#### 特徴

-`OutgoingTransferTx`と `TransferCoin`を含む` BatchTx`タイプ
-料金の説明注文に基づいて保留中のTXからバッチを構築するロジック
-バッチをキャンセルし、TXを保留中のプールに戻すロジック
-`nonces`に使用されるバッチのインクリメンタルで一意のID
-ファーストクラスタイプとしての `VoucherDenom`

## カバーされていない/実装されていない

-[]不幸な事件
-[]適切なユニット+統合テスト
-[]メッセージの検証
-[]ジェネシスI/O
- [ ] パラメーター
-[] authZ:EthereumChainIDがホワイトリストに登録されました
-[] authZ:ブリッジ契約アドレスがホワイトリストに登録されました