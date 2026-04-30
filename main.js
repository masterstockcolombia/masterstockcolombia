document.getElementById('year').textContent = new Date().getFullYear();

// Modal
const modal = document.getElementById('manifest-modal');
let lastFocus = null;
function openModal(){lastFocus=document.activeElement;modal.classList.remove('hidden');modal.classList.add('flex');document.body.style.overflow='hidden';}
function closeModal(){modal.classList.add('hidden');modal.classList.remove('flex');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
document.querySelectorAll('[data-open-modal]').forEach(b=>b.addEventListener('click',openModal));
document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModal));
modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))closeModal();});

// Intell modal (Supplier Brief subscribe)
const intellModal = document.getElementById('intell-modal');
let intellLastFocus = null;
function openIntellModal(){
  if(!intellModal) return;
  intellLastFocus = document.activeElement;
  // Update date display
  const dateEl = document.getElementById('intell-modal-date');
  if (dateEl) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const d = new Date('2026-04-20T00:00:00');
    dateEl.textContent = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  // Reset form state
  const emailEl = document.getElementById('intell-email');
  const errorEl = document.getElementById('intell-email-error');
  const successEl = document.getElementById('intell-success');
  const formEl = document.getElementById('intell-form');
  if (emailEl) { emailEl.value = ''; emailEl.classList.remove('border-red-500'); }
  if (errorEl) errorEl.classList.add('hidden');
  if (successEl) successEl.classList.add('hidden');
  if (formEl) formEl.querySelector('button[type="submit"]').disabled = false;
  intellModal.classList.remove('hidden');
  intellModal.classList.add('flex');
  document.body.style.overflow='hidden';
  setTimeout(() => { if(emailEl) emailEl.focus(); }, 100);
}
function closeIntellModal(){
  if(!intellModal) return;
  intellModal.classList.add('hidden');
  intellModal.classList.remove('flex');
  document.body.style.overflow='';
  if(intellLastFocus) intellLastFocus.focus();
}
document.querySelectorAll('[data-open-intell]').forEach(b=>b.addEventListener('click',openIntellModal));
document.querySelectorAll('[data-close-intell]').forEach(b=>b.addEventListener('click',closeIntellModal));
if(intellModal){ intellModal.addEventListener('click',e=>{if(e.target===intellModal)closeIntellModal();}); }
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&intellModal&&!intellModal.classList.contains('hidden'))closeIntellModal();});

// Intell form submit — email validation + success state
const intellForm = document.getElementById('intell-form');
if (intellForm) {
  const blockedDomains = ['gmail.com','yahoo.com','hotmail.com','outlook.com','live.com','aol.com','icloud.com','protonmail.com','mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','yopmail.com'];
  intellForm.addEventListener('submit', e => {
    e.preventDefault();
    const emailEl = document.getElementById('intell-email');
    const errorEl = document.getElementById('intell-email-error');
    const successEl = document.getElementById('intell-success');
    const successEmailEl = document.getElementById('intell-success-email');
    const email = emailEl.value.trim().toLowerCase();
    // Validate
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.textContent = 'Please enter a valid email address.';
      errorEl.classList.remove('hidden');
      emailEl.classList.add('border-red-500');
      return;
    }
    const domain = email.split('@')[1];
    if (blockedDomains.includes(domain)) {
      errorEl.textContent = 'Please use a work email (no Gmail, Yahoo, etc.).';
      errorEl.classList.remove('hidden');
      emailEl.classList.add('border-red-500');
      return;
    }
    // Success
    errorEl.classList.add('hidden');
    emailEl.classList.remove('border-red-500');
    if (successEmailEl) successEmailEl.textContent = email;
    successEl.classList.remove('hidden');
    intellForm.querySelector('button[type="submit"]').disabled = true;
  });
}

// Review modal (three offers)
const reviewModal = document.getElementById('review-modal');
let reviewLastFocus = null;
function openReviewModal(){ if(!reviewModal) return; reviewLastFocus = document.activeElement; reviewModal.classList.remove('hidden'); reviewModal.classList.add('flex'); document.body.style.overflow='hidden'; }
function closeReviewModal(){ if(!reviewModal) return; reviewModal.classList.add('hidden'); reviewModal.classList.remove('flex'); document.body.style.overflow=''; if(reviewLastFocus) reviewLastFocus.focus(); }
document.querySelectorAll('[data-open-review]').forEach(b=>b.addEventListener('click',openReviewModal));
document.querySelectorAll('[data-close-review]').forEach(b=>b.addEventListener('click',closeReviewModal));
if(reviewModal){ reviewModal.addEventListener('click',e=>{if(e.target===reviewModal)closeReviewModal();}); }
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&reviewModal&&!reviewModal.classList.contains('hidden'))closeReviewModal();});
document.querySelectorAll('[data-open-manifest-from-review]').forEach(b=>b.addEventListener('click',()=>{closeReviewModal();setTimeout(openModal,150);}));

