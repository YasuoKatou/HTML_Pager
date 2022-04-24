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
                {'module': 'Conditions.condition1', 'classes': []},
                {'module': 'Conditions.loop1', 'classes': []},
                {'module': 'Bean.beanClass', 'classes': [], 'ignoreClasses': ['XNoSupportedBeanMapTypeError', 'XNoSupportedConvertTypeError', ]},
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

    def _prepareLibManager(self, appConfig):
        apDef = {'t_ses': {}, }
        apDef['DBInfo'] = self.myAppDef['DBInfo']
        apDef['clazzDef'] = self.myAppDef['clazzDef']
        assert appConfig in self.myAppDef['app']['config'], 'アプリケーション定義[%s]が未定義' % (appConfig, )
        apDef['app'] = {'config': self.myAppDef['app']['config'][appConfig]}
        return apDef

    def read_service_config(self):
        '''
        windows powershellで環境設定の方法
        > $env:PG_DNS="postgresql://{DB user}:{password}@{hostname}:{port no}/{db name}"
        '''
        p = pathlib.Path(__file__)
        j = p.parent / 'todo_service2.json'
        with open(j, 'r', encoding='utf8') as f:
            self.myAppDef['app'] = json.load(f)

    def execute_service(self, action, req):
        apDef = self._prepareLibManager(action)
        apDef['t_ses']['request'] = req
        self.libManager.run_lib_manager(apDef)
        return apDef['t_ses']['response']

    def execute_test(self):
        self.read_service_config()

        testName = ''
        #testName = 'read_category_type1'
        #testName = 'read_category_type2'
        #testName = 'add_category'
        #testName = 'update_category'
        #testName = 'delete_category'
        #testName = 'move_category1'
        #testName = 'move_category2'
        #testName = 'move_category3'
        #testName = 'read_todo1'
        #testName = 'read_todo2'
        #testName = 'add_todo1'
        #testName = 'add_todo2'
        #testName = 'update_todo'
        #testName = 'update_status'
        #testName = 'delete_todo'
        #testName = 'add_comment'
        #testName = 'update_comment'
        #testName = 'delete_comment'
        testName = 'read_tags'
        #testName = 'add_tag'
        #testName = 'update_tag'
        #testName = 'delete_tag'
        #testName = 'set_todo_tag'
        action = ''
        req = {}
        if testName == 'read_category_type1':
            # カテゴリ一覧の取得を確認
            action = 'read_category'
            req = {'type': '1'}
        elif testName == 'read_category_type2':
            # カテゴリ一覧+TODO件数の取得を確認
            action = 'read_category'
            req = {'type': '2'}
        elif testName == 'add_category':
            # カテゴリの追加を確認
            action = 'add_category'
            req = {'category_name': 'new category'}
        elif testName == 'update_category':
            # カテゴリの更新を確認
            action = 'update_category'
            req = {'id': '31', 'name': 'updated category name'}
        elif testName == 'delete_category':
            # カテゴリの削除を確認
            action = 'delete_category'
            req = {'id': '31'}
        elif testName == 'move_category1':
            # カテゴリの移動を確認
            action = 'move_category'
            req = {'todo-id': '-1', 'category_id_fm': '0', 'category_id_to': '-2'}    #未分類から未分類以外に移動
        elif testName == 'move_category2':
            # カテゴリの移動を確認
            action = 'move_category'
            req = {'todo-id': '-1', 'category_id_fm': '-2', 'category_id_to': '-3'}    #未分類以外から未分類以外に移動
        elif testName == 'move_category3':
            # カテゴリ操作後のカテゴリ一覧を確認
            action = 'move_category'
            req = {'todo-id': '-1', 'category_id_fm': '-2', 'category_id_to': '0'}    #未分類にする
        elif testName == 'read_todo1':
            #カテゴリ未割当のTODO一覧取得を確認
            action = 'read_todo'
            req = {'category_id': '0'}
        elif testName == 'read_todo2':
            #カテゴリ割当ありのTODO一覧取得を確認
            action = 'read_todo'
            req = {'category_id': '3'}
        elif testName == 'add_todo1':
            #TODOの新規登録(カテゴリ未割当)を確認
            action = 'add_todo'
            req = {'title': 'new todo for test', 'category-id': '0', 'temp-id': 'abc'}
        elif testName == 'add_todo2':
            #TODOの新規登録(カテゴリ未割当)を確認
            action = 'add_todo'
            req = {'title': 'new todo for test', 'category-id': '1', 'temp-id': 'abc'}
        elif testName == 'update_todo':
            #TODOの更新を確認
            action = 'update_todo'
            req = {'id': '54', 'title': 'updated todo for test'}
        elif testName == 'update_status':
            #TODOのステータス更新を確認
            action = 'update_status'
            req = {'id': '54', 'status': '30'}
        elif testName == 'delete_todo':
            #TODOの削除を確認
            action = 'delete_todo'
            req = {'id': '54'}
        elif testName == 'add_comment':
            #TODOコメントの登録を確認
            action = 'add_comment'
            req = {'todo-id': '-1', 'comment': 'new todo comment', 'temp-id': 'abcde'}
        elif testName == 'update_comment':
            #TODOコメントの更新を確認
            action = 'update_comment'
            req = {'todo-id': '-1', 'id': '62', 'comment': 'updated todo comment'}
        elif testName == 'delete_comment':
            #TODOコメントの削除を確認
            action = 'delete_comment'
            req = {'todo-id': '-1', 'id': '62'}
        elif testName == 'read_tags':
            # タグの一覧を確認
            action = 'read_tags'
        elif testName == 'add_tag':
            #タグの追加を確認
            action = 'add_tag'
            req = {'tag-name': 'new Tag Name'}
        elif testName == 'update_tag':
            #タグの更新を確認
            action = 'update_tag'
            req = {'id': '19', 'name': 'updated Tag Name'}
        elif testName == 'delete_tag':
            #タグの削除を確認
            action = 'delete_tag'
            req = {'id': '19'}
        elif testName == 'set_todo_tag':
            # タグの設定を確認
            action = 'set_todo_tag'
            #req = {'todo-id': '-1', 'tags': [-2, -3]}
            req = {'todo-id': '-1', 'tags': []}
        else:
            assert False, 'テストが指定していない.'

        # TODO コネクションの再利用を確認

        self.logger.debug('start [%s]' % (testName, ))
        print(json.dumps(self.execute_service(action, req)))
        self.logger.debug('normal end ... [%s]' % (testName, ))

if __name__ == '__main__':
    app = TodoService2()
    app.execute_test()

#[EOF]