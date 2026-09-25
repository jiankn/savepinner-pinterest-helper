export function buildSrcset(entries){
 const clean=entries.map(x=>({url:String(x.url??'').trim(),width:Number(x.width)})).filter(x=>x.url);
 if(!clean.length)throw new Error('Add at least one image URL.');
 if(clean.some(x=>!Number.isInteger(x.width)||x.width<1))throw new Error('Each candidate needs a positive integer pixel width.');
 const seen=new Set();for(const x of clean){if(seen.has(x.width))throw new Error(`Duplicate width descriptor: ${x.width}w.`);seen.add(x.width);}
 for(const x of clean){let u;try{u=new URL(x.url,globalThis.location?.href??'https://example.invalid/');}catch{throw new Error(`Invalid URL: ${x.url}`)}if(!['http:','https:'].includes(u.protocol))throw new Error('Only HTTP and HTTPS image URLs are supported.');}
 clean.sort((a,b)=>a.width-b.width);
 return clean.map(x=>`${x.url.replace(/[\\\s,]/g,encodeURIComponent)} ${x.width}w`).join(', ');
}
