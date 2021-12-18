class TodoMainPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._DATE1_FMT = '登録日 : MM/dd HH:mm';
        this._DATE2_WORKING_FMT = '着手日 : MM/dd HH:mm';
        this._DATE2_FINISHED_FMT = '完了日 : MM/dd HH:mm';
        this._todo_status = [];
        this._todo_status_css = [
            {id: '0', css: null}, {id: '10', css: 'todo-doing'}, {id: '20', css: 'todo-done'}
        ]
        this._compFlg = false;
        this.todo_category_id = '';
        this._setModeFree();
        this._createTodoTitle();
        this._createComment()

        super._addClickEvent();
        super._addDoubleClickEvent();
        super._addChangeEvent();
        super._addCompositionEvent();
    }

    pageShown(ifData) {
        this.todo_category_id = ifData['category_id'];
        var h = document.getElementById('header-title');
        if (h !== null) {
            h.innerText = 'TODO アプリ【' + ifData['category_name'] + '】';
        } else {
            console.error('no header id (header-title)');
        }
        let self = this;
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
        this._todoTitle.addEventListener('keydown', this._keyInputTodoTitle());
    }

    _createComment() {
        var textAtra = document.createElement('textarea');
        textAtra.id = 'new_todo_comment';
        textAtra.rows = 5;
        textAtra.setAttribute("type", "text");
        textAtra.placeholder = 'コメントを入力';
        textAtra.addEventListener('keydown', this._keyInputComment());
        var iconTag = document.createElement('p');
        iconTag.classList.add('comment-fix')
        var body = document.createElement('div');

        body.appendChild(textAtra);
        body.appendChild(iconTag);
        this._todoComment = body;
    }

    get _commentTextarea() {
        return this._todoComment.firstChild;
    }

    get _commentValue() {
        return this._commentTextarea.value;
    }

    set _commentValue(value) {
        this._commentTextarea.value = value;
    }

    _keyInputTodoTitle() {
        var self = this;
        return function(event) {
            if (self._compFlg) return;
            if ((event.code.toLowerCase() !== 'enter') && (event.code.toLowerCase() !== 'escape')) return;
            setTimeout(function() {
                self._execute_keyInputTodoTitle(event);
            }, 0);
        }
    }

    _keyInputComment() {
        var self = this;
        return function(event) {
            if (self._compFlg) return;
            if (event.code.toLowerCase() === 'escape') {
                self._todoComment.remove();
                if (self._hiddenComment) {
                    self._hiddenComment.style.display = 'block';
                    self._hiddenComment = null;
                }
            }
        }
    }

    _execute_keyInputTodoTitle(event) {
        this._todoTitle.remove();
        var isNewTodo = this._mode === this._MODE.ADD_TODO;
        this._setModeFree();
        var newTodoLabel = document.getElementById('new_todo_label');
        newTodoLabel.style.display = 'block';
        if (this._todoTitle.value === '') return;

        if (isNewTodo) {
            if (event.code.toLowerCase() === 'escape') return;
            var tmpId = this._getTempId();
            var newTodo = {
                "summary": {"id": tmpId, "title": this._todoTitle.value},
                "comments": [],
                "tags": []
            };
            newTodoLabel.parentNode.insertBefore(this._createDetailsTag(newTodo),
                                                 newTodoLabel.nextElementSibling);

            // サーバ登録
            var req = {'title': this._todoTitle.value, 'temp-id': tmpId, 'category-id': this.todo_category_id};
            super._createAjaxParam('add_todo', req, this._received_new_todo()).send();
        } else {
            var changed = false;
            if (event.code.toLowerCase() !== 'escape') {
                changed = (this._hiddenTodo.innerText !== this._todoTitle.value);
                this._hiddenTodo.innerText = this._todoTitle.value;
            }
            this._hiddenTodo.style.display = 'block';
            if (changed) {
                // サーバ更新
                let todoId = this._getTodoID(this._hiddenTodo);
                var req = {'id': todoId, 'title': this._hiddenTodo.innerText};
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
        let self = this;
        return function(respData) {
            var json = JSON.parse(respData);
            var liList = document.getElementById('todo_item_container').getElementsByTagName('li');
            var num = liList.length;
            let li;
            let found = false;
            for (var i = 0; i < num; ++i) {
                li = liList[i];
                if (!li.classList.contains('todo-item')) continue;
                if (json['temp-id'] === li.dataset.id) {
                    li.dataset.id = json['id'];
                    found = true;
                    break;
                }
            }
            if (found) {
                // 登録日時の表示
                let ls = li.getElementsByClassName('summary-date1');
                if (ls.length === 1) {
                    ls[0].innerText = self._formatDate(new Date(json['date1']), self._DATE1_FMT);
                } else {
                    console.error('no new todo date1.');
                }
            } else {
                console.error('no new todo.');
            }
        };
    }

    _getParentNodeByClassName(childTag, className) {
        let pNode = childTag;
        while (!pNode.classList.contains(className)) {
            pNode = pNode.parentNode;
            if (pNode === null) {
                console.error('no parent tag containing ' + className);
                return null;
            }
        }
        return pNode;
    }

    _setCommentHtml(target, content) {
        while(target.lastChild) {
            target.removeChild(target.lastChild);
        }
        let md = new MarkdownToHtml(content);
        md.setHtml(target);

        let s = target.nextElementSibling;
        s.innerText = content;
    }

    _execute_todoComment(event) {
        var todoId = this._getTodoID(event.target);
        let parent = this._getParentNodeByClassName(event.target, 'todo-detail-dody');
        this._todoComment.remove();
        var isNewComment = this._mode === this._MODE.ADD_COMMENT;
        this._setModeFree();

        var content = this._commentValue.trim().replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/\n/g, '<br>');
        if (isNewComment) {
            let tempId = this._getTempId();
            let c = this._createCommentTag({'id': tempId, 'content': content});
            let w = parent.lastElementChild;    // tag の設定要素
            parent.insertBefore(c, w.previousElementSibling);   // コメントの追加やステータスの設定を行う要素のの前に追加
            // サーバ登録
            var req = {'todo-id': todoId, 'comment': content, 'temp-id': tempId};
            super._createAjaxParam('add_comment', req, this._received_new_comment()).send();
        } else {
            let srcTag = this._hiddenComment.nextElementSibling;
            var changed = (srcTag.innerText !== content);
            var empty = (this._commentValue.trim() === '');
            this._setCommentHtml(this._hiddenComment, content);
            this._hiddenComment.style.display = 'block';
            if (changed && !empty) {
                // サーバ更新
                var req = {'todo-id': todoId, 'id': this._hiddenComment.dataset.id, 'comment': content};
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
            console.log('comment add response');
            console.log(json);
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
            console.error('no todo comment at add responce');
        };
    }

    _received_update_comment() {
        return function(respData) {
            // コメントの更新（レスポンス受信）では、特に何もしない
            // var json = JSON.parse(respData);
            // console.log('comment updated(id:' + json['id'] + ')');
        };
    }

    _received_delete_comment() {
        let self = this;
        return function(respData) {
            // コメントの削除（レスポンス受信）
            var json = JSON.parse(respData);
            console.log('comment delete response');
            console.log(json);

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
                    if (json['id'] === comment.dataset.id) {
                        let parent = self._getParentNodeByClassName(comment, 'todo-comment-container');
                        parent.remove();
                        return;
                    }
                }
            }
            console.error('no todo comment at delete response');
        };
    }

    _compositionEvent(event) {
        try {
            this._compFlg = (event.type.toLowerCase() === 'compositionstart');
        } finally {
            super._compositionEvent(event);
        }
    }

    _clickEvent(event) {
        try {
            let classList = event.target.classList;
            if (classList.contains('new-todo-label-content')) {
                this._addTodoStart(event);          // 新規にTODOを作成
            } else if (classList.contains('add-comment')) {
                this._addCommentStart(event);       // 新規にTODOコメントを作成
            } else if (classList.contains('todo-li-icon')) {
                this._clickSummary(event);          // TODOタイトルを展開／閉じる
            } else if (classList.contains('summary-title')) {
                this._clickSummary(event);          // TODOタイトルを展開／閉じる
            } else if (classList.contains('trash-icon')) {
                this._deleteTodo(event);            // TODO削除
            } else if (classList.contains('add-todo-tag')) {
                this._addTodoTag(event);            // TODOにタグを設定
            } else if (classList.contains('comment-fix')) {
                this._execute_todoComment(event);   // TODOコメントの編集終了
            } else if (classList.contains('move-category')) {
                // カテゴリの移動
                this._changeCategoryTodoId = this._getTodoID(event.target);
                super._createAjaxParam('read_category', {'type': '1'}, this._response_readCategory()).send();
            }
        } finally {
            super._clickEvent(event);
        }
    }
    _doubleClickEvent(event) {
        try {
            let target = event.target;
            let classList = target.classList;
            if (classList.contains('todo-comment')) {
                this._editCommentStart(event);      // TODOコメントを編集
            } else if (classList.contains('summary-title')) {
                this._editTodoTitleStart(event);    // TODOタイトルを編集
            } else if (target.id === 'new_todo_comment') {
                this._execute_todoComment(event);
            }
        } finally {
            super._doubleClickEvent(event);
        }
    }

    _changeEvent(event) {
        try {
            if (!event.target.classList.contains('todo-status')) return;

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
        } finally {
            super._changeEvent(event);
        }
    }

    _response_readCategory() {
        var self = this;
        return function(respData) {
            let json = JSON.parse(respData);
            // 現在表示中のカテゴリを選択中にする
            let num = json['category_list'].length;
            for (let index = 0; index < num; ++index) {
                var item = json['category_list'][index];
                if (item['id'] === self.todo_category_id) {
                    item['selected'] = true;
                    break;
                }
            }
            // console.log(movList);
            _pager.popupPageById('PP0003', json['category_list']);
        }
    }

    _received_update_status() {
        var self = this;
        return function(respData) {
            let json = JSON.parse(respData);
            let date2 = "";             // 未着手は空欄に変更
            // 着手または完了で日時を設定
            if (json['status'] == '10') {
                date2 = self._formatDate(new Date(json['date2']), self._DATE2_WORKING_FMT);
            } else if (json['status'] == '20') {
                date2 = self._formatDate(new Date(json['date2']), self._DATE2_FINISHED_FMT);
            }
            let liList = document.getElementById('todo_item_container').getElementsByTagName('li');
            let num = liList.length;
            let li;
            let found = false;
            for (var i = 0; i < num; ++i) {
                li = liList[i];
                if (!li.classList.contains('todo-item')) continue;
                if (json['id'] === li.dataset.id) {
                    found = true;
                    break;
                }
            }
            if (found) {
                // 着手または完了日時の表示
                let ls = li.getElementsByClassName('summary-date2');
                if (ls.length === 1) {
                    ls[0].innerText = date2;
                } else {
                    console.error('no status update todo date2.');
                }
            } else {
                console.error('no status update todo.');
            }
        };
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

        this._commentValue = '';
        event.target.parentNode.parentNode.insertBefore(this._todoComment, event.target.parentNode);
        this._commentTextarea.focus();
        this._setMode(this._MODE.ADD_COMMENT);
    }

    _editCommentStart(event) {
        // 入力用のタグを非表示にする
        this._removeInputTags();

        let p = this._getParentNodeByClassName(event.target, 'todo-comment');
        let s = p.nextElementSibling.innerText;
        this._commentValue = s.replaceAll('<br>', '\n').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
        event.target.style.display = 'none';
        event.target.parentNode.insertBefore(this._todoComment, event.target);
        this._commentTextarea.focus();
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

    _createCommentTag(comment) {
        let c = document.createElement('div');
        c.classList.add('todo-comment-container');
        let pv = document.createElement('div');
        pv.classList.add('todo-comment');
        pv.dataset.id = comment.id;
        c.appendChild(pv);
        // 非表示のタグは、表示用タグの後に配置する
        let ps = document.createElement('p');
        ps.classList.add('todo-comment-source');
        c.appendChild(ps);

        this._setCommentHtml(pv, comment.content);

        return c;
    }

    _createDate1HtmlTag(date) {
        let tag = document.createElement('span');
        tag.classList.add('summary-date1');
        if (date !== null) {
            tag.innerText = super._formatDate(new Date(date), this._DATE1_FMT);
        }
        return tag;
    }

    _createDate2HtmlTag(date, fmt) {
        let tag = document.createElement('span');
        tag.classList.add('summary-date2');
        if (date !== null) {
            tag.innerText = super._formatDate(new Date(date), fmt);
        }
        return tag;
    }

    _createDetailsTag(todoItemJson) {
        var self = this;
        var todoItem = document.createElement('li');
        todoItem.dataset.id = todoItemJson.summary.id;
        todoItem.classList.add('todo-item');
        // サマリー
        var summaryDiv = document.createElement('div');
        summaryDiv.classList.add('todo-summary-title');
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
        var sumBlk = document.createElement('div');
        sumBlk.classList.add('todo-summary-block');
        sumBlk.appendChild(summaryDiv);
        // 日付
        var dateDiv = document.createElement('div');
        dateDiv.classList.add('summary-date');
        let dateTag;
        if (todoItemJson.summary.status === '10') {
            dateTag = this._createDate2HtmlTag(todoItemJson.summary.date2, this._DATE2_WORKING_FMT);
        } else if (todoItemJson.summary.status === '20') {
            dateTag = this._createDate2HtmlTag(todoItemJson.summary.date2, this._DATE2_FINISHED_FMT);
        } else {
            dateTag = this._createDate2HtmlTag(null, null);
        }
        dateDiv.appendChild(dateTag);
        if (todoItemJson.summary.date1) {
            dateTag = this._createDate1HtmlTag(todoItemJson.summary.date1);
        } else {
            dateTag = this._createDate1HtmlTag(null, null);
        }
        dateDiv.appendChild(dateTag);
        sumBlk.appendChild(dateDiv);

        todoItem.appendChild(sumBlk);
        // コメント
        var detail = document.createElement('div');
        detail.classList.add('todo-detail-dody');
        detail.classList.add('todo-details-close');
        todoItemJson.comments.forEach(function(comment) {
            detail.appendChild(self._createCommentTag(comment));
        });
        // コメントを追加するボタン
        var opeDiv = document.createElement('div');
        opeDiv.classList.add('todo-detail-ope');
        var addComment = document.createElement('p');
        addComment.classList.add('add-comment');
        addComment.innerText = '+ comment';
        opeDiv.appendChild(addComment)
        detail.appendChild(opeDiv);
        // 状態
        var stat = document.createElement('select');
        stat.classList.add('todo-status');
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
        statLabel.classList.add('todo-status-label');
        statLabel.innerText = '状態 : ';
        statLabel.appendChild(stat);
        opeDiv.appendChild(statLabel);
        // カテゴリ移動アイコン
        let mov = document.createElement('p');
        mov.classList.add('move-category');
        opeDiv.appendChild(mov);
        // タグ
        var tagDiv = document.createElement('div');
        todoItemJson.tags.forEach(function(tag) {
            tagDiv.appendChild(self._createTodoTag(tag.id, tag.name));
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
        let target;
        if (event.target.classList.contains('summary-title')) {
            target = event.target.previousElementSibling;       // タイトルの前にTODO開閉のアイコンを配置している
        } else {
            target = event.target;
        }
        var li = this._getTodoLiTag(target);
        var details = li.getElementsByClassName('todo-detail-dody');
        if (details.length !== 1) {
            console.error('no details');
            return;
        }
        var detail = details[0];
        if (detail.classList.contains('todo-details-close')) {
            target.classList.remove('todo-li-icon-close');
            target.classList.add('todo-li-icon-open');
        } else {
            target.classList.remove('todo-li-icon-open');
            target.classList.add('todo-li-icon-close');
        }
        detail.classList.toggle('todo-details-close');
    }

    _deleteTodo(event) {
        var title = event.target.previousElementSibling;    // ゴミ箱アイコンの前にTODOタイトルを配置している
        if (title === null) {
            console.error('no summary title tag');
            return;
        }
        var id = this._getTodoID(title);
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
        _pager.popupPageById('PP0001', {'todo-id': todoId, 'tags': tags});
    }

    _findTodoTagById(todoId) {
        let liList = super._getMyPage.getElementsByTagName('li');
        let num = liList.length;
        for (let index = 0; index < num; ++index) {
            var li = liList[index];
            if (!li.classList.contains('todo-item')) continue;
            if (li.dataset.id === todoId) {
                return li;
            }
        }
        console.error('there is none todo (id:' + todoId + ')');
        return null;
    }

    closedForm(pid, ifData) {
        if (ifData === undefined) return;
        if (pid === 'PP0001') {
            this._updateTodoTags(ifData);
            this._updateTodoTagServer(ifData);
            this._refreshOtherTodoTags(ifData);
        } else if (pid === 'PP0003') {
            let catId = ifData['selected-id'];
            if (catId === this.todo_category_id) return;
            let req = {'todo-id': this._changeCategoryTodoId, 'category_id_fm': this.todo_category_id, 'category_id_to': catId};
            super._createAjaxParam('move_category', req, this._moveCategory()).send();
        } else {
            console.error(pid + ' is not support');
        }
    }

    _moveCategory() {
        var self = this;
        return function(respData) {
            let resp = JSON.parse(respData);
            let todo = self._findTodoTagById(resp['todo-id']);
            if (todo) {
                todo.remove();
            }
        }
    }

    _updateTodoTags(tagInfo) {
        let todos = this._getElementsByClassName(this._getMyPage, 'todo-item', true);
        let num = todos.length;
        let targetTodo = null;
        let todoId = tagInfo['todo-id'];
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
        var addTag = this._getElementsByClassName(targetTodo, 'add-todo-tag');      // + tag を検索
        if (addTag === null) return;

        var pTag = addTag.parentNode;
        while (pTag.firstChild) pTag.removeChild(pTag.firstChild);
        var tags = tagInfo['tags'];
        for (var i = 0; i < tags.length; ++i) {
            pTag.appendChild(this._createTodoTag(tags[i]['id'], tags[i]['name']));
        }
        pTag.appendChild(addTag);
    }

    _createTodoTag(id, name) {
        var tag = document.createElement("p");
        tag.dataset.id = id;
        tag.innerText = name;
        tag.classList.add('todo-tag');
        return tag;
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

    _refreshOtherTodoTags(tagInfo) {
        let todoId = tagInfo['todo-id'];
        let tagList = tagInfo['tag-list'];
        let todos = this._getElementsByClassName(this._getMyPage, 'todo-item');
        let num = todos.length;
        for (var i = 0; i < num; ++i) {
            var todo = todos[i];
            if (todo.dataset.id !== todoId) {
                this._refreshTodoTags(todo, tagList);
            }
        }
    }

    _refreshTodoTags(todo, tagList) {
        let tags = this._getElementsByClassName(todo, 'todo-tag', true, false);
        if (tags === null) return;
        let num = tags.length;
        for (let tagIndex = 0; tagIndex < num; ++tagIndex) {
            let tag = tags[tagIndex];
            let dataId = tag.dataset.id;
            let found = false;
            for (let index = 0; index < tagList.length; ++index) {
                if (dataId === tagList[index].id) {
                    tag.innerText = tagList[index].name;
                    found = true;
                    break;
                }
            }
            if (!found) {
                tag.remove();
            }
        };
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