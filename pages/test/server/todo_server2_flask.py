# -*- coding:utf-8 -*-

import importlib
import inspect
import logging
import logging.handlers
import pathlib
import sys
import pathlib

from flask import Flask, request, jsonify
from logging import Formatter

from pages.test.server.service.todo_service2 import TodoService2

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


'''
_myPath = pathlib.Path(__file__)
sys.path.append(str(_myPath.parent / 'service'))
_serviceList = [
    importlib.import_module('todo_service').TodoService(),
]
_todoService = {}
for svc in _serviceList:
    for ite in inspect.getmembers(svc, inspect.ismethod):
        m = ite[0]
        if m.startswith('_'):
            continue
        if callable(getattr(svc, m)):
            # TODO 重複登録時の判定が必要
            _todoService[m] = svc
            print('/{} at {}'.format(m, type(svc).__name__))

def _getServiceMethod(path):
    return getattr(_todoService[path], path)
'''
_todoService = TodoService2()
_todoService.read_service_config()

todoApp = Flask(__name__)
todoApp.config['JSON_AS_ASCII'] = False

@todoApp.route('/<action>', methods=['POST'])
def todo_controller(action):
    return jsonify(_todoService.execute_service(action, request.json))

if __name__ == '__main__':
    todoApp.run()

#[EOF]