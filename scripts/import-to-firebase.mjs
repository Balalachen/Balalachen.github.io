#!/usr/bin/env node
/**
 * 將現有 content/*.yaml 與 content/images/* 匯入 Firebase Firestore 與 Cloud Storage。
 *
 * 使用方式：
 *   1. 預覽模式（不需金鑰、不寫入 Firebase）：
 *      node import-to-firebase.mjs --dry-run
 *
 *   2. 正式匯入：
 *      node import-to-firebase.mjs \
 *        --key ./service-account.json \
 *        --bucket <your-bucket-name>
 *      (或透過環境變數 GOOGLE_APPLICATION_CREDENTIALS 與 FIREBASE_STORAGE_BUCKET)
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import yaml from "js-yaml"
import { cert, initializeApp } from "firebase-admin/app"
import { FieldValue, getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "..")
const DEFAULT_CONTENT_DIR = path.join(REPO_ROOT, "content")

function parseArgs(argv) {
  const args = {
    dryRun: false,
    keyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    bucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    databaseId: process.env.FIRESTORE_DATABASE_ID || "",
    contentDir: DEFAULT_CONTENT_DIR,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === "--dry-run") {
      args.dryRun = true
    } else if (token === "--key" && argv[i + 1]) {
      args.keyPath = argv[++i]
    } else if (token === "--bucket" && argv[i + 1]) {
      args.bucket = argv[++i]
    } else if (token === "--database" && argv[i + 1]) {
      args.databaseId = argv[++i]
    } else if (token === "--content-dir" && argv[i + 1]) {
      args.contentDir = path.resolve(argv[++i])
    } else if (token === "--help" || token === "-h") {
      printUsage()
      process.exit(0)
    }
  }
  return args
}

function printUsage() {
  console.log(`
Portfolio YAML -> Firebase 匯入工具

用法：
  node import-to-firebase.mjs --dry-run
  node import-to-firebase.mjs --key <service-account.json> --bucket <storage-bucket>

選項：
  --dry-run             僅解析並顯示匯入內容，不連線寫入 Firebase
  --key <path>          Firebase Service Account JSON 路徑 (或設 GOOGLE_APPLICATION_CREDENTIALS)
  --bucket <name>       Firebase Storage Bucket 名稱，例如 xxx.firebasestorage.app 或 xxx.appspot.com
                        (或設 FIREBASE_STORAGE_BUCKET)
  --database <id>       Firestore Database ID（預設為 "(default)"；若你建立時有自訂名稱請指定此項）
  --content-dir <dir>   content 資料夾路徑 (預設為 ../content)
`)
}

function readYamlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[WARN] 找不到檔案，略過：${filePath}`)
    return null
  }
  const raw = fs.readFileSync(filePath, "utf8")
  return yaml.load(raw)
}

function strOrNull(val) {
  if (val === undefined || val === null) return null
  const s = String(val).trim()
  return s === "" ? null : s
}

function strArray(val) {
  if (!Array.isArray(val)) return []
  return val.map(v => String(v))
}

function normalizeImagePath(val) {
  const s = strOrNull(val)
  if (!s) return null
  return s.replace(/^\/+/, "")
}

function normalizeProfile(raw) {
  const item = Array.isArray(raw) ? raw[0] : raw
  if (!item || typeof item !== "object") {
    throw new Error("profile.yaml 格式無效")
  }
  const budget = item.budget || {}
  return {
    initials: strOrNull(item.initials) || "",
    name: strOrNull(item.name) || "",
    fullname: strOrNull(item.fullname) || "",
    profession: strOrNull(item.profession) || "",
    image: normalizeImagePath(item.image),
    location: strOrNull(item.location) || "",
    relocation: Boolean(item.relocation),
    company: strOrNull(item.company) || "",
    for_hire: Boolean(item.for_hire),
    focus: strOrNull(item.focus) || "",
    focus_url: strOrNull(item.focus_url),
    about: typeof item.about === "string" ? item.about.trimEnd() : "",
    skills: strArray(item.skills),
    tools: strArray(item.tools),
    budget: {
      currency: strOrNull(budget.currency) || "$",
      min: Number(budget.min ?? 0),
      max: Number(budget.max ?? 0),
      default: Number(budget.default ?? 0),
    },
  }
}

function normalizeSocial(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(item => item && item.name)
    .map((item, idx) => ({
      docId: String(item.name).trim().toLowerCase(),
      data: {
        order: idx,
        name: String(item.name).trim().toLowerCase(),
        url: strOrNull(item.url),
      },
    }))
}

function normalizeWorkHistory(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(item => item && item.company)
    .map((item, idx) => ({
      docId: `work-${String(idx + 1).padStart(3, "0")}`,
      data: {
        order: idx,
        company: String(item.company).trim(),
        department: strOrNull(item.department),
        position: strOrNull(item.position),
        fromtime: strOrNull(item.fromtime),
        totime: strOrNull(item.totime),
        url: strOrNull(item.url),
        label: strOrNull(item.label) || "all",
        selection: Boolean(item.selection),
        notes: strArray(item.notes),
      },
    }))
}

function normalizeProjects(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(item => item && item.name)
    .map((item, idx) => ({
      docId: `proj-${String(idx + 1).padStart(3, "0")}`,
      data: {
        order: idx,
        name: String(item.name).trim(),
        description:
          typeof item.description === "string" ? item.description.trim() : "",
        selection: Boolean(item.selection),
        status: strOrNull(item.status),
        position: strOrNull(item.position),
        tags: strArray(item.tags),
        image: normalizeImagePath(item.image),
        url: strArray(item.url),
        awards: strArray(item.awards),
        exhibitions: strArray(item.exhibitions),
      },
    }))
}

function normalizePublications(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(item => item && item.title)
    .map((item, idx) => ({
      docId: `pub-${String(idx + 1).padStart(3, "0")}`,
      data: {
        order: idx,
        title: String(item.title).trim(),
        authors: strOrNull(item.authors) || "",
        proceedings: strOrNull(item.proceedings),
        published: strOrNull(item.published),
        selection: Boolean(item.selection),
        award: strOrNull(item.award),
        dwlink: strOrNull(item.dwlink),
        videolink: strOrNull(item.videolink),
      },
    }))
}

function collectLocalImages(imagesDir) {
  if (!fs.existsSync(imagesDir)) {
    console.warn(`[WARN] 找不到圖片目錄，略過：${imagesDir}`)
    return []
  }
  return fs
    .readdirSync(imagesDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && !entry.name.startsWith("."))
    .map(entry => ({
      localPath: path.join(imagesDir, entry.name),
      storagePath: `images/${entry.name}`,
      sizeBytes: fs.statSync(path.join(imagesDir, entry.name)).size,
    }))
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".webp":
      return "image/webp"
    case ".gif":
      return "image/gif"
    case ".svg":
      return "image/svg+xml"
    default:
      return "application/octet-stream"
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  console.log(`讀取來源目錄：${args.contentDir}`)

  const rawProfile = readYamlFile(path.join(args.contentDir, "profile.yaml"))
  const rawSocial = readYamlFile(path.join(args.contentDir, "social.yaml"))
  const rawWork = readYamlFile(
    path.join(args.contentDir, "work-historyMod.yaml")
  )
  const rawProjects = readYamlFile(
    path.join(args.contentDir, "projectsMod.yaml")
  )
  const rawPubs = readYamlFile(path.join(args.contentDir, "publications.yaml"))

  const profile = rawProfile ? normalizeProfile(rawProfile) : null
  const social = rawSocial ? normalizeSocial(rawSocial) : []
  const workHistory = rawWork ? normalizeWorkHistory(rawWork) : []
  const projects = rawProjects ? normalizeProjects(rawProjects) : []
  const publications = rawPubs ? normalizePublications(rawPubs) : []
  const images = collectLocalImages(path.join(args.contentDir, "images"))

  console.log("\n=== 解析摘要 ===")
  console.log(`- siteConfig/profile : ${profile ? 1 : 0} 筆`)
  console.log(`- social             : ${social.length} 筆`)
  console.log(`- workHistory        : ${workHistory.length} 筆`)
  console.log(`- projects           : ${projects.length} 筆`)
  console.log(`- publications       : ${publications.length} 筆`)
  console.log(`- Storage images/    : ${images.length} 個檔案`)

  if (args.dryRun) {
    console.log("\n[DRY-RUN] 預覽內容（未寫入 Firebase）：")
    console.log("siteConfig/profile:", JSON.stringify(profile, null, 2))
    console.log("social[0..1]:", JSON.stringify(social.slice(0, 2), null, 2))
    console.log(
      "workHistory[0]:",
      JSON.stringify(workHistory[0] || null, null, 2)
    )
    console.log("projects[0]:", JSON.stringify(projects[0] || null, null, 2))
    console.log(
      "publications[0]:",
      JSON.stringify(publications[0] || null, null, 2)
    )
    console.log("images:", images)
    return
  }

  if (!args.keyPath) {
    throw new Error(
      "請指定 Service Account JSON 路徑（--key <path> 或環境變數 GOOGLE_APPLICATION_CREDENTIALS）"
    )
  }

  const resolvedKeyPath = path.resolve(args.keyPath)
  if (!fs.existsSync(resolvedKeyPath)) {
    throw new Error(`找不到 Service Account 金鑰檔：${resolvedKeyPath}`)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedKeyPath, "utf8"))
  const storageBucket =
    args.bucket || `${serviceAccount.project_id}.firebasestorage.app`

  console.log(`\n連線 Firebase 專案：${serviceAccount.project_id}`)
  console.log(`目標 Firestore Database：${args.databaseId || "(default)"}`)
  console.log(`目標 Storage Bucket：${storageBucket}`)

  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket,
  })

  const db = args.databaseId
    ? getFirestore(app, args.databaseId)
    : getFirestore(app)
  const bucket = getStorage(app).bucket()
  const timestamp = FieldValue.serverTimestamp()

  const batch = db.batch()
  if (profile) {
    batch.set(db.collection("siteConfig").doc("profile"), {
      ...profile,
      updatedAt: timestamp,
    })
  }
  for (const item of social) {
    batch.set(db.collection("social").doc(item.docId), {
      ...item.data,
      updatedAt: timestamp,
    })
  }
  for (const item of workHistory) {
    batch.set(db.collection("workHistory").doc(item.docId), {
      ...item.data,
      updatedAt: timestamp,
    })
  }
  for (const item of projects) {
    batch.set(db.collection("projects").doc(item.docId), {
      ...item.data,
      updatedAt: timestamp,
    })
  }
  for (const item of publications) {
    batch.set(db.collection("publications").doc(item.docId), {
      ...item.data,
      updatedAt: timestamp,
    })
  }

  try {
    await batch.commit()
    console.log("✓ Firestore 文件寫入完成")
  } catch (err) {
    if (err?.code === 5 || String(err?.message || "").includes("NOT_FOUND")) {
      throw new Error(
        `Firestore 回傳 5 NOT_FOUND（找不到資料庫 "${args.databaseId || "(default)"}"）。請確認：\n` +
          `1) 已在 Firebase Console -> Build -> Firestore Database 點擊「Create database」建立資料庫；\n` +
          `2) 若建立時有自訂 Database ID（非 "(default)"），請加上 --database <資料庫ID> 參數重跑。`
      )
    }
    throw err
  }

  for (const img of images) {
    await bucket.upload(img.localPath, {
      destination: img.storagePath,
      metadata: {
        contentType: guessContentType(img.localPath),
      },
    })
    console.log(
      `✓ 已上傳圖片：${img.storagePath} (${(img.sizeBytes / 1024 / 1024).toFixed(2)} MB)`
    )
  }

  console.log("\n全部匯入完成！")
}

main().catch(err => {
  console.error("\n[ERROR]", err.message || err)
  process.exit(1)
})
