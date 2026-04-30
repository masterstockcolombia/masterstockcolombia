// MasterStock USA — shared interactions (used by how-it-works.html and about.html)
// index.html has its own inline JS with the full experience (hero slider, carousel, etc.)

(function(){
  'use strict';

  // ===== Header scroll effect =====
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ===== Premium micro-interactions (halo effect + peak-end rule) =====
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-triggered reveal — elements fade in as they enter viewport
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    // Auto-apply data-reveal to section headings, cards, and key elements
    const autoRevealSelectors = [
      'section h2', 'section h3',
      'section p:first-of-type',
      '.factor', '.flow-card', '.offer-card',
      '.founder-card', '.cred-card', '.stat-card',
      'section > div > ul', '.timing-card'
    ];
    autoRevealSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach((el, i) => {
        if (el.closest('[data-no-reveal]')) return;
        if (!el.hasAttribute('data-reveal')) {
          el.setAttribute('data-reveal', '');
          // Stagger siblings inside the same parent
          const siblings = el.parentElement ? [...el.parentElement.children].filter(c => c.hasAttribute('data-reveal')) : [];
          const idx = siblings.indexOf(el);
          if (idx > 0) el.style.setProperty('--reveal-delay', (idx * 60) + 'ms');
        }
      });
    });

    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));
  } else {
    // Reduced motion: show everything immediately
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
  }

  // Magnetic CTA buttons — subtle cursor-following highlight
  if (!prefersReducedMotion) {
    const magneticBtns = document.querySelectorAll('[data-open-modal], .btn-magnetic, button[type="submit"]');
    magneticBtns.forEach(btn => {
      btn.classList.add('btn-magnetic');
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--mx', x + '%');
        btn.style.setProperty('--my', y + '%');
      });
    });
  }

  // Smooth anchor scroll (easing in JS, beyond browser default)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const href = a.getAttribute('href');
    if (href === '#' || href.length <= 1) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // Hero entrance — first-impression halo effect (apply to page hero content)
  const pageHeroContent = document.querySelector('.page-hero .max-w-6xl > div > div:first-child, .hero-wrap .max-w-6xl');
  if (pageHeroContent && !prefersReducedMotion) {
    pageHeroContent.classList.add('hero-entrance');
  }

  // ===== PREMIUM EFFECTS (wow-on-first-sight) =====

  // 1) Scroll progress bar — thin brand-blue indicator at top
  (function initScrollProgress(){
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    let ticking = false;
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      bar.style.setProperty('--progress', progress);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
    }, { passive: true });
    updateProgress();
  })();

  if (!prefersReducedMotion) {
    // 2) Cursor spotlight — add .spotlight to dark hero sections
    document.querySelectorAll('.page-hero, .hero-wrap, [data-spotlight]').forEach(el => {
      el.classList.add('spotlight');
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--sx', x + '%');
        el.style.setProperty('--sy', y + '%');
        el.style.setProperty('--spotlight-opacity', '1');
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--spotlight-opacity', '0');
      });
    });

    // 3) 3D tilt — apply to key premium cards
    document.querySelectorAll('.founder-card, .cred-card, .flow-card, .offer-card').forEach(card => {
      card.classList.add('tilt-card');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width;
        const my = (e.clientY - rect.top) / rect.height;
        const ry = (mx - 0.5) * 6;    // max ±3° rotation
        const rx = -(my - 0.5) * 6;   // max ±3° rotation
        card.style.setProperty('--ry', ry + 'deg');
        card.style.setProperty('--rx', rx + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });

    // 4) Gradient shimmer on main H1 gradient spans (premium polish)
    document.querySelectorAll('.page-hero h1 span.block').forEach(span => {
      // Only apply shimmer after 2.5s so it doesn't fight the entrance animation
      setTimeout(() => { span.classList.add('grad-shimmer'); }, 2500);
    });
  }

  // ===== Manifest modal =====
  const modal = document.getElementById('manifest-modal');
  let lastFocus = null;
  function openModal(){
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-modal]').forEach(b => b.addEventListener('click', openModal));
  document.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal();
  });

  // ===== Manifest form (basic email validation) =====
  const tempDomains = ['mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','yopmail.com','trashmail.com','sharklasers.com'];
  function isValidEmail(v){
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return false;
    const d = v.split('@')[1].toLowerCase();
    return !tempDomains.includes(d);
  }
  const mForm = document.getElementById('manifest-form');
  if (mForm) {
    const emailInput = document.getElementById('f-email');
    const emailError = document.getElementById('email-error');
    mForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!emailInput || !isValidEmail(emailInput.value.trim())) {
        if (emailError) emailError.classList.remove('hidden');
        return;
      }
      if (emailError) emailError.classList.add('hidden');
      const s = document.getElementById('manifest-success');
      if (s) s.classList.remove('hidden');
      const btn = mForm.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
    });
  }

  // ===== Newsletter form =====
  const newsForm = document.getElementById('newsletter-form');
  if (newsForm) {
    newsForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email');
      if (!email) return;
      const val = email.value.trim();
      if (!isValidEmail(val)) { email.classList.add('border-red-500'); return; }
      email.classList.remove('border-red-500');
      const s = document.getElementById('newsletter-success');
      if (s) s.classList.remove('hidden');
      const btn = newsForm.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = '\u2713 Subscribed'; }
    });
  }

  // ===== Floating manifest button =====
  const floating = document.getElementById('floating-manifest');
  if (floating) {
    const update = () => {
      const modalOpen = modal && !modal.classList.contains('hidden');
      floating.classList.toggle('is-visible', window.scrollY > 300 && !modalOpen);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if (modal) {
      const obs = new MutationObserver(update);
      obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
    update();
  }

  // ===== SUPPLIER DESK CHATBOT =====
  const widget = document.getElementById('chat-widget');
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const body = document.getElementById('chat-body');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input-field');
  const suggestionsList = document.getElementById('chat-suggestions-list');

  if (!widget || !toggle || !panel || !body || !form || !input) return;

  const KB = [
    {
      keys: ['how do you work','how does it work','how does this work','how does your business work','process','explain the process','walk me through','overview','how it works','step by step','steps','what happens','what is the process','tell me how','explain how','workflow','funciona','como trabaja','como funciona','pasos','proceso','flow','end to end'],
      q: 'How does MasterStock USA work?',
      a: "Here's the full flow: <strong>1)</strong> You send us a manifest (Excel, CSV, PDF, or even photos). <strong>2)</strong> We audit it within <strong>48 hours</strong> and return a firm, written price with 3 offer structures to choose from. <strong>3)</strong> If you accept, we schedule pickup in 3-5 business days. <strong>4)</strong> We wire the payment at pickup from our US Mercury Treasury account. <strong>5)</strong> Balance, if any, released after a 7-day inspection. No fees, no commissions, no listing. Ready to start? <a href='#' data-chat-open-manifest>Send your manifest</a>."
    },
    {
      keys: ['48','48h','48 hour','48-hour','turnaround','offer work','how long offer','how fast offer','quick offer','offer speed','offer timeline','valuation','how does the 48','the offer','firm offer','written offer','how long does it take','price quote','quote offer'],
      q: 'How does the 48-hour offer work?',
      a: "Send us a manifest (Excel, CSV, PDF, or photos all work). We <strong>audit it within 48 hours</strong> and return a firm, written price. The offer is non-binding on your side. Accept or decline, no pressure. Every offer comes with 3 structures so you pick the one that fits your balance sheet."
    },
    {
      keys: ['payment','payment structure','how paid','how pay','how payment','pay','paid','wire','balance','inspection','mercury','cash','money','deposit','structure','cuando pagan','pago','how is payment','structured','how much upfront'],
      q: 'How is the payment structured?',
      a: "<strong>Paid at pickup.</strong> Typically 70% wires the day of pickup, balance released after a 7-day inspection window. All wires originate from our US Mercury Treasury account (real US business banking). We can discuss 100%-at-pickup structures on clean lots with complete manifests."
    },
    {
      keys: ['fda','firearms','hazmat','excluded','not buy','do not buy','dont buy','cant buy','hazardous','medical','tobacco','alcohol','restricted','prohibited','ammunition','guns','weapon','drugs','supplements','cosmetics','ivory','food items','what you dont buy','what do you not buy'],
      q: 'What items do you NOT buy?',
      a: "We don't take FDA-regulated items (food, supplements, drugs, cosmetics requiring FDA oversight), firearms and ammunition, hazmat, tobacco, alcohol, or ivory/protected species. Everything else is fair game. Send a manifest and we'll confirm."
    },
    {
      keys: ['manifest','format','excel','csv','spreadsheet','template','sku','columns','data','file','upload','how to send','what to send','columns needed','what info','information needed','manifest format','send manifest','what format','file type'],
      q: 'What format do you need the manifest in?',
      a: "<strong>Excel or CSV works best</strong>, but PDFs and photos are fine for first review. Minimum useful columns: SKU, description, condition, quantity, MSRP or cost, location. If you don't have all of it, just send what you have and we'll work with it."
    },
    {
      keys: ['cost','cost me','fee','fees','free','charge','expensive','zero','commission','commissions','listing fee','hidden fee','pay you','does it cost','costo','costos','cobrar','how much do you charge','any cost','any fee'],
      q: 'What does it cost me to sell to you?',
      a: "<strong>Zero.</strong> No fees, no commissions, no listing costs. Our margin is in the resale, not in you. You get a firm offer, a wire, and we move the stock."
    },
    {
      keys: ['how fast paid','how soon','how quick','when do i get paid','when paid','days','timeline','duration','total time','cycle time','when will i be paid','get my money','receive payment','get paid'],
      q: 'How fast do I get paid?',
      a: "Typical timeline: <strong>48h offer, 3-5 days to pickup, wire day of pickup</strong>. Balance (if any) after 7-day inspection. Full cycle from manifest to cleared funds: ~10-14 days on clean lots."
    },
    {
      keys: ['nda','confidentiality','confidential','privacy','non-disclosure','non disclosure','mnda','sign nda','your nda','our nda','keep quiet','private','mutual nda'],
      q: 'Can we sign an NDA?',
      a: "Yes. We'll sign your NDA or use our standard mutual 2-way NDA. Either way, your data stays with us and is not shared outside the deal team."
    },
    {
      keys: ['pickup','pick up','collection','location','california','new jersey','texas','hub','hubs','where do you pickup','where pickup','where do you buy from','where are you','50 state','nationwide','coast to coast','trucking','freight','shipping','logistics','cargo','insurance','coordination','warehouse','dock','come pick up'],
      q: 'Where do you pickup from?',
      a: "<strong>All 50 US states.</strong> We have hubs in California, New Jersey, and Texas with partner 3PLs covering the rest. Cargo insurance included. You release the dock, we handle freight, insurance, and coordination. Pickup typically happens 3-5 business days after you accept the offer."
    },
    {
      keys: ['recurring','monthly','quarterly','ongoing','one off','one-off','repeat','program','programs','regular','continuous','standing','partnership','long term','long-term','every month','every quarter'],
      q: 'Do you do one-off deals or recurring?',
      a: "Both. Many suppliers start with a single deal and move to monthly/quarterly programs. We can structure recurring capacity with a dedicated account lead and standing terms. Send a manifest to start."
    },
    {
      keys: ['brand','brand safe','ebay','amazon','walmart','channel','channels','restriction','restrictions','protection','resale','marketplace','map','gray market','parallel','diverted','end up','control where','sold where','brand protection','my brand','where will'],
      q: 'Will my brand end up on eBay or Amazon?',
      a: "We can structure <strong>channel-restricted buys</strong> with written commitments (no Amazon, no eBay, or region-specific sales only). Stated in the bill of sale. If you need strict brand protection, ask about our Brand-Safe track."
    },
    {
      keys: ['minimum','lot size','pallet','pallets','truckload','small','big','volume','too small','minimum order','how much can you buy','how many','smallest','largest','capacity','is there a min'],
      q: 'Is there a minimum lot size?',
      a: "<strong>No hard minimum.</strong> We've done single pallets and full trailers. For lots under ~$15K MSRP we may bundle with other deals or offer a simplified price. Just send the manifest and we'll be straight with you."
    },
    {
      keys: ['contact','email','phone','call','talk','human','person','rep','team','speak to','reach','get in touch','someone','agent','representative','talk to someone','real person','customer service'],
      q: 'How do I reach a human?',
      a: "Email <a href='mailto:info@masterstockunitedstates.com'>info@masterstockunitedstates.com</a> for general inquiries, or <a href='mailto:partnerships@masterstockunitedstates.com'>partnerships@masterstockunitedstates.com</a> for programs. Or just <a href='#' data-chat-open-manifest>send your manifest</a>, the fastest path to a real answer."
    },
    {
      keys: ['international','canada','mexico','export','outside us','abroad','foreign','overseas','non-us','non us','europe','asia','latin america','international shipping','outside the country','buy from canada','buy from mexico'],
      q: 'Do you buy outside the US?',
      a: "Yes, we buy from suppliers in the US, Canada, and Mexico. Cross-border logistics handled by our freight partners. For deals sourced from other countries, send a manifest and we'll tell you if it fits our lane."
    },
    {
      keys: ['review','three offers','3 offers','firm offers','options','structures','offer types','full-lot','full lot','selective','floor','upside','different offers','choice','pick','3 offer structures','three offer structures','three firm','which offer'],
      q: 'What are the three offer structures?',
      a: "Every manifest comes back with 3 options so you pick what fits: <strong>Full-Lot</strong> (single firm price, fastest), <strong>Selective Buy</strong> (SKU-level pricing, highest rate on premium SKUs), and <strong>Floor + Upside</strong> (guaranteed floor + 50/50 on the resale upside)."
    },
    {
      keys: ['broker','principal','principal buyer','take title','title','match','match us','direct buyer','middleman','who are you','what are you','your company','entity','legal','quien','empresa','about masterstock','tell me about','company info'],
      q: 'Are you a principal buyer or a broker?',
      a: "We're a <strong>principal buyer</strong>, not a broker. We take <strong>title on every lot</strong> we buy, wire from our own US Mercury Treasury account, and move the stock ourselves. No listing, no shopping around, no middlemen."
    },
    {
      keys: ['what do you buy','what you buy','categories','what category','what kind','what types','types of inventory','kinds','products we buy','merchandise','inventory types','accepted','apparel','electronics','technology','tools','toys','accessories','kitchen','home','what items','which products','que compran','que productos'],
      q: 'What categories do you buy?',
      a: "We buy <strong>Accessories</strong> (handbags, watches, luggage), <strong>Apparel</strong> (clothing, activewear), <strong>Home & Kitchen</strong> (cookware, appliances), <strong>Toys & Baby</strong> (LEGO, strollers, educational), <strong>Tools & Home</strong> (power tools, DIY), and <strong>Technology</strong> (laptops, hardware, networking). If your category isn't listed, send a manifest anyway and we'll tell you in 48h."
    },
    {
      keys: ['condition','quality','new','used','returns','damaged','b-stock','a-stock','refurbished','open box','customer return','liquidation','closeout','overstock','product condition','item condition','working','not working','parts'],
      q: 'What condition do the items need to be in?',
      a: "We take all conditions: <strong>New / A-stock</strong>, <strong>B-stock</strong> (light cosmetic wear), customer returns (tested or untested), open box, overstock, and liquidation lots. Pricing adjusts to condition. Just state it honestly on the manifest and we'll handle the rest."
    },
    {
      keys: ['free valuation','estimate','quote','price check','what is it worth','how much will you pay','offer price','get a price','get a quote','evaluation','valuation'],
      q: 'How do I get a free valuation?',
      a: "Simple: <a href='#' data-chat-open-manifest>send your manifest</a> through the form. It's free, no commitment, and takes <strong>48 hours or less</strong>. You'll get a firm written offer with 3 structures to choose from."
    },
    {
      keys: ['trust','compliance','accredit','accredited','duns','d-u-n-s','un global compact','atlassian','itsm','certified','registered','verified','legitimate','real company','is this real','can i trust','credentials'],
      q: 'Are you accredited / verified?',
      a: "Yes. We're registered with <strong>D-U-N-S (Dun & Bradstreet)</strong>, Atlassian Partner certified (Agile-at-Scale + ITSM), and a supporter of the <strong>UN Global Compact</strong>. MasterStock USA Inc., based in Delaware, banking through Mercury. Full details on our About page."
    },
    {
      keys: ['supplier brief','newsletter','weekly','subscribe','intell','industry pulse','insights','market signals','tariffs update','weekly brief','subscribe newsletter'],
      q: 'What is the Supplier Brief?',
      a: "It's our <strong>free weekly newsletter</strong> for suppliers: retailer distress signals that flood resale channels, tariff moves that change your landed cost, and category-level market shifts. Supplier-only, no spam. Subscribe from the About page."
    },
    {
      keys: ['how to start','get started','where do i start','how do i begin','first deal','first step','begin','start','next step','what next','where to begin'],
      q: 'How do I get started?',
      a: "Easiest path: <a href='#' data-chat-open-manifest>send your manifest</a> (Excel, CSV, PDF, or photos work). We'll return a firm written offer within 48 hours. No commitment, no fees. If you prefer to talk first, email <a href='mailto:info@masterstockunitedstates.com'>info@masterstockunitedstates.com</a>."
    }
  ];

  const SMALL_TALK = [
    { re: /^(hi|hello|hey|hola|howdy|yo|hiya|sup|what'?s up)\b/i, replies: ["Hey! Nice to connect. What would you like to know about selling your excess stock? You can pick one of the questions below or ask anything.","Hi there. I can help with how our offers work, pickup, payment, NDAs, or what categories we buy. What's on your mind?","Hello! I'm here to answer supplier questions. Pick any of the suggestions below or type your own."] },
    { re: /^(good\s*(morning|afternoon|evening|day))\b/i, replies: ["Good to see you. How can I help you with your excess inventory today? Feel free to pick a question below or type your own."] },
    { re: /^(thanks|thank you|thx|ty|appreciate)/i, replies: ["Anytime. If anything else comes up, I'm here. You can also send a manifest whenever you're ready and we'll come back with a written offer in 48h.","You're welcome. Happy to answer more questions, or if you want to move forward, you can send a manifest anytime."] },
    { re: /^(bye|goodbye|see you|later|adios|chao)/i, replies: ["Take care. When you're ready to get a price on your stock, just send a manifest and we'll respond in 48h."] },
    { re: /^(ok|okay|cool|got it|nice|great|awesome|perfect|alright|sure)\b/i, replies: ["Got it. Anything else you'd like to know? Pick a question below or type your own.","Good. What else can I help with? Categories, payment, pickup, or NDA terms are all common next questions."] },
    { re: /^(who are you|what are you|are you (a\s)?bot|are you human|are you real)/i, replies: ["I'm the Supplier Desk assistant for MasterStock USA. I handle common supplier questions and route you to the team when it's time for a real offer. Ask away."] },
    { re: /^(help|i need help|can you help|need help)/i, replies: ["Sure. I can answer questions about the 48-hour offer, pickup, payment, NDAs, categories we buy, or the 3 offer structures. Which one fits?"] },
    { re: /^(yes|yeah|yep|yup|sounds good|ok great)\b/i, replies: ["Nice. If you're ready to move, send a manifest and we'll come back with a firm written offer in 48h. Or ask another question first, whatever works."] },
    { re: /^(no|nope|not yet|not right now|not now)\b/i, replies: ["No pressure at all. I'm here when you have a question, or send a manifest later when the timing is right."] }
  ];

  const GREETING = "Hi, I'm the Supplier Desk assistant. Ask me about offers, pickup, payment, categories we buy, or what a first deal looks like. I'll route you to the right team if needed.";

  const SUGGESTIONS = [
    'How does the 48-hour offer work?',
    'How is payment structured?',
    'What are the 3 offer structures?',
    'Where do you pickup from?',
    'What items do you NOT buy?',
    'Can we sign an NDA?',
    'How fast do I get paid?',
    'Is there a minimum lot size?',
    'What format do you need the manifest in?'
  ];

  const chatState = { lastEntries: [], consecutiveFallbacks: 0, askedForHuman: false };

  function normalize(s){
    return s.toLowerCase().replace(/[?!,.;:'"`(){}\[\]\/\\]+/g,' ').replace(/\s+/g,' ').trim();
  }
  const STOPWORDS = new Set(['a','an','the','is','are','do','does','did','can','could','would','should','will','to','of','in','on','for','with','and','or','i','we','you','my','our','your','they','them','it','this','that','these','those','please','just','me','us','about','so','but','if','then','now','here','there','also']);
  function toks(s){ return normalize(s).split(' ').filter(t => t && !STOPWORDS.has(t)); }
  function stem(w){
    if (w.length <= 3) return w;
    if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
    if (w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
    if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
    return w;
  }
  function editDistance(a, b){
    if (Math.abs(a.length - b.length) > 2) return 99;
    const m = a.length, n = b.length;
    const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
    for (let i=0; i<=m; i++) dp[i][0]=i;
    for (let j=0; j<=n; j++) dp[0][j]=j;
    for (let i=1; i<=m; i++) for (let j=1; j<=n; j++)
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1] + (a[i-1]===b[j-1] ? 0 : 1));
    return dp[m][n];
  }
  function tokenSimilar(t, key){
    if (t === key) return true;
    if (stem(t) === stem(key)) return true;
    if (t.length >= 5 && key.length >= 5 && editDistance(t, key) <= 1) return true;
    return false;
  }

  const FOLLOWUP_RE = /^(more|tell me more|tell me (more\s?)?about|what else|and|go on|continue|elaborate|expand|explain more|details|examples?|why|how come|keep going|ok but|but what|and then|then what|otra|más|sigue)\b/i;
  const HUMAN_REQUEST_RE = /\b(talk\s+to\s+(a\s+)?human|talk\s+to\s+(a\s+)?person|real\s+person|speak\s+to\s+(a\s+)?human|speak\s+to\s+(a\s+)?person|live\s+(agent|person|chat)|human\s+agent|call\s+me|email\s+(me|us|someone)|contact\s+info|send\s+email|your\s+email|phone\s+number|reach\s+someone|get\s+(a\s+)?rep|talk\s+to\s+(a\s+)?rep|customer\s+(service|support)|hablar\s+con\s+(alguien|humano|persona))\b/i;

  function scoreEntry(entry, q, qTokenSet){
    let score = 0;
    entry.keys.forEach(k => {
      const key = k.toLowerCase();
      if (key.includes(' ')) {
        if (q.includes(key)) score += key.length * 2.5;
        else {
          const kws = key.split(' ').filter(w => w && !STOPWORDS.has(w));
          let overlap = 0;
          kws.forEach(w => { if (qTokenSet.has(w) || [...qTokenSet].some(qt => tokenSimilar(qt, w))) overlap++; });
          if (kws.length && overlap >= Math.max(2, Math.ceil(kws.length * 0.6))) score += 4 * overlap;
        }
      } else {
        let hit = false;
        for (const qt of qTokenSet) { if (tokenSimilar(qt, key)) { hit = true; break; } }
        if (hit) score += key.length + 2;
        else if (q.includes(key)) score += Math.max(2, key.length - 2);
      }
    });
    return score;
  }

  function rankEntries(q){
    const qTokenSet = new Set(toks(q));
    return KB.map(entry => ({ entry, score: scoreEntry(entry, q, qTokenSet) }))
             .filter(r => r.score > 0)
             .sort((a,b) => b.score - a.score);
  }

  function topicSuggestionsHTML(){
    const priorityQs = ['How does MasterStock USA work?','How is the payment structured?','Where do you pickup from?','What are the three offer structures?','What categories do you buy?','Is there a minimum lot size?','Can we sign an NDA?'];
    const chosen = [];
    priorityQs.forEach(t => { if (chosen.length < 3 && KB.some(e => e.q === t)) chosen.push(t); });
    return chosen.map(q => '<a href="#" data-chat-ask="'+q.replace(/"/g,'&quot;')+'">'+q+'</a>').join(' &nbsp;·&nbsp; ');
  }

  function findAnswer(query){
    const raw = query.trim();
    const q = normalize(raw);
    if (!q) return null;
    for (const st of SMALL_TALK) {
      if (st.re.test(raw)) { chatState.consecutiveFallbacks = 0; return st.replies[Math.floor(Math.random() * st.replies.length)]; }
    }
    if (HUMAN_REQUEST_RE.test(raw)) {
      chatState.askedForHuman = true; chatState.consecutiveFallbacks = 0;
      return "Happy to connect you. For general questions email <a href='mailto:info@masterstockunitedstates.com'>info@masterstockunitedstates.com</a>. For program or partnership discussions, <a href='mailto:partnerships@masterstockunitedstates.com'>partnerships@masterstockunitedstates.com</a>. If you'd like to skip straight to a written offer, <a href='#' data-chat-open-manifest>send your manifest</a> and we'll respond in 48 hours.";
    }
    if (FOLLOWUP_RE.test(raw) && chatState.lastEntries.length > 0) {
      chatState.consecutiveFallbacks = 0;
      const last = chatState.lastEntries[0];
      const others = KB.filter(e => e !== last).slice(0, 3);
      return "Sure. Related things people often ask: " +
        others.map(e => '<a href="#" data-chat-ask="'+e.q.replace(/"/g,'&quot;')+'">'+e.q+'</a>').join(' &nbsp;·&nbsp; ') +
        ". Or ask something specific.";
    }
    const ranked = rankEntries(q);
    if (ranked.length > 0) {
      const top = ranked[0];
      if (ranked.length > 1 && ranked[1].score >= top.score * 0.75 && top.score >= 6) {
        chatState.lastEntries = [top.entry, ranked[1].entry];
        chatState.consecutiveFallbacks = 0;
        return "<strong>" + top.entry.q + "</strong><br>" + top.entry.a + "<br><br><strong>" + ranked[1].entry.q + "</strong><br>" + ranked[1].entry.a;
      }
      if (top.score >= 4) {
        chatState.lastEntries = [top.entry]; chatState.consecutiveFallbacks = 0;
        return top.entry.a;
      }
      if (top.score >= 2 && ranked.length >= 2) {
        chatState.consecutiveFallbacks += 1;
        const topThree = ranked.slice(0, 3).map(r => r.entry.q);
        return "I want to make sure I answer the right thing. Did you mean: " +
          topThree.map(q2 => '<a href="#" data-chat-ask="'+q2.replace(/"/g,'&quot;')+'">'+q2+'</a>').join(' &nbsp;·&nbsp; ') +
          "? Or rephrase the question.";
      }
    }
    chatState.consecutiveFallbacks += 1;
    if (chatState.consecutiveFallbacks >= 3) {
      chatState.consecutiveFallbacks = 0;
      return "Looks like this one is outside what I can answer well. Best to go straight to the team: email <a href='mailto:info@masterstockunitedstates.com'>info@masterstockunitedstates.com</a> (general) or <a href='mailto:partnerships@masterstockunitedstates.com'>partnerships@masterstockunitedstates.com</a> (programs). Or <a href='#' data-chat-open-manifest>send your manifest</a> and we'll reply within 48 hours.";
    }
    const topics = topicSuggestionsHTML();
    if (q.length < 4 || toks(q).length === 0) return "Give me a bit more detail and I can help. Common things to ask about: " + topics + ".";
    return "I don't have that one locked in yet. Try one of these, or rephrase: " + topics + ".";
  }

  function scrollToBottom(){ requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; }); }
  function scrollMessageIntoView(msg){
    requestAnimationFrame(() => {
      const msgTop = msg.offsetTop;
      body.scrollTo({ top: Math.max(0, msgTop - 12), behavior: 'smooth' });
    });
  }
  function addMessage(text, who){
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + (who === 'user' ? 'chat-msg-user' : 'chat-msg-bot');
    msg.innerHTML = text;
    body.appendChild(msg);
    if (who === 'bot') scrollMessageIntoView(msg); else scrollToBottom();
    return msg;
  }
  function showTyping(){
    const t = document.createElement('div');
    t.className = 'chat-typing'; t.id = 'chat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t); scrollToBottom();
  }
  function hideTyping(){ const t = document.getElementById('chat-typing'); if (t) t.remove(); }

  function renderSuggestions(){
    if (!suggestionsList) return;
    suggestionsList.innerHTML = '';
    SUGGESTIONS.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'chat-suggestion'; btn.textContent = s;
      btn.addEventListener('click', () => handleUserMessage(s));
      suggestionsList.appendChild(btn);
    });
  }
  function wireBotLinks(){
    body.querySelectorAll('[data-chat-open-manifest]').forEach(a => {
      if (a.dataset.bound) return; a.dataset.bound = '1';
      a.addEventListener('click', e => { e.preventDefault(); closeChat(); openModal(); });
    });
    body.querySelectorAll('[data-chat-ask]').forEach(a => {
      if (a.dataset.bound) return; a.dataset.bound = '1';
      a.addEventListener('click', e => { e.preventDefault(); handleUserMessage(a.dataset.chatAsk); });
    });
  }
  function handleUserMessage(text){
    if (!text || !text.trim()) return;
    addMessage(text, 'user'); input.value = '';
    showTyping();
    setTimeout(() => {
      hideTyping();
      const answer = findAnswer(text);
      addMessage(answer, 'bot');
      wireBotLinks();
    }, 650 + Math.random() * 400);
  }
  function openChat(){
    widget.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true');
    if (body.children.length === 0) { addMessage(GREETING, 'bot'); renderSuggestions(); }
    setTimeout(() => input.focus(), 250);
  }
  function closeChat(){ widget.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }

  toggle.addEventListener('click', () => { widget.classList.contains('is-open') ? closeChat() : openChat(); });
  if (closeBtn) closeBtn.addEventListener('click', closeChat);
  form.addEventListener('submit', e => { e.preventDefault(); handleUserMessage(input.value); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && widget.classList.contains('is-open')) closeChat(); });

})();
