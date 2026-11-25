import { useEffect, useRef, useState } from "react"
import {
  listStorageImages,
  resolveStorageImageUrl,
  uploadStorageImage,
} from "../lib/cmsApi"
import type { StorageImageEntry } from "../types/portfolio"

interface ImagePickerProps {
  label: string
  value: string | null
  onChange: (nextPath: string | null) => void
}

export function ImagePicker({ label, value, onChange }: ImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryItems, setGalleryItems] = useState<StorageImageEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    setPreviewError(null)
    if (!value) {
      setPreviewUrl(null)
      return
    }
    resolveStorageImageUrl(value)
      .then(url => {
        if (!cancelled) setPreviewUrl(url)
      })
      .catch(err => {
        if (!cancelled) {
          setPreviewUrl(null)
          setPreviewError(
            err instanceof Error ? err.message : "無法載入 Storage 圖片預覽"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [value])

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    setUploading(true)
    setPreviewError(null)
    try {
      const uploaded = await uploadStorageImage(file)
      onChange(uploaded.path)
      setPreviewUrl(uploaded.url)
      if (galleryOpen) {
        setGalleryItems(prev => {
          const withoutSame = prev.filter(item => item.path !== uploaded.path)
          return [...withoutSame, uploaded].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        })
      }
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "圖片上傳失敗，請檢查 Storage 規則"
      )
    } finally {
      setUploading(false)
    }
  }

  async function toggleGallery() {
    const nextOpen = !galleryOpen
    setGalleryOpen(nextOpen)
    if (nextOpen) {
      setGalleryLoading(true)
      setPreviewError(null)
      try {
        const items = await listStorageImages()
        setGalleryItems(items)
      } catch (err) {
        setPreviewError(
          err instanceof Error
            ? err.message
            : "無法讀取 Storage images/ 清單"
        )
      } finally {
        setGalleryLoading(false)
      }
    }
  }

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <div className="image-picker-box">
        <div className="image-preview-wrap">
          {previewUrl ? (
            <img src={previewUrl} alt={value || "Preview"} className="image-preview" />
          ) : (
            <div className="image-empty">無圖片</div>
          )}
        </div>

        <div className="image-picker-controls">
          <input
            type="text"
            className="input mono"
            value={value || ""}
            placeholder="例如 images/Fuchun_repre.jpg（留空表示無圖片）"
            onChange={e => onChange(e.target.value.trim() || null)}
          />

          <div className="btn-row">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "上傳中…" : "上傳新圖片"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={toggleGallery}
            >
              {galleryOpen ? "收起圖片庫" : "從 Storage 挑選"}
            </button>
            {value && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onChange(null)}
              >
                清除
              </button>
            )}
          </div>

          {previewError && <p className="field-error">{previewError}</p>}
        </div>
      </div>

      {galleryOpen && (
        <div className="gallery-panel">
          {galleryLoading ? (
            <p className="hint">載入 Storage images/ 中…</p>
          ) : galleryItems.length === 0 ? (
            <p className="hint">Storage images/ 目錄目前沒有圖片。</p>
          ) : (
            <div className="gallery-grid">
              {galleryItems.map(item => (
                <button
                  key={item.path}
                  type="button"
                  className={`gallery-item ${
                    value === item.path ? "gallery-item-active" : ""
                  }`}
                  onClick={() => {
                    onChange(item.path)
                    setGalleryOpen(false)
                  }}
                >
                  <img src={item.url} alt={item.name} loading="lazy" />
                  <span className="gallery-name">{item.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
