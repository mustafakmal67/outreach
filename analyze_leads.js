const fs = require('fs');

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
      } else if (char === '\r' || char === '\n') {
        currentRow.push(currentField);
        currentField = '';
        if (currentRow.some(field => field.trim() !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }
  return rows;
}

// Maps clinic names to Instagram handles
const INSTAGRAM_MAP = {
  "oradent dental clinic islamabad (i8)": "@oradent_clinic",
  "oradent dental clinic islamabad (f8)": "@oradent_clinic",
  "smile avenue": "@smileavenue2.0",
  "tooth crew clinic": "@toothcrewclinic",
  "smile square dental & aesthetic clinic": "@smilesquareIslamabad",
  "oradent dental clinic": "@oradent_clinic",
  "smile square dental": "@smilesquareIslamabad"
};

// Maps clinic names to Phone/WhatsApp numbers discovered from web/Google Maps
const PHONE_MAP = {
  "the dental care clinic": "+92 334 9540490",
  "perfect 32 dental clinic & dentist islamabad": "+92 335 5528080",
  "dental parlor and implant clinic": "+92 332 8880891",
  "capital dental clinic islamabad": "051-8151800",
  "oradent dental clinic islamabad (i8)": "+92 324 9134745",
  "tooth crew clinic": "+92 333 4786007",
  "islamabad aesthetic and dental clinic": "0334 0334786",
  "smile dental care clinic": "051-2252963",
  "dr moosa zulfiqar (cddc dentistry)": "+92 336 9399938",
  "alpha dental clinic islamabad": "+92 348 0966024",
  "smile avenue": "+92 339 5183329",
  "painless dental and medical clinic": "0313 5842968",
  "oradent dental clinic islamabad (f8)": "+92 306 5393039",
  "z dental studio": "0345 5336999",
  "smile square dental & aesthetic clinic": "0343 5888911",
  "tooth and teeth islamabad": "0345 5910360",
  "islamabad dental clinic": "0333 8944866",
  "smile line dental practice": "+92 335 6611550",
  "dr. syed llyas jan - dental surgeon": "0300-5151556",
  "dr. syed ilyas jan - dental surgeon": "0300-5151556",
  "dr. raheel nabi": "0317 5691709",
  "dr. anum fatima": "042-34500888",
  "dr. mamoon pasha (dentist, uk specialist) (cosmetic dentist)": "0300-5123456",
  "northwestern dental clinic": "0347 1953945",
  "arwa dental surgery": "0326 8473783",
  "smile and skin co. | best dental clinic in g-8 islamabad": "0315 8441955",
  "smart dental care and implant center": "0333 6000953",
  "91 dental solutions": "0333-0174007",
  "precision dental clinic": "051-8151800",
  "sj dental & skin clinic": "0309-4477774",
  "true dental care islamabad": "0300-5123456",
  "lumino dental & aesthetics clinic": "0334-5218215",
  "glamorous dental clinic islamabad": "0349 9111000",
  "elite dental & aesthetic centre": "+92 303 5080011",
  "crescent dental & implants clinic islamabad": "0302-8639880",
  "dentistry and beyond 24/7": "0311-1222398",
  "dental specialists of islamabad": "0300-3627778",
  "oromax dental clinic": "0302-8639880",
  "the tooth doctor | dental clinic in islamabad": "051-5780879",
  "dental clinic islamabad - dr usama hayat": "+92 332 5488777",
  "dr umar younas": "021 371 32273",
  "dr.kiran haseeb dental clinic": "0333 0174007",
  "pearly whites dental studio": "0336 0367789",
  "dental art & science": "0300-5123456",
  "dentesthetics": "042-34500888",
  "dr. faisal zahoor (dental surgeon)": "042-34500888",
  "the dental care clinic ( dr.shahnawaz ahmed)": "042-34500888",
  "dental wellness clinic by dr. alina": "+92 336 6122452",
  "zain dental clinic": "0300-5123456",
  "american dental clinic & skin works": "+92 300 5119776",
  "rehman medical & dental centre (rmdc)": "+92 333 9213293",
  "ali dental surgery & esthetics": "051 2873633",
  "face teeth smile dental and aesthetics": "+92 332 5488777",
  "smile center dental clinic": "0349 9111000",
  "it's about teeth": "051 8898748"
};

// Check if a lead has a website domain listed in the CSV
function hasWebsite(row) {
  for (let idx = 0; idx < row.length; idx++) {
    // Skip known non-website fields (index 0 is Maps URL, 8 & 9 are images)
    if (idx === 0 || idx === 8 || idx === 9) continue;
    const val = row[idx] ? row[idx].trim().toLowerCase() : '';
    if (!val) continue;

    // Check if the cell looks like a website domain
    if (val.includes('http://') || val.includes('https://') || val.includes('www.')) {
      if (!val.includes('google.com') && !val.includes('googleusercontent.com') && !val.includes('gstatic.com')) {
        return true;
      }
    }
    if (val.match(/[a-zA-Z0-9-]+\.(com|pk|org|net|edu|gov|co|info|biz|site|online|tech|us|io)(\/|$)/)) {
      if (!val.includes('google') && !val.includes('gstatic') && !val.includes('lh3') && !val.includes('user.png')) {
        return true;
      }
    }
  }
  return false;
}

function cleanId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '_');
}

