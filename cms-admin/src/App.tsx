import { useEffect, useState, type ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth"
import {
  allowedEmails,
  auth,
  envConfig,
  firestoreDatabaseId,
  googleProvider,
  isFirebaseConfigured,
  missingEnvVars,
} from "./lib/firebase"
import {
  IconBook,
  IconBriefcase,
  IconChevronDown,
  IconChevronRight,
  IconGrid,
  IconLink,
  IconLogOut,
  IconMenu,
  IconPanelLeft,
  IconUser,
} from "./components/Icons"
import { PublishPanel } from "./components/PublishPanel"
import { ProfileEditor } from "./components/sections/ProfileEditor"
import { ProjectsEditor } from "./components/sections/ProjectsEditor"
import { WorkHistoryEditor } from "./components/sections/WorkHistoryEditor"
import { PublicationsEditor } from "./components/sections/PublicationsEditor"
import { SocialEditor } from "./components/sections/SocialEditor"

type TabKey = "projects" | "workHistory" | "publications" | "profile" | "social"

const SIDEBAR_STORAGE_KEY = "portfolio_cms_sidebar_collapsed"

const NAV_ITEMS: Array<{
  key: TabKey
  label: string
  subtitle: string
  icon: ReactNode
}> = [
  {
    key: "projects",
    label: "Projects",
    subtitle: "作品集專案與封面圖片",
    icon: <IconGrid />,
  },
  {
    key: "workHistory",
    label: "Experience & Talks",
    subtitle: "經歷、學歷與演講工作坊",
    icon: <IconBriefcase />,
  },
  {
    key: "publications",
    label: "Publications",
    subtitle: "學術論文發表清單",
    icon: <IconBook />,
  },
  {
    key: "profile",
    label: "Profile",
    subtitle: "個人簡介、頭像與技能",
    icon: <IconUser />,
  },
  {
    key: "social",
    label: "Social Links",
    subtitle: "社群連結與排序",
    icon: <IconLink />,
  },
]

function isEmailAllowed(email: string | null): boolean {
  if (allowedEmails.length === 0) return true
  if (!email) return false
  return allowedEmails.includes(email.toLowerCase())
}

function formatAuthError(code?: string, fallback?: string): string {
  switch (code) {
    case "auth/popup-closed-by-user":
      return "已取消 Google 登入視窗。"
    case "auth/popup-blocked":
      return "瀏覽器封鎖了登入彈窗，請允許此網站開啟彈出視窗後再試一次。"
    case "auth/unauthorized-domain":
      return `目前的網域（${window.location.hostname}）尚未加入 Firebase Authentication 的 Authorized domains，請到 Firebase Console → Authentication → Settings → Authorized domains 新增此網域。`
    default:
      return fallback || "登入失敗，請稍後再試。"
  }
}

export function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured)
  const [signingIn, setSigningIn] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("projects")
  const [contentGroupOpen, setContentGroupOpen] = useState(true)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1"
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  function toggleSidebarCollapse() {
    setSidebarCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0")
      } catch {
        // Ignore storage error
      }
      return next
    })
  }

  function handleSelectTab(key: TabKey) {
    setActiveTab(key)
    setMobileNavOpen(false)
  }

  async function handleGoogleLogin() {
    if (!auth || !googleProvider) return
    setSigningIn(true)
    setErrorMsg(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string }
      setErrorMsg(formatAuthError(firebaseErr.code, firebaseErr.message))
    } finally {
      setSigningIn(false)
    }
  }

  async function handleSignOut() {
    if (!auth) return
    setErrorMsg(null)
    await signOut(auth)
  }

  if (!isFirebaseConfigured) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-mark">BA</div>
          <span className="badge badge-warn">Setup Required</span>
          <h1>Portfolio Studio</h1>
          <p className="subtitle">
            尚未偵測到 Firebase Web App 設定環境變數。
          </p>
          <div className="panel">
            <h3>缺少的環境變數</h3>
            <ul className="mono-list">
              {missingEnvVars.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="hint">
              本地開發請複製 <code>.env.example</code> 為 <code>.env.local</code>
              ；部署至 Firebase App Hosting 請於 Console Environment 設定以上變數。
            </p>
          </div>
        </section>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-card auth-card-center">
          <div className="brand-mark">BA</div>
          <p className="subtitle">正在驗證登入狀態…</p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <div className="brand-mark">BA</div>
          <p className="eyebrow">PORTFOLIO CMS</p>
          <h1>歡迎回到管理後台</h1>
          <p className="subtitle">
            請使用已授權的 Google 帳號登入，即可編輯網站內容並發布至 GitHub
            Pages。
          </p>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

          <button
            type="button"
            className="btn btn-primary btn-full btn-lg"
            onClick={handleGoogleLogin}
            disabled={signingIn}
          >
            {signingIn ? "登入驗證中…" : "使用 Google 帳號登入"}
          </button>

          <footer className="meta-footer">
            <span>
              {envConfig.projectId} · {firestoreDatabaseId}
            </span>
            <span>{window.location.hostname}</span>
          </footer>
        </section>
      </main>
    )
  }

  if (!isEmailAllowed(user.email)) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <span className="badge badge-error">Access Denied</span>
          <h1>帳號未在允許清單內</h1>
          <p className="subtitle">
            目前帳號 <strong>{user.email || "(無 Email)"}</strong> 未列入{" "}
            <code>VITE_ALLOWED_EMAIL</code> 白名單。
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={handleSignOut}
          >
            登出並切換帳號
          </button>
        </section>
      </main>
    )
  }

  const currentNav = NAV_ITEMS.find(item => item.key === activeTab)!
  const isRail = sidebarCollapsed && !mobileNavOpen

  return (
    <div
      className={`studio-layout ${
        isRail ? "studio-sidebar-collapsed" : ""
      }`}
    >
      {/* Mobile Header */}
      <header className="mobile-topbar">
        <button
          type="button"
          className="btn-icon-ghost"
          aria-label="開啟側邊選單"
          onClick={() => setMobileNavOpen(true)}
        >
          <IconMenu />
        </button>
        <div className="mobile-title">
          <span className="brand-mark brand-mark-sm">BA</span>
          <strong>{currentNav.label}</strong>
        </div>
        <div className="mobile-spacer" />
      </header>

      {mobileNavOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Left Collapsible Sidebar */}
      <aside
        className={`studio-sidebar ${mobileNavOpen ? "studio-sidebar-open" : ""}`}
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <span className="brand-mark brand-mark-sm">BA</span>
            {!isRail && (
              <div className="sidebar-brand-text">
                <strong>Portfolio</strong>
                <span>Studio CMS</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-icon-ghost sidebar-collapse-btn"
            onClick={toggleSidebarCollapse}
            title={isRail ? "展開側邊欄" : "收合側邊欄"}
            aria-label={isRail ? "展開側邊欄" : "收合側邊欄"}
          >
            <IconPanelLeft size={17} />
          </button>
        </div>

        <div className="sidebar-scroll">
          {/* Content Navigation Group */}
          <div className="sidebar-section">
            {!isRail ? (
              <button
                type="button"
                className="sidebar-group-toggle"
                onClick={() => setContentGroupOpen(v => !v)}
                aria-expanded={contentGroupOpen}
              >
                <span className="sidebar-group-label">CONTENT</span>
                {contentGroupOpen ? <IconChevronDown /> : <IconChevronRight />}
              </button>
            ) : (
              <div className="sidebar-divider" />
            )}

            {(isRail || contentGroupOpen) && (
              <nav className="sidebar-nav" aria-label="內容管理">
                {NAV_ITEMS.map(item => {
                  const isActive = activeTab === item.key
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                      title={isRail ? item.label : undefined}
                      onClick={() => handleSelectTab(item.key)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      {!isRail && (
                        <span className="nav-label">{item.label}</span>
                      )}
                    </button>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="sidebar-divider" />

          {/* Collapsible Publish Section Docked in Sidebar */}
          <PublishPanel
            collapsed={isRail}
            onRequestExpand={() => setSidebarCollapsed(false)}
          />
        </div>

        {/* Account Footer */}
        <div className="sidebar-footer">
          <div className="account-box" title={user.email || undefined}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "Admin"}
                className="avatar-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="avatar-fallback">
                {(user.displayName || user.email || "A")[0].toUpperCase()}
              </span>
            )}
            {!isRail && (
              <div className="account-meta">
                <strong>{user.displayName || "Admin"}</strong>
                <span>db: {firestoreDatabaseId}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-icon-ghost"
            title="登出"
            aria-label="登出"
            onClick={handleSignOut}
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Right Main Bright Studio Workspace */}
      <main className="studio-main">
        <div className="studio-content">
          {allowedEmails.length === 0 && (
            <div className="alert alert-warn">
              尚未設定 <code>VITE_ALLOWED_EMAIL</code>
              ，建議設定以加強前端與伺服器端白名單防護。
            </div>
          )}

          <div className="workspace-breadcrumb">
            <span className="eyebrow">CONTENT / {currentNav.label.toUpperCase()}</span>
          </div>

          <section className="cms-workspace">
            {activeTab === "projects" && <ProjectsEditor />}
            {activeTab === "workHistory" && <WorkHistoryEditor />}
            {activeTab === "publications" && <PublicationsEditor />}
            {activeTab === "profile" && <ProfileEditor />}
            {activeTab === "social" && <SocialEditor />}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
