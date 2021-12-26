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
            url: location.href + func_id,
            requestHeaders: ['Content-Type', 'application/json'],
            txData: JSON.stringify(req_data),
            timeout: 5000,
            responseReceived: resp_func,
        });
    }

    _formatDate(date, format) {
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

class ListSliderPageController extends TodoPagerController {
    constructor(p) {
        super(p);
    }

    _clickEvent(event) {
        try {
            let classList = event.target.classList;
            if (classList.contains('TG001-back-menu-01')) {
                this._closeCategorySlide(event.target);
                this._executeBackMenu01(event);
            } else if (classList.contains('TG001-back-menu-02')) {
                this._closeCategorySlide(event.target);
                this._executeBackMenu02(event);
            }
        } finally {
            super._clickEvent(event);
        }
    }

    _executeBackMenu01(event) {}
    _executeBackMenu02(event) {}

    _setActiveRowSlider(target) {
        let parent = target.parentNode;
        let ul = target.closest('ul');
        let els = ul.getElementsByClassName('TG001-item-label-container');
        for (let index = 0; index < els.length; ++index) {
            if (els[index] !== parent) {
                els[index].classList.remove('active');
            }
        }
        parent.classList.toggle('active');
    }

    _closeCategorySlide(target) {
        let p = target.closest('.TG001-item-body');
        let els = p.getElementsByClassName('TG001-item-label-container');
        els[0].classList.remove('active');
    }
}