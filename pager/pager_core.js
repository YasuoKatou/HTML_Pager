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
        x.style.visibility = visible;
    }

    _page_hidden(tag) {
        tag.classList.remove("page_show");
        tag.classList.add("page_hidden");
    }

    _initPopupTableHeader(pc, pTag) {
        if (pc.dataModel.headerTitles === null) return;
        for (var cls in pc.dataModel.headerTitles) {
            var hTag = pTag.querySelector(cls);
            if (hTag !== null) {
                var htj = pc.dataModel.headerTitles[cls];
                var hcj = pc.dataModel.headerStyles[cls];
                for (var i = 0; i < htj.length; ++i) {
                    var hc = document.createElement("p");
                    hc.appendChild(document.createTextNode(htj[i]));
                    if (hcj[i] !== "") {
                        hc.classList.add(hcj[i]);
                    }
                    hTag.appendChild(hc);
                }
            } else {
                console.error("'" + cls + "' not found table header tag");
            }
        }
    }

    _makePopupTableRowData(colDatas, styles) {
        var rowBody = document.createElement("li");
        for (var i = 0; i < colDatas.length; ++i) {
            var item = document.createElement("p");
            item.appendChild(document.createTextNode(colDatas[i]));
            if (styles !== null && styles[i] !== "") {
                item.classList.add(styles[i]);
            }
            rowBody.appendChild(item);
        }
        return rowBody;
    }

    _initPopupTableData(pc, pTag) {
        if (pc.dataModel.listDatas === null) return;
        for (var cls in pc.dataModel.listDatas) {
            var dTag = pTag.querySelector(cls);
            if (dTag !== null) {
                var rows = pc.dataModel.listDatas[cls];
                if (rows.length === 0) {
                    continue;
                }
                var rowStyles = pc.dataModel.listDataStyles[cls];
                var bodyBase = document.createElement("ul");
                dTag.appendChild(bodyBase);
                for (var i = 0; i < rows.length; ++i) {
                    bodyBase.appendChild(this._makePopupTableRowData(rows[i], rowStyles));
                }
            } else {
                console.error("'" + cls + "' not found table data tag");
            }
        }
    }

    _page_show(pc, tag) {
        tag.classList.remove("page_hidden");
        tag.classList.add("page_show");

        if (pc.dataModel !== null) {
            this._initPopupTableHeader(pc, tag);
            this._initPopupTableData(pc, tag);
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

    changePageById(pid) {
        var pc = this._findPageController(pid);
        if (pc !== null) {
            this._changePage(pc);
        } else {
            console.error(pid + "not found at changePageById");
        }
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
            if (x[i].id !== pageId) {
                this._page_hidden(x[i]);
            }
        }
        //ファンクションキーの表示／非表示
        this._funcKeys(p.funcKeyDisplay);
        //ファンクションキーラベルの表示
        this._funcKeysLabel(PagerFunctionKey.KEY_ID_NO_MODIFIRE);
    }

    _click_event(self) {
        return function(event) {
            var id = event.target.id;
            for(var i = 0; i < self._clickEventList.length; ++i) {
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
            self._funcKeyLabels(self, event);
        }
    }

    initPage() {
        //初期表示するページ
        var x = document.getElementById(this.openningPage.pageId);
        this._page_show(this.openningPage, x);
        //Function キー非表示
        if (this._configFKey && !this._FKeyVisible) { this._funcKeys("hidden"); }

        //クリックイベントの設定
        this._clickEventList.forEach(clickEvent => {
            var tag = document.getElementById(clickEvent.tagId);
            if (tag !== null) {
                tag.addEventListener('click', this._click_event(this));
            } else {
                console.error("'" + clickEvent.tagId + "' is not found ...")
            }
        });
        //キーボードイベントの設定
        document.addEventListener('keydown', this._keyDown_event(this));
        document.addEventListener('keyup', this._keyUp_event(this));
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
