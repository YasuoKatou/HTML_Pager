# -*- coding:utf-8 -*-

import inspect
from http.server import HTTPServer
from http.server import SimpleHTTPRequestHandler

import time

# https://docs.python.org/ja/3/library/http.server.html
# https://kazuhira-r.hatenablog.com/entry/2019/08/12/220406

class HttpHandlerBase(SimpleHTTPRequestHandler):
    def do_GET(self):
        super().do_GET()

    def do_POST(self):
        print('POST response version : {}'.format(self.protocol_version))
        if len(self.path) < 1:
            print("no url")
            return
        m = 'do_POST' + self.path.replace('/', '_')
        print('method = {}'.format(m))
        f = False
        for a in inspect.getmembers(self):
            if a[0] == m:
                f = True
                invoker = getattr(self, m)
                invoker()
                break
        if not f:
            print('path : {} is not assigned'.format(self.path))
            self.send_response(404)     # Not Found
            self._sendCorsHeader()
            self.end_headers()
            self.wfile.write('\n\n path {} is not found'.format(self.path).encode('utf-8'))
            return

    def _sendCorsHeader(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

class MyHttpServer(HttpHandlerBase):
    def _getRequestData(self):
        content_len  = int(self.headers.get("content-length"))
        req_body = self.rfile.read(content_len).decode("utf-8")
        data = req_body.encode("utf-8")
        print('request body : ({}) {}'.format(content_len, data))
        return data

    def do_POST_do_login(self):
        print('start do_POST_do_login')

        self._getRequestData()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        super()._sendCorsHeader()
        self.end_headers()
        self.wfile.write(b'{"status":"OK"}')

    def do_POST_get_postal_code_address(self):
        print('start do_POST_get_postal_code_address')

        self._getRequestData()

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        super()._sendCorsHeader()
        self.end_headers()
        self.wfile.write('{"address1":"福岡県","address2":"春日市"}'.encode())

    def do_POST_server_error(self):
        print('start do_POST_server_error')
        self.send_response(500)   # 500 Internal Server Error
        super()._sendCorsHeader()
        self.end_headers()
        self.wfile.write('サーバ内でエラーが発生しました.'.encode())

    def do_POST_timeout(self):
        print('start do_POST_timeout')

        time.sleep(3)   # クライアントは、３秒以内にタイムアウトを検知すること

        try:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            super()._sendCorsHeader()
            self.end_headers()
            self.wfile.write('{"result":"OK"'.encode())
        except ConnectionAbortedError as ex:
            print('レスポンスの送信失敗')
            print(ex)

def run(server_class=HTTPServer, handler_class=MyHttpServer):
    server_address = ('', 8082)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()
