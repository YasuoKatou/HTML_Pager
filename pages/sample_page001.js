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
            self._login();
        }
    }

    _login() {
        var ajaxParam = new PagerAjaxInfo();
        ajaxParam.httpRequestMethod = 'POST';
        ajaxParam.httpRequestUrl = 'http://localhost:8082/get_sample';
        ajaxParam.addHttpRequestHeader('Access-Control-Allow-Origin', '*');
        ajaxParam.httpResponseReveived = this._loginResponse(this);
        var ajax = new PagerAjax(ajaxParam);
        ajax.send();
    }
    _loginResponse(self) {
        return function(respData) {
            console.log('response received at ' + self.pageId + ' : ' + respData);
            _pager.changePageById("page003");
//            _pager.changePageById("pageT04");
        }
    }
}
