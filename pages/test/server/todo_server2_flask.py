# -*- coding:utf-8 -*-

import logging
import logging.handlers
import pathlib
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