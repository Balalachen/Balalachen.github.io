import { useEffect, useState } from "react"
import {
  deleteCollectionDoc,
  fetchProjects,
  saveProject,
  updateCollectionOrder,
} from "../../lib/cmsApi"
import type { ProjectItem } from "../../types/portfolio"
import { ImagePicker } from "../ImagePicker"
import { StringListInput } from "../StringListInput"

function createEmptyProject(order: number): Omit<ProjectItem, "id"> {
  return {
    order,
    name: "",
    description: "",
    selection: true,
    status: "Published",
    position: "",
    tags: [],
    image: null,
    url: [],
    awards: [],
    exhibitions: [],
  }
}

export function ProjectsEditor() {
  const [items, setItems] = useState<ProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | "NEW" | null>(null)
  const [draft, setDraft] = useState<Omit<ProjectItem, "id"> | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{
    type: "ok" | "error"
    text: string
  } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const list = await fetchProjects()
      setItems(list)
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "讀取專案列表失敗",
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
    setDraft(createEmptyProject(items.length))
    setNotice(null)
  }

  function startEdit(item: ProjectItem) {
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
      await saveProject(
        draft,
        editingId && editingId !== "NEW" ? editingId : undefined
      )
      setEditingId(null)
      setDraft(null)
      await load()
      setNotice({ type: "ok", text: "專案已儲存！" })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "儲存專案失敗",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: ProjectItem) {
    if (!window.confirm(`確定要刪除專案「${item.name}」嗎？`)) return
    setNotice(null)
    try {
      await deleteCollectionDoc("projects", item.id)
      if (editingId === item.id) {
        setEditingId(null)
        setDraft(null)
      }
      await load()
      setNotice({ type: "ok", text: `已刪除「${item.name}」` })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "刪除失敗",
      })
    }
  }

  async function handleMove(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const reordered = [...items]
    ;[reordered[index], reordered[target]] = [
      reordered[target],
      reordered[index],
    ]
    const withOrder = reordered.map((it, idx) => ({ ...it, order: idx }))
    setItems(withOrder)
    try {
      await updateCollectionOrder(
        "projects",
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

  if (loading) return <p className="hint">載入專案列表中…</p>

  return (
    <div className="section-wrap">
      <div className="section-header">
        <div>
          <h2>作品集專案（Projects · {items.length}）</h2>
          <p className="hint">
            勾選精選（selection）的專案會在首頁預設顯示，其餘可展開查看
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={startNew}
        >
          + 新增專案
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

      {draft && (
        <form className="panel editor-form" onSubmit={handleSave}>
          <div className="section-header">
            <h3>{editingId === "NEW" ? "新增專案" : `編輯：${draft.name}`}</h3>
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
                {saving ? "儲存中…" : "儲存專案"}
              </button>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label">專案名稱（name）*</label>
              <input
                type="text"
                className="input"
                required
                value={draft.name}
                onChange={e => setDraft({ ...draft, name: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label className="field-label">擔任角色（position）</label>
              <input
                type="text"
                className="input"
                value={draft.position || ""}
                onChange={e =>
                  setDraft({ ...draft, position: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">狀態標籤（status）</label>
              <input
                type="text"
                className="input"
                placeholder="例如 Published / live"
                value={draft.status || ""}
                onChange={e =>
                  setDraft({ ...draft, status: e.target.value || null })
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
                <span>預設精選展開顯示（selection）</span>
              </label>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">專案介紹（description）</label>
            <textarea
              className="textarea"
              rows={4}
              value={draft.description}
              onChange={e =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </div>

          <ImagePicker
            label="封面圖片（image）"
            value={draft.image}
            onChange={nextPath => setDraft({ ...draft, image: nextPath })}
          />

          <StringListInput
            label="技術標籤（tags）"
            values={draft.tags}
            placeholder="例如 Unity URP"
            onChange={tags => setDraft({ ...draft, tags })}
          />

          <StringListInput
            label="得獎紀錄（awards）"
            values={draft.awards}
            placeholder="點左側 🏆 可切換 [a] 首獎獎盃圖示，內文可用 | 分隔"
            helperText="以 [a] 開頭會顯示冠軍獎盃圖示，否則顯示月桂葉圖示。"
            supportAwardPrefix
            onChange={awards => setDraft({ ...draft, awards })}
          />

          <StringListInput
            label="展覽 / 發表紀錄（exhibitions）"
            values={draft.exhibitions}
            placeholder="例如 2021 經典之美 — 故宮數位印象展"
            onChange={exhibitions => setDraft({ ...draft, exhibitions })}
          />

          <StringListInput
            label="相關連結（url）"
            values={draft.url}
            placeholder="https://...（系統會自動依網域辨識 YouTube / GitHub / Steam 等圖示）"
            onChange={url => setDraft({ ...draft, url })}
          />
        </form>
      )}

      <div className="item-list">
        {items.map((item, idx) => (
          <div key={item.id} className="item-card">
            <div className="item-main">
              <div className="item-title-row">
                <span className="order-pill">#{idx + 1}</span>
                <strong>{item.name}</strong>
                {item.selection && (
                  <span className="badge badge-ok">精選</span>
                )}
                {item.status && <span className="badge">{item.status}</span>}
              </div>
              <p className="item-meta">
                {item.position || "未填角色"}
                {item.image ? ` · 圖片: ${item.image}` : " · 無封面圖"}
                {item.tags.length > 0 ? ` · ${item.tags.join(", ")}` : ""}
              </p>
            </div>

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
        ))}
      </div>
    </div>
  )
}
