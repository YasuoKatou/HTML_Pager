class CategoryData extends DataModelBase {
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
        let c = document.createElement("p");
        c.classList.add('category-row-item');
        c.appendChild(document.createTextNode(itemString));
        return c;
    }

    rowColumns(index) {
        var ret = [];
        var rowData = this._listDatas[index];
        ret.push(this._createCategoryRowItem(rowData['id']));
        ret.push(this._createCategoryRowItem(rowData['name']));
        ret.push(this._createCategoryRowItem(rowData['num1']));
        ret.push(this._createCategoryRowItem(rowData['num2']));
        ret.push(this._createCategoryRowItem(rowData['num3']));

        return ret;
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
class TodoCategoryPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new CategoryData();

        super._addClickEvent();
    }

    _cleckEvent(event) {
        let classList = event.target.classList;
        if (classList.contains('share-icon') || classList.contains('edit-icon')) {
            this._toggleOperation(classList);
        } else if (classList.contains('category-row-item')) {
            this._selectCategory(event);
        } else if (classList.contains('popup_button')) {
            this._new_category();
        }
        super._cleckEvent(event);
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

    pageHidden() {
        super._removeDynamicEvent();
        super.pageHidden();
    }

    pageShown(ifData) {
        super._createAjaxParam('read_category', {}, this._response_readCategory()).send();
        super._dynamicAssignEvent();
        super.pageShown(ifData);
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

    _getSelectedItem(li, keyName) {
        let items = {'category_id': li.children[0].innerText};
        items[keyName] = li.children[1].innerText;
        return items;
    }

    _selectCategory(event) {
        let opeTag = this._getOperationTag();
        if (opeTag !== null) {
            if (opeTag.classList.contains('share-icon')) {
                this._show_todo(event);
            } else if (opeTag.classList.contains('edit-icon')) {
                let param = this._getSelectedItem(event.target.parentNode, 'content');
                param['dialog-title'] = 'カテゴリの更新／削除'
                _pager.popupPageById('PP0002', param);
            }
        }
    }

    _show_todo(event) {
        var li = event.target.parentNode;
        _pager.changePageById("todo_main", this._getSelectedItem(li, 'category_name'));
    }

    _new_category() {
        var value = prompt("カテゴリ名");
        if (value === null) return;

        var req = {'category_name': value};
        super._createAjaxParam('add_category', req, this._response_readCategory()).send();
    }

    closedForm(pid, ifData = undefined) {
        let svcId = null;
        let svcReq = null;
        if (pid === 'PP0002') {
            if (ifData !== undefined) {
                if ('result' in ifData) {
                    if (ifData['result'] === 'update') {
                        svcId = 'update_category';
                        svcReq = {'id': ifData['category_id'], 'name': ifData['content']};
                    } else if (ifData['result'] === 'delete') {
                        svcId = 'delete_category';
                        svcReq = {'id': ifData['category_id']};
                    } else {
                        console.error('result string error : ' + ifData['result'] + ' at TodoCategoryPage');
                    }
                } else {
                    console.error('not result attribute at TodoCategoryPage');
                }
            }
        }
        if (svcId !== null) {
            super._createAjaxParam(svcId, svcReq, this._response_readCategory()).send();
        }
        super.closedForm(ifData);
    }
}