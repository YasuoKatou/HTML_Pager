# -*- coding:utf-8 -*-

import datetime
import json
import pathlib
import sqlite3
from http.server import HTTPServer
from pages.test.server.http_server import HttpHandlerBase

_DB_NAME = 'todo.db'

'''
http://localhost:8083/todo.html
'''
class TodoHttpServer(HttpHandlerBase):
    def _getRequestData(self):
        content_len  = int(self.headers.get("content-length"))
        req_body = self.rfile.read(content_len).decode("utf-8")
        data = req_body.encode("utf-8")
        print('request body : ({}) {}'.format(content_len, data))
        return data

    def _dict_factory(self, cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d

    def _getNow(self):
        now = datetime.datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S.%f")

    def _getDBConnection(self):
        dbPath = pathlib.Path(__file__).parent / _DB_NAME
        return sqlite3.connect(dbPath)

    def _send_response(self, respData):
        print('reponse data : ' + str(respData))
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        super()._sendCorsHeader()
        self.end_headers()
        self.wfile.write(json.dumps(respData).encode())

    def do_POST_read_todo(self):
        self._getRequestData()
        todoList = []
        with self._getDBConnection() as con:
            con.row_factory = self._dict_factory
            cur = con.cursor()
            for row in cur.execute('SELECT * FROM TODO_TITLE ORDER BY id desc'):
                item = {'summary':{'id': str(row['id']), 'title': row['title']},
                        'comments': [],
                        'tags': []}
                todoList.append(item)
        self._send_response({"todo_list": todoList})

    def do_POST_add_todo(self):
        reqData = json.loads(self._getRequestData())
        now = self._getNow()
        sql = ''' INSERT INTO TODO_TITLE(title,create_ts,update_ts)
                  VALUES(?,?,?)'''
        todo_id = -1
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['title'], now, now))
            con.commit()
            todo_id = cur.lastrowid
        respData = {'temp-id': reqData['temp-id'], 'id': todo_id}
        self._send_response(respData)
        

def _existsDb(db_path):
    p = pathlib.Path(db_path)
    print('db full path: ' + str(p.absolute()))
    return p.exists()
def _createDb(db_path):
    with sqlite3.connect(db_path) as con:
        cur = con.cursor()
        cur.execute('''
            create table TODO_TITLE (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(256) NOT NULL,
                status INTEGER NOT NULL DEFAULT 0,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL
            )
        ''')
        print('タイトルテーブルを作成しました.')
        cur.execute('''
            create table TODO_COMMENT (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                todo_id INTEGER NOT NULL,
                comment VARCHAR(2048) NOT NULL,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL
            )
        ''')
        print('コメントテーブルを作成しました.')
        cur.execute('''
            create table TODO_TAG (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        cur.execute('''
            create index TODO_TAGS_idx1 on TODO_TAGS(todo_id)
        ''')
        print('タグ一覧のインデックスを作成しました.')
        con.commit()

if __name__ == '__main__':
    # DBの確認と作成
    _path = pathlib.Path(__file__).parent / _DB_NAME
    if _existsDb(_path):
        print('todo db exists.')
    else:
        print('no todo db')
        _createDb(_path)

    #httpサーバの起動
    server_address = ('', 8083)
    httpd = HTTPServer(server_address, TodoHttpServer)
    httpd.serve_forever()

#[EOF]