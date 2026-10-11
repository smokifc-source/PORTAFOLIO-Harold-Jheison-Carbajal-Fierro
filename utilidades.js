(function(root){
  'use strict';
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const sanitize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9\-]/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'').toLowerCase();
  const folder = (course,unit,week) => `${sanitize(course)}/${sanitize(unit)}/${sanitize(`Semana ${week}`)}`;
  function safeUrl(value){let text=String(value||'').trim();if(!text||/[\s\\]/.test(text))return null;if(/^[a-z][a-z0-9+.-]*:/i.test(text)&&!/^https?:\/\//i.test(text))return null;if(!/^https?:\/\//i.test(text))text='https://'+text;try{const u=new URL(text);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&u.hostname.includes('.')?u.href:null}catch{return null}}
  const weekKey = (courseId,week) => `${courseId}:${week}`;
  function findWeeks(course,unitIndex,query,favoritesOnly,personal){const q=normalize(query);return course.units.flatMap((unit,index)=>unit.weeks.filter(week=>{if(!q&&!favoritesOnly&&index!==unitIndex)return false;if(favoritesOnly&&!personal.favorites[weekKey(course.id,week.number)])return false;return !q||normalize(`${unit.label} ${unit.name} Semana ${week.number} ${week.topic}`).includes(q)}).map(week=>({...week,unit,index})));}
  function cleanPersonal(value,courses){const clean={favorites:{},reviewed:{},last:null};if(!value||typeof value!=='object')return clean;const valid=new Set(courses.flatMap(c=>c.units.flatMap(u=>u.weeks.map(w=>weekKey(c.id,w.number)))));for(const field of ['favorites','reviewed']){for(const key of Object.keys(value[field]||{})){if(valid.has(key)&&value[field][key]===true)clean[field][key]=true}}if(value.last&&valid.has(weekKey(value.last.course,value.last.week)))clean.last={course:value.last.course,week:value.last.week};return clean}
  function validateFile(file){if(!file)return 'Selecciona un archivo primero.';if(!/\.(pdf|doc|docx|jpg|jpeg|png|zip|rar)$/i.test(file.name))return 'Usa un archivo PDF, Word, JPG, PNG, ZIP o RAR.';if(file.size>50*1024*1024)return 'El archivo debe pesar como máximo 50 MB.';if(file.size===0)return 'El archivo está vacío.';return null}
  function fileName(name){const dot=name.lastIndexOf('.');return (sanitize(dot>=0?name.slice(0,dot):name)||'archivo')+(dot>=0?name.slice(dot).toLowerCase():'')}
  function formatSize(bytes){if(!Number.isFinite(bytes)||bytes<=0)return '';if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1024/1024).toFixed(1)} MB`}
  const api={normalize,sanitize,folder,safeUrl,weekKey,findWeeks,cleanPersonal,validateFile,fileName,formatSize};root.PortfolioUtils=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