// Pickup (EXW) modal
const pickupModal = document.getElementById('pickup-modal');
let pickupLastFocus = null;
function openPickupModal(){ if(!pickupModal) return; pickupLastFocus = document.activeElement; pickupModal.classList.remove('hidden'); pickupModal.classList.add('flex'); document.body.style.overflow='hidden'; }
function closePickupModal(){ if(!pickupModal) return; pickupModal.classList.add('hidden'); pickupModal.classList.remove('flex'); document.body.style.overflow=''; if(pickupLastFocus) pickupLastFocus.focus(); }
document.querySelectorAll('[data-open-pickup]').forEach(b=>b.addEventListener('click',openPickupModal));
document.querySelectorAll('[data-close-pickup]').forEach(b=>b.addEventListener('click',closePickupModal));
if(pickupModal){ pickupModal.addEventListener('click',e=>{if(e.target===pickupModal)closePickupModal();}); }
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pickupModal&&!pickupModal.classList.contains('hidden'))closePickupModal();});
document.querySelectorAll('[data-open-manifest-from-pickup]').forEach(b=>b.addEventListener('click',()=>{closePickupModal();setTimeout(openModal,150);}));

// Form state
const catButtons=document.querySelectorAll('.cat-btn');
const catValue=document.getElementById('category-value');
const catError=document.getElementById('category-error');
catButtons.forEach(btn=>btn.addEventListener('click',()=>{catButtons.forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');catValue.value=btn.dataset.cat;catError.classList.add('hidden');}));
const qtyButtons=document.querySelectorAll('.qty-btn');
const qtyValue=document.getElementById('qty-value');
const qtyError=document.getElementById('qty-error');
qtyButtons.forEach(btn=>btn.addEventListener('click',()=>{qtyButtons.forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');qtyValue.value=btn.dataset.qty;qtyError.classList.add('hidden');}));
const condError=document.getElementById('cond-error');
document.querySelectorAll('input[name="condition"]').forEach(r=>r.addEventListener('change',()=>condError.classList.add('hidden')));
const emailInput=document.getElementById('f-email');
const emailError=document.getElementById('email-error');
const tempDomains=['mailinator.com','guerrillamail.com','10minutemail.com','tempmail.com','yopmail.com','trashmail.com','sharklasers.com'];
function isValidEmail(v){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))return false;const d=v.split('@')[1].toLowerCase();return !tempDomains.includes(d);}
const form=document.getElementById('manifest-form');

// File upload handling
const fileInput=document.getElementById('f-files');
const fileList=document.getElementById('f-files-list');
const fileError=document.getElementById('f-files-error');
const fileDropLabel=document.querySelector('label[for="f-files"]');
const MAX_FILES=10;
const MAX_SIZE=25*1024*1024; // 25 MB
let selectedFiles=[];

function formatBytes(b){if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB';}
function fileIcon(name){const ext=name.split('.').pop().toLowerCase();if(['xlsx','xls','csv'].includes(ext))return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>';if(ext==='pdf')return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';if(['png','jpg','jpeg'].includes(ext))return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A5CD8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';}
function renderFiles(){
  fileList.innerHTML='';
  selectedFiles.forEach((f,idx)=>{
    const row=document.createElement('div');
    row.className='flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs';
    row.innerHTML='<div class="flex items-center gap-2 min-w-0 flex-1">'+fileIcon(f.name)+'<span class="truncate font-medium text-gray-900">'+f.name+'</span><span class="text-gray-400 flex-shrink-0">'+formatBytes(f.size)+'</span></div><button type="button" aria-label="Remove file" data-remove="'+idx+'" class="flex-shrink-0 rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    fileList.appendChild(row);
  });
  fileList.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{selectedFiles.splice(parseInt(btn.dataset.remove,10),1);renderFiles();}));
}
function addFiles(files){
  fileError.classList.add('hidden');fileError.textContent='';
  const arr=Array.from(files);
  const errs=[];
  arr.forEach(f=>{
    if(selectedFiles.length>=MAX_FILES){errs.push('Max '+MAX_FILES+' files. "'+f.name+'" skipped.');return;}
    if(f.size>MAX_SIZE){errs.push('"'+f.name+'" exceeds 25 MB limit.');return;}
    if(selectedFiles.some(x=>x.name===f.name&&x.size===f.size))return;
    selectedFiles.push(f);
  });
  if(errs.length){fileError.textContent=errs.join(' ');fileError.classList.remove('hidden');}
  renderFiles();
}
if(fileInput){
  fileInput.addEventListener('change',e=>{addFiles(e.target.files);fileInput.value='';});
  // Drag & drop
  ['dragenter','dragover'].forEach(ev=>fileDropLabel.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();fileDropLabel.classList.add('border-brand','bg-brand/5');}));
  ['dragleave','drop'].forEach(ev=>fileDropLabel.addEventListener(ev,e=>{e.preventDefault();e.stopPropagation();fileDropLabel.classList.remove('border-brand','bg-brand/5');}));
  fileDropLabel.addEventListener('drop',e=>{if(e.dataTransfer&&e.dataTransfer.files)addFiles(e.dataTransfer.files);});
}

function resetManifestForm(){
  selectedFiles=[];renderFiles();
  fileError.classList.add('hidden');
  const notes=document.getElementById('f-notes');if(notes)notes.value='';
  catValue.value='';qtyValue.value='';
  document.querySelectorAll('.cat-card,.qty-card').forEach(c=>c.classList.remove('selected'));
  document.querySelectorAll('input[name="condition"]').forEach(r=>r.checked=false);
  form.reset();
  document.getElementById('manifest-success').classList.add('hidden');
  form.querySelector('button[type="submit"]').disabled=false;
}

form.addEventListener('submit',e=>{e.preventDefault();let ok=true;if(!catValue.value){catError.classList.remove('hidden');ok=false;}if(!qtyValue.value){qtyError.classList.remove('hidden');ok=false;}if(!document.querySelector('input[name="condition"]:checked')){condError.classList.remove('hidden');ok=false;}if(!isValidEmail(emailInput.value.trim())){emailError.classList.remove('hidden');ok=false;}if(!ok)return;
  const payload={category:catValue.value,quantity:qtyValue.value,condition:(document.querySelector('input[name="condition"]:checked')||{}).value,email:emailInput.value.trim(),phone:(document.getElementById('f-phone')||{}).value,notes:(document.getElementById('f-notes')||{}).value,files:selectedFiles.map(f=>({name:f.name,size:f.size,type:f.type}))};
  console.log('Manifest submission:',payload);
  document.getElementById('manifest-success').classList.remove('hidden');form.querySelector('button[type="submit"]').disabled=true;
});

// Category modal
const CATEGORY_DATA={accessories:{title:'Accessories',subtitle:'Handbags, Watches, Luggage',items:['Handbags','Watches','Sunglasses','Jewelry','Backpacks','Belts','Wallets','Luggage','Scarves'],iconSvg:'<svg viewBox="0 0 48 48" fill="none" width="28" height="28"><path d="M16 18V12a8 8 0 0 1 16 0v6" stroke="currentColor" stroke-width="1.75"/></svg>'},apparel:{title:'Apparel',subtitle:'Clothing, Activewear, Fashion',items:['T-shirts','Hoodies','Denim','Activewear','Uniforms','Scrubs','Premium Fashion','Luxury Brands'],iconSvg:'<svg viewBox="0 0 48 48" fill="none" width="28" height="28"><path d="M17 12L10 16v6l5-1.5V40h18V20.5L38 22v-6l-7-4-2.5 3a5 5 0 0 1-9 0L17 12z" stroke="currentColor" stroke-width="1.75"/></svg>'},home_kitchen:{title:'Home & Kitchen',subtitle:'Cookware, Appliances, Tabletop',items:['Cookware','Small Appliances','Bakeware','Kitchen Gadgets','Tabletop'],iconSvg:'<svg viewBox="0 0 48 48" fill="none" width="28" height="28"><rect x="10" y="22" width="28" height="18" rx="2" stroke="currentColor" stroke-width="1.75"/></svg>'},toys_baby:{title:'Toys & Baby',subtitle:'LEGO, Strollers, Educational',items:['LEGO','Mattel','Fisher-Price','Strollers','Nursery Gear','Educational Toys','Baby Clothing'],iconSvg:'<svg viewBox="0 0 48 48" fill="none" width="28" height="28"><rect x="10" y="20" width="28" height="20" rx="2" stroke="currentColor" stroke-width="1.75"/></svg>'},tools_home:{title:'Tools & Home',subtitle:'Power Tools, DIY, Gardening',items:['Power Tools','Hand Tools','DIY','Gardening','Plumbing','Electrical'],iconSvg:'<svg viewBox="0 0 48 48" fill="none" width="28" height="28"><rect x="8" y="16" width="32" height="22" rx="2" stroke="currentColor" stroke-width="1.75"/></svg>'},technology:{title:'Technology',subtitle:'Laptops, Hardware, Networking',items:['Laptops','ITAD','Hardware','Enterprise','Consumer Electronics','Networking','Storage'],iconSvg:'<svg viewBox="0 0 48 48" fill="none" width="28" height="28"><rect x="8" y="12" width="32" height="22" rx="2.5" stroke="currentColor" stroke-width="1.75"/></svg>'}};
const catModal=document.getElementById('category-detail-modal');
let catLastFocus=null;
function openCatModal(key){const d=CATEGORY_DATA[key];if(!d)return;catLastFocus=document.activeElement;document.getElementById('cat-modal-title').textContent=d.title;document.getElementById('cat-modal-subtitle').textContent=d.subtitle;document.getElementById('cat-modal-icon').innerHTML=d.iconSvg;document.getElementById('cat-modal-items').innerHTML=d.items.map(i=>'<span class="cat-pill">'+i+'</span>').join('');catModal.classList.remove('hidden');catModal.classList.add('flex');document.body.style.overflow='hidden';}
function closeCatModal(){catModal.classList.add('hidden');catModal.classList.remove('flex');document.body.style.overflow='';if(catLastFocus)catLastFocus.focus();}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>openCatModal(b.dataset.category)));
document.querySelectorAll('[data-close-cat-modal]').forEach(b=>b.addEventListener('click',closeCatModal));
catModal.addEventListener('click',e=>{if(e.target===catModal)closeCatModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!catModal.classList.contains('hidden'))closeCatModal();});
document.querySelectorAll('[data-open-manifest-from-cat]').forEach(b=>b.addEventListener('click',()=>{closeCatModal();setTimeout(openModal,150);}));
const newsForm=document.getElementById('newsletter-form');
if(newsForm){newsForm.addEventListener('submit',e=>{e.preventDefault();const email=document.getElementById('newsletter-email').value.trim();if(!isValidEmail(email)){document.getElementById('newsletter-email').classList.add('border-red-500');return;}document.getElementById('newsletter-email').classList.remove('border-red-500');document.getElementById('newsletter-success').classList.remove('hidden');newsForm.querySelector('button[type="submit"]').disabled=true;newsForm.querySelector('button[type="submit"]').textContent='\u2713 Subscribed';});}

