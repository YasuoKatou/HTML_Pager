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
            self._login(event);
        }
    }

    _login(event) {
        var prt = document.getElementById(this.pageId);
        var uid = prt.querySelector('#user_id');
        var pwd = prt.querySelector('#password');
        var strJson = JSON.stringify({user_id:uid.value, password:pwd.value});
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: 'http://localhost:8082/get_sample',
            requestHeaders: [
                'Access-Control-Allow-Origin', '*'
            ],
            txData: strJson,
            timeout: 10000,
            responseReveived: this._loginResponse(this)
        });
        ajax.send();
    }
    _loginResponse(self) {
        return function(respData) {
            console.log('response received at ' + self.pageId + ' : ' + respData);
            _pager.changePageById("ajax_test");
            // _pager.changePageById("page003");
//            _pager.changePageById("pageT04");
        }
    }
}
