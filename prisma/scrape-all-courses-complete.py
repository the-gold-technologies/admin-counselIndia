import requests
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor

session = requests.Session()
r = session.get('https://admin.counselindia.com/')
token_match = re.search(r'name="_token" value="([^"]+)"', r.text)
token = token_match.group(1) if token_match else ''
session.post('https://admin.counselindia.com/admin/check', data={
    '_token': token,
    'email': 'superadmin@counselindia.com',
    'password': '2026@AdminCounsel'
})

courses_ordered = []
sno = 1
for page in [1, 2]:
    resp = session.get(f'https://admin.counselindia.com/admin/ContentManagement/course?page={page}')
    tbody = re.search(r'<tbody[^>]*>(.*?)</tbody>', resp.text, re.DOTALL)
    if not tbody: continue
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', tbody.group(1), re.DOTALL)
    for r_row in rows:
        tds = re.findall(r'<td[^>]*>(.*?)</td>', r_row, re.DOTALL)
        if len(tds) < 6: continue
        
        cname = re.sub(r'<[^>]+>', '', tds[1]).strip()
        details_td = tds[2]
        cat_m = re.search(r'Catgeory:\s*([^<]+)', details_td)
        category = cat_m.group(1).strip().replace('&#039;', "'") if cat_m else ''
        added_m = re.search(r'Added On:\s*([^<]+)', details_td)
        added_on = added_m.group(1).strip() if added_m else ''
        pos = re.sub(r'<[^>]+>', '', tds[3]).strip()
        status = re.sub(r'<[^>]+>', '', tds[4]).strip()
        edit_m = re.search(r'edit_course/(\d+)', tds[5])
        live_id = edit_m.group(1) if edit_m else ''
        
        courses_ordered.append({
            'sNo': sno,
            'liveId': live_id,
            'name': cname,
            'category': category,
            'position': int(pos) if pos.isdigit() else 1,
            'status': status,
            'addedOn': added_on
        })
        sno += 1

print(f"Found {len(courses_ordered)} courses from course list table.")

def extract_media(html, field_name):
    pos = html.find(f'name="{field_name}"')
    if pos == -1: return ''
    chunk = html[pos:pos+700]
    embed_m = re.search(r'embed\s+src=[\"\']([^\"\']+)[\"\']', chunk)
    if embed_m: return embed_m.group(1).strip()
    a_m = re.search(r'href=[\"\'](https://prod-s3\.counselindia\.com/[^\"\']+)[\"\']', chunk)
    if a_m: return a_m.group(1).strip()
    img_m = re.search(r'src=[\"\'](https://prod-s3\.counselindia\.com/[^\"\']+)[\"\']', chunk)
    if img_m: return img_m.group(1).strip()
    s3_m = re.search(r'(https://prod-s3\.counselindia\.com/[^\s\"\'<>]+)', chunk)
    if s3_m: return s3_m.group(1).strip()
    return ''

def get_input_val(html, name):
    m = re.search(rf'name="{name}"[^>]*value="([^"]*)"', html)
    if not m:
        m = re.search(rf'value="([^"]*)"[^>]*name="{name}"', html)
    return m.group(1).strip() if m else ''

def get_textarea_val(html, name):
    m = re.search(rf'<textarea[^>]*name="{name}"[^>]*>(.*?)</textarea>', html, re.DOTALL)
    return m.group(1).strip() if m else ''

