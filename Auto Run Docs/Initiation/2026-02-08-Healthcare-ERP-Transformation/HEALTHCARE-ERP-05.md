# Phase 05: Financial Operations - Invoicing, Insurance & Payments

This phase implements comprehensive financial operations including invoice generation linked to appointments/procedures with CPT/ICD code mapping, insurance claim management with pre-authorization workflow, payment tracking with installments and overdue alerts, and revenue analytics dashboards.

## Tasks

- [ ] Create financial type definitions and coding systems:
  - Create `src/lib/types/finance.ts`:
    - Invoice (id, patientId, appointmentId, number, issueDate, dueDate, items, subtotal, tax, total, status, paidAmount, paymentMethod, notes)
    - InvoiceItem (description, cptCode, icdCode, quantity, unitPrice, total)
    - Payment (id, invoiceId, amount, method, transactionId, paidAt, paidBy, notes)
    - PaymentPlan (id, invoiceId, totalAmount, installments, paidInstallments, nextDueDate, status)
  - Create `src/lib/data/cptCodes.ts` with 50+ common CPT procedure codes and TRY prices:
    - Office visits (99213, 99214), lab tests, imaging, minor procedures
  - Map CPT codes to services: consultation, lab test, imaging, procedure, medication
  - Create invoice status enum: draft, sent, paid, partial, overdue, cancelled

- [ ] Build insurance claim management system:
  - Create `src/lib/types/insurance.ts`:
    - InsuranceProvider (id, name, policyTypes, coverageRates, preAuthRequired, claimSubmissionEmail)
    - InsuranceClaim (id, patientId, invoiceId, providerId, policyNumber, claimNumber, submittedDate, status, amount, approvedAmount, denialReason, paidDate)
    - PreAuthorization (id, patientId, procedureCodes, requestDate, approvalDate, status, authNumber, validUntil)
    - ClaimStatus enum: draft, submitted, pending-review, approved, partial-approval, denied, paid
  - Create insurance provider database with 5 major Turkish providers (SGK, private insurance companies)
  - Define coverage rates per provider (e.g., SGK covers 80% of consultations, 100% of emergency)

- [ ] Implement financial services layer:
  - Create `src/lib/services/invoiceService.ts`:
    - generateInvoice(appointmentId) - auto-create invoice from appointment and procedures
    - addInvoiceItem, updateInvoice, finalizeInvoice
    - calculateTotals with tax (KDV 18%)
    - getOverdueInvoices, getInvoicesByPatient, getInvoicesByDateRange
  - Create `src/lib/services/paymentService.ts`:
    - recordPayment, createPaymentPlan, processInstallment
    - generatePaymentReceipt
    - markOverdue (auto-flag invoices past due date)
  - Create `src/lib/services/insuranceService.ts`:
    - createClaim, submitClaim, approveClaimMock, processClaim
    - requestPreAuth, approvePreAuth
    - calculatePatientResponsibility (total - insurance coverage)
  - Create stores: `src/lib/stores/invoices.ts`, `src/lib/stores/payments.ts`, `src/lib/stores/insurance.ts`

- [ ] Generate comprehensive financial seed data:
  - Create 200+ invoices tied to historical appointments:
    - 60% paid in full
    - 20% partial payment (payment plans)
    - 15% unpaid but not overdue
    - 5% overdue (flagged for collection)
  - Generate invoice items based on appointment types using CPT codes
  - Create 80+ insurance claims with various statuses
  - Create 15+ payment plans with installment schedules
  - Link patient insurance policies to insurance providers
  - Ensure financial coherence: invoice totals match payment records

