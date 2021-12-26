class CategoryData extends TodoDataModel {
    constructor() {
        super();
        this._listDatas = [];
        this._selectedItem = {};
        this._headerTitles = ["カテゴリ", "未実施", "作業中", "完了"];
        this._headerStyles = [];
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

    _createCategoryRowItem(itemString) {
        let c = document.createElement('p');
        c.classList.add('category-row-item');
        c.appendChild(document.createTextNode(itemString));
        return c;
    }

    rowColumns(index) {
        let item = super._createRowBackMenu();

        let rowData = this._listDatas[index];
        let rowLabel = super._createLabelContainer();
        rowLabel.appendChild(this._createCategoryRowItem(rowData['id']));
        rowLabel.appendChild(this._createCategoryRowItem(rowData['name']));
        rowLabel.appendChild(this._createCategoryRowItem(rowData['num1']));
        rowLabel.appendChild(this._createCategoryRowItem(rowData['num2']));
        rowLabel.appendChild(this._createCategoryRowItem(rowData['num3']));
        item.appendChild(rowLabel);

        return [item];
    }
    get buttonsOperationClassName() {
        return 'popup_one_button';
    }
    get buttons() {
        var ret = [];
        var p = document.createElement("p");
        p.classList.add('popup_button');
        p.innerText = 'カテゴリ追加';
        ret.push(p);

        return ret;
    }
}
class TodoCategoryPage extends ListSliderPageController {
    constructor(p) {
        super(p);
        this._dataModel = new CategoryData();

        super._addClickEvent();
    }

    _clickEvent(event) {
        try {
            let classList = event.target.classList;
            if (classList.contains('share-icon') || classList.contains('edit-icon')) {
                this._toggleOperation(classList);
            } else if (classList.contains('category-row-item')) {
                this._selectCategory(event);
            } else if (classList.contains('popup_button')) {
                this._new_category();
            }
        } finally {
            super._clickEvent(event);
        }
    }

    _executeBackMenu01(event) {
        let parent = event.target.parentNode.nextElementSibling;
        let param = this._getSelectedItem(parent, 'category_name');
        let self = this;
        self.__param = param;
        setTimeout(function() {
            var value = prompt("カテゴリ名の変更", self.__param['category_name']);
            if (value === null) return;
            if (value === self.__param['category_name']) return;
            let req = {'id': self.__param['category_id'], 'name': value};
            self._createAjaxParam('update_category', req, self._response_readCategory()).send();
        }, 1100);  // 一覧のスライダーが閉じる時間＋100ms
    }

    _executeBackMenu02(event) {
        let parent = event.target.parentNode.nextElementSibling;
        let param = this._getSelectedItem(parent, 'category_name');
        let self = this;
        self.__param = param;
        setTimeout(function() {
            let exec = confirm("「" + self.__param['category_name'] + "」(id:" + self.__param['category_id'] + ") を削除します");
            if (!exec) return;
            let req = {'id': self.__param['category_id']};
            self._createAjaxParam('delete_category', req, self._response_readCategory()).send();
        }, 1100);  // 一覧のスライダーが閉じる時間＋100ms
    }

    _getOperationTag() {
        let myPage = document.getElementById(this._pageId);
        let tags = myPage.getElementsByClassName("popup-table-operation");
        if (tags.length === 1) {
            let pTag = tags[0].firstElementChild;
            if (pTag !== null) {
                return pTag;
            } else {
                console.error('no p-tag at popup-table-operation');
            }
        } else {
            console.error('no popup-table-operation class');
        }
        return null;
    }

    _toggleOperation(classList) {
        classList.toggle('share-icon');
        classList.toggle('edit-icon');
    }

    pageShown(ifData) {
        try {
            super._createAjaxParam('read_category', {'type': '2'}, this._response_readCategory()).send();
        } finally {
            super.pageShown(ifData);
        }
    }

    _response_readCategory() {
        var self = this;
        return function(respData) {
            self._show_category_list(JSON.parse(respData));
        }
    }

    _show_category_list(json) {
        this._dataModel._listDatas = json['category_list'];
        var pTag = document.getElementById(this._pageId);
        _pager.initPopupTableData(this, pTag);

        var wk = pTag.getElementsByClassName(this._dataModel.rowTagClassName);
        if (wk.length !== 1) {
            console.error('no table body');
            return;
        }
    }

    _getSelectedItem(parent, keyName) {
        let items = {'category_id': parent.children[0].innerText};
        items[keyName] = parent.children[1].innerText;
        return items;
    }

    _selectCategory(event) {
        let opeTag = this._getOperationTag();
        if (opeTag !== null) {
            if (opeTag.classList.contains('share-icon')) {
                this._show_todo(event);
            } else if (opeTag.classList.contains('edit-icon')) {
                this._activeEditCategory(event);
            }
        }
    }

    _activeEditCategory(event) {
        let target = event.target;
        if (target.classList.contains('category-row-item')) {
            super._setActiveRowSlider(target);
        }
    }

    _show_todo(event) {
        let parent = event.target.parentNode;
        _pager.changePageById("todo_main", this._getSelectedItem(parent, 'category_name'));
    }

    _new_category() {
        var value = prompt("カテゴリ名");
        if (value === null) return;

        var req = {'category_name': value};
        super._createAjaxParam('add_category', req, this._response_readCategory()).send();
    }
}