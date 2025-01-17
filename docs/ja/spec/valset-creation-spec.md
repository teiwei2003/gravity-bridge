# バリデーターセットの作成

Gravityで「valset」とは、「validator set update」を意味します。これは、Gravity Ethereumコントラクトで設定されたCosmosバリデーターを表すために使用される、正規化されたパワーが付加された一連のイーサリアムアドレスです。 Cosmosバリデーターセットは頻繁に変更される可能性があります。

バリデーターセットの作成は、Gravityシステムの重要な部分です。目標は、イーサリアム契約にあるものに関係なく、イーサリアム契約を現在のコスモスと同期するための正しく署名された状態更新(以前の投票権の66％以上)の途切れのないチェーンが存在するように、十分なバリデーターセットを作成して署名することですバリデーターセット。

valsetの作成を理解するための鍵は、一方が他方と完全に同期することは*絶対に不可能*であることを理解することです。コスモスチェーンにはファイナリティがありますが、イーサリアムよりもはるかに高速にブロックを生成するため、バリデーターセットはイーサリアムブロック間で完全に6回変更される可能性があります。他の方向では、イーサリアムにはファイナリティがないため、コスモスチェーンがイーサリアムで何が起こったかを知る前にかなりのブロック遅延があります。これらの基本的な制限のために、「イーサリアムの最後の状態」を決定するのではなく、生成されたバリデーターセットの継続性に焦点を当てています。

### リクエストがない場合は、新しいリクエストを作成します
2.現在のブロックで結合解除を開始したバリデーターが少なくとも1つある場合。 (hooks.goで最後の非結合ブロックの高さを保持します)
これにより、非結合バリデーターが新しいValsetに証明書を提供する必要があります。
彼が完全に解き放つ前に彼を除外します。そうでなければ、彼は斬られます
3.CurrentValsetのバリデーターと最新のvalset要求の間の電力変化が> 5％の場合