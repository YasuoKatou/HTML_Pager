# -*- coding:utf-8 -*-

import importlib
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
_serviceModule = importlib.import_module('todo_service')
_todoService_001 = _serviceModule.TodoService()
_todoService = {
    'read_category': _todoService_001,
    'add_category': _todoService_001,
    'read_todo': _todoService_001,
    'add_todo': _todoService_001,
    'update_todo': _todoService_001,
    'update_status': _todoService_001,
    'delete_todo': _todoService_001,
    'add_comment': _todoService_001,
    'update_comment': _todoService_001,
    'delete_comment': _todoService_001,
    'read_tags': _todoService_001,
    'add_tag': _todoService_001,
    'set_todo_tag': _todoService_001,
}

todoApp = Flask(__name__)
todoApp.config['JSON_AS_ASCII'] = False

def _getServiceMethod(path):
    return getattr(_todoService[path], path)

@todoApp.route('/add_category', methods=['POST'])
def add_category():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/read_category', methods=['POST'])
def read_category():
    method = _getServiceMethod(request.path[1:])
    return jsonify(method())

@todoApp.route('/read_tags', methods=['POST'])
def read_tags():
    method = _getServiceMethod(request.path[1:])
    return jsonify({'tags': method()})

@todoApp.route('/read_todo', methods=['POST'])
def read_todo():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/add_todo', methods=['POST'])
def add_todo():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/update_todo', methods=['POST'])
def update_todo():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/update_status', methods=['POST'])
def update_status():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/delete_todo', methods=['POST'])
def delete_todo():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/add_comment', methods=['POST'])
def add_comment():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/update_comment', methods=['POST'])
def update_comment():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/delete_comment', methods=['POST'])
def delete_comment():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

@todoApp.route('/add_tag', methods=['POST'])
def add_tag():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify({'tags': method(req)})

@todoApp.route('/set_todo_tag', methods=['POST'])
def set_todo_tag():
    req = request.json
    method = _getServiceMethod(request.path[1:])
    return jsonify(method(req))

if __name__ == '__main__':
    todoApp.run()

#[EOF]