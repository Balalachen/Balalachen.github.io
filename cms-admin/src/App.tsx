import { useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type IdTokenResult,
  type User,
} from "firebase/auth"
import {
  allowedEmails,
  auth,
  envConfig,
  googleProvider,
  isFirebaseConfigured,
  missingEnvVars,
} from "./lib/firebase"

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
  const [tokenInfo, setTokenInfo] = useState<IdTokenResult | null>(null)
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured)
  const [signingIn, setSigningIn] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) return

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const result = await currentUser.getIdTokenResult()
          setTokenInfo(result)
        } catch {
          setTokenInfo(null)
        }
      } else {
        setTokenInfo(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
      <main className="page">
        <section className="card">
          <span className="badge badge-warn">Setup Required</span>
          <h1>Portfolio CMS Admin</h1>
          <p className="subtitle">
            Hello World 骨架已就緒，但尚未偵測到 Firebase Web App 設定環境變數。
          </p>
          <div className="panel">
            <h2>缺少的環境變數</h2>
            <ul className="mono-list">
              {missingEnvVars.map(name => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="hint">
              本地開發請複製 <code>.env.example</code> 為 <code>.env.local</code>{" "}
              並填入 Firebase Console 的 Web App 設定；部署至 Firebase App Hosting
              請於 Console Environment 或 <code>apphosting.yaml</code> 設定以上
              <code>BUILD</code> 環境變數。
            </p>
          </div>
        </section>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="page">
        <section className="card">
          <p className="subtitle">正在驗證 Firebase Authentication 狀態…</p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page">
        <section className="card">
          <span className="badge">Stage 1 · Auth Verification</span>
          <h1>Portfolio CMS Admin</h1>
          <p className="subtitle">
            請使用已授權的 Google 帳號登入，以驗證 Firebase Hosting / App Hosting
            與 Firebase Authentication 串接是否正常。
          </p>

          {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGoogleLogin}
            disabled={signingIn}
          >
            {signingIn ? "登入中…" : "使用 Google 帳號登入"}
          </button>

          <footer className="meta-footer">
            <span>Firebase Project: {envConfig.projectId}</span>
            <span>Host: {window.location.hostname}</span>
          </footer>
        </section>
      </main>
    )
  }

  const authorized = isEmailAllowed(user.email)

  if (!authorized) {
    return (
      <main className="page">
        <section className="card">
          <span className="badge badge-error">Access Denied</span>
          <h1>帳號未在允許清單內</h1>
          <p className="subtitle">
            你已通過 Google 登入，但目前帳號{" "}
            <strong>{user.email || "(無 Email)"}</strong> 未列入{" "}
            <code>VITE_ALLOWED_EMAIL</code> 白名單。
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSignOut}
          >
            登出並切換帳號
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="card card-wide">
        <header className="topbar">
          <div>
            <span className="badge badge-ok">Authenticated · Hello World</span>
            <h1>Portfolio CMS Admin</h1>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleSignOut}
          >
            登出
          </button>
        </header>

        {allowedEmails.length === 0 && (
          <div className="alert alert-warn">
            尚未設定 <code>VITE_ALLOWED_EMAIL</code>，目前任何通過 Google
            登入的帳號都能進入此頁面。正式存取 Firestore / Storage 前，請務必設定
            <code>VITE_ALLOWED_EMAIL</code> 與 Firebase Security Rules。
          </div>
        )}

        <div className="profile-row">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || "User avatar"}
              className="avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h2 className="user-name">
              Hello, {user.displayName || user.email || "Admin"}!
            </h2>
            <p className="user-email">{user.email}</p>
          </div>
        </div>

        <div className="panel">
          <h3>Auth 驗證資訊</h3>
          <dl className="info-grid">
            <dt>Firebase Project</dt>
            <dd>{envConfig.projectId}</dd>

            <dt>UID</dt>
            <dd className="mono">{user.uid}</dd>

            <dt>Email Verified</dt>
            <dd>{user.emailVerified ? "Yes" : "No"}</dd>

            <dt>Sign-in Provider</dt>
            <dd>{tokenInfo?.signInProvider || "google.com"}</dd>

            <dt>Token Expiration</dt>
            <dd>{tokenInfo?.expirationTime || "—"}</dd>

            <dt>Hosting Origin</dt>
            <dd className="mono">{window.location.origin}</dd>
          </dl>
        </div>

        <div className="panel panel-muted">
          <h3>後續階段預告</h3>
          <ul className="roadmap">
            <li>✅ Stage 1：App Hosting 部署與 Google Auth 驗證通過（目前階段）</li>
            <li>⬜ Stage 2：Firestore / Storage 結構化 Schema 與既有 YAML 匯入</li>
            <li>⬜ Stage 3：Profile / Projects / Publications / Work History 表單與圖片上傳</li>
            <li>⬜ Stage 4：GitHub Actions Sync 腳本與後台一鍵發布按鈕</li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default App
