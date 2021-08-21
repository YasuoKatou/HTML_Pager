# -*- coding:utf-8 -*-

import inspect
from http.server import HTTPServer
from http.server import SimpleHTTPRequestHandler

# https://docs.python.org/ja/3/library/http.server.html
# https://kazuhira-r.hatenablog.com/entry/2019/08/12/220406

# $ curl -X POST localhost:8082/get_sample

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
            self.end_headers()
            self.wfile.write('\n\n path {} is not found'.format(self.path).encode('utf-8'))
            return

class MyHttpServer(HttpHandlerBase):
    def do_POST_get_sample(self):
        print('start do_POST_get_sample')

        content_len  = int(self.headers.get("content-length"))
        req_body = self.rfile.read(content_len).decode("utf-8")
        print('request body : ({}) {}'.format(content_len, req_body.encode("utf-8")))

        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'{"status":"OK","message":"Hello Guillaume"}')

def run(server_class=HTTPServer, handler_class=MyHttpServer):
    server_address = ('', 8082)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

run()