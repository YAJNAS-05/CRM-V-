package com.everx.config;

import com.everx.crm.account.Account;
import com.everx.crm.account.AccountRepository;
import com.everx.crm.deal.Deal;
import com.everx.crm.deal.DealRepository;
import com.everx.finance.invoice.Invoice;
import com.everx.finance.invoice.InvoiceRepository;
import com.everx.hr.EmployeeStatus;
import com.everx.hr.EmploymentType;
import com.everx.hr.employee.Employee;
import com.everx.hr.employee.EmployeeRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class MockOperationalDataInitializer implements ApplicationRunner {

    private final InvoiceRepository invoiceRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final DealRepository dealRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (employeeRepository.count() > 0) {
            log.info("Operational mock data already exists, skipping...");
            return;
        }

        seedMockData();
    }

    private void seedMockData() {
        log.info("Seeding operational mock data...");

        // 1. Seed Accounts — flush so IDs are generated before referencing
        Account acme = new Account();
        acme.setName("ACME Corporation");
        acme.setIndustry("Technology");
        acme.setIsDeleted(false);
        acme = accountRepository.saveAndFlush(acme);

        Account globex = new Account();
        globex.setName("Globex Corp");
        globex.setIndustry("Manufacturing");
        globex.setIsDeleted(false);
        globex = accountRepository.saveAndFlush(globex);

        // 2. Seed Employees
        Employee e1 = new Employee();
        e1.setEmployeeCode("EMP001");
        e1.setFirstName("Arun");
        e1.setLastName("Kumar");
        e1.setEmail("arun@everx.com");
        e1.setStatus(EmployeeStatus.ACTIVE);
        e1.setEmploymentType(EmploymentType.FULL_TIME);
        e1.setHireDate(LocalDate.now().minusYears(1));
        employeeRepository.saveAndFlush(e1);

        Employee e2 = new Employee();
        e2.setEmployeeCode("EMP002");
        e2.setFirstName("Jane");
        e2.setLastName("Doe");
        e2.setEmail("jane@everx.com");
        e2.setStatus(EmployeeStatus.ACTIVE);
        e2.setEmploymentType(EmploymentType.FULL_TIME);
        e2.setHireDate(LocalDate.now().minusMonths(6));
        employeeRepository.saveAndFlush(e2);

        // 3. Seed Invoices – account IDs are now guaranteed to exist
        Invoice i1 = new Invoice();
        i1.setInvoiceNumber("INV-2026-001");
        i1.setAccountId(acme.getId());
        i1.setEntity(Invoice.InvoiceEntity.USA);
        i1.setType(Invoice.InvoiceType.TAX_INVOICE);
        i1.setStatus(Invoice.InvoiceStatus.PAID);
        i1.setIssueDate(LocalDate.now().minusDays(30));
        i1.setDueDate(LocalDate.now().plusDays(15));
        i1.setTotalAmount(new BigDecimal("50000.00"));
        i1.setPaidAmount(new BigDecimal("50000.00"));
        i1.setCurrency("USD");
        i1.setIsDeleted(false);
        invoiceRepository.save(i1);

        Invoice i2 = new Invoice();
        i2.setInvoiceNumber("INV-2026-002");
        i2.setAccountId(globex.getId());
        i2.setEntity(Invoice.InvoiceEntity.AUSTRALIA);
        i2.setType(Invoice.InvoiceType.TAX_INVOICE);
        i2.setStatus(Invoice.InvoiceStatus.SENT);
        i2.setIssueDate(LocalDate.now().minusDays(10));
        i2.setDueDate(LocalDate.now().plusDays(20));
        i2.setTotalAmount(new BigDecimal("25000.00"));
        i2.setPaidAmount(BigDecimal.ZERO);
        i2.setCurrency("AUD");
        i2.setIsDeleted(false);
        invoiceRepository.save(i2);

        Invoice i3 = new Invoice();
        i3.setInvoiceNumber("INV-2026-003");
        i3.setAccountId(acme.getId());
        i3.setEntity(Invoice.InvoiceEntity.USA);
        i3.setType(Invoice.InvoiceType.TAX_INVOICE);
        i3.setStatus(Invoice.InvoiceStatus.OVERDUE);
        i3.setIssueDate(LocalDate.now().minusDays(45));
        i3.setDueDate(LocalDate.now().minusDays(15));
        i3.setTotalAmount(new BigDecimal("12000.00"));
        i3.setPaidAmount(BigDecimal.ZERO);
        i3.setCurrency("USD");
        i3.setIsDeleted(false);
        invoiceRepository.save(i3);

        // 4. Seed Deals
        Deal d1 = new Deal();
        d1.setName("ACME Server Upgrade");
        d1.setAccountId(acme.getId());
        d1.setAmount(new BigDecimal("150000.00"));
        d1.setStage("NEGOTIATION");
        d1.setProbability(60);
        d1.setIsDeleted(false);
        dealRepository.save(d1);

        log.info("Operational mock data seeded successfully: 2 accounts, 2 employees, 3 invoices, 1 deal");
    }
}
