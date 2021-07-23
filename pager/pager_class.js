class PagerBase {

}

class PagerClickEvent extends PagerBase {
    constructor(id, func) {
        super();
        this.id = id;
        this.func = func;
    }
    get tagId() { return this.id; }
    get eventFunc() { return this.func;}
}

class PagerCore extends PagerBase {
    constructor() {
        super();
        this.clickEventList = [];
    }

    set openningPage(pageId) { this.openningPagr = pageId; }
    get openningPage() { return this.openningPagr;}

    _page_hidden(tag) {
        tag.classList.remove("page_show");
        tag.classList.add("page_hidden");
    }

    _page_show(tag) {
        tag.classList.remove("page_hidden");
        tag.classList.add("page_show");
    }

    changePage(tag) {
        var x = document.getElementById(tag);
        if (x === null) {
            console.error("'" + tag + "' page not found ...")
            return;
        }
        this._page_show(x);
        x = document.querySelectorAll("#page_root > div");
        for(var i = 0; i < x.length; ++i) {
            if (x[i].id !== tag) {
                this._page_hidden(x[i]);
            }
        }
    }

    _click_event(self) {
        return function(event) {
            var id = event.target.id;
            for(var i = 0; i < _pager.clickEventList.length; ++i) {
                if (self.clickEventList[i].id === id) {
                    self.clickEventList[i].func(event);
                    break;
                }
            }
        }
        }

    initPage() {
        //全てのページを非表示に設定
        var x = document.querySelectorAll("#page_root > div");
        for(var i = 0; i < x.length; ++i) {
            this._page_hidden(x[i]);
        }
        //初期表示するページ
        x = document.getElementById(this.openningPage);
        this._page_show(x);

        //クリックイベントの設定
        this.clickEventList.forEach(info => {
            var tag = document.getElementById(info.tagId);
            if (tag !== null) {
                tag.addEventListener('click', this._click_event(this));
            } else {
                console.log("'" + info.tagId + "' is not found ...")
            }
        });
    }

    addClickEvent(tagId, eventFunc) {
        this.clickEventList.push(new PagerClickEvent(tagId, eventFunc));
    }
}
window._pager = new PagerCore();
