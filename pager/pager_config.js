class SamplePageT04 extends PagerController {
    constructor(p) {
        super(p);
    }
}

_pager.addPageController(new SamplePage001("page001"));
_pager.addPageController(new SamplePage002("page002"));
_pager.addPageController(new SamplePage003("page003"));
_pager.addPageController(new SamplePageT04("pageT04"));

_pager.openningPage = "page001";
_pager.openningFKey = "hidden";
