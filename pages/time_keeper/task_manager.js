class TaskManagerPage extends TimeKeeperControllerBase {
    constructor(p) {
        super(p);

        this._updateTaskModel = null;
        super._addClickEvent();
    }

    prepareShow() {
        console.log('start prepareShow : ' + this.pageId);
        this._clearTaskList();
    }

    _clickEvent(event) {
        // console.log('start _clickEvent : ' + event);
        try {
            let target = event.target;
            let classList = target.classList;
            if (classList.contains('move-time-keeper')) {
                _pager.changePageById('PP1002');
            } else if (target.id === 'add-new-task') {
                this._addNewTask();
            } else if (target.id === 'reset-new-task') {
                this._resetNewTask();
            } else if (target.nodeName.toLowerCase() === 'li') {
                if (target.dataset.taskId) {
                    // console.log(target.dataset.taskId);
                    this._setEditMode(target);
                }
            }
        } finally {
            super._clickEvent(event);
        }
    }

    _clearTaskList() {
        let myPage = document.getElementById(this.pageId);
        let elmts = myPage.getElementsByClassName('task-list');
        if (elmts.length === 1) {
            let ul = elmts[0];
            while ( ul.firstChild ) {
                ul.removeChild ( ul.firstChild ) ;
            }
        } else {
            console.error('can not get the task list element ...');
        }
    }

    _addNewTask() {
        let myPage = document.getElementById(this.pageId);
        let form = document.forms['add-task-form'];
        let dm = new TimeKeeperTaskDataModel();
        try {
            dm.getTaskInfoFromForm(form, this._getTempId());
        } catch(ex) {
            console.error(ex);
            return;
        }

        let elmts = myPage.getElementsByClassName('task-list');
        if (elmts.length === 1) {
            let li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
        } else {
            console.error('can not get the task list element ...');
        }
        form.reset();
        form.elements['new-task-title'].focus();
    }

    _createNewTaskList(dm) {
        let item = document.createElement('li');
        item.dataset.taskId = dm.taskId;
        dm.setTaskListItem(item);
        return item;
    }

    _resetNewTask() {
        this._updateTaskModel = null;
        let comitBtn = document.getElementById('add-new-task');
        comitBtn.value = '登録';
    }

    _setEditMode(taskItem) {
        let dm = new TimeKeeperTaskDataModel();
        dm.setTaskByElement(taskItem);
        let form = document.forms['add-task-form'];
        dm.setTaskInforToForm(form);
        let comitBtn = document.getElementById('add-new-task');
        comitBtn.value = '更新';
        this._updateTaskModel = dm;
    }

    _getTempId() {
        var now = new Date();
        return super._formatDate(now, 'yyyyMMdd_HHmmss.SSS');
    }
}