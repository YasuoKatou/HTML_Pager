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

    get _getMyPage() {
        return document.getElementById(this._pageId);
    }

    _getElementsByClassName(rootTag, className, isArray = false, errLog = true) {
        let tags = rootTag.getElementsByClassName(className);
        if (tags.length === 1) {
            if (isArray) return tags;
            return tags[0];
        } else if (tags.length === 0) {
            if (errLog) {
                console.error('no such class name : ' + className);
            }
            return null;
        }
        return tags;
    }

    _addClickEvent() {
        let myPage = this._getMyPage;
        myPage.addEventListener('click', this._clickEventListener());
    }

    _clickEventListener() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._clickEvent(event);
            }, 0);
        }
    }

    _clickEvent(event) {}

    _addDoubleClickEvent() {
        let myPage = this._getMyPage;
        myPage.addEventListener('dblclick', this._doubleClickEventListener());
    }

    _doubleClickEventListener() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._doubleClickEvent(event);
            }, 0);
        }
    }

    _doubleClickEvent(event) {}

    _addChangeEvent() {
        let myPage = this._getMyPage;
        myPage.addEventListener('change', this._changeEventListener());
    }

    _changeEventListener() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._changeEvent(event);
            }, 0);
        }
    }

    _changeEvent(event) {}

    _addCompositionEvent() {
        let myPage = this._getMyPage;
        myPage.addEventListener('compositionstart', this._compositionEventListener());
        myPage.addEventListener('compositionend', this._compositionEventListener());
    }

    _compositionEventListener() {
        let self = this;
        return function(event) {
            setTimeout(function() {
                self._compositionEvent(event);
            }, 0);
        }
    }

    _compositionEvent(event) {}
}