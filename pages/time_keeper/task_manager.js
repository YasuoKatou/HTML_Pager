class TaskManagerPage extends TimeKeeperControllerBase {
    constructor(p) {
        super(p);

        this._updateTaskModel = null;
        super._addClickEvent();
    }

    prepareShow() {
        //console.log('start prepareShow : ' + this.pageId);
        this._clearTaskList();
    }

    _clickEvent(event) {
        // console.log('start _clickEvent : ' + event);
        let isItemEdit = false;
        let target = event.target;
        try {
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
            } else if (target.classList.contains('TG002-item-label')) {
                let div = target.parentNode.parentNode;
                let ul = target.closest('ul');
                let els = ul.getElementsByClassName('TG002-list-item-container');
                for (let index = 0; index < els.length; ++index) {
                    if (els[index] !== div) {
                        els[index].classList.remove('active');
                    }
                }
                div.classList.toggle('active');
                isItemEdit = true;
            } else if (target.classList.contains('TG002-back-menu-01')) {
                //console.log(target.innerText);
                // TODO 処理を実装
            } else if (target.classList.contains('TG002-back-menu-02')) {
                //console.log(target.innerText);
                // TODO 処理を実装                
            }
        } finally {
            if (!isItemEdit) {
                let li = target.closest('.TG002-item-body');
                if (!li) return;
                let els = li.getElementsByClassName('TG002-list-item-container');
                els[0].classList.remove('active');
            }
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
/*
            // 一覧の表示領域を確認するため、一度に多くの行を追加するする
            li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
            li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
            li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
            li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
            li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
            li = this._createNewTaskList(dm);
            elmts[0].appendChild(li);
            // ▲ 以上
*/
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
        return _dateTimeUtil.formatDate(now, 'yyyyMMdd_HHmmss.SSS');
    }
}