class TimeKeeperTaskDataModel {
    constructor() {
        this._taskId = null;
        this._taskTitle = '';
        this._taskRemarks = '';
        this._taskPriority = null;
        this._taskStatus = null;
        this._createDateTime = null;
        this._updateDateTime = null;
        this._taskStartDateTime = null;
        this._taskFinishedDateTime = null;
    }

    get taskId() {return this._taskId;}
    set taskId(val) {this._taskId = val;}
    get taskTitle() {return this._taskTitle;}
    set taskTitle(val) {this._taskTitle = val;}
    get taskRemarks() {return this._taskRemarks;}
    set taskRemarks(val) {this._taskRemarks = val;}
    get taskPriority() {return this._taskPriority;}
    set taskPriority(val) {this._taskPriority = val;}
    get taskStatus() {return this._taskStatus;}
    set taskStatus(val) {this._taskStatus = val;}
    get createDateTime() {return this._createDateTime;}
    set createDateTime(val) {this._createDateTime = val;}
    get updateDateTime() {return this._updateDateTime;}
    set updateDateTime(val) {this._updateDateTime = val;}
    get taskStartDateTime() {this._taskStartDateTime;}
    set taskStartDateTime(val) {this._taskStartDateTime = val;}
    get taskFinishedDateTime() {return this._taskFinishedDateTime;}
    set taskFinishedDateTime(val) {this._taskFinishedDateTime = val;} 

    getTaskInfoFromForm(form, taskId) {
        this._taskId = taskId;
        this._taskTitle = form.elements['new-task-title'].value;
        if (this._taskTitle === '') {
            throw 'no task name';
        }
        this._taskRemarks = form.elements['new-task-remarks'].value;
    }

    setTaskByElement(li) {
        this._taskId = li.dataset.taskId;
        let elmts = li.getElementsByClassName('task-title');
        if (elmts.length === 1) {
            this._taskTitle = elmts[0].textContent;
        }
        elmts = li.getElementsByClassName('task-remarks');
        if (elmts.length === 1) {
            this._taskRemarks = elmts[0].textContent;
        }
    }

    setTaskInforToForm(form) {
        form.elements['new-task-title'].value = this._taskTitle;
        form.elements['new-task-remarks'].value = this._taskRemarks;
    }

    _getBackMenu() {
        let div = document.createElement('div');
        div.classList.add('TG002-back-menu-container');

        let p = document.createElement('p');
        p.classList.add('TG002-back-menu-01');
        p.textContent = '変更';
        div.appendChild(p);

        p = document.createElement('p');
        p.classList.add('TG002-back-menu-02');
        p.textContent = '削除';
        div.appendChild(p);

        return div;
    }

    _editListItem_upperRow() {
        let div = document.createElement('div');
        div.classList.add('TG002-item-upper-row');

        let p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-title');
        p.textContent = this._taskTitle;
        div.appendChild(p);
        
        p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-remarks');
        p.textContent = this._taskRemarks;
        div.appendChild(p);

        return div;
    }

    _editListItem_tailRow() {
        let div = document.createElement('div');
        div.classList.add('TG002-item-tail-row');

        let cbx = document.createElement('input');
        cbx.type = 'checkbox';
        cbx.classList.add('item-select');
        let c = document.createElement('div');
        c.classList.add('TG002-item-vert-middle');
        c.appendChild(cbx);
        div.appendChild(c);

        let p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-priority');
        p.textContent = 'TODO';  // this._taskPriority;
        div.appendChild(p);

        p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-status');
        p.textContent = 'TODO';  // this._taskStatus;
        div.appendChild(p);

        p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-todo-start');
        p.textContent = 'TODO';  // this._taskStartDateTime;
        div.appendChild(p);

        p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-todo-end');
        p.textContent = 'TODO';  // this._taskFinishedDateTime;
        div.appendChild(p);

        p = document.createElement('p');
        p.classList.add('TG002-item-label');
        p.classList.add('item-todo-update');
        p.textContent = 'TODO';  // this._updateDateTime;
        div.appendChild(p);

        return div;
    }

    _getListItem() {
        let div = document.createElement('div');
        div.classList.add('TG002-list-item-container');
        div.appendChild(this._editListItem_upperRow());
        div.appendChild(this._editListItem_tailRow());
        return div;
    }

    /**
     * タスク一覧表示で使用するコンポーネントを作成する.
     * @param li タスク一覧の１行分のコンポーネント
     */
    setTaskListItem(li) {
        li.classList.add('TG002-item-body');

        let div = document.createElement('div');
        li.appendChild(this._getBackMenu());
        li.appendChild(this._getListItem());
    }
}