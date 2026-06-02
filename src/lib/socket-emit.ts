export async function emitSocialProofInternal(event: any, socketId?: string | null) {
  try {
    const port = process.env.PORT || 3000
    // Lấy URL thực tế từ request hoặc localhost (chỉ gọi local server.js process)
    await fetch(`http://127.0.0.1:${port}/api/internal/emit-social-proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, socketId })
    })
  } catch (e) {
    console.error('Failed to emit internal social proof', e)
  }
}
