const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocketServer, emitSocialProofEvent } = require('./src/lib/socket-server')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    
    // Intercept internal emit calls from Next.js API Routes to bypass module isolation
    if (parsedUrl.pathname === '/api/internal/emit-social-proof' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      req.on('end', () => {
        try {
          const { event, socketId } = JSON.parse(body)
          emitSocialProofEvent(event, socketId)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))
        } catch (err) {
          res.writeHead(500)
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      return;
    }

    handle(req, res, parsedUrl)
  })

  // Initialize Socket.IO
  initSocketServer(httpServer)

  const port = process.env.PORT || 3000
  const hostname = process.env.HOSTNAME || process.env.HOST || '127.0.0.1'
  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
