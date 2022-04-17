# -*- coding:utf-8 -*-

from  dao_base import DaoBase

import logging
import logging.config

class TodoDao(DaoBase):
    def setLogConfig(self, log_conf):
        logging.config.dictConfig(log_conf)
        self.logger = logging.getLogger(__name__)

    def _newCategory(self, id, name):
        return {'id': str(id), 'name': name, 'num1': '0', 'num2': '0', 'num3': '0'}

    def read_tags(self, conn):
        tags = []
        with super()._getDictCursor(conn) as cur:
            cur.execute('SELECT id, tag_name FROM TODO_TAG order by tag_name')
            for row in cur:
                tags.append({'id': str(row['id']), 'name': row['tag_name']})
        return {'tags': tags}

    def getCategoryAll(self, conn):
        sql = 'select T1.id, T1.name from TODO_CATEGORY T1 order by T1.name'
        catList = [self._newCategory(0, '未分類')]
        with super()._getDictCursor(conn) as cur:
            cur.execute(sql)
            for row in cur:
                self.logger.debug('カテゴリ id:%d, name:[%s]' % (row['id'], row['name'], ))
                catList.append(self._newCategory(row['id'], row['name']))
        return catList

    def setCategoryItems(self, conn, catList):
        def updateNum(row, status, num):
            if status == 0:     # 未着手
                row['num1'] = str(num)
            elif status == 10:  # 作業中
                row['num2'] = str(num)
            elif status == 20:  # 完了
                row['num3'] = str(num)
            else:
                self.logger.error('not suppot status code : {}'.format(status))
        def addCategory(catList, id, name, status, num):
            for row in catList:
                if row['id'] == id:
                    updateNum(row, status, num)
                    return
            self.logger.info('カテゴリ id:%d, name:[%s]' % (id, name, ))
            row = self._newCategory(int(id), name)
            updateNum(row, status, num)
            catList.append(row)
        # カテゴリごとの件数取得
        sql = '''  select coalesce(T1.id, 0) as id, coalesce(T1.name, '未分類') as name, S.status, S.num
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
        with super()._getDictCursor(conn) as cur:
            cur.execute(sql)
            for row in cur:
                addCategory(catList, str(row['id']), row['name'], row['status'], row['num'])

    def readTags(self, conn):
        tags = []
        with super()._getDictCursor(conn) as cur:
            cur.execute('SELECT id, tag_name FROM TODO_TAG order by tag_name')
            for row in cur:
                tags.append({'id': str(row['id']), 'name': row['tag_name']})
        return tags

    def add_category(self, conn, req):
        self.logger.info('カテゴリ追加 name:[%s]' % (req['category_name'], ))
        sql = 'INSERT INTO TODO_CATEGORY(name,create_ts,update_ts) VALUES(%s, %s, %s) returning id'
        now = super()._getNow()
        param = (req['category_name'], now, now, )
        with conn.cursor() as cur:
            cur.execute(sql, param)
            category_id = cur.fetchone()[0]
            self.logger.info('カテゴリid:[%d]' % (category_id, ))
            return category_id

    def update_category(self, conn, req):
        now = super()._getNow()
        param = (req['name'], now, req['id'], )
        with conn.cursor() as cur:
            cur.execute('UPDATE TODO_CATEGORY SET name = %s, update_ts = %s WHERE id = %s', param)

    def delete_category(self, conn, req):
        param = (req['id'], )
        with conn.cursor() as cur:
            cur.execute('DELETE FROM TODO_CATEGORIES WHERE category_id = %s', param)
            cur.execute('DELETE FROM TODO_CATEGORY WHERE id = %s', param)

    def add_tag(self, conn, req):
        self.logger.info('タグ追加 name:[%s]' % (req['tag-name'], ))
        now = super()._getNow()
        sql = 'INSERT INTO TODO_TAG(tag_name,create_ts,update_ts) VALUES(%s,%s,%s) returning id'
        with conn.cursor() as cur:
            cur.execute(sql, (req['tag-name'], now, now))
            tag_id = cur.fetchone()[0]
            self.logger.info('タグid:[%d]' % (tag_id, ))
            return tag_id

    def update_tag(self, conn, req):
        now = super()._getNow()
        param = (req['name'], now, req['id'], )
        with conn.cursor() as cur:
            cur.execute('UPDATE TODO_TAG SET tag_name = %s, update_ts = %s WHERE id = %s', param)

    def delete_tag(self, conn, req):
        param = (req['id'], )
        with conn.cursor() as cur:
            cur.execute('DELETE FROM TODO_TAGS WHERE tag_id = %s', param)
            cur.execute('DELETE FROM TODO_TAG WHERE id = %s', param)

    def _read_todo(self, conn, sql1, sql1Param):
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
        with super()._getDictCursor(conn) as cur:
            cur.execute(sql1, sql1Param)
            for row1 in cur.fetchall():
                todoId = str(row1['id'])
                item = {'summary':{'id': todoId, 'title': row1['title'], 'status': str(row1['status']),
                                'date1': super()._datetimeStr(row1['create_ts']),
                                'date2': super()._datetimeStr(row1['update_ts'])},
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

    def read_todo_without_category(self, conn):
        self.logger.debug('カテゴリ未割当のTODO一覧を取得')
        sql = ''' SELECT T1.id, T1.title, T1.status, T1.create_ts ,T1.update_ts FROM TODO_TITLE T1
                WHERE not exists (SELECT 1 from TODO_CATEGORIES T2 WHERE T2.todo_id = T1.id)
                ORDER BY T1.id desc
            '''
        return self._read_todo(conn, sql, ())

    def read_todo_with_category(self, conn, req):
        categoryId = req['category_id']
        self.logger.debug('カテゴリに割当てたTODO一覧を取得 category id:[%s]' % (categoryId, ))
        sql = ''' SELECT T1.id, T1.title, T1.status, T1.create_ts ,T1.update_ts FROM TODO_TITLE T1
                inner join TODO_CATEGORIES T2 on T2.todo_id = T1.id AND T2.category_id = %s
                ORDER BY T1.id desc
            '''
        sql1Param = (categoryId, )
        return self._read_todo(conn, sql, sql1Param)

    def add_todo(self, conn, req):
        now = super()._getNow()
        sql1 = 'INSERT INTO TODO_TITLE(title,create_ts,update_ts) VALUES(%s,%s,%s) RETURNING id'
        sql2  = ''' INSERT INTO TODO_CATEGORIES(category_id,todo_id,create_ts,update_ts)
                    VALUES(%s,%s,%s,%s)'''
        todo_id = -1
        with conn.cursor() as cur:
            cur.execute(sql1, (req['title'], now, now))
            todo_id = cur.fetchone()[0]
            # TODO TODOの新規登録とカテゴリの登録は、Daoを分離すること
            if req['category-id'] != '0':
                cur.execute(sql2, (req['category-id'], todo_id, now, now))
        return {'id': todo_id, 'date1': now}

    def update_todo(self, conn, req):
        sql = 'UPDATE TODO_TITLE set title = %s WHERE id = %s'
        with conn.cursor() as cur:
            cur.execute(sql, (req['title'], req['id']))

        # TODO id は、Daoとは関連しないので、処理を移動させること(結果、戻り値なしになる).
        return {'id': req['id']}

    def update_status(self, conn, req):
        now = super()._getNow()
        sql = 'UPDATE TODO_TITLE set status = %s , update_ts = %s WHERE id = %s'
        with conn.cursor() as cur:
            cur.execute(sql, (req['status'], now, req['id']))
        # TODO 戻り値は、now のみにする
        req['date2'] = now
        return req

    def delete_todo(self, conn, req):
        delParam = (req['id'], )
        with conn.cursor() as cur:
            cur.execute('delete from TODO_TITLE where id = %s', delParam)
            cur.execute('delete from TODO_COMMENT where todo_id = %s', delParam)
            cur.execute('delete from TODO_CATEGORIES where todo_id = %s', delParam)
            cur.execute('delete from TODO_TAGS where todo_id = %s', delParam)

        # TODO 戻り値をなしにする
        return {'id': req['id']}

    def add_comment(self, conn, req):
        now = super()._getNow()
        sql = 'INSERT INTO TODO_COMMENT(todo_id, comment,create_ts,update_ts) VALUES(%s,%s,%s,%s) RETURNING id'
        with conn.cursor() as cur:
            cur.execute(sql, (req['todo-id'], req['comment'], now, now))
            comment_id = cur.fetchone()[0]

        # TODO 戻り値は、comment_id にする
        return {'todo-id': req['todo-id'], 'temp-id': req['temp-id'], 'id': comment_id}

    def update_comment(self, conn, req):
        now = super()._getNow()
        sql = 'UPDATE TODO_COMMENT set comment = %s , update_ts = %s WHERE id = %s'
        with conn.cursor() as cur:
            cur.execute(sql, (req['comment'], now, req['id']))

        # TODO 戻り値をなしにする
        return {'todo-id': req['todo-id'], 'id': req['id']}

    def delete_comment(self, conn, req):
        delParam = (req['id'], )
        with conn.cursor() as cur:
            cur.execute('delete from TODO_COMMENT where id = %s', delParam)

        # TODO 戻り値をなしにする
        return {'todo-id': req['todo-id'], 'id': req['id']}

    def clear_todo_tag(self, conn, todoId):
        with conn.cursor() as cur:
            # 一旦登録内容を全削除
            cur.execute('DELETE FROM TODO_TAGS WHERE todo_id = %s', (todoId,))

    def set_todo_tag(self, conn, todoId, tagId):
        now = super()._getNow()
        with conn.cursor() as cur:
            cur.execute('''INSERT INTO TODO_TAGS(todo_id,tag_id,create_ts,update_ts)
                            VALUES(%s,%s,%s,%s)''', (todoId, tagId, now, now))

    def free_todo_category(self, conn, req):
        with conn.cursor() as cur:
            cur.execute('DELETE FROM TODO_CATEGORIES WHERE todo_id = %s', (req['todo-id'], ))

    def set_todo_category(self, conn, req):
        now = super()._getNow()
        sql = ''' INSERT INTO TODO_CATEGORIES(category_id,todo_id,create_ts,update_ts)
                    VALUES(%s,%s,%s,%s)'''
        with conn.cursor() as cur:
            cur.execute(sql, (req['category_id_to'], req['todo-id'], now, now))

    def move_todo_category(self, conn, req):
        now = super()._getNow()
        sql = ''' UPDATE TODO_CATEGORIES set category_id = %s, update_ts = %s
                    WHERE todo_id = %s'''
        with conn.cursor() as cur:
            cur.execute(sql, (req['category_id_to'], now, req['todo-id']))
#[EOF]