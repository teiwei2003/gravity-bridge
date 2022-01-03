# メッセージ

このセクションでは、重力メッセージの処理とそれに対応する状態の更新について説明します。各メッセージで指定されたすべての作成/変更された状態オブジェクトは、[state](./02_state_transitions.md)セクション内で定義されます。

### MsgDelegateKeys

バリデーターが投票の責任を特定のキーに委任できるようにします。このキーは、オラクルクレームを認証するために使用できます。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L38-L40

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L56-60

このメッセージは、次の場合に失敗すると予想されます。

-バリデーターアドレスが正しくありません。
  -アドレスが空です( `" "`)
  -20の長さではありません
  -Bech32デコードが失敗する
-オーケストレーターのアドレスが正しくありません。
  -アドレスが空です( `" "`)
  -20の長さではありません
  -Bech32デコードが失敗する
-イーサリアムアドレスが正しくありません。
  -アドレスが空です( `" "`)
  -長さ42ではありません
  -0xで始まらない
-バリデーターがバリデーターセットに存在しません。

### MsgSubmitEthereumTxConfirmation

重力デーモンが重力モジュール内の完全なバリデーターセットを目撃すると、バリデーターはバリデーターセット全体を含むメッセージの署名を送信します。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L79-84

このメッセージは、次の場合に失敗すると予想されます。

-バリデーターセットが存在しない場合。
-署名が正しくエンコードされていません。
-イーサリアムキーの署名検証が失敗します。
-提出された署名がすでに提出されている場合。
-バリデーターアドレスが正しくありません。
  -アドレスが空です( `" "`)
  -20の長さではありません
  -Bech32デコードが失敗する


### MsgSendToEthereum

ユーザーがアセットをEVMにブリッジしたい場合。トークンがコスモスチェーンから発信された場合、モジュールアカウントに保持されます。トークンが元々イーサリアムからのものである場合、それはコスモス側で燃やされます。

>注:このメッセージは、後でバッチに含まれるときに削除されます。


+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L100-109

このメッセージは次の場合に失敗します。

-送信者アドレスが正しくありません。
  -アドレスが空です( `" "`)
  -20の長さではありません
  -Bech32デコードが失敗する
-デノムはサポートされていません。
-トークンがコスモス起源の場合
  -モジュールアカウントへのトークンの送信に失敗します
-トークンがコスモス以外のものである場合。
  -モジュールアカウントへの送信が失敗した場合
  -トークンの書き込みが失敗した場合

### MsgRequestBatchTx

十分な数のトランザクションがバッチに追加されると、ユーザーまたは検証者は、ブリッジを介してトランザクションのバッチを送信するために、このメッセージの送信を呼び出すことができます。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L122-125

このメッセージは次の場合に失敗します。

-デノムはサポートされていません。
-トランザクションのバッチの構築に失敗しました。
-オーケストレーターアドレスがバリデーターセットに存在しない場合

### MsgConfirmBatch

`MsgRequestBatchTx`が観察された場合、バリデーターはバッチリクエストに署名して、これが悪意を持って作成されたバッチではないことを示し、スラッシュが発生しないようにする必要があります。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L137-143

このメッセージは次の場合に失敗します。

-バッチが存在しません
-チェックポイントの生成が失敗した場合
-バリデーターなしのアドレスまたは委任されたアドレスの場合
-カウンタチェーンアドレスが空または正しくない場合。
-カウンターチェーンアドレスが署名の検証に失敗した場合
-署名が前のメッセージですでに提示されている場合

### MsgConfirmLogicCall

論理呼び出し要求が行われた場合、それはブリッジバリデーターによって確認される必要があります。各バリデーターは、実行されているロジック呼び出しの確認を送信する必要があります。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L155-161

このメッセージは次の場合に失敗します。

-IDエンコーディングが正しくありません
-確認された発信ロジック呼び出しが見つかりません
-無効なチェックポイントの生成
-署名のデコードに失敗しました
-この関数を呼び出すアドレスは、バリデーターまたはその委任されたキーではありません
-カウンターチェーンアドレスが正しくないか、空です
-カウンターパーティの署名の検証に失敗しました
-重複する署名が観察されます

### MsgDepositClaim

重力契約に資金を預けるためのメッセージが作成されると、イベントは省略され、預け入れを確認するメッセージが送信されます。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L170-181

このメッセージは次の場合に失敗します。

-バリデーターは不明です
-バリデーターがアクティブセットにありません
-アテステーションの作成が失敗した場合

### MsgWithdrawClaim

ユーザーが重力契約からの撤退を要求すると、カウンターパーティチェーンによってイベントが省略されます。このイベントは、ブリッジバリデーターによって監視され、重力モジュールに送信されます。


+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L187-193

このメッセージは次の場合に失敗します。

-バリデーターは不明です
-バリデーターがアクティブセットにありません
-アテステーションの作成が失敗した場合

### MsgERC20DeployedClaim

このメッセージにより、コスモスチェーンはカウンターパーティチェーンからデノムに関する情報を学習できます。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L200-209

このメッセージは次の場合に失敗します。

-バリデーターは不明です
-バリデーターがアクティブセットにありません
-アテステーションの作成が失敗した場合

### MsgLogicCallExecutedClaim

これは、ロジック呼び出しが実行されたことをチェーンに通知します。このメッセージは、ブリッジバリデーターがロジックコールに関する詳細を含むイベントを監視したときに送信されます。

+++ https://github.com/althea-net/cosmos-gravity-bridge/blob/main/module/proto/gravity/v1/msgs.proto#L215-221

このメッセージは次の場合に失敗します。

-クレームを提出したバリデーターは不明です
-バリデーターがアクティブセットにありません
-アテステーションの作成に失敗しました。