# Phase 08: Analytics, Reporting & Business Intelligence

This phase implements comprehensive analytics and reporting dashboards including patient demographics and visit frequency analysis, doctor performance metrics, appointment no-show rate tracking, inventory turnover reports, and financial P&L summaries. This provides business intelligence capabilities for data-driven decision making.

## Tasks

- [ ] Create analytics type definitions and aggregation utilities:
  - Create `src/lib/types/analytics.ts`:
    - MetricCard (title, value, change, changeType, icon, trend)
    - ChartConfig (type, data, labels, colors, options)
    - ReportFilter (dateRange, department, doctor, branch, customFilters)
    - DateRange (startDate, endDate, preset: today/week/month/quarter/year/custom)
  - Create `src/lib/utils/analytics.ts` helper functions:
    - aggregateByPeriod(data, groupBy: day/week/month)
    - calculateGrowth(current, previous)
    - calculateAverage, calculateMedian, calculatePercentile
    - groupByCategory, filterByDateRange
    - generateTrendData for sparklines

- [ ] Build patient analytics service:
  - Create `src/lib/services/patientAnalytics.ts`:
    - getPatientDemographics - age distribution, gender breakdown
    - getVisitFrequency - new vs returning patients, visit frequency histogram
    - getPatientAcquisition - new patients over time (trend)
    - getPatientRetention - retention rate by cohort
    - getTopDiagnoses - most common ICD-10 codes
    - getPatientsByInsurance - distribution by insurance provider
  - Create aggregation functions that process seed data into chart-ready format

- [ ] Build appointment analytics service:
  - Create `src/lib/services/appointmentAnalytics.ts`:
    - getNoShowRate - calculate no-show percentage by period
    - getNoShowTrends - identify patterns (day of week, time of day, department)
    - getAppointmentVolume - bookings over time
    - getUtilizationRate - booked vs available slots
    - getAverageWaitTime - from check-in to consultation
    - getCancellationRate and reasons
  - Identify patients with high no-show rates in analytics

- [ ] Build doctor performance analytics service:
  - Create `src/lib/services/doctorAnalytics.ts`:
    - getPatientsSeen(doctorId, period) - total patients
    - getAverageConsultationTime(doctorId) - calculated from appointment durations
    - getPatientSatisfaction(doctorId) - mock satisfaction scores (4.2-4.9 stars)
    - getRevenueByDoctor - total revenue generated
    - getProceduresPerformed - breakdown by procedure type
    - getFollowUpRate - percentage of patients who return
  - Generate mock satisfaction scores in seed data (4.0-5.0 range with realistic distribution)

- [ ] Build inventory analytics service:
  - Create `src/lib/services/inventoryAnalytics.ts`:
    - getInventoryTurnover - calculate turnover rate by category
    - getStockMovementTrend - items in/out over time
    - getLowStockFrequency - how often items go below reorder level
    - getExpiryWasteRate - value of expired items as % of inventory
    - getTopConsumedItems - highest usage items
    - getSupplierPerformance - on-time delivery rate, price trends

- [ ] Build financial analytics service:
  - Create `src/lib/services/financialAnalytics.ts`:
    - getProfitAndLoss(period) - revenue, expenses, net income
    - getRevenueByStream - consultations, procedures, pharmacy, lab
    - getExpenseBreakdown - salaries, supplies, equipment, overhead
    - getCashFlow - inflow vs outflow over time
    - getCollectionRate - collected vs invoiced
    - getAverageDaysToPayment - calculate payment lag
    - getRevenuePerPatient, getRevenuePerVisit
  - Generate mock expense data for P&L (salaries, rent, supplies, utilities)

- [ ] Build patient analytics dashboard:
  - Create `src/routes/(app)/analytics/patients/+page.svelte`:
    - Date range selector at top
    - KPI cards: total patients, new patients, returning patients, retention rate
    - Patient acquisition trend chart (line chart - new patients over time)
    - Age distribution chart (bar chart with age groups: 0-18, 19-35, 36-50, 51-65, 65+)
    - Gender distribution (pie chart)
    - Visit frequency histogram (1 visit, 2-5 visits, 6-10 visits, 10+ visits)
    - Top diagnoses table (ICD-10 code, description, count)
    - Insurance distribution (pie chart)
  - Make all charts interactive with Chart.js or similar
  - Export dashboard to PDF/Excel functionality (simulated)

