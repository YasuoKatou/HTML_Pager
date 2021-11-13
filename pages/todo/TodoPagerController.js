class TodoPagerController extends PagerController {
    constructor(p) {
        super(p);
    }

    _urlPrefix() {
        // return 'http://localhost:8083';
        return 'http://localhost/HTML_Pager';
    }

    _createAjaxParam(func_id, req_data, resp_func) {
        return new PagerAjax({
            async: true,
            method: 'POST',
            url: this._urlPrefix() + '/' + func_id,
            requestHeaders: ['Content-Type', 'application/json'],
            txData: JSON.stringify(req_data),
            timeout: 5000,
            responseReceived: resp_func,
        });
    }

    _formatDate (date, format) {
        format = format.replace(/yyyy/g, date.getFullYear());
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
        format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
        format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
        return format;
      }
}