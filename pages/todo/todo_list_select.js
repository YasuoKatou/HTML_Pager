class TodoSelectData extends TodoDataModel {
    constructor() {
        super();
        this._listDatas = [];
        this._headerTitles = ['移動先カテゴリ'];
    }
    get headerTagClassName() { return 'popup-table-head'; }
    get headerColumns() {
        var ret = [];
        for (var i = 0; i < this._headerTitles.length; ++i) {
            var hc = document.createElement("p");
            hc.appendChild(document.createTextNode(this._headerTitles[i]));
            ret.push(hc);
        }
        return ret;
    }
    get rowTagClassName() { return 'popup-table-body'; }
    get rows() { return this._listDatas.length; }

    rowColumns(index) {
        let item = document.createElement('div');
        item.classList.add('TG001-item-body');

        let rowData = this._listDatas[index];
        let rowLabel = super._createLabelContainer();
        let p = document.createElement("p");
        p.innerText = rowData['id'];
        rowLabel.appendChild(p);

        p = document.createElement("p");
        p.innerText = rowData['name'];
        p.classList.add('PP0003-row');
        if ('selected' in rowData) {
            p.classList.add('PP0003-selected');
        }
        rowLabel.appendChild(p);
        item.appendChild(rowLabel);

        return [item];
    }
}

class TodoListSelect extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new TodoSelectData();

        super._addClickEvent();
    }

    prepareShow(ifData) {
        try {
            this._dataModel._listDatas = ifData;
            let tag = this._getElementsByClassName(this._getMyPage, 'PP0003-form');
            if (tag) {
                tag.firstElementChild.innerText = 'カテゴリの移動';
            }
        } finally {
            super.prepareShow(ifData);
        }
    }

    _clickEvent(event) {
        try {
            let target = event.target;
            let classList = target.classList;
            if (classList.contains('PP0003-row')) {
                _pager.closePopupPage(this.pageId, {'selected-id': target.previousElementSibling.innerText});
            } else if (classList.contains('popup-button-close')) {
                _pager.closePopupPage(this.pageId);
            }
        } finally {
            super._clickEvent(event);
        }
    }
}