import { useEffect, useState } from "react"
import {
  deleteCollectionDoc,
  fetchPublications,
  savePublication,
  updateCollectionOrder,
} from "../../lib/cmsApi"
import type { PublicationItem } from "../../types/portfolio"

function createEmptyPub(order: number): Omit<PublicationItem, "id"> {
  return {
    order,
    title: "",
    authors: "",
    proceedings: null,
    published: null,
    selection: false,
    award: null,
    dwlink: null,
    videolink: null,
  }
}

export function PublicationsEditor() {
  const [items, setItems] = useState<PublicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | "NEW" | null>(null)
  const [draft, setDraft] = useState<Omit<PublicationItem, "id"> | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{
    type: "ok" | "error"
    text: string
  } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const list = await fetchPublications()
      setItems(list)
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "讀取論文列表失敗",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function startNew() {
    setEditingId("NEW")
    setDraft(createEmptyPub(items.length))
    setNotice(null)
  }

  function startEdit(item: PublicationItem) {
    setEditingId(item.id)
    setDraft({ ...item })
    setNotice(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!draft) return
    setSaving(true)
    setNotice(null)
    try {
      await savePublication(
        draft,
        editingId && editingId !== "NEW" ? editingId : undefined
      )
      setEditingId(null)
      setDraft(null)
      await load()
      setNotice({ type: "ok", text: "論文項目已儲存！" })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "儲存失敗",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: PublicationItem) {
    if (!window.confirm(`確定要刪除論文「${item.title}」嗎？`)) return
    setNotice(null)
    try {
      await deleteCollectionDoc("publications", item.id)
      if (editingId === item.id) {
        setEditingId(null)
        setDraft(null)
      }
      await load()
      setNotice({ type: "ok", text: "已刪除論文項目" })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "刪除失敗",
      })
    }
  }

  async function handleMoveById(id: string, delta: number) {
    const idx = items.findIndex(it => it.id === id)
    const target = idx + delta
    if (idx < 0 || target < 0 || target >= items.length) return
    const reordered = [...items]
    ;[reordered[idx], reordered[target]] = [reordered[target], reordered[idx]]
    const withOrder = reordered.map((it, i) => ({ ...it, order: i }))
    setItems(withOrder)
    try {
      await updateCollectionOrder(
        "publications",
        withOrder.map(it => it.id)
      )
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "更新排序失敗",
      })
      await load()
    }
  }

  if (loading) return <p className="hint">載入論文列表中…</p>

  const keyword = search.trim().toLowerCase()
  const filtered = keyword
    ? items.filter(
        it =>
          it.title.toLowerCase().includes(keyword) ||
          it.authors.toLowerCase().includes(keyword) ||
          (it.proceedings || "").toLowerCase().includes(keyword)
      )
    : items

  return (
    <div className="section-wrap">
      <div className="section-header">
        <div>
          <h2>論文發表（Publications · {items.length}）</h2>
          <p className="hint">
            作者清單以逗號加空白（<code>, </code>）分隔；與 Profile 的{" "}
            <code>fullname</code> 相符會自動加底線標註
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={startNew}
        >
          + 新增論文
        </button>
      </div>

      <div className="field-group">
        <input
          type="search"
          className="input"
          value={search}
          placeholder="搜尋論文標題、作者或會議名稱…"
          onChange={e => setSearch(e.target.value)}
        />
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

      {draft && (
        <form className="panel editor-form" onSubmit={handleSave}>
          <div className="section-header">
            <h3>{editingId === "NEW" ? "新增論文" : "編輯論文"}</h3>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingId(null)
                  setDraft(null)
                }}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={saving}
              >
                {saving ? "儲存中…" : "儲存論文"}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">論文標題（title）*</label>
            <input
              type="text"
              className="input"
              required
              value={draft.title}
              onChange={e => setDraft({ ...draft, title: e.target.value })}
            />
          </div>

          <div className="field-group">
            <label className="field-label">作者清單（authors）*</label>
            <input
              type="text"
              className="input"
              required
              placeholder="Author A, Yang-Sheng Chen, Author B"
              value={draft.authors}
              onChange={e => setDraft({ ...draft, authors: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label">會議 / 期刊（proceedings）</label>
              <input
                type="text"
                className="input"
                placeholder="例如 ACM SIGGRAPH 2020 Posters"
                value={draft.proceedings || ""}
                onChange={e =>
                  setDraft({ ...draft, proceedings: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">發表日期（published）</label>
              <input
                type="text"
                className="input"
                placeholder="例如 2020/8/7"
                value={draft.published || ""}
                onChange={e =>
                  setDraft({ ...draft, published: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">得獎名稱（award，選填）</label>
              <input
                type="text"
                className="input"
                placeholder="例如 Best Demo Award"
                value={draft.award || ""}
                onChange={e =>
                  setDraft({ ...draft, award: e.target.value || null })
                }
              />
            </div>

            <div className="field-group checkbox-align">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={draft.selection}
                  onChange={e =>
                    setDraft({ ...draft, selection: e.target.checked })
                  }
                />
                <span>預設精選顯示（selection）</span>
              </label>
            </div>

            <div className="field-group">
              <label className="field-label">
                論文連結（dwlink，留空前台會顯示 Accepted）
              </label>
              <input
                type="url"
                className="input"
                value={draft.dwlink || ""}
                onChange={e =>
                  setDraft({ ...draft, dwlink: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">影片連結（videolink，選填）</label>
              <input
                type="url"
                className="input"
                value={draft.videolink || ""}
                onChange={e =>
                  setDraft({ ...draft, videolink: e.target.value || null })
                }
              />
            </div>
          </div>
        </form>
      )}

      <div className="item-list">
        {filtered.map(item => {
          const globalIdx = items.findIndex(i => i.id === item.id)
          return (
            <div key={item.id} className="item-card">
              <div className="item-main">
                <div className="item-title-row">
                  <span className="order-pill">#{globalIdx + 1}</span>
                  <strong>{item.title}</strong>
                  {item.selection && (
                    <span className="badge badge-ok">精選</span>
                  )}
                  {item.award && (
                    <span className="badge badge-warn">{item.award}</span>
                  )}
                </div>
                <p className="item-meta">
                  {item.proceedings || "未填會議"}
                  {item.published ? ` (${item.published})` : ""} · {item.authors}
                </p>
              </div>

              <div className="row-actions">
                <button
                  type="button"
                  className="btn-icon"
                  title="上移"
                  disabled={globalIdx === 0}
                  onClick={() => void handleMoveById(item.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="下移"
                  disabled={globalIdx === items.length - 1}
                  onClick={() => void handleMoveById(item.id, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => startEdit(item)}
                >
                  編輯
                </button>
                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  onClick={() => void handleDelete(item)}
                >
                  刪除
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