// Industry Pulse inline subscribe (bottom bar)
const pulseForm=document.getElementById('pulse-newsletter-form');
if(pulseForm){
  const pulseEmail=document.getElementById('pulse-email');
  const pulseOk=document.getElementById('pulse-subscribe-success');
  const pulseBtn=pulseForm.querySelector('button[type="submit"]');
  pulseForm.addEventListener('submit',e=>{
    e.preventDefault();
    const v=(pulseEmail.value||'').trim();
    if(!isValidEmail(v)){pulseEmail.classList.add('border-red-500');pulseEmail.focus();return;}
    pulseEmail.classList.remove('border-red-500');
    if(pulseOk){pulseOk.classList.remove('hidden');}
    pulseBtn.disabled=true;
    pulseBtn.innerHTML='<span>\u2713 Subscribed</span>';
  });
}

// STICKY HEADER SCROLL EFFECT + SEARCH
(function initHeaderAndSearch(){
  // Header shadow on scroll
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // In-page search index
  const SEARCH_INDEX = [
    // Primary actions
    { title: 'Send your manifest', hint: 'Get a 48h firm offer', action: 'modal', icon: 'send', tags: ['manifest','sell','offer','price','valuation','quote','send'], group: 'Actions' },
    { title: 'What We Buy', hint: 'Categories we accept', href: '#what-we-buy', icon: 'cart', tags: ['categories','what','buy','accept','inventory','excess'], group: 'Sections' },
    { title: 'FAQ', hint: 'Common questions', href: '#faq', icon: 'help', tags: ['faq','questions','help','common','ask'], group: 'Sections' },
    { title: 'About MasterStock USA', hint: 'Who we are', href: '#about', icon: 'info', tags: ['about','who','company','team','contact'], group: 'Sections' },
    { title: 'Accreditations & Trust', hint: 'D-U-N-S, UN Global Compact, Atlassian', href: '#trust', icon: 'shield', tags: ['trust','accredited','duns','un','atlassian','itsm','registered','compliance'], group: 'Sections' },
    { title: 'Industry Pulse', hint: 'Weekly market signals', href: '#news', icon: 'chart', tags: ['news','pulse','market','signals','industry','retail','tariff','update'], group: 'Sections' },

    // Categories
    { title: 'Accessories', hint: 'Handbags, watches, luggage', href: '#what-we-buy', icon: 'bag', tags: ['accessories','handbags','watches','sunglasses','jewelry','wallets','luggage'], group: 'Categories' },
    { title: 'Apparel', hint: 'Clothing, activewear, fashion', href: '#what-we-buy', icon: 'shirt', tags: ['apparel','clothing','tshirts','hoodies','denim','activewear','fashion'], group: 'Categories' },
    { title: 'Home & Kitchen', hint: 'Cookware, appliances', href: '#what-we-buy', icon: 'home', tags: ['home','kitchen','cookware','appliances','bakeware','tabletop'], group: 'Categories' },
    { title: 'Toys & Baby', hint: 'LEGO, strollers, educational', href: '#what-we-buy', icon: 'toy', tags: ['toys','baby','lego','strollers','nursery','educational','mattel'], group: 'Categories' },
    { title: 'Tools & Home', hint: 'Power tools, DIY', href: '#what-we-buy', icon: 'tool', tags: ['tools','diy','gardening','plumbing','electrical','power'], group: 'Categories' },
    { title: 'Technology', hint: 'Laptops, hardware, networking', href: '#what-we-buy', icon: 'laptop', tags: ['technology','laptops','hardware','itad','enterprise','networking','storage'], group: 'Categories' },

    // FAQs
    { title: 'Do you take title directly, or match us with another buyer?', href: '#faq', icon: 'help', tags: ['principal','broker','buyer','title','direct'], group: 'FAQ' },
    { title: 'How does the 48-hour offer work?', href: '#faq', icon: 'help', tags: ['48','hours','offer','turnaround','price','audit'], group: 'FAQ' },
    { title: 'How is the payment structured?', href: '#faq', icon: 'help', tags: ['payment','paid','pickup','wire','balance','inspection','mercury'], group: 'FAQ' },
    { title: 'What items do you not buy?', href: '#faq', icon: 'help', tags: ['fda','firearms','hazmat','not','excluded','food','medical'], group: 'FAQ' },
    { title: 'What format do you need the manifest in?', href: '#faq', icon: 'help', tags: ['format','manifest','excel','csv','spreadsheet','template','sku'], group: 'FAQ' },
    { title: 'What does it cost me to sell to you?', href: '#faq', icon: 'help', tags: ['cost','fees','price','free','zero'], group: 'FAQ' },
    { title: 'How fast do I get paid?', href: '#faq', icon: 'help', tags: ['fast','paid','payment','timeline','days','speed'], group: 'FAQ' },
    { title: 'Can we sign an NDA?', href: '#faq', icon: 'help', tags: ['nda','confidentiality','legal','mutual','privacy'], group: 'FAQ' },
    { title: 'Where do you pickup from?', href: '#faq', icon: 'help', tags: ['pickup','states','california','new jersey','texas','hubs','location'], group: 'FAQ' },
    { title: 'Do you do one-off deals or recurring?', href: '#faq', icon: 'help', tags: ['deals','recurring','monthly','volume','programs'], group: 'FAQ' },
    { title: 'Will my brand end up on eBay or Amazon?', href: '#faq', icon: 'help', tags: ['brand','protection','ebay','amazon','channel','restrictions','marketplace'], group: 'FAQ' },
    { title: 'Is there a minimum lot size?', href: '#faq', icon: 'help', tags: ['minimum','lot','size','pallets','trailer','volume'], group: 'FAQ' },
  ];

  const ICONS = {
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18V12a8 8 0 0 1-16 0 M10 18h28l-2 22a3 3 0 0 1-3 2.7H15a3 3 0 0 1-3-2.7L10 18z"/><path d="M6 6h15l-2 14H8L6 6z"/></svg>',
    shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4L4 6v4l3-1v10h10V9l3 1V6l-4-2-2 2a3 3 0 0 1-4 0l-2-2z"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1V10"/></svg>',
    toy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="8" cy="11" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="16" cy="11" r="1.5"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
  };

  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  if (!input || !results) return;

  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const highlight = (text, query) => {
    if (!query) return text;
    const q = normalize(query);
    const t = text;
    const tn = normalize(t);
    const idx = tn.indexOf(q);
    if (idx < 0) return text;
    return t.slice(0, idx) + '<mark>' + t.slice(idx, idx + q.length) + '</mark>' + t.slice(idx + q.length);
  };

  const renderResults = (query) => {
    const q = normalize(query || '').trim();
    let matches;
    if (!q) {
      matches = SEARCH_INDEX.slice(0, 8);
    } else {
      matches = SEARCH_INDEX.filter(item => {
        const hay = normalize(item.title + ' ' + (item.hint || '') + ' ' + (item.tags || []).join(' '));
        return hay.includes(q);
      }).slice(0, 12);
    }

    if (matches.length === 0) {
      results.innerHTML = '<div class="site-search-empty">No matches for &ldquo;' + (query || '') + '&rdquo;. Try "manifest", "tariff", "bankruptcy", or "brand protection".</div>';
      results.classList.add('is-visible'); results.classList.remove('hidden');
      return;
    }

    const groups = {};
    matches.forEach(m => { (groups[m.group] = groups[m.group] || []).push(m); });
    let html = '';
    Object.keys(groups).forEach(g => {
      html += '<div class="site-search-group">' + g + '</div>';
      groups[g].forEach((item) => {
        const href = item.href || '#';
        html += '<a href="' + href + '" class="site-search-item" data-action="' + (item.action || '') + '" role="option">'
          + '<span class="site-search-item-icon">' + (ICONS[item.icon] || ICONS.info) + '</span>'
          + '<span class="site-search-item-body">'
          + '<span class="site-search-item-title">' + highlight(item.title, query) + '</span>'
          + (item.hint ? '<span class="site-search-item-hint">' + highlight(item.hint, query) + '</span>' : '')
          + '</span></a>';
      });
    });
    results.innerHTML = html;
    results.classList.add('is-visible'); results.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
    results.querySelectorAll('.site-search-item').forEach(a => {
      a.addEventListener('click', e => {
        const action = a.dataset.action;
        hideResults();
        input.value = '';
        if (action === 'modal') {
          e.preventDefault();
          const m = document.getElementById('manifest-modal');
          if (m) { m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow = 'hidden'; }
        }
      });
    });
  };

  const hideResults = () => { results.classList.add('hidden'); results.classList.remove('is-visible'); input.setAttribute('aria-expanded', 'false'); };

  input.addEventListener('focus', () => renderResults(input.value));
  input.addEventListener('input', () => renderResults(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { input.blur(); hideResults(); }
    if (e.key === 'Enter') { e.preventDefault(); const first = results.querySelector('.site-search-item'); if (first) first.click(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.site-search')) hideResults(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      input.focus();
    }
  });
})();

// HERO SLIDER
// Dynamic intell freshness — show "New" only if issue is < 72h old
(function initIntellFreshness(){
  // TODO: Replace with actual publish date when you publish each week
  const ISSUE_PUBLISH_DATE = new Date('2026-04-20T00:00:00'); // Latest issue date
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const hoursSince = (now - ISSUE_PUBLISH_DATE) / (1000 * 60 * 60);

  // Masthead date (top-right of brief card)
  const headerDate = document.getElementById('hero-intell-date');
  if (headerDate) {
    headerDate.textContent = months[ISSUE_PUBLISH_DATE.getMonth()] + ' ' + String(ISSUE_PUBLISH_DATE.getDate()).padStart(2,'0') + ', ' + ISSUE_PUBLISH_DATE.getFullYear();
  }

  // Issue # date (inside body)
  const issueDate = document.getElementById('hero-intell-issue-date');
  if (issueDate) {
    issueDate.textContent = months[ISSUE_PUBLISH_DATE.getMonth()] + ' ' + ISSUE_PUBLISH_DATE.getDate();
  }

  // Freshness badge — rules:
  //   < 24h = "Just published"
  //   < 72h = "New"
  //   < 7 days = "This week"
  //   otherwise: show relative date "Apr 17" and change badge color
  const freshnessWrap = document.getElementById('hero-intell-freshness');
  const freshnessLabel = document.getElementById('hero-intell-freshness-label');
  if (freshnessWrap && freshnessLabel) {
    if (hoursSince < 24) {
      freshnessLabel.textContent = 'Just out';
    } else if (hoursSince < 72) {
      freshnessLabel.textContent = 'New';
    } else if (hoursSince < 24 * 7) {
      freshnessLabel.textContent = 'This week';
      freshnessWrap.classList.remove('bg-emerald-500');
      freshnessWrap.classList.add('bg-[#6EC6FF]');
      freshnessWrap.style.color = '#0A1628';
    } else {
      // Older — show date instead of NEW
      freshnessLabel.textContent = months[ISSUE_PUBLISH_DATE.getMonth()] + ' ' + ISSUE_PUBLISH_DATE.getDate();
      freshnessWrap.classList.remove('bg-emerald-500');
      freshnessWrap.classList.add('bg-slate-500');
      // Remove pulse (not fresh anymore)
      const pulse = freshnessWrap.querySelector('.animate-pulse');
      if (pulse) pulse.remove();
    }
  }

  // Last verified counter (in supporting text below CTAs)
  const lastVerified = document.getElementById('hero-intell-last-verified');
  if (lastVerified) {
    // Use the first day of current month as "last verification" timestamp
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    lastVerified.textContent = months[firstOfMonth.getMonth()] + ' ' + firstOfMonth.getFullYear();
  }
})();

(function initHeroSlider(){
  const track = document.getElementById('hero-slider-track');
  if (!track) return;
  const slides = Array.from(track.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('#hero-slider .hero-slider-dot'));
  const prevBtn = document.getElementById('hero-prev');
  const nextBtn = document.getElementById('hero-next');
  const progressBar = document.getElementById('hero-progress-bar');
  const slider = document.getElementById('hero-slider');
  const total = slides.length;
  if (total === 0) return;

  let current = 0;
  const AUTO_INTERVAL = 10000;
  let autoTimer = null;
  let progressStart = null;
  let progressRaf = null;
  let autoPermanentlyStopped = false;
  let hoverTimer = null;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = (i) => {
    current = ((i % total) + total) % total;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    dots.forEach((d, idx) => { d.classList.toggle('is-active', idx === current); d.setAttribute('aria-selected', idx === current ? 'true' : 'false'); });
    slides.forEach((s, idx) => s.setAttribute('aria-hidden', idx === current ? 'false' : 'true'));
  };
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);
  const updateProgress = (ts) => {
    if (!progressStart) progressStart = ts;
    const elapsed = ts - progressStart;
    const pct = Math.min(100, (elapsed / AUTO_INTERVAL) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (pct < 100) progressRaf = requestAnimationFrame(updateProgress);
  };
  const startAuto = () => {
    if (autoTimer || autoPermanentlyStopped) return;
    if (isMobile() || reducedMotion) return;
    progressStart = null;
    progressRaf = requestAnimationFrame(updateProgress);
    autoTimer = setInterval(() => {
      progressStart = null;
      if (progressBar) progressBar.style.width = '0%';
      cancelAnimationFrame(progressRaf);
      progressRaf = requestAnimationFrame(updateProgress);
      next();
    }, AUTO_INTERVAL);
  };
  const stopAuto = () => {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    if (progressRaf) { cancelAnimationFrame(progressRaf); progressRaf = null; }
    if (progressBar) progressBar.style.width = '0%';
  };
  const stopAutoPermanent = () => { autoPermanentlyStopped = true; stopAuto(); };

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); stopAutoPermanent(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); stopAutoPermanent(); });
  dots.forEach(dot => dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.heroGoto, 10)); stopAutoPermanent(); }));

  slider.addEventListener('mouseenter', () => { stopAuto(); hoverTimer = setTimeout(() => { autoPermanentlyStopped = true; }, 3000); });
  slider.addEventListener('mouseleave', () => { if (hoverTimer) clearTimeout(hoverTimer); if (!autoPermanentlyStopped) startAuto(); });
  slider.addEventListener('focusin', stopAuto);
  slider.addEventListener('focusout', () => { if (!autoPermanentlyStopped) startAuto(); });
  slider.addEventListener('touchstart', stopAutoPermanent, { passive: true });
  slider.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { prev(); stopAutoPermanent(); } if (e.key === 'ArrowRight') { next(); stopAutoPermanent(); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto(); else if (!autoPermanentlyStopped) startAuto(); });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - touchStartX; if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); stopAutoPermanent(); } });

  goTo(0);
  setTimeout(startAuto, 800);
})();

