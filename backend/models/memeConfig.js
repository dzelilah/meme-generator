// Simple MemeConfig model/validator
const allowedFields = [
  'topText','bottomText','fontSize','strokeColor','fillColor','textColor',
  'watermark','fontFamily','fontWeight','textAlign','allCaps','scaleDown',
  'strokeWidth','padding','watermarkPosition','watermarkImage'
];

function validate(cfg){
  if(!cfg || typeof cfg !== 'object') return { valid:false, error:'Config must be an object' };
  
  // basic type checks
  if(cfg.topText && typeof cfg.topText !== 'string') return { valid:false, error:'topText must be string' };
  if(cfg.bottomText && typeof cfg.bottomText !== 'string') return { valid:false, error:'bottomText must be string' };
  if(cfg.fontSize && typeof cfg.fontSize !== 'number') return { valid:false, error:'fontSize must be number' };
  if(cfg.strokeWidth && typeof cfg.strokeWidth !== 'number') return { valid:false, error:'strokeWidth must be number' };
  if(cfg.padding && typeof cfg.padding !== 'number') return { valid:false, error:'padding must be number' };
  if(cfg.watermarkPosition && typeof cfg.watermarkPosition !== 'string') return { valid:false, error:'watermarkPosition must be string' };
  
  // new validations
  if(cfg.textAlign && !['left','center','right'].includes(cfg.textAlign)) return { valid:false, error:'textAlign must be left, center, or right' };
  if(cfg.allCaps !== undefined && typeof cfg.allCaps !== 'boolean') return { valid:false, error:'allCaps must be boolean' };
  if(cfg.scaleDown !== undefined && (typeof cfg.scaleDown !== 'number' || cfg.scaleDown < 0 || cfg.scaleDown > 0.25)) return { valid:false, error:'scaleDown must be number between 0 and 0.25' };
  if(cfg.watermarkImage && typeof cfg.watermarkImage !== 'string') return { valid:false, error:'watermarkImage must be base64 string' };
  if(cfg.textColor && typeof cfg.textColor !== 'string') return { valid:false, error:'textColor must be string' };

  // reject unexpected fields
  const unknown = Object.keys(cfg).filter(k=>!allowedFields.includes(k));
  if(unknown.length) return { valid:false, error:`Unknown fields: ${unknown.join(',')}` };
  return { valid:true };
}

module.exports = { validate };
