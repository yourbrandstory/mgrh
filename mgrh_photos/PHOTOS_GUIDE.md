# MGRH website photos

All photos used in the approved designs, renamed and sorted by page. The folder number matches the page.

## Where each photo goes

| File | Page → section | Type |
|---|---|---|
| `00-shared/logo.png` | Header and footer, every page; admin sidebar and login | Static |
| `01-home/home-hero-doctors.png` | Home → hero background | Static |
| `01-home/home-about-hospital-building.png` | Home → "About the hospital" background | Static |
| `01-home/home-numbers-band-aerial.png` | Home → numbers band background | Static |
| `01-home/home-card-wards-support.png` | Home → facilities carousel, "Wards & Support" card | Static fallback |
| `02-about/about-hero-aerial.png` | About Us → hero background (slow drift) | Static |
| `02-about/about-who-we-are-hospital-front.png` | About Us → "Who we are", large square on the right | Static |
| `02-about/about-where-we-are-hospital-zoom.png` | About Us → "Where we are" photo | Static |
| `02-about/about-where-we-are-map.png` | About Us → "Where we are" map | Static |
| `02-about/about-history-1914-original-building.png` | About Us → Our History, 1914 | Static |
| `02-about/about-history-1914-foundation-stone.png` | About Us → Our History, 1914–62 | Static |
| `02-about/about-history-2019-renovated-building.png` | About Us → Our History, 2019 ("Renovated Hospital Building in 2019") | Static |
| `03-facilities/facilities-hero.png` | Facilities → hero background | Static |
| `03-facilities/facility-icu-patient-under-care.png` | Facilities → Intensive Care Unit (ICU), photo 1 "Patient under care" | **Admin (Supabase)** |
| `03-facilities/facility-operation-theatre.png` | Facilities → Operation Theatre, main photo | **Admin (Supabase)** |
| `03-facilities/facility-pathology-lab.png` | Facilities → Pathology Lab, main photo | **Admin (Supabase)** |
| `03-facilities/facility-additional-facilities-corridor.png` | Facilities → Additional Facilities, main photo | **Admin (Supabase)** |
| `04-doctors/doctors-hero.png` | Doctors → hero background | Static |
| `05-programmes/programmes-hero-clinic.png` | Programmes → hero background | Static |
| `05-programmes/programmes-community-band-town.png` | Programmes → "Reaching the town" band | Static |
| `06-events/events-hero-banner.jpg` | Camps & Events → hero background. Photo by LuAnn Hunt on Unsplash; keep the credit. | Static |
| `07-support/support-hero.png` | Support Us → hero background | Static |
| `07-support/support-why-we-need-you-aerial.png` | Support Us → "Why we need you", horizontal image on the right | Static |
| `08-contact/contact-hero.png` | Contact → hero background | Static |
| `08-contact/contact-reach-hospital-building.png` | Contact → "Reach the hospital" photo | Static |
| `08-contact/contact-aerial-lightbox.png` | Contact → full-screen aerial view when the map location is clicked | Static |
| `09-emergency/emergency-hero.png` | Emergency → hero background | Static |

- **Static:** fixed page images. They go in the code (`public/images/…`) and don't change from the admin.
- **Admin (Supabase):** facility photos shown from the database. Upload them once so the Facilities page has pictures. After that, staff can change them from the admin.

Some photos appear on more than one page (for example the aerial view on Home, Support and Contact). They're included once per page so each folder is complete.

Doctors and events have no photos yet. Doctor photos are hidden on the public site by request. Event photos are added from the admin after each camp.
