class TodoMainPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._setModeFree();
        this._createNewTodoTitle();
        this._createNewComment()
        //this._showTodo(this._test_data);

        var myPage = document.getElementById(p);
        myPage.addEventListener('click', this._myPage_click());

        setTimeout(function() {
            this._loadTodo();
        }, 0);
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

    _loadTodo() {
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: this._urlPrefix() + '/read_todo',
            requestHeaders: [],
            txData: {},
            timeout: 5000,
            responseReveived: this._postalcodeResponse(this),
        });
        ajax.send();
    }

    _createNewTodoTitle() {
        this._todoTitle = document.createElement('input');
        this._todoTitle.id = 'new_todo_title';
        this._todoTitle.setAttribute("type", "text");
        this._todoTitle.placeholder = '新規のTODOを入力';
        this._todoTitle.addEventListener('keydown', this._inputNewTodoTitle());
    }

    _createNewComment() {
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
                self._execute_inputTodoComment(event);
            }, 0);
        }
    }

    _execute_inputNewTodoTitle(event) {
        this._todoTitle.remove();
        this._setModeFree();
        var newTodoLabel = document.getElementById('new_todo_label');
        newTodoLabel.style.display = 'block';
        if (this._todoTitle.value === '') return;

        var newTodo =             {
            "summary": {"id": this._getTempId(), "title": this._todoTitle.value},
            "comments": [],
            "tags": []
        }
        var todoItem = this._createDetailsTag(newTodo);
        newTodoLabel.parentNode.insertBefore(todoItem, newTodoLabel.nextElementSibling);
    }

    _execute_inputTodoComment(event) {
        var parent = event.target.parentNode;
        var ope = parent.getElementsByClassName('todo-detail-ope');
        this._todoComment.remove();
        var isNewComment = this._mode === this._MODE.ADD_COMMENT;
        this._setModeFree();
        if (ope.length !== 1 && isNewComment) return;

        if (isNewComment) {
            var p = document.createElement('p');
            p.classList.add('todo-comment');
            p.dataset.id = this._getTempId();
            p.innerText = this._todoComment.value;
            parent.insertBefore(p, ope[0]);
        } else {
            this._hiddenComment.innerText = this._todoComment.value;
            this._hiddenComment.style.display = 'block';
            this._hiddenComment = null;
        }
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
            var li = document.createElement('li');
            li.classList.add('todo-item');
            li.appendChild(self._createDetailsTag(todoItem));
            todoContainer.appendChild(li);
        })
    }

    _createDetailsTag(todoItem) {
        var details = document.createElement('details');
        // タイトル
        var summary = document.createElement('summary');
        summary.dataset.id = todoItem.summary.id;
        summary.innerText = todoItem.summary.title;
        details.appendChild(summary);

        var detailBody = document.createElement('div');
        detailBody.classList.add('todo-detail-dody');
        // コメント部
        todoItem.comments.forEach(function(comment) {
            var p = document.createElement('p');
            p.classList.add('todo-comment');
            p.dataset.id = comment.id;
            p.innerText = comment.content;
            detailBody.appendChild(p);
        });
        // コメントを追加するボタン
        var opeDiv = document.createElement('div');
        opeDiv.classList.add('todo-detail-ope');
        var addComment = document.createElement('p');
        addComment.classList.add('add-comment');
        addComment.innerText = '+ comment';
        opeDiv.appendChild(addComment)
        detailBody.appendChild(opeDiv);
        // タグ
        var tagDiv = document.createElement('div');
        todoItem.tags.forEach(function(tag) {
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
        detailBody.appendChild(tagDiv);

        details.appendChild(detailBody);
        return details;
    }

    _getTempId() {
        var now = new Date();
        return super._formatDate(now, 'yyyyMMdd_HHmmss.SSS');
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