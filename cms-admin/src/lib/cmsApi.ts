import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore"
import {
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage"
import { db, storage } from "./firebase"
import type {
  ProfileData,
  ProjectItem,
  PublicationItem,
  SocialItem,
  StorageImageEntry,
  WorkHistoryItem,
  WorkHistoryLabel,
} from "../types/portfolio"

function requireDb() {
  if (!db) throw new Error("Firestore 尚未初始化")
  return db
}

function requireStorage() {
  if (!storage) throw new Error("Firebase Storage 尚未初始化")
  return storage
}

function strOrNull(val: unknown): string | null {
  if (val === undefined || val === null) return null
  const s = String(val).trim()
  return s === "" ? null : s
}

function strArray(val: unknown): string[] {
  if (!Array.isArray(val)) return []
  return val.map(v => String(v))
}

export async function fetchProfile(): Promise<ProfileData> {
  const firestore = requireDb()
  const snap = await getDoc(doc(firestore, "siteConfig", "profile"))
  const d = snap.exists() ? snap.data() : {}
  const budget = (d.budget as Record<string, unknown>) || {}
  return {
    initials: String(d.initials || ""),
    name: String(d.name || ""),
    fullname: String(d.fullname || ""),
    profession: String(d.profession || ""),
    image: strOrNull(d.image),
    location: String(d.location || ""),
    relocation: Boolean(d.relocation),
    company: String(d.company || ""),
    for_hire: Boolean(d.for_hire),
    focus: String(d.focus || ""),
    focus_url: strOrNull(d.focus_url),
    about: typeof d.about === "string" ? d.about : "",
    skills: strArray(d.skills),
    tools: strArray(d.tools),
    budget: {
      currency: String(budget.currency || "$"),
      min: Number(budget.min ?? 0),
      max: Number(budget.max ?? 0),
      default: Number(budget.default ?? 0),
    },
  }
}

export async function saveProfile(data: ProfileData): Promise<void> {
  const firestore = requireDb()
  await setDoc(doc(firestore, "siteConfig", "profile"), {
    initials: data.initials.trim(),
    name: data.name.trim(),
    fullname: data.fullname.trim(),
    profession: data.profession.trim(),
    image: strOrNull(data.image),
    location: data.location.trim(),
    relocation: Boolean(data.relocation),
    company: data.company.trim(),
    for_hire: Boolean(data.for_hire),
    focus: data.focus.trim(),
    focus_url: strOrNull(data.focus_url),
    about: data.about,
    skills: data.skills.map(s => s.trim()).filter(Boolean),
    tools: data.tools.map(t => t.trim()).filter(Boolean),
    budget: {
      currency: data.budget.currency.trim() || "$",
      min: Number(data.budget.min) || 0,
      max: Number(data.budget.max) || 0,
      default: Number(data.budget.default) || 0,
    },
    updatedAt: serverTimestamp(),
  })
}

export async function fetchSocialList(): Promise<SocialItem[]> {
  const firestore = requireDb()
  const snap = await getDocs(
    query(collection(firestore, "social"), orderBy("order", "asc"))
  )
  return snap.docs.map((docSnap, idx) => {
    const d = docSnap.data()
    return {
      id: docSnap.id,
      order: typeof d.order === "number" ? d.order : idx,
      name: String(d.name || docSnap.id),
      url: strOrNull(d.url),
    }
  })
}

export async function saveSocialItem(
  item: Omit<SocialItem, "id">,
  existingId?: string
): Promise<string> {
  const firestore = requireDb()
  const docId = existingId || item.name.trim().toLowerCase()
  const payload = {
    order: item.order,
    name: item.name.trim().toLowerCase(),
    url: strOrNull(item.url),
    updatedAt: serverTimestamp(),
  }
  await setDoc(doc(firestore, "social", docId), payload)
  return docId
}

export async function fetchProjects(): Promise<ProjectItem[]> {
  const firestore = requireDb()
  const snap = await getDocs(
    query(collection(firestore, "projects"), orderBy("order", "asc"))
  )
  return snap.docs.map((docSnap, idx) => {
    const d = docSnap.data()
    return {
      id: docSnap.id,
      order: typeof d.order === "number" ? d.order : idx,
      name: String(d.name || ""),
      description: typeof d.description === "string" ? d.description : "",
      selection: Boolean(d.selection),
      status: strOrNull(d.status),
      position: strOrNull(d.position),
      tags: strArray(d.tags),
      image: strOrNull(d.image),
      url: strArray(d.url),
      awards: strArray(d.awards),
      exhibitions: strArray(d.exhibitions),
    }
  })
}

export async function saveProject(
  item: Omit<ProjectItem, "id">,
  existingId?: string
): Promise<string> {
  const firestore = requireDb()
  const payload = {
    order: item.order,
    name: item.name.trim(),
    description: item.description,
    selection: Boolean(item.selection),
    status: strOrNull(item.status),
    position: strOrNull(item.position),
    tags: item.tags.map(s => s.trim()).filter(Boolean),
    image: strOrNull(item.image),
    url: item.url.map(s => s.trim()).filter(Boolean),
    awards: item.awards.filter(s => s.trim() !== ""),
    exhibitions: item.exhibitions.filter(s => s.trim() !== ""),
    updatedAt: serverTimestamp(),
  }
  if (existingId) {
    await setDoc(doc(firestore, "projects", existingId), payload)
    return existingId
  }
  const refDoc = await addDoc(collection(firestore, "projects"), payload)
  return refDoc.id
}

export async function fetchWorkHistory(): Promise<WorkHistoryItem[]> {
  const firestore = requireDb()
  const snap = await getDocs(
    query(collection(firestore, "workHistory"), orderBy("order", "asc"))
  )
  return snap.docs.map((docSnap, idx) => {
    const d = docSnap.data()
    return {
      id: docSnap.id,
      order: typeof d.order === "number" ? d.order : idx,
      company: String(d.company || ""),
      department: strOrNull(d.department),
      position: strOrNull(d.position),
      fromtime: strOrNull(d.fromtime),
      totime: strOrNull(d.totime),
      url: strOrNull(d.url),
      label: (strOrNull(d.label) || "all") as WorkHistoryLabel,
      selection: Boolean(d.selection),
      notes: strArray(d.notes),
    }
  })
}

export async function saveWorkHistoryItem(
  item: Omit<WorkHistoryItem, "id">,
  existingId?: string
): Promise<string> {
  const firestore = requireDb()
  const payload = {
    order: item.order,
    company: item.company.trim(),
    department: strOrNull(item.department),
    position: strOrNull(item.position),
    fromtime: strOrNull(item.fromtime),
    totime: strOrNull(item.totime),
    url: strOrNull(item.url),
    label: item.label || "all",
    selection: Boolean(item.selection),
    notes: item.notes.map(s => s.trim()).filter(Boolean),
    updatedAt: serverTimestamp(),
  }
  if (existingId) {
    await setDoc(doc(firestore, "workHistory", existingId), payload)
    return existingId
  }
  const refDoc = await addDoc(collection(firestore, "workHistory"), payload)
  return refDoc.id
}

export async function fetchPublications(): Promise<PublicationItem[]> {
  const firestore = requireDb()
  const snap = await getDocs(
    query(collection(firestore, "publications"), orderBy("order", "asc"))
  )
  return snap.docs.map((docSnap, idx) => {
    const d = docSnap.data()
    return {
      id: docSnap.id,
      order: typeof d.order === "number" ? d.order : idx,
      title: String(d.title || ""),
      authors: String(d.authors || ""),
      proceedings: strOrNull(d.proceedings),
      published: strOrNull(d.published),
      selection: Boolean(d.selection),
      award: strOrNull(d.award),
      dwlink: strOrNull(d.dwlink),
      videolink: strOrNull(d.videolink),
    }
  })
}

export async function savePublication(
  item: Omit<PublicationItem, "id">,
  existingId?: string
): Promise<string> {
  const firestore = requireDb()
  const payload = {
    order: item.order,
    title: item.title.trim(),
    authors: item.authors.trim(),
    proceedings: strOrNull(item.proceedings),
    published: strOrNull(item.published),
    selection: Boolean(item.selection),
    award: strOrNull(item.award),
    dwlink: strOrNull(item.dwlink),
    videolink: strOrNull(item.videolink),
    updatedAt: serverTimestamp(),
  }
  if (existingId) {
    await setDoc(doc(firestore, "publications", existingId), payload)
    return existingId
  }
  const refDoc = await addDoc(collection(firestore, "publications"), payload)
  return refDoc.id
}

export async function deleteCollectionDoc(
  collectionName: "social" | "projects" | "workHistory" | "publications",
  docId: string
): Promise<void> {
  const firestore = requireDb()
  await deleteDoc(doc(firestore, collectionName, docId))
}

export async function updateCollectionOrder(
  collectionName: "social" | "projects" | "workHistory" | "publications",
  orderedIds: string[]
): Promise<void> {
  const firestore = requireDb()
  const batch = writeBatch(firestore)
  orderedIds.forEach((id, index) => {
    batch.update(doc(firestore, collectionName, id), {
      order: index,
      updatedAt: serverTimestamp(),
    })
  })
  await batch.commit()
}

export async function resolveStorageImageUrl(
  storagePath: string | null
): Promise<string | null> {
  if (!storagePath) return null
  const st = requireStorage()
  const clean = storagePath.replace(/^\/+/, "")
  return getDownloadURL(ref(st, clean))
}

export async function listStorageImages(): Promise<StorageImageEntry[]> {
  const st = requireStorage()
  const listRes = await listAll(ref(st, "images"))
  const entries = await Promise.all(
    listRes.items.map(async itemRef => ({
      path: itemRef.fullPath,
      name: itemRef.name,
      url: await getDownloadURL(itemRef),
    }))
  )
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function uploadStorageImage(
  file: File
): Promise<StorageImageEntry> {
  const st = requireStorage()
  if (!file.type.startsWith("image/")) {
    throw new Error("僅支援上傳圖片檔案（image/*）")
  }
  if (file.size >= 15 * 1024 * 1024) {
    throw new Error("圖片大小不可超過 15 MB")
  }
  const safeName = file.name.replace(/[/\\?#%]/g, "_")
  const storagePath = `images/${safeName}`
  const fileRef = ref(st, storagePath)
  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  return {
    path: storagePath,
    name: safeName,
    url,
  }
}
