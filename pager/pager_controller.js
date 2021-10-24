/**
 * Pagerコントローラクラス.
 * 
 * @version 0.0.1
 * @since 0.0.1
 * 
 * @author Y.Katou <yasuokatou@gmail.com>
 */
class PagerController extends PagerBase {
    constructor(p) {
        super();
        this._pageId = p;
        this._dataModel = null;
        this._assignEvents();
    }
    _assignEvents() {
        this._assignEventByType('clicked_');
    }
    _dynamicAssignEvent() {
        this._assignEventByType('_clicked_');
    }
    _assignEventByType(eventType) {
        if (this._pageId === "non-page") return;
        var pTag = document.getElementById(this._pageId);
        if (pTag === null) {
            console.error("root tag ('" + this._pageId + "') is not found ...");
            return;
        }
        var prefixSize = eventType.length;
        Object.getOwnPropertyNames(this.__proto__).forEach(name => {
            // console.log(name);
            if (name.startsWith(eventType)) {
                // クリックイベントの登録
                var n = name.substr(prefixSize);
                // ID で検索
                var e = pTag.querySelector("#" + n);
                if (e !== null) {
                    _pager.addClickEvent(new PagerClickEvent(n, this[name](this)));
                } else {
                    // css で検索
                    e = pTag.querySelector("." + n);
                    if (e !== null) {
                        _pager.addClickEvent(new PagerClickEvent(n, this[name](this)));
                    } else {
                        console.error(name + " function not assign events");
                    }
                }
            }
        });
    }
    _removeDynamicEvent() {
        var eventType = '_clicked_';
        var prefixSize = eventType.length;
        Object.getOwnPropertyNames(this.__proto__).forEach(name => {
            if (name.startsWith(eventType)) {
                var n = name.substr(prefixSize);
                _pager.removeClickEvent(n);
            }
        });
    }

    prepareShow(ifData = undefined) {}
    pageShown(ifData = undefined) {}
    pageHidden() {}
    closedForm(pid, ifData = undefined) {}

    get pageId() { return this._pageId; }
    get funcKeyDisplay() { return "visible"; }
    get funcKeyLabels() { return []; }
    get funcKeyLabelsWithShift() { return []; }
    get funcKeyLabelsWithCtrl() { return []; }
    get funcKeyLabelsWithAlt() { return []; }

    static FUNC_KEY_PROC_PREFIX = "fkey";
    static FUNC_KEY_PROC_SUFFIX_NO_MODIFIRE = "";
    fkey1(event) {}
    fkey2(event) {}
    fkey3(event) {}
    fkey4(event) {}
    fkey5(event) {}
    fkey6(event) {}
    fkey7(event) {}
    fkey8(event) {}
    fkey9(event) {}
    fkey10(event) {}
    fkey11(event) {}
    fkey12(event) {}

    static FUNC_KEY_PROC_SUFFIX_SHIFT = "_S";
    fkey1_S(event) {}
    fkey2_S(event) {}
    fkey3_S(event) {}
    fkey4_S(event) {}
    fkey5_S(event) {}
    fkey6_S(event) {}
    fkey7_S(event) {}
    fkey8_S(event) {}
    fkey9_S(event) {}
    fkey10_S(event) {}
    fkey11_S(event) {}
    fkey12_S(event) {}

    static FUNC_KEY_PROC_SUFFIX_CTRL = "_C";
    fkey1_C(event) {}
    fkey2_C(event) {}
    fkey3_C(event) {}
    fkey4_C(event) {}
    fkey5_C(event) {}
    fkey6_C(event) {}
    fkey7_C(event) {}
    fkey8_C(event) {}
    fkey9_C(event) {}
    fkey10_C(event) {}
    fkey11_C(event) {}
    fkey12_C(event) {}

    static FUNC_KEY_PROC_SUFFIX_ALT = "_A";
    fkey1_A(event) {}
    fkey2_A(event) {}
    fkey3_A(event) {}
    fkey4_A(event) {}
    fkey5_A(event) {}
    fkey6_A(event) {}
    fkey7_A(event) {}
    fkey8_A(event) {}
    fkey9_A(event) {}
    fkey10_A(event) {}
    fkey11_A(event) {}
    fkey12_A(event) {}

    get dataModel() { return this._dataModel; }
}
