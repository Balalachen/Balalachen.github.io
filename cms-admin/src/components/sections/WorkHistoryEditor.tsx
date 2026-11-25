import { useEffect, useState } from "react"
import {
  deleteCollectionDoc,
  fetchWorkHistory,
  saveWorkHistoryItem,
  updateCollectionOrder,
} from "../../lib/cmsApi"
import {
  WORK_LABEL_OPTIONS,
  type WorkHistoryItem,
  type WorkHistoryLabel,
} from "../../types/portfolio"
import { StringListInput } from "../StringListInput"

function createEmptyWork(order: number): Omit<WorkHistoryItem, "id"> {
  return {
    order,
    company: "",
    department: null,
    position: null,
    fromtime: null,
    totime: null,
    url: null,
    label: "all",
    selection: true,
    notes: [],
  }
}

export function WorkHistoryEditor() {
  const [items, setItems] = useState<WorkHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "experience" | "short">("all")
  const [editingId, setEditingId] = useState<string | "NEW" | null>(null)
  const [draft, setDraft] = useState<Omit<WorkHistoryItem, "id"> | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{
    type: "ok" | "error"
    text: string
  } | null>(null)

  async function load() {
    setLoading(true)
    try {
      const list = await fetchWorkHistory()
      setItems(list)
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "讀取經歷失敗",
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
    setDraft(createEmptyWork(items.length))
    setNotice(null)
  }

  function startEdit(item: WorkHistoryItem) {
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
      await saveWorkHistoryItem(
        draft,
        editingId && editingId !== "NEW" ? editingId : undefined
      )
      setEditingId(null)
      setDraft(null)
      await load()
      setNotice({ type: "ok", text: "經歷項目已儲存！" })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "儲存失敗",
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: WorkHistoryItem) {
    if (!window.confirm(`確定要刪除「${item.company}」嗎？`)) return
    setNotice(null)
    try {
      await deleteCollectionDoc("workHistory", item.id)
      if (editingId === item.id) {
        setEditingId(null)
        setDraft(null)
      }
      await load()
      setNotice({ type: "ok", text: `已刪除「${item.company}」` })
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
        "workHistory",
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

  if (loading) return <p className="hint">載入經歷與演講列表中…</p>

  const filteredItems = items.filter(it => {
    if (filter === "short") return it.label === "short"
    if (filter === "experience") return it.label !== "short"
    return true
  })

  return (
    <div className="section-wrap">
      <div className="section-header">
        <div>
          <h2>經歷與演講（Work History / Talks · {items.length}）</h2>
          <p className="hint">
            依據 `label` 欄位自動分配至側邊欄時間軸、Experience 或 Talk / Workshop
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={startNew}
        >
          + 新增經歷 / 演講
        </button>
      </div>

      <div className="filter-pills">
        <button
          type="button"
          className={`btn-chip ${filter === "all" ? "btn-chip-active" : ""}`}
          onClick={() => setFilter("all")}
        >
          全部 ({items.length})
        </button>
        <button
          type="button"
          className={`btn-chip ${
            filter === "experience" ? "btn-chip-active" : ""
          }`}
          onClick={() => setFilter("experience")}
        >
          經歷 / 學歷 ({items.filter(i => i.label !== "short").length})
        </button>
        <button
          type="button"
          className={`btn-chip ${filter === "short" ? "btn-chip-active" : ""}`}
          onClick={() => setFilter("short")}
        >
          Talk / Workshop ({items.filter(i => i.label === "short").length})
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
            <h3>
              {editingId === "NEW"
                ? "新增經歷 / 演講"
                : `編輯：${draft.company}`}
            </h3>
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
                {saving ? "儲存中…" : "儲存"}
              </button>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="field-group">
              <label className="field-label">
                公司 / 單位 / 活動名稱（company）*
              </label>
              <input
                type="text"
                className="input"
                required
                value={draft.company}
                onChange={e => setDraft({ ...draft, company: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label className="field-label">部門 / 主題說明（department）</label>
              <input
                type="text"
                className="input"
                value={draft.department || ""}
                onChange={e =>
                  setDraft({ ...draft, department: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">職稱 / 身分（position）</label>
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
              <label className="field-label">顯示區塊（label）</label>
              <select
                className="input"
                value={draft.label}
                onChange={e =>
                  setDraft({
                    ...draft,
                    label: e.target.value as WorkHistoryLabel,
                  })
                }
              >
                {WORK_LABEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">開始時間（fromtime，例如 2018/12）</label>
              <input
                type="text"
                className="input"
                value={draft.fromtime || ""}
                onChange={e =>
                  setDraft({ ...draft, fromtime: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">
                結束時間（totime，例如 present 或 2024/02）
              </label>
              <input
                type="text"
                className="input"
                value={draft.totime || ""}
                onChange={e =>
                  setDraft({ ...draft, totime: e.target.value || null })
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">相關網址（url）</label>
              <input
                type="url"
                className="input"
                value={draft.url || ""}
                onChange={e =>
                  setDraft({ ...draft, url: e.target.value || null })
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

          <StringListInput
            label="備註 / 授課紀錄（notes）"
            values={draft.notes}
            placeholder="例如 2020 Fall, 技專校院高等教育深耕計畫業界教師"
            onChange={notes => setDraft({ ...draft, notes })}
          />
        </form>
      )}

      <div className="item-list">
        {filteredItems.map(item => {
          const globalIdx = items.findIndex(i => i.id === item.id)
          return (
            <div key={item.id} className="item-card">
              <div className="item-main">
                <div className="item-title-row">
                  <span className="order-pill">#{globalIdx + 1}</span>
                  <strong>{item.company}</strong>
                  <span className="badge">{item.label}</span>
                  {item.selection && (
                    <span className="badge badge-ok">精選</span>
                  )}
                </div>
                <p className="item-meta">
                  {[item.position, item.department].filter(Boolean).join(" · ") ||
                    "無職稱/部門"}
                  {(item.fromtime || item.totime) &&
                    ` · ${item.fromtime || ""} - ${item.totime || "present"}`}
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
