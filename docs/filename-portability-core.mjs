const RESERVED=/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i;
export function inspectFilename(value){
 const name=String(value??'');const issues=[];
 if(!name)issues.push('Filename is empty.');
 if(/[\\/]/.test(name))issues.push('Contains a path separator.');
 if(/[\u0000-\u001f\u007f]/.test(name))issues.push('Contains a control character.');
 if(/[<>:"|?*]/.test(name))issues.push('Contains a character forbidden by common Windows filesystems.');
 if(/[. ]$/.test(name))issues.push('Ends with a dot or space.');
 if(RESERVED.test(name))issues.push('Uses a reserved Windows device name.');
 const bytes=new TextEncoder().encode(name).length;if(bytes>240)issues.push('UTF-8 filename exceeds the conservative 240-byte budget.');
 const normalized=name.normalize('NFC');if(normalized!==name)issues.push('Is not Unicode NFC normalized.');
 const suggested=normalized.replace(/[\\/<>:"|?*\u0000-\u001f\u007f]/g,'-').replace(/[. ]+$/g,'').replace(/^-+|-+$/g,'')||'image';
 return {input:name,utf8_bytes:bytes,portable:issues.length===0,issues,suggested_filename:RESERVED.test(suggested)?`image-${suggested}`:suggested};
}
