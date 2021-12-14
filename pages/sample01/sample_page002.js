
class SamplePage002 extends PagerController {
    constructor(p) {
        super(p);

        super._addClickEvent();
    }
    get funcKeyDisplay() { return "visible"; }
    get funcKeyLabels() { return ['Help']; }
    get funcKeyLabelsWithShift() { return ["","","","","","","","","","","","log out"]; }
    get funcKeyLabelsWithCtrl() { return ["Help","","","","","","","","","","","log out"]; }

    _logout() {
        _pager.changePageById("page001");
    }

    _clickEvent(event) {
        try {
            if (event.target.id === 'p2_button') {
                _pager.popupPageById('page003', 'test prepareShow');
            }
        } finally {
            super._clickEvent(event);
        }
    }

    closedForm(pid, ifData = undefined) {
        console.log(pid + ' closed : ' + ifData);
        super.closedForm(ifData);
    }

    fkey12_S(event) { this._logout(); }
    fkey12_C(event) { this._logout(); }
}
