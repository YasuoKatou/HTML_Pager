# -*- coding:utf-8 -*-

import importlib.util
from importlib import import_module
import json
import logging
import logging.config
import os
import pathlib
import sys

class TodoService2:
    def __init__(self):
        self.log_conf = self._initLogger()
        self.libManager = None
        self.myAppDef = {
            't_ses': None,
            'DBInfo': {'env_name': 'PG_DNS', 'pool': {'min': 1, 'max': 5}},
            'clazzDef': [
                {'module': 'DBs.PostgreSQL.pgClass', 'classes': []},
                {'module': 'pages.test.server.service.todo_service2', 'classes': []},
                {'module': 'pages.test.server.service.todoDao.todo_dao', 'classes': []}
            ],
        }
        #self.libManager = self.getLibManager()
        self.libManager = self.getLibManager2()
        assert self.libManager, 'ライブラリマネージャーの読込に失敗しました.'
        self.libManager.setLogConfig(self.log_conf)
        self.libManager.load_classes(self.myAppDef, defPrint=True, newCallback=self._newCallback)

    def _newCallback(self, instance):
        if 'setLogConfig' in dir(instance):
            instance.setLogConfig(self.log_conf)
        if 'setConnectionPool' in dir(instance):
            instance.setConnectionPool(self.myAppDef['DBInfo'])

    def _initLogger(self):
        p = pathlib.Path(__file__)
        j = p.parent / 'todo_service_log.json'
        with open(j, 'r') as f:
            log_conf = json.load(f)
        logging.config.dictConfig(log_conf)
        self.logger = logging.getLogger(__name__)
        return log_conf

    def getLibManager(self):
        '''
        ライブラリマネージャーに付属するクラスを使用する場合、「getLibManager2」の使用を推奨する.
        最終的には、パッケージを作成してimportする想定だが、
        開発途中のため動的にライブラリを取込む。
        windows powershellで環境設定の方法
        > $env:PY_LIB_MANAGER="Z:\workspace\GitHub\pyLibManager\pyLibManager\lib_manager.py"

        参考にしたページ：https://www.delftstack.com/ja/howto/python/import-python-file-from-path/
        '''
        py = os.environ.get('PY_LIB_MANAGER')
        assert py, 'ライブラリマネージャーのパスが環境変数(PY_LIB_MANAGER)で設定されていません.'
        p = pathlib.Path(py)
        assert p.exists(), 'ライブラリマネージャーのモジュールファイルが存在しません.'
        spec = importlib.util.spec_from_file_location(p.stem, str(p))
        modulevar = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(modulevar)
        return modulevar

    def getLibManager2(self):
        '''
        最終的には、パッケージを作成してimportする想定だが、
        開発途中のため動的にライブラリを取込む。
        windows powershellで環境設定の方法
        > $env:PY_LIB_MANAGER="Z:\workspace\GitHub\pyLibManager\pyLibManager\lib_manager.py"
        '''
        py = os.environ.get('PY_LIB_MANAGER')
        assert py, 'ライブラリマネージャーのパスが環境変数(PY_LIB_MANAGER)で設定されていません.'
        p = pathlib.Path(py)
        assert p.exists(), 'ライブラリマネージャーのモジュールファイルが存在しません.'
        sys.path.append(str(p.parent))
        return import_module(p.stem)

    def _prepareLibManager(self):
        apDef = {'t_ses': {}, }
        apDef['DBInfo'] = self.myAppDef['DBInfo']
        apDef['clazzDef'] = self.myAppDef['clazzDef']
        apDef['app'] = self.myAppDef['app']
        return apDef

    def run(self):
        '''
        windows powershellで環境設定の方法
        > $env:PG_DNS="postgresql://{DB user}:{password}@{hostname}:{port no}/{db name}"
        '''
        p = pathlib.Path(__file__)
        j = p.parent / 'service/todo_service2.json'
        with open(j, 'r', encoding='utf8') as f:
            self.myAppDef['app'] = json.load(f)
        self.libManager.run_lib_manager(self._prepareLibManager())
        self.logger.debug('normal end ...')

if __name__ == '__main__':
    app = TodoService2()
    app.run()

#[EOF]