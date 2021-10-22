class CategoryData extends DataModelBase {
    constructor() {
        super();
        this._listDatas = [];
        this._selectedItem = {};
        this._headerTitles = ["カテゴリ", "未実施", "作業中", "完了"];
        this._headerStyles = [
                 "todo-cate-list-name",         // カテゴリ
                 "todo-cate-list-no-proc",      // 未実施
                 "todo-cate-list-processing",   // 作業中
                 "todo-cate-list-term"　        // 完了
                ];
    }
    get headerTagClassName() { return 'popup-table-head'; }
    get headerColumns() {
        var ret = [];
        for (var i = 0; i < this._headerTitles.length; ++i) {
            var hc = document.createElement("p");
            hc.appendChild(document.createTextNode(this._headerTitles[i]));
            hc.classList.add(this._headerStyles[i]);
            ret.push(hc);
        }
        return ret;
    }
    get buttonsTagClassName() {
        return 'popup_multi_button';
    }
    get buttons() {
        var ret = [];
        var p = document.createElement("p");
        p.id = 'ok';
        p.classList.add('popup_button');
        p.innerText = 'OK';
        ret.push(p);
        return ret;
    }
}
class TodoCategoryPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new CategoryData();
    }

    pageShown() {
        super._dynamicAssignEvent();
        super.pageShown();
    }
    pageHidden() {
        super._removeDynamicEvent();
        super.pageHidden();
    }

    _clicked_ok(self) {
        return function(event) {
            // console.log(self.pageId + ' ok button click event start');
            _pager.closePopupPage(self.pageId, 'popup ok button.');
        }
    }
}