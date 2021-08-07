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
        this._listDatas = {
            ".popup-table-body":
                [
                    ["1", "りんご", "090-3126-6431", "2005/12/08", "金田 寿々花"],
                    ["2", "マンゴー", "080-9638-9940", "2010/10/09", "一木 璃奈子"],
                    ["3", "西瓜", "090-5288-6966", "2014/06/17", "伊丹 美佐子"],
                    ["4", "バナナ", "080-4484-3348", "2001/08/26", "米谷 竜次"],
                    ["5", "びわ", "080-3036-4275", "2016/04/27", "多岐川 秀隆"],
                    ["6", "とうもろこし", "080-4656-3321", "1984/8/12", "星 剛基"],
                    ["7", "いちご", "090-7903-4259", "1983/12/9", "上村 智花"],
                    ["8", "オレンジ", "080-2674-2375", "1967/6/11", "西村 兼"],
                    ["9", "ザクロ", "090-9233-8063", "1959/5/1", "神原 あさみ"],
                    ["10", "パイナップル", "090-5524-9104", "1977/1/14", "佐久間 沙耶"],
                    ["11", "もも", "090-7271-3274", "1974/6/14", "秋山 豊"],
                    ["12", "もも", "090-7271-3274", "1974/6/14", "秋山 豊"],
                    ["13", "もも", "090-7271-3274", "1974/6/14", "秋山 豊"],
                    ["14", "もも", "090-7271-3274", "1974/6/14", "秋山 豊"],
                    ["15", "もも", "090-7271-3274", "1974/6/14", "秋山 豊"],
                ]
        };
        this._listDataStyles = {
            ".popup-table-body":
                [
                    "popup-table-col-no-3digit",    // No
                    "popup-table-col-name1",        // 品名
                    "popup-table-col-tel",          // 電話番号
                    "popup-table-col-date",         // 出荷日
                    "popup-table-col-name1"         // 生産者
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
