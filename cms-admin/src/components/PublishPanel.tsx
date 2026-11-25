import { useEffect, useState } from "react"
import { auth } from "../lib/firebase"
import {
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
  IconPublish,
  IconRefresh,
  IconShieldCheck,
} from "./Icons"

const PAT_STORAGE_KEY = "portfolio_cms_github_pat"

const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER?.trim() || "Balalachen"
const GITHUB_REPO =
  import.meta.env.VITE_GITHUB_REPO?.trim() || "Balalachen.github.io"
const GITHUB_WORKFLOW_ID =
  import.meta.env.VITE_GITHUB_WORKFLOW_ID?.trim() || "main.yml"
const GITHUB_REF = import.meta.env.VITE_GITHUB_REF?.trim() || "master"

interface WorkflowRunSummary {
  id: number
  status: string
  conclusion: string | null
  html_url: string
  created_at: string
  event: string
}

interface PublishPanelProps {
  collapsed: boolean
  onRequestExpand: () => void
}

function getRunDotClass(run: WorkflowRunSummary): string {
  if (run.status === "completed") {
    return run.conclusion === "success" ? "dot-ok" : "dot-err"
  }
  return "dot-warn"
}

function formatRunStatus(run: WorkflowRunSummary): string {
  if (run.status === "completed") {
    if (run.conclusion === "success") return "部署成功"
    if (run.conclusion === "failure") return "建置失敗"
    return run.conclusion || "已完成"
  }
  if (run.status === "in_progress") return "建置中…"
  if (run.status === "queued") return "排隊中…"
  return run.status
}

