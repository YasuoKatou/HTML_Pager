class TagData extends DataModelBase {
    constructor() {
        super();
        this._listDatas = [
/*
            {"id": 1, "name": "言語 C"},
            {"id": 2, "name": "言語 C++"},
            {"id": 3, "name": "言語 GO"},
            {"id": 4, "name": "言語 Java"},
            {"id": 5, "name": "言語 Python"},
            {"id": 6, "name": "言語 Rust"}
*/
        ];
    }
    get rowTagClassName() { return 'PP0001-tag-list-container'; }
    get rows() { return this._listDatas.length + 1; }
    rowColumns(index) {
        var ret = [];
        if (index === 0) {
            var p = document.createElement("p");
            p.classList.add('PP0001-add-tag');
            p.innerText = '+ tag';
            ret.push(p);
        } else {
            var l = document.createElement("label");
            l.classList.add('PP0001-tag-list-item');
            var item = this._listDatas[index - 1];
            l.innerText = item.name;
            var cbx = document.createElement("input");
            cbx.setAttribute('type', 'checkbox');
            cbx.setAttribute('value', '' + item.id);
            l.appendChild(cbx);
            ret.push(l);
        }
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

        var myPage = document.getElementById(p);
        myPage.addEventListener('click', this._myPage_click());

        var self = this;
        setTimeout(function() {
            self._createAjaxParam('read_tags', {}, self._received_read_tags()).send();
        }, 0);
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

    _myPage_click() {
        var self = this;
        return function(event) {
            setTimeout(function() {
                self._execute_event(event);
            }, 0);
        }
    }

    _execute_event(event) {
        var tag = event.target;
        if (tag.classList.contains('PP0001-add-tag')) {
            this._addTag();
        }
    }

    _received_read_tags() {
        var self = this;
        return function(respData) {
            var json = JSON.parse(respData);
            self._dataModel._listDatas = json.tags;
        };
    }

    _addTag() {
        var value = prompt("タグ名称");
        if (value === null) return;
        console.log(value);
        var req = {'tag-name': value};
        super._createAjaxParam('add_tag', req, this._received_add_tag()).send();
    }

    _received_add_tag() {
        var self = this;
        return function(respData) {
            var json = JSON.parse(respData);
            self._dataModel._listDatas = json.tags;
            var pTag = document.getElementById(self._pageId);
            _pager._initPopupTableData(self, pTag);
        };
    }
}