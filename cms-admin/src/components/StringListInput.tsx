import { useState } from "react"

interface StringListInputProps {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  helperText?: string
  supportAwardPrefix?: boolean
}

export function StringListInput({
  label,
  values,
  onChange,
  placeholder = "輸入項目內容",
  helperText,
  supportAwardPrefix = false,
}: StringListInputProps) {
  const [draft, setDraft] = useState("")

  function handleAdd() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...values, trimmed])
    setDraft("")
  }

  function handleUpdate(idx: number, nextVal: string) {
    const copy = [...values]
    copy[idx] = nextVal
    onChange(copy)
  }

  function handleRemove(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  function handleMove(idx: number, delta: number) {
    const target = idx + delta
    if (target < 0 || target >= values.length) return
    const copy = [...values]
    ;[copy[idx], copy[target]] = [copy[target], copy[idx]]
    onChange(copy)
  }

  function toggleAwardPrefix(idx: number) {
    const current = values[idx]
    const hasPrefix = current.startsWith("[a] ")
    handleUpdate(
      idx,
      hasPrefix ? current.replace(/^\[a\]\s*/, "") : `[a] ${current}`
    )
  }

  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {helperText && <p className="field-help">{helperText}</p>}

      {values.length > 0 && (
        <ul className="list-editor">
          {values.map((val, idx) => {
            const isTrophy = supportAwardPrefix && val.includes("[a] ")
            return (
              <li key={`${idx}`} className="list-editor-row">
                {supportAwardPrefix && (
                  <button
                    type="button"
                    className={`btn-chip ${isTrophy ? "btn-chip-active" : ""}`}
                    title="切換首獎獎盃圖示 ([a] 前綴)"
                    onClick={() => toggleAwardPrefix(idx)}
                  >
                    🏆
                  </button>
                )}
                <input
                  type="text"
                  className="input"
                  value={val}
                  onChange={e => handleUpdate(idx, e.target.value)}
                />
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn-icon"
                    title="上移"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    title="下移"
                    disabled={idx === values.length - 1}
                    onClick={() => handleMove(idx, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="btn-icon btn-icon-danger"
                    title="刪除"
                    onClick={() => handleRemove(idx)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="add-row">
        <input
          type="text"
          className="input"
          value={draft}
          placeholder={placeholder}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
        />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAdd}
        >
          + 新增
        </button>
      </div>
    </div>
  )
}
