/**
 * High-performance RFC 4180 compliant CSV parser.
 * Handles quoted fields, escaped quotes (""), newlines within quotes, and CRLF / LF.
 */

export interface ParsedCsvResult {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
}

/**
 * Remove NUL bytes (\0 / \u0000) and other invalid control characters
 * that cause PostgreSQL UTF-8 encoding errors (e.g., 0x00).
 */
export function sanitizeString(val: any): any {
  if (typeof val === "string") {
    return val
      .replace(/\0/g, "")
      .replace(/\\u0000/g, "")
      .replace(/\u0000/g, "");
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeString);
  }
  if (val !== null && typeof val === "object") {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      const cleanKey = k
        .replace(/\0/g, "")
        .replace(/\\u0000/g, "")
        .replace(/\u0000/g, "");
      cleanObj[cleanKey] = sanitizeString(v);
    }
    return cleanObj;
  }
  return val;
}

function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Automatically repairs known malformed or shifted header rows from Counsel India CSV exports.
 */
export function detectAndFixHeaders(
  rawHeaders: string[],
  sampleRows: string[][],
): string[] {
  if (!rawHeaders || rawHeaders.length === 0) return rawHeaders;
  const norm = rawHeaders.map(normalizeKey);

  // Determine the most common row length in sample rows
  const lengthCounts: Record<number, number> = {};
  for (const row of sampleRows.slice(0, 25)) {
    if (row.length > 0) {
      lengthCounts[row.length] = (lengthCounts[row.length] || 0) + 1;
    }
  }
  let maxColCount = rawHeaders.length;
  let maxFreq = 0;
  for (const [lenStr, freq] of Object.entries(lengthCounts)) {
    const len = Number(lenStr);
    if (freq > maxFreq) {
      maxFreq = freq;
      maxColCount = len;
    }
  }

  // Signature 1: Contact Us export (contact2026-...)
  // Raw header has 5 cols: Name, Email, Message, Hear From, AddedAt
  // Data has 6 cols: [Name, Email, Mobile, Message, Hear From, AddedAt]
  if (
    rawHeaders.length === 5 &&
    maxColCount === 6 &&
    norm[0] === "name" &&
    norm[1] === "email" &&
    norm[2] === "message" &&
    norm[3] === "hearfrom" &&
    (norm[4] === "addedat" || norm[4] === "addedon" || norm[4] === "date")
  ) {
    return [
      "Name",
      "Email",
      "Mobile",
      "Message",
      "Hear From",
      rawHeaders[4] || "AddedAt",
    ];
  }

  // Signature 2: Book a Session / Counsellor Contact export (counsellorcontact2026-...)
  // Raw header has 7 cols: Name, Email, country_code, state_id, city_id, Hear From, AddedAt
  // Data has 8 cols: [Name, Email, Mobile, Hear From, country_code, state_id, city_id, AddedAt]
  if (
    rawHeaders.length === 7 &&
    maxColCount === 8 &&
    norm[0] === "name" &&
    norm[1] === "email" &&
    norm[2] === "countrycode" &&
    norm[3] === "stateid" &&
    norm[4] === "cityid" &&
    norm[5] === "hearfrom"
  ) {
    return [
      "Name",
      "Email",
      "Mobile",
      "Hear From",
      "country_code",
      "state_id",
      "city_id",
      rawHeaders[6] || "AddedAt",
    ];
  }

  // Signature 3: General missing Mobile column after Email when data has 1 extra column
  if (
    maxColCount === rawHeaders.length + 1 &&
    norm[0] === "name" &&
    norm[1] === "email"
  ) {
    const looksLikePhone = sampleRows.slice(0, 10).some((r) => {
      const val = (r[2] || "").trim();
      return /^\+?\d{7,15}$/.test(val.replace(/[\s\-]/g, ""));
    });
    const header2IsPhone = [
      "mobile",
      "phone",
      "phonenumber",
      "mobilenumber",
      "contact",
      "contactnumber",
      "mobileno",
      "phoneno",
    ].includes(norm[2]);

    if (looksLikePhone && !header2IsPhone) {
      const fixed = [...rawHeaders];
      fixed.splice(2, 0, "Mobile");
      return fixed;
    }
  }

  // Signature 4: Personality Test export (State header exists in table THs, but data rows have only 11 columns, Date is at col 8)
  if (
    rawHeaders.length === 12 &&
    (maxColCount === 11 ||
      (sampleRows.length > 0 &&
        sampleRows.slice(0, 5).some((r) => r.length === 11))) &&
    norm[0] === "id" &&
    norm[6] === "probackground" &&
    (norm[7] === "purposegivetest" || norm[7] === "purpose")
  ) {
    return [
      "#Id",
      "Name",
      "Email",
      "Mobile",
      "Gender",
      "Age",
      "Pro Background",
      "Purpose Give Test",
      "Date",
      "Result",
      "Here From",
    ];
  }

  // Pad any extra columns with Extra_N so no data is dropped
  if (maxColCount > rawHeaders.length) {
    const fixed = [...rawHeaders];
    for (let i = rawHeaders.length; i < maxColCount; i++) {
      fixed.push(`Extra_${i + 1}`);
    }
    return fixed;
  }

  return rawHeaders;
}

