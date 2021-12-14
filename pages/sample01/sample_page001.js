/**
 * ログインコントローラクラス.
 */
class SamplePage001 extends PagerController {
    constructor(p) {
        super(p);

        super._addClickEvent();
    }
    get funcKeyDisplay() { return "hidden"; }

    _clickEvent(event) {
        try {
            if (event.target.id === 'p1_btn1') {
                console.log(self.pageId + ' click event start');
                this._login(event);
            }
        } finally {
            super._clickEvent(event);
        }
    }

    _login(event) {
        var prt = document.getElementById(this.pageId);
        var uid = prt.querySelector('#user_id');
        var pwd = prt.querySelector('#password');
        var strJson = JSON.stringify({user_id:uid.value, password:pwd.value});
        // var url = location.protocol + '//' + location.host;
        var url = 'http://localhost:8082';
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: url + '/do_login',
            requestHeaders: [],
            txData: strJson,
            timeout: 10000,
            responseReceived: this._loginResponse(this)
        });
        ajax.send();
    }
    _loginResponse(self) {
        return function(respData) {
            console.log('response received at ' + self.pageId + ' : ' + respData);
            // _pager.changePageById("ajax_test");
            _pager.changePageById("page002");
        }
    }
}