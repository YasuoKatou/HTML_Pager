class TodoDialog01Data extends DataModelBase {
    constructor() {
        super();
    }
}

class TodoDialog01 extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new TodoDialog01Data();

        super._addClickEvent();
    }

    _clickEvent(event) {
        try {
            let classList = event.target.classList;
            if (classList.contains('btn-update')) {
                this._updateButton(event);
            } else if (classList.contains('btn-delete')) {
                this._deleteButton(event);
            } else if (classList.contains('btn-close')) {
                this._closeButton(event);
            }
        } finally {
            super._clickEvent(event);
        }
    }

    _updateButton(event) {
        let myPage = super._getMyPage;
        let text = super._getElementsByClassName(myPage, 'PP0002-content-string');
        this._ifData['content'] = text.value;
        this._ifData['result'] = 'update';
        _pager.closePopupPage(super.pageId, this._ifData);
    }

    _deleteButton(event) {
        this._ifData['result'] = 'delete';
        _pager.closePopupPage(super.pageId, this._ifData);
    }

    _closeButton(event) {
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
            text.value = ifData['content'];
        }
        this._ifData = ifData;
        super.prepareShow(ifData);
    }
}