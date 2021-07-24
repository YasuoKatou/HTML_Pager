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
    }
    get pageId() { return this._pageId; }
    get funcKeyDisplay() { return "visible"; }
    get funcKeyLabels() { return []; }
    get funcKeyLabelsWithShift() { return []; }
    get funcKeyLabelsWithCtrl() { return []; }
    get funcKeyLabelsWithAlt() { return []; }

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
}
