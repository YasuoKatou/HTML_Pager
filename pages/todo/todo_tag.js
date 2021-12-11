class TagData extends DataModelBase {
    constructor() {
        super();
        this._listDatas = [];
        this._selectedItem = {};
    }
    get rowTagClassName() { return 'PP0001-tag-list-container'; }
    get rows() { return this._listDatas.length; }
    rowColumns(index) {
        var ret = [];
        var l = document.createElement("label");
        l.classList.add('PP0001-tag-list-item');
        var item = this._listDatas[index];
        l.innerText = item.name;
        var cbx = document.createElement("input");
        cbx.setAttribute('type', 'checkbox');
        cbx.setAttribute('value', '' + item.id);
        if (this._selectedItem.tags.includes(item.id)) {
            cbx.setAttribute('checked','checked');
        }
        l.appendChild(cbx);
        ret.push(l);
        return ret;
    }

    get buttonsOperationClassName() {
        return 'PP0001-ope';
    }
    get buttons() {
        let ret = [];
        let p = document.createElement("p");
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
        this._mode = 'select';

        var myPage = document.getElementById(p);
        myPage.addEventListener('click', this._myPage_click());

        var self = this;
        setTimeout(function() {
            self._createAjaxParam('read_tags', {}, self._received_read_tags()).send();
        }, 0);
    }

    prepareShow(ifData) {
        this._dataModel._selectedItem = ifData;
    }

    pageShown(ifData) {
        super._dynamicAssignEvent();
        super.pageShown(ifData);
    }
    pageHidden() {
        super._removeDynamicEvent();
        super.pageHidden();
    }

    _clicked_btn_ok(self) {
        return function(event) {
            // console.log(self.pageId + ' ok button click event start');
            var tags = [];
            var pTag = document.getElementById(self._pageId);
            var items = pTag.getElementsByClassName('PP0001-tag-list-item');
            var num = items.length;
            for (var i = 0; i < num; ++i) {
                var item = items[i];
                if (item.children[0].checked) {
                    tags.push({'id': item.children[0].value, 'name': item.innerText});
                }
            }

            _pager.closePopupPage(self.pageId,
                 {'todo-id': self._dataModel._selectedItem['todo-id'], 'tags': tags,
                  'tag-list': self._dataModel._listDatas});
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
        } else if (tag.classList.contains('share-icon')) {
            this._changeMode(tag);
        } else if (tag.classList.contains('edit-icon')) {
            this._changeMode(tag);
        } else {
            this._editTag(event);
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

    _received_add_tag(checkMode = false) {
        var self = this;
        return function(respData) {
            var json = JSON.parse(respData);
            self._dataModel._listDatas = json.tags;
            var pTag = self._getMyPage;
            _pager.initPopupTableData(self, pTag);
            if (checkMode) {
                let t = self._getElementsByClassName(pTag, 'edit-icon');
                self._setCheckBox(t);
            }
        };
    }

    _setCheckBox(tag) {
        let isDisable = true;
        if (tag.classList.contains('share-icon')) {
            isDisable = false;
            this._mode = 'select';
        } else {
            this._mode = 'edit';
        }
        let myPage = super._getMyPage;
        let tags = myPage.getElementsByClassName("PP0001-tag-list-item");
        for (let index = 0; index < tags.length; ++index) {
            tags[index].firstElementChild.disabled = isDisable;
        }
    }

    _changeMode(tag) {
        tag.classList.toggle('share-icon');
        tag.classList.toggle('edit-icon');
        this._setCheckBox(tag);
    }

    _editTag(event) {
        if (this._mode !== 'edit') return;
        let tag = event.target;
        if (tag.classList.contains('PP0001-tag-list-item')) {
            tag = tag.parentElement;
        } else if (tag.tagName.toLowerCase() !== 'li') {
            return;
        }
        let param = {'dialog-title': 'タグの更新／削除'};
        tag = tag.firstElementChild;        // label
        param['content'] = tag.textContent;
        tag = tag.firstElementChild;        // input checkbox
        param['tag-id'] = tag.value;
        _pager.popupPageById('PP0002', param);
    }

    closedForm(pid, ifData = undefined) {
        let svcId = null;
        let svcReq = null;
        if (pid === 'PP0002') {
            if (ifData !== undefined) {
                if ('result' in ifData) {
                    if (ifData['result'] === 'update') {
                        svcId = 'update_tag';
                        svcReq = {'id': ifData['tag-id'], 'name': ifData['content']};
                    } else if (ifData['result'] === 'delete') {
                        svcId = 'delete_tag';
                        svcReq = {'id': ifData['tag-id']};
                    } else {
                        console.error('result string error : ' + ifData['result'] + ' at TodoTagPage');
                    }
                } else {
                    console.error('not result attribute at TodoTagPage');
                }
            }
        }
        if (svcId !== null) {
            super._createAjaxParam(svcId, svcReq, this._received_add_tag(true)).send();
        }
        super.closedForm(ifData);
    }
}