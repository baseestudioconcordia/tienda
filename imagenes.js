/* BASE ESTUDIO · imágenes en carpeta img/
   Reemplaza el botón "Descargar" del editor: ahora genera publicar.zip con
   productos.json (liviano) + las fotos como archivos dentro de img/ */
(function(){
const T=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zip(files){
  const enc=new TextEncoder(),ch=[],cd=[];let off=0;
  files.forEach(f=>{
    const n=enc.encode(f.n),c=crc(f.d),L=f.d.length,h=new DataView(new ArrayBuffer(30));
    h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);
    h.setUint32(14,c,true);h.setUint32(18,L,true);h.setUint32(22,L,true);h.setUint16(26,n.length,true);
    ch.push(h.buffer,n,f.d);
    const e=new DataView(new ArrayBuffer(46));
    e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x0800,true);e.setUint16(14,0x21,true);
    e.setUint32(16,c,true);e.setUint32(20,L,true);e.setUint32(24,L,true);e.setUint16(28,n.length,true);e.setUint32(42,off,true);
    cd.push(e.buffer,n);off+=30+n.length+L;
  });
  const cs=cd.reduce((s,b)=>s+b.byteLength,0),z=new DataView(new ArrayBuffer(22));
  z.setUint32(0,0x06054b50,true);z.setUint16(8,files.length,true);z.setUint16(10,files.length,true);z.setUint32(12,cs,true);z.setUint32(16,off,true);
  return new Blob([...ch,...cd,z.buffer],{type:"application/zip"});
}
const slug=t=>String(t).toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")||"foto";
function pack(){
  const D=JSON.parse(JSON.stringify(DATA)),files=[],seen={};
  const take=(s,base)=>{
    if(typeof s!=="string"||s.indexOf("data:image/")!==0)return s;
    const m=s.match(/^data:image\/(\w+);base64,([\s\S]*)$/);if(!m)return s;
    const name="img/"+base+"-"+hash(s).replace(/[^\w]/g,"")+"."+(m[1]==="png"?"png":"jpg");
    if(!seen[name]){seen[name]=1;files.push({n:name,d:Uint8Array.from(atob(m[2]),c=>c.charCodeAt(0))})}
    return name;
  };
  D.productos.forEach(p=>{p.imgs=(p.imgs||[]).map(x=>take(x,slug(p.nombre)))});
  D.config.banner=take(D.config.banner,"banner");
  D.config.logo=take(D.config.logo,"logo");
  (D.colecciones||[]).forEach(c=>{if(c.cover)c.cover=take(c.cover,"portada-"+slug(c.nombre))});
  return{D,files};
}
window.dl=function(){
  const{D,files}=pack(),all=[{n:"productos.json",d:new TextEncoder().encode(JSON.stringify(D))},...files];
  const a=document.createElement("a");a.href=URL.createObjectURL(zip(all));a.download="publicar.zip";a.click();
  alert("Se descargó publicar.zip\n\nFotos nuevas: "+files.length+"\nProductos: "+D.productos.length+
  "\n\n1) Descomprimilo en tu computadora.\n2) En GitHub: Add file > Upload files.\n3) Arrastrá productos.json y la carpeta img (si hay).\n4) Commit changes y esperá unos minutos.");
};
})();