// Floating Send Manifest
(function initFloatingManifest(){
  const btn = document.getElementById('floating-manifest');
  if (!btn) return;
  const hero = document.querySelector('.hero-wrap');
  if (!hero) return;
  const manifestModal = document.getElementById('manifest-modal');
  const update = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const modalOpen = manifestModal && !manifestModal.classList.contains('hidden');
    btn.classList.toggle('is-visible', heroBottom < 40 && !modalOpen);
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (manifestModal) { const obs = new MutationObserver(update); obs.observe(manifestModal, { attributes: true, attributeFilter: ['class'] }); }
  update();
})();

// ========= SUPPLIER DESK CHATBOT =========
(function initChatbot(){
  const widget = document.getElementById('chat-widget');
  const toggle = document.getElementById('chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const body = document.getElementById('chat-body');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input-field');
  const suggestionsList = document.getElementById('chat-suggestions-list');
  if (!widget || !toggle || !panel || !body || !form || !input) return;

  // Knowledge base — keyword-matched FAQs
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
      a: "Yes. We'll sign your NDA or use our standard mutual 2-way NDA (available in the footer under Resources). Either way, your data stays with us and is not shared outside the deal team."
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
      a: "Yes. We're registered with <strong>D-U-N-S (Dun & Bradstreet)</strong>, Atlassian Partner certified (Agile-at-Scale + ITSM), and a supporter of the <strong>UN Global Compact</strong>. MasterStock USA Inc., based in Delaware, banking through Mercury. Full details in the Accredited & Registered section of the page."
    },
    {
      keys: ['supplier brief','newsletter','weekly','subscribe','intell','industry pulse','insights','market signals','tariffs update','weekly brief','subscribe newsletter'],
      q: 'What is the Supplier Brief?',
      a: "It's our <strong>free weekly newsletter</strong> for suppliers: retailer distress signals that flood resale channels, tariff moves that change your landed cost, and category-level market shifts. Supplier-only, no spam. Subscribe from the footer or the Industry Pulse section."
    },
    {
      keys: ['how to start','get started','where do i start','how do i begin','first deal','first step','begin','start','next step','what next','where to begin'],
      q: 'How do I get started?',
      a: "Easiest path: <a href='#' data-chat-open-manifest>send your manifest</a> (Excel, CSV, PDF, or photos work). We'll return a firm written offer within 48 hours. No commitment, no fees. If you prefer to talk first, email <a href='mailto:info@masterstockunitedstates.com'>info@masterstockunitedstates.com</a>."
    }
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

  function scrollToBottom(){
    requestAnimationFrame(() => {
      body.scrollTop = body.scrollHeight;
    });
  }
  function scrollMessageIntoView(msg){
    // Scroll so the START of the new bot message is visible, not the bottom
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
    if (who === 'bot') scrollMessageIntoView(msg);
    else scrollToBottom();
    return msg;
  }

  function showTyping(){
    const t = document.createElement('div');
    t.className = 'chat-typing';
    t.id = 'chat-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    scrollToBottom();
  }
  function hideTyping(){
    const t = document.getElementById('chat-typing');
    if (t) t.remove();
  }

  // Small-talk patterns (checked first, before KB lookup)
  const SMALL_TALK = [
    {
      re: /^(hi|hello|hey|hola|howdy|yo|hiya|sup|what'?s up)\b/i,
      replies: [
        "Hey! Nice to connect. What would you like to know about selling your excess stock? You can pick one of the questions below or ask anything.",
        "Hi there. I can help with how our offers work, pickup, payment, NDAs, or what categories we buy. What's on your mind?",
        "Hello! I'm here to answer supplier questions. Pick any of the suggestions below or type your own."
      ]
    },
    {
      re: /^(good\s*(morning|afternoon|evening|day))\b/i,
      replies: [
        "Good to see you. How can I help you with your excess inventory today? Feel free to pick a question below or type your own."
      ]
    },
    {
      re: /^(thanks|thank you|thx|ty|appreciate)/i,
      replies: [
        "Anytime. If anything else comes up, I'm here. You can also send a manifest whenever you're ready and we'll come back with a written offer in 48h.",
        "You're welcome. Happy to answer more questions, or if you want to move forward, you can send a manifest anytime."
      ]
    },
    {
      re: /^(bye|goodbye|see you|later|adios|chao)/i,
      replies: [
        "Take care. When you're ready to get a price on your stock, just send a manifest and we'll respond in 48h."
      ]
    },
    {
      re: /^(ok|okay|cool|got it|nice|great|awesome|perfect|alright|sure)\b/i,
      replies: [
        "Got it. Anything else you'd like to know? Pick a question below or type your own.",
        "Good. What else can I help with? Categories, payment, pickup, or NDA terms are all common next questions."
      ]
    },
    {
      re: /^(who are you|what are you|are you (a\s)?bot|are you human|are you real)/i,
      replies: [
        "I'm the Supplier Desk assistant for MasterStock USA. I handle common supplier questions and route you to the team when it's time for a real offer. Ask away."
      ]
    },
    {
      re: /^(help|i need help|can you help|need help)/i,
