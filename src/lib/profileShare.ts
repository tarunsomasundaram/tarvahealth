import { format } from 'date-fns';
import type { PatientProfile, Medication } from '@/contexts/OnboardingContext';
import type { HealthProfile } from '@/contexts/HealthProfileContext';
import tarvaLogoBase64 from '@/assets/tarva-logo.png';

interface ProfileShareData {
  patientProfile: PatientProfile | null;
  healthProfile: HealthProfile;
  medications: Medication[];
}

export async function generateProfilePDF(data: ProfileShareData): Promise<void> {
  const { patientProfile, healthProfile, medications } = data;
  
  const name = patientProfile?.fullName || 'Patient';
  
  // Create the document
  const doc = document.createElement('div');
  doc.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: white;
    color: #1a1a1a;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  `;
  
  // Header with avatar
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; border-bottom: 2px solid #8b5cf6; padding-bottom: 20px;';
  
  const avatarHtml = patientProfile?.avatarUrl 
    ? `<img src="${patientProfile.avatarUrl}" alt="${name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #8b5cf6;" />`
    : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; color: white;">${name.charAt(0).toUpperCase()}</div>`;
  
  header.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px;">
      ${avatarHtml}
      <div>
        <p style="font-weight: 600; font-size: 18px; margin: 0;">${name}</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0 0;">Health Profile</p>
      </div>
    </div>
    <div style="text-align: right;">
      <img src="${tarvaLogoBase64}" alt="TARVA" style="height: 48px; object-fit: contain; filter: invert(1);" />
      <p style="color: #6b7280; font-size: 11px; margin: 4px 0 0 0;">
        Generated ${format(new Date(), 'MMM d, yyyy')}
      </p>
    </div>
  `;
  doc.appendChild(header);

  // Personal Info Section
  const personalSection = document.createElement('div');
  personalSection.style.cssText = 'margin-bottom: 24px;';
  personalSection.innerHTML = `
    <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">Personal Information</h2>
    <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
      <div>
        <p style="font-size: 11px; color: #6b7280; margin: 0;">Full Name</p>
        <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">${name}</p>
      </div>
      ${patientProfile?.dateOfBirth ? `
        <div>
          <p style="font-size: 11px; color: #6b7280; margin: 0;">Date of Birth</p>
          <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">${format(new Date(patientProfile.dateOfBirth), 'MMM d, yyyy')}</p>
        </div>
      ` : ''}
      ${healthProfile.age ? `
        <div>
          <p style="font-size: 11px; color: #6b7280; margin: 0;">Age</p>
          <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">${healthProfile.age} years</p>
        </div>
      ` : ''}
      ${healthProfile.heightValue ? `
        <div>
          <p style="font-size: 11px; color: #6b7280; margin: 0;">Height</p>
          <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">${healthProfile.heightValue} ${healthProfile.heightUnit}</p>
        </div>
      ` : ''}
      ${healthProfile.bloodGroup ? `
        <div>
          <p style="font-size: 11px; color: #6b7280; margin: 0;">Blood Group</p>
          <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">${healthProfile.bloodGroup}</p>
        </div>
      ` : ''}
      ${patientProfile?.allergies ? `
        <div style="grid-column: span 2;">
          <p style="font-size: 11px; color: #6b7280; margin: 0;">Allergies</p>
          <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">${patientProfile.allergies}</p>
        </div>
      ` : ''}
    </div>
  `;
  doc.appendChild(personalSection);

  // Conditions Section
  if (healthProfile.conditions.length > 0) {
    const conditionsSection = document.createElement('div');
    conditionsSection.style.cssText = 'margin-bottom: 24px;';
    conditionsSection.innerHTML = `
      <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">Medical Conditions</h2>
      <div style="background: #fef3c7; padding: 16px; border-radius: 12px;">
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${healthProfile.conditions.map(condition => `
            <span style="background: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">${condition}</span>
          `).join('')}
        </div>
        ${healthProfile.conditionOtherText ? `
          <p style="font-size: 12px; color: #92400e; margin: 12px 0 0 0;"><strong>Other:</strong> ${healthProfile.conditionOtherText}</p>
        ` : ''}
      </div>
    `;
    doc.appendChild(conditionsSection);
  }

  // Medications Section
  if (medications.length > 0) {
    const medsSection = document.createElement('div');
    medsSection.style.cssText = 'margin-bottom: 24px;';
    medsSection.innerHTML = `
      <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">Current Medications</h2>
      <div style="background: #faf5ff; padding: 16px; border-radius: 12px; border: 1px solid #e9d5ff;">
        <div style="display: grid; gap: 8px;">
          ${medications.map(med => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 8px;">
              <div>
                <span style="font-weight: 500; font-size: 13px;">${med.name}</span>
                <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">${med.strength}</span>
              </div>
              <span style="font-size: 11px; color: #8b5cf6; background: #f3e8ff; padding: 2px 8px; border-radius: 10px;">${med.form}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    doc.appendChild(medsSection);
  }

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;';
  footer.innerHTML = `
    <p style="font-size: 11px; color: #9ca3af; margin: 0;">
      This profile was generated by TARVA Health on ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}
    </p>
  `;
  doc.appendChild(footer);

  // Open print window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TARVA Health Profile - ${name}</title>
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
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

export function generateProfileLink(data: ProfileShareData): string {
  const { patientProfile, healthProfile, medications } = data;
  
  const shareData = {
    name: patientProfile?.fullName || 'Patient',
    age: healthProfile.age,
    bloodGroup: healthProfile.bloodGroup,
    conditions: healthProfile.conditions,
    medications: medications.map(m => ({ name: m.name, strength: m.strength })),
  };
  
  // Create a base64 encoded string of the data
  const encoded = btoa(JSON.stringify(shareData));
  
  // Return a shareable URL (in production this would be a real shareable link)
  return `${window.location.origin}/shared-profile?data=${encoded}`;
}

export async function shareProfile(data: ProfileShareData, method: 'pdf' | 'link'): Promise<void> {
  if (method === 'pdf') {
    await generateProfilePDF(data);
  } else {
    const link = generateProfileLink(data);
    
    if (navigator.share) {
      await navigator.share({
        title: `${data.patientProfile?.fullName || 'Patient'}'s Health Profile`,
        text: 'View my TARVA health profile',
        url: link,
      });
    } else {
      await navigator.clipboard.writeText(link);
    }
  }
}
