class TimeKeeperTaskDataModel {
    constructor() {
        this._taskId = null;
        this._taskName = '';
        this._taskRemarks = '';
        this._taskPriority = null;
        this._taskStatus = null;
    }

    get taskId() {return this._taskId;}
    set taskId(val) {this._taskId = val;}
    get taskName() {return this._taskName;}
    set taskName(val) {this._taskName = val;}
    get taskRemarks() {return this._taskRemarks;}
    set taskRemarks(val) {this._taskRemarks = val;}
    get taskPriority() {return this._taskPriority;}
    set taskPriority(val) {this._taskPriority = val;}
    get taskStatus() {return this._taskStatus;}
    set taskStatus(val) {this._taskStatus = val;}

    getTaskInfoFromForm(form, taskId) {
        this._taskId = taskId;
        this._taskName = form.elements['new-task-name'].value;
        if (this._taskName === '') {
            throw 'no task name';
        }
        this._taskRemarks = form.elements['new-task-remarks'].value;
    }

    setTaskByElement(li) {
        this._taskId = li.dataset.taskId;
        let elmts = li.getElementsByClassName('task-name');
        if (elmts.length === 1) {
            this._taskName = elmts[0].textContent;
        }
        elmts = li.getElementsByClassName('task-remarks');
        if (elmts.length === 1) {
            this._taskRemarks = elmts[0].textContent;
        }
    }

    setTaskInforToForm(form) {
        form.elements['new-task-name'].value = this._taskName;
        form.elements['new-task-remarks'].value = this._taskRemarks;
    }
}