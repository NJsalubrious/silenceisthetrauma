(() => {
 const mode=1;
 const overlay=document.getElementById('scannerOverlay'),frame=document.getElementById('scannerFrame');overlay.className='scanner-room room-'+mode;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','veX audio scanner');frame.title='veX scanner — explore character voices';
 overlay.querySelector('button').remove();const chrome=document.createElement('div');chrome.className='scanner-chrome';chrome.innerHTML=`<button type="button" id="scanner-return"><span aria-hidden="true">←</span> ${mode===2?'Read the posts':'Back to veX'}<kbd>Esc</kbd></button><div class="room-context">${mode===2?'Listening beneath the posts':'<strong>veX / Scanner</strong>Your place in the feed is kept.'}</div>`;overlay.prepend(chrome);
 const back=chrome.querySelector('button');let opener=null,overflow='',inert=[],readyTimer=null;const bound=new WeakSet();
 const show=()=>{
  if(scannerOpen)return;
  opener=document.activeElement;overflow=document.body.style.overflow;
  inert=[...document.body.children].filter(el=>el!==overlay&&!['SCRIPT','STYLE','LINK'].includes(el.tagName)).map(el=>[el,el.inert]);inert.forEach(([el])=>el.inert=true);
  scannerOpen=true;document.body.style.overflow='hidden';overlay.style.display='grid';frame.contentWindow.location.replace(new URL('vex_audio_scanner.html',location.href).href);back.focus();readyTimer=setInterval(bindFrame,80);
 };
 const hide=()=>{
  if(!scannerOpen)return;clearInterval(readyTimer);overlay.style.display='none';frame.contentWindow.location.replace('about:blank');scannerOpen=false;document.body.style.overflow=overflow;inert.forEach(([el,was])=>el.inert=was);inert=[];if(opener?.isConnected)opener.focus({preventScroll:true});
  document.querySelectorAll('.vex-logo-img').forEach(img=>img.src=img.dataset.restLogo||'logo/logo_veX_sm.jpg');
 };
 window.openScanner=()=>{if(scannerOpen)return;history.pushState({...history.state,vexScanner:true},'',location.pathname+location.search+'#scanner');show()};
 window.closeScanner=()=>{if(!scannerOpen)return;if(history.state?.vexScanner)history.back();else hide()};
 back.onclick=window.closeScanner;
 window.addEventListener('popstate',()=>{if(history.state?.vexScanner)show();else hide()});
 function bindFrame(){
  if(!scannerOpen)return;
  const doc=frame.contentDocument;if(!doc)return;
  if(!bound.has(doc)){bound.add(doc);doc.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();window.closeScanner()}if(e.key==='Tab'){const targets=[...doc.querySelectorAll('button,[href],[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.disabled);if((e.shiftKey&&doc.activeElement===targets[0])||(!e.shiftKey&&doc.activeElement===targets.at(-1))){e.preventDefault();back.focus()}}})}
  if(!doc.getElementById('start-overlay')||doc.getElementById('door-hint-style'))return;clearInterval(readyTimer);
  const hintStyle=doc.createElement('style');hintStyle.id='door-hint-style';hintStyle.textContent='#start-overlay::after{content:none!important}#start-overlay:focus-visible{outline:2px solid #c5a059;outline-offset:-6px}';doc.head.append(hintStyle);
  const start=doc.getElementById('start-overlay');if(start){start.setAttribute('role','button');start.tabIndex=0;start.setAttribute('aria-label','Start listening to the scanner');start.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();start.click()}})}
 }
 frame.addEventListener('load',bindFrame);
 back.addEventListener('keydown',e=>{if(e.key==='Tab'&&e.shiftKey){e.preventDefault();frame.contentWindow?.focus()}});
 document.querySelectorAll('[onclick="openScanner()"]').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label','Open the veX audio scanner');el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.openScanner()}}});
 if(history.state?.vexScanner)show();
})();
