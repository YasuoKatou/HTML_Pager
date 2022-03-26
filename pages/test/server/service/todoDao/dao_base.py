# -*- coding:utf-8 -*-
import datetime
import psycopg2.extras

class DaoBase:
    def _getNow(self):
        now = datetime.datetime.now()
        return now.strftime("%Y-%m-%d %H:%M:%S.%f")
    def _datetimeStr(self, val):
        return val.strftime("%Y-%m-%d %H:%M:%S.%f")
    def _getDictCursor(self, conn):
        return conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
#[EOF]