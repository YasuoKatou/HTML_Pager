/**
 * Pager コアクラス.
 * 
 * @version 0.0.1
 * @since 0.0.1
 * 
 * @author Y.Katou <yasuokatou@gmail.com>
 */
 class PagerCore extends PagerBase {
    constructor() {
        super();
        this._clickEventList = [];
        this._functionKeyList = [];
        this._pageControllerList = [];
        this._popupSave = [];
        this._configFKey = false;
    }

    set openningPage(pid) { 
        this._pageController = this._findPageController(pid);
        if (this._pageController === null) {
            console.error(pid + " not found at openningPage propertit")
        }
    }
    get openningPage() { return this._pageController; }

    /**
     * ファンクションキーの初期表示を設定する.<br>
     * ファンクションキーが存在する場合のみ、このプロパティを設定すること.
     */
    set openningFKey(visible) {
        this._FKeyVisible = visible;
        this._configFKey  = true;
    }
    _funcKeys(visible) {
        var x = document.getElementById("f_keys");
        if (x !== null) {
            if (x.style.visibility !== visible) {
                x.style.visibility = visible;
            }
        }
    }

    _is_page_shown(tag) {
        return tag.classList.contains("page_show");
    }

    _page_hidden(tag) {
        tag.classList.remove("page_show");
        tag.classList.add("page_hidden");
    }

    _initPopupTableHeader(pc, pTag) {
        if (pc.dataModel.headerTagClassName === null) return;
        var hTag = pTag.querySelector('.' + pc.dataModel.headerTagClassName);
        if (hTag === null) {
            console.error('no popup table header class name');
            return;
        }
        while (hTag.firstChild) hTag.removeChild(hTag.firstChild);

        pc.dataModel.headerColumns.forEach(column => {
            hTag.appendChild(column);
        });
    }

    initPopupTableData(pc, pTag) {
        var dTag = pTag.querySelector('.' + pc.dataModel.rowTagClassName);
        if (dTag === null) {
            console.error('no popup table row class name');
            return;
        }
        while (dTag.firstChild) dTag.removeChild(dTag.firstChild);
        var bodyBase = document.createElement("ul");
        for (var i = 0; i < pc.dataModel.rows; ++i) {
            var rowBody = document.createElement("li");
            pc.dataModel.rowColumns(i).forEach(column => {
                rowBody.appendChild(column);
            });
            bodyBase.appendChild(rowBody);
        }
        dTag.appendChild(bodyBase);
    }

    _initPopupButtons(pc, pTag) {
        if (pc.dataModel.buttonsOperationClassName === null) return;
        var bTag = pTag.querySelector('.' + pc.dataModel.buttonsOperationClassName);
        if (bTag === null) {
            console.error('no popup buttons class name');
            return;
        }
        while (bTag.firstChild) bTag.removeChild(bTag.firstChild);
        pc.dataModel.buttons.forEach(button => {
            bTag.appendChild(button);
        });
    }

    _page_show(pc, tag) {
        tag.classList.remove("page_hidden");
        tag.classList.add("page_show");

        if (pc.dataModel !== null) {
            this._initPopupTableHeader(pc, tag);
            this.initPopupTableData(pc, tag);
            this._initPopupButtons(pc, tag);
        }
    }

    _funcKeysLabel(p) {
        if (!this._configFKey) return;
        var l;
        if (p === PagerFunctionKey.KEY_ID_NO_MODIFIRE) l = this._pageController.funcKeyLabels;
        else if (p === PagerFunctionKey.KEY_ID_SHIFT) l = this._pageController.funcKeyLabelsWithShift;
        else if (p === PagerFunctionKey.KEY_ID_CONTRIL) l = this._pageController.funcKeyLabelsWithCtrl;
        else if (p === PagerFunctionKey.KEY_ID_ALT) l = this._pageController.funcKeyLabelsWithAlt;
        else {
            console.error('function mask ' + p + ' is not supported ...')
            return;
        }
        var lt;
        for (let i = 0; i < PagerFunctionKey.FKEY_COUNT; ++i) {
            if (i < l.length) {
                lt = l[i];
            } else {
                lt = "";
            }
            var n = "0" + (i + 1);
            var id = PagerFunctionKey.FKEY_ID_PREFIX + n.substr(n.length-2, 2);
            document.getElementById(id).textContent = lt;
        }
    }

    _findPageController(pid) {
        for (var i = 0; i < this._pageControllerList.length; ++i) {
            if (this._pageControllerList[i].pageId === pid) {
                return this._pageControllerList[i];
            }
        }
        return null;
    }

    changePageById(pid, ifData = undefined) {
        var pc = this._findPageController(pid);
        if (pc === null) {
            console.error(pid + " not found at changePageById");
            return;
        }
        pc.prepareShow(ifData);
        this._changePage(pc);
        pc.pageShown(ifData);
    }

    popupPageById(pid, ifData = undefined) {
        var pc = this._findPageController(pid);
        if (pc === null) {
            console.error(pid + " not found at popupPageById");
            return;
        }

        pc.prepareShow(ifData);
        var pages = document.querySelectorAll("#page_root > div");
        var num = pages.length
        for (var i = 0; i < num; ++i) {
            var page = pages[i];
            if (page.classList.contains('page_show')) {
                page.classList.add('popup-block');
            }
        }
        this._popupSave.push(this._pageController);
        this._pageController = pc;
        var tag = document.getElementById(pid);
        this._setFunctionKeys(pc);
        this._page_show(pc, tag);
        pc.pageShown(ifData);
    }

    closePopupPage(pid, ifData = undefined) {
        var page = document.getElementById(pid);
        this._page_hidden(page);
        this._pageController.pageHidden();

        this._pageController = this._popupSave.pop();
        this._pageController.closedForm(pid, ifData);
        page = document.getElementById(this._pageController.pageId);
        page.classList.remove('popup-block');
        this._setFunctionKeys(this._pageController);
    }

    /**
     * 表示するページを切替る.
     * @param {PagerController} p - 表示するページのコントローラ
     */
    _changePage(p) {
        var pageId = p.pageId;
        var x = document.getElementById(pageId);
        if (x === null) {
            console.error("'" + pageId + "' page not found ...")
            return;
        }
        this._page_show(p, x);
        this._pageController = p;
        x = document.querySelectorAll("#page_root > div");
        for(var i = 0; i < x.length; ++i) {
            var pid = x[i].id;
            if (pid !== pageId && this._is_page_shown(x[i])) {
                this._page_hidden(x[i]);
                var pc = this._findPageController(pid);
                pc.pageHidden();
            }
        }
        this._setFunctionKeys(p);
    }

    _setFunctionKeys(pc) {
        if (this._configFKey) {
            //ファンクションキーの表示／非表示
            this._funcKeys(pc.funcKeyDisplay);
            //ファンクションキーラベルの表示
            this._funcKeysLabel(PagerFunctionKey.KEY_ID_NO_MODIFIRE);
        }
    }

    _click_event(self) {
        return function(event) {
            var id = event.target.id;
            for (var i = 0; i < self._clickEventList.length; ++i) {
                if (self._clickEventList[i].tagId === id) {
                    setTimeout(function() {
                        self._clickEventList[i].eventFunc(event);
                    }, 0);
                    break;
                }
            }
        }
    }

    _funcKeyLabels(self, event) {
        var mask = PagerFunctionKey.KEY_ID_NO_MODIFIRE;
        var suffix = PagerController.FUNC_KEY_PROC_SUFFIX_NO_MODIFIRE;
        if (event.ctrlKey) {
            //console.log('Control key down');
            mask = PagerFunctionKey.KEY_ID_CONTRIL;
            suffix = PagerController.FUNC_KEY_PROC_SUFFIX_CTRL;
        } else if (event.shiftKey) {
            //console.log('Shift key down');
            mask = PagerFunctionKey.KEY_ID_SHIFT;
            suffix = PagerController.FUNC_KEY_PROC_SUFFIX_SHIFT;
        } else if (event.altKey) {
            //console.log('Alt key down');
            mask = PagerFunctionKey.KEY_ID_ALT;
            suffix = PagerController.FUNC_KEY_PROC_SUFFIX_ALT;
        }
        self._funcKeysLabel(mask);
        return suffix;
    }

    _keyDown_event(self) {
        return function(event) {
            if (!self._configFKey) return;
            var suffix = self._funcKeyLabels(self, event);
            if (event.code.startsWith("F")) {
                var f = PagerController.FUNC_KEY_PROC_PREFIX + event.code.substr(1) + suffix;
                setTimeout(function() {
                    eval("self._pageController." + f + "(event)");
                }, 0);
            }
        }
    }

    _keyUp_event(self) {
        return function(event) {
            if (!self._configFKey) return;
            self._funcKeyLabels(self, event);
        }
    }

    initPage() {
        //Function キー非表示
        if (this._configFKey && !this._FKeyVisible) { this._funcKeys("hidden"); }
        //クリックイベントの設定
        document.addEventListener('click', this._click_event(this));
        //キーボードイベントの設定
        document.addEventListener('keydown', this._keyDown_event(this));
        document.addEventListener('keyup', this._keyUp_event(this));

        //初期表示するページ
        var x = document.getElementById(this.openningPage.pageId);
        this.openningPage.prepareShow();
        this._page_show(this.openningPage, x);
        this.openningPage.pageShown();
    }

    /**
     * Pagerコントローラを登録する.
     * @param {PagerController}} p - Pagerコントローラクラス
     */
    addPageController(p) { this._pageControllerList.push(p); }

    /**
     * クリックイベント情報を登録する.
     * @param {PagerClickEvent} p - クリックイベント情報クラス
     * @since 0.0.1
     */
    addClickEvent(p) { this._clickEventList.push(p); }

    removeClickEvent(id) {
        this._clickEventList = this._clickEventList.filter((evtClass) => {
            return (evtClass.tagId !== id);
        });
    }

    /**
     * ファンクションキー情報をクリアする.
     * @since 0.0.1
     */
    clearFunctionKeyList() { this._funcKeyInforList = []; }

    /**
     * ファンクションキー情報を登録する.
     * @param {*} p - ファンクションキー情報クラス
     */
    addFunctionKeyList(p) { this._funcKeyInforList.push(p); }
}
window._pager = new PagerCore();
