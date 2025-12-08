from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

ROOT = Path(__file__).parent


class PortfolioHandler(SimpleHTTPRequestHandler):
  # Serve files from the repository root where index.html lives.
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=str(ROOT), **kwargs)


def run():
  port = int(os.getenv("PORT", "8000"))
  host = os.getenv("HOST", "127.0.0.1")
  server = ThreadingHTTPServer((host, port), PortfolioHandler)
  print(f"Serving portfolio at http://{host}:{port}")
  try:
    server.serve_forever()
  except KeyboardInterrupt:
    print("\nServer stopped")


if __name__ == "__main__":
  run()
