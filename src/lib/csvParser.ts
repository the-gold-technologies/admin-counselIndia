/**
 * High-performance RFC 4180 compliant CSV parser.
 * Handles quoted fields, escaped quotes (""), newlines within quotes, and CRLF / LF.
 */

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

export function parseCsvText(text: string): ParsedCsvResult {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push(field.trim());
        field = '';
      } else if (c === '\n' || (c === '\r' && i + 1 < len && text[i + 1] === '\n')) {
        if (c === '\r') i++;
        row.push(field.trim());
        field = '';
        if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
          rows.push(row);
        }
        row = [];
      } else if (c !== '\r') {
        field += c;
      }
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const rawHeaders = rows[0].map((h, idx) => {
    let clean = h.trim();
    if (idx === 0 && clean.charCodeAt(0) === 0xfeff) {
      clean = clean.slice(1);
    }
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1);
    }
    return clean;
  });

  const parsedRows: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < rawHeaders.length; j++) {
      const headerKey = rawHeaders[j];
      if (headerKey) {
        rowObj[headerKey] = r[j] ?? '';
      }
    }
    parsedRows.push(rowObj);
  }

  return {
    headers: rawHeaders,
    rows: parsedRows,
    totalRows: parsedRows.length,
  };
}

export function mapCsvRecordToLead(
  record: Record<string, string>,
  category: string,
  index: number
) {
  // Normalize keys: strip all spaces, underscores, hyphens, and lowercase
  const norm: Record<string, string> = {};
  for (const [k, v] of Object.entries(record)) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    norm[cleanKey] = v;
  }

  const getVal = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm[clean] !== undefined && norm[clean].trim() !== '') {
        return norm[clean].trim();
      }
    }
    return undefined;
  };

  // Id / S.No
  const liveId = getVal('id', 'leadid', 'sno', 'serialno', 'sn', 'srno', 'no');
  const sNoNum = liveId && /^\d+$/.test(liveId) ? parseInt(liveId, 10) : index + 1;

  // Name (handles Name, Full Name, User Name, User Details, Student Name, Customer Name)
  const name = getVal('name', 'fullname', 'username', 'userdetails', 'user', 'customername', 'studentname');

  // Email (handles Email, Recipient Email, Email Address, User Email, Mail)
  const email = getVal('email', 'recipientemail', 'emailaddress', 'useremail', 'mail', 'emailid');

  // Mobile / Phone (handles Phone Number, Mobile, Contact, Phone, Contact Number, Mobile No, etc.)
  const mobile = getVal(
    'phonenumber', 'phone', 'mobile', 'mobilenumber', 'contact', 'contactnumber',
    'mobileno', 'phoneno', 'telephone', 'cellphone'
  );

  // Country Code
  const countryCode = getVal('countrycode', 'dialcode', 'code');

  // Location
  const state = getVal('state', 'province', 'region');
  const city = getVal('city', 'district', 'location');

  // Marketing UTM
  const medium = getVal('medium', 'utmmedium');
  const source = getVal('source', 'utmsource');
  const content = getVal('content', 'utmcontent', 'campaign', 'utmcampaign');

  // Message / Query
  const message = getVal('message', 'query', 'feedback', 'comment', 'description', 'remarks');
  const hearFrom = getVal('hearfrom', 'wherehear', 'referral', 'reference', 'hearaboutus');

  // Course
  const courseType = getVal('coursetype', 'programtype', 'type');
  const courseName = getVal('coursename', 'course', 'program', 'workshop');

  // Added on / Date
  const addedOn = getVal('addedon', 'createdat', 'date', 'submissiondate', 'timestamp', 'createddate');

  // Extra data fields specific to Counsel India admin tabs
  const extraData: Record<string, any> = {};

  // Ebook
  const ebookName = getVal('ebookname', 'ebook');
  if (ebookName) extraData.ebookName = ebookName;

  // Newsletter
  const newsletterName = getVal('newslettername', 'newsletter');
  if (newsletterName) extraData.newsletterName = newsletterName;

  // Certificate Data
  const certificateType = getVal('certificatetype');
  if (certificateType) extraData.certificateType = certificateType;
  const marks = getVal('marks', 'score', 'percentage');
  if (marks) extraData.marks = marks;
  const viewPath = getVal('viewpath', 'certificateurl', 'pdfpath');
  if (viewPath) extraData.viewPath = viewPath;

  // Refer Enquiry
  const referByName = getVal('referbyname', 'referredbyname', 'referrername');
  if (referByName) extraData.referByName = referByName;
  const referByEmail = getVal('referbyemail', 'referredbyemail', 'referreremail');
  if (referByEmail) extraData.referByEmail = referByEmail;

  // Collect any remaining unknown columns
  const standardNormKeys = new Set([
    'id', 'leadid', 'sno', 'serialno', 'sn', 'srno', 'no',
    'name', 'fullname', 'username', 'userdetails', 'user', 'customername', 'studentname',
    'email', 'recipientemail', 'emailaddress', 'useremail', 'mail', 'emailid',
    'phonenumber', 'phone', 'mobile', 'mobilenumber', 'contact', 'contactnumber', 'mobileno', 'phoneno', 'telephone', 'cellphone',
    'countrycode', 'dialcode', 'code',
    'state', 'province', 'region',
    'city', 'district', 'location',
    'medium', 'utmmedium',
    'source', 'utmsource',
    'content', 'utmcontent', 'campaign', 'utmcampaign',
    'message', 'query', 'feedback', 'comment', 'description', 'remarks',
    'hearfrom', 'wherehear', 'referral', 'reference', 'hearaboutus',
    'coursetype', 'programtype', 'type',
    'coursename', 'course', 'program', 'workshop',
    'addedon', 'createdat', 'date', 'submissiondate', 'timestamp', 'createddate',
    'ebookname', 'ebook', 'newslettername', 'newsletter', 'certificatetype', 'marks', 'score', 'percentage', 'viewpath', 'certificateurl', 'pdfpath',
    'referbyname', 'referredbyname', 'referrername', 'referbyemail', 'referredbyemail', 'referreremail'
  ]);

  for (const [origKey, val] of Object.entries(record)) {
    const cleanKey = origKey.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!standardNormKeys.has(cleanKey) && val && val.trim() !== '') {
      extraData[origKey] = val.trim();
    }
  }

  return {
    sNo: sNoNum,
    liveId: liveId || String(index + 1),
    category,
    name: name || null,
    email: email || null,
    mobile: mobile || null,
    countryCode: countryCode || null,
    state: state || null,
    city: city || null,
    medium: medium || null,
    source: source || null,
    content: content || null,
    message: message || null,
    hearFrom: hearFrom || null,
    courseType: courseType || null,
    courseName: courseName || null,
    addedOn: addedOn || null,
    extraData: Object.keys(extraData).length > 0 ? extraData : undefined,
  };
}
