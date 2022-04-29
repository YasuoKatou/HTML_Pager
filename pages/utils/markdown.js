/**
 * マークダウンからhtmlを生成するクラスの基本クラス.
 */
 class MarkdownBase {
    constructor(source) {
        this._source = source;
    }
    get newLine() {
        if (this._source.endsWith('  ')) {
            return document.createElement('br');
        }
        return null;
    }
}

/**
 * Anchor タグを生成する.
 */
class MarkdownATag extends MarkdownBase {
    /**
     * コンストラクタ.
     * @param {String} source マークダウンで記述した文字列（書式：[{title}]({url})）
     */
    constructor(source) {
        super(source);
    }

    /**
     * html タグを取得する.
     * @returns <a class="md-atag" href="{url}" target="_blank">{title}</a>
     */
    get htmlTag() {
        let p = this._source.indexOf(']');
        let a = document.createElement('a');
        a.innerText = this._source.substring(1, p);
        a.href = this._source.substring(p + 2, this._source.length - 1);
        a.classList.add('md-atag');
        a.target = '_blank';
        return a;
    }
}

/**
 * Preformatted Text タグ生成する.
 */
class MarkdownPreTag extends MarkdownBase {
    /**
     * コンストラクタ.
     * @param {String} source マークダウンで記述した文字列（書式：```文字列```）
     */
    constructor(source) {
        super(source);
    }

    _edit() {
        let flag = false
        let wk1 = this._source.substring(3, this._source.length - 3).trim().split(/\n/);
        let wk2 = '';
        for (let idx = 0; idx < wk1.length - 1; ++idx) {
            if (wk1[idx] !== '' || flag) {
                flag = true;
                wk2 += wk1[idx] + '\n';
            }
        }
        wk2 += wk1[wk1.length - 1];
        return wk2;
    }

    /**
     * html タグを取得する.
     * @returns <pre class="md-pretag"><code class="md-pre-codetag">文字列</code></pre>
     */
    get htmlTag() {
        let tagStyleName;
        let codeStyleName;
        if (this._source.search(/\n/) < 0) {
            tagStyleName = 'md-pretag_2';
            codeStyleName = 'md-pre-codetag_2';
        } else {
            tagStyleName = 'md-pretag_1';
            codeStyleName = 'md-pre-codetag_1';
        }
        let code = document.createElement('code');
        code.classList.add(codeStyleName);
        code.innerText = this._edit();

        let pre = document.createElement('pre');
        pre.classList.add(tagStyleName);
        pre.appendChild(code);
        return pre;
    }
}

/**
 * span タグ生成する.
 */
class MarkdownTextTag extends MarkdownBase {
    /**
     * コンストラクタ.
     * @param {String} source 文字列
     */
     constructor(source) {
        super(source);
    }

    /**
     * html タグを取得する.
     * @returns <span class="md-pretag">文字列</span>
     */
     get htmlTag() {
        // source format : string
        // <span class="md-spantag">{string}</span>
        let span = document.createElement('span');
        span.classList.add('md-spantag');
        let html = "";
        for (const line of this._source.split(/\n/)) html += line.replace(/\s{2}$/, '<br>');
        span.innerHTML = html;
        return span;
    }
}

class MarkdownToHtml extends MarkdownBase {
    /**
     * コンストラクタ.
     * @param {String} source htmlを生成するマークダウン文字列
     */
     constructor(source) {
        super(source);
    }

    _getATag(s) {
        let r = s.match(/\[[^\]]+\]\([^\)]+\)/g);
        //console.log(r);
        if (r === null) return [s];
        let ret = [];
        for (let i = 0; i < r.length; ++i) {
            var w1 = r[i];
            var p = s.indexOf(w1);
            if (p > 0) {
                ret.push(s.substr(0, p));
            }
            ret.push(new MarkdownATag(w1));
            s = s.substr(p + w1.length);
        }
        if (s.length > 0) ret.push(s);
        return ret;
    }
    
    _getCodeTag(s) {
        let r = s.match(/```[^```]*```/g);
        if (r === null) return [s];
        let ret = [];
        for (let i = 0; i < r.length; ++i) {
            var w1 = r[i];
            var p = s.indexOf(w1);
            if (p > 0) {
                ret.push(s.substr(0, p));
            }
            ret.push(new MarkdownPreTag(w1));
            s = s.substr(p + w1.length);
        }
        if (s.length > 0) ret.push(s);
        return ret;
    }

    _markdownTag(source) {
        let wk = [source];
        let ana = [];
        let toString = Object.prototype.toString;
        // code 部を分離
        for (let i = 0; i < wk.length; ++i) {
            let w = wk[i];
            if (toString.call(w) === '[object String]') {
                ana = ana.concat(this._getCodeTag(w));
            } else {
                ana.push(w);
            }
        }
        // link を分離
        wk = ana;
        ana = [];
        for (let i = 0; i < wk.length; ++i) {
            let w = wk[i];
            if (toString.call(w) === '[object String]') {
                ana = ana.concat(this._getATag(w));
            } else {
                ana.push(w);
            }
        }
        return ana;    
    }

    setHtml(parent) {
        let r = this._markdownTag(this._source);
        //console.log(r);
        for (let i = 0; i < r.length; ++i) {
            var w = r[i];
            // var newLine = null;
            if (w instanceof MarkdownPreTag) {
                parent.appendChild(w.htmlTag);
                // newLine = w.newLine;
            } else if (w instanceof MarkdownATag) {
                parent.appendChild(w.htmlTag);
                // newLine = w.newLine;
            } else if (typeof(w).toLowerCase() === 'string') {
                var pTag = new MarkdownTextTag(w);
                parent.appendChild(pTag.htmlTag);
                // newLine = pTag.newLine;
            } else {
                console.error(typeof(w));
            }
        }        
    }
}