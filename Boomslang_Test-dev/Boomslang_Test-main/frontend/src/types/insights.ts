export interface InsightItem {
  key: string
  label: string
  count: number
  href?: string
  category?: string
}

export interface InsightSection {
  module: string
  title: string
  items: InsightItem[]
}

export interface MyInsightsResponse {
  sections: InsightSection[]
}
