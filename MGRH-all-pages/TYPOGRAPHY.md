# MGRH website typography

**Font:** DM Sans (Google Fonts), weights 400 / 500 / 600 / 700, used on every page.
**Measured at:** 1440px desktop width. These are the sizes in the approved designs.

## Site-wide type scale (use these as design tokens)

| Token | Size (desktop) | Weight | Line height | Used for |
|---|---|---|---|---|
| `display` | Home hero: `clamp(44px, 4.6vw, 74px)` | 500, highlighted words 700 | 0.98 | Home page H1 |
| `h1` | 62–66px (Facilities: 56px) | 500, highlighted words 700 | 1.02–1.16 | Inner-page hero titles ("About **Us**", "Our **Medical Team**") |
| `h2-feature` | 40–42px | 600 | 1.08–1.10 | Big section headlines ("A legacy of healthcare since 1914.") |
| `h2` | 31–36px | 500, highlighted words 700 | normal | Section headings with the teal dash ("Our **facilities**", "Who we are") |
| `h3` | 27–35px | 600 | 1.12–1.20 | Feature blocks ("Emergency and Casualty Care.") |
| `h3-card` | 24–28px | 600 | 1.2–1.26 | Card titles, doctor names, CTA boxes |
| `stat` | 34–46px | 700 | 1.0 | Numbers (1914, 14, 24 hrs, ₹0, 112 years) |
| `lead` | 22–24px | 400 | 1.55–1.62 | Hero subtitle, intro paragraph |
| `body` | 20–21px | 400 | 1.6 | Main paragraphs |
| `body-sm` | 18.5px | 400 | 1.5–1.6 | Card text, footer text, footer links, stat captions |
| `nav` | 24–26px | 500 | normal | Main menu links (desktop) |
| `topbar` | 17px | 400 / 600 | normal | Address, phone and hours strip above the header |
| `button` | 18–22px (hero buttons 21px) | 700 | normal | Buttons and pill links |
| `link-sm` | 18–19px | 600 / 700 | normal | "Read more", "Get directions" |
| `eyebrow` | 15–17px | 600, UPPERCASE, letter-spacing 0.12–0.14em | normal | Small labels above headings ("ABOUT THE HOSPITAL") |
| `caption` | 17–18px | 400 | normal | Image captions, breadcrumbs, © line |
| `meta` | 14.5–15.5px | 600 | normal | Small labels (ADDRESS, date chips) |

## Mobile (not in the designs — recommended)

The designs are desktop-only. Under 768px, scale down roughly like this:
h1 36–40px · h2 26–28px · h3 20–22px · lead 18px · body 16–17px · body-sm 15px · nav moves into a hamburger menu · buttons 16px.

## Exact sizes per page

The tables below come from the rendered pages and list every size/weight used on each page.

