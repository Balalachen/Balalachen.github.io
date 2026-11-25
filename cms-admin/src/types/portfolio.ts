export interface BudgetConfig {
  currency: string
  min: number
  max: number
  default: number
}

export interface ProfileData {
  initials: string
  name: string
  fullname: string
  profession: string
  image: string | null
  location: string
  relocation: boolean
  company: string
  for_hire: boolean
  focus: string
  focus_url: string | null
  about: string
  skills: string[]
  tools: string[]
  budget: BudgetConfig
}

export const SOCIAL_PLATFORMS = [
  "behance",
  "dribbble",
  "facebook",
  "github",
  "goodreads",
  "instagram",
  "linkedin",
  "medium",
  "producthunt",
  "twitter",
  "youtube",
  "xing",
] as const

export interface SocialItem {
  id: string
  order: number
  name: string
  url: string | null
}

export type WorkHistoryLabel = "all" | "summery" | "list" | "short"

export const WORK_LABEL_OPTIONS: Array<{
  value: WorkHistoryLabel
  label: string
}> = [
  { value: "all", label: "all（側邊欄時間軸 + Experience 列表）" },
  { value: "summery", label: "summery（僅側邊欄時間軸）" },
  { value: "list", label: "list（僅 Experience 列表）" },
  { value: "short", label: "short（Talk / Workshop 列表）" },
]

export interface WorkHistoryItem {
  id: string
  order: number
  company: string
  department: string | null
  position: string | null
  fromtime: string | null
  totime: string | null
  url: string | null
  label: WorkHistoryLabel
  selection: boolean
  notes: string[]
}

export interface ProjectItem {
  id: string
  order: number
  name: string
  description: string
  selection: boolean
  status: string | null
  position: string | null
  tags: string[]
  image: string | null
  url: string[]
  awards: string[]
  exhibitions: string[]
}

export interface PublicationItem {
  id: string
  order: number
  title: string
  authors: string
  proceedings: string | null
  published: string | null
  selection: boolean
  award: string | null
  dwlink: string | null
  videolink: string | null
}

export interface StorageImageEntry {
  path: string
  name: string
  url: string
}
