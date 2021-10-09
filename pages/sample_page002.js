
class SamplePage002 extends PagerController {
    constructor(p) {
        super(p);
    }
    get funcKeyDisplay() { return "visible"; }
    get funcKeyLabels() { return ['Help']; }
    get funcKeyLabelsWithShift() { return ["","","","","","","","","","","","log out"]; }
    get funcKeyLabelsWithCtrl() { return ["Help","","","","","","","","","","","log out"]; }

    _logout() {
        // console.log('execute logout');
        _pager.changePageById("page001");
    }

    clicked_p2_button(self) {
        return function(event) {
            console.log(self.pageId + ' click p2_button start');
            _pager.popupPageById('page003');
        }
    }

    fkey12_S(event) { this._logout(); }
    fkey12_C(event) { this._logout(); }
}
