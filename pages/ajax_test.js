class AjaxTest extends PagerController {
    constructor(p) {
        super(p);
    }
    get funcKeyDisplay() { return "hidden"; }

    clicked_pat_btn1(self) {
        return function(event) {
            self._searchPostalCode(event);
        }
    }
    clicked_pat_no_host(self) {
        return function(event) {
            self._hostErrorTest(event);
        }
    }
    clicked_pat_not_found(self) {
        return function(event) {
            self._urlErrorTest(event);
        }
    }
    clicked_pat_svr_err(self) {
        return function(event) {
            self._serverErrorTest(event);
        }
    }
    clicked_pat_timeout(self) {
        return function(event) {
            self._timeoutTest(event);
        }
    }
    /*
     * 通信が正常終了するパターン.
     */
    _searchPostalCode(event) {
        var prt = document.getElementById(this.pageId);
        var pc = prt.querySelector('#pat_pcode');
        var strJson = JSON.stringify({postal_code:pc.value});
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: 'http://localhost:8082/get_postal_code_address',
            requestHeaders: [
                'Access-Control-Allow-Origin', '*'
            ],
            txData: strJson,
            timeout: 10000,
            responseReveived: this._postalcodeResponse(this),
        });
        ajax.send();
    }
    _postalcodeResponse(self) {
        return function(respData) {
            //console.log('response received at ' + self.pageId + ' : ' + respData);
            var js = JSON.parse(respData);
            var prt = document.getElementById(self.pageId);
            var pc = prt.querySelector('#postal_code_result');
            pc.innerHTML = js.address1 + js.address2;
        }
    }

    /**
     * 通信が異常終了するパターン.
     */
    _hostErrorTest(event) {
        this._ajax_result_tag_id = 'pat_no_host_result';
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: 'http://hogehoge.jp/index.html',
            timeout: 10000,
            transferFailed: this._transferFailed(this),
        });
        ajax.send();
    }

    /**
     * 通信が異常(404)終了するパターン.
     */
    _urlErrorTest(event) {
        this._ajax_result_tag_id = 'pat_not_found_result';
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: 'http://localhost:8082/not_found_page',
            timeout: 10000,
            transferFailed: this._transferFailed(this),
        });
        ajax.send();
    }

    /**
     * 通信が異常(404)終了するパターン.
     */
     _serverErrorTest(event) {
        this._ajax_result_tag_id = 'pat_svr_err_result';
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: 'http://localhost:8082/server_error',
            timeout: 10000,
            transferFailed: this._transferFailed(this),
        });
        ajax.send();
    }

    /**
     * 通信が異常(タイムアウト)終了するパターン.
     */
     _timeoutTest(event) {
        this._ajax_result_tag_id = 'pat_timeout_result';
        var ajax = new PagerAjax({
            async: true,
            method: 'POST',
            url: 'http://localhost:8082/timeout',
            timeout: 100,
            transferFailed: this._transferFailed(this),
        });
        ajax.send();
    }

    /**
     * 通信失敗のイベント
     */
    _transferFailed(self) {
        return function(event) {
            var prt = document.getElementById(self.pageId);
            var er = prt.querySelector('#' + self._ajax_result_tag_id);
            er.innerHTML = JSON.stringify(event);
        }
    }
}