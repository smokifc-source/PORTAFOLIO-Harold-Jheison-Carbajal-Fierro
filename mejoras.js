(() => {
  'use strict';
  const $ = (selector,root=document) => root.querySelector(selector);
  const $$ = (selector,root=document) => [...root.querySelectorAll(selector)];
  const nav = $('#mainNav'), menu = $('#menuToggle');
  const toggleMenu = (open) => { menu.setAttribute('aria-expanded',String(open)); nav.classList.toggle('is-open',open); };
  menu.addEventListener('click',() => toggleMenu(menu.getAttribute('aria-expanded') !== 'true'));
  $$('#mainNav a').forEach(link => link.addEventListener('click',() => toggleMenu(false)));
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const cards = $$('.course-card'), search = $('#taskSearch'), filter = $('#courseFilter');
  const expand = $('#expandUnits');
  let savedExpansion = null;
  const setUnit = (block,open) => {
    const button = $('.unit-toggle',block), weeks = $('.weeks',block);
    if(!button || !weeks) return;
    block.classList.toggle('is-open',open);button.setAttribute('aria-expanded',String(open));weeks.hidden=!open;
    $('.toggle-icon',button).textContent=open?'−':'+';
    if(open&&!block.hidden&&!block.closest('.course-card').hidden) $$('.week-item:not([hidden])',block).forEach(item=>item.dispatchEvent(new Event('portfolio:refresh')));
  };
  const updateExpandLabel = () => {
    const visible=$$('.unit-block').filter(b=>!b.hidden&&!b.closest('.course-card').hidden);
    const allOpen=visible.length>0&&visible.every(b=>b.classList.contains('is-open'));
    expand.innerHTML=allOpen?'Contraer unidades <span aria-hidden="true">−</span>':'Expandir unidades <span aria-hidden="true">+</span>';
  };
  const applyFilter = () => {
    const query=normalize(search.value), searching=query.length>0;
    if(searching && !savedExpansion) savedExpansion=$$('.unit-block').map(b=>b.classList.contains('is-open'));
    let matches=0;
    cards.forEach((card,index)=>{
      const courseAllowed=filter.value==='all'||filter.value===String(index);let courseMatches=0;
      $$('.unit-block',card).forEach(block=>{
        const unitText=normalize($('.unit-toggle',block)?.textContent||'');let unitMatches=0;
        $$('.week-item',block).forEach(item=>{
          const weekText=normalize(`${$('label',item)?.textContent||''} ${$('span',item)?.textContent||''}`);
          const match=courseAllowed&&(!query||weekText.includes(query)||unitText.includes(query));
          item.hidden=!match;if(match){matches++;courseMatches++;unitMatches++;}
        });
        block.hidden=!unitMatches;if(searching&&unitMatches)setUnit(block,true);
      });
      card.hidden=!courseMatches;
    });
    if(!searching&&savedExpansion){$$('.unit-block').forEach((b,i)=>setUnit(b,savedExpansion[i]));savedExpansion=null;}
    $('#searchResults').textContent=query?`${matches} ${matches===1?'semana encontrada':'semanas encontradas'}`:`${matches} semanas para explorar`;
    $('#noResults').hidden=matches!==0;updateExpandLabel();
  };
  search.addEventListener('input',applyFilter);filter.addEventListener('change',applyFilter);
  expand.addEventListener('click',()=>{
    const visible=$$('.unit-block').filter(b=>!b.hidden&&!b.closest('.course-card').hidden);
    const open=!visible.every(b=>b.classList.contains('is-open'));visible.forEach(b=>setUnit(b,open));updateExpandLabel();
  });
  $$('.unit-toggle').forEach(button=>button.addEventListener('click',updateExpandLabel));
  $$('.week-item input[type="file"]').forEach((input,index)=>{input.id=`task-file-${index}`;input.setAttribute('aria-label',`Seleccionar archivo: ${$('label',input.closest('.week-item')).textContent}, ${$('h3',input.closest('.course-card')).textContent}`);});
  $$('.link-input').forEach((input,index)=>{input.setAttribute('aria-label',`Enlace de la tarea: ${$('label',input.closest('.week-item')).textContent}, ${$('h3',input.closest('.course-card')).textContent}`);input.inputMode='url';});
  const photo=$('.about-photo img');
  const fallback=()=>{const parent=photo.parentElement;photo.remove();const text=document.createElement('div');text.className='photo-fallback';text.textContent='JC';text.setAttribute('aria-label','Harold Jheison Carbajal Fierro');parent.append(text);};
  photo?.addEventListener('error',fallback,{once:true});if(photo?.complete&&photo.naturalWidth===0)fallback();
  const modal=$('#authModal');let lastFocus=null;
  const observer=new MutationObserver(()=>{
    if(!modal.classList.contains('hidden')){lastFocus=document.activeElement;$('#loginUserInput').focus();document.body.style.overflow='hidden';}
    else{document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus();}
  });observer.observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      if(!modal.classList.contains('hidden'))$('#cancelLoginBtn').click();
      if(menu.getAttribute('aria-expanded')==='true'){toggleMenu(false);menu.focus();}
    }
    if(event.key==='Tab'&&!modal.classList.contains('hidden')){
      const fields=$$('input,button',modal).filter(el=>!el.disabled),first=fields[0],last=fields.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  modal.addEventListener('click',event=>{if(event.target===modal)$('#cancelLoginBtn').click();});
  if('IntersectionObserver' in window){
    const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){$$('#mainNav a').forEach(link=>{const active=link.getAttribute('href')===`#${entry.target.id}`;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}},{rootMargin:'-20% 0px -55% 0px'});
    $$('main section[id]').forEach(section=>sectionObserver.observe(section));
  }
  applyFilter();
})();
