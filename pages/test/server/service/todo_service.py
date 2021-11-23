# -*- coding:utf-8 -*-

import importlib
import pathlib
import sys

_myPath = pathlib.Path(__file__)
sys.path.append(str(_myPath.parent))
_service_base = importlib.import_module('todo_service_base')

class TodoService(_service_base.TodoServiceBase):
    def __init__(self):
        super().__init__()

    def _read_category(self):
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
                #self._log.error('not suppot status code : {}'.format(status))
                print('not suppot status code : {}'.format(status))
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
        sql2 = '''  select coalesce(T1.id, 0) as id, coalesce(T1.name, '未分類') as name, S.status, S.num
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
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql1)
                for row in cur:
                    catList.append(newCategory(row['id'], row['name']))
                cur.execute(sql2)
                for row in cur:
                    addCategory(catList, str(row['id']), row['name'], row['status'], row['num'])
        return {"category_list": catList}

    def _read_tags(self):
        tags = []
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute('SELECT id, tag_name FROM TODO_TAG order by tag_name')
                for row in cur:
                    tags.append({'id': str(row['id']), 'name': row['tag_name']})
        return tags

    def _read_todo(self, sql1, sql1Param):
        todoList = []
        sql2 = ''' SELECT id, comment FROM TODO_COMMENT
                    WHERE todo_id = %s ORDER BY id
                '''
        sql3 = ''' select T1.tag_id as id, T2.tag_name as name from TODO_TAGS T1
                    inner join TODO_TAG T2 on T2.id = T1.tag_id
                    where T1.todo_id = %s
                    order by T2.tag_name
                '''
        sql4 = ''' select id, name from TODO_STATUS order by seq '''
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql1, sql1Param)
                for row1 in cur.fetchall():
                    todoId = str(row1['id'])
                    item = {'summary':{'id': todoId, 'title': row1['title'], 'status': str(row1['status']),
                                    'date1': super().datetimeStr(row1['create_ts']),
                                    'date2': super().datetimeStr(row1['update_ts'])},
                            'comments': [],
                            'tags': []}
                    cur.execute(sql2, (todoId, ))
                    for row2 in cur:
                        item['comments'].append({'id': str(row2['id']), 'content': row2['comment']})
                    cur.execute(sql3, (todoId, ))
                    for row3 in cur:
                        item['tags'].append({'id': str(row3['id']), 'name': row3['name']})
                    todoList.append(item)
                statList = []
                cur.execute(sql4)
                for row4 in cur:
                    statList.append({'id': str(row4['id']), 'name': row4['name']})

        return {"todo_list": todoList, 'status_list': statList}

    def read_category(self):
        return self._read_category()

    def add_category(self, req):
        #print('request : {}'.format(dir(request)))
        #print('request.mimetype : {}'.format(request.mimetype))
        now = super().getNow()
        param = (req['category_name'], now, now, )
        with super().db_connect() as conn:
            with conn.cursor() as cur:
                cur.execute('INSERT INTO TODO_CATEGORY(name,create_ts,update_ts) VALUES(%s, %s, %s)', param)
            conn.commit()
        return self._read_category()

    def read_tags(self):
        return self._read_tags()

    def add_tag(self, req):
        now = super().getNow()
        sql = ''' INSERT INTO TODO_TAG(tag_name,create_ts,update_ts)
                    VALUES(%s,%s,%s)'''
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql, (req['tag-name'], now, now))
            conn.commit()
        return self._read_tags()

    def read_todo(self, req):
        categoryId = req['category_id']
        if categoryId == '0':
            # カテゴリに割当していないTODOの一覧を取得
            sql = ''' SELECT T1.id, T1.title, T1.status, T1.create_ts ,T1.update_ts FROM TODO_TITLE T1
                    WHERE not exists (SELECT 1 from TODO_CATEGORIES T2 WHERE T2.todo_id = T1.id)
                    ORDER BY T1.id desc
                '''
            sql1Param = ()
        else:
            # カテゴリ指定でTODOの一覧を取得
            sql = ''' SELECT T1.id, T1.title, T1.status, T1.create_ts ,T1.update_ts FROM TODO_TITLE T1
                    inner join TODO_CATEGORIES T2 on T2.todo_id = T1.id AND T2.category_id = %s
                    ORDER BY T1.id desc
                '''
            sql1Param = (categoryId, )

        return self._read_todo(sql, sql1Param)

    def add_todo(self, req):
        now = super().getNow()
        sql1a = ''' INSERT INTO TODO_TITLE(title,create_ts,update_ts)
                    VALUES(%s,%s,%s)'''
        sql1b = 'select max(id) as max_id from TODO_TITLE'
        sql2  = ''' INSERT INTO TODO_CATEGORIES(category_id,todo_id,create_ts,update_ts)
                    VALUES(%s,%s,%s,%s)'''
        todo_id = -1
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql1a, (req['title'], now, now))
                cur.execute(sql1b)
                rec = cur.fetchone()
                todo_id = rec['max_id']
                if req['category-id'] != '0':
                    cur.execute(sql2, (req['category-id'], todo_id, now, now))
                conn.commit()
        return {'temp-id': req['temp-id'], 'id': todo_id, 'date1': now}

    def update_todo(self, req):
        sql = ''' UPDATE TODO_TITLE set title = %s
                    WHERE id = %s'''
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql, (req['title'], req['id']))
                conn.commit()
        return {'id': req['id']}

    def update_status(self, req):
        now = super().getNow()
        sql = ''' UPDATE TODO_TITLE set status = %s , update_ts = %s
                    WHERE id = %s'''
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql, (req['status'], now, req['id']))
                conn.commit()
        return req

    def delete_todo(self, req):
        delParam = (req['id'], )
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute('delete from TODO_TITLE where id = %s', delParam)
                cur.execute('delete from TODO_COMMENT where todo_id = %s', delParam)
                cur.execute('delete from TODO_CATEGORIES where todo_id = %s', delParam)
                cur.execute('delete from TODO_TAGS where todo_id = %s', delParam)
            conn.commit()

        return {'id': req['id']}

    def add_comment(self, req):
        now = super().getNow()
        sqla = ''' INSERT INTO TODO_COMMENT(todo_id, comment,create_ts,update_ts)
                    VALUES(%s,%s,%s,%s)'''
        sqlb = 'select max(id) as max_id from TODO_COMMENT'
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sqla, (req['todo-id'], req['comment'], now, now))
                cur.execute(sqlb)
                rec = cur.fetchone()
                comment_id = rec['max_id']
            conn.commit()
        return {'todo-id': req['todo-id'], 'temp-id': req['temp-id'], 'id': comment_id}

    def update_comment(self, req):
        now = super().getNow()
        sql = ''' UPDATE TODO_COMMENT set comment = %s , update_ts = %s
                    WHERE id = %s'''
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute(sql, (req['comment'], now, req['id']))
            conn.commit()
        return {'todo-id': req['todo-id'], 'id': req['id']}

    def delete_comment(self, req):
        delParam = (req['id'], )
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                cur.execute('delete from TODO_COMMENT where id = %s', delParam)
            conn.commit()
        return {'todo-id': req['todo-id'], 'id': req['id']}

    def set_todo_tag(self, req):
        now = super().getNow()
        todoId = req['todo-id']
        with super().db_connect() as conn:
            with super().db_cursor(conn) as cur:
                # 一旦登録内容を全削除
                cur.execute('DELETE FROM TODO_TAGS WHERE todo_id = %s', (todoId,))
                # 再登録
                for item in req['tags']:
                    cur.execute('''INSERT INTO TODO_TAGS(todo_id,tag_id,create_ts,update_ts)
                                    VALUES(%s,%s,%s,%s)''', (todoId, item['id'], now, now))
            conn.commit()
        return {}

if __name__ == '__main__':
    #svc = TodoService()
    #method = getattr(svc, 'read_category')
    #print(method())
    pass

#[EOF]