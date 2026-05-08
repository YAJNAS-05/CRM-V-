package com.everx.fieldwork.service;

import com.everx.fieldwork.entity.FieldJob;
import com.everx.fieldwork.entity.FieldWorkAsset;
import com.everx.fieldwork.repository.FieldWorkAssetRepository;
import com.everx.erp.inventory.InventoryService;
import com.everx.erp.workorder.WorkOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ErpIntegrationService {

    private final FieldWorkAssetRepository fieldWorkAssetRepository;
    private final InventoryService inventoryService;
    private final WorkOrderService workOrderService;

    public void syncJobWithErp(FieldJob fieldJob) {
        log.info("Syncing job {} with ERP system", fieldJob.getJobNumber());

        try {
            // Sync work order if ERP work order ID exists
            if (fieldJob.getErpWorkOrderId() != null) {
                syncWorkOrderWithErp(fieldJob);
            }

            // Sync assets if ERP asset IDs exist
            syncJobAssetsWithErp(fieldJob);

            // Update inventory if parts are used
            updateInventoryForJob(fieldJob);

        } catch (Exception e) {
            log.error("Failed to sync job {} with ERP: {}", fieldJob.getJobNumber(), e.getMessage());
        }
    }

    public void syncAssetWithErp(FieldWorkAsset asset) {
        log.info("Syncing asset {} with ERP system", asset.getAssetTag());

        try {
            if (asset.getErpAssetId() != null) {
                // Update asset status in ERP
                inventoryService.updateAssetStatus(asset.getErpAssetId(), asset.getStatus());
                
                // Update asset location if available
                if (asset.getCurrentLocation() != null) {
                    inventoryService.updateAssetLocation(asset.getErpAssetId(), asset.getCurrentLocation());
                }
            }

            // Create asset in ERP if it doesn't exist
            if (asset.getErpAssetId() == null && asset.getInventoryItemId() != null) {
                String erpAssetId = inventoryService.createAssetFromInventory(asset);
                if (erpAssetId != null) {
                    asset.setErpAssetId(erpAssetId);
                    fieldWorkAssetRepository.save(asset);
                }
            }

        } catch (Exception e) {
            log.error("Failed to sync asset {} with ERP: {}", asset.getAssetTag(), e.getMessage());
        }
    }

    public List<FieldWorkAsset> getAvailableAssetsFromErp(String category, String location) {
        log.info("Getting available assets from ERP for category: {} at location: {}", category, location);

        try {
            return inventoryService.getAvailableAssets(category, location);
        } catch (Exception e) {
            log.error("Failed to get available assets from ERP: {}", e.getMessage());
            return List.of();
        }
    }

    public boolean reserveAssetInErp(String erpAssetId, String fieldJobId) {
        log.info("Reserving asset {} in ERP for job {}", erpAssetId, fieldJobId);

        try {
            return inventoryService.reserveAsset(erpAssetId, fieldJobId);
        } catch (Exception e) {
            log.error("Failed to reserve asset {} in ERP: {}", erpAssetId, e.getMessage());
            return false;
        }
    }

    public boolean releaseAssetInErp(String erpAssetId, String fieldJobId) {
        log.info("Releasing asset {} in ERP from job {}", erpAssetId, fieldJobId);

        try {
            return inventoryService.releaseAsset(erpAssetId, fieldJobId);
        } catch (Exception e) {
            log.error("Failed to release asset {} in ERP: {}", erpAssetId, e.getMessage());
            return false;
        }
    }

    public void updateAssetUsageInErp(String erpAssetId, int usageCount) {
        log.info("Updating asset {} usage in ERP: {}", erpAssetId, usageCount);

        try {
            inventoryService.updateAssetUsage(erpAssetId, usageCount);
        } catch (Exception e) {
            log.error("Failed to update asset usage in ERP: {}", e.getMessage());
        }
    }

    public String createWorkOrderInErp(FieldJob fieldJob) {
        log.info("Creating work order in ERP for job {}", fieldJob.getJobNumber());

        try {
            String erpWorkOrderId = workOrderService.createWorkOrder(fieldJob);
            if (erpWorkOrderId != null) {
                fieldJob.setErpWorkOrderId(erpWorkOrderId);
                // Note: FieldJob would need to be saved by the calling service
            }
            return erpWorkOrderId;
        } catch (Exception e) {
            log.error("Failed to create work order in ERP: {}", e.getMessage());
            return null;
        }
    }

    public void updateWorkOrderInErp(FieldJob fieldJob) {
        log.info("Updating work order {} in ERP for job {}", fieldJob.getErpWorkOrderId(), fieldJob.getJobNumber());

        try {
            workOrderService.updateWorkOrder(fieldJob.getErpWorkOrderId(), fieldJob);
        } catch (Exception e) {
            log.error("Failed to update work order in ERP: {}", e.getMessage());
        }
    }

    public void closeWorkOrderInErp(FieldJob fieldJob) {
        log.info("Closing work order {} in ERP for job {}", fieldJob.getErpWorkOrderId(), fieldJob.getJobNumber());

        try {
            workOrderService.closeWorkOrder(fieldJob.getErpWorkOrderId(), fieldJob);
        } catch (Exception e) {
            log.error("Failed to close work order in ERP: {}", e.getMessage());
        }
    }

    public boolean checkAssetAvailability(String erpAssetId) {
        log.info("Checking availability for asset {}", erpAssetId);

        try {
            return inventoryService.isAssetAvailable(erpAssetId);
        } catch (Exception e) {
            log.error("Failed to check asset availability: {}", e.getMessage());
            return false;
        }
    }

    public void scheduleMaintenanceInErp(String erpAssetId, String maintenanceType, String scheduledDate) {
        log.info("Scheduling maintenance for asset {} in ERP", erpAssetId);

        try {
            inventoryService.scheduleMaintenance(erpAssetId, maintenanceType, scheduledDate);
        } catch (Exception e) {
            log.error("Failed to schedule maintenance in ERP: {}", e.getMessage());
        }
    }

    // Private helper methods

    private void syncWorkOrderWithErp(FieldJob fieldJob) {
        if (fieldJob.getErpWorkOrderId() == null) {
            // Create new work order
            createWorkOrderInErp(fieldJob);
        } else {
            // Update existing work order
            updateWorkOrderInErp(fieldJob);
        }
    }

    private void syncJobAssetsWithErp(FieldJob fieldJob) {
        List<FieldWorkAsset> assets = fieldWorkAssetRepository.findByFieldJobId(fieldJob.getId().toString());
        
        for (FieldWorkAsset asset : assets) {
            syncAssetWithErp(asset);
        }
    }

    private void updateInventoryForJob(FieldJob fieldJob) {
        if (fieldJob.getStatus() == FieldJob.JobStatus.COMPLETED) {
            List<FieldWorkAsset> assets = fieldWorkAssetRepository.findByFieldJobId(fieldJob.getId().toString());
            
            for (FieldWorkAsset asset : assets) {
                if (asset.getIsConsumable() && asset.getErpAssetId() != null) {
                    // Update inventory for consumable items
                    inventoryService.updateInventoryCount(asset.getErpAssetId(), -asset.getQuantity().intValue());
                }
                
                // Update asset usage
                if (asset.getErpAssetId() != null) {
                    updateAssetUsageInErp(asset.getErpAssetId(), asset.getUsageCount());
                }
            }
        }
    }
}
