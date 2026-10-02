export function inspectResponse(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Paste a JSON object');
  if (value.jsonrpc === '2.0' && value.error) return {status:'protocol-error',message:String(value.error.message || 'JSON-RPC error'),downloadReady:false};
  const result = value.jsonrpc === '2.0' ? value.result : value;
  if (!result || typeof result !== 'object') throw new Error('No tool result found');
  if (result.isError === true) return {status:'tool-error',message:(result.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\n'),downloadReady:false};
  const data = result.structuredContent;
  if (!data || typeof data !== 'object') return {status:'unstructured',message:'No structuredContent. Inspect the server schema before interpreting text.',downloadReady:false};
  if (typeof data.isPinterestUrl === 'boolean') return {status:data.isPinterestUrl?'supported-url':'unsupported-url',message:'This boolean validates URL syntax, not media availability.',downloadReady:false};
  if (data.normalizedUrl) {
    let parsed;
    try { parsed = new URL(data.normalizedUrl); } catch { throw new Error('normalizedUrl is not an absolute URL'); }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Unexpected normalized URL scheme or credentials');
    const allowedKinds=['pin','short','profile','board','ideas'];
    if(data.kind && !allowedKinds.includes(data.kind)) throw new Error('Unknown URL kind');
    return {status:data.kind || 'normalized-url',normalizedUrl:data.normalizedUrl,message:data.kind==='pin'?'Pin syntax recognized. Public availability, media type and permission still require separate checks.':data.kind==='short'?'Short link recognized but not resolved.':data.kind?'This is not an individual Pin; do not route it straight to an image workflow.':'Normalization alone does not establish Pin kind.',downloadReady:false};
  }
  return {status:'unknown-shape',message:'No supported fields found; compare with the advertised tool schema.',downloadReady:false};
}
