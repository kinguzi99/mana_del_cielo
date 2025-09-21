// Simple cookie consent: shows banner and stores acceptance in localStorage
(function(){
  const key = 'cookie_consent_v1';
  if(typeof window === 'undefined') return;
  function getChoice(){ return localStorage.getItem(key); }
  function setChoice(val){
    localStorage.setItem(key,val);
    document.getElementById('cookieBanner')?.remove();
    try{ if(window.onCookieConsent) window.onCookieConsent(val); }catch(e){}
    // If the user declines, attempt to notify page to remove any already-loaded trackers
    if(val === 'declined' && window.onCookieDecline){
      try{ window.onCookieDecline(); }catch(e){}
    }
  }

  // Create and show the cookie banner. Safe to call multiple times; it will not duplicate.
  function showBanner(){
    if(document.getElementById('cookieBanner')) return;
    const banner = document.createElement('div'); banner.id='cookieBanner'; banner.className='cookie-banner';
    banner.setAttribute('role','dialog'); banner.setAttribute('aria-live','polite');
    banner.innerHTML = `
      <button id="cbClose" class="cookie-close" aria-label="Cerrar y rechazar">×</button>
      <div class="container cb-row">
        <div class="cb-text">Usamos cookies para mejorar la experiencia. Puedes aceptar cookies de marketing o cerrar esta notificación para rechazarlas. <a href="/privacy.html">Política de privacidad</a>.</div>
        <div class="cb-actions">
          <button id="cbAccept" class="btn primary" aria-label="Aceptar cookies">Aceptar</button>
        </div>
      </div>`;
    document.body.appendChild(banner);
  document.getElementById('cbAccept')?.addEventListener('click', ()=> setChoice('yes'));
  document.getElementById('cbClose')?.addEventListener('click', ()=> setChoice('declined'));
  }

  // Expose a global function to re-open the banner on demand
  // This version clears any previous stored choice so the banner is shown for updating preferences.
  window.showCookiePreferences = function(){ try{ localStorage.removeItem(key); }catch(e){}; showBanner(); };

  // Expose helper to explicitly clear consent and remove cookies (best-effort)
  window.revokeCookieConsent = function(){
    try{ localStorage.removeItem(key); }catch(e){}
    try{ if(window.onCookieDecline) window.onCookieDecline(); }catch(e){}
    // Attempt targeted removal of known third-party tracker cookies and storage keys (best-effort)
    try{
      // common Facebook cookies and Google analytics cookies
      const known = ['_fbp','_fbc','fr','datr','sb','wd','_ga','_gid','_gcl_au','AMP_TOKEN','__stripe_mid','__stripe_sid'];
      known.forEach(name => {
        try{
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
        }catch(e){}
      });
      // also clear likely localStorage/sessionStorage keys left by trackers
      Object.keys(localStorage || {}).forEach(k=>{
        if(/(^|_|\.)(fb|ga|g|gtag|google|ads|stripe|_fbp|_fbc)/i.test(k)){
          try{ localStorage.removeItem(k); }catch(e){}
        }
      });
      Object.keys(sessionStorage || {}).forEach(k=>{
        if(/(^|_|\.)(fb|ga|g|gtag|google|ads|stripe|_fbp|_fbc)/i.test(k)){
          try{ sessionStorage.removeItem(k); }catch(e){}
        }
      });
    }catch(e){}
    // Finally, call any developer-provided unload helper to blank iframes and remove SDKs
    try{ if(window.unloadThirdParty) window.unloadThirdParty(); }catch(e){}
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    // show banner only if no prior choice
    if(getChoice() === 'yes' || getChoice() === 'declined'){
      // notify page of existing choice
      try{ const c = getChoice(); if(c && window.onCookieConsent) window.onCookieConsent(c); }catch(e){}
      return;
    }
    showBanner();
  });
})();
