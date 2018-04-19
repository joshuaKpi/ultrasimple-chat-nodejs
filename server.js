const http = require('http');
const fs = require('fs');
const url = require('url');
const chat = require('./chat');

http.createServer(function(req, res) {
  let urlParsed = url.parse(req.url);

  switch (urlParsed.pathname) {
    case '/':
      sendFile("index.html", res);
      break;

    case '/subscribe':
      chat.subscribe(req, res);
      break;

    case '/publish':
      let body = '';

      req
        .on('readable', function() {
          let content;
          if (null !== (content = req.read())) {
            body += content;
          }

          if (body.length > 1e4) {
            res.statusCode = 413;
            res.end("Your message is too big for my little chat");
          }
        })
        .on('end', function() {
          try {
            body = JSON.parse(body);
          } catch (e) {
            res.statusCode = 400;
            res.end("Bad Request");
            return;
          }

          chat.publish(body.message);
          res.end("ok");
        });

      break;

    default:
      res.statusCode = 404;
      res.end("Not found");
  }


}).listen(3000);


function sendFile(fileName, res) {
  let fileStream = fs.createReadStream(fileName);
  fileStream
    .on('error', function() {
      res.statusCode = 500;
      res.end("Server error");
    })
    .pipe(res)
    .on('close', function() {
      fileStream.destroy();
    });
}
