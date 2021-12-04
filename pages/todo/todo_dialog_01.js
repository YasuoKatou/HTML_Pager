class TodoDialog01Data extends DataModelBase {
    constructor() {
        super();
    }
}

class TodoDialog01 extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new TodoDialog01Data();

        this._setOperationEvent();
    }

    _setOperationEvent() {
        let myPage = super._getMyPage;
        let btn = super._getElementsByClassName(myPage, 'btn-update');
        btn.addEventListener('click', this._event_update_button());
        btn = super._getElementsByClassName(myPage, 'btn-delete');
        btn.addEventListener('click', this._event_delete_button());
        btn = super._getElementsByClassName(myPage, 'btn-close');
        btn.addEventListener('click', this._event_close_button());
    }

    _event_update_button() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_update_button(event);
            }, 0);
        }
    }

    _execute_update_button(event) {
        let myPage = super._getMyPage;
        let text = super._getElementsByClassName(myPage, 'PP0002-content-string');
        this._ifData['category_name'] = text.value;
        this._ifData['result'] = 'update';
        _pager.closePopupPage(super.pageId, this._ifData);
    }

    _event_delete_button() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_delete_button(event);
            }, 0);
        }
    }

    _execute_delete_button(event) {
        this._ifData['result'] = 'delete';
        _pager.closePopupPage(super.pageId, this._ifData);
    }

    _event_close_button() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_close_button(event);
            }, 0);
        }
    }

    _execute_close_button(event) {
        _pager.closePopupPage(super.pageId);
    }

    prepareShow(ifData) {
        // console.log(ifData);
        if (ifData !== null) {
            let myPage = super._getMyPage;
            let titleString = '';
            if ('dialog-title' in ifData) {
                titleString = ifData['dialog-title'];
            }
            let header = super._getElementsByClassName(myPage, 'PP0002-dialog-title');
            header.innerText = titleString;

            let text = super._getElementsByClassName(myPage, 'PP0002-content-string');
            text.value = ifData['category_name'];
        }
        this._ifData = ifData;
        super.prepareShow(ifData);
    }
}