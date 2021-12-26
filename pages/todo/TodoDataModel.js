class TodoDataModel extends DataModelBase {
    constructor() {
        super();
    }

     _createRowBackMenu() {
        let item = document.createElement('div');
        item.classList.add('TG001-item-body');

        let div = document.createElement('div');
        div.classList.add('TG001-back-menu-container');
        let p = document.createElement('p');
        p.classList.add('TG001-back-menu-01');
        p.innerText = '変更';
        div.appendChild(p);
        p = document.createElement('p');
        p.classList.add('TG001-back-menu-02');
        p.innerText = '削除';
        div.appendChild(p);

        item.appendChild(div);
        return item;
     }

     _createLabelContainer() {
        let c = document.createElement('div');
        c.classList.add('TG001-item-label-container');
        return c;
     }
 }