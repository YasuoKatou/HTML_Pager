# サーバのＦ／Ｗにflaskを採用したサーバの構築

今回本格的なサーバ構築の実装を試みました。その内容を下記に備忘録として残します。

テーマ１：静的ファイルは、Web サーバで処理（クライアントに戻す）  
テーマ２：クライアントからのPOSTリクエスト（JSON）のみを処理する  
テーマ３：[ライブラリマネージャー](https://github.com/YasuoKatou/pyLibManager "ライブラリマネージャー")を使ったアプリケーション


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

## 各種ライブラリの配置先

/cygdrive/z/nginx/nginx-1.20.1/html/HTML_Pager   このプロジェクトの配置先

/cygdrive/z/workspace/GitHub/pyLibManager/       [ライブラリマネージャー](https://github.com/YasuoKatou/pyLibManager "ライブラリマネージャー")

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
$ export PY_LIB_MANAGER="/cygdrive/z/workspace/GitHub/pyLibManager/pyLibManager/lib_manager.py"
$ export PG_DNS="postgresql://{DB user}:{password}@{hostname}:{port no}/{db name}"
$ export LIB_MANAGER_PATH="/cygdrive/z/workspace/GitHub/pyLibManager/pyLibManager:/cygdrive/z/nginx/nginx-1.20.1/html/HTML_Pager:/cygdrive/z/nginx/nginx-1.20.1/html/HTML_Pager/pages/test/server/service/todoDao"
$ uwsgi --ini /home/YasuoKatou/uwsgi/todo/uwsgi_todo2.ini
```

uwsgi_todo2.ini の内容

```
[uwsgi]
http=0.0.0.0:9090
chdir=/cygdrive/z/nginx/nginx-1.20.1/html/HTML_Pager
wsgi-file=/cygdrive/z/nginx/nginx-1.20.1/html/HTML_Pager/pages/test/server/todo_server2_flask.py
callable=todoApp
vacuum=true
pidfile=/home/YasuoKatou/uwsgi/todo/uwsgi_todo.pid
logto=/home/YasuoKatou/uwsgi/todo/uwsgi_todo.log
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
