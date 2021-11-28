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

todoApp = Flask(__name__)
todoApp.config['JSON_AS_ASCII'] = False

def _getServiceMethod(path):
    return getattr(_todoService[path], path)

@todoApp.route('/<action>', methods=['POST'])
def todo_controller(action):
    req = request.json
    method = _getServiceMethod(action)
    # TODO method == null の時、エラー処理を実装すること
    return jsonify(method(req))

if __name__ == '__main__':
    todoApp.run()

#[EOF]