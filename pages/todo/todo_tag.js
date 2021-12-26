class TagData extends TodoDataModel {
    constructor() {
        super();
        this._listDatas = [];
        this._selectedItem = {};
    }
    get rowTagClassName() { return 'PP0001-tag-list-container'; }
    get rows() { return this._listDatas.length; }
    rowColumns(index) {
        let item = super._createRowBackMenu();

        let rowData = this._listDatas[index];
        let rowLabel = super._createLabelContainer();
        let l = document.createElement("label");
        l.classList.add('PP0001-tag-list-item');
        l.innerText = rowData.name;
        let cbx = document.createElement("input");
        cbx.setAttribute('type', 'checkbox');
        cbx.setAttribute('value', '' + rowData.id);
        if (this._selectedItem.tags.includes(rowData.id)) {
            cbx.setAttribute('checked','checked');
        }
        l.appendChild(cbx);
        rowLabel.appendChild(l);
        item.appendChild(rowLabel);

        return [item];
    }

    get buttonsOperationClassName() {
        return 'PP0001-ope';
    }
    get buttons() {
        let ret = [];
        let p = document.createElement("p");
        p.classList.add('popup_button');
        p.innerText = 'OK';
        ret.push(p);
        return ret;
    }
}

class TodoTagPage extends ListSliderPageController {
    constructor(p) {
        super(p);
        this._dataModel = new TagData();
        this._mode = 'select';

        super._addClickEvent();

        var self = this;
        setTimeout(function() {
            self._createAjaxParam('read_tags', {}, self._received_read_tags()).send();
        }, 0);
    }

    prepareShow(ifData) {
        this._dataModel._selectedItem = ifData;
        let mode = this._getElementsByClassName(this._getMyPage, 'share-icon', false, false);
        if (mode === null) {
            mode = this._getElementsByClassName(this._getMyPage, 'edit-icon');
            if (mode !== null) {
                this._changeMode(mode);
            }
        }
    }

    _okButtonClicked() {
        var tags = [];
        var pTag = document.getElementById(this._pageId);
        var items = pTag.getElementsByClassName('PP0001-tag-list-item');
        var num = items.length;
        for (var i = 0; i < num; ++i) {
            var item = items[i];
            if (item.children[0].checked) {
                tags.push({'id': item.children[0].value, 'name': item.innerText});
            }
        }

        _pager.closePopupPage(this.pageId,
            {'todo-id': this._dataModel._selectedItem['todo-id'], 'tags': tags,
             'tag-list': this._dataModel._listDatas});
    }

    _clickEvent(event) {
        try {
            let tag = event.target;
            let classList = tag.classList;
            if (classList.contains('PP0001-add-tag')) {
                this._addTag();
            } else if (classList.contains('share-icon')) {
                this._changeMode(tag);
            } else if (classList.contains('edit-icon')) {
                this._changeMode(tag);
            } else if (classList.contains('popup_button')) {
                this._okButtonClicked();
            } else {
                this._editTag(event);
            }
        } finally {
            super._clickEvent(event);
        }
    }

    _executeBackMenu01(event) {
        let parent = event.target.parentNode.nextElementSibling;
        let param = this._getSelectedItem(parent);
        let self = this;
        self.__param = param;
        setTimeout(function() {
            let value = prompt("タグ名の変更", self.__param['content']);
            if (value === null) return;
            if (value === self.__param['content']) return;
            let req = {'id': self.__param['tag-id'], 'name': value};
            self._createAjaxParam('update_tag', req, self._received_add_tag(true)).send();
        }, 1100);  // 一覧のスライダーが閉じる時間＋100ms
    }

    _executeBackMenu02(event) {
        let parent = event.target.parentNode.nextElementSibling;
        let param = this._getSelectedItem(parent);
        let self = this;
        self.__param = param;
        setTimeout(function() {
            let exec = confirm("「" + self.__param['content'] + "」(id:" + self.__param['tag-id'] + ") を削除します");
            if (!exec) return;
            let req = {'id': self.__param['tag-id']};
            self._createAjaxParam('delete_tag', req, self._received_add_tag(true)).send();
        }, 1100);  // 一覧のスライダーが閉じる時間＋100ms
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
        let target = event.target;
        if (target.classList.contains('PP0001-tag-list-item')) {
            super._setActiveRowSlider(target);
        }
    }

    _getSelectedItem(parent) {
        let tag = parent.firstElementChild; // label
        let value = tag.textContent;
        tag = tag.firstElementChild;        // input checkbox
        let tagId = tag.value;
        return {'tag-id': tagId, 'content': value};
    }
}