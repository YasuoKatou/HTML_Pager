class Sample2TabController extends PagerController {
    constructor(p) {
        super(p);
        _pager.addClickEvent(new PagerClickEvent("tab_selector1", this.clicked_change_tag()));
        _pager.addClickEvent(new PagerClickEvent("tab_selector2", this.clicked_change_tag()));
        _pager.addClickEvent(new PagerClickEvent("tab_selector3", this.clicked_change_tag()));
        _pager.addClickEvent(new PagerClickEvent("tab_selector4", this.clicked_change_tag()));
    }
    clicked_change_tag(self) {
        if (self === undefined) self = this;
        return function(event) {
            // console.log(event.target.dataset.change_tag);
            _pager.changePageById(event.target.dataset.change_tag);
        }
    }
}

class Sample2Tab1 extends PagerController {
    constructor(p) {
        super(p);
    }
}
class Sample2Tab2 extends PagerController {
    constructor(p) {
        super(p);
    }
}
class Sample2Tab3 extends PagerController {
    constructor(p) {
        super(p);
    }
}
class Sample2Tab4 extends PagerController {
    constructor(p) {
        super(p);
    }
}

_pager.addPageController(new Sample2TabController("non-page"));
_pager.addPageController(new Sample2Tab1("tab01"));
_pager.addPageController(new Sample2Tab2("tab02"));
_pager.addPageController(new Sample2Tab3("tab03"));
_pager.addPageController(new Sample2Tab4("tab04"));

_pager.openningPage = "tab01";
