class TagData extends DataModelBase {
    constructor() {
        super();
        this._listDatas = [
            "言語 C",
            "言語 C++",
            "言語 GO",
            "言語 Java",
            "言語 Python",
            "言語 Rust"
        ];
    }
    get rowTagClassName() { return 'PP0001-tag-list-container'; }
    get rows() { return this._listDatas.length; }
    rowColumns(index) {
        var ret = [];
        var l = document.createElement("label");
        l.classList.add('PP0001-tag-list-item');
        l.innerText = this._listDatas[index];
        var cbx = document.createElement("input");
        cbx.setAttribute('type', 'checkbox');
        cbx.setAttribute('value', '' + (index + 1));
        l.appendChild(cbx);
        ret.push(l);
        return ret;
    }
}

class TodoTagPage extends TodoPagerController {
    constructor(p) {
        super(p);
        this._dataModel = new TagData();
    }
}