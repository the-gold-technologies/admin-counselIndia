import requests
import re
import json
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

with open('/Users/sudeeshkumar/Desktop/TGT COMPANY/counselIndia-Admin/prisma/courses-complete-data.json', 'r') as f:
    courses = json.load(f)

def clean_url(u):
    if not u: return ''
    return u.strip().replace(' ', '%20')

def scrape_sub(cid, sub_type):
    url = f'https://admin.counselindia.com/admin/ContentManagement/{sub_type}/{cid}'
    try:
        s_resp = session.get(url, timeout=12)
        stbody = re.search(r'<tbody[^>]*>(.*?)</tbody>', s_resp.text, re.DOTALL)
        if not stbody: return []
        srows = re.findall(r'<tr[^>]*>(.*?)</tr>', stbody.group(1), re.DOTALL)
        items = []
        for sr in srows:
            std = re.findall(r'<td[^>]*>(.*?)</td>', sr, re.DOTALL)
            clean_tds = [re.sub(r'<[^>]+>', '', x).strip() for x in std]
            img_m = re.search(r'src=["\'](https://prod-s3\.counselindia\.com/[^"\']+)["\']', sr)
            if not img_m:
                img_m = re.search(r'href=["\'](https://prod-s3\.counselindia\.com/[^"\']+)["\']', sr)
            img_url = clean_url(img_m.group(1)) if img_m else ''

            if sub_type == 'course_overview':
                # THs: ['#ID', 'Type', 'Title', 'Icon', 'Position', 'Status', 'Image', 'Action']
                if len(clean_tds) >= 6:
                    t_val = clean_tds[1] or 'key_features'
                    title_val = clean_tds[2]
                    pos_val = clean_tds[4] or '1'
                    status_val = clean_tds[5] or 'Active'
                    items.append({
                        'title': title_val,
                        'type': t_val,
                        'position': pos_val,
                        'status': status_val,
                        'image': img_url
                    })

            elif sub_type == 'course_learn':
                # THs: ['#ID', 'Type', 'Title', 'Icon', 'Position', 'Status', 'Image', 'Action']
                if len(clean_tds) >= 6:
                    t_val = clean_tds[1] or 'objective'
                    title_val = clean_tds[2]
                    pos_val = clean_tds[4] or '1'
                    status_val = clean_tds[5] or 'Active'
                    items.append({
                        'title': title_val,
                        'type': t_val,
                        'position': pos_val,
                        'status': status_val,
                        'image': img_url
                    })

            elif sub_type == 'credential':
                # THs: ['#ID', 'Title', 'Image', 'Position', 'Status', 'Action']
                if len(clean_tds) >= 5:
                    title_val = clean_tds[1]
                    pos_val = clean_tds[3] or '1'
                    status_val = clean_tds[4] or 'Active'
                    items.append({
                        'title': title_val,
                        'type': 'credential',
                        'position': pos_val,
                        'status': status_val,
                        'image': img_url
                    })

            elif sub_type == 'curriculam':
                # THs: ['#ID', 'Title', 'Position', 'Status', 'Action']
                if len(clean_tds) >= 4:
                    title_val = clean_tds[1]
                    pos_val = clean_tds[2] or '1'
                    status_val = clean_tds[3] or 'Active'
                    items.append({
                        'title': title_val,
                        'type': 'curriculum',
                        'position': pos_val,
                        'status': status_val,
                        'image': img_url
                    })

        return items
    except Exception as e:
        print(f"Error scraping {sub_type} for course {cid}: {e}")
        return []

def process_course(c):
    cid = c.get('liveId')
    if not cid: return c
    c['overviewItems'] = scrape_sub(cid, 'course_overview')
    c['learnItems'] = scrape_sub(cid, 'course_learn')
    c['credentialItems'] = scrape_sub(cid, 'credential')
    c['curriculumItems'] = scrape_sub(cid, 'curriculam')

    c['overviewCount'] = len(c['overviewItems'])
    c['learnCount'] = len(c['learnItems'])
    c['credentialCount'] = len(c['credentialItems'])
    c['curriculumCount'] = len(c['curriculumItems'])
    return c

print(f"Fixing submodules mapping for {len(courses)} courses in parallel...")
with ThreadPoolExecutor(max_workers=6) as ex:
    updated = list(ex.map(process_course, courses))

updated.sort(key=lambda x: x['sNo'])

with open('/Users/sudeeshkumar/Desktop/TGT COMPANY/counselIndia-Admin/prisma/courses-complete-data.json', 'w') as f:
    json.dump(updated, f, indent=2)

print("Saved cleanly mapped sub-module data into courses-complete-data.json!")