### index.html — Home

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 66.24px | 500 Medium | 0.98 | h1 | Quality healthcare, provided free of charge. |
| 46px | 700 Bold | 1.00 | span | 1914 (+3 more) |
| 42px | 600 SemiBold | 1.08 | h2 | A legacy of healthcare since 1914. |
| 40px | 600 SemiBold | 1.10 | h2 | Check out our upcoming events. |
| 36px | 500 Medium | normal | h2 | Our (+1 more) |
| 36px | 700 Bold | normal | span | facilities (+1 more) |
| 35px | 600 SemiBold | 1.12 | h3 | Emergency and Casualty Care. (+1 more) |
| 34px | 500 Medium | normal | h2 | Support |
| 34px | 700 Bold | 1.00 | div | 112 years |
| 34px | 700 Bold | normal | span | us |
| 28px | 600 SemiBold | 1.20 | h3 | See the ward you will be treated in. |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 24px | 400 Regular | 1.55 | p | Blood donation drives, eye and cancer screening  |
| 24px | 500 Medium | normal | span | Home (+7 more) |
| 24px | 600 SemiBold | 1.22 | span | Volunteer with us (+2 more) |
| 24px | 700 Bold | 1.00 | span | 12 (+2 more) |
| 23px | 600 SemiBold | 1.24 | span | Eleven more departments |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 500 Medium | 1.46 | p | Consultation, diagnostic tests, medication and h |
| 22px | 700 Bold | normal | a | Emergency |
| 21.6px | 400 Regular | 1.50 | p | Comprehensive healthcare for the local and rural |
| 21.5px | 600 SemiBold | 1.26 | span | Mother and Child Health (+3 more) |
| 21px | 400 Regular | 1.62 | p | Shri Moraji Gokuldas donated the building to the (+1 more) |
| 21px | 600 SemiBold | 1.26 | span | Casualty & Critical Care (+5 more) |
| 21px | 700 Bold | normal | a | Our departments (+1 more) |
| 20px | 400 Regular | 1.60 | p | The Emergency and Casualty department provides e |
| 20px | 700 Bold | normal | a | Read our history (+6 more) |
| 19.5px | 400 Regular | 1.50 | span | Shri Moraji Gokuldas donates the hospital buildi (+7 more) |
| 19.5px | 400 Regular | 1.58 | p | Every department is photographed — theatres, ICU |
| 19px | 700 Bold | normal | span | Read more (+3 more) |
| 19px | 700 Bold | normal | a | Read more (+2 more) |
| 19px | 700 Bold | normal | div | Camps & events |
| 18.5px | 400 Regular | 1.50 | span | The year the hospital was donated (+3 more) |
| 18.5px | 400 Regular | 1.60 | p | A 30-bed government rural hospital in Mahabalesh (+1 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18.5px | 700 Bold | normal | a | Ways to help → |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | span | 14 departments (+1 more) |
| 18px | 600 SemiBold | normal | a | Get directions |
| 18px | 700 Bold | normal | span | See the roles (+2 more) |
| 17.5px | 400 Regular | 1.48 | div | of healthcare in Mahabaleshwar |
| 17.5px | 400 Regular | 1.50 | span | Theatres, maternity, dental, diagnostics and the (+4 more) |
| 17px | 400 Regular | normal | div | The hospital on Mahabaleshwar - Medha Road |
| 17px | 400 Regular | normal | span | © 2026 Morarji Gokuldas Rural Hospital, Mahabale |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 700 Bold | normal | span | 1914 (+7 more) |
| 16.5px | 500 Medium | normal | span | Consultation, tests, medicines and hospital stay (+3 more) |
| 16.5px | 500 Medium | normal | a | Contact (+1 more) |
| 16.5px | 700 Bold | normal | a | +91 21682 60247 |
| 16px | 600 SemiBold | normal | div | About the hospital (+5 more) |
| 15.5px | 600 SemiBold | normal | div | Our promise |
| 15.5px | 600 SemiBold | normal | span | Address (+6 more) |
| 12.5px | 600 SemiBold | normal | span | Jul (+2 more) |

### about.html — About Us

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 84px | 700 Bold | 1.00 | div | 01 (+3 more) |
| 66px | 500 Medium | 1.02 | h1 | About |
| 66px | 700 Bold | 1.02 | span | Us |
| 33px | 600 SemiBold | normal | h2 | Who we are (+4 more) |
| 32px | 500 Medium | 1.20 | p | Serving Mahabaleshwar |
| 32px | 500 Medium | normal | h3 | Our (+1 more) |
| 32px | 700 Bold | 1.20 | span | since 1914 |
| 28px | 600 SemiBold | 1.26 | h3 | Aerial view of MORARJI GOKULDAS RURAL HOSPITAL,  |
| 27px | 600 SemiBold | normal | h3 | Planning a visit? |
| 26px | 500 Medium | normal | span | Home (+7 more) |
| 26px | 700 Bold | 1.22 | h3 | 30-Bed Hospital (+3 more) |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 24px | 400 Regular | 1.60 | p | Situated in the lush green landscape of Mahabale (+3 more) |
| 23px | 700 Bold | normal | a | Emergency |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 400 Regular | 1.62 | p | Situated in the lush green landscape of Mahabale |
| 21px | 400 Regular | 1.55 | p | Comprehensive inpatient and outpatient care. (+3 more) |
| 20.5px | 400 Regular | 1.60 | p | Consultations, diagnostic tests, medication and  |
| 20px | 400 Regular | 1.50 | span | Mahabaleshwar - Medha Road, District - Satara –  (+3 more) |
| 20px | 700 Bold | normal | a | Call the hospital |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+1 more) |
| 18.5px | 400 Regular | 1.60 | p | A 30-bed government rural hospital in Mahabalesh (+1 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | normal | div | Renovated Hospital Building in 2019 (+1 more) |
| 18px | 400 Regular | 1.50 | span | Shri Moraji Gokuldas donated the Hospital Buildi (+5 more) |
| 18px | 500 Medium | normal | span | Who we are (+4 more) |
| 18px | 600 SemiBold | normal | a | Get directions |
| 17.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+1 more) |
| 17.5px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17.5px | 600 SemiBold | normal | a | +91 21682 60247 |
| 17px | 400 Regular | normal | div | The hospital building, seen from above (+3 more) |
| 17px | 400 Regular | normal | span | 0% (+1 more) |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 500 Medium | normal | span | Home (+2 more) |
| 17px | 600 SemiBold | normal | div | Serving Mahabaleshwar since 1914 |
| 16px | 600 SemiBold | normal | span | Jump to a section |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 16px | 700 Bold | normal | span | 1914 (+5 more) |
| 15px | 600 SemiBold | normal | span | Address (+3 more) |

