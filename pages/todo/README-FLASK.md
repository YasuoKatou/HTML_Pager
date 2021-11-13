# サーバのＦ／Ｗにflaskを採用したサーバの構築

今回本格的なサーバ構築の実装を試みました。その内容を下記に備忘録として残します。

テーマ１：静的ファイルは、Web サーバで処理（クライアントに戻す）  
テーマ２：クライアントからのPOSTリクエスト（JSON）のみをしょりする  

[リンク](http://localhost/HTML_Pager/)

## 関連図

```
クライアント（Web ブラウザ）
　　↓　　　　↑   (json)
Web サーバ（nginx）
　　↓　　　　↑   (proxy_pass http://127.0.0.1:9090;)
uwsgi（Cygwin）
　　↓　　　　↑   (flask)
TODO サーバ
　　↓　　　　↑   (psycopg2)
PostgreSQL
```

### nginx の設定（nginx.conf）

```
        location = /HTML_Pager/ {
            index  todo.html;
            allow all;
        }
        location ~ /HTML_Pager/(.+\.(?:|js|css|png|html)$)$ {
            allow all;
        }
        location ~ /HTML_Pager/.+$ {
            rewrite ^/HTML_Pager/(.+)$ /$1 break;
            include uwsgi_params;
            proxy_pass http://127.0.0.1:9090;
        }
```

### uwsgi の起動

セキュリティ上ＤＢの接続情報は掲載しません。

```
$ export TODO_DB_DNS=postgresql://{DB user}:{password}@{hostname}:{port no}/{db name}
$ export TARGET_APP_ROOT=/cygdrive/z/nginx/nginx-1.20.1/html/HTML_Pager
$ uwsgi --http 0.0.0.0:9090 --wsgi-file $TARGET_APP_ROOT/pages/test/server/todo_server_flask.py --callable todoApp
```

### ＤＢ

* カテゴリテーブル
    ```
    create table TODO_CATEGORY (
        id serial PRIMARY KEY,
        name VARCHAR(256) NOT NULL,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    ```

* カテゴリ一覧テーブル
    ```
    create table TODO_CATEGORIES (
        category_id INTEGER NOT NULL,
        todo_id INTEGER NOT NULL,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    ```

* TODOタイトル
    ```
    create table TODO_TITLE (
        id serial PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        status INTEGER NOT NULL DEFAULT 0,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    ```

* コメントテーブル
    ```
    create table TODO_COMMENT (
        id serial PRIMARY KEY,
        todo_id INTEGER NOT NULL,
        comment VARCHAR(2048) NOT NULL,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    ```

* タグテーブル
    ```
    create table TODO_TAG (
        id serial PRIMARY KEY,
        tag_name VARCHAR(64) NOT NULL UNIQUE,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    create index TODO_TAG_idx1 on TODO_TAG(tag_name);
    ```

* タグ一覧テーブル
    ```
    create table TODO_TAGS (
        todo_id INTEGER,
        tag_id INTEGER,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    create index TODO_TAGS_idx1 on TODO_TAGS(todo_id);
    ```

* 状態テーブル
    ```
    create table TODO_STATUS (
        id INTEGER NOT NULL UNIQUE,
        name VARCHAR(16) NOT NULL,
        seq INTEGER NOT NULL,
        create_ts TIMESTAMP NOT NULL,
        update_ts TIMESTAMP NOT NULL
    );
    create index TODO_STATUS_idx1 on TODO_STATUS(seq);
    insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values
    (0, '未着手', 1, current_timestamp, current_timestamp);
    insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values
    (10, '着手', 10, current_timestamp, current_timestamp);
    insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values
    (20, '完了', 20, current_timestamp, current_timestamp);
    ```
