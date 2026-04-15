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
  ENGINEER_ASSIGNED = 'ENGINEER_ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_SIGN_OFF = 'PENDING_SIGN_OFF',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED'
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
  fieldJobId?: number;
  version?: number;
  jobNumber: string;
  jobType: FieldJobType;
  jobStatus: FieldJobStatus;
  priority: JobPriority;

  // Linked entities
  linkedEntity?: string;
  linkedEquipmentSku?: string;
  linkedLeadId?: number;
  linkedPoId?: number;
  linkedSalesOrderId?: number;
  linkedShipmentId?: number;
  linkedWarrantyId?: number;
  linkedServiceTicketId?: number;

  // Site & Client Info
  clientOrSellerName: string;
  siteContactName: string;
  siteContactPhone?: string;
  siteContactEmail: string;
  siteAddressLine1: string;
  siteAddressLine2?: string;
  siteCity: string;
  siteCountry?: string;
  siteTimezone?: string;

  // Scheduling
  scheduledStartDate: string; // ISO date
  scheduledEndDate: string; // ISO date
  estimatedDurationDays?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  actualDurationDays?: number;

  // Engineer Assignment
  primaryEngineerType?: EngineerType;
  primaryEngineerId?: number;
  primaryEngineerName?: string;
  secondaryEngineerId?: number;
  secondaryEngineerName?: string;
  engineerAssignedDate?: string;
  engineerAccepted?: boolean;
  engineerAcceptedDate?: string;

  // Notes
  internalNotes?: string;
  clientBriefNotes?: string;

  // Nested details (populated based on jobType)
  siteAssessmentDetail?: SiteAssessmentDetailDto;
  deInstallDetail?: DeInstallDetailDto;
  installationDetail?: InstallationDetailDto;
  ppmDetail?: PpmDetailDto;
  repairDetail?: RepairDetailDto;

  // Nested collections
  costs?: FieldJobCostDto[];
  checklist?: FieldJobChecklistDto;
  travelLegs?: FieldJobTravelDto[];
  report?: FieldJobReportDto;
  signOff?: FieldJobSignOffDto;

  // Audit
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================================================
// TYPE-SPECIFIC DETAIL DTOs
// ============================================================================

export interface SiteAssessmentDetailDto {
  saDetailId?: number;
  fieldJobId: number;
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
  fieldJobId: number;
  linkedPoId: number;
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
  fieldJobId: number;
  linkedSalesOrderId: number;
  linkedShipmentId: number;
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
  fieldJobId: number;
  linkedWarrantyId: number;
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
  fieldJobId: number;
  linkedServiceTicketId: number;
  linkedEquipmentSku: string;
  linkedWarrantyId?: number;
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
  fieldJobId: number;
  costCategory: CostCategory;
  description: string;
  linkedPartId?: number;
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
  fieldJobId: number;
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
  fieldJobId: number;
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
  fieldJobId: number;
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
  fieldJobId: number;
  engineerId: number;
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
