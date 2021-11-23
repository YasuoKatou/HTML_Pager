# 目次

- [外部インターフェース一覧](#外部インターフェース一覧)
- [テーブル一覧](#テーブル一覧)

## 外部インターフェース一覧

|No|機能名|機能ID|
|:-:|:--|:--|
|1-1|[カテゴリ取得](#カテゴリ取得)|read_category|
|1-2|[カテゴリ追加](#カテゴリ追加)|add_category|
|2-1|[TODO取得](#todo取得)|read_todo|
|2-2|[TODOタイトル登録](#todoタイトル登録)|add_todo|
|2-3|[TODOタイトル更新](#todoタイトル更新)|update_todo|
|2-4|[TODOステータス更新](#todoステータス更新)|update_status|
|2-9|[TODO削除](#todo削除)|delete_todo|
|3-1|[TODOコメント登録](#todoコメント登録)|add_comment|
|3-2|[TODOコメント更新](#todoコメント更新)|update_comment|
|3-9|[TODOコメント削除](#todoコメント削除)|delete_comment|
|4-1|[タグの取得](#タグの取得)|read_tags|
|4-2|[タグの登録](#タグの登録)|add_tag|
|4-3|[TODOタグの登録](#todoタグの登録)|set_todo_tag|

### カテゴリ取得

- リクエスト（read_category）  
  なし

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|カテゴリ情報|category_list|配列|(1)参照|

    (1) カテゴリ情報
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|カテゴリID|id|数字||
    |2|カテゴリ名|name|文字列||
    |3|未着手数|num1|数字||
    |4|着手数|num2|数字||
    |5|完了数|num3|数字||

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### カテゴリ追加

- リクエスト（add_category）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|カテゴリ名|category_name|文字列||

- レスポンス  
  カテゴリ取得．レスポンスと同じ

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODO取得

- リクエスト（read_todo）  
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|取得カテゴリID|category_id|数字||

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO一覧|todo_list|配列|(1)参照|
  |2|TODO状態一覧|status_list|配列|(2)参照|

    (1) TODO項目
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|TODO情報|summary|オブジェクト|(1-1)参照|
    |2|コメント情報一覧|comments|配列|(1-2)参照|
    |3|タグ情報一覧|tags|配列|(1-3)参照|

    (1-1) TODO情報
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|TODO ID|id|数字||
    |2|TODO タイトル|title|文字列||
    |3|TODO 状態|status|数字||
    |4|登録日時|date1|文字列||
    |5|更新日時|date2|文字列||

    (1-2) コメント情報
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|コメント ID|id|数字||
    |2|TODO コメント|content|文字列||

    (1-3) タグ情報
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|タグ ID|id|数字||
    |2|TODO タグ名|name|文字列||

    (2) TODO状態一覧
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|状態ID|id|数字|
    |2|状態名|name|文字列|

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOタイトル登録

- リクエスト（add_todo）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|タイトル|title|文字列||
  |2|仮ID|temp-id|文字列||
  |3|カテゴリID|category-id|数字||

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|仮ID|temp-id|文字列|[リクエスト].仮ID|
  |2|ID|id|数値|登録したID|
  |3|登録日時|date1|文字列||
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
  |1|ID|id|数値|[リクエスト].ID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOステータス更新

- リクエスト（update_status）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO ID|id|数字||
  |2|TODO状態|status|数字||

- レスポンス  
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO ID|id|数字||
  |2|TODO状態|status|数字||
  |3|更新日時|date2|文字列||

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODO削除

- リクエスト（delete_todo）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|id|数字|削除するTODO ID|

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|ID|id|数値|[リクエスト].TODO_ID|

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOコメント登録

- リクエスト（add_comment）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|todo-id|数字||
  |2|コメント|comment|文字列||
  |3|仮ID|temp-id|文字列||

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO ID|todo-id|文字列|[リクエスト].TODO_ID|
  |2|仮ID|temp-id|文字列|[リクエスト].仮ID|
  |3|ID|id|数値|登録したコメントのID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOコメント更新

- リクエスト（update_comment）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO ID|todo-id|数字||
  |2|コメント ID|id|数字||
  |3|コメント|comment|文字列|更新文字列|

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO ID|todo-id|数字|[リクエスト].TODO ID|
  |2|コメント ID|id|文字列|[リクエスト].コメント ID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOコメント削除

- リクエスト（delete_comment）
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|todo-id|数字|削除するコメントのTODO ID|
  |2|ID|id|数字|削除するコメントID|

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|todo-id|文字列|[リクエスト].TODO_ID|
  |2|ID|id|文字列|[リクエスト].ID|
[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### タグの取得

- リクエスト（read_tags）  
なし

- レスポンス
  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|タグ一覧|tags|配列|(1)参照|

  　(1) item
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|タグのID|id|数字||
    |2|タグ名称|name|文字列||

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### タグの登録

- リクエスト（add_tag）
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|タグ名称|tag-name|文字列||

- レスポンス  
  [タグの取得](#タグの取得)のレスポンスと同じ

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

### TODOタグの登録

- リクエスト（set_todo_tag）  
  |No|項目名称|物理名|型|説明|
  |:-:|:--|:--|:--|:--|
  |1|TODO_ID|todo-id|文字列||
  |2|タグ一覧|tags|item配列|(1)参照|

  　(1) item
    |No|項目名称|物理名|型|説明|
    |:-:|:--|:--|:--|:--|
    |1|タグのID|id|数字||

- レスポンス  
  リクエストと同じ  

[↑ 外部インターフェース一覧](#外部インターフェース一覧)

***
## テーブル一覧

|No|テーブル名称|物理名|説明|
|:-:|:--|:--|:--|
|1|[カテゴリ](#カテゴリテーブル)|TODO_CATEGORY|TODOのカテゴリを保持する|
|2|[カテゴリ一覧](#カテゴリ一覧テーブル)|TODO_CATEGORIES|各TODOのカテゴリ保存する|
|3|[TODOタイトル](#todoタイトルテーブル)|TODO_TITLE|TODOのタイトルを保存する|
|4|[コメント](#コメントテーブル)|TODO_COMMENT|TODOのコメントを保持する|
|5|[タグ](#タグテーブル)|TODO_TAG|TODOのタグを保持する|
|6|[タグ一覧](#タグ一覧テーブル)|TODO_TAGS|TODOごとのタグを保持する|
|7|[状態](#状態テーブル)|TODO_STATUS|TODOの状態一覧|

### カテゴリテーブル
|No|カラム名称|物理名|説明|新規|更新|削除|
|:-:|:--|:--|:--|:-:|:-:|:-:|
|1|ID|id||A|○|○|
|2|カテゴリ名|name||○|○||
|3|登録日時|create_ts||○|-|-|
|4|更新日時|update_ts||○|○|-|

```
create table TODO_CATEGORY (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(256) NOT NULL,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```
[↑ テーブル一覧](#テーブル一覧)

### カテゴリ一覧テーブル
|No|カラム名称|物理名|説明|新規|削除|
|:-:|:--|:--|:--|:-:|:-:|
|1|カテゴリID|category_id||○|○|
|2|TODO ID|todo_id||○|-|
|3|登録日時|create_ts||○|-|
|4|更新日時|update_ts||○|-|

```
create table TODO_CATEGORIES (
    category_id INTEGER NOT NULL,
    todo_id INTEGER NOT NULL,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```
[↑ テーブル一覧](#テーブル一覧)

### TODOタイトルテーブル

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

|No|カラム名称|物理名|説明|新規|更新|TODO削除|コメント削除|
|:-:|:--|:--|:--|:-:|:-:|:-:|:-:|
|1|ID|id||A|-|-|○|
|2|TODO ID|todo_id||○|-|○|-|
|3|コメント|comment||○|○|-|-|
|4|登録日時|create_ts||○|-|-|-|
|5|更新日時|update_ts||○|○|-|-|

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

### 状態テーブル  
システムの初期起動でデータを登録しメンテナンスしない.

|No|カラム名称|物理名|説明|
|:-:|:--|:--|:--|
|1|状態ID|id||
|2|状態名|name||
|3|表示順|seq||
|4|登録日時|create_ts||
|5|更新日時|update_ts||

```
create table TODO_STATUS (
    id INTEGER NOT NULL UNIQUE,
    name VARCHAR(16) NOT NULL,
    seq INTEGER NOT NULL,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
create index TODO_STATUS_idx1 on TODO_STATUS(seq)
insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values
 (0, '未着手', 1, now, now)
insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values
 (10, '着手', 10, now, now)
insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values
 (20, '完了', 20, now, now)
```
[↑ テーブル一覧](#テーブル一覧)

***
## 課題
- TODOのカテゴリを実装（カテゴリの編集機能）
- 登録／更新日時を表示
- TODOタイトルの登録中がわかるようにスタイルを設定したい（文字色をグレーにするとか）
- TODOコメントの登録中がわかるようにスタイルを設定したい（文字色をグレーにするとか）
  