class TodoMainPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._todo_status = [];
        this._todo_status_css = [
            {id: '0', css: null}, {id: '10', css: 'todo-doing'}, {id: '20', css: 'todo-done'}
        ]
        this._setModeFree();
        this._createTodoTitle();
        this._createComment()

        var myPage = document.getElementById(p);
        myPage.addEventListener('click', this._myPage_click());
        myPage.addEventListener('change', this._myPage_change());
    }

    pageShown(ifData) {
        var self = this;
        setTimeout(function() {
            self._createAjaxParam('read_todo', ifData, self._execute_ShowTodo()).send();
        }, 0);
        super.pageShown(ifData);
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
        this._todoTitle.addEventListener('keydown', this._inputTodoTitle());
    }

    _createComment() {
        this._todoComment = document.createElement('textarea');
        this._todoComment.id = 'new_todo_comment';
        this._todoComment.rows = 5;
        this._todoComment.setAttribute("type", "text");
        this._todoComment.placeholder = 'コメントを入力';
        this._todoComment.addEventListener('dblclick', this._inputTodoComment());
    }

    _inputTodoTitle() {
        var self = this;
        return function(event) {
            if (event.keyCode != 13) return;
            setTimeout(function() {
                self._execute_inputTodoTitle(event);
            }, 0);
        }
    }

    _inputTodoComment() {
        var self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_todoComment(event);
            }, 0);
        }
    }

    _execute_inputTodoTitle(event) {
        this._todoTitle.remove();
        var isNewTodo = this._mode === this._MODE.ADD_TODO;
        this._setModeFree();
        var newTodoLabel = document.getElementById('new_todo_label');
        newTodoLabel.style.display = 'block';
        if (this._todoTitle.value === '') return;

        if (isNewTodo) {
            var tmpId = this._getTempId();
            var newTodo = {
                "summary": {"id": tmpId, "title": this._todoTitle.value},
                "comments": [],
                "tags": []
            };
            newTodoLabel.parentNode.insertBefore(this._createDetailsTag(newTodo),
                                                 newTodoLabel.nextElementSibling);
    
            // サーバ登録
            var req = {'title': this._todoTitle.value, 'temp-id': tmpId};
            super._createAjaxParam('add_todo', req, this._received_new_todo()).send();
        } else {
            var changed = (this._hiddenTodo.innerText !== this._todoTitle.value);
            this._hiddenTodo.innerText = this._todoTitle.value;
            this._hiddenTodo.style.display = 'block';
            if (changed) {
                // サーバ更新
                var parent = this._hiddenTodo.parentNode.parentNode;
                var req = {'id': parent.dataset.id, 'title': this._hiddenTodo.innerText};
                super._createAjaxParam('update_todo', req, this._received_update_todo()).send();
            }
            this._hiddenTodo = null;
        }
    }
    _received_update_todo() {
        return function(respData) {
            // TODOタイトルの更新（レスポンス受信）では、特に何もしない
            var json = JSON.parse(respData);
            console.log('TODO updated(id:' + json['id'] + ')');
        };
    }
    _received_new_todo() {
        return function(respData) {
            var json = JSON.parse(respData);
            var liList = document.getElementById('todo_item_container').getElementsByTagName('li');
            var num = liList.length;
            for (var i = 0; i < num; ++i) {
                var li = liList[i];
                if (!li.classList.contains('todo-item')) continue;
                if (json['temp-id'] === li.dataset.id) {
                    li.dataset.id = json['id'];
                    return;
                }
            }
            console.error('no new todo.\n' + json);
        };
    }

    _execute_todoComment(event) {
        var parent = event.target.parentNode;
        var ope = parent.getElementsByClassName('todo-detail-ope');
        var todoId = this._getTodoID(event.target);
        this._todoComment.remove();
        var isNewComment = this._mode === this._MODE.ADD_COMMENT;
        this._setModeFree();
        if (ope.length !== 1) return;

        var content = this._todoComment.value.replaceAll(/\n/g, '<br>');
        if (isNewComment) {
            var tmpId = this._getTempId();
            var p = document.createElement('p');
            p.classList.add('todo-comment');
            p.dataset.id = tmpId;
            p.innerHTML = content;
            parent.insertBefore(p, ope[0]);

            // サーバ登録
            var req = {'todo-id': todoId, 'comment': content, 'temp-id': tmpId};
            super._createAjaxParam('add_comment', req, this._received_new_comment()).send();
        } else {
            var changed = (this._hiddenComment.innerText !== this._todoComment.value.trim());
            var empty = (this._todoComment.value.trim() === '');
            this._hiddenComment.innerHTML = content;
            this._hiddenComment.style.display = 'block';
            if (changed && !empty) {
                // サーバ更新
                var req = {'id': this._hiddenComment.dataset.id, 'comment': content};
                super._createAjaxParam('update_comment', req, this._received_update_comment()).send();
            } else if (empty) {
                // サーバ削除
                var req = {'todo-id': todoId, 'id': this._hiddenComment.dataset.id};
                super._createAjaxParam('delete_comment', req, this._received_delete_comment()).send();
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
                if (json['todo-id'] !== li.dataset.id) continue;        // TODOのIDが異なる
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
            console.error('no todo comment\n' + json);
        };
    }

    _received_update_comment() {
        return function(respData) {
            // コメントの更新（レスポンス受信）では、特に何もしない
            var json = JSON.parse(respData);
            console.log('comment updated(id:' + json['id'] + ')');
        };
    }

    _received_delete_comment() {
        return function(respData) {
            // コメントの削除（レスポンス受信）
            var json = JSON.parse(respData);
            console.log('comment updated(id:' + json['id'] + ')');
        };
    }

    _myPage_click() {
        var self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_click_event(event);
            }, 0);
        }
    }

    _myPage_change() {
        var self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_change_event(event);
            }, 0);
        }
    }

    _execute_click_event(event) {
        var tag = event.target;
        if (tag.classList.contains('new-todo-label-content')) {
            this._addTodoStart(event);          // 新規にTODOを作成
        } else if (tag.classList.contains('add-comment')) {
            this._addCommentStart(event);       // 新規にTODOコメントを作成
        } else if (tag.classList.contains('todo-comment')) {
            this._editCommentStart(event);      // TODOコメントを編集
        } else if (tag.classList.contains('summary-title')) {
            this._editTodoTitleStart(event);    // TODOタイトルを編集
        } else if (tag.classList.contains('todo-li-icon')) {
            this._clickSummary(event);          // TODOタイトルを編集
        } else if (tag.classList.contains('trash-icon')) {
            this._deleteTodo(event);            // TODO削除
        } else if (tag.classList.contains('add-todo-tag')) {
            this._addTodoTag(event);            // TODOにタグを設定
        }
    }

    _execute_change_event(event) {
        // console.log(event.target.value);
        var li = this._getTodoLiTag(event.target);
        if (li === null) return;
        var todoId = li.dataset.id;
        var tags = li.getElementsByClassName('summary-title');
        if (tags.length !== 1) {
            console.error('no todo taitle class (summary-title)');
            return;
        }
        var statId = event.target.value;
        var req = {'id': todoId, 'status': statId};
        super._createAjaxParam('update_status', req, this._received_update_status()).send();

        var sumTag = tags[0];
        this._todo_status_css.forEach((item) => {
            if (item.id === statId) {
                if (item.css !== null) {
                    sumTag.classList.add(item.css);
                }
            } else {
                if (item.css !== null) {
                    sumTag.classList.remove(item.css);
                }
            }
        });
    }
    _received_update_status() {
        var self = this;
        return function(respData) {
            // TODO状態の更新レスポンスは、処理しない
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
        // 入力用のタグを非表示にする
        this._removeInputTags();

        this._todoComment.value = '';
        event.target.parentNode.parentNode.insertBefore(this._todoComment, event.target.parentNode);
        this._todoComment.focus();
        this._setMode(this._MODE.ADD_COMMENT);
    }

    _editCommentStart(event) {
        // 入力用のタグを非表示にする
        this._removeInputTags();

        this._todoComment.value = event.target.innerHTML.replaceAll('<br>', '\n');
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

    _removeInputTags() {
        if (document.getElementById("new_todo_title") != null) {
            // TODOタイトル入力のコンポーネントを使っている
            this._restoreTodoTitle();
        }
        if (document.getElementById("new_todo_comment") != null) {
            // コメント入力のコンポーネントを使っている
            this._restoreComment();
        }
    }

    _editTodoTitleStart(event) {
        // 入力用のタグを非表示にする
        this._removeInputTags();

        this._todoTitle.value = event.target.textContent;
        event.target.style.display = 'none';
        event.target.parentNode.insertBefore(this._todoTitle, event.target);
        this._todoTitle.focus();
        this._setMode(this._MODE.EDIT_COMMENT);
        this._hiddenTodo = event.target;
    }

    _restoreTodoTitle() {
        this._todoTitle.remove();
        if (this._hiddenTodo) {
            this._hiddenTodo.style.display = 'block';
            this._hiddenTodo = null;
        }
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
        // console.log(json);
        this._todo_status = json.status_list;
        var todoContainer = document.getElementById('todo_item_container');
        var self = this;
        json.todo_list.forEach(function(todoItem) {
            todoContainer.appendChild(self._createDetailsTag(todoItem));
        })
    }

    _createDetailsTag(todoItemJson) {
        var todoItem = document.createElement('li');
        todoItem.dataset.id = todoItemJson.summary.id;
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
        p.innerText = todoItemJson.summary.title
        this._todo_status_css.forEach((item) => {
            if (item.id === todoItemJson.summary.status) {
                if (item.css !== null) {
                    p.classList.add(item.css);
                }
            }
        });
        summaryDiv.appendChild(p);
        p = document.createElement('p');
        p.classList.add('trash-icon');
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
            p.innerHTML = comment.content;
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
        var stat = document.createElement('select');
        this._todo_status.forEach((opt) => {
            var optTag = document.createElement('option');
            optTag.text = opt.name;
            optTag.value = opt.id;
            if (opt.id === todoItemJson.summary.status) {
                optTag.selected = true;
            }
            stat.appendChild(optTag);
        });
        var statLabel = document.createElement('label');
        statLabel.classList.add('todo-status');
        statLabel.innerText = '状態 : ';
        statLabel.appendChild(stat);
        opeDiv.appendChild(statLabel);
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

    _deleteTodo(event) {
        var parent = event.target.parentNode;
        var titles = parent.getElementsByClassName('summary-title');
        if (titles.length !== 1) {
            console.error('no summary title tag');
            return;
        }
        var title = titles[0];
        var id = parent.parentNode.dataset.id;
        var exec = confirm("「" + title.innerText + "」(id:" + id + ") を削除します");
        if (!exec) return;
        var req = {'id': id};
        super._createAjaxParam('delete_todo', req, this._received_delete_todo()).send();
    }

    _received_delete_todo() {
        var self = this;
        return function(respData) {
            self._execute_delete_todo(JSON.parse(respData));
        }
    }
    _execute_delete_todo(json) {
        var parent = document.getElementById('todo_item_container');
        var todo_items = parent.getElementsByTagName('li');
        var num = todo_items.length;
        for (var i = 0; i < num; ++i) {
            var item = todo_items[i];
            if (!item.classList.contains('todo-item')) continue;
            if (item.dataset.id === json.id) {
                item.remove();
                return;
            }
        }
        console.error('no delete todo');
    }

    _getTodoLiTag(tag) {
        var pNode = tag.parentNode;
        if (pNode === null) return null;
        while (pNode.tagName.toLowerCase() !== 'li') {
            pNode = pNode.parentNode;
            if (pNode === null) {
                console.error('no li(parent) tag');
                return null;
            }
        }
        return pNode;
    }

    _getTodoID(tag) {
        var li = this._getTodoLiTag(tag);
        if (li === null) return null;
        return li.dataset.id;
    }

    _addTodoTag(event) {
        var pTag = event.target.parentNode;
        var tags = [];
        var list = pTag.getElementsByClassName('todo-tag');
        var num = list.length;
        for (var i = 0; i < num; ++i) {
            var item = list[i];
            tags.push(item.dataset.id);
        }
        var todoId = this._getTodoID(pTag);
        // console.log('start _addTodoTag todo(' + todoId + ')');
        _pager.popupPageById('PP0001', {'todo-id': todoId, 'tags': tags});
    }

    closedForm(pid, ifData) {
        if (ifData === undefined) return;
        if (pid === 'PP0001') {
            this._updateTodoTags(ifData);
            this._updateTodoTagServer(ifData);
        } else {
            console.error(pid + ' is not support');
        }
    }

    _updateTodoTags(tagInfo) {
        // console.log(tagInfo);
        var pTag = document.getElementById(this._pageId);
        var todos = pTag.getElementsByClassName('todo-item');
        var num = todos.length;
        var targetTodo = null;
        var todoId = tagInfo['todo-id'];
        for (var i = 0; i < num; ++i) {
            var todo = todos[i];
            if (todo.dataset.id === todoId) {
                targetTodo = todo;
                break;
            }
        }
        if (targetTodo === null) {
            console.error('no todo id (' + todoId + ')');
            return;
        }
        var t = targetTodo.getElementsByClassName('add-todo-tag');      // + tag を検索
        if (t.length !== 1) {
            console.error('add-todo-tag not found');
            return;
        }
        var addTag = t[0];
        pTag = addTag.parentNode;
        while (pTag.firstChild) pTag.removeChild(pTag.firstChild);
        var tags = tagInfo['tags'];
        for (var i = 0; i < tags.length; ++i) {
            var tag = document.createElement("p");
            tag.dataset.id = tags[i]['id'];
            tag.innerText = tags[i]['name'];
            tag.classList.add('todo-tag');
            pTag.appendChild(tag);
        }
        pTag.appendChild(addTag);
    }

    _updateTodoTagServer(tagInfo) {
        var tags = [];
        tagInfo.tags.forEach((item) => {
            tags.push({'id': item.id});
        });
        var req = {'todo-id': tagInfo['todo-id'], 'tags': tags};
        this._createAjaxParam('set_todo_tag', req, this._receive_updateTodoTagServer()).send();
    }

    _receive_updateTodoTagServer() {
        var self = this;
        return function(respData) {
            // TODOタグの設定（レスポンス受信）では、特に何もしない
        }
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
}