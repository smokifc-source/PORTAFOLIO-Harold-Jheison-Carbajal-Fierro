(function(root){
  'use strict';
  function create(client){
    const bucket=client.storage.from('tareas');
    const linkFile='enlace.json';
    const utils=root.PortfolioUtils;
    const objectPath=(folder,name)=>{if(!name||/[\\/]/.test(name)||name==='.'||name==='..')throw new Error('El nombre del archivo no es válido.');return `${folder}/${name}`};
    async function read(folder){
      const files=[];let offset=0;let finished=false;
      for(let page=0;page<100;page++){
        const {data,error}=await bucket.list(folder,{limit:100,offset,sortBy:{column:'name',order:'asc'}});
        if(error)throw error;
        files.push(...(data||[]).filter(file=>file.id&&file.name&&!/[\\/]/.test(file.name)));
        if(!data||data.length<100){finished=true;break}offset+=data.length;
      }
      if(!finished)throw new Error('Hay demasiados materiales para cargar de una vez.');
      const hasLink=files.some(file=>file.name===linkFile);
      let link=null,linkError=null;
      if(hasLink){
        try{
          const {data,error}=await bucket.download(objectPath(folder,linkFile));if(error)throw error;
          const record=JSON.parse(await data.text());link=utils.safeUrl(record.url);
          if(!link)linkError='El enlace guardado no tiene una dirección web válida.';
        }catch{linkError='No se pudo cargar el enlace guardado. Usa Actualizar para reintentarlo.'}
      }
      return {files:files.filter(file=>file.name!==linkFile),link,linkError,hasLink};
    }
    function publicUrl(folder,name){const {data}=bucket.getPublicUrl(objectPath(folder,name));return data.publicUrl}
    async function upload(folder,file){const errorMessage=utils.validateFile(file);if(errorMessage)throw new Error(errorMessage);const name=utils.fileName(file.name);const {error}=await bucket.upload(objectPath(folder,name),file,{upsert:false});if(error)throw error;return name}
    async function saveLink(folder,value){const url=utils.safeUrl(value);if(!url)throw new Error('Escribe una dirección web válida, por ejemplo https://github.com/usuario/proyecto.');const file=new Blob([JSON.stringify({url})],{type:'application/json'});const {error}=await bucket.upload(objectPath(folder,linkFile),file,{upsert:true,contentType:'application/json',cacheControl:'0'});if(error)throw error;return url}
    async function remove(folder,name){const {error}=await bucket.remove([objectPath(folder,name)]);if(error)throw error}
    return {read,publicUrl,upload,saveLink,remove};
  }
  const api={create};root.PortfolioStorage=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
