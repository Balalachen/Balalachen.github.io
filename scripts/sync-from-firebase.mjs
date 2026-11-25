#!/usr/bin/env node
/**
 * 從 Firebase Firestore 與 Cloud Storage 同步資料並輸出為 Gatsby 所需的 content/ 格式。
 *
 * 使用方式：
 *   1. 本地測試（使用金鑰檔）：
 *      node sync-from-firebase.mjs --key ./service-account.json --database portfolio --bucket portfolio-admin-fe051.firebasestorage.app
 *
 *   2. CI 環境（透過環境變數 FIREBASE_SERVICE_ACCOUNT_JSON）：
 *      FIREBASE_SERVICE_ACCOUNT_JSON='{"type":...}' node sync-from-firebase.mjs --database portfolio --bucket portfolio-admin-fe051.firebasestorage.app
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import yaml from "js-yaml"
import { cert, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "..")
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, "content")

function parseArgs(argv) {
  const args = {
    keyPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
    keyJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "",
    bucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    databaseId: process.env.FIRESTORE_DATABASE_ID || "",
    outDir: DEFAULT_OUT_DIR,
    dryRun: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (token === "--key" && argv[i + 1]) {
      args.keyPath = argv[++i]
    } else if (token === "--bucket" && argv[i + 1]) {
      args.bucket = argv[++i]
    } else if (token === "--database" && argv[i + 1]) {
      args.databaseId = argv[++i]
    } else if (token === "--out-dir" && argv[i + 1]) {
      args.outDir = path.resolve(argv[++i])
    } else if (token === "--dry-run") {
      args.dryRun = true
    } else if (token === "--help" || token === "-h") {
      printUsage()
      process.exit(0)
    }
  }
  return args
}

function printUsage() {
  console.log(`
Firebase -> Gatsby content/ 同步工具

用法：
  node sync-from-firebase.mjs --key ./service-account.json --database portfolio --bucket <bucket>

選項：
  --key <path>        Service Account JSON 檔案路徑 (或設 GOOGLE_APPLICATION_CREDENTIALS / FIREBASE_SERVICE_ACCOUNT_JSON)
  --database <id>     Firestore Database ID（預設為 "(default)"，或設 FIRESTORE_DATABASE_ID）
  --bucket <name>     Storage Bucket 名稱（或設 FIREBASE_STORAGE_BUCKET）
  --out-dir <dir>     輸出目錄（預設為 ../content）
  --dry-run           僅連線讀取並印出摘要，不寫入檔案或下載圖片
`)
}

function loadServiceAccount(args) {
  if (args.keyJson && args.keyJson.trim()) {
    return JSON.parse(args.keyJson)
  }
  if (args.keyPath) {
    const resolved = path.resolve(args.keyPath)
    if (!fs.existsSync(resolved)) {
      throw new Error(`找不到 Service Account 金鑰檔：${resolved}`)
    }
    return JSON.parse(fs.readFileSync(resolved, "utf8"))
  }
  throw new Error(
    "請提供 Firebase Service Account 金鑰（--key <path> 或環境變數 FIREBASE_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS）"
  )
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

function nonEmptyArrayOrNull(val) {
  if (!Array.isArray(val) || val.length === 0) return null
  return val.map(v => String(v))
}

function normalizeImagePath(val) {
  const s = strOrNull(val)
  if (!s) return null
  return s.replace(/^\/+/, "")
}

function dumpYaml(data) {
  return yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
  })
}

async function fetchOrderedCollection(db, name) {
  const snapshot = await db.collection(name).orderBy("order", "asc").get()
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const serviceAccount = loadServiceAccount(args)
  const storageBucket =
    args.bucket || `${serviceAccount.project_id}.firebasestorage.app`

  console.log(`連線 Firebase 專案：${serviceAccount.project_id}`)
  console.log(`讀取 Firestore Database：${args.databaseId || "(default)"}`)
  console.log(`讀取 Storage Bucket：${storageBucket}`)

  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket,
  })

  const db = args.databaseId
    ? getFirestore(app, args.databaseId)
    : getFirestore(app)
  const bucket = getStorage(app).bucket()

  const profileSnap = await db.collection("siteConfig").doc("profile").get()
  if (!profileSnap.exists) {
    throw new Error("Firestore 找不到 siteConfig/profile 文件")
  }
  const rawProfile = profileSnap.data()

  const [rawSocial, rawWorkHistory, rawProjects, rawPublications] =
    await Promise.all([
      fetchOrderedCollection(db, "social"),
      fetchOrderedCollection(db, "workHistory"),
      fetchOrderedCollection(db, "projects"),
      fetchOrderedCollection(db, "publications"),
    ])

  const profileImage = normalizeImagePath(rawProfile.image)
  const budget = rawProfile.budget || {}

  // gatsby-transformer-yaml 預期 profile.yaml 為單元素陣列
  const profileYamlData = [
    {
      profile: null,
      initials: strOrNull(rawProfile.initials) || "",
      name: strOrNull(rawProfile.name) || "",
      fullname: strOrNull(rawProfile.fullname) || "",
      profession: strOrNull(rawProfile.profession) || "",
      image: profileImage,
      location: strOrNull(rawProfile.location) || "",
      relocation: Boolean(rawProfile.relocation),
      company: strOrNull(rawProfile.company) || "",
      for_hire: Boolean(rawProfile.for_hire),
      focus: strOrNull(rawProfile.focus) || "",
      focus_url: strOrNull(rawProfile.focus_url),
      about: typeof rawProfile.about === "string" ? rawProfile.about : "",
      skills: strArray(rawProfile.skills),
      tools: strArray(rawProfile.tools),
      budget: {
        currency: strOrNull(budget.currency) || "$",
        min: Number(budget.min ?? 0),
        max: Number(budget.max ?? 0),
        default: Number(budget.default ?? 0),
      },
    },
  ]

  const socialYamlData = rawSocial.map(d => ({
    name: strOrNull(d.name) || "",
    url: strOrNull(d.url),
  }))

  const workHistoryYamlData = rawWorkHistory.map(d => ({
    selection: Boolean(d.selection),
    company: strOrNull(d.company) || "",
    department: strOrNull(d.department),
    position: strOrNull(d.position),
    totime: strOrNull(d.totime),
    fromtime: strOrNull(d.fromtime),
    url: strOrNull(d.url),
    label: strOrNull(d.label) || "all",
    notes: nonEmptyArrayOrNull(d.notes),
  }))

  const projectsYamlData = rawProjects.map(d => ({
    selection: Boolean(d.selection),
    name: strOrNull(d.name) || "",
    position: strOrNull(d.position),
    description: typeof d.description === "string" ? d.description : "",
    status: strOrNull(d.status),
    tags: nonEmptyArrayOrNull(d.tags),
    image: normalizeImagePath(d.image),
    awards: nonEmptyArrayOrNull(d.awards),
    exhibitions: nonEmptyArrayOrNull(d.exhibitions),
    url: nonEmptyArrayOrNull(d.url),
  }))

  const publicationsYamlData = rawPublications.map(d => ({
    selection: Boolean(d.selection),
    title: strOrNull(d.title) || "",
    authors: strOrNull(d.authors) || "",
    proceedings: strOrNull(d.proceedings),
    published: strOrNull(d.published),
    award: strOrNull(d.award),
    dwlink: strOrNull(d.dwlink),
    videolink: strOrNull(d.videolink),
  }))

  const referencedImages = new Set()
  if (profileImage) referencedImages.add(profileImage)
  for (const proj of projectsYamlData) {
    if (proj.image) referencedImages.add(proj.image)
  }

  console.log("\n=== 讀取摘要 ===")
  console.log(`- profile.yaml         : 1 筆`)
  console.log(`- social.yaml          : ${socialYamlData.length} 筆`)
  console.log(`- work-historyMod.yaml : ${workHistoryYamlData.length} 筆`)
  console.log(`- projectsMod.yaml     : ${projectsYamlData.length} 筆`)
  console.log(`- publications.yaml    : ${publicationsYamlData.length} 筆`)
  console.log(`- 引用圖片              : ${referencedImages.size} 個檔案`)

  if (args.dryRun) {
    console.log("\n[DRY-RUN] 完成讀取檢查，未寫入本地檔案。")
    return
  }

  fs.mkdirSync(args.outDir, { recursive: true })
  fs.mkdirSync(path.join(args.outDir, "images"), { recursive: true })

  fs.writeFileSync(
    path.join(args.outDir, "profile.yaml"),
    dumpYaml(profileYamlData),
    "utf8"
  )
  fs.writeFileSync(
    path.join(args.outDir, "social.yaml"),
    dumpYaml(socialYamlData),
    "utf8"
  )
  fs.writeFileSync(
    path.join(args.outDir, "work-historyMod.yaml"),
    dumpYaml(workHistoryYamlData),
    "utf8"
  )
  fs.writeFileSync(
    path.join(args.outDir, "projectsMod.yaml"),
    dumpYaml(projectsYamlData),
    "utf8"
  )
  fs.writeFileSync(
    path.join(args.outDir, "publications.yaml"),
    dumpYaml(publicationsYamlData),
    "utf8"
  )
  console.log(`✓ YAML 檔案已寫入：${args.outDir}`)

  for (const storagePath of referencedImages) {
    const destPath = path.join(args.outDir, storagePath)
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
    const file = bucket.file(storagePath)
    const [exists] = await file.exists()
    if (!exists) {
      throw new Error(`Firebase Storage 找不到被引用的圖片：${storagePath}`)
    }
    await file.download({ destination: destPath })
    console.log(`✓ 已下載圖片：${storagePath}`)
  }

  console.log("\n全部同步完成！")
}

main().catch(err => {
  console.error("\n[ERROR]", err.message || err)
  process.exit(1)
})
