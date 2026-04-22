// ERP Module Types

export interface Equipment {
  id: string
  internalCode: string
  make?: string
  model?: string
  serialNumber?: string
  category?: string
  sliceConfig?: string
  fieldStrength?: string
  conditionGrade?: string
  status: string
  warehouseLocation?: string
  acquisitionCost?: number
  acquisitionCurrency?: string
  askingPrice?: number
  askingCurrency?: string
  yearOfManufacture?: number
  hoursOfUse?: number
  tgaCompliant?: boolean
  ceMarked?: boolean
  fdaCleared?: boolean
  locationCountry?: string
  software?: string
  softwareVersion?: string
  tubeType?: string
  installedOptions?: string
  detectorSize?: string
  tubeReplaced?: string
  tubeScanSeconds?: number
  numRxChannels?: number
  coils?: string
  choiceOfProbes?: string
  tubeManufactured?: string
  flatDetectorManufactured?: string
  notes?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface SparePart {
  id: string
  partNumber: string
  name: string
  description?: string
  category?: string
  compatibleModels?: string[]
  stockQty: number
  reorderPoint?: number
  unitCost?: number
  currency?: string
  supplierId?: string
  warehouseLocation?: string
  manufacturer?: string
  locationCountry?: string
  yearOfManufacture?: number
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  id: string
  companyName: string
  country?: string
  contactName?: string
  email?: string
  phone?: string
  supplierType?: string
  paymentTerms?: string
  paymentMethod?: string
  currency?: string
  active?: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  equipmentId?: string
  sparePartId?: string
  description: string
  quantity: number
  unitPrice?: number
  lineTotal?: number
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  poDate?: string
  supplierId: string
  status: string
  orderDate?: string
  expectedDelivery?: string
  actualDelivery?: string
  currency?: string
  totalAmount?: number
  paymentMethod?: string
  paymentTerms?: string
  shippingDocs?: string[]
  notes?: string
  items?: PurchaseOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface SalesOrderItem {
  id: string
  equipmentId?: string
  quantity: number
  unitPrice?: number
  lineTotal?: number
  createdAt: string
  updatedAt: string
}

export interface SalesOrder {
  id: string
  soNumber: string
  dealId?: string
  accountId: string
  status: string
  orderDate?: string
  expectedDelivery?: string
  actualDelivery?: string
  currency?: string
  totalAmount?: number
  incoterms?: string
  destinationCountry?: string
  notes?: string
  items?: SalesOrderItem[]
  createdAt: string
  updatedAt: string
}

export interface Warranty {
  id: string
  warrantyId?: string
  equipmentId?: string
  equipmentSku?: string
  soId?: string
  accountId: string
  startDate: string
  endDate: string
  expiryDate?: string
  type: string
  warrantyType?: string
  status: string
  serialNumber?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Shipment {
  id: string
  soId?: string
  poId?: string
  trackingNumber?: string
  carrier?: string
  originCountry?: string
  destinationCountry?: string
  status: string
  shippedDate?: string
  estimatedArrival?: string
  actualArrival?: string
  billOfLadingUrl?: string
  packingListUrl?: string
  customsDeclarationUrl?: string
  freightCost?: number
  currency?: string
  createdAt: string
  updatedAt: string
}

export interface Subcontractor {
  id: string
  companyName: string
  contactName?: string
  email?: string
  phone?: string
  country?: string
  coverageRegions?: string[]
  specialisations?: string[]
  hourlyRate?: number
  currency?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  itemCode: string
  name: string
  description?: string
  category: string
  unitOfMeasure: string
  quantity: number
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  unitPrice: number
  supplierName?: string
  location?: string
  barcode?: string
  sku?: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateInventoryItemRequest {
  itemCode: string
  name: string
  description?: string
  category: string
  unitOfMeasure: string
  quantity: number
  minStockLevel: number
  maxStockLevel: number
  reorderPoint: number
  unitPrice: number
  supplierName?: string
  location?: string
  barcode?: string
  sku?: string
  status: string
}

export interface UpdateInventoryItemRequest {
  id: string
  itemCode?: string
  name?: string
  description?: string
  category?: string
  unitOfMeasure?: string
  quantity?: number
  minStockLevel?: number
  maxStockLevel?: number
  reorderPoint?: number
  unitPrice?: number
  supplierName?: string
  location?: string
  barcode?: string
  sku?: string
  status?: string
}

export type LedgerEntryType =
  | 'RECEIPT'
  | 'ISSUE'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'

export interface InventoryLedgerEntry {
  id: string
  itemId: string
  location?: string
  quantityChange: number
  balanceAfter: number
  entryType: LedgerEntryType
  referenceType?: string
  referenceId?: string
  unitCost?: number
  totalCost?: number
  notes?: string
  transactionAt: string
}

export interface InventoryBin {
  id: string
  itemId: string
  location: string
  onHand: number
  reserved: number
  available: number
  reorderPoint?: number
  minStock?: number
  maxStock?: number
}

export type InventoryTransferStatus = 'DRAFT' | 'POSTED' | 'CANCELLED'

export interface InventoryTransfer {
  id: string
  transferNumber: string
  itemId: string
  fromLocation: string
  toLocation: string
  quantity: number
  status: InventoryTransferStatus
  notes?: string
  postedAt?: string
  createdAt?: string
}

export interface CreateInventoryTransferRequest {
  itemId: string
  fromLocation: string
  toLocation: string
  quantity: number
  notes?: string
}

export type StockAdjustmentType = 'INCREASE' | 'DECREASE'

export interface CreateStockAdjustmentRequest {
  itemId: string
  location: string
  quantity: number
  unitCost?: number
  notes?: string
  adjustmentType: StockAdjustmentType
}

export interface ReorderSuggestion {
  itemId: string
  itemCode: string
  name: string
  currentStock: number
  reorderPoint: number
  maxStockLevel: number
  suggestedQuantity: number
  location?: string
}

export interface Order {
  id: string
  orderNumber: string
  customerId: string
  orderDate: string
  status: string
  totalAmount: number
  shippingAddress?: string
  billingAddress?: string
  notes?: string
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  inventoryItemId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface PurchaseInvoice {
  id: string
  invoiceNumber: string
  orderId?: string
  customerId: string
  invoiceDate: string
  dueDate: string
  status: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  notes?: string
  invoiceItems: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  inventoryItemId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

// Field Work Related Types
export interface FieldJob {
  fieldJobId?: string | number
  id?: string | number
  jobType?: string
  title?: string
  description?: string
  jobDescription?: string
  priority?: 'ROUTINE' | 'URGENT' | 'CRITICAL' | 'EMERGENCY'
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  jobStatus?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  assignedTo?: string
  assignedTechnicianId?: string
  location?: string
  scheduledDate?: string
  completionDate?: string
  dueDate?: string
  lastModified?: string
  estimatedDuration?: number
  actualDuration?: number
  equipmentSku?: string
  createdAt?: string
  updatedAt?: string
}

export interface AssetAudit {
  id?: string
  assetId: string
  auditDate: string
  auditorName: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  completionDate?: string
  findings?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface PurchaseOrderExtended extends PurchaseOrder {
  poDate?: string
  paymentTerms?: string
}

export interface SupplierExtended extends Supplier {
  currency?: string
  paymentMethod?: string
  active?: boolean
}

export interface ServiceTicket {
  id: string
  ticketNumber: string
  title: string
  description?: string
  status: string
  priority: string
  type?: string
  equipmentId?: string
  assignedTo?: string
  customerId: string
  accountId?: string
  subcontractorId?: string
  resolutionNotes?: string
  cost?: number
  reportedDate?: string
  createdAt: string
  updatedAt: string
}
