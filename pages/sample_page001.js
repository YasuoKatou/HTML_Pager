/**
 * ログインコントローラクラス.
 */
class SamplePage001 extends PagerController {
    constructor(p) {
        super(p);
    }
    get funcKeyDisplay() { return "hidden"; }

    clicked_p1_btn1(self) {
        return function(event) {
            console.log(self.pageId + ' click event start');

            var ajaxParam = new PagerAjaxInfo();
            ajaxParam.httpRequestMethod = 'POST';
            ajaxParam.httpRequestUrl = 'http://localhost:8082/get_sample';
            ajaxParam.addHttpRequestHeader('Access-Control-Allow-Origin', '*');
            var ajax = new PagerAjax(ajaxParam);
            ajax.send();

            _pager.changePageById("page003");
//            _pager.changePageById("pageT04");
        }
    }
}
