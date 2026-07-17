import { format, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns';
import type { ScheduledDose, Medication } from '@/contexts/DataContext';
import tarvaLogoBase64 from '@/assets/tarva-logo.png';

interface ExportData {
  patientName: string;
  startDate: Date;
  endDate: Date;
  getDosesForDate: (date: Date) => ScheduledDose[];
  medications: Medication[];
}

const STATUS_COLORS = {
  taken: '#22c55e',
  late: '#f59e0b',
  missed: '#ef4444',
  skipped: '#6b7280',
  snoozed: '#3b82f6',
  pending: '#a1a1aa',
};

const STATUS_LABELS = {
  taken: 'Taken',
  late: 'Late',
  missed: 'Missed',
  skipped: 'Skipped',
  snoozed: 'Snoozed',
  pending: 'Pending',
};

type DoseStatus = keyof typeof STATUS_COLORS;

function getDisplayStatus(dose: ScheduledDose): DoseStatus {
  if (dose.status === 'taken' && dose.isLate) return 'late';
  return dose.status as DoseStatus;
}

// Escape user-controlled strings before injecting into innerHTML to prevent XSS.
function esc(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function generateAdherencePDF(data: ExportData): Promise<Blob> {
  const { patientName, startDate, endDate, getDosesForDate, medications } = data;
  
  // Create a new document
  const doc = document.createElement('div');
  doc.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    color: #1a1a1a;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  `;
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px;';
  header.innerHTML = `
    <div>
      <img src="${tarvaLogoBase64}" alt="TARVA" style="height: 80px; object-fit: contain; filter: invert(1);" />
    </div>
    <div style="text-align: right;">
      <p style="font-weight: 600; font-size: 16px; margin: 0;">${esc(patientName)}</p>
      <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">
        ${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0 0;">Medication Adherence Report</p>
    </div>
  `;
  doc.appendChild(header);

  // Summary stats
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  let totalDoses = 0;
  let takenDoses = 0;
  let lateDoses = 0;
  let missedDoses = 0;
  let skippedDoses = 0;

  allDays.forEach(day => {
    const doses = getDosesForDate(day);
    doses.forEach(dose => {
      const displayStatus = getDisplayStatus(dose);
      totalDoses++;
      if (displayStatus === 'taken') takenDoses++;
      if (displayStatus === 'late') { takenDoses++; lateDoses++; }
      if (displayStatus === 'missed') missedDoses++;
      if (displayStatus === 'skipped') skippedDoses++;
    });
  });

  const adherenceRate = totalDoses > 0 ? Math.round(((takenDoses) / (totalDoses - skippedDoses)) * 100) : 0;
  const onTimeRate = takenDoses > 0 ? Math.round(((takenDoses - lateDoses) / takenDoses) * 100) : 0;

  const summary = document.createElement('div');
  summary.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;';
  summary.innerHTML = `
    <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
      <p style="font-size: 28px; font-weight: 700; color: #8b5cf6; margin: 0;">${isNaN(adherenceRate) ? 0 : adherenceRate}%</p>
      <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Adherence Rate</p>
    </div>
    <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
      <p style="font-size: 28px; font-weight: 700; color: #22c55e; margin: 0;">${isNaN(onTimeRate) ? 0 : onTimeRate}%</p>
      <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">On-Time Rate</p>
    </div>
    <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
      <p style="font-size: 28px; font-weight: 700; color: #ef4444; margin: 0;">${missedDoses}</p>
      <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Missed Doses</p>
    </div>
    <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; text-align: center;">
      <p style="font-size: 28px; font-weight: 700; color: #6b7280; margin: 0;">${skippedDoses}</p>
      <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Skipped Doses</p>
    </div>
  `;
  doc.appendChild(summary);

  // Monthly calendars
  const months = new Set<string>();
  allDays.forEach(day => months.add(format(day, 'yyyy-MM')));
  
  const calendarSection = document.createElement('div');
  calendarSection.innerHTML = '<h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Monthly Overview</h2>';
  
  Array.from(months).forEach(monthKey => {
    const [year, month] = monthKey.split('-').map(Number);
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(monthStart);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const monthDiv = document.createElement('div');
    monthDiv.style.cssText = 'margin-bottom: 24px;';
    monthDiv.innerHTML = `
      <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">${format(monthStart, 'MMMM yyyy')}</h3>
    `;
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;';
    
    // Day headers
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.style.cssText = 'text-align: center; font-size: 10px; color: #9ca3af; padding: 4px;';
      dayHeader.textContent = day;
      grid.appendChild(dayHeader);
    });
    
    // Empty cells for start of month
    const startDay = (getDay(monthStart) + 6) % 7; // Monday = 0
    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('div');
      grid.appendChild(empty);
    }
    
    // Day cells
    daysInMonth.forEach(day => {
      const doses = getDosesForDate(day);
      const dayCell = document.createElement('div');
      dayCell.style.cssText = 'text-align: center; padding: 4px; min-height: 36px;';
      
      let statusColor = '#e5e7eb';
      if (doses.length > 0) {
        const hasMissed = doses.some(d => getDisplayStatus(d) === 'missed');
        const hasLate = doses.some(d => getDisplayStatus(d) === 'late');
        const allTaken = doses.every(d => ['taken', 'late', 'skipped'].includes(getDisplayStatus(d)));
        
        if (hasMissed) statusColor = STATUS_COLORS.missed;
        else if (hasLate) statusColor = STATUS_COLORS.late;
        else if (allTaken) statusColor = STATUS_COLORS.taken;
      }
      
      dayCell.innerHTML = `
        <div style="background: ${statusColor}20; border-radius: 6px; padding: 4px;">
          <span style="font-size: 12px; font-weight: 500;">${format(day, 'd')}</span>
          ${doses.length > 0 ? `
            <div style="display: flex; justify-content: center; gap: 2px; margin-top: 2px;">
              ${doses.slice(0, 4).map(d => `<div style="width: 4px; height: 4px; border-radius: 50%; background: ${STATUS_COLORS[getDisplayStatus(d)]};"></div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
      grid.appendChild(dayCell);
    });
    
    monthDiv.appendChild(grid);
    calendarSection.appendChild(monthDiv);
  });
  
  doc.appendChild(calendarSection);

  // Detailed log table
  const tableSection = document.createElement('div');
  tableSection.style.cssText = 'margin-top: 32px;';
  tableSection.innerHTML = '<h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">Detailed Adherence Log</h2>';
  
  const table = document.createElement('table');
  table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 12px;';
  table.innerHTML = `
    <thead>
      <tr style="background: #f3f4f6;">
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Date</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Medication</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Scheduled</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Status</th>
        <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb;">Actual Time</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  
  const tbody = table.querySelector('tbody')!;
  
  // Only show entries with events (not pending)
  allDays.forEach(day => {
    const doses = getDosesForDate(day);
    doses.filter(d => getDisplayStatus(d) !== 'pending').forEach(dose => {
      const displayStatus = getDisplayStatus(dose);
      const actualTime = dose.eventTime ? format(dose.eventTime, 'h:mm a') : '—';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6;">${format(day, 'MMM d, yyyy')}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6;">
          ${dose.medicationName}<br>
          <span style="color: #9ca3af; font-size: 11px;">${dose.strengthValue || ''}${dose.strengthUnit || ''}</span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6;">${format(dose.scheduledTime, 'h:mm a')}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6;">
          <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; background: ${STATUS_COLORS[displayStatus]}20; color: ${STATUS_COLORS[displayStatus]}; font-weight: 500;">
            ${STATUS_LABELS[displayStatus]}
          </span>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f3f4f6;">${actualTime}</td>
      `;
      tbody.appendChild(row);
    });
  });
  
  tableSection.appendChild(table);
  doc.appendChild(tableSection);

  // Legend
  const legend = document.createElement('div');
  legend.style.cssText = 'margin-top: 32px; padding: 16px; background: #f9fafb; border-radius: 12px;';
  legend.innerHTML = `
    <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Legend</h3>
    <div style="display: flex; flex-wrap: wrap; gap: 16px;">
      ${Object.entries(STATUS_LABELS).map(([key, label]) => `
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: ${STATUS_COLORS[key as keyof typeof STATUS_COLORS]};"></div>
          <span style="font-size: 12px;">${label}</span>
        </div>
      `).join('')}
    </div>
    <div style="margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
      <p style="font-size: 11px; color: #6b7280; margin: 0;">
        <strong>Adherence Rate:</strong> Percentage of scheduled doses taken (excludes skipped doses).<br>
        <strong>On-Time Rate:</strong> Percentage of taken doses within the on-time window.<br>
        <strong>Skipped:</strong> Doses intentionally skipped by the patient (not counted as missed).
      </p>
    </div>
  `;
  doc.appendChild(legend);

  // Medications List Section
  const medicationsSection = document.createElement('div');
  medicationsSection.style.cssText = 'margin-top: 32px; padding: 16px; background: #faf5ff; border-radius: 12px; border: 1px solid #e9d5ff;';
  medicationsSection.innerHTML = `
    <h3 style="font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: #8b5cf6;">Current Medications</h3>
    <div style="display: grid; gap: 8px;">
      ${medications.map(med => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 8px;">
          <div>
            <span style="font-weight: 500; font-size: 13px;">${med.generic_name}</span>
            <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">${med.strength_value || ''}${med.strength_unit || ''}</span>
          </div>
          <span style="font-size: 11px; color: #8b5cf6; background: #f3e8ff; padding: 2px 8px; border-radius: 10px;">${med.form || 'tablet'}</span>
        </div>
      `).join('')}
    </div>
    ${medications.length === 0 ? '<p style="font-size: 12px; color: #9ca3af; margin: 0;">No medications currently tracked.</p>' : ''}
  `;
  doc.appendChild(medicationsSection);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;';
  footer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
      <img src="${tarvaLogoBase64}" alt="TARVA" style="height: 48px; object-fit: contain; filter: invert(1);" />
    </div>
    <p style="font-size: 11px; color: #9ca3af; margin: 0;">
      Generated for ${patientName} on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
    </p>
  `;
  doc.appendChild(footer);

  // Convert to PDF using print-to-PDF approach
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TARVA Adherence Report</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 0.5in; }
          }
        </style>
      </head>
      <body>
        ${doc.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  
  // Give the document time to render, then trigger print
  setTimeout(() => {
    printWindow.print();
  }, 500);

  // Return a mock blob for now (actual PDF generation would need a library like jspdf)
  return new Blob([doc.outerHTML], { type: 'text/html' });
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
