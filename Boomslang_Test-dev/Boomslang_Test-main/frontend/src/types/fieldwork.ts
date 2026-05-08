// File: src/types/fieldwork.ts
// Field Work Management System TypeScript Types
// Generated from backend spec - provides type safety for all FW operations

export enum FieldJobType {
  SITE_ASSESSMENT = 'SITE_ASSESSMENT',
  DE_INSTALLATION = 'DE_INSTALLATION',
  INSTALLATION = 'INSTALLATION',
  PPM = 'PPM',
  REPAIR = 'REPAIR'
}

export enum FieldJobStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_PARTS = 'PENDING_PARTS',
  PENDING_CUSTOMER_APPROVAL = 'PENDING_CUSTOMER_APPROVAL',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REVERTED = 'REVERTED',
  PENDING_SIGN_OFF = 'PENDING_SIGN_OFF'
}

export enum EngineerType {
  INTERNAL = 'INTERNAL',
  SUBCONTRACTOR = 'SUBCONTRACTOR'
}

export enum TravelMode {
  FLIGHT = 'FLIGHT',
  ROAD = 'ROAD',
  RAIL = 'RAIL',
  LOCAL = 'LOCAL'
}

export enum ChecklistResult {
  PASS = 'PASS',
  FAIL = 'FAIL',
  NA = 'NA',
  OBSERVATION = 'OBSERVATION'
}

export enum SignOffStatus {
  NOT_OBTAINED = 'NOT_OBTAINED',
  OBTAINED = 'OBTAINED',
  DISPUTED = 'DISPUTED',
  WAIVED = 'WAIVED'
}

export enum CostCategory {
  LABOUR = 'LABOUR',
  TRAVEL = 'TRAVEL',
  ACCOMMODATION = 'ACCOMMODATION',
  SPARE_PARTS = 'SPARE_PARTS',
  CUSTOMS_DUTY = 'CUSTOMS_DUTY',
  MISC = 'MISC'
}

export enum JobPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY'
}

export type FieldJobId = string | number;

export enum SiteReadiness {
  READY = 'READY',
  PENDING_CIVIL = 'PENDING_CIVIL',
  PENDING_POWER = 'PENDING_POWER',
  PENDING_SHIELDING = 'PENDING_SHIELDING',
  REMEDIATION_REQUIRED = 'REMEDIATION_REQUIRED'
}

// ============================================================================
// MAIN FIELD JOB DTO
// ============================================================================

export interface FieldJobDto {
  id?: string;
  jobNumber: string;
  title: string;
  description?: string;
  status: FieldJobStatus;
  priority: JobPriority;
  category?: string;
  
  // Customer Information
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Location Information
  location: string;
  latitude?: number;
  longitude?: number;
  
  // Scheduling
  scheduledDate?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  completionDate?: string;
  
  // Assignment
  assignedTechnician?: TechnicianDto;
  assignedTechnicianId?: string;
  
  // Financial Information
  estimatedCost?: number;
  actualCost?: number;
  paymentStatus?: string;
  
  // Job Requirements
  requiresParts: boolean;
  requiresSpecialEquipment: boolean;
  weatherDependent: boolean;
  
  // ERP Integration
  erpWorkOrderId?: string;
  crmLeadId?: string;
  crmAccountId?: string;
  
  // Audit
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Legacy compatibility
  fieldJobId?: FieldJobId;
  jobType?: FieldJobType;
  jobStatus?: FieldJobStatus;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  estimatedDurationDays?: number;
  primaryEngineerId?: string;
  primaryEngineerName?: string;
  internalNotes?: string;
  clientBriefNotes?: string;
  siteCity?: string;
  siteCountry?: string;
  clientOrSellerName?: string;
}

// ============================================================================
// TYPE-SPECIFIC DETAIL DTOs
// ============================================================================

export interface SiteAssessmentDetailDto {
  saDetailId?: number;
  fieldJobId: FieldJobId;
  modalityRequested?: string;
  roomWidthMm?: number;
  roomDepthMm?: number;
  roomHeightMm?: number;
  floorLoadCapacityKgM2?: number;
  doorWidthMm?: number;
  powerSupplyVoltage?: string;
  powerSupplyAmps?: number;
  dedicatedCircuit?: boolean;
  hvacCapacityKw?: number;
  shieldingPresent?: boolean;
  shieldingType?: string;
  rfCageRequired?: boolean;
  siteReadinessStatus?: SiteReadiness;
  remedialWorkNeeded?: string;
  estimatedReadyDate?: string;
  sitePhotosAttached?: boolean;
  siteSketchAttached?: boolean;
  assessmentSummary: string;
  recommendedEquipment?: string;
}

