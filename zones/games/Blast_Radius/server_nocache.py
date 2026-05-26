import http.server
import socketserver
import sys

PORT = 8080

class NoCacheDefaultHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), NoCacheDefaultHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT} without cache")
        httpd.serve_forever()
