# -*- coding:utf-8 -*-

import datetime
import functools
import json
import logging
import logging.handlers
import pathlib
import sqlite3
import time
from http.server import HTTPServer
from logging import Formatter
from pages.test.server.http_server import HttpHandlerBase

_DB_NAME = 'todo.db'

'''
http://localhost:8083/todo.html
'''

class TodoHttpServer(HttpHandlerBase):
    def deco_proc_time(f):
        @functools.wraps(f)
        def wrapper(self, *args, **kwargs):
            self._log = logging.getLogger(__name__)
            start = time.time()
            res = f(self, *args, **kwargs)
            elapsed_time = time.time() - start
            self._log.info("{} ms in {}".format(elapsed_time * 1000, f.__name__))
            return res
        return wrapper

    def _getRequestData(self):
        content_len  = int(self.headers.get("content-length"))
        req_body = self.rfile.read(content_len).decode("utf-8")
        data = req_body.encode("utf-8")
        d = json.loads(data)
        self._log.info('request body : ({}) {}'.format(content_len, d))
        return d

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
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        super()._sendCorsHeader()
        self.end_headers()
        d = json.dumps(respData)
        self.wfile.write(d.encode())
        self._log.info('reponse : {}'.format(d))

    @deco_proc_time
    def do_POST_read_category(self):
        def newCategory(id, name):
            return {'id': str(id), 'name': name, 'num1': '0', 'num2': '0', 'num3': '0'}
        def updateNum(row, status, num):
            if status == 0:     # 未着手
                row['num1'] = str(num)
            elif status == 10:  # 作業中
                row['num2'] = str(num)
            elif status == 20:  # 完了
                row['num3'] = str(num)
            else:
                print('not suppot status code : ' + str(num))
        def addCategory(catList, id, name, status, num):
            for row in catList:
                if row['id'] == id:
                    updateNum(row, status, num)
                    return
            row = newCategory(int(id), name)
            updateNum(row, status, num)
            catList.append(row)

        # カテゴリの取得
        sql1 = ''' select T1.id, T1.name from TODO_CATEGORY T1 order by T1.name
               '''
        # カテゴリごとの件数取得
        sql2 = '''  select coalesce(T1.id, 0) id, coalesce(T1.name, '未分類') name, S.status, S.num
                    from (
                        select T2.category_id, T3.status, count(1) num
                        from todo_title T3
                        left outer join TODO_CATEGORIES T2
                        on T2.todo_id   =  T3.id
                        group by T2.category_id, T3.status
                    ) S
                    left outer join TODO_CATEGORY T1
                    on T1.id  =  S.category_id
                    order by T1.name
               '''
        catList = [newCategory(0, '未分類')]
        with self._getDBConnection() as con:
            con.row_factory = self._dict_factory
            cur = con.cursor()
            for row in cur.execute(sql1):
                catList.append(newCategory(row['id'], row['name']))
            for row in cur.execute(sql2):
                addCategory(catList, str(row['id']), row['name'], row['status'], row['num'])
        self._send_response({"category_list": catList})

    @deco_proc_time
    def do_POST_add_category(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' INSERT INTO TODO_CATEGORY(name,create_ts,update_ts)
                  VALUES(?,?,?)'''
        todo_id = -1
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['category_name'], now, now))
            con.commit()
        self.do_POST_read_category()

    @deco_proc_time
    def do_POST_read_todo(self):
        reqData = self._getRequestData()
        if reqData['category_id'] == '0':
            # カテゴリに割当していないTODOの一覧を取得
            sql1 = ''' SELECT T1.id, T1.title, T1.status FROM TODO_TITLE T1
                       WHERE not exists (SELECT 1 from TODO_CATEGORIES T2 WHERE T2.todo_id = T1.id)
                       ORDER BY T1.id desc
                   '''
            sql1Param = ()
        else:
            # カテゴリ指定でTODOの一覧を取得
            sql1 = ''' SELECT T1.id, T1.title, T1.status FROM TODO_TITLE T1
                       inner join TODO_CATEGORIES T2 on T2.todo_id = T1.id AND T2.category_id = ?
                       ORDER BY T1.id desc
                   '''
            sql1Param = (reqData['category_id'],)
        self._read_todo(sql1, sql1Param)

    def _read_todo(self, sql1, sql1Param):
        todoList = []
        sql2 = ''' SELECT id, comment FROM TODO_COMMENT
                   WHERE todo_id = ? ORDER BY id desc
               '''
        sql3 = ''' select T1.tag_id id, T2.tag_name name from TODO_TAGS T1
                   inner join TODO_TAG T2 on T2.id = T1.tag_id
                   where T1.todo_id = ?
                   order by T2.tag_name
               '''
        sql4 = ''' select id, name from TODO_STATUS order by seq '''
        with self._getDBConnection() as con:
            con.row_factory = self._dict_factory
            cur1 = con.cursor()
            cur2 = con.cursor()
            cur3 = con.cursor()
            cur4 = con.cursor()
            for row1 in cur1.execute(sql1, sql1Param):
                todoId = str(row1['id'])
                item = {'summary':{'id': todoId, 'title': row1['title'], 'status': str(row1['status'])},
                        'comments': [],
                        'tags': []}
                for row2 in cur2.execute(sql2, (todoId, )):
                    item['comments'].append({'id': str(row2['id']), 'content': row2['comment']})
                for row3 in cur3.execute(sql3, (todoId, )):
                    item['tags'].append({'id': str(row3['id']), 'name': row3['name']})
                todoList.append(item)
            statList = []
            for row4 in cur4.execute(sql4):
                statList.append({'id': str(row4['id']), 'name': row4['name']})

        self._send_response({"todo_list": todoList, 'status_list': statList})

    @deco_proc_time
    def do_POST_add_todo(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql1 = ''' INSERT INTO TODO_TITLE(title,create_ts,update_ts)
                  VALUES(?,?,?)'''
        sql2 = ''' INSERT INTO TODO_CATEGORIES(category_id,todo_id,create_ts,update_ts)
                  VALUES(?,?,?,?)'''
        todo_id = -1
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql1, (reqData['title'], now, now))
            todo_id = cur.lastrowid
            if reqData['category-id'] != '':
                cur.execute(sql2, (reqData['category-id'], todo_id, now, now))
            con.commit()
        respData = {'temp-id': reqData['temp-id'], 'id': todo_id}
        self._send_response(respData)

    @deco_proc_time
    def do_POST_update_todo(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' UPDATE TODO_TITLE set title = ? , update_ts = ?
                  WHERE id = ?'''
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['title'], now, reqData['id']))
            con.commit()
        respData = {'id': reqData['id']}
        self._send_response(respData)

    @deco_proc_time
    def do_POST_update_status(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' UPDATE TODO_TITLE set status = ? , update_ts = ?
                  WHERE id = ?'''
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['status'], now, reqData['id']))
            con.commit()
        self._send_response(reqData)

    @deco_proc_time
    def do_POST_delete_todo(self):
        reqData = self._getRequestData()
        delParam = (reqData['id'], )
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute('delete from TODO_TITLE where id = ?', delParam)
            cur.execute('delete from TODO_COMMENT where todo_id = ?', delParam)
            cur.execute('delete from TODO_TAGS where todo_id = ?', delParam)

        respData = {'id': reqData['id']}
        self._send_response(respData)

    @deco_proc_time
    def do_POST_add_comment(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' INSERT INTO TODO_COMMENT(todo_id, comment,create_ts,update_ts)
                  VALUES(?,?,?,?)'''
        todo_id = -1
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['todo-id'], reqData['comment'], now, now))
            con.commit()
            comment_id = cur.lastrowid
        respData = {'todo-id': reqData['todo-id'], 'temp-id': reqData['temp-id'], 'id': comment_id}
        self._send_response(respData)

    @deco_proc_time
    def do_POST_update_todo(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' UPDATE TODO_TITLE set title = ? , update_ts = ?
                  WHERE id = ?'''
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['title'], now, reqData['id']))
            con.commit()
        respData = {'id': reqData['id']}
        self._send_response(respData)

    @deco_proc_time
    def do_POST_update_comment(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' UPDATE TODO_COMMENT set comment = ? , update_ts = ?
                  WHERE id = ?'''
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute(sql, (reqData['comment'], now, reqData['id']))
            con.commit()
        respData = {'id': reqData['id']}
        self._send_response(respData)

    @deco_proc_time
    def do_POST_delete_comment(self):
        reqData = self._getRequestData()
        delParam = (reqData['id'], )
        with self._getDBConnection() as con:
            cur = con.cursor()
            cur.execute('delete from TODO_COMMENT where id = ?', delParam)

        respData = {'todo-id': reqData['todo-id'], 'id': reqData['id']}
        self._send_response(respData)

    def _read_tags(self, con):
        tags = []
        con.row_factory = self._dict_factory
        cur = con.cursor()
        for row in cur.execute('SELECT id, tag_name FROM TODO_TAG order by tag_name'):
            tags.append({'id': str(row['id']), 'name': row['tag_name']})
        return tags

    @deco_proc_time
    def do_POST_read_tags(self):
        with self._getDBConnection() as con:
            tags = self._read_tags(con)
        self._send_response({'tags': tags})

    @deco_proc_time
    def do_POST_add_tag(self):
        reqData = self._getRequestData()
        now = self._getNow()
        sql = ''' INSERT INTO TODO_TAG(tag_name,create_ts,update_ts)
                  VALUES(?,?,?)'''
        with self._getDBConnection() as con:
            con.row_factory = self._dict_factory
            cur = con.cursor()
            cur.execute(sql, (reqData['tag-name'], now, now))
            con.commit()

            tags = self._read_tags(con)
        self._send_response({'tags': tags})

    @deco_proc_time
    def do_POST_set_todo_tag(self):
        reqData = self._getRequestData()
        now = self._getNow()
        todoId = reqData['todo-id']
        with self._getDBConnection() as con:
            con.row_factory = self._dict_factory
            cur = con.cursor()
            # 一旦登録内容を全削除
            cur.execute('DELETE FROM TODO_TAGS WHERE todo_id = ?', (todoId,))
            # 再登録
            for item in reqData['tags']:
                cur.execute('''INSERT INTO TODO_TAGS(todo_id,tag_id,create_ts,update_ts)
                               VALUES(?,?,?,?)''', (todoId, item['id'], now, now))
            con.commit()
        self._send_response({})

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

def _getNow():
    now = datetime.datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S.%f")

def _dbVerup01(db_path):
    with sqlite3.connect(db_path) as con:
        cur = con.cursor()
        cur.execute('''SELECT COUNT(*) FROM sqlite_master WHERE TYPE='table' AND name='TODO_STATUS'
        ''')
        if cur.fetchone()[0] == 1:
            return
        cur.execute('''
            create table TODO_STATUS (
                id INTEGER NOT NULL UNIQUE,
                name VARCHAR(16) NOT NULL,
                seq INTEGER NOT NULL,
                create_ts TEXT NOT NULL,
                update_ts TEXT NOT NULL)
        ''')
        cur.execute('''create index TODO_STATUS_idx1 on TODO_STATUS(seq)''')
        now = _getNow()
        p = (now, now, )
        cur.execute('''insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values ( 0, '未着手',  1, ?, ?)''', p)
        cur.execute('''insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values (10,   '着手', 10, ?, ?)''', p)
        cur.execute('''insert into TODO_STATUS (id,name,seq,create_ts,update_ts) values (20,   '完了', 20, ?, ?)''', p)
        print('TODOステータステーブルを追加')

def _dbVerup02(db_path):
    with sqlite3.connect(db_path) as con:
        cur = con.cursor()
        cur.execute('''SELECT COUNT(*) FROM sqlite_master WHERE TYPE='table' AND name='TODO_CATEGORY'
        ''')
        if cur.fetchone()[0] == 0:
            cur.execute('''
                create table TODO_CATEGORY (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(256) NOT NULL,
                    create_ts TEXT NOT NULL,
                    update_ts TEXT NOT NULL)
            ''')
            print('カテゴリテーブルを追加')
        cur.execute('''SELECT COUNT(*) FROM sqlite_master WHERE TYPE='table' AND name='TODO_CATEGORIES'
        ''')
        if cur.fetchone()[0] == 0:
            cur.execute('''
                create table TODO_CATEGORIES (
                    category_id INTEGER NOT NULL,
                    todo_id INTEGER NOT NULL,
                    create_ts TEXT NOT NULL,
                    update_ts TEXT NOT NULL)
            ''')
            print('カテゴリ一覧テーブルを追加')

def _setLog():
    l = logging.getLogger(__name__)
    l.setLevel(logging.DEBUG)

    logPath = pathlib.Path(__file__).parent / 'log/todo.log'
    rh = logging.handlers.TimedRotatingFileHandler(
        logPath,
        when='midnight',
        encoding='utf-8',
        backupCount=7
    )
    rh.setFormatter(Formatter('%(asctime)s %(thread)d-%(threadName)s %(name)s:%(lineno)s %(funcName)s [%(levelname)s]: %(message)s'))
    l.addHandler(rh)

if __name__ == '__main__':
    _setLog()
    # DBの確認と作成
    _path = pathlib.Path(__file__).parent / _DB_NAME
    if _existsDb(_path):
        print('todo db exists.')
        _dbVerup01(_path)
        _dbVerup02(_path)
    else:
        print('no todo db')
        _createDb(_path)
        _dbVerup01(_path)
        _dbVerup02(_path)

    #httpサーバの起動
    server_address = ('', 8083)
    httpd = HTTPServer(server_address, TodoHttpServer)
    httpd.serve_forever()

#[EOF]