export interface DeInstallDetailDto {
  deInstallId?: number;
  fieldJobId: FieldJobId;
  linkedPoId: string;
  equipmentMake?: string;
  equipmentModel?: string;
  serialNumber: string;
  powerDisconnectDate: string;
  dataWipeCompleted?: boolean;
  dataWipeMethod?: string;
  anchoringRemoved?: boolean;
  allComponentsAccounted?: boolean;
  missingComponents?: string;
  packagingType?: string;
  crateCount?: number;
  totalWeightKg?: number;
  readyForCollectionDate?: string;
  carrierHandoverDate?: string;
  conditionAtDeInstall?: string;
  deInstallNotes?: string;
}

export interface InstallationDetailDto {
  installDetailId?: number;
  fieldJobId: FieldJobId;
  linkedSalesOrderId: string;
  linkedShipmentId: string;
  linkedEquipmentSku: string;
  unpackingCompleteDate?: string;
  allComponentsPresent?: boolean;
  missingOnDelivery?: string;
  civilWorkVerified?: boolean;
  powerConnectionDate?: string;
  powerTestPassed?: boolean;
  networkConnectionDone?: boolean;
  physicalInstallDate?: string;
  systemBootSuccessful?: boolean;
  calibrationDate?: string;
  calibrationEngineer: string;
  calibrationCertRef?: string;
  phantomTestCompleted?: boolean;
  imageQualityApproved?: boolean;
  softwareVersion?: string;
  applicationsSoftware?: string;
  staffTrainingDate?: string;
  staffTrainedCount?: number;
  trainingNotes?: string;
  handoverDate: string;
  warrantyStartConfirmed?: string;
  installNotes?: string;
}

export interface PpmDetailDto {
  ppmDetailId?: number;
  fieldJobId: FieldJobId;
  linkedWarrantyId: string;
  linkedEquipmentSku: string;
  ppmType?: string;
  ppmVisitNumber?: number;
  previousPpmDate?: string;
  tubeLifeCheckedPct?: number;
  coolingSystemChecked?: boolean;
  coolingSystemStatus?: ChecklistResult;
  filtersCleaned?: boolean;
  calibrationVerified?: boolean;
  softwareVersionChecked?: boolean;
  softwareCurrentVersion?: string;
  softwareUpdateApplied?: boolean;
  hardwareInspection?: ChecklistResult;
  safetyChecksCompleted?: boolean;
  safetyCheckStandard?: string;
  imageQualityTest?: ChecklistResult;
  partsReplacedDuringPpm?: string;
  findingsSummary: string;
  recommendedActions?: string;
  ppmCertReference?: string;
  ppmCertIssueDate?: string;
  nextPpmRecommendDate?: string;
}

export interface RepairDetailDto {
  repairDetailId?: number;
  fieldJobId: FieldJobId;
  linkedEquipmentSku: string;
  linkedWarrantyId?: string;
  isUnderWarranty?: boolean;
  faultFoundOnSite: string;
  rootCauseCategory?: string;
  rootCauseDescription: string;
  remoteAttemptedFirst?: boolean;
  remoteResolutionResult?: string;
  partsReplaced?: string;
  partsOrdered?: string;
  repairMethodUsed: string;
  testAfterRepair?: ChecklistResult;
  imageQualityPostRepair?: ChecklistResult;
  equipmentStatusPost?: string;
  downtimeHours?: number;
  slaBreached?: boolean;
  repairNotes?: string;
}

// ============================================================================
// SUPPORTING DTOs
// ============================================================================

export interface FieldJobCostDto {
  costId?: number;
  version?: number;
  fieldJobId: FieldJobId;
  costCategory: CostCategory;
  description: string;
  linkedPartId?: string;
  quantity: number;
  unit?: string;
  unitCostAmount: number;
  costCurrency?: string;
  fxRateToUsd?: number;
  totalCostLocal?: number;
  totalCostUsd?: number;
  receiptReference?: string;
  receiptAttached?: Blob;
  glAccount?: string;
  postingDate: string;
  isPaid?: boolean;
  paidDate?: string;
  createdBy?: string;
  createdAt?: string;
  reversalOfCostId?: number;
}

export interface FieldJobChecklistDto {
  checklistId?: number;
  fieldJobId: FieldJobId;
  generatedFromTemplate?: number;
  overallResult?: ChecklistResult;
  completedBy?: string;
  completedAt?: string;
  items?: ChecklistItemDto[];
}

