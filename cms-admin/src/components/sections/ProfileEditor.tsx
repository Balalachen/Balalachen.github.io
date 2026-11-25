import { useEffect, useState } from "react"
import { fetchProfile, saveProfile } from "../../lib/cmsApi"
import type { ProfileData } from "../../types/portfolio"
import { ImagePicker } from "../ImagePicker"
import { StringListInput } from "../StringListInput"

export function ProfileEditor() {
  const [form, setForm] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<{
    type: "ok" | "error"
    text: string
  } | null>(null)

  useEffect(() => {
    fetchProfile()
      .then(data => setForm(data))
      .catch(err =>
        setNotice({
          type: "error",
          text: err instanceof Error ? err.message : "讀取 Profile 失敗",
        })
      )
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setNotice(null)
    try {
      await saveProfile(form)
      setNotice({ type: "ok", text: "Profile 已儲存到 Firestore！" })
    } catch (err) {
      setNotice({
        type: "error",
        text: err instanceof Error ? err.message : "儲存失敗",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="hint">載入 Profile 資料中…</p>
  }

  if (!form) {
    return (
      <div className="alert alert-error">
        {notice?.text || "無法讀取 Profile 資料"}
      </div>
    )
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <div className="section-header">
        <div>
          <h2>個人資料（Profile）</h2>
          <p className="hint">對應 Firestore `siteConfig/profile`</p>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={saving}
        >
          {saving ? "儲存中…" : "儲存 Profile"}
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

      <div className="form-grid-2">
        <div className="field-group">
          <label className="field-label">顯示名稱（name）*</label>
          <input
            type="text"
            className="input"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">英文全名（fullname，論文標記底線用）</label>
          <input
            type="text"
            className="input"
            value={form.fullname}
            onChange={e => setForm({ ...form, fullname: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">縮寫徽章（initials）*</label>
          <input
            type="text"
            className="input"
            required
            value={form.initials}
            onChange={e => setForm({ ...form, initials: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">職稱 / 專業領域（profession）*</label>
          <input
            type="text"
            className="input"
            required
            value={form.profession}
            onChange={e => setForm({ ...form, profession: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">公司 / 組織（company）</label>
          <input
            type="text"
            className="input"
            value={form.company}
            onChange={e => setForm({ ...form, company: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">地點（location）</label>
          <input
            type="text"
            className="input"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">目前專注（focus）</label>
          <input
            type="text"
            className="input"
            value={form.focus}
            onChange={e => setForm({ ...form, focus: e.target.value })}
          />
        </div>

        <div className="field-group">
          <label className="field-label">專注連結（focus_url）</label>
          <input
            type="url"
            className="input"
            value={form.focus_url || ""}
            onChange={e =>
              setForm({ ...form, focus_url: e.target.value.trim() || null })
            }
          />
        </div>
      </div>

      <div className="checkbox-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.for_hire}
            onChange={e => setForm({ ...form, for_hire: e.target.checked })}
          />
          <span>開放接案 / 求職（for_hire）</span>
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.relocation}
            onChange={e => setForm({ ...form, relocation: e.target.checked })}
          />
          <span>接受遠端或移居（relocation）</span>
        </label>
      </div>

      <ImagePicker
        label="個人頭像（image）"
        value={form.image}
        onChange={nextPath => setForm({ ...form, image: nextPath })}
      />

      <div className="field-group">
        <label className="field-label">自我介紹（about，支援多行文字）</label>
        <textarea
          className="textarea"
          rows={5}
          value={form.about}
          onChange={e => setForm({ ...form, about: e.target.value })}
        />
      </div>

      <div className="form-grid-2">
        <StringListInput
          label="技能清單（skills）"
          values={form.skills}
          placeholder="新增技能，例如 HLSL"
          onChange={skills => setForm({ ...form, skills })}
        />

        <StringListInput
          label="工具清單（tools）"
          values={form.tools}
          placeholder="新增工具，例如 Unity"
          onChange={tools => setForm({ ...form, tools })}
        />
      </div>

      <div className="panel">
        <h3>聯絡表單預算滑桿設定（budget）</h3>
        <div className="form-grid-4">
          <div className="field-group">
            <label className="field-label">幣別符號</label>
            <input
              type="text"
              className="input"
              value={form.budget.currency}
              onChange={e =>
                setForm({
                  ...form,
                  budget: { ...form.budget, currency: e.target.value },
                })
              }
            />
          </div>
          <div className="field-group">
            <label className="field-label">Min</label>
            <input
              type="number"
              className="input"
              value={form.budget.min}
              onChange={e =>
                setForm({
                  ...form,
                  budget: { ...form.budget, min: Number(e.target.value) },
                })
              }
            />
          </div>
          <div className="field-group">
            <label className="field-label">Max</label>
            <input
              type="number"
              className="input"
              value={form.budget.max}
              onChange={e =>
                setForm({
                  ...form,
                  budget: { ...form.budget, max: Number(e.target.value) },
                })
              }
            />
          </div>
          <div className="field-group">
            <label className="field-label">Default</label>
            <input
              type="number"
              className="input"
              value={form.budget.default}
              onChange={e =>
                setForm({
                  ...form,
                  budget: { ...form.budget, default: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </div>
    </form>
  )
}
