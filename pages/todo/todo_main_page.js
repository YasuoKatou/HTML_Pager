class TodoMainPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._setModeFree();
        this._createTodoTitle();
        this._createComment()
        //this._showTodo(this._test_data);

        var myPage = document.getElementById(p);
        myPage.addEventListener('click', this._myPage_click());

        var self = this;
        setTimeout(function() {
            self._createAjaxParam('read_todo', {}, self._execute_ShowTodo()).send();
        }, 0);
        // TODO明細のopen/closeをハンドリングする
        document.addEventListener('click', this._clickEvent());
    }

    _floatElementId = [
        'new_todo_title'
    ];

    _restoreElements = [
        'new_todo_label'
    ]

    _urlPrefix() {
        return 'http://localhost:8083';
    }

    _createAjaxParam(func_id, req_data, resp_func) {
        return new PagerAjax({
            async: true,
            method: 'POST',
            url: this._urlPrefix() + '/' + func_id,
            requestHeaders: [],
            txData: JSON.stringify(req_data),
            timeout: 5000,
            responseReceived: resp_func,
        });
    }

    _execute_ShowTodo() {
        var self = this;
        return function(respData) {
            self._showTodo(JSON.parse(respData));
        }
    }

    _createTodoTitle() {
        this._todoTitle = document.createElement('input');
        this._todoTitle.id = 'new_todo_title';
        this._todoTitle.setAttribute("type", "text");
        this._todoTitle.placeholder = '新規のTODOを入力';
        this._todoTitle.addEventListener('keydown', this._inputNewTodoTitle());
    }

    _createComment() {
        this._todoComment = document.createElement('input');
        this._todoComment.id = 'new_todo_comment';
        this._todoComment.setAttribute("type", "text");
        this._todoComment.placeholder = 'コメントを入力';
        this._todoComment.addEventListener('keydown', this._inputTodoComment());
    }

    _inputNewTodoTitle() {
        var self = this;
        return function(event) {
            if (event.keyCode != 13) return;
            setTimeout(function() {
                self._execute_inputNewTodoTitle(event);
            }, 0);
        }
    }

    _inputTodoComment() {
        var self = this;
        return function(event) {
            if (event.keyCode != 13) return;
            setTimeout(function() {
                self._execute_todoComment(event);
            }, 0);
        }
    }

    _execute_inputNewTodoTitle(event) {
        this._todoTitle.remove();
        this._setModeFree();
        var newTodoLabel = document.getElementById('new_todo_label');
        newTodoLabel.style.display = 'block';
        if (this._todoTitle.value === '') return;

        var tmpId = this._getTempId();
        var newTodo = {
            "summary": {"id": tmpId, "title": this._todoTitle.value},
            "comments": [],
            "tags": []
        };
        var li = document.createElement('li');
        li.classList.add('todo-item');
        li.appendChild(this._createDetailsTag(newTodo));
        newTodoLabel.parentNode.insertBefore(li, newTodoLabel.nextElementSibling);

        // サーバ登録
        var req = {'title': this._todoTitle.value, 'temp-id': tmpId};
        this._createAjaxParam('add_todo', req, this._received_new_todo()).send();
    }
    _received_new_todo() {
        return function(respData) {
            var json = JSON.parse(respData);
            var liList = document.getElementById('todo_item_container').getElementsByTagName('li');
            var num = liList.length;
            for (var i = 0; i < num; ++i) {
                var li = liList[i];
                if (!li.classList.contains('todo-item')) continue;
                var sumList = li.getElementsByClassName('summary-title');
                if (sumList.length !== 1) {
                    console.error('no summary title tag');
                    continue;
                }
                var sum = sumList[0];
                if (json['temp-id'] === sum.dataset.id) {
                    sum.dataset.id = json['id'];
                    return;
                }
            }
        };
    }

    _execute_todoComment(event) {
        var parent = event.target.parentNode;
        var ope = parent.getElementsByClassName('todo-detail-ope');
        this._todoComment.remove();
        var isNewComment = this._mode === this._MODE.ADD_COMMENT;
        this._setModeFree();
        if (ope.length !== 1) return;

        var todoItem = ope[0].parentNode.parentNode;
        var sumList = todoItem.getElementsByClassName('summary-title');
        if (sumList.length !== 1) {
            console.error('no summary title tag');
            return;
        }
        var todoId = sumList[0].dataset.id;

        var tmpId = this._getTempId();
        if (isNewComment) {
            var p = document.createElement('p');
            p.classList.add('todo-comment');
            p.dataset.id = tmpId;
            p.innerText = this._todoComment.value;
            parent.insertBefore(p, ope[0]);

            // サーバ登録
            var req = {'todo-id': todoId, 'comment': this._todoComment.value, 'temp-id': tmpId};
            this._createAjaxParam('add_comment', req, this._received_new_comment()).send();
        } else {
            var changed = (this._hiddenComment.innerText !== this._todoComment.value);
            this._hiddenComment.innerText = this._todoComment.value;
            this._hiddenComment.style.display = 'block';
            if (changed) {
                // サーバ更新
                var req = {'id': this._hiddenComment.dataset.id, 'comment': this._todoComment.value};
                this._createAjaxParam('update_comment', req, this._received_update_comment()).send();
            }
            this._hiddenComment = null;
        }
    }
    _received_new_comment() {
        return function(respData) {
            var json = JSON.parse(respData);
            var liList = document.getElementById('todo_item_container').getElementsByTagName('li');
            var num1 = liList.length;
            for (var i = 0; i < num1; ++i) {
                var li = liList[i];
                if (!li.classList.contains('todo-item')) continue;      // TODO項目以外
                var sumList = li.getElementsByClassName('summary-title');
                if (sumList.length !== 1) {
                    console.error('no summary title tag');
                    continue;
                }
                var sum = sumList[0];
                if (json['todo-id'] !== sum.dataset.id) continue;       // TODOのIDが異なる
                var comments = li.getElementsByClassName('todo-comment');
                var num2 = comments.length;
                if (num2 === 0) continue;                               // コメントが存在しない
                for (var j = 0; j < num2; ++j) {
                    var comment = comments[j];
                    if (json['temp-id'] === comment.dataset.id) {
                        comment.dataset.id = json['id'];
                        return;
                    }
                }
            }
        };
    }

    _received_update_comment() {
        return function(respData) {
            // コメントの更新（レスポンス受信）では、特に何もしない
            var json = JSON.parse(respData);
            console.log('comment updated(id:' + json['id'] + ')')
        };
    }

    _myPage_click() {
        var self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_event(event);
            }, 0);
        }
    }

    _execute_event(event) {
        var tag = event.target;
        if (tag.classList.contains('new-todo-label-content')) {
            this._addTodoStart(event);
        } else if (tag.classList.contains('add-comment')) {
            this._addCommentStart(event)
        } else if (tag.classList.contains('todo-comment')) {
            this._editCommentStart(event)
        } else if (tag.classList.contains('add-todo-tag')) {
            this._addTodoTagStart(event)
        }
    }

    _addTodoStart(event) {
        var newTodoLabel = document.getElementById('new_todo_label');
        newTodoLabel.style.display = 'none';

        var todoList = document.getElementById('todo_item_container');
        this._todoTitle.value = '';
        todoList.prepend(this._todoTitle);
        this._todoTitle.focus();
        this._setMode(this._MODE.ADD_TODO);
    }

    _addCommentStart(event) {
        if (document.getElementById("new_todo_comment") != null) {
            this._restoreComment();
        }
        this._todoComment.value = '';
        event.target.parentNode.parentNode.insertBefore(this._todoComment, event.target.parentNode);
        this._todoComment.focus();
        this._setMode(this._MODE.ADD_COMMENT);
    }

    _editCommentStart(event) {
        if (document.getElementById("new_todo_comment") != null) {
            this._restoreComment();
        }
        this._todoComment.value = event.target.textContent;
        event.target.style.display = 'none';
        event.target.parentNode.insertBefore(this._todoComment, event.target);
        this._todoComment.focus();
        this._setMode(this._MODE.EDIT_COMMENT);
        this._hiddenComment = event.target;
    }

    _restoreComment() {
        this._todoComment.remove();
        if (this._hiddenComment) {
            this._hiddenComment.style.display = 'block';
            this._hiddenComment = null;
        }
    }

    _addTodoTagStart(event) {

    }

    _showTodo(json) {
        this._removeAllTodo();
        this._appendTodo(json);
    }

    _removeAllTodo() {
        var liList = Array.from(document.getElementById('todo_item_container').getElementsByTagName('li'));
        liList.forEach(function(li){
            if (li.classList.contains('todo-item')) {
                li.remove();
            }
        });
    }

    _appendTodo(json) {
        var todoContainer = document.getElementById('todo_item_container');
        var self = this;
        json.todo_list.forEach(function(todoItem) {
            // var li = document.createElement('li');
            // li.classList.add('todo-item');
            // li.appendChild(self._createDetailsTag(todoItem));
            // todoContainer.appendChild(li);
            todoContainer.appendChild(self._createDetailsTag(todoItem));
        })
    }

    _createDetailsTag(todoItemJson) {
        var todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        // サマリー
        var summaryDiv = document.createElement('div');
        summaryDiv.classList.add('todo-summary');
        var p = document.createElement('p');
        p.classList.add('todo-li-icon');
        p.classList.add('todo-li-icon-close');
        summaryDiv.appendChild(p);
        p = document.createElement('p');
        p.classList.add('summary-title');
        p.dataset.id = todoItemJson.summary.id;
        p.innerText = todoItemJson.summary.title
        summaryDiv.appendChild(p);
        todoItem.appendChild(summaryDiv);
        // コメント
        var detail = document.createElement('div');
        detail.classList.add('todo-detail-dody');
        detail.classList.add('todo-details-close');
        todoItemJson.comments.forEach(function(comment) {
            var p = document.createElement('p');
            p.classList.add('todo-comment');
            p.dataset.id = comment.id;
            p.innerText = comment.content;
            detail.appendChild(p);
        });
        // コメントを追加するボタン
        var opeDiv = document.createElement('div');
        opeDiv.classList.add('todo-detail-ope');
        var addComment = document.createElement('p');
        addComment.classList.add('add-comment');
        addComment.innerText = '+ comment';
        opeDiv.appendChild(addComment)
        detail.appendChild(opeDiv);
        // タグ
        var tagDiv = document.createElement('div');
        todoItemJson.tags.forEach(function(tag) {
            var p = document.createElement('p');
            p.classList.add('todo-tag');
            p.dataset.id = tag.id;
            p.innerText = tag.name;
            tagDiv.appendChild(p);
        });
        // タグを追加するボタン
        var addTag = document.createElement('p');
        addTag.classList.add('add-todo-tag');
        addTag.innerText = '+ tag';
        tagDiv.appendChild(addTag);
        detail.appendChild(tagDiv);

        todoItem.appendChild(detail);

        return todoItem;
    }

    _getTempId() {
        var now = new Date();
        return super._formatDate(now, 'yyyyMMdd_HHmmss.SSS');
    }
    _clickEvent() {
        var self = this;
        return function(event) {
            if (event.target.classList.contains('todo-li-icon')) {
                setTimeout(function() {
                    self._clickSummary(event);
                }, 0);
            }
        }
    }
    _clickSummary(event) {
        //console.log(event.target);
        var li = event.target.parentNode.parentNode;
        var details = li.getElementsByClassName('todo-detail-dody');
        if (details.length !== 1) {
            console.error('no details');
            return;
        }
        var detail = details[0];
        if (detail.classList.contains('todo-details-close')) {
            event.target.classList.remove('todo-li-icon-close');
            event.target.classList.add('todo-li-icon-open');
        } else {
            event.target.classList.remove('todo-li-icon-open');
            event.target.classList.add('todo-li-icon-close');
        }
        detail.classList.toggle('todo-details-close');
    }

    _setModeFree() {
        this._setMode(this._MODE.IDLE);
    }

    _setMode(mode) {
        this._mode = mode;
    }

    _MODE = {
        IDLE: -1,
        ADD_TODO: 1, EDIt_TODO: 2,
        ADD_COMMENT: 11, EDIT_COMMENT:12
    }
