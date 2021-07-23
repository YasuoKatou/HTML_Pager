

function func1(event) {
    console.log('execute func1');
    _pager.changePage("page002");
}

function func2(event) {
    console.log('execute func2');
    _pager.changePage("page001");
}

_pager.openningPage = "page001";
_pager.addClickEvent("p1_btn1", func1);
_pager.addClickEvent("p2_btn1", func2);
