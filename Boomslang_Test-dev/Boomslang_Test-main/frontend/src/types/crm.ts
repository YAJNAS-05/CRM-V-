export interface Account {
  id: string
  name: string
  industry?: string
  accountType?: string
  website?: string
  phone?: string
  email?: string
  billingStreet?: string
  billingCity?: string
  billingState?: string
  billingZip?: string
  billingCountry?: string
  annualRevenue?: number
  employees?: number
  description?: string
  ownerId?: string
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  accountId?: string
  salutation?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobile?: string
  jobTitle?: string
  department?: string
  gender?: string
  dateOfBirth?: string
  leadSource?: string
  mailingStreet?: string
  mailingCity?: string
  mailingState?: string
  mailingZip?: string
  mailingCountry?: string
  linkedinUrl?: string
  twitterHandle?: string
  description?: string
  doNotCall?: boolean
  emailOptOut?: boolean
  ownerId?: string
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  salutation?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobile?: string
  company?: string
  jobTitle?: string
  leadSource?: string
  status: string
  rating?: number
  website?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  annualRevenue?: number
  employees?: number
  description?: string
  isConverted?: boolean
  convertedAt?: string
  convertedContactId?: string
  convertedAccountId?: string
  convertedDealId?: string
  ownerId?: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  name: string
  stage: string
  amount?: number
  probability?: number
  expectedCloseDate?: string
  actualCloseDate?: string
  leadSource?: string
  accountId?: string
  primaryContactId?: string
  description?: string
  lossReason?: string
  nextStep?: string
  campaignSource?: string
  ownerId?: string
  createdAt: string
  updatedAt: string
}

export interface QuoteLineItem {
  id: string
  quoteId: string
  equipmentId?: string
  description: string
  quantity: number
  unitPrice: number
  discountPct?: number
  lineTotal: number
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: string
  dealId: string
  quoteNumber: string
  version: number
  status: string
  issuedDate: string
  expiryDate: string
  currency: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  terms?: string
  pdfUrl?: string
  lineItems: QuoteLineItem[]
  createdAt: string
  updatedAt: string
}

export interface CreateAccountRequest {
  name: string
  industry?: string
  accountType?: string
  website?: string
  phone?: string
  email?: string
  billingStreet?: string
  billingCity?: string
  billingState?: string
  billingZip?: string
  billingCountry?: string
  annualRevenue?: number
  employees?: number
  description?: string
  ownerId?: string
}

export interface CreateContactRequest {
  accountId?: string
  salutation?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobile?: string
  jobTitle?: string
  department?: string
  gender?: string
  dateOfBirth?: string
  leadSource?: string
  mailingStreet?: string
  mailingCity?: string
  mailingState?: string
  mailingZip?: string
  mailingCountry?: string
  linkedinUrl?: string
  twitterHandle?: string
  description?: string
  doNotCall?: boolean
  emailOptOut?: boolean
  ownerId?: string
}

export interface CreateLeadRequest {
  salutation?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  mobile?: string
  company?: string
  jobTitle?: string
  leadSource?: string
  status?: string
  rating?: number
  website?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  annualRevenue?: number
  employees?: number
  description?: string
  ownerId?: string
}

export interface LeadConvertRequest {
  createAccount?: boolean
  accountName?: string
  createDeal?: boolean
  dealName?: string
  dealAmount?: number
  expectedCloseDate?: string
}

export interface CreateDealRequest {
  name: string
  stage?: string
  amount?: number
  probability?: number
  expectedCloseDate?: string
  leadSource?: string
  accountId?: string
  primaryContactId?: string
  description?: string
  nextStep?: string
  campaignSource?: string
  ownerId?: string
}

export interface CreateQuoteRequest {
  dealId: string
  quoteNumber: string
  version: number
  status: string
  issuedDate: string
  expiryDate: string
  currency: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  terms?: string
  pdfUrl?: string
  lineItems: CreateQuoteLineItemRequest[]
}

export interface CreateQuoteLineItemRequest {
  equipmentId?: string
  description: string
  quantity: number
  unitPrice: number
  discountPct?: number
  totalPrice: number
}

export interface Activity {
  id: string
  type: string
  subject?: string
  description?: string
  dueDate?: string
  completedAt?: string
  status?: string
  durationMins?: number
  contactId?: string
  dealId?: string
  leadId?: string
  accountId?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface CreateActivityRequest {
  type: string
  subject?: string
  description?: string
  dueDate?: string
  status?: string
  durationMins?: number
  contactId?: string
  dealId?: string
  leadId?: string
  accountId?: string
  assignedTo?: string
}

export interface ReportDashboardKPIs {
  totalLeads: number
  totalContacts: number
  totalAccounts: number
  totalDeals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  totalPipelineValue: number
  wonValue: number
  winRate: number
  visibilityScope?: 'TEAM' | 'SELF'
  viewerUserId?: string
  teamMemberCount?: number
  userPerformance?: ReportUserPerformance[]
}

export interface ReportUserPerformance {
  userId: string | null
  userName: string
  leads: number
  convertedLeads: number
  deals: number
  openDeals: number
  wonDeals: number
  lostDeals: number
  pipelineValue: number
  activities: number
  completedActivities: number
  overdueActivities: number
  leadConversionRate: number
}

export interface ReportPipeline {
  dealCountByStage: Record<string, number>
  dealValueByStage: Record<string, number>
  totalPipelineValue: number
}

export interface ReportConversion {
  totalLeads: number
  convertedLeads: number
  conversionRate: number
  leadsByStatus: Record<string, number>
  leadsBySource: Record<string, number>
}

export interface ReportActivity {
  totalActivities: number
  completedActivities: number
  pendingActivities: number
  overdueActivities: number
  activitiesByType: Record<string, number>
}

export interface TradeShow {
  id: string
  name: string
  location?: string
  country?: string
  startDate: string
  endDate: string
  attendees?: string[]
  leadsCaptured?: number
  estimatedRoi?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTradeShowRequest {
  name: string
  location?: string
  country?: string
  startDate: string
  endDate: string
  attendees?: string[]
  leadsCaptured?: number
  estimatedRoi?: number
  notes?: string
}
