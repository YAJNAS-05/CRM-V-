package com.everx.admin.dashboard;

import com.everx.admin.dashboard.dto.DashboardResponse;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.erp.equipment.Equipment;
import com.everx.erp.equipment.EquipmentRepository;
import com.everx.erp.fieldwork.FieldJob;
import com.everx.erp.fieldwork.FieldJobRepository;
import com.everx.erp.fieldwork.FieldJobStatus;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DealRepository dealRepository;
    private final EquipmentRepository equipmentRepository;
        private final FieldJobRepository fieldJobRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getGlobalAnalytics() {
        return DashboardResponse.builder()
                .crm(getCRMStats())
                .erp(getERPStats())
                .finance(getFinanceStats())
                .build();
    }

    private DashboardResponse.CRMStats getCRMStats() {
        List<Deal> deals = dealRepository.findAll().stream()
                .filter(d -> d != null && !Boolean.TRUE.equals(d.getIsDeleted())).collect(Collectors.toList());

        Map<String, Long> dealsByStage = new HashMap<>();
        Map<String, BigDecimal> valueByStage = new HashMap<>();
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Deal d : deals) {
            String stage = d.getStage() != null ? d.getStage().name() : "UNKNOWN";
            dealsByStage.merge(stage, 1L, (oldVal, newVal) -> oldVal + newVal);
            if (d.getAmount() != null) {
                valueByStage.merge(stage, d.getAmount(), BigDecimal::add);
                totalValue = totalValue.add(d.getAmount());
            }
        }

        return DashboardResponse.CRMStats.builder()
                .totalDeals(deals.size())
                .totalPipelineValue(totalValue)
                .dealsByStage(dealsByStage)
                .valueByStage(valueByStage)
                .build();
    }

    private DashboardResponse.ERPStats getERPStats() {
        List<Equipment> equipment = equipmentRepository.findAll().stream()
                .filter(e -> e != null && !Boolean.TRUE.equals(e.getIsDeleted())).collect(Collectors.toList());
        
        Map<String, Long> equipmentByStatus = new HashMap<>();
        for (Equipment e : equipment) {
            String status = e.getStatus() != null ? e.getStatus().name() : "UNKNOWN";
            equipmentByStatus.merge(status, 1L, (oldVal, newVal) -> oldVal + newVal);
        }

        List<FieldJob> jobs = fieldJobRepository.findAll().stream()
                .filter(j -> j != null && !Boolean.TRUE.equals(j.getIsDeleted()) && j.getJobStatus() != FieldJobStatus.COMPLETED)
                .collect(Collectors.toList());

        Map<String, Long> jobsByPriority = new HashMap<>();
        for (FieldJob job : jobs) {
            String priority = job.getPriority() != null ? job.getPriority().name() : "UNKNOWN";
            jobsByPriority.merge(priority, 1L, (oldVal, newVal) -> oldVal + newVal);
        }

        return DashboardResponse.ERPStats.builder()
                .totalEquipment(equipment.size())
                .equipmentByStatus(equipmentByStatus)
                .openFieldJobs(jobs.size())
                .jobsByPriority(jobsByPriority)
                .build();
    }

    private DashboardResponse.FinanceStats getFinanceStats() {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(i -> i != null && !Boolean.TRUE.equals(i.getIsDeleted())).collect(Collectors.toList());

        BigDecimal monthlyRevenue = invoices.stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID && i.getIssueDate() != null && i.getIssueDate().isAfter(monthStart.minusDays(1)))
                .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Invoice> overdue = invoices.stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.OVERDUE)
                .collect(Collectors.toList());

        BigDecimal totalOverdueAmount = overdue.stream()
                .map(i -> {
                    BigDecimal total = i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO;
                    BigDecimal paid = i.getPaidAmount() != null ? i.getPaidAmount() : BigDecimal.ZERO;
                    return total.subtract(paid);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> revenueByEntity = new HashMap<>();
        invoices.stream()
                .filter(i -> i.getStatus() == Invoice.InvoiceStatus.PAID && i.getEntity() != null)
                .forEach(i -> {
                    BigDecimal amount = i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO;
                    revenueByEntity.merge(i.getEntity().name(), amount, BigDecimal::add);
                });

        return DashboardResponse.FinanceStats.builder()
                .monthlyRevenue(monthlyRevenue)
                .overdueInvoicesCount(overdue.size())
                .totalOverdueAmount(totalOverdueAmount)
                .revenueByEntity(revenueByEntity)
                .build();
    }
}
