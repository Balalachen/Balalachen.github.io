import { useEffect, useState } from "react"
import { fetchSocialList, saveSocialItem } from "../../lib/cmsApi"
import { SOCIAL_PLATFORMS, type SocialItem } from "../../types/portfolio"

export function SocialEditor() {
  const [items, setItems] = useState<SocialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{
    type: "ok" | "error"
    text: string
  } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const existing = await fetchSocialList()
      const map = new Map(existing.map(it => [it.name.toLowerCase(), it]))
      const merged: SocialItem[] = [...existing]
      for (const platform of SOCIAL_PLATFORMS) {
        if (!map.has(platform)) {
          merged.push({
            id: platform,
            order: merged.length,
            name: platform,
            url: null,
          })
        }
      }
      setItems(merged)
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "讀取社群連結失敗",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function updateUrl(id: string, nextUrl: string) {
    setItems(prev =>
      prev.map(it =>
        it.id === id ? { ...it, url: nextUrl.trim() ? nextUrl : null } : it
      )
    )
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      await Promise.all(
        items.map((item, idx) =>
          saveSocialItem(
            { order: idx, name: item.name, url: item.url },
            item.id
          )
        )
      )
      await load()
      setNotice({ type: "ok", text: "社群連結已全部儲存！" })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "儲存失敗",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleMove(idx: number, delta: number) {
    const target = idx + delta
    if (target < 0 || target >= items.length) return
    const reordered = [...items]
    ;[reordered[idx], reordered[target]] = [
      reordered[target],
      reordered[idx],
    ]
    const withOrder = reordered.map((it, i) => ({ ...it, order: i }))
    setItems(withOrder)
    try {
      await Promise.all(
        withOrder.map(it =>
          saveSocialItem(
            { order: it.order, name: it.name, url: it.url },
            it.id
          )
        )
      )
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "更新順序失敗",
      })
      await load()
    }
  }

  if (loading) return <p className="hint">載入社群連結中…</p>

  return (
    <form className="editor-form" onSubmit={handleSaveAll}>
      <div className="section-header">
        <div>
          <h2>社群連結（Social）</h2>
          <p className="hint">
            有填寫網址的平台才會出現在側邊欄 Connect 區塊，留空即隱藏
          </p>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={saving}
        >
          {saving ? "儲存中…" : "儲存全部社群連結"}
        </button>
      </div>

      {notice && (
        <div
          className={`alert ${
            notice.type === "ok" ? "alert-ok" : "alert-error"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="item-list">
        {items.map((item, idx) => (
          <div key={item.id} className="social-row">
            <div className="social-name">
              <span className="order-pill">#{idx + 1}</span>
              <strong className="mono">{item.name}</strong>
              {item.url ? (
                <span className="badge badge-ok">啟用</span>
              ) : (
                <span className="badge">未設定</span>
              )}
            </div>

            <input
              type="url"
              className="input"
              value={item.url || ""}
              placeholder={`https://... (${item.name} 個人連結)`}
              onChange={e => updateUrl(item.id, e.target.value)}
            />

            <div className="row-actions">
              <button
                type="button"
                className="btn-icon"
                title="上移"
                disabled={idx === 0}
                onClick={() => void handleMove(idx, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="btn-icon"
                title="下移"
                disabled={idx === items.length - 1}
                onClick={() => void handleMove(idx, 1)}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </form>
  )
}
