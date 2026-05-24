'use client'

import React, { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import { 
  Bold, Italic, Underline, Heading2, Heading3, 
  List, ListOrdered, Link, Image, AlignLeft, 
  AlignCenter, AlignRight, Trash2, Eye, Code, 
  Type, Check, UploadCloud
} from 'lucide-react'
import { toast } from 'sonner'

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
  const [isVisualMode, setIsVisualMode] = useState(true)
  const [dragCounter, setDragCounter] = useState(0)

  const mounted = useSyncExternalStore(
    clientLoadedStore.subscribe,
    clientLoadedStore.getSnapshot,
    clientLoadedStore.getServerSnapshot
  )

  // Sync value from parent once on mount, or if the editor contents differ from the value prop
  useEffect(() => {
    if (editorRef.current && isVisualMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, isVisualMode, mounted])

  if (!mounted) return null

  const updateEditorContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
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
        img.className = 'max-w-full h-auto rounded-xl my-4 border border-white/10 shadow-lg block mx-auto hover:scale-[1.01] transition-all duration-300'
        img.style.maxHeight = '400px'
        img.style.objectFit = 'contain'

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
          const imgTag = `<img src="${imageUrl}" alt="${file.name || 'Ảnh sản phẩm'}" class="max-w-full h-auto rounded-xl my-4 border border-white/10 shadow-lg block mx-auto hover:scale-[1.01] transition-all duration-300" style="max-height: 400px; object-fit: contain;" />\n`
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
    if (url) {
      execCommand('insertImage', url)
    }
  }

  return (
    <div 
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
          onClick={() => setIsVisualMode(!isVisualMode)}
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
            onInput={updateEditorContent}
            onBlur={updateEditorContent}
            onPaste={handlePaste}
            aria-label="Nội dung chi tiết"
            className="w-full min-h-[220px] max-h-[450px] overflow-y-auto px-4 py-3 outline-none text-sm text-slate-100 placeholder:text-slate-600 focus:bg-slate-900/10 transition-colors prose prose-invert prose-sm max-w-none prose-h2:text-lg prose-h3:text-base prose-p:my-2"
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
      </div>
    </div>
  )
}
