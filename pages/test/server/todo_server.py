# -*- coding:utf-8 -*-

import pathlib
import sqlite3
from pages.test.server.http_server import HttpHandlerBase

_DB_NAME = 'todo.db'


class TodoHttpServer(HttpHandlerBase):
    def __init__(self):
        print('start Todo Http Server.')

def _existsDb(db_path):
    p = pathlib.Path(db_path)
    print('db full path: ' + str(p.absolute()))
    return p.exists()
def _createDb(db_path):
    with sqlite3.connect(db_path) as con:
        cur = con.cursor()
        cur.execute('''
            create table TODO_TITLE (
                id INTEGER PRIMARY KEY,   -- AUTOINCREMENT
                title VARCHAR(256) NOT NULL,
                status INTEGER NOT NULL DEFAULT 0,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL
            )
        ''')
        print('タイトルテーブルを作成しました.')
        cur.execute('''
            create table TODO_COMMENT (
                id INTEGER PRIMARY KEY,   -- AUTOINCREMENT
                todo_id INTEGER NOT NULL,
                comment VARCHAR(2048) NOT NULL,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL
            )
        ''')
        print('コメントテーブルを作成しました.')
        cur.execute('''
            create table TODO_TAG (
                id INTEGER PRIMARY KEY,   -- AUTOINCREMENT
                tag_name VARCHAR(64) NOT NULL UNIQUE,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL
            )
        ''')
        print('タグテーブルを作成しました.')
        cur.execute('''
            create index TODO_TAG_idx1 on TODO_TAG(tag_name)
        ''')
        print('タグのインデックスを作成しました.')
        cur.execute('''
            create table TODO_TAGS (
                todo_id INTEGER,
                tag_id INTEGER,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL
            )
        ''')
        print('タグ一覧テーブルを作成しました.')
        con.commit()


# DBの確認と作成
_path = pathlib.Path(__file__).parent / _DB_NAME
if not _existsDb(_path):
    print('no todo db')
    _createDb(_path)

#httpサーバの起動
server_address = ('', 8083)
httpd = http.server(server_address, TodoHttpServer)
httpd.serve_forever()

#[EOF]