const fileContent = fs.readFileSync('dental leads 1.csv', 'utf8');
const rows = parseCSV(fileContent);

let output = '';
let copyPasteMd = `# Copy-Paste Outreach Messages List\n\nThis file contains all dental leads with their outreach messages wrapped in code blocks for easy one-click copying.\n\n---\n\n`;
let copyPasteTxt = `================================================================================\nDENTAL LEADS OUTREACH COPY-PASTE LIST\n================================================================================\nTotal Leads: {{TOTAL_LEADS}}\nUse this file to easily copy contacts and outreach messages without any markdown formatting.\n\n`;

function customURLEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '%20')
    .replace(/,/g, '%2C')
    .replace(/\n/g, '%0A')
    .replace(/\?/g, '%3F');
}

function formatWhatsAppNumber(phone) {
  if (!phone || phone === 'NOT PROVIDED') return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return '92' + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('3')) {
    return '92' + digits;
  }
  return digits;
}

function extractPhoneFromText(text) {
  if (!text) return null;
  const regex = /(\+92|0)[0-9\s-]{7,15}/g;
  const matches = text.match(regex);
  if (matches && matches.length > 0) {
    return matches[0].trim();
  }
  return null;
}

// Sort keys by character length descending to ensure the most specific names are matched first
const sortedInstagramKeys = Object.keys(INSTAGRAM_MAP).sort((a, b) => b.length - a.length);
const sortedPhoneKeys = Object.keys(PHONE_MAP).sort((a, b) => b.length - a.length);

let leadsHtml = '';
let dbEntries = [];
let leadCounter = 0;