- [ ] Build invoicing UI:
  - Create `src/routes/(app)/billing/invoices/+page.svelte` - Invoices dashboard:
    - Tabs: All, Unpaid, Overdue, Paid, Draft
    - Filters: date range, payment status, patient, amount range
    - Data table: invoice number, patient, date, amount, paid, balance, status, actions
    - Summary cards: total invoiced this month, total collected, outstanding balance, overdue amount
    - Bulk actions: send invoices, mark paid, export to Excel
  - Create `src/routes/(app)/billing/invoices/[id]/+page.svelte` - Invoice detail view:
    - Invoice header (number, patient, dates, status)
    - Line items table with CPT/ICD codes, descriptions, quantities, prices
    - Totals section (subtotal, tax, total, paid, balance)
    - Payment history timeline
    - Action buttons: record payment, create payment plan, print invoice, send to patient
    - Insurance claim status if applicable
  - Create `src/routes/(app)/billing/invoices/new/+page.svelte` - Manual invoice creation:
    - Patient selector
    - Appointment selector (optional)
    - Line item builder with CPT code picker
    - Auto-calculate totals
  - Create `src/lib/components/billing/InvoicePrintView.svelte` - Professional invoice template for printing

- [ ] Build payment processing UI:
  - Update existing `src/routes/(app)/billing/payments/+page.svelte`:
    - Payment history table with filters
    - Summary: total collected today, this week, this month
    - Payment methods breakdown (cash, card, bank transfer, insurance)
  - Create `src/lib/components/billing/PaymentForm.svelte`:
    - Amount input with balance validation
    - Payment method selector
    - Transaction reference field
    - Receipt generation option
  - Create `src/lib/components/billing/PaymentPlanForm.svelte`:
    - Total amount, down payment, installment count
    - Auto-calculate installment amounts and due dates
    - Display payment schedule preview

- [ ] Build insurance management UI:
  - Create `src/routes/(app)/billing/insurance/+page.svelte` - Insurance dashboard:
    - Tabs: Claims, Pre-Authorizations
    - Claims table: patient, claim number, provider, amount, status, submitted date
    - Filter by status, provider, date range
    - Summary: total submitted, approved, denied, pending
  - Create `src/routes/(app)/billing/insurance/claims/[id]/+page.svelte` - Claim detail:
    - Claim information (number, patient, provider, policy)
    - Associated invoice and services
    - Claim status timeline (submitted → review → approved → paid)
    - Approved amount vs submitted amount
    - Denial reason if denied
    - Action buttons: resubmit, appeal, mark paid
  - Create `src/lib/components/billing/PreAuthForm.svelte` for requesting pre-authorization
  - Add insurance information section to patient profile showing active policies

- [ ] Build revenue analytics dashboard:
  - Create `src/routes/(app)/reports/revenue/+page.svelte`:
    - Date range selector (today, this week, this month, this year, custom)
    - KPI cards: total revenue, cash vs insurance, collection rate, average invoice value
    - Revenue chart by day/week/month (line or bar chart using Chart.js)
    - Revenue by department breakdown (pie chart)
    - Revenue by doctor breakdown (table with totals)
    - Revenue by procedure type (top 10 procedures by revenue)
    - Payment method distribution (pie chart)
    - Outstanding receivables aging report (0-30, 31-60, 61-90, 90+ days)
  - Create `src/lib/components/billing/RevenueChart.svelte` - Reusable chart component
  - Add revenue KPI cards to main dashboard for admin/billing roles

- [ ] Test financial operations end-to-end:
  - Navigate to /billing/invoices and verify 200+ invoices load correctly
  - Filter by "Overdue" and verify only overdue invoices appear
  - Open an unpaid invoice and record a partial payment
  - Verify payment appears in payment history and balance updates
  - Create a payment plan for an unpaid invoice
  - Verify installment schedule displays correctly
  - Navigate to /billing/insurance and verify claims display
  - Open a pending claim and approve it
  - Verify status updates and patient balance adjusts
  - Navigate to /reports/revenue and verify all charts render with realistic data
  - Test date range filters on revenue dashboard
  - Print an invoice and verify print view is formatted professionally
  - Check that overdue invoices trigger notifications