export function parseCsvText(text: string): ParsedCsvResult {
  // Strip null bytes and UTF-8 0x00 invalid sequences
  const sanitizedText = sanitizeString(text) as string;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const len = sanitizedText.length;

  for (let i = 0; i < len; i++) {
    const c = sanitizedText[i];

    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < len && sanitizedText[i + 1] === '"') {
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
      } else if (c === ",") {
        row.push(field.trim());
        field = "";
      } else if (
        c === "\n" ||
        (c === "\r" && i + 1 < len && sanitizedText[i + 1] === "\n")
      ) {
        if (c === "\r") i++;
        row.push(field.trim());
        field = "";
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
          rows.push(row);
        }
        row = [];
      } else if (c !== "\r") {
        field += c;
      }
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
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

  const fixedHeaders = detectAndFixHeaders(rawHeaders, rows.slice(1, 30));

  const parsedRows: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rowObj: Record<string, string> = {};
    for (let j = 0; j < fixedHeaders.length; j++) {
      const headerKey = fixedHeaders[j];
      if (headerKey) {
        rowObj[headerKey] = r[j] ?? "";
      }
    }
    parsedRows.push(rowObj);
  }

  return {
    headers: fixedHeaders,
    rows: parsedRows,
    totalRows: parsedRows.length,
  };
}