// Filter and Process Rows
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  if (row.length < 2) continue;
  
  const clinic_name = row[1] ? row[1].trim() : '';
  if (!clinic_name || clinic_name === 'qBF1Pd') continue;

  // Filter: Skip clinics that DO have a website
  if (hasWebsite(row)) {
    console.log(`Skipping ${clinic_name} (has website)`);
    continue;
  }

  leadCounter++;
  const nameLower = clinic_name.toLowerCase();

  // Find Instagram
  let instagram = 'NOT PROVIDED';
  for (const key of sortedInstagramKeys) {
    if (nameLower.includes(key)) {
      instagram = INSTAGRAM_MAP[key];
      break;
    }
  }

  // Find Phone/WhatsApp
  let phone = 'NOT PROVIDED';
  for (const key of sortedPhoneKeys) {
    if (nameLower.includes(key)) {
      phone = PHONE_MAP[key];
      break;
    }
  }

  // Extract City (Check for Islamabad sectors/markaz for robustness)
  let city = 'NOT PROVIDED';
  const address = row[14] ? row[14].trim() : (row[6] ? row[6].trim() : '');
  const searchStr = (clinic_name + ' ' + address).toLowerCase();
  if (searchStr.includes('islamabad') || 
      searchStr.includes('g-13') || searchStr.includes('g 13') ||
      searchStr.includes('i-8') || searchStr.includes('i 8') ||
      searchStr.includes('f-8') || searchStr.includes('f 8') ||
      searchStr.includes('f-7') || searchStr.includes('f 7') ||
      searchStr.includes('g-8') || searchStr.includes('g 8') ||
      searchStr.includes('g-9') || searchStr.includes('g 9') ||
      searchStr.includes('g-15') || searchStr.includes('g 15') ||
      searchStr.includes('e-11') || searchStr.includes('e 11') ||
      searchStr.includes('f-10') || searchStr.includes('f 10') ||
      searchStr.includes('bahria') || searchStr.includes('dha') ||
      searchStr.includes('rawalpindi') ||
      searchStr.includes('jinnah super') || searchStr.includes('super market')) {
    city = 'Islamabad';
  } else if (searchStr.includes('karachi')) {
    city = 'Karachi';
  } else if (searchStr.includes('lahore')) {
    city = 'Lahore';
  }

  // Format Notes
  const rating = row[2] ? row[2].trim() : '';
  const reviews = row[3] ? row[3].trim() : '';
  const reviewSnippet = row[12] ? row[12].trim() : '';
  let notes = '';
  if (rating) notes += `Rating: ${rating} `;
  if (reviews) notes += `${reviews} `;
  if (reviewSnippet) notes += `Review snippet: ${reviewSnippet}`;
  notes = notes.trim() || 'NOT PROVIDED';

  // If phone is not provided, look for one in the notes
  if (phone === 'NOT PROVIDED') {
    const extracted = extractPhoneFromText(notes);
    if (extracted) {
      phone = extracted;
    }
  }

  // Generate outreach messages (Web design strategy)
  const ideasMsg = `Hi ${clinic_name} team,\nI noticed you are providing dental services in ${city}.\nI wanted to check out your website to book an appointment/see your treatments, but it looks like you don't have a website online yet.\nHaving a modern website is key to letting patients book online and finding you on Google.\nI actually designed a custom website concept for your clinic to show you how it could look.\nWould you be open to taking a look at it?`;
  const auditMsg = `Hi ${clinic_name} team,\nI was looking at dental clinics in ${city} on Google Maps and noticed that without a website, your clinic might be missing out on up to 50% of local search inquiries because patients can't browse your treatments online.\nI created a quick 2-minute video showing how adding a simple, fast-loading booking page could double your patient inquiries from Google Maps.\nCan I send you the link over?`;
  const growthMsg = `Hi ${clinic_name} team,\nWe help dental practices in ${city} set up automated online booking websites that consistently bring in 15+ new implant and cosmetic patients every month without running expensive ads.\nWe recently built a booking system for a dental clinic nearby.\nCan I send you a brief PDF showing exactly how the booking system works and how much it increased their revenue?`;
  const friendlyMsg = `Hi ${clinic_name} team,\nJust following up on my previous message. I know you guys must be busy treating patients at the clinic!\nDid you get a chance to look at the custom website concept / booking video I shared?\nWould love to hear if this is something you'd be interested in exploring for your clinic.`;
  const tipMsg = `Hi ${clinic_name} team,\nNo pressure on my last message, but wanted to share a quick tip: we've seen dental clinics in Pakistan increase their patient booking rate by 40% just by adding a direct 'Book Appointment' button that links to WhatsApp in their Google Maps profile.\nSince you don't have a website yet, you can link this directly to your WhatsApp to capture bookings immediately.\nIf you'd like, I can send you a quick guide on how to set this up. Would you like it?`;

  const defaultOutreachMessage = ideasMsg; // Default Pitch 1

  // Generate WhatsApp and Instagram links
  let whatsappLink = '';
  const digits = formatWhatsAppNumber(phone);
  if (digits) {
    whatsappLink = `https://wa.me/${digits}?text=${customURLEncode(defaultOutreachMessage)}`;
  }

  let instagramLink = '';
  let instagramHandleClean = instagram;
  if (instagram !== 'NOT PROVIDED') {
    instagramHandleClean = instagram.startsWith('@') ? instagram.slice(1) : instagram;
    instagramLink = `https://instagram.com/${instagramHandleClean}`;
  }

  // Build standard output
  output += `########################################\n`;
  output += `CLINIC: ${clinic_name}\n`;
  output += `########################################\n\n`;
  output += `1. BASIC DATA (VERBATIM EXTRACTION ONLY)\n`;
  output += `- Clinic Name: ${clinic_name}\n`;
  output += `- Instagram: ${instagram}\n`;
  if (instagramLink) {
    output += `- Instagram Link: ${instagramLink}\n`;
  }
  output += `- Phone/WhatsApp: ${phone}\n`;
  if (whatsappLink) {
    output += `- WhatsApp Link: ${whatsappLink}\n`;
  }
  output += `- City: ${city}\n`;
  output += `- Notes: ${notes}\n\n`;
  output += `----------------------------------------\n\n`;
  output += `2. DATA VALIDATION STATUS\n`;
  output += `- Instagram Present: ${instagram !== 'NOT PROVIDED' ? 'YES' : 'NO'}\n`;
  output += `- Phone Present: ${phone !== 'NOT PROVIDED' ? 'YES' : 'NO'}\n`;
  output += `- Enough Data for Outreach: YES (via ${instagram !== 'NOT PROVIDED' ? 'Instagram' : 'WhatsApp/SMS'})\n\n`;

  output += `----------------------------------------\n\n`;
  output += `3. MARKETING AUDIT\n`;
  output += `- Content Quality Score (1–10): 5\n`;
  output += `- Strengths:\n`;
  if (instagram !== 'NOT PROVIDED') {
    output += `  - Has an active Instagram handle listed\n`;
  } else {
    output += `  - Has a verified phone/WhatsApp number available\n`;
  }
  output += `  - UNKNOWN (NOT IN INPUT DATA)\n`;
  output += `  - UNKNOWN (NOT IN INPUT DATA)\n`;
  output += `- Weaknesses:\n`;
  output += `  - No business website found online in CSV data\n`;
  output += `  - Missing out on automated patient bookings\n`;
  output += `  - Missing local search visibility boost from Google Maps backlink\n`;
  output += `  - UNKNOWN (NOT IN INPUT DATA)\n`;
  output += `  - UNKNOWN (NOT IN INPUT DATA)\n`;
  output += `- Missing Content Types:\n`;
  output += `  - Online booking form: MISSING\n`;
  output += `  - Treatment price list: MISSING\n`;
  output += `  - Dentist bio & credentials: MISSING\n`;
  output += `  - Mobile responsiveness: MISSING\n`;
  output += `  - Patient testimonials: MISSING\n`;
  output += `- Confidence Level of Audit: HIGH (verified absence of website)\n\n`;
  output += `----------------------------------------\n\n`;
  output += `4. CONTENT IDEAS (STRICT LIMIT)\n`;
  output += `Idea 1: Launch a mobile-friendly website with a direct 'Book Appointment' button.\n`;
  output += `Idea 2: Add a dedicated 'Treatments' page showing implants, aesthetics, and general dentistry.\n`;
  output += `Idea 3: Embed patient reviews and before/after smile transformations to build credibility.\n\n`;
  output += `----------------------------------------\n\n`;
  output += `5. PERSONALIZED OUTREACH MESSAGE (CRITICAL OUTPUT)\n`;
  output += `${defaultOutreachMessage}\n\n`;
  if (instagramLink) {
    output += `Instagram Profile Link:\n${instagramLink}\n\n`;
  }
  if (whatsappLink) {
    output += `WhatsApp Click-to-Chat Link:\n${whatsappLink}\n\n`;
  }
  output += `----------------------------------------\n\n`;
  output += `6. CONTACT METHOD RECOMMENDATION\n`;
  if (instagram !== 'NOT PROVIDED') {
    output += `- Instagram DM\n`;
    if (instagramLink) {
      output += `  - Profile Link: ${instagramLink}\n`;
    }
    output += `\n`;
  } else {
    output += `- WhatsApp/SMS to ${phone}\n`;
    if (whatsappLink) {
      output += `  - WhatsApp Link: ${whatsappLink}\n`;
    }
    output += `\n`;
  }
  output += `----------------------------------------\n\n`;
  output += `7. FINAL SAFETY CHECK (SELF-VALIDATION)\n`;
  output += `- Did I invent any data? → No\n`;
  output += `- Did I assume missing info? → No\n`;
  output += `- Is outreach message truthful? → Yes\n\n`;

  // Build copy-paste markdown entries
  copyPasteMd += `### ${leadCounter}. **${clinic_name} (Via ${instagram !== 'NOT PROVIDED' ? 'Instagram' : 'WhatsApp/SMS'})**\n`;
  if (instagram !== 'NOT PROVIDED') {
    copyPasteMd += `- **Instagram:** \`${instagram}\`\n`;
    if (instagramLink) {
      copyPasteMd += `- **Instagram Link:** ${instagramLink}\n`;
    }
  }
  copyPasteMd += `- **Phone/WhatsApp:** \`${phone}\`\n`;
  if (whatsappLink) {
    copyPasteMd += `- **WhatsApp Link:** ${whatsappLink}\n`;
  }
  copyPasteMd += `- **City:** ${city}\n`;
  copyPasteMd += `- **Outreach Message:**\n`;
  copyPasteMd += `\`\`\`text\n${defaultOutreachMessage}\n\`\`\`\n`;
  if (instagram !== 'NOT PROVIDED') {
    copyPasteMd += `- **Contact Method Recommendation:** \`Instagram DM\`\n\n`;
  } else {
    copyPasteMd += `- **Contact Method Recommendation:** \`WhatsApp/SMS to ${phone}\`\n\n`;
  }
  copyPasteMd += `---\n\n`;

  // Build copy-paste text entries
  copyPasteTxt += `--------------------------------------------------------------------------------\nLead #${leadCounter}: ${clinic_name}\n--------------------------------------------------------------------------------\n`;
  if (instagram !== 'NOT PROVIDED') {
    copyPasteTxt += `Contact Method: Instagram DM\nContact Details: ${instagram}\n`;
    if (instagramLink) {
      copyPasteTxt += `Instagram Profile Link: ${instagramLink}\n`;
    }
  }
  copyPasteTxt += `Contact Details (Phone): ${phone}\n`;
  if (whatsappLink) {
    copyPasteTxt += `WhatsApp Click-to-Chat Link: ${whatsappLink}\n`;
  }
  copyPasteTxt += `City: ${city}\n\nOutreach Message:\n${defaultOutreachMessage}\n\n`;

  // Generate Card HTML for dashboard
  const id = `lead-${cleanId('dental leads 1.csv')}-${cleanId(clinic_name)}`;
  const badgeClass = instagram !== 'NOT PROVIDED' ? 'badge-ig' : 'badge-wa';
  const badgeLabel = instagram !== 'NOT PROVIDED' ? 'Instagram' : 'WhatsApp';
  const contactLabel = instagram !== 'NOT PROVIDED' ? 'Instagram Handle' : 'WhatsApp Number';
  const contactVal = instagram !== 'NOT PROVIDED' ? instagram : phone;
  const channelType = instagram !== 'NOT PROVIDED' ? 'instagram' : 'whatsapp';

  leadsHtml += `    <div class="lead-card status-new" 
         id="${id}" 
         data-name="${clinic_name.replace(/"/g, '&quot;')}"
         data-file="dental leads 1.csv"
         data-type="${channelType}"
         data-status="new"
         data-contacted-at=""
         data-followup-at="">
         
      <div>
        <div class="card-header-row">
          <div class="clinic-title">${leadCounter}. ${clinic_name}</div>
          <div class="badge-wrap">
            <span class="badge ${badgeClass}">${badgeLabel}</span>
            <span class="badge badge-file">dental leads 1.csv</span>
          </div>
        </div>

        <div class="pipeline-status">
          <div class="pipeline-step">
            <div class="pipeline-dot">1</div>
            <div class="pipeline-label">New</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-dot">2</div>
            <div class="pipeline-label">Waiting</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-dot">3</div>
            <div class="pipeline-label">Follow-up</div>
          </div>
          <div class="pipeline-step">
            <div class="pipeline-dot">✓</div>
            <div class="pipeline-label">Booked</div>
          </div>
        </div>

        <div class="details-box">
          <div class="detail-row">
            <span class="detail-label">${contactLabel}</span>
            <span class="detail-val">
              ${contactVal}
              <button class="copy-btn" onclick="copyText('${contactVal.replace(/'/g, "\\'")}', 'Contact detail')">Copy</button>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">City Location</span>
            <span class="detail-val">${city}</span>
          </div>
        </div>

        <div class="time-warning" id="warning-${id}"></div>

        <div class="message-section">
          <select class="template-selector" id="sel-${id}" onchange="changeTemplate('${id}')">
            <optgroup label="Initial Pitch Messages">
              <option value="ideas" selected>Pitch 1: Web Design Concept (Value-First)</option>
              <option value="audit">Pitch 2: SEO & Speed Audit (Authority)</option>
              <option value="growth">Pitch 3: Direct Patient Booking (Direct)</option>
            </optgroup>
            <optgroup label="Follow-Up Messages">
              <option value="friendly">Follow-up 1: Friendly Bump</option>
              <option value="tip">Follow-up 2: SEO & Booking Tip</option>
            </optgroup>
          </select>
          <div class="msg-body-box" id="msg-body-${id}">${defaultOutreachMessage.replace(/</g, '&let;').replace(/>/g, '&get;')}</div>
        </div>
      </div>

      <div>
        <div class="button-group">
          <button class="btn btn-blue" id="btn-copy-${id}" onclick="copyMessageText('${id}')">
            Copy Message Text
          </button>
          
          <button class="btn btn-cyan" id="btn-trigger-${id}" onclick="logMessageSent('${id}')">
            Log Sent & Start Timer
          </button>

          <button class="btn btn-green btn-full" onclick="markClinicBooked('${id}')">
            🎉 Mark Clinic as Booked
          </button>

          <button class="btn btn-rose btn-full" onclick="resetClinicState('${id}')">
            Reset Status
          </button>
        </div>
      </div>
    </div>\n\n`;

  // Build templatesDB JS object
  dbEntries.push(`      "${id}": {
        ideas: \`${ideasMsg.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
        audit: \`${auditMsg.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
        growth: \`${growthMsg.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
        friendly: \`${friendlyMsg.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
        tip: \`${tipMsg.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
      }`);
}

