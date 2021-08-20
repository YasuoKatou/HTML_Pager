/**
 * Pager基本クラス.
 * 
 * @version 0.0.1
 * @since 0.0.1
 * 
 * @author Y.Katou <yasuokatou@gmail.com>
 */
 class PagerBase {}

 /**
  * クリックイベント情報クラス.
  * 
  * @version 0.0.1
  * @since 0.0.1
  * 
  * @author Y.Katou <yasuokatou@gmail.com>
  */
  class PagerClickEvent extends PagerBase {
     constructor(tag_id, event_func) {
         super();
         this._tagId = tag_id;
         this._eventFunc = event_func;
     }
     get tagId() { return this._tagId; }
     get eventFunc() { return this._eventFunc; }
 }

/**
 * ファンクションキー情報クラス.
 * 
 * @version 0.0.1
 * @since 0.0.1
 * 
 * @author Y.Katou <yasuokatou@gmail.com>
 */
class PagerFunctionKey extends PagerBase {
    static KEY_ID_NO_MODIFIRE = 0;    
    static KEY_ID_SHIFT = 1;
    static KEY_ID_CONTRIL = 2;
    static KEY_ID_ALT = 4;
    static FKEY_ID_PREFIX = "fkey";
    static FKEY_COUNT = 12;
/*
    constructor(modifier_keys, label_list, func_key_list) {
        super();
        this._labelList    = label_list;
        this._funcKeyList  = func_key_list;
        _setModifierKeyPattern(modifier_keys);
    }
    _setModifierKeyPattern(modifier_keys) {
        this._modifierKeys = modifier_keys;
        var ptn = modifier_keys.toLowerCase();
        this._modifierKeyMask = 0;
        if (ptn.indexOf("shift") > -1) this._modifierKeyMask += KEY_ID_SHIFT;
        if (ptn.indexOf("ctrl")  > -1) this._modifierKeyMask += KEY_ID_CONTRIL;
        if (ptn.indexOf("alt")   > -1) this._modifierKeyMask += KEY_ID_ALT;
    }
    get modifierKeyMask() { return this._modifierKeyMask; }
    get labelList() { return this._labelList; }
    get funcKeyList() { return this._funcKeyList; }
*/
}

class DataModelBase extends PagerBase {
    constructor() {
        super();
        this._headerTitles = null;
        this._headerStyles = null;
        this._listDatas = null;
        this._listDataStyles = null;
    }
    get headerTitles() { return this._headerTitles; }
    get headerStyles() { return this._headerStyles; }
    get listDatas() { return this._listDatas; }
    get listDataStyles() { return this._listDataStyles; }
}

class PagerAjax extends PagerBase {
    constructor(ajax_info) {
        super();
        this._ajax_info = ajax_info;
        this._httpRequest = new XMLHttpRequest();
        this._httpRequest.onreadystatechange = this.alertContents(this);
        if (this._ajax_info.timeout) {
            this._httpRequest.timeout = this._ajax_info.timeout;
        }
    }

    send() {
        this._httpRequest.open(this._ajax_info.method, this._ajax_info.url, this._ajax_info.async);
    }

    alertContents(self) {
        return function() {
            switch(this.readyState) {
                case XMLHttpRequest.OPENED:
                    console.log('ajax opened');
                    var requestHeaders = self._ajax_info.requestHeaders;
                    for (let i = 0; i < requestHeaders.length; i += 2) {
                        this.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
                    }
                    this.send();
                    break;
                case XMLHttpRequest.DONE:
                    if ((200 <= this.status && this.status < 300) || (this.status == 304)) {
                        if (self._ajax_info.responseReveived !== null) {
                            self._ajax_info.responseReveived(this.response);
                        } else {
                            console.log('ajax normal end (no reveied function)');
                        }
                    } else {
                        console.error('ajax error end');
                    }
                    break;
                case XMLHttpRequest.HEADERS_RECEIVED:
                    // console.log('ajax header recieved');
                    break;
                case XMLHttpRequest.LOADING:
                    //console.log('ajax response recieving');
                    break;
                default:
                    console.error('ajax error (' + this.readyState + ')');
                    break;
            }
        }
    }
}