export function PublishPanel({
  collapsed,
  onRequestExpand,
}: PublishPanelProps) {
  const [sectionOpen, setSectionOpen] = useState(true)
  const [serverMode, setServerMode] = useState<
    "checking" | "ready" | "unconfigured"
  >("checking")
  const [patInput, setPatInput] = useState(() => {
    try {
      return localStorage.getItem(PAT_STORAGE_KEY) || ""
    } catch {
      return ""
    }
  })
  const [showPatConfig, setShowPatConfig] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [checkingRuns, setCheckingRuns] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [latestRuns, setLatestRuns] = useState<WorkflowRunSummary[]>([])

  useEffect(() => {
    let cancelled = false

    async function probeServerDeploy() {
      try {
        const currentUser = auth?.currentUser
        if (!currentUser) return
        const idToken = await currentUser.getIdToken()
        const res = await fetch("/api/deploy/status", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!res.ok) {
          if (!cancelled) setServerMode("unconfigured")
          return
        }
        const data = (await res.json()) as { serverConfigured?: boolean }
        if (!cancelled) {
          setServerMode(data.serverConfigured ? "ready" : "unconfigured")
        }
      } catch {
        if (!cancelled) setServerMode("unconfigured")
      }
    }

    void probeServerDeploy()
    return () => {
      cancelled = true
    }
  }, [])

  function savePat(val: string) {
    setPatInput(val)
    try {
      if (val.trim()) {
        localStorage.setItem(PAT_STORAGE_KEY, val.trim())
      } else {
        localStorage.removeItem(PAT_STORAGE_KEY)
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  async function fetchRecentRuns() {
    setCheckingRuns(true)
    setErrorMessage(null)
    try {
      const currentUser = auth?.currentUser
      if (serverMode === "ready" && currentUser) {
        const idToken = await currentUser.getIdToken()
        const res = await fetch("/api/deploy/runs", {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as {
            error?: string
          }
          throw new Error(data.error || `無法查詢建置狀態 (${res.status})`)
        }
        const data = (await res.json()) as { runs?: WorkflowRunSummary[] }
        setLatestRuns(data.runs || [])
        return
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
      }
      if (patInput.trim()) {
        headers.Authorization = `Bearer ${patInput.trim()}`
      }
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_ID}/runs?per_page=3`,
        { headers }
      )
      if (!res.ok) {
        throw new Error(`無法查詢建置狀態 (${res.status})`)
      }
      const data = (await res.json()) as { workflow_runs?: WorkflowRunSummary[] }
      setLatestRuns(data.workflow_runs || [])
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "查詢建置狀態失敗")
    } finally {
      setCheckingRuns(false)
    }
  }

  async function handlePublish() {
    setTriggering(true)
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      if (serverMode === "ready") {
        const currentUser = auth?.currentUser
        if (!currentUser) throw new Error("請先登入 Google 帳號")
        const idToken = await currentUser.getIdToken()
        const res = await fetch("/api/deploy", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        const data = (await res.json().catch(() => ({}))) as {
          message?: string
          error?: string
        }
        if (!res.ok) {
          throw new Error(data.error || `伺服器觸發失敗 (${res.status})`)
        }
        setStatusMessage("已觸發重建，約 3～5 分鐘後上線。")
        setTimeout(() => {
          void fetchRecentRuns()
        }, 2000)
        return
      }

      const token = patInput.trim()
      if (!token) {
        setShowPatConfig(true)
        throw new Error(
          "尚未設定伺服器 GITHUB_DEPLOY_PAT，請於 App Hosting 設定環境密鑰，或暫時於下方貼上本機備用 Token。"
        )
      }

      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_ID}/dispatches`,
        {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref: GITHUB_REF }),
        }
      )

      if (!res.ok) {
        const bodyText = await res.text()
        throw new Error(
          `GitHub API ${res.status}：${bodyText || "請檢查 Token 權限"}`
        )
      }

      setStatusMessage("已觸發重建，約 3～5 分鐘後上線。")
      setTimeout(() => {
        void fetchRecentRuns()
      }, 2000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "觸發重建失敗")
    } finally {
      setTriggering(false)
    }
  }

  if (collapsed) {
    return (
      <div className="sidebar-publish-collapsed">
        <button
          type="button"
          className="rail-publish-btn"
          title="展開網站發布面板"
          onClick={() => {
            setSectionOpen(true)
            onRequestExpand()
          }}
        >
          <IconPublish size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="sidebar-section sidebar-publish">
      <button
        type="button"
        className="sidebar-group-toggle"
        onClick={() => setSectionOpen(v => !v)}
        aria-expanded={sectionOpen}
      >
        <span className="sidebar-group-label">
          <IconPublish size={14} />
          <span>PUBLISH</span>
        </span>
        {sectionOpen ? <IconChevronDown /> : <IconChevronRight />}
      </button>

      {sectionOpen && (
        <div className="sidebar-publish-body">
          <button
            type="button"
            className="btn btn-primary btn-full"
            disabled={triggering}
            onClick={handlePublish}
          >
            <IconPublish size={15} />
            <span>{triggering ? "觸發建置中…" : "發布網站"}</span>
          </button>

          <div className="publish-meta-row">
            {serverMode === "ready" ? (
              <span className="secure-pill" title="GITHUB_DEPLOY_PAT 由 App Hosting 後端伺服器保管，不會外洩至瀏覽器">
                <IconShieldCheck size={13} />
                <span>伺服器金鑰已保護</span>
              </span>
            ) : (
              <button
                type="button"
                className="link-subtle"
                onClick={() => setShowPatConfig(v => !v)}
              >
                {patInput.trim() ? "本機 Token（已設）" : "設定本機備用 Token"}
              </button>
            )}

            <button
              type="button"
              className="link-subtle"
              disabled={checkingRuns}
              onClick={() => void fetchRecentRuns()}
              title="查詢最近 GitHub Actions 建置紀錄"
            >
              <IconRefresh size={13} />
              <span>{checkingRuns ? "查詢中" : "狀態"}</span>
            </button>
          </div>

          {showPatConfig && serverMode !== "ready" && (
            <div className="sidebar-pat-box">
              <label className="micro-label">本機備用 GitHub PAT</label>
              <div className="sidebar-pat-row">
                <input
                  type="password"
                  className="input input-compact mono"
                  value={patInput}
                  placeholder="github_pat_..."
                  onChange={e => savePat(e.target.value)}
                />
                {patInput && (
                  <button
                    type="button"
                    className="btn-icon-ghost"
                    onClick={() => savePat("")}
                    title="清除本機 Token"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="micro-help">
                上線後於 App Hosting 設定 <code>GITHUB_DEPLOY_PAT</code>{" "}
                即可免除手動貼上。
              </p>
            </div>
          )}

          {statusMessage && (
            <div className="sidebar-note sidebar-note-ok">{statusMessage}</div>
          )}
          {errorMessage && (
            <div className="sidebar-note sidebar-note-err">{errorMessage}</div>
          )}

          {latestRuns.length > 0 && (
            <div className="sidebar-runs">
              {latestRuns.map(run => (
                <a
                  key={run.id}
                  href={run.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-run-item"
                >
                  <span className="run-left">
                    <span className={`status-dot ${getRunDotClass(run)}`} />
                    <span>{formatRunStatus(run)}</span>
                  </span>
                  <span className="run-right">
                    {new Date(run.created_at).toLocaleTimeString("zh-TW", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    <IconExternalLink size={11} />
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
