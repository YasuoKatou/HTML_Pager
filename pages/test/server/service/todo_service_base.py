# -*- coding:utf-8 -*-

import datetime
import os
import psycopg2
import psycopg2.extras

class TodoServiceBase:
    def __init__(self):
        '''
        windows powershellで環境設定の方法
        > $env:TODO_DB_DNS="postgresql://{username}:{password}@{hostname}:{port}/{database}"
        '''
        self._dsn = os.environ.get('TODO_DB_DNS')
        #print('dns : ' + self._dsn)

    def db_connect(self):
        return psycopg2.connect(self._dsn)
    def db_cursor(self, conn):
        return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    def getNow(self):
        now = datetime.datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S.%f")
    def datetimeStr(self, val):
        return val.strftime("%Y-%m-%d %H:%M:%S.%f")
#[EOF]