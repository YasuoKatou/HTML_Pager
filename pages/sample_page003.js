/**
 * ポップアップリスト画面のデータモデルクラス.
 */
class SamplePage003Data extends DataModelBase {
    constructor() {
        super();
        this._headerTitles = {
            ".popup-table-head":
                ["No", "品名", "電話番号", "出荷日", "生産者"]
        };
        this._headerStyles = {
            ".popup-table-head":
                ["popup-table-col-no-3digit",  // No
                 "popup-table-col-name1",      // 品名
                 "popup-table-col-tel",        // 電話番号
                 "popup-table-col-date",       // 出荷日
                 "popup-table-col-name1"       // 生産者
                ]
        };
    }
}
/**
 * ポップアップリスト画面のコントローラクラス.
 */
class SamplePage003 extends PagerController {
    constructor(p) {
        super(p);
        this._dataModel = new SamplePage003Data();
    }
    get funcKeyDisplay() { return "hidden"; }
}