export function mapCsvRecordToLead(
  record: Record<string, string>,
  category: string,
  index: number,
) {
  // Normalize keys: strip all spaces, underscores, hyphens, and lowercase
  const norm: Record<string, string> = {};
  for (const [k, v] of Object.entries(record)) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
    norm[cleanKey] = sanitizeString(v) ?? "";
  }

  const getVal = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const clean = k.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (norm[clean] !== undefined && norm[clean].trim() !== "") {
        return norm[clean].trim();
      }
    }
    return undefined;
  };

  // Id / S.No
  const liveId = getVal("id", "leadid", "sno", "serialno", "sn", "srno", "no");
  const sNoNum =
    liveId && /^\d+$/.test(liveId) ? parseInt(liveId, 10) : index + 1;

  // Name (handles Name, Full Name, User Name, User Details, Student Name, Customer Name)
  const name = getVal(
    "name",
    "fullname",
    "username",
    "userdetails",
    "user",
    "customername",
    "studentname",
  );

  // Email (handles Email, Recipient Email, Email Address, User Email, Mail)
  const email = getVal(
    "email",
    "recipientemail",
    "emailaddress",
    "useremail",
    "mail",
    "emailid",
  );

  // Mobile / Phone (handles Phone Number, Mobile, Contact, Phone, Contact Number, Mobile No, etc.)
  const mobile = getVal(
    "phonenumber",
    "phone",
    "mobile",
    "mobilenumber",
    "contact",
    "contactnumber",
    "mobileno",
    "phoneno",
    "telephone",
    "cellphone",
    "cell",
    "contactno",
    "whatsappnumber",
  );

  // Country Code
  const countryCode = getVal("countrycode", "country_code", "dialcode", "code");

  // Location
  const state = getVal(
    "state",
    "stateid",
    "state_id",
    "statename",
    "province",
    "region",
  );
  const city = getVal(
    "city",
    "cityid",
    "city_id",
    "cityname",
    "district",
    "location",
    "place",
  );

  // Marketing UTM / Type
  const medium = getVal("medium", "utmmedium", "type");
  const rawSource = getVal("source", "utmsource");
  const content = getVal("content", "utmcontent", "campaign", "utmcampaign");

  // Message / Query / Question
  const message = getVal(
    "message",
    "query",
    "question",
    "userquestion",
    "feedback",
    "comment",
    "description",
    "remarks",
  );
  const rawHearFrom = getVal(
    "hearfrom",
    "herefrom",
    "wherehear",
    "referral",
    "reference",
    "hearaboutus",
    "hear_from",
    "here_from",
    "source",
  );

  // Harmonize source and hearFrom: if one is present, fallback to the other
  const source = rawSource || rawHearFrom;
  const hearFrom = rawHearFrom || rawSource;

  // Course
  const courseType = getVal("coursetype", "programtype", "type");
  const courseName = getVal(
    "coursename",
    "course",
    "program",
    "workshop",
    "courseid",
    "course_id",
    "courserefer",
    "course_refer",
  );

  // Added on / Date / Updated At
  const addedOn = getVal(
    "addedon",
    "addedat",
    "createdat",
    "date",
    "submissiondate",
    "timestamp",
    "createddate",
    "updatedat",
    "updatedon",
    "updated_at",
    "updated_on",
  );

  // Extra data fields specific to Counsel India admin tabs
  const extraData: Record<string, any> = {};

  // Ebook
  const ebookName = getVal("ebookname", "ebook");
  if (ebookName) extraData.ebookName = ebookName;

  // Newsletter
  const newsletterName = getVal("newslettername", "newsletter");
  if (newsletterName) extraData.newsletterName = newsletterName;

  // Certificate Data & Result
  const certificateType = getVal("certificatetype");
  if (certificateType) extraData.certificateType = certificateType;
  const marks = getVal(
    "marks",
    "score",
    "percentage",
    "result",
    "testresult",
    "test_result",
  );
  if (marks) extraData.marks = marks;
  const viewPath = getVal(
    "viewpath",
    "view_path",
    "certificateurl",
    "certificate_url",
    "pdfpath",
    "pdf_path",
    "pdfurl",
    "pdf_url",
    "pdf",
    "url",
    "filepath",
    "file_path",
  );
  if (viewPath) extraData.viewPath = viewPath;

  // Refer Enquiry
  const referByName = getVal(
    "referbyname",
    "referredbyname",
    "referrername",
    "refer_by_name",
  );
  if (referByName) extraData.referByName = referByName;
  const referByEmail = getVal(
    "referbyemail",
    "referredbyemail",
    "referreremail",
    "refer_by_email",
  );
  if (referByEmail) extraData.referByEmail = referByEmail;
  const referByPhone = getVal(
    "referbyphone",
    "referredbyphone",
    "referrerphone",
    "refer_by_phone",
  );
  if (referByPhone) extraData.referByPhone = referByPhone;
  const courseRefer = getVal(
    "courserefer",
    "course_refer",
    "referredcourse",
    "refercourse",
  );
  if (courseRefer) extraData.courseRefer = courseRefer;

  // Synthesize message for refer-enquiry if not explicitly given
  let finalMessage = message;
  if (
    !finalMessage &&
    (referByName || referByEmail || referByPhone || courseRefer)
  ) {
    const parts: string[] = [];
    if (referByName) parts.push(`Name: ${referByName}`);
    if (referByEmail) parts.push(`Email: ${referByEmail}`);
    if (referByPhone) parts.push(`Phone: ${referByPhone}`);
    if (courseRefer) parts.push(`Course: ${courseRefer}`);
    finalMessage = parts.join(" | ");
  }

  // Leadform data
  const leadName = getVal("leadname");
  if (leadName) extraData.leadName = leadName;

  // Personality test fields
  const gender = getVal("gender", "sex");
  if (gender) extraData.gender = gender;
  const age = getVal("age");
  if (age) extraData.age = age;
  const proBackground = getVal("probackground", "profession", "background");
  if (proBackground) extraData.proBackground = proBackground;
  const purpose = getVal(
    "purpose",
    "purposegivetest",
    "purpose_give_test",
    "give_test",
    "givetest",
    "purposetest",
  );
  if (purpose) extraData.purpose = purpose;

  // Collect any remaining unknown columns
  const standardNormKeys = new Set([
    "id",
    "leadid",
    "sno",
    "serialno",
    "sn",
    "srno",
    "no",
    "name",
    "fullname",
    "username",
    "userdetails",
    "user",
    "customername",
    "studentname",
    "email",
    "recipientemail",
    "emailaddress",
    "useremail",
    "mail",
    "emailid",
    "phonenumber",
    "phone",
    "mobile",
    "mobilenumber",
    "contact",
    "contactnumber",
    "mobileno",
    "phoneno",
    "telephone",
    "cellphone",
    "cell",
    "contactno",
    "whatsappnumber",
    "countrycode",
    "country_code",
    "dialcode",
    "code",
    "state",
    "stateid",
    "state_id",
    "statename",
    "province",
    "region",
    "city",
    "cityid",
    "city_id",
    "cityname",
    "district",
    "location",
    "place",
    "medium",
    "utmmedium",
    "source",
    "utmsource",
    "content",
    "utmcontent",
    "campaign",
    "utmcampaign",
    "message",
    "query",
    "question",
    "userquestion",
    "feedback",
    "comment",
    "description",
    "remarks",
    "hearfrom",
    "herefrom",
    "wherehear",
    "referral",
    "reference",
    "hearaboutus",
    "hear_from",
    "here_from",
    "coursetype",
    "programtype",
    "type",
    "coursename",
    "course",
    "program",
    "workshop",
    "courseid",
    "course_id",
    "addedon",
    "addedat",
    "createdat",
    "date",
    "submissiondate",
    "timestamp",
    "createddate",
    "updatedat",
    "updatedon",
    "updated_at",
    "updated_on",
    "ebookname",
    "ebook",
    "newslettername",
    "newsletter",
    "certificatetype",
    "marks",
    "score",
    "percentage",
    "result",
    "testresult",
    "viewpath",
    "view_path",
    "certificateurl",
    "certificate_url",
    "pdfpath",
    "pdf_path",
    "pdfurl",
    "pdf_url",
    "pdf",
    "url",
    "filepath",
    "file_path",
    "referbyname",
    "referredbyname",
    "referrername",
    "referbyemail",
    "referredbyemail",
    "referreremail",
    "referbyphone",
    "referredbyphone",
    "referrerphone",
    "courserefer",
    "course_refer",
    "referredcourse",
    "refercourse",
    "leadname",
    "gender",
    "sex",
    "age",
    "probackground",
    "profession",
    "background",
    "purpose",
    "purposegivetest",
  ]);

  for (const [origKey, val] of Object.entries(record)) {
    const cleanKey = origKey.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!standardNormKeys.has(cleanKey) && val && val.trim() !== "") {
      extraData[origKey] = sanitizeString(val.trim());
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
    message: finalMessage || null,
    hearFrom: hearFrom || null,
    courseType: courseType || null,
    courseName: courseName || null,
    addedOn: addedOn || null,
    extraData:
      Object.keys(extraData).length > 0 ? sanitizeString(extraData) : undefined,
  };
}