- [ ] Build appointment analytics dashboard:
  - Create `src/routes/(app)/analytics/appointments/+page.svelte`:
    - KPI cards: total appointments, no-show rate, cancellation rate, average wait time
    - Appointment volume trend (line chart over selected period)
    - No-show rate trend (line chart showing % over time)
    - No-show patterns analysis:
      - By day of week (bar chart - Monday-Sunday)
      - By time of day (bar chart - morning/afternoon/evening)
      - By department (table)
    - Utilization rate by doctor (table showing booked vs capacity %)
    - Appointment status breakdown (pie chart - completed, cancelled, no-show, scheduled)
    - High no-show patients list (table with patient names and no-show count)

- [ ] Build doctor performance dashboard:
  - Create `src/routes/(app)/analytics/doctors/+page.svelte`:
    - Doctor selector dropdown (or show all)
    - KPI cards: patients seen, avg consultation time, satisfaction rating, revenue generated
    - Patients seen trend (line chart over time)
    - Procedure breakdown (pie chart or table)
    - Revenue by doctor comparison (bar chart ranking all doctors)
    - Satisfaction score comparison (bar chart)
    - Follow-up rate by doctor (table)
    - Top performing doctors leaderboard
  - Add doctor performance widget to main dashboard

- [ ] Build inventory analytics dashboard:
  - Create `src/routes/(app)/analytics/inventory/+page.svelte`:
    - KPI cards: inventory value, turnover rate, expiry waste rate, low stock items count
    - Inventory turnover by category (table with turnover ratio)
    - Stock movement trend (line chart showing ins and outs)
    - Top consumed items (bar chart - top 10)
    - Expiry waste analysis (pie chart by category, value of expired items)
    - Supplier performance table (supplier, on-time %, avg delivery time)
    - Reorder frequency analysis (how often items trigger reorders)

- [ ] Build financial P&L and analytics dashboard:
  - Create `src/routes/(app)/analytics/financial/+page.svelte`:
    - Period selector (month, quarter, year)
    - P&L statement section:
      - Revenue breakdown table (consultations, procedures, pharmacy, lab, total)
      - Expense breakdown table (salaries, supplies, equipment, rent, utilities, other, total)
      - Net income calculation (revenue - expenses)
      - Profit margin %
    - Revenue trend chart (line chart over time with breakdown by stream)
    - Expense trend chart (stacked bar chart by category)
    - Cash flow chart (bar chart showing inflow vs outflow by month)
    - Collection metrics:
      - Collection rate (%)
      - Average days to payment
      - Outstanding receivables by aging bucket
    - Revenue per patient, revenue per visit metrics
    - Year-over-year comparison (if date range allows)

- [ ] Create executive summary dashboard:
  - Update main `src/routes/(app)/dashboard/+page.svelte` to be role-aware:
    - Admin/Executive view: high-level KPIs and trends across all modules
    - Doctor view: personal performance metrics, upcoming appointments, pending tasks
    - Receptionist view: today's appointments, queue, pending check-ins
    - Pharmacist view: pending prescriptions, low drug stock
    - Lab Technician view: pending lab orders, samples to process
  - Add widget system with drag-and-drop layout (simulated - fixed layout is fine)
  - Include mini charts and sparklines for trends

- [ ] Build report export and scheduling system:
  - Create `src/lib/services/reportService.ts`:
    - generateReport(reportType, filters, format)
    - exportToCSV, exportToPDF (simulated with download trigger)
    - scheduleReport(reportType, frequency, recipients) - mock scheduled reports
  - Create `src/lib/components/analytics/ReportExporter.svelte`:
    - Format selector (PDF, Excel, CSV)
    - "Export" button that triggers download (simulated with dummy data URL)
  - Add export button to all analytics dashboards
  - Create scheduled reports list in settings

- [ ] Test analytics and reporting modules:
  - Navigate to /analytics/patients and verify all charts render with data
  - Test date range selector and verify charts update (even if with same data)
  - Verify age distribution shows realistic bell curve
  - Navigate to /analytics/appointments and verify no-show trends display
  - Check that no-show patterns by day of week show realistic variation
  - Navigate to /analytics/doctors and select a specific doctor
  - Verify doctor-specific metrics display correctly
  - Navigate to /analytics/inventory and verify turnover calculations are present
  - Navigate to /analytics/financial and verify P&L statement renders
  - Verify revenue and expense totals calculate correctly
  - Test export functionality on each dashboard (should trigger download or show confirmation)
  - Navigate to main dashboard as different roles and verify role-specific widgets appear
  - Check that all KPI cards show realistic numbers consistent with seed data
  - Verify all charts are visually polished (colors, legends, tooltips, responsiveness)