def enrich_course(course):
    cid = course['liveId']
    if not cid: return course
    
    # 1. Edit course page
    edit_url = f'https://admin.counselindia.com/admin/ContentManagement/edit_course/{cid}'
    try:
        e_resp = session.get(edit_url, timeout=15)
        html = e_resp.text
        
        # Images & Media
        course['coverImage'] = extract_media(html, 'cover_image')
        course['backgroundImage'] = extract_media(html, 'background_image')
        course['coverImageApp'] = extract_media(html, 'cover_image_app')
        course['backgroundImageApp'] = extract_media(html, 'background_image_app')
        course['brochure'] = extract_media(html, 'brochure')
        course['scSchemePdf'] = extract_media(html, 'sc_scheme_pdf')

        # Form fields
        course['slug'] = get_input_val(html, 'slug')
        course['rating'] = get_input_val(html, 'rating')
        course['duration'] = get_input_val(html, 'duration')
        course['listDuration'] = get_input_val(html, 'list_duration')
        course['enrolment'] = get_input_val(html, 'enrolment')
        course['lessons'] = get_input_val(html, 'lessons')
        course['nextBatchDate'] = get_input_val(html, 'next_batch_start')
        course['totalProgramFee'] = get_input_val(html, 'total_program_fee')
        course['totalDiscountFee'] = get_input_val(html, 'total_discount_fee')
        course['totalDiscountPercent'] = get_input_val(html, 'total_discount_percent')
        course['oneTimeFee'] = get_input_val(html, 'one_time_fee')
        course['oneTimeDiscountFee'] = get_input_val(html, 'one_time_discount_fee')
        course['oneTimeDiscountPercent'] = get_input_val(html, 'one_time_discount_percent')
        course['startRange'] = get_input_val(html, 'start_range')
        course['endRange'] = get_input_val(html, 'end_range')
        course['paymentLink'] = get_input_val(html, 'payment_link')
        
        # Textareas
        course['subdescription'] = get_textarea_val(html, 'subdescription')
        course['aboutUs'] = get_textarea_val(html, 'about_us')
        course['mepscAbout'] = get_textarea_val(html, 'mepsc_about')
        course['universityAdvantage'] = get_textarea_val(html, 'university_advantage')
        course['howWillBenefit'] = get_textarea_val(html, 'how_will_this_program_benefit_you')
        course['ojt'] = get_textarea_val(html, 'ojt')
        course['mentorshipGuide'] = get_textarea_val(html, 'mentorship_guide')
        course['dreamJob'] = get_textarea_val(html, 'get_your_dream_job')
        course['whoCanJoin'] = get_textarea_val(html, 'whocanjoin') or get_input_val(html, 'whocanjoin')

        # Headings
        h_names = re.findall(r'name="heading\[\]"[^>]*value="([^"]*)"', html)
        h_vals = re.findall(r'name="headingvalue\[\]"[^>]*value="([^"]*)"', html)
        course['headings'] = [{'heading': h_names[i], 'value': h_vals[i]} for i in range(min(len(h_names), len(h_vals))) if h_names[i].strip() or h_vals[i].strip()]

        ch_names = re.findall(r'name="cheading\[\]"[^>]*value="([^"]*)"', html)
        ch_vals = re.findall(r'name="cheadingvalue\[\]"[^>]*value="([^"]*)"', html)
        course['cheadings'] = [{'heading': ch_names[i], 'value': ch_vals[i]} for i in range(min(len(ch_names), len(ch_vals))) if ch_names[i].strip() or ch_vals[i].strip()]
    except Exception as e:
        print(f"Error enriching course {cid}: {e}")

    # Sub modules
    def scrape_sub(url, sub_type):
        try:
            s_resp = session.get(url, timeout=10)
            stbody = re.search(r'<tbody[^>]*>(.*?)</tbody>', s_resp.text, re.DOTALL)
            if not stbody: return []
            srows = re.findall(r'<tr[^>]*>(.*?)</tr>', stbody.group(1), re.DOTALL)
            items = []
            for sr in srows:
                std = re.findall(r'<td[^>]*>(.*?)</td>', sr, re.DOTALL)
                if len(std) >= 4:
                    clean_tds = [re.sub(r'<[^>]+>', '', x).strip() for x in std]
                    img = re.search(r'src=["\'](https://prod-s3\.counselindia\.com/[^"\']+)["\']', sr)
                    if not img:
                        img = re.search(r'href=["\'](https://prod-s3\.counselindia\.com/[^"\']+)["\']', sr)
                    
                    pos_val = '1'
                    status_val = 'Active'
                    type_val = sub_type
                    
                    if sub_type in ['overview', 'learn']:
                        title_val = clean_tds[1]
                        type_val = clean_tds[2] if len(clean_tds) > 2 and clean_tds[2] else 'key_features'
                        pos_val = clean_tds[3] if len(clean_tds) > 3 else '1'
                        status_val = clean_tds[4] if len(clean_tds) > 4 else 'Active'
                    elif sub_type == 'credential':
                        title_val = clean_tds[1]
                        pos_val = clean_tds[3] if len(clean_tds) > 3 else '1'
                        status_val = clean_tds[4] if len(clean_tds) > 4 else 'Active'
                    elif sub_type == 'curriculum':
                        title_val = clean_tds[1]
                        pos_val = clean_tds[2] if len(clean_tds) > 2 else '1'
                        status_val = clean_tds[3] if len(clean_tds) > 3 else 'Active'
                    else:
                        title_val = clean_tds[1]

                    items.append({
                        'title': title_val,
                        'type': type_val,
                        'position': pos_val,
                        'status': status_val,
                        'image': img.group(1) if img else ''
                    })
            return items
        except Exception:
            return []

    course['overviewItems'] = scrape_sub(f'https://admin.counselindia.com/admin/ContentManagement/course_overview/{cid}', 'overview')
    course['learnItems'] = scrape_sub(f'https://admin.counselindia.com/admin/ContentManagement/course_learn/{cid}', 'learn')
    course['credentialItems'] = scrape_sub(f'https://admin.counselindia.com/admin/ContentManagement/credential/{cid}', 'credential')
    course['curriculumItems'] = scrape_sub(f'https://admin.counselindia.com/admin/ContentManagement/curriculam/{cid}', 'curriculum')

    course['overviewCount'] = len(course['overviewItems'])
    course['learnCount'] = len(course['learnItems'])
    course['credentialCount'] = len(course['credentialItems'])
    course['curriculumCount'] = len(course['curriculumItems'])

    return course

print("Enriching all 43 courses in parallel...")
with ThreadPoolExecutor(max_workers=6) as executor:
    results = list(executor.map(enrich_course, courses_ordered))

results.sort(key=lambda x: x['sNo'])

with open('/Users/sudeeshkumar/Desktop/TGT COMPANY/counselIndia-Admin/prisma/courses-complete-data.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Saved complete enriched data for all 43 courses with images, PDFs, textareas and sub-modules!")
media_count = sum(1 for c in results if c.get('coverImage') or c.get('backgroundImage') or c.get('brochure'))
print(f"Total courses with media: {media_count}/{len(results)}")
for c in results[:6]:
    print(f"#{c['sNo']} | {c['name']} | cover={bool(c.get('coverImage'))} | bg={bool(c.get('backgroundImage'))} | brochure={bool(c.get('brochure'))}")