export interface ChecklistItemDto {
  itemInstanceId?: number;
  checklistId: number;
  templateItemId?: number;
  sectionName: string;
  itemText: string;
  result: ChecklistResult;
  engineerNote?: string;
  photoAttached?: boolean;
  photo?: Blob;
}

export interface FieldJobReportDto {
  reportId?: number;
  version?: number;
  fieldJobId: FieldJobId;
  reportNumber?: string;
  reportGeneratedAt?: string;
  reportGeneratedBy?: string;
  jobSummary: string;
  workPerformedSummary: string;
  equipmentCondition?: string;
  postJobEquipmentStatus?: string;
  checklistSummaryResult?: ChecklistResult;
  partsUsedSummary?: string;
  totalJobCostUsd?: number;
  issuesFoundDuringJob?: string;
  recommendationsToClient?: string;
  nextServiceDueDate?: string;
  reportPdfGenerated?: boolean;
  reportPdfDocument?: Blob;
  isLocked?: boolean;
  reversalOfReportId?: number;
  reversalReason?: string;
  reversedAt?: string;
  reversedBy?: string;
}

export interface FieldJobSignOffDto {
  signOffId?: number;
  fieldJobId: FieldJobId;
  reportId: number;
  signOffStatus: SignOffStatus;
  clientRepresentative: string;
  clientDesignation: string;
  signedOffDate: string;
  signedOffTime: string;
  clientSignatureImage?: Blob;
  clientComments?: string;
  clientSatisfaction?: number;
  disputeReason?: string;
  disputeResolution?: string;
  disputeResolvedDate?: string;
  waiverReason?: string;
  waiverApprovedBy?: string;
  everxRepresentative?: string;
  signOffLocation?: string;
  createdAt?: string;
}

export interface FieldJobTravelDto {
  travelId?: number;
  fieldJobId: FieldJobId;
  engineerId: string;
  legNumber?: number;
  travelMode: TravelMode;
  departureCity: string;
  departureCountry?: string;
  departureDatetime: string;
  arrivalCity: string;
  arrivalCountry?: string;
  arrivalDatetime: string;
  flightNumber?: string;
  bookingReference?: string;
  ticketCostAmount?: number;
  ticketCostCurrency?: string;
  accommodationNights?: number;
  accommodationCost?: number;
  accommodationCurrency?: string;
  perDiemDays?: number;
  perDiemRateUsd?: number;
  visaRequired?: boolean;
  visaStatus?: string;
  travelNotes?: string;
}

// ============================================================================
// NEW FIELD WORK DTOs (matching backend implementation)
// ============================================================================

export interface TechnicianDto {
  id?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  profileImageUrl?: string;
  status: TechnicianStatus;
  level: TechnicianLevel;
  skills?: string;
  certifications?: string;
  specializations?: string;
  availableForFieldWork: boolean;
  hasValidDriversLicense: boolean;
  hasVehicle: boolean;
  vehicleInfo?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  currentAddress?: string;
  lastLocationUpdate?: string;
  homeAddress: string;
  homeLatitude?: number;
  homeLongitude?: number;
  workingRegion?: string;
  workingRadiusRadius?: number;
  workStartTime?: string;
  workEndTime?: string;
  availableWeekends: boolean;
  availableHolidays: boolean;
  jobsCompleted: number;
  jobsInProgress: number;
  averageRating?: number;
  totalRatings: number;
  totalEarnings?: number;
  averageJobDuration?: number;
  onTimeCompletionRate?: number;
  customerSatisfactionScore?: number;
  technicalSkills?: string;
  softSkills?: string;
  safetyTraining?: string;
  equipmentTraining?: string;
  assignedEquipment?: string;
  assignedTools?: string;
  assignedVehicle?: string;
  smsNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
  preferredLanguage: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  medicalClearanceValid: boolean;
  medicalClearanceExpiry?: string;
  medicalConditions?: string;
  allergies?: string;
  lastSafetyTraining?: string;
  lastTechnicalTraining?: string;
  trainingRecords?: string;
  gpsTrackingEnabled: boolean;
  locationSharingEnabled: boolean;
  locationUpdateInterval: number;
  hrEmployeeId?: string;
  payrollId?: string;
  badgeNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export enum TechnicianStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED'
}

export enum TechnicianLevel {
  JUNIOR = 'JUNIOR',
  INTERMEDIATE = 'INTERMEDIATE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  MASTER = 'MASTER'
}