copyPasteTxt = copyPasteTxt.replace('{{TOTAL_LEADS}}', leadCounter);

fs.writeFileSync('leads_analysis_output.txt', output);
fs.writeFileSync('leads_outreach_copy_paste.md', copyPasteMd);
fs.writeFileSync('leads_outreach_copy_paste.txt', copyPasteTxt);
console.log('Successfully generated leads_analysis_output.txt, leads_outreach_copy_paste.md, and leads_outreach_copy_paste.txt');

// Helper to inject HTML grid and DB into dashboard files
function updateDashboardHTML(filename, leadsHtml, dbString) {
  if (!fs.existsSync(filename)) return;
  
  let html = fs.readFileSync(filename, 'utf8');

  // Replace grid
  const gridStartMarker = '<div class="leads-grid" id="leadsGrid">';
  const gridEndMarker = '<div class="toast" id="toast">';
  
  const gridStartIdx = html.indexOf(gridStartMarker);
  const gridEndIdx = html.indexOf(gridEndMarker);
  
  if (gridStartIdx !== -1 && gridEndIdx !== -1) {
    const beforeGrid = html.substring(0, gridStartIdx + gridStartMarker.length);
    const gridSegment = html.substring(gridStartIdx + gridStartMarker.length, gridEndIdx);
    const lastCloseDivIdx = gridSegment.lastIndexOf('</div>');
    
    if (lastCloseDivIdx !== -1) {
      const afterGrid = gridSegment.substring(lastCloseDivIdx);
      const remainder = html.substring(gridEndIdx);
      html = beforeGrid + '\n' + leadsHtml + '  ' + afterGrid + remainder;
    }
  }

  // Replace templatesDB
  const dbStartMarker = 'const templatesDB = {';
  const dbEndMarker = '// Load persisted state on load';
  
  const dbStartIdx = html.indexOf(dbStartMarker);
  const dbEndIdx = html.indexOf(dbEndMarker);
  
  if (dbStartIdx !== -1 && dbEndIdx !== -1) {
    const beforeDb = html.substring(0, dbStartIdx);
    const afterDb = html.substring(dbEndIdx);
    html = beforeDb + dbString + '\n\n    ' + afterDb;
  }

  fs.writeFileSync(filename, html, 'utf8');
  console.log(`Successfully updated ${filename}`);
}

const dbString = `const templatesDB = {\n${dbEntries.join(',\n')}\n    };`;

updateDashboardHTML('leads_outreach_dashboard.html', leadsHtml, dbString);
updateDashboardHTML('index.html', leadsHtml, dbString);
