const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const MAX_PORT = PORT + 9;
const ROOT_DIR = __dirname;

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, "http://" + req.headers.host);

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "content-type": "text/plain; charset=utf-8" });
    res.end("Method not allowed");
    return;
  }

  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  serveFile(pathname, req.method, res);
});

function serveFile(urlPath, method, res) {
  const relativePath = decodeURIComponent(urlPath.replace(/^\/+/, ""));
  const filePath = path.normalize(path.join(ROOT_DIR, relativePath));

  if (!filePath.startsWith(ROOT_DIR + path.sep) && filePath !== ROOT_DIR) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "content-type": getContentType(filePath),
      "cache-control": "no-store",
    });
    res.end(method === "HEAD" ? undefined : data);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".avif": "image/avif",
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml; charset=utf-8",
    ".webp": "image/webp",
  };
  return types[ext] || "application/octet-stream";
}

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && server.currentPort < MAX_PORT) {
    server.listen((server.currentPort += 1), HOST);
    return;
  }

  throw error;
});

server.currentPort = PORT;
server.listen(server.currentPort, HOST, () => {
  console.log("WebP to JPEG converter running on " + HOST + ":" + server.currentPort);
});
