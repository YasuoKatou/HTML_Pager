class TagData extends DataModelBase {
    constructor() {
        super();
        this._listDatas = [
            "言語 C",
            "言語 C++",
            "言語 GO",
            "言語 Java",
            "言語 Python",
            "言語 Rust"
        ];
    }
    get rowTagClassName() { return 'PP0001-tag-list-container'; }
    get rows() { return this._listDatas.length; }
    rowColumns(index) {
        var ret = [];
        var l = document.createElement("label");
        l.classList.add('PP0001-tag-list-item');
        l.innerText = this._listDatas[index];
        var cbx = document.createElement("input");
        cbx.setAttribute('type', 'checkbox');
        cbx.setAttribute('value', '' + (index + 1));
        l.appendChild(cbx);
        ret.push(l);
        return ret;
    }
    get buttonsTagClassName() {
        return 'PP0001-ope';
    }
    get buttons() {
        var ret = [];
        var p = document.createElement("p");
        p.id = 'btn_close';
        p.classList.add('popup_button');
        p.innerText = '閉じる';
        ret.push(p);

        p = document.createElement("p");
        p.id = 'btn_ok';
        p.classList.add('popup_button');
        p.innerText = 'OK';
        ret.push(p);
        return ret;
    }
}

class TodoTagPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new TagData();
    }

    pageShown() {
        super._dynamicAssignEvent();
        super.pageShown();
    }
    pageHidden() {
        super._removeDynamicEvent();
        super.pageHidden();
    }

    _clicked_btn_close(self) {
        return function(event) {
            console.log(self.pageId + ' close button click event start');
            _pager.closePopupPage(self.pageId);
        }
    }

    _clicked_btn_ok(self) {
        return function(event) {
            console.log(self.pageId + ' ok button click event start');
            _pager.closePopupPage(self.pageId);
        }
    }
}