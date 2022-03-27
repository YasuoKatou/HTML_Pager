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

    def read_category2(self, conn):
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
        with super()._getDictCursor(conn) as cur:
            cur.execute(sql1)
            for row in cur:
                catList.append(newCategory(row['id'], row['name']))
            cur.execute(sql2)
            for row in cur:
                addCategory(catList, str(row['id']), row['name'], row['status'], row['num'])
        return {"category_list": catList}

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

    def read_todo_without_category(self, conn):
        self.logger.debug('カテゴリ未割当のTODO一覧を取得')

    def read_todo_with_category(self, conn, req):
        categoryId = req['category_id']
        self.logger.debug('カテゴリに割当てたTODO一覧を取得 category id:[%s]' % (categoryId, ))

#[EOF]