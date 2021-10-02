## テーブル一覧

|No|テーブル名称|物理名|説明|
|:-:|:--|:--|:--|
|1|タイトル|TODO_TITLE|TODOのタイトルを保存する|
|2|コメント|TODO_COMMENT|TODOのコメントを保持する|
|3|タグ|TODO_TAG|TODOのタグを保持する|
|4|タグ一覧|TODO_TAGS|TODOごとのタグを保持する|

### タイトルテーブル（TODO_TITLE）

|No|カラム名称|物理名|説明|新規|更新|
|:-:|:--|:--|:--|:-:|:-:|
|1|ID|id||○|-|
|2|タイトル|title||○|○|
|3|状態|status||-|○|
|4|登録日時|create_ts||○|-|
|5|更新日時|update_ts||○|○|

```
create table TODO_TITLE (
    id INTEGER PRIMARY KEY,   -- AUTOINCREMENT
    title VARCHAR(256) NOT NULL,
    status INTEGER NOT NULL DEFAULT 0,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```

### コメントテーブル（TODO_COMMENT）

|No|カラム名称|物理名|説明|新規|更新|
|:-:|:--|:--|:--|:-:|:-:|
|1|ID|id||○|-|
|2|TODO ID|todo_id||○|-|
|3|コメント|comment||○|○|
|4|登録日時|create_ts||○|-|
|5|更新日時|update_ts||○|○|

```
create table TODO_COMMENT (
    id INTEGER PRIMARY KEY,   -- AUTOINCREMENT
    todo_id INTEGER NOT NULL,
    comment VARCHAR(2048) NOT NULL,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```

### タグテーブル（TODO_TAG）

|No|カラム名称|物理名|説明|新規|更新|
|:-:|:--|:--|:--|:-:|:-:|
|1|ID|id||○|-|
|2|タグ名称|tag_name||○|○|
|3|登録日時|create_ts||○|-|
|4|更新日時|update_ts||○|○|

```
create table TODO_TAG (
    id INTEGER PRIMARY KEY,   -- AUTOINCREMENT
    tag_name VARCHAR(64) NOT NULL UNIQUE,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
create index TODO_TAG_idx1 on TODO_TAG(tag_name)
```

### タグ一覧テーブル（TODO_TAGS）

|No|カラム名称|物理名|説明|新規|更新|
|:-:|:--|:--|:--|:-:|:-:|
|1|TODO ID|todo_id||○|-|
|2|タグID|tag_id||○|-|
|3|登録日時|create_ts||○|-|
|4|更新日時|update_ts||○|-|

```
create table TODO_TAGS (
    todo_id INTEGER,
    tag_id INTEGER,
    create_ts TEXT NOT NULL,
    update_ts TEXT NOT NULL
)
```