/*
    _test_data = {
        "todo_list": [
            {
                "summary": {"id": 11, "title": "TODOのステータスがわからない"},
                "comments": [],
                "tags": [
                    {"id": 100, "name": "TODO アプリ"}
                ]
            },
            {
                "summary": {"id": 10, "title": "新規TODOの入力用にコンポーネントの作成を行う"},
                "comments": [],
                "tags": [
                    {"id": 100, "name": "TODO アプリ"}
                ]
            },
            {
                "summary": {"id": 11, "title": "TODOの新規登録は、ボタンレイアウトにする"},
                "comments": [{"id": 10001, "content":"コメントまたはタグと同じcssにする"},
                             {"id": 10002, "content":"2021/9/28 対応完了"}],
                "tags": [
                    {"id": 100, "name": "TODO アプリ"}
                ]
            },
            {
                "summary": {"id": 1, "title": "todo #1"},
                "comments": [
                    {"id": 100, "content":"コメント1-1"}, {"id": 351, "content":"コメント1-2"}
                ],
                "tags": [
                    {"id": 1, "name": "コンピュータ"}, {"id": 2, "name": "python"}
                ]
            },
            {
                "summary": {"id": 2, "title": "todo #2"},
                "comments": [],
                "tags": []
            },
            {
                "summary": {"id": 3, "title": "todo #3"},
                "comments": [
                    {"id": 1020, "content":"コメント3-1"}
                ],
                "tags": []
            }
        ]
    }
*/
}