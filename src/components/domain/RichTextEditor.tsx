'use client'

import React, { useRef, useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import { 
  Bold, Italic, Underline, Heading2, Heading3, 
  List, ListOrdered, Link, Image, AlignLeft, 
  AlignCenter, AlignRight, Trash2, Eye, Code, 
  Type, Check, UploadCloud
} from 'lucide-react'
import { toast } from 'sonner'
import NextImage from 'next/image'

interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

const clientLoadedStore = {
  subscribe: () => () => {},
  getSnapshot: () => true,
  getServerSnapshot: () => false,
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const replaceInputRef = useRef<HTMLInputElement>(null)
  const [isVisualMode, setIsVisualMode] = useState(true)
  const [dragCounter, setDragCounter] = useState(0)
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)
  const [imageRect, setImageRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeWidth, setResizeWidth] = useState<number | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [cropRatio, setCropRatio] = useState<'free' | '1:1' | '16:9' | '4:3'>('free')
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 })
  const [cropZoom, setCropZoom] = useState(100)
  const [altText, setAltText] = useState('')
  const [captionText, setCaptionText] = useState('')

  const mounted = useSyncExternalStore(
    clientLoadedStore.subscribe,
    clientLoadedStore.getSnapshot,
    clientLoadedStore.getServerSnapshot
  )

  const updateEditorContent = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  useEffect(() => {
    if (editorRef.current && isVisualMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, isVisualMode, mounted])

  useEffect(() => {
    if (!isCropModalOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCropModalOpen(false)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (!selectedImage) return
        const toastId = toast.loading('Đang cắt ảnh...')

        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        img.src = selectedImage.src
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              toast.error('Không khởi tạo được Canvas')
              return
            }

            const realX = (cropBox.x / 100) * img.naturalWidth
            const realY = (cropBox.y / 100) * img.naturalHeight
            const realW = (cropBox.width / 100) * img.naturalWidth
            const realH = (cropBox.height / 100) * img.naturalHeight

            canvas.width = realW
            canvas.height = realH

            ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH)

            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
            const targetImg = selectedImage;
            targetImg.src = croppedDataUrl

            updateEditorContent()
            setIsCropModalOpen(false)
            toast.success('Cắt ảnh thành công!', { id: toastId })
          } catch (err) {
            toast.error('Không thể cắt ảnh do chính sách bảo mật CORS', { id: toastId })
          }
        }
        img.onerror = () => {
          toast.error('Không tải được ảnh để cắt', { id: toastId })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCropModalOpen, cropBox, cropRatio, selectedImage, updateEditorContent])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setSelectedImage(null)
        setImageRect(null)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (selectedImage) {
        updateImageRect(selectedImage)
      }
    }

    const editor = editorRef.current
    if (editor) {
      editor.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      if (editor) {
        editor.removeEventListener('scroll', handleScroll)
      }
    }
  }, [selectedImage])

  useEffect(() => {
    const handleResize = () => {
      if (selectedImage) {
        updateImageRect(selectedImage)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [selectedImage])

  if (!mounted) return null

  const handleResizeStart = (e: React.MouseEvent, handle: 'tl' | 'tr' | 'bl' | 'br') => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!selectedImage) return
    
    setIsResizing(true)
    
    const startMouseX = e.clientX
    const startRect = selectedImage.getBoundingClientRect()
    const startWidth = startRect.width
    const parent = selectedImage.parentElement
    const parentWidth = parent ? parent.getBoundingClientRect().width : 1000

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX
      let newWidth = startWidth
      
      if (handle === 'br' || handle === 'tr') {
        newWidth = startWidth + deltaX
      } else {
        newWidth = startWidth - deltaX
      }
      
      let widthPercent = (newWidth / parentWidth) * 100
      widthPercent = Math.min(100, Math.max(10, Math.round(widthPercent)))
      
      const targetImg = selectedImage;
      targetImg.style.width = `${widthPercent}%`
      targetImg.style.height = 'auto'
      
      setResizeWidth(widthPercent)
      updateImageRect(selectedImage)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setResizeWidth(null)
      updateEditorContent()
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const updateImageRect = (img: HTMLImageElement) => {
    if (!wrapperRef.current) return
    const wrapperRect = wrapperRef.current.getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()
    
    setImageRect({
      top: imgRect.top - wrapperRect.top,
      left: imgRect.left - wrapperRect.left,
      width: imgRect.width,
      height: imgRect.height
    })
  }

  // Handle click on editor area to detect image selection
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement
      setSelectedImage(img)
      updateImageRect(img)
      
      // Load existing alt text
      setAltText(img.alt || '')
      
      // Load existing caption text
      const captionEl = img.nextElementSibling as HTMLElement
      if (captionEl && (captionEl.classList.contains('image-caption') || captionEl.tagName === 'FIGCAPTION')) {
        setCaptionText(captionEl.textContent || '')
      } else {
        setCaptionText('')
      }
    } else {
      setSelectedImage(null)
      setImageRect(null)
    }
  }

  // Handler for updating Alt Text dynamically
  const handleAltChange = (val: string) => {
    setAltText(val)
    if (selectedImage) {
      const targetImg = selectedImage;
      targetImg.alt = val
      updateEditorContent()
    }
  }

  // Handler for updating Caption text dynamically
  const handleCaptionChange = (val: string) => {
    setCaptionText(val)
    if (!selectedImage) return
    
    const captionEl = selectedImage.nextElementSibling as HTMLElement
    const hasCaption = captionEl && (captionEl.classList.contains('image-caption') || captionEl.tagName === 'FIGCAPTION')
    
    if (val.trim() === '') {
      if (hasCaption) {
        captionEl.remove()
      }
    } else {
      if (hasCaption) {
        captionEl.textContent = val
      } else {
        const p = document.createElement('p')
        p.className = 'image-caption text-center text-xs text-slate-400 mt-1 italic'
        p.style.textAlign = 'center'
        p.style.fontSize = '0.75rem'
        p.style.color = '#94a3b8'
        p.style.marginTop = '0.25rem'
        p.style.fontStyle = 'italic'
        p.textContent = val
        selectedImage.after(p)
      }
    }
    updateEditorContent()
  }

  // Handler for changing Aspect Ratio presets
  const handleAspectRatioChange = (ratio: 'auto' | '1/1' | '16/9' | '4/3') => {
    if (!selectedImage) return
    
    const targetImg = selectedImage;
    if (ratio === 'auto') {
      targetImg.style.aspectRatio = 'auto'
      targetImg.style.objectFit = 'contain'
    } else {
      targetImg.style.aspectRatio = ratio.replace('/', ' / ')
      targetImg.style.objectFit = 'cover'
    }
    
    updateEditorContent()
    setTimeout(() => {
      if (selectedImage) {
        updateImageRect(selectedImage)
      }
    }, 50)
  }

  // Handler for rotating the image by 90 deg clockwise using Canvas
  const handleRotateImage = () => {
    if (!selectedImage) return
    const toastId = toast.loading('Đang xoay ảnh...')
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = selectedImage.src
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          toast.error('Không khởi tạo được Canvas')
          return
        }
        
        // Swap dimensions for 90 degree rotation
        canvas.width = img.naturalHeight
        canvas.height = img.naturalWidth
        
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((90 * Math.PI) / 180)
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
        
        const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        const targetImg = selectedImage;
        targetImg.src = rotatedDataUrl
        
        updateEditorContent()
        toast.success('Đã xoay ảnh 90°!', { id: toastId })
        
        setTimeout(() => {
          if (selectedImage) {
            updateImageRect(selectedImage)
          }
        }, 50)
      } catch (err) {
        toast.error('Không thể xoay ảnh này do giới hạn bảo mật (CORS)', { id: toastId })
      }
    }
    img.onerror = () => {
      toast.error('Lỗi tải ảnh để xoay', { id: toastId })
    }
  }

  // Image replacement trigger and upload handler
  const triggerImageReplacement = () => {
    if (replaceInputRef.current) {
      replaceInputRef.current.click()
    }
  }

  const handleImageReplacement = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedImage) return
    
    const file = files[0]
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ ảnh dạng JPG, PNG, WEBP hoặc GIF')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tải lên không được vượt quá 5MB')
      return
    }
    
    const toastId = toast.loading('Đang thay thế ảnh...')
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch('/api/admin/upload-product-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error?.message || 'Không thể thay thế ảnh')
      }
      
      const imageUrl = result.data.imageUrl
      const targetImg = selectedImage;
      targetImg.src = imageUrl
      targetImg.alt = file.name || 'Ảnh sản phẩm'
      setAltText(file.name || 'Ảnh sản phẩm')
      
      updateEditorContent()
      toast.success('Thay thế ảnh thành công!', { id: toastId })
      
      setTimeout(() => {
        if (selectedImage) {
          updateImageRect(selectedImage)
        }
      }, 50)
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thay thế ảnh', { id: toastId })
    } finally {
      e.target.value = ''
    }
  }

  // Draggable crop rectangle helper with 8-handle resizing and mobile touch support
  const startCropDrag = (e: React.MouseEvent | React.TouchEvent, mode: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'r' | 'b' | 'l') => {
    e.preventDefault()
    e.stopPropagation()
    
    const isTouch = 'touches' in e
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    const clientY = isTouch ? e.touches[0].clientY : e.clientY
    
    const startX = clientX
    const startY = clientY
    const startBox = { ...cropBox }
    
    const handleMove = (moveX: number, moveY: number) => {
      const container = document.getElementById('crop-container')
      if (!container) return
      const rect = container.getBoundingClientRect()
      
      const deltaX = moveX - startX
      const deltaY = moveY - startY
      
      const pctDeltaX = (deltaX / rect.width) * 100
      const pctDeltaY = (deltaY / rect.height) * 100
      
      let nextBox = { ...startBox }
      
      if (mode === 'move') {
        nextBox.x = Math.max(0, Math.min(100 - startBox.width, startBox.x + pctDeltaX))
        nextBox.y = Math.max(0, Math.min(100 - startBox.height, startBox.y + pctDeltaY))
      } else {
        // Dragging edge or corner handles
        // Left handles
        if (mode === 'tl' || mode === 'bl' || mode === 'l') {
          const maxLeft = startBox.x + startBox.width - 5
          const nextX = Math.max(0, Math.min(maxLeft, startBox.x + pctDeltaX))
          nextBox.width = startBox.x + startBox.width - nextX
          nextBox.x = nextX
        }
        // Right handles
        if (mode === 'tr' || mode === 'br' || mode === 'r') {
          const maxRight = 100 - startBox.x
          nextBox.width = Math.max(5, Math.min(maxRight, startBox.width + pctDeltaX))
        }
        // Bottom handles
        if (mode === 'bl' || mode === 'br' || mode === 'b') {
          const maxBottom = 100 - startBox.y
          nextBox.height = Math.max(5, Math.min(maxBottom, startBox.height + pctDeltaY))
        }
        // Top handles
        if (mode === 'tl' || mode === 'tr' || mode === 't') {
          const maxTop = startBox.y + startBox.height - 5
          const nextY = Math.max(0, Math.min(maxTop, startBox.y + pctDeltaY))
          nextBox.height = startBox.y + startBox.height - nextY
          nextBox.y = nextY
        }
        
        // Enforce aspect ratio preset constraints when locked
        if (cropRatio !== 'free') {
          let targetRatio = 1
          if (cropRatio === '16:9') targetRatio = 16 / 9
          else if (cropRatio === '4:3') targetRatio = 4 / 3
          else if (cropRatio === '1:1') targetRatio = 1
          
          const containerAspect = rect.width / rect.height
          
          if (mode === 'l' || mode === 'r') {
            const newHeight = (nextBox.width * containerAspect) / targetRatio
            nextBox.height = Math.min(100 - nextBox.y, newHeight)
          } else if (mode === 't' || mode === 'b') {
            const newWidth = (nextBox.height * targetRatio) / containerAspect
            nextBox.width = Math.min(100 - nextBox.x, newWidth)
          } else {
            // Corner handles (tl, tr, bl, br)
            const newHeight = (nextBox.width * containerAspect) / targetRatio
            if (newHeight <= 100 - nextBox.y) {
              nextBox.height = newHeight
              if (mode === 'tl' || mode === 'tr') {
                nextBox.y = startBox.y + startBox.height - nextBox.height
              }
            } else {
              nextBox.height = 100 - nextBox.y
              nextBox.width = (nextBox.height * targetRatio) / containerAspect
              if (mode === 'tl' || mode === 'bl') {
                nextBox.x = startBox.x + startBox.width - nextBox.width
              }
            }
          }
        }
      }
      
      // Clamp values strictly
      if (nextBox.x < 0) nextBox.x = 0
      if (nextBox.y < 0) nextBox.y = 0
      if (nextBox.x + nextBox.width > 100) nextBox.width = 100 - nextBox.x
      if (nextBox.y + nextBox.height > 100) nextBox.height = 100 - nextBox.y
      
      setCropBox(nextBox)
    }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleMove(moveEvent.clientX, moveEvent.clientY)
    }
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        handleMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY)
      }
    }
    
    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
    }
    
    if (isTouch) {
      document.addEventListener('touchmove', handleTouchMove, { passive: true })
      document.addEventListener('touchend', handleEnd, { passive: true })
    } else {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleEnd)
    }
  }

  // Handle save crop onto Canvas
  const handleSaveCrop = () => {
    if (!selectedImage) return
    const toastId = toast.loading('Đang cắt ảnh...')
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = selectedImage.src
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          toast.error('Không khởi tạo được Canvas')
          return
        }
        
        const realX = (cropBox.x / 100) * img.naturalWidth
        const realY = (cropBox.y / 100) * img.naturalHeight
        const realW = (cropBox.width / 100) * img.naturalWidth
        const realH = (cropBox.height / 100) * img.naturalHeight
        
        canvas.width = realW
        canvas.height = realH
        
        ctx.drawImage(img, realX, realY, realW, realH, 0, 0, realW, realH)
        
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        const targetImg = selectedImage;
        targetImg.src = croppedDataUrl
        
        updateEditorContent()
        setIsCropModalOpen(false)
        toast.success('Cắt ảnh thành công!', { id: toastId })
        
        setTimeout(() => {
          if (selectedImage) {
            updateImageRect(selectedImage)
          }
        }, 100)
      } catch (err) {
        toast.error('Không thể cắt ảnh do chính sách bảo mật CORS', { id: toastId })
      }
    }
    img.onerror = () => {
      toast.error('Không tải được ảnh để cắt', { id: toastId })
    }
  }



  // Clear selection when visual/code mode changes (now handled in the click event)

  const applyImageStyle = (styles: { float: string; margin: string; width?: string }) => {
    if (!selectedImage) return
    const targetImg = selectedImage;
    
    // Apply styling rules
    targetImg.style.float = styles.float
    targetImg.style.margin = styles.margin
    
    if (styles.width) {
      targetImg.style.width = styles.width
    }
    
    if (styles.float === 'left' || styles.float === 'right') {
      targetImg.style.display = 'inline-block'
    } else {
      targetImg.style.display = 'block'
    }

    // Trigger update of innerHTML back to state
    updateEditorContent()
    
    // Re-calculate overlay rect after reflow
    setTimeout(() => {
      if (selectedImage) {
        updateImageRect(selectedImage)
      }
    }, 50)
  }

  const uploadFileAndInsert = async (file: File, range: Range | null = null) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ ảnh dạng JPG, PNG, WEBP hoặc GIF')
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh tải lên không được vượt quá 5MB')
      return
    }
    
    const toastId = toast.loading('Đang tải ảnh lên hệ thống...')
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch('/api/admin/upload-product-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error?.message || 'Không thể tải ảnh lên')
      }
      
      const imageUrl = result.data.imageUrl
      
      if (isVisualMode) {
        // Focus back to editor
        if (editorRef.current) {
          editorRef.current.focus()
        }

        // Restore range/cursor selection
        const selection = window.getSelection()
        if (range && selection) {
          selection.removeAllRanges()
          selection.addRange(range)
        }

        // Create beautiful styled img node
        const img = document.createElement('img')
        img.src = imageUrl
        img.alt = file.name || 'Ảnh sản phẩm'
        img.className = 'max-w-full h-auto rounded-xl my-4 border border-white/10 shadow-lg block mx-auto hover:scale-[1.01] transition-all duration-300 cursor-pointer'
        img.style.maxHeight = '400px'
        img.style.objectFit = 'contain'
        img.style.width = '75%'
        img.style.display = 'block'
        img.style.marginLeft = 'auto'
        img.style.marginRight = 'auto'
        img.style.float = 'none'

        if (selection && selection.rangeCount > 0) {
          const currentRange = selection.getRangeAt(0)
          currentRange.deleteContents()
          currentRange.insertNode(img)
          
          // Add spacing paragraph after the image
          const p = document.createElement('p')
          p.innerHTML = '&nbsp;'
          img.after(p)
          
          // Move cursor after the space
          const newRange = document.createRange()
          newRange.setStartAfter(p)
          newRange.setEndAfter(p)
          selection.removeAllRanges()
          selection.addRange(newRange)
        } else if (editorRef.current) {
          editorRef.current.appendChild(img)
          const p = document.createElement('p')
          p.innerHTML = '&nbsp;'
          editorRef.current.appendChild(p)
        }

        if (editorRef.current) {
          onChange(editorRef.current.innerHTML)
        }
      } else {
        // HTML Code Mode
        const textarea = textareaRef.current
        if (textarea) {
          const imgTag = `<img src="${imageUrl}" alt="${file.name || 'Ảnh sản phẩm'}" class="max-w-full h-auto rounded-xl my-4 border border-white/10 shadow-lg block mx-auto hover:scale-[1.01] transition-all duration-300 cursor-pointer" style="max-height: 400px; object-fit: contain; width: 75%; display: block; margin-left: auto; margin-right: auto; float: none;" />\n`
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const text = textarea.value
          const newText = text.substring(0, start) + imgTag + text.substring(end)
          onChange(newText)
          
          setTimeout(() => {
            textarea.focus()
            textarea.selectionStart = textarea.selectionEnd = start + imgTag.length
          }, 0)
        }
      }
      
      toast.success('Đã tải lên và chèn ảnh thành công!', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải ảnh lên máy chủ', { id: toastId })
    }
  }

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return
    
    // 1. Check if paste includes an image
    let hasImage = false
    let imageFile: File | null = null
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault() // Stop default paste (prevent pasting raw base64 data)
        const file = items[i].getAsFile()
        if (file) {
          imageFile = file
        }
        hasImage = true
        break
      }
    }
    
    if (imageFile) {
      await uploadFileAndInsert(imageFile)
    }
    
    if (hasImage) return

    // 2. If it's visual mode and pasting rich text/HTML: sanitize colors & background to match dark mode!
    if (isVisualMode) {
      const htmlData = e.clipboardData?.getData('text/html')
      if (htmlData) {
        e.preventDefault()
        
        // Parse the HTML data
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlData, 'text/html')
        
        // Strip out colors, background colors, font-families, font-sizes, and foreign classNames
        const allElements = doc.querySelectorAll('*')
        allElements.forEach((el: any) => {
          if (el.style) {
            el.removeAttribute('style')
          }
          // Remove external framework classes that might override themes (like light-mode/bg-white/text-black)
          el.removeAttribute('class')
        })
        
        const sanitizedHtml = doc.body.innerHTML
        
        if (editorRef.current) {
          editorRef.current.focus()
        }
        
        document.execCommand('insertHTML', false, sanitizedHtml)
      }
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => prev + 1)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(prev => Math.max(0, prev - 1))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Crucial to allow drop!
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragCounter(0)
    
    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        let range: Range | null = null
        if (isVisualMode) {
          if (document.caretRangeFromPoint) {
            range = document.caretRangeFromPoint(e.clientX, e.clientY)
          }
        }
        await uploadFileAndInsert(files[i], range)
        break
      }
    }
  }

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const addLink = () => {
    const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const addImage = () => {
    const url = prompt('Nhập địa chỉ ảnh (URL):', 'https://')
    if (!url) return
    
    if (isVisualMode) {
      if (editorRef.current) {
        editorRef.current.focus()
      }
      
      const img = document.createElement('img')
      img.src = url
      img.alt = 'Ảnh sản phẩm'
      img.className = 'max-w-full h-auto rounded-xl my-4 border border-white/10 shadow-lg block mx-auto hover:scale-[1.01] transition-all duration-300 cursor-pointer'
      img.style.maxHeight = '400px'
      img.style.objectFit = 'contain'
      img.style.width = '75%'
      img.style.display = 'block'
      img.style.marginLeft = 'auto'
      img.style.marginRight = 'auto'
      img.style.float = 'none'

      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(img)
        
        // Add spacing paragraph after the image
        const p = document.createElement('p')
        p.innerHTML = '&nbsp;'
        img.after(p)
        
        // Move cursor after the space
        const newRange = document.createRange()
        newRange.setStartAfter(p)
        newRange.setEndAfter(p)
        selection.removeAllRanges()
        selection.addRange(newRange)
      } else if (editorRef.current) {
        editorRef.current.appendChild(img)
        const p = document.createElement('p')
        p.innerHTML = '&nbsp;'
        editorRef.current.appendChild(p)
      }

      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    } else {
      // HTML Code Mode
      const textarea = textareaRef.current
      if (textarea) {
        const imgTag = `<img src="${url}" alt="Ảnh sản phẩm" class="max-w-full h-auto rounded-xl my-4 border border-white/10 shadow-lg block mx-auto hover:scale-[1.01] transition-all duration-300 cursor-pointer" style="max-height: 400px; object-fit: contain; width: 75%; display: block; margin-left: auto; margin-right: auto; float: none;" />\n`
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value
        const newText = text.substring(0, start) + imgTag + text.substring(end)
        onChange(newText)
        
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = textarea.selectionEnd = start + imgTag.length
        }, 0)
      }
    }
  }

  return (
    <div 
      ref={wrapperRef}
      className="w-full rounded-2xl border border-white/10 bg-slate-950 overflow-hidden shadow-xl relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2.5 bg-slate-900 border-b border-white/5 shrink-0 select-none">
        <div className="flex flex-wrap items-center gap-1">
          {isVisualMode ? (
            <>
              {/* Bold */}
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Chữ đậm"
              >
                <Bold className="size-4" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Chữ nghiêng"
              >
                <Italic className="size-4" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onClick={() => execCommand('underline')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Gạch chân"
              >
                <Underline className="size-4" />
              </button>

              <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

              {/* Heading 2 */}
              <button
                type="button"
                onClick={() => execCommand('formatBlock', '<h2>')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95 font-black text-xs"
                title="Tiêu đề 2"
              >
                <Heading2 className="size-4" />
              </button>

              {/* Heading 3 */}
              <button
                type="button"
                onClick={() => execCommand('formatBlock', '<h3>')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95 font-bold text-xs"
                title="Tiêu đề 3"
              >
                <Heading3 className="size-4" />
              </button>

              {/* Normal Paragraph */}
              <button
                type="button"
                onClick={() => execCommand('formatBlock', '<p>')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95 text-xs font-bold"
                title="Đoạn văn"
              >
                <Type className="size-4" />
              </button>

              <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

              {/* Unordered List */}
              <button
                type="button"
                onClick={() => execCommand('insertUnorderedList')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Danh sách dấu chấm"
              >
                <List className="size-4" />
              </button>

              {/* Ordered List */}
              <button
                type="button"
                onClick={() => execCommand('insertOrderedList')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Danh sách số"
              >
                <ListOrdered className="size-4" />
              </button>

              <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

              {/* Justify Left */}
              <button
                type="button"
                onClick={() => execCommand('justifyLeft')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Căn trái"
              >
                <AlignLeft className="size-4" />
              </button>

              {/* Justify Center */}
              <button
                type="button"
                onClick={() => execCommand('justifyCenter')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Căn giữa"
              >
                <AlignCenter className="size-4" />
              </button>

              {/* Justify Right */}
              <button
                type="button"
                onClick={() => execCommand('justifyRight')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Căn phải"
              >
                <AlignRight className="size-4" />
              </button>

              <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

              {/* Link */}
              <button
                type="button"
                onClick={addLink}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Thêm liên kết"
              >
                <Link className="size-4" />
              </button>

              {/* Image */}
              <button
                type="button"
                onClick={addImage}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition active:scale-95"
                title="Chèn ảnh bằng link"
              >
                <Image className="size-4" />
              </button>

              {/* Clear format */}
              <button
                type="button"
                onClick={() => execCommand('removeFormat')}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-rose-400 hover:text-rose-300 transition active:scale-95 ml-auto"
                title="Xóa định dạng chữ"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
              <Code className="size-4 text-indigo-400" />
              Đang chỉnh sửa mã HTML nguồn trực tiếp
            </span>
          )}
        </div>

        {/* Toggle between WYSIWYG Visual and Code Mode */}
        <button
          type="button"
          onClick={() => {
            setIsVisualMode(!isVisualMode)
            setSelectedImage(null)
            setImageRect(null)
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
            isVisualMode 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          title={isVisualMode ? 'Xem mã HTML' : 'Xem văn bản trực quan'}
        >
          {isVisualMode ? (
            <>
              <Code className="size-3.5" />
              Xem mã HTML
            </>
          ) : (
            <>
              <Eye className="size-3.5" />
              Quay lại trực quan
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      <div className="relative w-full">
        {dragCounter > 0 && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-[4px] border-2 border-dashed border-indigo-500/80 rounded-b-2xl animate-pulse pointer-events-none transition-all duration-300">
            <div className="flex flex-col items-center gap-3 text-center p-6">
              <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                <UploadCloud className="size-10 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-bold text-white tracking-wide">Thả hình ảnh tại đây</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                  Hệ thống tự động tải lên và chèn ảnh vào đúng vị trí con trỏ của bạn
                </p>
              </div>
            </div>
          </div>
        )}

        {isVisualMode ? (
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            tabIndex={0}
            onInput={updateEditorContent}
            onBlur={updateEditorContent}
            onClick={handleEditorClick}
            onPaste={handlePaste}
            aria-label="Nội dung chi tiết"
            className="w-full min-h-[220px] max-h-[450px] overflow-y-auto px-4 py-3 outline-none text-sm text-slate-100 placeholder:text-slate-600 focus:bg-slate-900/10 transition-colors prose prose-invert prose-sm max-w-none prose-h2:text-lg prose-h3:text-base prose-p:my-2 cursor-text"
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            aria-label="Mã nguồn HTML"
            className="w-full min-h-[220px] max-h-[450px] font-mono text-xs p-4 bg-slate-950 border-0 outline-none text-indigo-300 focus:ring-0 resize-y"
            placeholder="Viết mã HTML tại đây..."
            rows={10}
          />
        )}

        {/* CSS placeholder support for ContentEditable */}
        {isVisualMode && !value && (
          <div className="absolute top-3 left-4 text-sm text-slate-500 pointer-events-none select-none">
            {placeholder || 'Mô tả ngắn hoặc bài viết chi tiết giới thiệu sản phẩm...'}
          </div>
        )}

        {/* Selected Image Toolbar and Overlay */}
        {selectedImage && imageRect && (
          <>
            {/* Highlight Border Overlay with interactive resize handles */}
            <div 
              className="absolute border-2 border-indigo-500 rounded-xl pointer-events-none z-30 transition-all duration-150"
              style={{
                top: `${imageRect.top}px`,
                left: `${imageRect.left}px`,
                width: `${imageRect.width}px`,
                height: `${imageRect.height}px`,
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              {/* Sibling corner handles outside overlay so they are 100% visible and interactive */}
              {/* Top-Left Handle */}
              <button 
                type="button"
                aria-label="Kéo dãn trên trái"
                onMouseDown={(e) => handleResizeStart(e, 'tl')}
                className="absolute size-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:scale-125 hover:bg-indigo-50 transition-all z-50 animate-in fade-in duration-200"
                style={{ top: '-8px', left: '-8px' }}
                title="Kéo dãn (Top-Left)"
              />
              {/* Top-Right Handle */}
              <button 
                type="button"
                aria-label="Kéo dãn trên phải"
                onMouseDown={(e) => handleResizeStart(e, 'tr')}
                className="absolute size-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:scale-125 hover:bg-indigo-50 transition-all z-50 animate-in fade-in duration-200"
                style={{ top: '-8px', right: '-8px' }}
                title="Kéo dãn (Top-Right)"
              />
              {/* Bottom-Left Handle */}
              <button 
                type="button"
                aria-label="Kéo dãn dưới trái"
                onMouseDown={(e) => handleResizeStart(e, 'bl')}
                className="absolute size-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:scale-125 hover:bg-indigo-50 transition-all z-50 animate-in fade-in duration-200"
                style={{ bottom: '-8px', left: '-8px' }}
                title="Kéo dãn (Bottom-Left)"
              />
              {/* Bottom-Right Handle */}
              <button 
                type="button"
                aria-label="Kéo dãn dưới phải"
                onMouseDown={(e) => handleResizeStart(e, 'br')}
                className="absolute size-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize pointer-events-auto shadow-[0_2px_8px_rgba(0,0,0,0.35)] hover:scale-125 hover:bg-indigo-50 transition-all z-50 animate-in fade-in duration-200"
                style={{ bottom: '-8px', right: '-8px' }}
                title="Kéo dãn (Bottom-Right)"
              />
            </div>

            {/* Real-time Resizing Tooltip */}
            {isResizing && resizeWidth !== null && (
              <div 
                className="absolute bg-indigo-600/90 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-lg pointer-events-none z-50 animate-in fade-in zoom-in-95 duration-100"
                style={{
                  top: `${imageRect.top + imageRect.height / 2 - 12}px`,
                  left: `${imageRect.left + imageRect.width / 2}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                Chiều rộng: {resizeWidth}%
              </div>
            )}

            {/* Floating Image Action Toolbar */}
            {!isResizing && (
              <div 
                className="absolute bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 z-40 transition-all duration-150 min-w-[360px] max-w-[420px] animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                  top: (() => {
                    const toolbarEstimatedHeight = 115;
                    if (imageRect.top > toolbarEstimatedHeight + 20) {
                      return `${imageRect.top - toolbarEstimatedHeight - 12}px`;
                    } else {
                      return `${imageRect.top + imageRect.height + 12}px`;
                    }
                  })(),
                  left: `${imageRect.left + imageRect.width / 2}px`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Row 1: Quick Actions */}
                <div className="flex items-center justify-between gap-1">
                  {/* Align Group */}
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => applyImageStyle({ float: 'left', margin: '0.5rem 1.5rem 1rem 0' })}
                      className={`p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition ${
                        selectedImage.style.float === 'left' ? 'bg-indigo-600 text-white shadow-sm font-bold' : ''
                      }`}
                      title="Căn trái (Float Left)"
                    >
                      <AlignLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyImageStyle({ float: 'none', margin: '1rem auto' })}
                      className={`p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition ${
                        selectedImage.style.float === 'none' || !selectedImage.style.float ? 'bg-indigo-600 text-white shadow-sm font-bold' : ''
                      }`}
                      title="Căn giữa (Center)"
                    >
                      <AlignCenter className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyImageStyle({ float: 'right', margin: '0.5rem 0 1rem 1.5rem' })}
                      className={`p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition ${
                        selectedImage.style.float === 'right' ? 'bg-indigo-600 text-white shadow-sm font-bold' : ''
                      }`}
                      title="Căn phải (Float Right)"
                    >
                      <AlignRight className="size-3.5" />
                    </button>
                  </div>

                  <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

                  {/* Width Presets */}
                  <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                    <button
                      type="button"
                      onClick={() => applyImageStyle({ float: selectedImage.style.float || 'none', margin: selectedImage.style.margin || '1rem auto', width: '50%' })}
                      className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition active:scale-95 ${
                        selectedImage.style.width === '50%' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Thu nhỏ 50%"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyImageStyle({ float: selectedImage.style.float || 'none', margin: selectedImage.style.margin || '1rem auto', width: '75%' })}
                      className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition active:scale-95 ${
                        selectedImage.style.width === '75%' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Vừa vặn 75%"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => applyImageStyle({ float: selectedImage.style.float || 'none', margin: selectedImage.style.margin || '1rem auto', width: '100%' })}
                      className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition active:scale-95 ${
                        selectedImage.style.width === '100%' || !selectedImage.style.width ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                      title="Đầy đủ 100%"
                    >
                      100%
                    </button>
                  </div>

                  <div className="w-px h-5 bg-white/10 mx-0.5 shrink-0" />

                  {/* Rotate, Crop, Replace, Delete */}
                  <div className="flex items-center gap-1">
                    {/* Aspect Ratio Selector */}
                    <select
                      aria-label="Tỉ lệ khung hình"
                      value={selectedImage.style.aspectRatio?.replace(/\s/g, '') || 'auto'}
                      onChange={(e) => handleAspectRatioChange(e.target.value as any)}
                      className="bg-slate-950 border border-white/10 text-slate-300 hover:text-white text-[10px] font-extrabold rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer border-indigo-500/20"
                      title="Tỉ lệ khung hình"
                    >
                      <option value="auto">Gốc</option>
                      <option value="1:1">1:1</option>
                      <option value="16:9">16:9</option>
                      <option value="4:3">4:3</option>
                    </select>

                    <button
                      type="button"
                      aria-label="Xoay 90 độ"
                      onClick={handleRotateImage}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                      title="Xoay 90°"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <polyline points="21 3 21 8 16 8" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-label="Cắt ảnh"
                      onClick={() => {
                        setCropRatio('free');
                        setCropBox({ x: 10, y: 10, width: 80, height: 80 });
                        setIsCropModalOpen(true);
                        setCropZoom(100);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                      title="Cắt ảnh (Crop)"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 1v17h17" />
                        <path d="M18 23V6H1" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-label="Thay thế ảnh"
                      onClick={triggerImageReplacement}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                      title="Thay thế ảnh (Replace)"
                    >
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                        <path d="M16 16h5v5" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-label="Xóa ảnh"
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
                          const captionEl = selectedImage.nextElementSibling as HTMLElement;
                          if (captionEl && (captionEl.classList.contains('image-caption') || captionEl.tagName === 'FIGCAPTION')) {
                            captionEl.remove();
                          }
                          selectedImage.remove();
                          updateEditorContent();
                          setSelectedImage(null);
                          setImageRect(null);
                          toast.success('Đã xóa ảnh khỏi nội dung');
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 active:scale-95 transition-all"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Alt Text & Caption */}
                <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-white/5 focus-within:border-indigo-500 transition-colors">
                      <span className="text-[9px] font-black text-indigo-400 select-none uppercase shrink-0">Alt</span>
                      <input
                        type="text"
                        aria-label="Alt Text"
                        value={altText}
                        onChange={(e) => handleAltChange(e.target.value)}
                        placeholder="Mô tả SEO..."
                        className="bg-transparent border-0 outline-none text-[11px] text-slate-200 placeholder:text-slate-600 w-full p-0 focus:ring-0"
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-white/5 focus-within:border-emerald-500 transition-colors">
                      <span className="text-[9px] font-black text-emerald-400 select-none uppercase shrink-0">Cap</span>
                      <input
                        type="text"
                        aria-label="Caption Text"
                        value={captionText}
                        onChange={(e) => handleCaptionChange(e.target.value)}
                        placeholder="Chú thích..."
                        className="bg-transparent border-0 outline-none text-[11px] text-slate-200 placeholder:text-slate-600 w-full p-0 focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden replacement file input */}
        <input 
          type="file" 
          aria-label="Chọn file ảnh"
          ref={replaceInputRef} 
          onChange={handleImageReplacement} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp,image/gif"
        />

        {/* Crop Modal Portal Overlay */}
        {isCropModalOpen && selectedImage && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-xl w-full flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg className="size-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
<path d="M6 1v17h17" />
                    <path d="M18 23V6H1" />
                  </svg>
                  Cắt chỉnh hình ảnh
                </h3>
                <button 
                  type="button" 
                  aria-label="Đóng modal"
                  onClick={() => setIsCropModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col items-center justify-center bg-slate-900/50 min-h-[380px]">
                <div className="flex flex-col items-center gap-4 w-full">
                  {/* Scrollable Viewport Wrapper for Zoom */}
                  <div className="w-full overflow-auto max-h-[350px] min-h-[280px] flex items-center justify-center p-6 bg-slate-950/50 rounded-xl border border-white/5 shadow-inner scrollbar-thin relative">
                    <div 
                      id="crop-container"
                      className="relative overflow-hidden select-none bg-slate-950 flex items-center justify-center transition-transform duration-75"
                      style={{
                        transform: `scale(${cropZoom / 100})`,
                        transformOrigin: 'center center',
                        width: 'fit-content',
                        height: 'fit-content'
                      }}
                    >
                      <NextImage 
                        src={selectedImage.src} 
                        alt="Crop preview" 
                        width={400}
                        height={250}
                        unoptimized
                        className="max-h-[250px] object-contain pointer-events-none" 
                      />
                      
                      {/* Visual Crop Box with dimmer background shadow overlay */}
                      <div 
                        role="application"
                        aria-label="Khung cắt ảnh"
                        className="absolute border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(15,23,42,0.75)] cursor-move"
                        style={{
                          top: `${cropBox.y}%`,
                          left: `${cropBox.x}%`,
                          width: `${cropBox.width}%`,
                          height: `${cropBox.height}%`,
                        }}
                        onMouseDown={(e) => startCropDrag(e, 'move')}
                        onTouchStart={(e) => startCropDrag(e, 'move')}
                      >
                        {/* Grid overlay lines inside crop area to look premium */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-r border-b border-dashed border-white" />
                          <div className="border-b border-dashed border-white" />
                        </div>

                        {/* 8 Resize Handles (Canva/Figma Quality) */}
                        {/* 4 Corner handles: thick L-shaped borders */}
                        <button 
                          type="button"
                          aria-label="Cắt góc trên trái"
                          className="absolute size-4.5 border-t-[3.5px] border-l-[3.5px] border-indigo-500 -top-1 -left-1 cursor-nwse-resize z-30 bg-transparent p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'tl')}
                          onTouchStart={(e) => startCropDrag(e, 'tl')}
                        />
                        <button 
                          type="button"
                          aria-label="Cắt góc trên phải"
                          className="absolute size-4.5 border-t-[3.5px] border-r-[3.5px] border-indigo-500 -top-1 -right-1 cursor-nesw-resize z-30 bg-transparent p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'tr')}
                          onTouchStart={(e) => startCropDrag(e, 'tr')}
                        />
                        <button 
                          type="button"
                          aria-label="Cắt góc dưới trái"
                          className="absolute size-4.5 border-b-[3.5px] border-l-[3.5px] border-indigo-500 -bottom-1 -left-1 cursor-nesw-resize z-30 bg-transparent p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'bl')}
                          onTouchStart={(e) => startCropDrag(e, 'bl')}
                        />
                        <button 
                          type="button"
                          aria-label="Cắt góc dưới phải"
                          className="absolute size-4.5 border-b-[3.5px] border-r-[3.5px] border-indigo-500 -bottom-1 -right-1 cursor-nwse-resize z-30 bg-transparent p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'br')}
                          onTouchStart={(e) => startCropDrag(e, 'br')}
                        />

                        {/* 4 Edge handles: premium pill design */}
                        <button 
                          type="button"
                          aria-label="Cắt viền trên"
                          className="absolute w-5 h-2 bg-white border-2 border-indigo-600 rounded-full -top-1 left-1/2 -translate-x-1/2 cursor-ns-resize z-25 hover:scale-110 active:scale-95 transition-transform shadow-md p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 't')}
                          onTouchStart={(e) => startCropDrag(e, 't')}
                        />
                        <button 
                          type="button"
                          aria-label="Cắt viền dưới"
                          className="absolute w-5 h-2 bg-white border-2 border-indigo-600 rounded-full -bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize z-25 hover:scale-110 active:scale-95 transition-transform shadow-md p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'b')}
                          onTouchStart={(e) => startCropDrag(e, 'b')}
                        />
                        <button 
                          type="button"
                          aria-label="Cắt viền trái"
                          className="absolute w-2 h-5 bg-white border-2 border-indigo-600 rounded-full -left-1 top-1/2 -translate-y-1/2 cursor-ew-resize z-25 hover:scale-110 active:scale-95 transition-transform shadow-md p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'l')}
                          onTouchStart={(e) => startCropDrag(e, 'l')}
                        />
                        <button 
                          type="button"
                          aria-label="Cắt viền phải"
                          className="absolute w-2 h-5 bg-white border-2 border-indigo-600 rounded-full -right-1 top-1/2 -translate-y-1/2 cursor-ew-resize z-25 hover:scale-110 active:scale-95 transition-transform shadow-md p-0 m-0" 
                          onMouseDown={(e) => startCropDrag(e, 'r')}
                          onTouchStart={(e) => startCropDrag(e, 'r')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Preset ratio selectors */}
                  <div className="flex gap-2 items-center text-xs mt-2">
                    <span className="text-slate-400 mr-1 font-medium">Tỷ lệ:</span>
                    <button 
                      type="button" 
                      onClick={() => { setCropRatio('free'); setCropBox({ x: 10, y: 10, width: 80, height: 80 }) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${cropRatio === 'free' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                      Tự do
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setCropRatio('1:1'); setCropBox({ x: 20, y: 20, width: 60, height: 60 }) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${cropRatio === '1:1' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                      1:1 (Square)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setCropRatio('16:9'); setCropBox({ x: 10, y: 20, width: 80, height: 45 }) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${cropRatio === '16:9' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                      16:9
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setCropRatio('4:3'); setCropBox({ x: 10, y: 15, width: 80, height: 60 }) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${cropRatio === '4:3' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                      4:3
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-950/50 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Xác nhận cắt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
