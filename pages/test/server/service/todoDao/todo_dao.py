# -*- coding:utf-8 -*-

import logging
import logging.config

import psycopg2.extras

class TodoDao:
    def setLogConfig(self, log_conf):
        logging.config.dictConfig(log_conf)
        self.logger = logging.getLogger(__name__)

    def setConnection(self, conn):
        self.conn = conn

    def _newCategory(self, id, name):
        return {'id': str(id), 'name': name, 'num1': '0', 'num2': '0', 'num3': '0'}

    def getCategoryAll(self):
        sql = 'select T1.id, T1.name from TODO_CATEGORY T1 order by T1.name'
        catList = [self._newCategory(0, '未分類')]
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            for row in cur:
                self.logger.debug('カテゴリ id:%d, name:[%s]' % (row['id'], row['name'], ))
                catList.append(self._newCategory(row['id'], row['name']))
        return catList

    def setCategoryItems(self, catList):
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
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute(sql)
            for row in cur:
                addCategory(catList, str(row['id']), row['name'], row['status'], row['num'])

    def readTags(self):
        tags = []
        with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute('SELECT id, tag_name FROM TODO_TAG order by tag_name')
            for row in cur:
                tags.append({'id': str(row['id']), 'name': row['tag_name']})
        return tags

#[EOF]