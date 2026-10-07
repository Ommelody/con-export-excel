# Consignment Item Verification System

## 1) ตั้งค่า Google Sheet เป็นฐานข้อมูล
1. สร้าง Google Sheet ใหม่
2. Extensions > Apps Script วางโค้ดจาก `apps-script/Code.gs`
3. Deploy > New deployment > Web app
   - Execute as: Me
   - Who has access: Anyone (หรือ Anyone within your organization ถ้าใช้ Workspace)
4. คัดลอก Web app URL
5. เปิดระบบ วาง URL ในช่อง "Google Sheet URL" มุมขวาบน (เก็บในเบราว์เซอร์ของผู้ใช้ หรือกำหนดค่าเริ่มต้นด้วย `window.CONSIGN_API`)

ข้อมูลที่บันทึกจะเขียนลงชีต `saved` ทุกคนเห็นตรงกัน ระบบดึงข้อมูลใหม่ทุก 20 วินาที

## 2) Deploy บน GitHub
อัปโหลดไฟล์เหล่านี้ขึ้น repo: `index.html`, `Consignment Verification.dc.html`, `support.js`, โฟลเดอร์ `data/` (เฉพาะ `po_hn.json`, `price.json`, `billing_con.json`)
จากนั้น Settings > Pages > Deploy from branch

## คำเตือนข้อมูลผู้ป่วย
`data/billing_con.json` และ `data/po_hn.json` มี HN และชื่อผู้ป่วย
- ห้ามใช้ repo แบบ Public
- GitHub Pages ของ repo Private เปิดได้เฉพาะแพลนที่รองรับ และผู้เข้าถึงต้องมีสิทธิ์ใน repo/org
- ทางที่ปลอดภัยกว่า: ไม่ commit `billing_con.json` ให้ผู้ใช้อัปโหลดไฟล์ dailysale เองในหน้าเว็บ (ระบบรองรับอยู่แล้ว)
- Web app URL ของ Apps Script ที่ตั้งเป็น Anyone ใครมี URL ก็อ่านข้อมูลในชีตได้ ควรเปลี่ยนเป็น organization-only
