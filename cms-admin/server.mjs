import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DIST_DIR = path.join(__dirname, "dist")

const PORT = Number(process.env.PORT) || 8080
const HOST = "0.0.0.0"

const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID?.trim() ||
  process.env.VITE_FIREBASE_PROJECT_ID?.trim() ||
  "portfolio-admin-fe051"

const ALLOWED_EMAILS = (
  process.env.ALLOWED_EMAIL ||
  process.env.VITE_ALLOWED_EMAIL ||
  ""
)
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

const GITHUB_DEPLOY_PAT = process.env.GITHUB_DEPLOY_PAT?.trim() || ""
const GITHUB_OWNER = process.env.GITHUB_OWNER?.trim() || "Balalachen"
const GITHUB_REPO =
  process.env.GITHUB_REPO?.trim() || "Balalachen.github.io"
const GITHUB_WORKFLOW_ID =
  process.env.GITHUB_WORKFLOW_ID?.trim() || "main.yml"
const GITHUB_REF = process.env.GITHUB_REF?.trim() || "master"

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({ projectId: FIREBASE_PROJECT_ID })
const adminAuth = getAuth(adminApp)

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
  })
  res.end(body)
}

async function verifyAdminRequest(req) {
  const authHeader = req.headers.authorization || ""
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "缺少驗證憑證 (Bearer Token)" }
  }

  const idToken = authHeader.slice(7).trim()
  if (!idToken) {
    return { ok: false, status: 401, error: "無效的驗證憑證" }
  }

  if (ALLOWED_EMAILS.length === 0) {
    return {
      ok: false,
      status: 403,
      error:
        "伺服器端尚未設定 ALLOWED_EMAIL（或 VITE_ALLOWED_EMAIL），已基於安全考量拒絕執行。",
    }
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    const email = (decoded.email || "").toLowerCase()
    if (!decoded.email_verified || !ALLOWED_EMAILS.includes(email)) {
      return {
        ok: false,
        status: 403,
        error: `帳號 ${email || "(未知)"} 無權限執行部署操作`,
      }
    }
    return { ok: true, email, uid: decoded.uid }
  } catch (err) {
    return {
      ok: false,
      status: 401,
      error: `Firebase Auth 驗證失敗：${err?.message || "Invalid token"}`,
    }
  }
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, { ok: true })
  }

  const authCheck = await verifyAdminRequest(req)
  if (!authCheck.ok) {
    return sendJson(res, authCheck.status, { error: authCheck.error })
  }

  if (pathname === "/api/deploy/status" && req.method === "GET") {
    return sendJson(res, 200, {
      serverConfigured: Boolean(GITHUB_DEPLOY_PAT),
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      workflow: GITHUB_WORKFLOW_ID,
      ref: GITHUB_REF,
    })
  }

  if (pathname === "/api/deploy" && req.method === "POST") {
    if (!GITHUB_DEPLOY_PAT) {
      return sendJson(res, 503, {
        error:
          "伺服器尚未設定 GITHUB_DEPLOY_PAT 環境變數／Secret，請至 Firebase Console → App Hosting → Settings → Environment 設定。",
      })
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_ID}/dispatches`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${GITHUB_DEPLOY_PAT}`,
          "Content-Type": "application/json",
          "User-Agent": "portfolio-cms-admin",
        },
        body: JSON.stringify({ ref: GITHUB_REF }),
      }
    )

    if (!ghRes.ok) {
      const text = await ghRes.text()
      return sendJson(res, ghRes.status, {
        error: `GitHub API 回傳 ${ghRes.status}：${text || "無法觸發 workflow_dispatch"}`,
      })
    }

    return sendJson(res, 200, {
      ok: true,
      message: "已成功透過伺服器安全觸發 GitHub Actions 重建。",
    })
  }

  if (pathname === "/api/deploy/runs" && req.method === "GET") {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-cms-admin",
    }
    if (GITHUB_DEPLOY_PAT) {
      headers.Authorization = `Bearer ${GITHUB_DEPLOY_PAT}`
    }

    const ghRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_ID}/runs?per_page=4`,
      { headers }
    )

    if (!ghRes.ok) {
      const text = await ghRes.text()
      return sendJson(res, ghRes.status, {
        error: `無法查詢建置狀態 (${ghRes.status})：${text}`,
      })
    }

    const data = await ghRes.json()
    const runs = (data.workflow_runs || []).map(run => ({
      id: run.id,
      status: run.status,
      conclusion: run.conclusion,
      html_url: run.html_url,
      created_at: run.created_at,
      event: run.event,
    }))
    return sendJson(res, 200, { runs })
  }

  return sendJson(res, 404, { error: "Not Found" })
}

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405)
    res.end("Method Not Allowed")
    return
  }

  let decodedPath = "/"
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    res.writeHead(400)
    res.end("Bad Request")
    return
  }

  const relativePath = decodedPath.replace(/^\/+/, "")
  const candidate = path.resolve(DIST_DIR, relativePath || "index.html")
  const safeWithinDist =
    candidate === DIST_DIR || candidate.startsWith(DIST_DIR + path.sep)

  let filePath = path.join(DIST_DIR, "index.html")
  if (
    safeWithinDist &&
    fs.existsSync(candidate) &&
    fs.statSync(candidate).isFile()
  ) {
    filePath = candidate
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404)
    res.end("Build output not found. Run `npm run build` first.")
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || "application/octet-stream"
  const isHashedAsset = filePath.startsWith(
    path.join(DIST_DIR, "assets") + path.sep
  )

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": isHashedAsset
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  })

  if (req.method === "HEAD") {
    res.end()
    return
  }

  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`)
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname)
      return
    }
    serveStatic(req, res, url.pathname)
  } catch (err) {
    console.error("[server error]", err)
    if (!res.headersSent) {
      sendJson(res, 500, { error: "Internal Server Error" })
    }
  }
})

server.listen(PORT, HOST, () => {
  console.log(
    `Portfolio CMS Admin listening on http://${HOST}:${PORT} (project: ${FIREBASE_PROJECT_ID}, serverDeployPAT: ${GITHUB_DEPLOY_PAT ? "configured" : "not set"})`
  )
})
