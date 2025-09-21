// Basic interactivity: menu toggle, modal, donation flow (Payment Request API demo)
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  menuToggle?.addEventListener('click', ()=> nav.classList.toggle('open'));

  const donateBtn = document.getElementById('donateBtn');
  const heroDonate = document.getElementById('heroDonate');
  const modal = document.getElementById('donationModal');
  const modalClose = document.querySelector('.modal-close');
  const amtButtons = document.querySelectorAll('.amt');
  const customAmount = document.getElementById('customAmount');
  const payRequestBtn = document.getElementById('payRequestBtn');
  const paymentResult = document.getElementById('paymentResult');

  function openModal(){ modal.setAttribute('aria-hidden','false'); }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); paymentResult.textContent=''; }

  donateBtn?.addEventListener('click', openModal);
  heroDonate?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

  amtButtons.forEach(b=> b.addEventListener('click', ()=>{
    amtButtons.forEach(x=> x.classList.remove('selected'));
    b.classList.add('selected');
    customAmount.value = b.dataset.amount;
  }));

  payRequestBtn.addEventListener('click', async ()=>{
    const amount = Number(customAmount.value) || 0;
    if(amount <= 0){ paymentResult.textContent = 'Por favor ingresa una cantidad válida.'; paymentResult.style.color='crimson'; return }

    // Payment Request API minimal demo
    const supportedInstruments = [
      {
        supportedMethods: 'https://apple.com/apple-pay',
        data: {
          version: 3,
          merchantIdentifier: 'merchant.com.example',
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['visa', 'mastercard', 'amex'],
          countryCode: 'US'
        }
      },
      {
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa','mastercard']
        }
      }
    ];

    const details = {
      total: {label: 'Donación a Maná del Cielo', amount: {currency: 'USD', value: amount.toFixed(2)}},
      displayItems: [
        {label: 'Donación', amount: {currency: 'USD', value: amount.toFixed(2)}}
      ]
    };

    try{
      if(window.PaymentRequest){
        const request = new PaymentRequest(supportedInstruments, details);
        // show() will fail for Apple Pay in insecure origins or without proper merchant setup
        const canMake = await request.canMakePayment?.();
        if(canMake === false){
          paymentResult.style.color='crimson';
          paymentResult.textContent = 'Este dispositivo no puede pagar con los métodos detectados. Usando fallback.';
        }

        const response = await request.show();
        // In a real integration we'd send response.details to the server
        await response.complete('success');
        paymentResult.style.color='green';
        paymentResult.textContent = `Gracias! Donación de $${amount.toFixed(2)} completada (demo).`;
      } else {
        paymentResult.style.color='crimson';
        paymentResult.textContent = 'Payment Request API no está disponible en este navegador.';
      }
    }catch(err){
      console.error(err);
      paymentResult.style.color='crimson';
      paymentResult.textContent = 'Pago cancelado o fallido: '+(err.message||err);
    }
  });

  // Fallback card form demo
  const cardFallback = document.querySelector('.card-fallback');
  const cardSubmit = document.getElementById('cardSubmit');
  cardSubmit?.addEventListener('click', ()=>{
    const name = document.getElementById('cardName')?.value || '';
    const number = document.getElementById('cardNumber')?.value || '';
    const exp = document.getElementById('cardExp')?.value || '';
    const cvc = document.getElementById('cardCvc')?.value || '';
    const amount = Number(customAmount.value) || 0;
    if(!name || !number || !exp || !cvc || amount<=0){
      paymentResult.style.color='crimson';
      paymentResult.textContent = 'Completa todos los campos y una cantidad válida.';
      return;
    }
    // Demo only: in production, send to server to process via gateway
    paymentResult.style.color='green';
    paymentResult.textContent = `Gracias! Donación de $${amount.toFixed(2)} completada con tarjeta (demo).`;
  });

  // Payment method selection (Apple Pay / Card) and validation
  const pmApple = document.getElementById('pm-apple');
  const pmCard = document.getElementById('pm-card');
  const cardMethod = document.querySelector('.card-method');
  const appleMethod = document.querySelector('.apple-method');
  const applePayBtn = document.getElementById('applePayBtn');
  const cardNameInput = document.getElementById('cardName');
  const cardNumberInput = document.getElementById('cardNumber');
  const cardExpInput = document.getElementById('cardExp');
  const cardCvcInput = document.getElementById('cardCvc');
  const cardValidState = document.getElementById('cardValidState');

  function resetPaymentUI(){
    [pmApple, pmCard].forEach(b=> b?.setAttribute('aria-pressed','false'));
    if(cardFallback){ cardFallback.style.display='none'; cardFallback.setAttribute('aria-hidden','true'); }
    if(cardMethod) cardMethod.style.display='none';
    if(appleMethod) appleMethod.style.display='none';
  }

  function showMethod(method){
    resetPaymentUI();
    if(method==='apple'){
      pmApple?.setAttribute('aria-pressed','true');
      if(cardFallback){ cardFallback.style.display='block'; cardFallback.setAttribute('aria-hidden','false'); }
      if(appleMethod) appleMethod.style.display='block';
    } else if(method==='card'){
      pmCard?.setAttribute('aria-pressed','true');
      if(cardFallback){ cardFallback.style.display='block'; cardFallback.setAttribute('aria-hidden','false'); }
      if(cardMethod) cardMethod.style.display='block';
    }
  }

  pmApple?.addEventListener('click', ()=> showMethod('apple'));
  pmCard?.addEventListener('click', ()=> showMethod('card'));

  // Demo Apple Pay button (client-only demo)
  applePayBtn?.addEventListener('click', async ()=>{
    paymentResult.textContent='';
    // Try Payment Request with Apple Pay method only
    try{
      if(window.PaymentRequest){
        const supported = [{ supportedMethods: 'https://apple.com/apple-pay', data: { version: 3, merchantIdentifier: 'merchant.com.example', merchantCapabilities:['supports3DS'], supportedNetworks:['visa','mastercard'], countryCode: 'US' } }];
        const details = { total: {label: 'Donación', amount: {currency:'USD', value: (Number(customAmount.value)||0).toFixed(2)}} };
        const req = new PaymentRequest(supported, details);
        const canMake = await req.canMakePayment?.();
        if(canMake === false){ paymentResult.style.color='crimson'; paymentResult.textContent='Apple Pay no está disponible en este dispositivo.'; return }
        const resp = await req.show(); await resp.complete('success');
        paymentResult.style.color='green'; paymentResult.textContent = 'Donación completada con Apple Pay (demo).';
      } else {
        paymentResult.style.color='crimson'; paymentResult.textContent = 'Payment Request API no disponible.';
      }
    }catch(err){ paymentResult.style.color='crimson'; paymentResult.textContent = 'Pago Apple Pay fallido o cancelado.'; }
  });

  // Card validation helpers
  function luhnCheck(num){
    const digits = num.replace(/\D/g,'');
    let sum = 0; let alt = false;
    for(let i=digits.length-1;i>=0;i--){ let n = parseInt(digits.charAt(i),10); if(alt){ n*=2; if(n>9) n-=9 } sum+=n; alt=!alt }
    return (sum % 10) === 0;
  }

  function validExpiry(val){
    const m = val.split('/').map(s=>s.trim());
    if(m.length!==2) return false;
    let mm = parseInt(m[0],10); let yy = parseInt(m[1],10);
    if(isNaN(mm) || isNaN(yy) ) return false;
    if(mm < 1 || mm > 12) return false;
    // two-digit year -> convert
    if(yy < 100) yy += (yy < 70 ? 2000 : 1900);
    const exp = new Date(yy, mm-1+1, 1); // first day of month after expiry
    return exp > new Date();
  }

  function validCvc(val){ return /^[0-9]{3,4}$/.test(val); }

  function updateCardValidation(){
    const num = cardNumberInput?.value||'';
    const exp = cardExpInput?.value||'';
    const cvc = cardCvcInput?.value||'';
    const name = cardNameInput?.value||'';
    let ok = true; let msgs = [];
    if(!name) { ok = false; msgs.push('Nombre requerido'); }
    if(!luhnCheck(num)) { ok=false; msgs.push('Número de tarjeta inválido'); }
    if(!validExpiry(exp)) { ok=false; msgs.push('Fecha de expiración inválida'); }
    if(!validCvc(cvc)) { ok=false; msgs.push('CVC inválido'); }
    cardValidState.textContent = msgs.join(' · ');
    if(cardSubmit) cardSubmit.disabled = !ok;
    return ok;
  }

  [cardNumberInput, cardExpInput, cardCvcInput, cardNameInput].forEach(inp=>{ if(!inp) return; inp.addEventListener('input', ()=> updateCardValidation()); });

  // Input formatting: group card number, auto-insert slash in expiry
  function formatCardNumber(value){
    const digits = value.replace(/\D/g,'').slice(0,19);
    // group in 4s (works for most cards); amex has 4-6-5 but basic grouping is fine for demo
    return digits.replace(/(.{4})/g,'$1 ').trim();
  }
  function formatExpiry(value){
    const digits = value.replace(/\D/g,'').slice(0,4);
    if(digits.length>=3) return digits.slice(0,2) + '/' + digits.slice(2);
    if(digits.length>=1 && digits.length<=2) return digits;
    return value;
  }

  cardNumberInput?.addEventListener('input', (e)=>{
    const pos = cardNumberInput.selectionStart || 0;
    cardNumberInput.value = formatCardNumber(cardNumberInput.value);
    updateCardValidation();
  });
  cardExpInput?.addEventListener('input', ()=>{ cardExpInput.value = formatExpiry(cardExpInput.value); updateCardValidation(); });

  // Brand detection (simple): Visa starts with 4, Amex 34/37, Mastercard 51-55 or 2221-2720
  const brandIcon = document.createElement('img'); brandIcon.className='pm-icon'; brandIcon.style.width='36px'; brandIcon.style.marginLeft='8px';
  function detectBrand(num){
    const d = (num||'').replace(/\D/g,'');
    if(/^4/.test(d)) return 'visa';
    if(/^(34|37)/.test(d)) return 'amex';
    if(/^(5[1-5])/.test(d) || /^(22[2-9]|2[3-6]|27[01]|2720)/.test(d)) return 'mastercard';
    return '';
  }
  cardNumberInput?.addEventListener('input', ()=>{
    const b = detectBrand(cardNumberInput.value);
    if(b){ brandIcon.src = `assets/${b}.svg`; brandIcon.alt = b; if(cardNumberInput.parentNode && !cardNumberInput.parentNode.querySelector('.pm-icon.brand')){ brandIcon.classList.add('brand'); brandIcon.classList.add('pm-icon'); brandIcon.setAttribute('aria-hidden','true'); cardNumberInput.parentNode.appendChild(brandIcon); } }
    updateCardValidation();
  });

  // Stripe tokenization demo: will load Stripe.js only if a publishable key is set here.
  const STRIPE_PUBLISHABLE_KEY = '';// <-- set your publishable key here to enable Stripe tokenization demo
  async function loadStripeJs(){
    if(window.Stripe) return window.Stripe;
    return new Promise((resolve, reject)=>{
      const s = document.createElement('script'); s.src='https://js.stripe.com/v3/'; s.onload = ()=> resolve(window.Stripe); s.onerror = reject; document.head.appendChild(s);
    });
  }

  cardSubmit?.addEventListener('click', async (e)=>{
    e.preventDefault(); paymentResult.textContent='';
    if(!updateCardValidation()) { paymentResult.style.color='crimson'; paymentResult.textContent='Corrige los errores en el formulario.'; return }
    const amount = Number(customAmount.value) || 0; if(amount<=0){ paymentResult.style.color='crimson'; paymentResult.textContent='Ingresa una cantidad válida.'; return }
    const cardData = {
      number: (cardNumberInput.value||'').replace(/\s+/g,''),
      exp: cardExpInput.value,
      cvc: cardCvcInput.value,
      name: cardNameInput.value
    };

    if(STRIPE_PUBLISHABLE_KEY){
      try{
        const Stripe = await loadStripeJs();
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const tokenResult = await stripe.createToken('card', {
          number: cardData.number,
          exp_month: cardData.exp.split('/')[0],
          exp_year: cardData.exp.split('/')[1],
          cvc: cardData.cvc,
          name: cardData.name
        });
        if(tokenResult.error){ paymentResult.style.color='crimson'; paymentResult.textContent = 'Error al tokenizar: '+tokenResult.error.message; return }
        // In production send tokenResult.token.id to your server to charge
        paymentResult.style.color='green'; paymentResult.textContent = 'Token creado con éxito (demo). Enviar token al servidor para cobrar.';
      }catch(err){ paymentResult.style.color='crimson'; paymentResult.textContent = 'Falló la inicialización de Stripe.'; }
    } else {
      // Fallback demo behavior
      paymentResult.style.color='green';
      paymentResult.textContent = `Donación de $${amount.toFixed(2)} registrada (demo).`;    
    }
  });


  // Detect PaymentRequest availability and show fallback if not
  (function detectPR(){
    if(!window.PaymentRequest){
      document.querySelector('.note').textContent += ' (Payment Request API no disponible)';
      const fallback = document.querySelector('.card-fallback');
      if(fallback) { fallback.style.display='block'; fallback.setAttribute('aria-hidden','false'); }
    }
  })();

  // Drag-to-scroll for horizontal video strip
  (function videoStripDrag(){
    const strip = document.getElementById('videoStrip');
    if(!strip) return;
    let isDown=false; let startX; let scrollLeft;
    strip.addEventListener('mousedown', (e)=>{
      isDown=true; strip.classList.add('dragging'); startX = e.pageX - strip.offsetLeft; scrollLeft = strip.scrollLeft; e.preventDefault();
    });
    strip.addEventListener('mouseleave', ()=>{ isDown=false; strip.classList.remove('dragging'); });
    strip.addEventListener('mouseup', ()=>{ isDown=false; strip.classList.remove('dragging'); });
    strip.addEventListener('mousemove', (e)=>{
      if(!isDown) return; e.preventDefault(); const x = e.pageX - strip.offsetLeft; const walk = (x - startX) * 1; strip.scrollLeft = scrollLeft - walk;
    });
    // touch
    strip.addEventListener('touchstart',(e)=>{ startX = e.touches[0].pageX - strip.offsetLeft; scrollLeft = strip.scrollLeft; });
    strip.addEventListener('touchmove',(e)=>{ const x = e.touches[0].pageX - strip.offsetLeft; const walk = (x - startX) * 1; strip.scrollLeft = scrollLeft - walk; });
  })();

  // --- Consent-aware third-party handling ---
  // Populate deferred iframes (those with data-src) only when consent is given.
  function loadDeferredIframes(){
    const iframes = document.querySelectorAll('iframe[data-src]');
    iframes.forEach(iframe => {
      if(iframe.getAttribute('src') === 'about:blank' && iframe.dataset.src){
        iframe.setAttribute('src', iframe.dataset.src);
      }
    });
  }

  // Unload third-party SDKs/iframes on decline. Best-effort: remove FB script and blank iframes.
  function unloadThirdParties(){
    // blank out deferred and loaded iframes
    document.querySelectorAll('iframe').forEach(iframe => {
      // only touch facebook plugin iframes (heuristic)
      const src = iframe.getAttribute('src') || '';
      if(src.includes('facebook.com') || iframe.dataset.src && iframe.dataset.src.includes('facebook.com')){
        try{ iframe.setAttribute('src', 'about:blank'); iframe.removeAttribute('data-src'); }catch(e){}
      }
    });
    // remove Facebook SDK script tag if present
    const fb = document.getElementById('facebook-jssdk');
    if(fb && fb.parentNode) fb.parentNode.removeChild(fb);
    // attempt to remove global FB object
    try{ if(window.FB) delete window.FB; }catch(e){}
    try{ if(window.fbAsyncInit) delete window.fbAsyncInit; }catch(e){}
  }

  // Expose helpers so cookie-consent script can call them
  window.loadDeferredThirdParty = loadDeferredIframes;
  window.unloadThirdParty = unloadThirdParties;


  // Video lightbox behavior: open a larger FB embed iframe when a video card is clicked
  (function videoLightbox(){
    const lightbox = document.getElementById('videoLightbox');
    const container = document.getElementById('videoContainer');
    const closeBtn = lightbox?.querySelector('.modal-close');
    const cards = document.querySelectorAll('.video-card');
    if(!lightbox || !container) return;

    function open(url){
      lightbox.setAttribute('aria-hidden','false');
      // Check consent before inserting a third-party iframe
      const consent = (function(){ try{ return localStorage.getItem('cookie_consent_v1'); }catch(e){ return null } })();
      if(consent !== 'yes'){
        // show a notice and provide a way to open cookie preferences
        container.innerHTML = `<div style="padding:1rem;max-width:680px;margin:auto;text-align:center"><p>Para ver este video necesitamos tu permiso para cargar contenido de terceros (Facebook).</p><div style="margin-top:0.5rem"><button id="openPrefs" class="btn">Configurar cookies</button></div></div>`;
        const btn = document.getElementById('openPrefs');
        if(btn) btn.addEventListener('click', ()=>{ if(window.showCookiePreferences) window.showCookiePreferences(); });
        return;
      }
      // build FB plugin iframe URL (show_text=0 to hide caption)
      const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=800`;
      // show spinner while loading
      container.innerHTML = `<div class="video-loading"><div class="spinner" aria-hidden="true"></div></div>`;
      // create iframe and attach load handler
      const iframe = document.createElement('iframe');
      iframe.src = src; iframe.width = "800"; iframe.height = "450"; iframe.style.border = 'none'; iframe.style.overflow='hidden'; iframe.scrolling='no'; iframe.frameBorder='0'; iframe.setAttribute('allow','autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'); iframe.allowFullscreen = true;
      iframe.addEventListener('load', ()=>{
        // remove spinner and append iframe
        container.innerHTML = '';
        container.appendChild(iframe);
        // if FB SDK present, parse for richer widgets
        if(window.FB && typeof FB.XFBML !== 'undefined'){
          try{ FB.XFBML.parse(container); }catch(e){ /* ignore */ }
        }
      });
      iframe.addEventListener('error', ()=>{
        container.innerHTML = '<p style="padding:1rem;color:crimson">Error al cargar el video. Intenta abrir en Facebook.</p>';
      });
    }
    function close(){ lightbox.setAttribute('aria-hidden','true'); container.innerHTML=''; }

    cards.forEach(card=>{
      card.addEventListener('click', ()=>{
        const url = card.dataset.videoPage;
        if(url) open(url);
      });
      card.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ const url=card.dataset.videoPage; if(url) open(url); } });
    });

    closeBtn?.addEventListener('click', close);
    lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) close(); });
  })();

  // Video strip controls: arrows and progress
  (function videoStripControls(){
    const strip = document.getElementById('videoStrip');
    const left = document.querySelector('.vs-left');
    const right = document.querySelector('.vs-right');
    const prog = document.getElementById('videoStripProgress');
    if(!strip) return;

    function updateProgress(){
      const max = strip.scrollWidth - strip.clientWidth;
      const pct = max > 0 ? (strip.scrollLeft / max) * 100 : 0;
      if(prog) prog.style.width = pct + '%';
      // arrow visibility
      if(left && right){
        if(strip.scrollLeft <= 8){ left.classList.add('hidden'); left.classList.remove('visible'); } else { left.classList.remove('hidden'); left.classList.add('visible'); }
        if(strip.scrollLeft >= max - 8){ right.classList.add('hidden'); right.classList.remove('visible'); } else { right.classList.remove('hidden'); right.classList.add('visible'); }
      }
    }

    left?.addEventListener('click', ()=>{ strip.scrollBy({left: -strip.clientWidth * 0.7, behavior:'smooth'}); left.classList.add('animate'); setTimeout(()=>left.classList.remove('animate'),300); });
    right?.addEventListener('click', ()=>{ strip.scrollBy({left: strip.clientWidth * 0.7, behavior:'smooth'}); right.classList.add('animate'); setTimeout(()=>right.classList.remove('animate'),300); });
    strip.addEventListener('scroll', ()=> updateProgress());
    // init
    updateProgress();
  })();

});

// Legal banner behavior (privacy/terms in-page)
(function(){
  function getLegalText(key){
    if(key==='privacy'){
      return `<h3>Política de privacidad</h3><p>Usamos datos para mejorar la experiencia. Puedes leer la política completa en el documento de privacidad del sitio. Este banner es una vista rápida; para más detalles, ponte en contacto con nosotros.</p>`;
    }
    if(key==='terms'){
      return `<h3>Términos</h3><p>Al usar este sitio aceptas nuestras condiciones. Este resumen no sustituye los términos completos; contacta al administrador para obtener la versión completa.</p>`;
    }
    return '';
  }

  const links = document.querySelectorAll('.legal-link');
  const banner = document.getElementById('legalBanner');
  const content = document.getElementById('legalContent');
  const closeBtn = document.getElementById('legalClose');
  if(!links.length || !banner || !content || !closeBtn) return;

  links.forEach(l => l.addEventListener('click', (e)=>{
    e.preventDefault();
    const key = l.dataset.legal;
    content.innerHTML = getLegalText(key);
    banner.setAttribute('aria-hidden','false');
  }));

  closeBtn.addEventListener('click', ()=>{ banner.setAttribute('aria-hidden','true'); content.innerHTML=''; });
  // allow clicking outside to close
  banner.addEventListener('click', (e)=>{ if(e.target===banner) { banner.setAttribute('aria-hidden','true'); content.innerHTML=''; } });
})();