### facilities.html — Facilities & Services

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 56px | 500 Medium | 1.16 | h1 | Our Facilities |
| 56px | 700 Bold | 1.16 | span | and Services |
| 27px | 600 SemiBold | normal | span | Emergency & Critical Care (+5 more) |
| 27px | 600 SemiBold | normal | h3 | Not sure which department you need? |
| 26px | 500 Medium | normal | span | Home (+7 more) |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 25px | 600 SemiBold | normal | h3 | Every service here costs nothing |
| 24px | 600 SemiBold | 1.26 | span | Emergency / Casualty Ward (+13 more) |
| 23px | 700 Bold | normal | a | Emergency |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 21px | 400 Regular | 1.60 | p | Fourteen departments covering emergency care, su |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+1 more) |
| 18.5px | 400 Regular | 1.60 | p | Visit the OPD counter when you arrive. Our staff (+3 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | normal | span | Immediate treatment and close monitoring. (+5 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | a | Get directions |
| 17px | 400 Regular | normal | span | © 2026 Morarji Gokuldas Rural Hospital, Mahabale |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 500 Medium | normal | span | Home (+8 more) |
| 17px | 600 SemiBold | normal | div | Fourteen departments under one roof |
| 17px | 700 Bold | normal | a | Call the hospital (+1 more) |
| 16px | 600 SemiBold | normal | button | Back to top (+5 more) |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 15.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+1 more) |
| 15.5px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 15.5px | 600 SemiBold | normal | a | +91 21682 60247 |
| 15px | 400 Regular | normal | span | Go directly to the Casualty Ward — no appointmen (+42 more) |
| 15px | 500 Medium | normal | span | Emergency & Critical Care (+5 more) |
| 15px | 700 Bold | normal | span | In an emergency |
| 15px | 700 Bold | normal | a | +91 21682 60247 |
| 14px | 600 SemiBold | normal | span | Jump to a section |
| 13px | 600 SemiBold | normal | span | Jump to a section |

### doctors.html — Doctors

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 66px | 500 Medium | 1.02 | h1 | Our |
| 66px | 700 Bold | 1.02 | span | Medical Team |
| 34px | 500 Medium | normal | h2 | Our Medical (+1 more) |
| 34px | 700 Bold | normal | span | Team (+1 more) |
| 27px | 600 SemiBold | normal | h3 | Which doctor should you see? |
| 26px | 500 Medium | normal | span | Home (+7 more) |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 24px | 400 Regular | 1.60 | p | Meet our resident medical officers and visiting  |
| 24px | 600 SemiBold | 1.26 | span | Dr. Pandit Kishanrao Deshmukh (+9 more) |
| 24px | 700 Bold | normal | span | 15 (+3 more) |
| 23px | 700 Bold | normal | a | Emergency |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 400 Regular | 1.62 | p | You do not need to request a specific doctor. Si |
| 21px | 400 Regular | 1.60 | p | Meet our resident medical officers and visiting  |
| 21px | 600 SemiBold | normal | span | Nursing staff (+3 more) |
| 20.5px | 400 Regular | 1.60 | p | Register at the OPD counter and staff will direc |
| 19px | 400 Regular | 1.56 | span | Ward, casualty and theatre nursing cover in rota (+3 more) |
| 19px | 500 Medium | normal | span | All doctors (+7 more) |
| 19px | 600 SemiBold | normal | span | 10 doctors (+10 more) |
| 19px | 700 Bold | normal | a | Call the hospital (+2 more) |
| 18.5px | 400 Regular | 1.60 | p | A 30-bed government rural hospital in Mahabalesh (+1 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | normal | span | OPD, Monday to Saturday, 9:00 – 13:00 (+19 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | a | Get directions |
| 17.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+11 more) |
| 17.5px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17.5px | 600 SemiBold | normal | a | +91 21682 60247 |
| 17px | 400 Regular | normal | span | © 2026 Morarji Gokuldas Rural Hospital, Mahabale |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 500 Medium | normal | span | Home (+2 more) |
| 17px | 600 SemiBold | normal | div | Run by professionals |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |

### programmes.html — Programmes

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 62px | 500 Medium | 1.02 | h1 | Our |
| 62px | 700 Bold | 1.02 | span | Programmes |
| 32px | 500 Medium | normal | h2 | Programmes and |
| 32px | 600 SemiBold | 1.16 | span | Mother & Child Health (+3 more) |
| 32px | 700 Bold | normal | span | community service |
| 28px | 600 SemiBold | 1.24 | h3 | Reaching the town, not only the ward |
| 27px | 700 Bold | 1.00 | span | 12 (+2 more) |
| 26px | 500 Medium | normal | span | Home (+7 more) |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 25px | 600 SemiBold | normal | h3 | Want to join a camp or clinic? |
| 23px | 700 Bold | normal | a | Emergency |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 400 Regular | 1.60 | p | Preventive and continuing care for the rural com |
| 20px | 400 Regular | 1.62 | p | Some of these are national health programmes imp (+2 more) |
| 20px | 400 Regular | 1.60 | span | Care for mothers and children from the first ant (+3 more) |
| 19.5px | 600 SemiBold | 1.30 | span | Maternity (+11 more) |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+1 more) |
| 18.5px | 400 Regular | 1.60 | p | Call the hospital for clinic days, camp dates an (+2 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | 1.60 | span | Supervised deliveries with round-the-clock nursi (+11 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | a | Get directions |
| 18px | 700 Bold | normal | a | Call the hospital |
| 17px | 400 Regular | 1.50 | span | continuing programmes (+2 more) |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 600 SemiBold | normal | span | 12 programmes |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 15.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+1 more) |
| 15.5px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 15.5px | 600 SemiBold | normal | a | +91 21682 60247 |
| 15px | 400 Regular | normal | div | Mahabaleshwar town, served by the hospital |
| 15px | 500 Medium | normal | span | Home (+2 more) |
| 15px | 600 SemiBold | normal | div | Twelve programmes, free of charge |
| 15px | 600 SemiBold | normal | span | 4 programmes (+3 more) |

### events.html — Camps & Events

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 66px | 500 Medium | 1.02 | h1 | Camps & |
| 66px | 700 Bold | 1.02 | span | Events |
| 34px | 500 Medium | normal | h2 | Recent |
| 34px | 700 Bold | normal | span | Events |
| 26px | 500 Medium | normal | span | Home (+7 more) |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 25px | 600 SemiBold | normal | h3 | Hosting or joining a camp? |
| 24px | 400 Regular | 1.60 | p | We regularly organises free health camps, awaren |
| 24px | 700 Bold | 1.00 | span | 12 (+8 more) |
| 23px | 600 SemiBold | 1.28 | span | Voluntary Blood Donation Camp (+8 more) |
| 23px | 700 Bold | normal | a | Emergency |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 700 Bold | normal | a | Call the hospital |
| 20.5px | 400 Regular | 1.60 | p | Schools, colleges and local groups can arrange a |
| 19px | 500 Medium | normal | span | All events (+5 more) |
| 19px | 600 SemiBold | normal | span | 9 events |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+1 more) |
| 18.5px | 400 Regular | 1.60 | p | A 30-bed government rural hospital in Mahabalesh (+1 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | a | Get directions |
| 17.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+10 more) |
| 17.5px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17.5px | 600 SemiBold | normal | a | +91 21682 60247 |
| 17px | 400 Regular | normal | span | © 2026 Morarji Gokuldas Rural Hospital, Mahabale |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 500 Medium | normal | span | Home (+2 more) |
| 17px | 600 SemiBold | normal | div | Camps, drives and clinics |
| 16px | 600 SemiBold | normal | span | 6 photos (+8 more) |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 15.5px | 600 SemiBold | normal | span | Blood donation (+8 more) |
| 14.5px | 600 SemiBold | normal | span | Jul (+8 more) |

### support-us.html — Support Us

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 62px | 500 Medium | 1.02 | h1 | Support |
| 62px | 700 Bold | 1.02 | span | Us Mission |
| 32px | 500 Medium | normal | h2 | Make a (+1 more) |
| 32px | 700 Bold | normal | span | Donation (+1 more) |
| 31px | 600 SemiBold | normal | h2 | Why we need you |
| 30px | 500 Medium | 1.20 | p | Free for every patient |
| 30px | 700 Bold | 1.20 | span | since 1914 |
| 26px | 500 Medium | normal | span | Home (+7 more) |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 25px | 600 SemiBold | normal | h3 | Not sure how you can help? |
| 23px | 700 Bold | normal | a | Emergency |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 400 Regular | 1.50 | p | Every consultation, test and medicine here is fr |
| 22px | 600 SemiBold | normal | h3 | How to give |
| 21px | 600 SemiBold | normal | span | Medical Equipment (+3 more) |
| 20px | 400 Regular | 1.62 | p | Together, we can strengthen rural healthcare and (+1 more) |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+1 more) |
| 18.5px | 400 Regular | 1.60 | p | Call the hospital office and ask what is needed  (+2 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | span | Bank transfer or cheque (+2 more) |
| 18px | 600 SemiBold | normal | a | Get directions |
| 17.5px | 400 Regular | 1.56 | span | Help us buy and maintain monitors, diagnostic ma (+3 more) |
| 17px | 400 Regular | normal | div | The campus at Mahabaleshwar, Medha Road |
| 17px | 400 Regular | 1.56 | p | Contact the hospital office for account details, |
| 17px | 400 Regular | 1.55 | span | Account details are issued by the hospital offic (+2 more) |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 700 Bold | normal | a | Call the hospital office (+1 more) |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 15.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+1 more) |
| 15.5px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 15.5px | 600 SemiBold | normal | a | +91 21682 60247 |
| 15px | 500 Medium | normal | span | Home (+2 more) |
| 15px | 600 SemiBold | normal | div | Donate · Volunteer · Partner |