export interface GpsLocationDto {
  id?: string;
  technicianId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: string;
  address?: string;
  locationSource: GpsLocationSource;
  locationContext: GpsLocationContext;
  networkType?: GpsNetworkType;
  batteryLevel?: number;
  isCharging?: boolean;
  deviceId?: string;
  appVersion?: string;
  createdAt?: string;
}

export enum GpsLocationSource {
  GPS = 'GPS',
  NETWORK = 'NETWORK',
  PASSIVE = 'PASSIVE',
  MANUAL = 'MANUAL'
}

export enum GpsLocationContext {
  JOB_START = 'JOB_START',
  JOB_END = 'JOB_END',
  TRAVEL = 'TRAVEL',
  BREAK = 'BREAK',
  EMERGENCY = 'EMERGENCY',
  REGULAR = 'REGULAR'
}

export enum GpsNetworkType {
  WIFI = 'WIFI',
  MOBILE = 'MOBILE',
  NONE = 'NONE'
}

export interface FieldWorkAssetDto {
  id?: string;
  assetNumber: string;
  name: string;
  description?: string;
  category: string;
  status: AssetStatus;
  condition: AssetCondition;
  classification: AssetClassification;
  criticality: AssetCriticality;
  location?: string;
  latitude?: number;
  longitude?: number;
  assignedTechnicianId?: string;
  assignedTechnician?: TechnicianDto;
  purchaseDate?: string;
  purchaseCost?: number;
  currentValue?: number;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceInterval?: number;
  usageHours?: number;
  usageCount?: number;
  requiresCalibration: boolean;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  calibrationInterval?: number;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  year?: number;
  specifications?: string;
  safetyRequirements?: string;
  operatingInstructions?: string;
  erpAssetId?: string;
  erpLocation?: string;
  erpStatus?: string;
  lastSyncDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  RETIRED = 'RETIRED',
  LOST = 'LOST',
  DAMAGED = 'DAMAGED'
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  CRITICAL = 'CRITICAL'
}

export enum AssetClassification {
  TOOLS = 'TOOL',
  EQUIPMENT = 'EQUIPMENT',
  VEHICLE = 'VEHICLE',
  SAFETY = 'SAFETY',
  TESTING = 'TESTING',
  CALIBRATION = 'CALIBRATION'
}

export enum AssetCriticality {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface FieldJobNoteDto {
  id?: string;
  jobId: string;
  noteType: NoteType;
  visibility: NoteVisibility;
  priority: NotePriority;
  title?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  timestamp: string;
  lastModified?: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  followUpAssignedTo?: string;
  followUpCompleted: boolean;
  followUpCompletedDate?: string;
  attachments?: string[];
  mentionedTechnicians?: string[];
  mentionedCustomers?: string[];
  isStatusChange: boolean;
  previousStatus?: FieldJobStatus;
  newStatus?: FieldJobStatus;
  isCustomerCommunication: boolean;
  communicationMethod?: CommunicationMethod;
  customerResponse?: string;
  isSafetyNote: boolean;
  safetyLevel?: SafetyLevel;
  requiresApproval: boolean;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;
  isEscalation: boolean;
  escalatedTo?: string;
  escalationReason?: string;
  parentNoteId?: string;
  responseToNoteId?: string;
  searchTags?: string[];
  integrationReferences?: IntegrationReference[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export enum NoteType {
  GENERAL = 'GENERAL',
  STATUS_UPDATE = 'STATUS_UPDATE',
  CUSTOMER_COMMUNICATION = 'CUSTOMER_COMMUNICATION',
  TECHNICAL_NOTE = 'TECHNICAL_NOTE',
  SAFETY_NOTE = 'SAFETY_NOTE',
  PARTS_NOTE = 'PARTS_NOTE',
  ESCALATION = 'ESCALATION',
  FOLLOW_UP = 'FOLLOW_UP',
  APPROVAL = 'APPROVAL'
}

export enum NoteVisibility {
  INTERNAL = 'INTERNAL',
  TECHNICIAN_ONLY = 'TECHNICIAN_ONLY',
  CUSTOMER_VISIBLE = 'CUSTOMER_VISIBLE',
  PUBLIC = 'PUBLIC'
}

export enum NotePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum CommunicationMethod {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_PERSON = 'IN_PERSON',
  VIDEO_CALL = 'VIDEO_CALL'
}

export enum SafetyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export interface IntegrationReference {
  system: string;
  referenceId: string;
  referenceType: string;
  url?: string;
  lastSyncDate?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface ErrorResponse {
  error: string;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  hasContent: boolean;
  first: boolean;
  last: boolean;
}
