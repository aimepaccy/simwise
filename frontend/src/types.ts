export type SessionStatus = 'processing' | 'draft' | 'published'

export type SourceKind = 'debrief' | 'slides' | 'sim card' | 'document'

/** One point of teaching, always tied to the words it came from. */
export type Point = {
  text: string
  quote: string
  source: SourceKind
}

export type Reading = {
  title: string
  site: 'StatPearls' | 'PubMed' | 'Wikipedia' | 'Radiopaedia'
  url: string
}

export type TeachingOutput = {
  overview: string
  objectives: string[]
  wentWell: Point[]
  improve: Point[]
  teachingPoints: Point[]
  reading: Reading[]
}

export type DocumentItem = {
  name: string
  kind: 'pptx' | 'pdf' | 'docx' | 'photo'
}

export type DebriefSession = {
  id: string
  title: string
  scenario: string
  cohort: string
  date: string
  durationMin: number
  participants: number
  status: SessionStatus
  documents: DocumentItem[]
  themes: string[]
  output?: TeachingOutput
  shareToken?: string
}
