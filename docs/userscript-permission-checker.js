(function(root){
  function values(source,name){const pattern=new RegExp('^\\s*//\\s*@'+name+'\\s+(.+?)\\s*$','gmi');return [...String(source).matchAll(pattern)].map(match=>match[1])}
  function auditMetadata(source){
    const grants=values(source,'grant'),matches=values(source,'match'),connect=values(source,'connect'),requires=values(source,'require');
    const warnings=[];
    if(!/==UserScript==/.test(source)||!/==\/UserScript==/.test(source))warnings.push('Metadata block markers are missing.');
    if(matches.some(value=>value==='*://*/*'||value==='<all_urls>'))warnings.push('Host scope covers all sites.');
    if(connect.includes('*'))warnings.push('Network permission allows every host.');
    if(requires.length)warnings.push('Remote code dependencies require manual source review.');
    if(grants.includes('GM_xmlhttpRequest')&&!connect.length)warnings.push('Cross-origin requests are granted without an explicit @connect list.');
    return {grants,matches,connect,requires,warnings};
  }
  root.userscriptPermissionChecker={values,auditMetadata};
  if(typeof document!=='undefined')document.getElementById('audit').addEventListener('click',()=>{const report=auditMetadata(document.getElementById('source').value);const lines=[`Grants: ${report.grants.join(', ')||'none'}`,`Matches: ${report.matches.join(', ')||'none'}`,`Network hosts: ${report.connect.join(', ')||'none'}`,`Remote dependencies: ${report.requires.join(', ')||'none'}`,report.warnings.length?'Warnings:\n- '+report.warnings.join('\n- '):'No broad-scope warnings detected.'];document.getElementById('result').textContent=lines.join('\n')});
})(typeof globalThis==='undefined'?this:globalThis);
