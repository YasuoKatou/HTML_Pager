# 目次

- [外部インターフェース一覧](#外部インターフェース一覧)
- [テーブル一覧](#テーブル一覧)

## 外部インターフェース一覧

|No|機能名|機能ID|
|:-:|:--|:--|
|1-1|[TODOタイトル登録](#todoタイトル登録)|add_todo|
|1-2|[TODOタイトル更新](#todoタイトル更新)|update_todo|
|1-9|[TODO削除](#todo削除)|delete_todo|
|2-1|[TODOコメント登録](#todoコメント登録)|add_comment|
|2-2|[TODOコメント更新](#todoコメント更新)|update_comment|

### TODOタイトル登録

- リクエスト（add_todo）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|タイトル|title|文字列||
  |2|仮ID|temp-id|文字列||

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|仮ID|temp-id|文字列|リクエスト.仮ID|
  |2|ID|id|数値|登録したID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOタイトル更新

- リクエスト（update_todo）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|ID|id|文字列||
  |2|タイトル|title|文字列|更新文字列|

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|ID|id|数値|更新したID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODO削除

- リクエスト（delete_todo）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|id|文字列|削除するTODO ID|

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|ID|id|数値|削除したTODO ID|

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOコメント登録

- リクエスト（add_comment）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|todo-id|文字列||
  |2|コメント|comment|文字列||
  |3|仮ID|temp-id|文字列||

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO ID|todo-id|文字列|リクエスト.TODO_ID|
  |2|仮ID|temp-id|文字列|リクエスト.仮ID|
  |3|ID|id|数値|登録したコメントのID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOコメント更新

- リクエスト（update_comment）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|ID|id|文字列|コメントID|
  |2|コメント|comment|文字列|更新文字列|

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|ID|id|文字列|リクエスト.コメントID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

***
## テーブル一覧

|No|テーブル名称|物理名|説明|
|:-:|:--|:--|:--|
|1|[タイトル](#タイトルテーブル)|TODO_TITLE|TODOのタイトルを保存する|
|2|[コメント](#コメントテーブル)|TODO_COMMENT|TODOのコメントを保持する|
|3|[タグ](#タグテーブル)|TODO_TAG|TODOのタグを保持する|
|4|[タグ一覧](#タグ一覧テーブル)|TODO_TAGS|TODOごとのタグを保持する|

### タイトルテーブル

|No|カラム名称|物理名|説明|新規|更新|削除|
|:-:|:--|:--|:--|:-:|:-:|:-:|
|1|ID|id||A|-|○|
|2|タイトル|title||○|○|-|
|3|状態|status||-|○|-|
|4|登録日時|create_ts||○|-|-|
|5|更新日時|update_ts||○|○|-|

```
create table TODO_TITLE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(256) NOT NULL,
    status INTEGER NOT NULL DEFAULT 0,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```
[↑ テーブル一覧](#テーブル一覧)

### コメントテーブル

|No|カラム名称|物理名|説明|新規|更新|削除|
|:-:|:--|:--|:--|:-:|:-:|:-:|
|1|ID|id||A|-|-|
|2|TODO ID|todo_id||○|-|○|
|3|コメント|comment||○|○|-|
|4|登録日時|create_ts||○|-|-|
|5|更新日時|update_ts||○|○|-|

```
create table TODO_COMMENT (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    todo_id INTEGER NOT NULL,
    comment VARCHAR(2048) NOT NULL,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```
[↑ テーブル一覧](#テーブル一覧)

### タグテーブル

|No|カラム名称|物理名|説明|新規|更新|
|:-:|:--|:--|:--|:-:|:-:|
|1|ID|id||A|-|
|2|タグ名称|tag_name||○|○|
|3|登録日時|create_ts||○|-|
|4|更新日時|update_ts||○|○|

```
create table TODO_TAG (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_name VARCHAR(64) NOT NULL UNIQUE,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
create index TODO_TAG_idx1 on TODO_TAG(tag_name)
```
[↑ テーブル一覧](#テーブル一覧)

### タグ一覧テーブル

|No|カラム名称|物理名|説明|新規|更新|削除|
|:-:|:--|:--|:--|:-:|:-:|:-:|
|1|TODO ID|todo_id||○|-|○|
|2|タグID|tag_id||○|-|-|
|3|登録日時|create_ts||○|-|-|
|4|更新日時|update_ts||○|-|-|

```
create table TODO_TAGS (
    todo_id INTEGER,
    tag_id INTEGER,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
create index TODO_TAGS_idx1 on TODO_TAGS(todo_id)
```
[↑ テーブル一覧](#テーブル一覧)

***
## 課題
- コメントの複数行入力
- TODOのステータスの変更
- ラベルの登録
- ラベルの選択
- 登録／更新日時を表示
- TODOタイトルの登録中がわかるようにスタイルを設定したい（文字色をグレーにするとか）
- TODOコメントの登録中がわかるようにスタイルを設定したい（文字色をグレーにするとか）
  