### contact.html — Contact Us

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 62px | 500 Medium | 1.02 | h1 | Contact |
| 62px | 700 Bold | 1.02 | span | Us |
| 31px | 600 SemiBold | normal | h2 | Reach the hospital (+1 more) |
| 27px | 700 Bold | normal | h3 | If it is an emergency, just come |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 24px | 500 Medium | normal | span | Home (+7 more) |
| 23px | 400 Regular | 1.50 | p | Have a question, need information about our serv |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 700 Bold | normal | button | Emergency |
| 21px | 400 Regular | 1.55 | span | Morarji Gokuldas Rural Hospital, Mahabaleshwar - (+5 more) |
| 21px | 400 Regular | 1.60 | p | The hospital sits on Medha Road, a short drive f |
| 20px | 400 Regular | 1.60 | p | The casualty ward is open every hour of the year |
| 20px | 700 Bold | normal | a | WhatsApp us (+1 more) |
| 20px | 700 Bold | normal | button | Emergency numbers |
| 19px | 600 SemiBold | normal | span | OPD (+2 more) |
| 19px | 700 Bold | normal | button | See the campus from above |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+1 more) |
| 18.5px | 400 Regular | 1.60 | p | A 30-bed government rural hospital in Mahabalesh (+1 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | 1.50 | span | 09:00 a.m. to 01:00 p.m. and 04:00 p.m. to 06:00 (+2 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | a | Get directions |
| 17px | 400 Regular | normal | div | The hospital on Medha Road, Mahabaleshwar (+1 more) |
| 17px | 400 Regular | normal | span | © 2026 Morarji Gokuldas Rural Hospital, Mahabale |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 500 Medium | normal | span | Home (+2 more) |
| 17px | 600 SemiBold | normal | div | Open everyday of the year |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 15.5px | 400 Regular | normal | span | Mahabaleshwar - Medha Road, District - Satara –  (+1 more) |
| 15.5px | 400 Regular | normal | a | www.mgrh-mahabaleshwar.org |
| 14.5px | 600 SemiBold | normal | span | Address (+3 more) |

### emergency.html — Emergency

| Size | Weight | Line height | Tag | Example text |
|---|---|---|---|---|
| 66px | 500 Medium | 1.00 | h1 | If it is an emergency, |
| 66px | 700 Bold | 1.00 | span | just come. |
| 38px | 700 Bold | 1.14 | p | Do not wait. Come straight to the Emergency Depa |
| 31px | 600 SemiBold | normal | h2 | Important contacts (+3 more) |
| 30px | 700 Bold | normal | div | +91 21682 60247 |
| 28px | 700 Bold | 1.16 | span | +91 21682 60247 (+2 more) |
| 27px | 700 Bold | normal | h3 | When you arrive |
| 26px | 700 Bold | 1.25 | div | Morarji Gokuldas Rural Hospital |
| 25px | 700 Bold | 1.15 | div | Need help right now? |
| 24px | 500 Medium | normal | span | Home (+7 more) |
| 24px | 700 Bold | normal | a | +91 21682 60247 |
| 23px | 400 Regular | 1.50 | p | 24×7 emergency and casualty care for urgent medi |
| 23px | 700 Bold | normal | div | In an emergency, come straight in. |
| 22px | 600 SemiBold | 1.35 | span | Do I need an appointment for the casualty ward? (+5 more) |
| 22px | 700 Bold | normal | a | Emergency |
| 22px | 700 Bold | 1.50 | span | + (+5 more) |
| 21px | 400 Regular | 1.62 | p | If you or someone with you has a serious or sudd |
| 20px | 400 Regular | 1.60 | p | Bring the patient straight to the casualty entra |
| 20px | 400 Regular | 1.60 | div | Morarji Gokuldas Rural Hospital, Mahabaleshwar - |
| 20px | 400 Regular | 1.60 | span | No. Bring the patient straight in at any hour. R (+5 more) |
| 20px | 600 SemiBold | normal | span | Come to the casualty entrance (+6 more) |
| 20px | 700 Bold | normal | a | Directions to the hospital |
| 20px | 700 Bold | normal | span | 1 (+3 more) |
| 19.5px | 600 SemiBold | normal | span | Casualty is open right now — walk in, or call ah |
| 19px | 400 Regular | 1.60 | p | Calling ahead lets the duty team prepare, but it |
| 19px | 700 Bold | normal | a | +91 21682 60247 (+6 more) |
| 18.5px | 400 Regular | 1.55 | span | Roughly ten minutes by road along Medha Road, he (+2 more) |
| 18.5px | 400 Regular | 1.60 | p | A 30-bed government rural hospital in Mahabalesh (+1 more) |
| 18.5px | 400 Regular | 1.60 | div | Mahabaleshwar – Medha Road District Satara – 412 |
| 18.5px | 400 Regular | normal | a | Facilities (+5 more) |
| 18.5px | 600 SemiBold | 1.50 | span | OPD (+1 more) |
| 18px | 400 Regular | 1.50 | span | The hospital line reaches the duty desk at any h (+6 more) |
| 18px | 400 Regular | normal | div | Casualty is open 24 hours, every day. No appoint |
| 18px | 600 SemiBold | normal | a | Get directions |
| 18px | 700 Bold | normal | a | Directions (+1 more) |
| 17px | 400 Regular | normal | div | Morarji Gokuldas Rural Hospital, Mahabaleshwar - |
| 17px | 400 Regular | normal | span | © 2026 Morarji Gokuldas Rural Hospital, Mahabale |
| 17px | 400 Regular | normal | a | info@mgrh-mahabaleshwar.org |
| 17px | 500 Medium | normal | a | Home |
| 17px | 500 Medium | normal | span | / (+1 more) |
| 17px | 600 SemiBold | normal | div | Open every hour of the year |
| 16.5px | 400 Regular | normal | div | Casualty is open and staffed |
| 16.5px | 600 SemiBold | normal | span | Casualty ward open 24 hours · no appointment, no |
| 16.5px | 700 Bold | normal | a | +91 21682 60247 |
| 16px | 600 SemiBold | normal | div | Find us (+2 more) |
| 15px | 600 SemiBold | normal | span | Casualty open 24 hours |
| 14.5px | 600 SemiBold | normal | span | Casualty · 24 hours (+2 more) |
| 14.5px | 600 SemiBold | normal | div | Call the hospital |