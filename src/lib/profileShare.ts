import { format } from 'date-fns';
import type { PatientProfile, Medication } from '@/contexts/OnboardingContext';
import type { HealthProfile } from '@/contexts/HealthProfileContext';
import { conditions } from '@/data/conditions';
import { behaviors } from '@/data/behaviors';
import tarvaLogoBase64 from '@/assets/tarva-logo.png';

interface ProfileShareData {
  patientProfile: PatientProfile | null;
  healthProfile: HealthProfile;
  medications: Medication[];
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

export async function generateProfilePDF(data: ProfileShareData): Promise<void> {
  const { patientProfile, healthProfile, medications } = data;

  const name = patientProfile?.fullName || 'Patient';

  const conditionNames = healthProfile.conditions
    .map(id => conditions.find(c => c.id === id)?.name || id)
    .filter(Boolean);

  const behaviorNames = healthProfile.selectedBehaviors
    .map(id => behaviors.find(b => b.id === id)?.name || id)
    .filter(Boolean);

  const doc = document.createElement('div');
  doc.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    color: #1a1a1a;
    padding: 32px;
    max-width: 800px;
    margin: 0 auto;
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 20px; border-radius: 16px;';

  const avatarHtml = patientProfile?.avatarUrl
    ? `<img src="${esc(patientProfile.avatarUrl)}" alt="${esc(name)}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid white;" />`
    : `<div style="width: 70px; height: 70px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: #8b5cf6;">${esc(name.charAt(0).toUpperCase())}</div>`;

  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px;">
      ${avatarHtml}
      <div>
        <p style="font-weight: 600; font-size: 20px; margin: 0; color: white;">${esc(name)}</p>
        <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 4px 0 0 0;">Health Profile Report</p>
      </div>
    </div>
    <div style="text-align: right;">
      <img src="${tarvaLogoBase64}" alt="TARVA" style="height: 40px; object-fit: contain; filter: brightness(0) invert(1);" />
      <p style="color: rgba(255,255,255,0.7); font-size: 11px; margin: 6px 0 0 0;">
        ${format(new Date(), 'MMM d, yyyy')}
      </p>
    </div>
  `;
  doc.appendChild(header);

  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;';

  const statBoxStyle = 'background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; text-align: center;';
  const statLabelStyle = 'font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;';
  const statValueStyle = 'font-size: 18px; font-weight: 600; color: #1e293b; margin: 4px 0 0 0;';

  statsRow.innerHTML = `
    <div style="${statBoxStyle}">
      <p style="${statLabelStyle}">Age</p>
      <p style="${statValueStyle}">${esc(healthProfile.age || '—')}</p>
    </div>
    <div style="${statBoxStyle}">
      <p style="${statLabelStyle}">Height</p>
      <p style="${statValueStyle}">${healthProfile.heightValue ? `${esc(healthProfile.heightValue)} ${esc(healthProfile.heightUnit)}` : '—'}</p>
    </div>
    <div style="${statBoxStyle}">
      <p style="${statLabelStyle}">Weight</p>
      <p style="${statValueStyle}">${healthProfile.weightValue ? `${esc(healthProfile.weightValue)} ${esc(healthProfile.weightUnit)}` : '—'}</p>
    </div>
    <div style="${statBoxStyle}">
      <p style="${statLabelStyle}">Blood</p>
      <p style="${statValueStyle}">${esc(healthProfile.bloodGroup || '—')}</p>
    </div>
  `;
  doc.appendChild(statsRow);

  const personalSection = document.createElement('div');
  personalSection.style.cssText = 'margin-bottom: 20px;';

  let personalInfo = '';
  if (patientProfile?.dateOfBirth) {
    personalInfo += `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="color: #64748b; font-size: 13px;">Date of Birth</span>
        <span style="font-weight: 500; font-size: 13px;">${esc(format(new Date(patientProfile.dateOfBirth), 'MMMM d, yyyy'))}</span>
      </div>
    `;
  }
  if (patientProfile?.allergies) {
    personalInfo += `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="color: #64748b; font-size: 13px;">Allergies</span>
        <span style="font-weight: 500; font-size: 13px; color: #dc2626;">${esc(patientProfile.allergies)}</span>
      </div>
    `;
  }

  if (personalInfo) {
    personalSection.innerHTML = `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 4px 16px;">
        ${personalInfo}
      </div>
    `;
    doc.appendChild(personalSection);
  }

  if (conditionNames.length > 0) {
    const conditionsSection = document.createElement('div');
    conditionsSection.style.cssText = 'margin-bottom: 20px;';
    conditionsSection.innerHTML = `
      <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 4px; height: 16px; background: #f59e0b; border-radius: 2px;"></span>
        Medical Conditions
      </h2>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); padding: 14px; border-radius: 12px; border: 1px solid #fde68a;">
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${conditionNames.map(n => `
            <span style="background: #f59e0b; color: white; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 500;">${esc(n)}</span>
          `).join('')}
        </div>
        ${healthProfile.conditionOtherText ? `
          <p style="font-size: 12px; color: #92400e; margin: 10px 0 0 0;"><strong>Note:</strong> ${esc(healthProfile.conditionOtherText)}</p>
        ` : ''}
      </div>
    `;
    doc.appendChild(conditionsSection);
  }

  if (behaviorNames.length > 0) {
    const behaviorsSection = document.createElement('div');
    behaviorsSection.style.cssText = 'margin-bottom: 20px;';
    behaviorsSection.innerHTML = `
      <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 4px; height: 16px; background: #06b6d4; border-radius: 2px;"></span>
        Tracked Behaviors
      </h2>
      <div style="background: linear-gradient(135deg, #cffafe 0%, #e0f2fe 100%); padding: 14px; border-radius: 12px; border: 1px solid #a5f3fc;">
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${behaviorNames.map(n => `
            <span style="background: #0891b2; color: white; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 500;">${esc(n)}</span>
          `).join('')}
        </div>
      </div>
    `;
    doc.appendChild(behaviorsSection);
  }

  if (medications.length > 0) {
    const medsSection = document.createElement('div');
    medsSection.style.cssText = 'margin-bottom: 20px;';
    medsSection.innerHTML = `
      <h2 style="font-size: 14px; font-weight: 600; margin: 0 0 10px 0; color: #374151; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 4px; height: 16px; background: #8b5cf6; border-radius: 2px;"></span>
        Current Medications
      </h2>
      <div style="background: linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%); border: 1px solid #ddd6fe; border-radius: 12px; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #8b5cf6; color: white;">
              <th style="text-align: left; padding: 10px 14px; font-weight: 600;">Medication</th>
              <th style="text-align: left; padding: 10px 14px; font-weight: 600;">Strength</th>
              <th style="text-align: left; padding: 10px 14px; font-weight: 600;">Form</th>
              <th style="text-align: left; padding: 10px 14px; font-weight: 600;">Frequency</th>
              <th style="text-align: left; padding: 10px 14px; font-weight: 600;">Schedule</th>
            </tr>
          </thead>
          <tbody>
            ${medications.map((med, i) => `
              <tr style="background: ${i % 2 === 0 ? 'white' : '#faf5ff'};">
                <td style="padding: 10px 14px; font-weight: 500; color: #1e293b;">${esc(med.name)}</td>
                <td style="padding: 10px 14px; color: #64748b;">${esc(med.strength)}</td>
                <td style="padding: 10px 14px; color: #64748b;">${esc(med.form)}</td>
                <td style="padding: 10px 14px; color: #64748b;">${esc(med.frequency)}</td>
                <td style="padding: 10px 14px; color: #8b5cf6; font-weight: 500;">${esc(med.times?.join(', ') || '—')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${medications.some(m => m.instructions) ? `
          <div style="padding: 12px 14px; border-top: 1px solid #ddd6fe; background: white;">
            <p style="font-size: 11px; font-weight: 600; color: #374151; margin: 0 0 6px 0;">Special Instructions:</p>
            ${medications.filter(m => m.instructions).map(med => `
              <p style="font-size: 11px; color: #64748b; margin: 4px 0;"><strong>${esc(med.name)}:</strong> ${esc(med.instructions)}</p>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
    doc.appendChild(medsSection);
  }

  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top: 24px; padding-top: 16px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;';
  footer.innerHTML = `
    <p style="font-size: 10px; color: #94a3b8; margin: 0;">
      Generated by TARVA Health • ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
    </p>
    <p style="font-size: 10px; color: #94a3b8; margin: 0;">
      For healthcare provider reference only
    </p>
  `;
  doc.appendChild(footer);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TARVA Health Profile - ${esc(name)}</title>
        <style>
          @media print {
            body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { margin: 0.4in; }
          }
        </style>
      </head>
      <body>
        ${doc.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// Sharing profile data via a URL-encoded blob leaked sensitive health data
// into browser history, referrer headers, and server logs. Profile sharing is
// now PDF-only; any future link-based sharing must go through a server-side
// token store with expiration and access control.
export async function shareProfile(data: ProfileShareData): Promise<void> {
  await generateProfilePDF(data);
}
