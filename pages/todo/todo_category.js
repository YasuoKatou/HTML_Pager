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
    rowColumns(index) {
        var ret = [];
        var rowData = this._listDatas[index];
        var c = document.createElement("p");
        c.appendChild(document.createTextNode(rowData['id']));
        ret.push(c);

        c = document.createElement("p");
        c.appendChild(document.createTextNode(rowData['name']));
        ret.push(c);

        c = document.createElement("p");
        c.appendChild(document.createTextNode(rowData['num1']));
        ret.push(c);

        c = document.createElement("p");
        c.appendChild(document.createTextNode(rowData['num2']));
        ret.push(c);

        c = document.createElement("p");
        c.appendChild(document.createTextNode(rowData['num3']));
        ret.push(c);

        return ret;
    }
    get buttonsOperationClassName() {
        return 'popup_one_button';
    }
    get buttons() {
        var ret = [];
        var p = document.createElement("p");
        p.id = 'add_category';
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
    }

    _clicked_add_category(self) {
        var self = this;
        return function(event) {
            setTimeout(function() {
                self._new_category();
            }, 0);
        }
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
        var rows = wk[0].querySelectorAll('li');
        for (var i = 0; i < rows.length; ++i) {
            rows[i].addEventListener('click', this._clickEvent_category_row());
        }
    }

    _clickEvent_category_row() {
        var self = this;
        return function(event) {
            self._show_todo(event);
        }
    }

    _show_todo(event) {
        var li = event.target.parentNode;
        _pager.changePageById("todo_main", {'category_id': li.children[0].innerText
                                          , 'category_name': li.children[1].innerText});
    }

    _new_category() {
        var value = prompt("カテゴリ名");
        if (value === null) return;

        var req = {'category_name': value};
        super._createAjaxParam('add_category', req, this._response_readCategory()).send();
    }
}