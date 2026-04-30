IMAGES FOLDER
=============

Drop your PNGs into this folder with EXACTLY these filenames:


A. HERO BACKGROUND MAP
----------------------

5. usa-map.png
   -> The US map that sits behind the hero as a backdrop
   -> The site blends it into the navy gradient using mix-blend-mode: screen,
      so a map with dark/black background and light-colored states works best.
   -> Recommended size: 1600x1000 px or larger for retina crispness.


B. TRUST BADGES (4 shields)
----------------------------

1. trust-dnb-duns.png
   -> DUN & Bradstreet D-U-N-S Registered shield

2. trust-atlassian-agile.png
   -> Atlassian Solution Partner - Agile-at-Scale Sales Accredited shield

3. trust-un-global-compact.png
   -> UN Global Compact "We Support" shield

4. trust-atlassian-itsm.png
   -> Atlassian IT Service Management | Sales Certified shield


Recommended specs for trust badges:
- Format: PNG with transparent background (preferred) or white background
- Size: at least 320x320 px for sharp rendering on retina displays
- Aspect ratio: roughly square (the site displays them in 160x160 containers, object-contain)
- File size: under 200KB each, ideally


If a file is missing or misnamed, the site will hide the image gracefully
(no broken-image icon). Trust badges fall back to a dashed placeholder.
