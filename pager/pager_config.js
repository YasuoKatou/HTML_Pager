
class SamplePage001 extends PagerController {
    constructor(p) {
        super(p);
    }
    get funcKeyDisplay() { return "hidden"; }
}

class SamplePage002 extends PagerController {
    constructor(p) {
        super(p);
    }
    // get funcKeyDisplay() { return "visible"; }   #default
    get funcKeyLabels() { return ['Help']; }
    get funcKeyLabelsWithShift() { return ["","","","","","","","","","","","log out"]; }
    get funcKeyLabelsWithCtrl() { return ["Help","","","","","","","","","","","log out"]; }

    _logout() {
        console.log('execute logout');
        _pager.changePage(page001);
    }

    fkey12_S(event) { this._logout(); }
    fkey12_C(event) { this._logout(); }
}

class SamplePage003Data extends DataModelBase {
    constructor() {
        super();
        this._headerTitles = ["No", "品名", "電話番号", "出荷日", "生産者"];
        this._headerStyles = ["popup-table-col-no-3digit",  // No
                              "popup-table-col-name1",      // 品名
                              "popup-table-col-tel",        // 電話番号
                              "popup-table-col-date",       // 出荷日
                              "popup-table-col-name1"       // 生産者
                             ];
    }
}
class SamplePage003 extends PagerController {
    constructor(p) {
        super(p);
        this._dataModel = new SamplePage003Data();
    }
    get funcKeyDisplay() { return "hidden"; }
}

var page001 = new SamplePage001("page001");
var page002 = new SamplePage002("page002");
var page003 = new SamplePage003("page003");

function loginFunc(event) {
    console.log('execute func1');
    _pager.changePage(page003);
}

function func2(event) {
    console.log('execute func2');
    _pager.changePage(page001);
}

_pager.openningPage = page001;
_pager.openningFKey = false;
_pager.addClickEvent(new PagerClickEvent("p1_btn1", loginFunc));
// _pager.addClickEvent(new PagerClickEvent("p2_btn1", func2));
