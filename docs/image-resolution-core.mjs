export function calculate({width,height,targetWidth,targetHeight,printWidth,printHeight}) {
 const w=Number(width),h=Number(height),tw=Number(targetWidth),th=Number(targetHeight),pw=Number(printWidth),ph=Number(printHeight);
 if (![w,h].every(Number.isFinite) || w<=0 || h<=0) throw new Error('Source width and height must be positive numbers.');
 const result={source:{width:w,height:h,megapixels:+((w*h)/1e6).toFixed(2)},aspect:+(w/h).toFixed(6)};
 if ([tw,th].every(Number.isFinite) && tw>0 && th>0) result.screen={scale:+Math.min(w/tw,h/th).toFixed(3),fits_without_upscale:w>=tw&&h>=th,source_aspect_matches:Math.abs(w/h-tw/th)<0.001};
 if ([pw,ph].every(Number.isFinite) && pw>0 && ph>0) result.print={dpi_x:+(w/pw).toFixed(1),dpi_y:+(h/ph).toFixed(1),limiting_dpi:+Math.min(w/pw,h/ph).toFixed(1),source_aspect_matches:Math.abs(w/h-pw/ph)<0.001};
 return result;
}
