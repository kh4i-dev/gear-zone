let io = null

function initSocketServer(httpServer) {
  const { Server } = require('socket.io')
  
  io = new Server(httpServer, {
    path: '/api/socket',
    cors: { 
      // Next.js dev server URL is usually localhost:3000, production will use the actual app URL
      origin: process.env.NEXT_PUBLIC_APP_URL || '*'
    }
  })

  io.on('connection', (socket) => {
    // Client chỉ được LISTEN, không được EMIT social proof
    // Nếu client cố emit 'social_proof' → ignore/kick
    socket.onAny((event) => {
      if (event === 'social_proof') {
        socket.disconnect(true)
      }
    })
  })

  return io
}

function emitSocialProofEvent(event, senderSocketId = null) {
  if (!io) return

  const payload = {
    id: event.id,
    type: event.type,           // ADD_TO_CART | ORDER_CREATED
    productName: event.productName,
    productSlug: event.productSlug,
    createdAt: event.createdAt,
    // Không chứa PII
  }

  if (senderSocketId) {
    io.except(senderSocketId).emit('social_proof', payload)
  } else {
    io.emit('social_proof', payload)
  }
}

module.exports = { initSocketServer, emitSocialProofEvent }
