const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { validate } = require('../models/memeConfig');

// Configure multer to store files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

/**
 * Text wrapping utility: splits text into lines that fit within maxWidth
 * Uses approximate character-based wrapping (SVG doesn't provide exact text measurement)
 * @param {string} text - The text to wrap
 * @param {number} fontSize - Font size in pixels
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {string[]} Array of text lines
 */
function wrapText(text, fontSize, maxWidth) {
  if (!text || !text.trim()) return [];
  
  // Approximate character width as 60% of fontSize for bold sans-serif fonts
  const avgCharWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  
  // If text fits in one line, return as-is
  if (text.length <= maxCharsPerLine) {
    return [text];
  }
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = testLine.length * avgCharWidth;
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      // If current word alone is too long, force break it
      if (word.length * avgCharWidth > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = '';
        }
        // Break long word into chunks
        let remaining = word;
        while (remaining.length > maxCharsPerLine) {
          lines.push(remaining.substring(0, maxCharsPerLine));
          remaining = remaining.substring(maxCharsPerLine);
        }
        currentLine = remaining;
      } else {
        // Start new line with current word
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// POST /api/meme/preview
// Accepts multipart form with 'image' file and 'config' JSON field
router.post('/preview', upload.single('image'), async (req, res) => {
  try {
    console.log('Received preview request');
    console.log('File:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');
    console.log('Body:', req.body);

    // Validate file upload
    if (!req.file) {
      console.log('Error: No image file provided');
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Parse and validate config
    let config;
    try {
      console.log('Config from request:', req.body.config);
      config = JSON.parse(req.body.config);
      console.log('Parsed config:', config);
    } catch (err) {
      console.error('Config parsing error:', err);
      return res.status(400).json({ error: 'Invalid JSON in config field' });
    }

    const validationResult = validate(config);
    if (!validationResult.valid) {
      console.error('Config validation error:', validationResult.error);
      return res.status(400).json({ error: validationResult.error });
    }

    console.log('Processing image...', {
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      config: req.body.config
    });

    // Process image - resize to preview size (max 800px width/height)
    let image = sharp(req.file.buffer);
    const metadata = await image.metadata();
    
    console.log('Original image metadata:', metadata);
    
    // Calculate resize dimensions maintaining aspect ratio
    const MAX_DIMENSION = 800;
    let width = metadata.width;
    let height = metadata.height;
    
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }
    }
    
    console.log('Resizing to:', { width, height });

    // Calculate text wrapping
    const padding = config.padding || 10;
    const fontSize = config.fontSize || 48;
    const maxTextWidth = width - (2 * padding);
    
    // Define allCaps BEFORE using it
    const allCaps = config.allCaps !== undefined ? config.allCaps : true; // default true for meme style
    
    // Apply allCaps transformation BEFORE wrapping
    const topText = config.topText ? (allCaps ? config.topText.toUpperCase() : config.topText) : '';
    const bottomText = config.bottomText ? (allCaps ? config.bottomText.toUpperCase() : config.bottomText) : '';
    
    const topLines = topText ? wrapText(topText, fontSize, maxTextWidth) : [];
    const bottomLines = bottomText ? wrapText(bottomText, fontSize, maxTextWidth) : [];

    // Create an SVG with the text overlays
    // Map font families to system fonts that are guaranteed to exist
    const fontMapping = {
      'Impact': 'Liberation Sans, Arial, sans-serif',
      'Arial': 'Liberation Sans, Arial, sans-serif',
      'Comic Sans MS': 'FreeSans, Arial, sans-serif',
      'Times New Roman': 'DejaVu Serif, serif'
    };
    
    const systemFont = fontMapping[config.fontFamily] || 'Liberation Sans, Arial, sans-serif';
    
    // Support textColor as alias for fillColor (per spec)
    const fillColor = config.textColor || config.fillColor || 'white';
    const strokeColor = config.strokeColor || 'black';
    const textAlign = config.textAlign || 'center';
    
    // Text anchor mapping for textAlign
    const anchorMap = {
      'left': 'start',
      'center': 'middle',
      'right': 'end'
    };
    const textAnchor = anchorMap[textAlign];
    
    // X position based on alignment
    const getXPosition = () => {
      if (textAlign === 'left') return padding;
      if (textAlign === 'right') return width - padding;
      return width / 2; // center
    };
    const xPos = getXPosition();
    
    // Generate tspan elements for wrapped text
    const generateTextBlock = (lines, startY, isTop = true) => {
      if (lines.length === 0) return '';
      
      const lineHeight = fontSize * 1.1; // 110% line height
      const totalHeight = lines.length * lineHeight;
      
      // Calculate starting Y position for block
      const blockY = isTop 
        ? startY 
        : startY - totalHeight + lineHeight;
      
      const tspans = lines.map((line, index) => {
        const y = blockY + (index * lineHeight);
        return `<tspan x="${xPos}" y="${y}" dy="0">${line}</tspan>`;
      }).join('');
      
      return `<text class="meme-text">${tspans}</text>`;
    };
    
    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .meme-text {
            font-family: ${systemFont};
            font-size: ${fontSize}px;
            font-weight: 900;
            text-anchor: ${textAnchor};
            fill: ${fillColor};
            stroke: ${strokeColor};
            stroke-width: ${config.strokeWidth || 2}px;
            text-transform: ${allCaps ? 'uppercase' : 'none'};
            paint-order: stroke fill;
          }
        </style>
        ${generateTextBlock(topLines, padding + fontSize, true)}
        ${generateTextBlock(bottomLines, height - padding, false)}
        ${config.watermarkPosition ? `
          <text
            x="${config.watermarkPosition.includes('right') ? width - 10 : 10}"
            y="${config.watermarkPosition.includes('bottom') ? height - 10 : 20}"
            style="
              font-family: Arial;
              font-size: 12px;
              text-anchor: ${config.watermarkPosition.includes('right') ? 'end' : 'start'};
              fill: rgba(255,255,255,0.7);
            "
          >@meme-generator</text>
        ` : ''}
      </svg>`;

    console.log('Processing image with config:', config);

    // Prepare composite layers
    const compositeImages = [{
      input: Buffer.from(svgText),
      top: 0,
      left: 0
    }];

    // Add watermark image if provided
    if (config.watermarkImage) {
      try {
        // Extract base64 data (remove data:image/png;base64, prefix)
        const base64Data = config.watermarkImage.replace(/^data:image\/\w+;base64,/, '');
        const watermarkBuffer = Buffer.from(base64Data, 'base64');
        
        // Resize watermark to max 100px
        const resizedWatermark = await sharp(watermarkBuffer)
          .resize(100, 100, { fit: 'inside' })
          .toBuffer();
        
        const watermarkMetadata = await sharp(resizedWatermark).metadata();
        const wmWidth = watermarkMetadata.width;
        const wmHeight = watermarkMetadata.height;
        
        // Calculate position based on watermarkPosition
        let wmLeft = 10;
        let wmTop = 10;
        
        if (config.watermarkPosition.includes('right')) {
          wmLeft = width - wmWidth - 10;
        }
        if (config.watermarkPosition.includes('bottom')) {
          wmTop = height - wmHeight - 10;
        }
        
        compositeImages.push({
          input: resizedWatermark,
          top: wmTop,
          left: wmLeft
        });
      } catch (err) {
        console.error('Watermark processing error:', err);
        // Continue without watermark if error
      }
    }

    // Resize and process the image
    const processedImage = await image
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .composite(compositeImages)
      .jpeg({ 
        quality: 90,
        progressive: true
      })
      .toBuffer();

    console.log('Image processing completed');

    // Send the preview image
    res.set('Content-Type', 'image/jpeg');
    res.send(processedImage);

  } catch (err) {
    console.error('Preview generation error:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate preview',
        details: err.message,
        stack: err.stack
      });
    }
  }
});

// POST /api/meme/generate
// Generate full HD meme with text wrapping and watermark
router.post('/generate', upload.single('image'), async (req, res) => {
  try {
    console.log('Received HD generation request');
    console.log('File:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    // Validate file upload
    if (!req.file) {
      console.log('Error: No image file provided');
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Parse and validate config
    let config;
    try {
      console.log('Config from request:', req.body.config);
      config = JSON.parse(req.body.config);
      console.log('Parsed config:', config);
    } catch (err) {
      console.error('Config parsing error:', err);
      return res.status(400).json({ error: 'Invalid JSON in config field' });
    }

    const validationResult = validate(config);
    if (!validationResult.valid) {
      console.error('Config validation error:', validationResult.error);
      return res.status(400).json({ error: validationResult.error });
    }

    // Process image at full resolution (no resizing for HD)
    let image = sharp(req.file.buffer);
    const metadata = await image.metadata();
    
    console.log('Original HD image metadata:', metadata);
    
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    // First, resize to preview size to get EXACT same text positioning
    const MAX_DIMENSION = 800;
    let previewWidth = originalWidth;
    let previewHeight = originalHeight;
    
    if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
      if (originalWidth > originalHeight) {
        previewHeight = Math.round((originalHeight * MAX_DIMENSION) / originalWidth);
        previewWidth = MAX_DIMENSION;
      } else {
        previewWidth = Math.round((originalWidth * MAX_DIMENSION) / originalHeight);
        previewHeight = MAX_DIMENSION;
      }
    }

    // Use the EXACT same fontSize/padding as preview (no scaling)
    const fontSize = config.fontSize || 48;
    const padding = config.padding || 10;
    const strokeWidth = config.strokeWidth || 4;
    
    // Support textColor as alias for fillColor (per spec)
    const fillColor = config.textColor || config.fillColor || 'white';
    const strokeColor = config.strokeColor || 'black';
    const textAlign = config.textAlign || 'center';
    const allCaps = config.allCaps !== undefined ? config.allCaps : true;
    
    // Calculate text wrapping for preview dimensions
    const maxTextWidth = previewWidth - (2 * padding);
    
    // Apply allCaps transformation BEFORE wrapping
    const topText = config.topText ? (allCaps ? config.topText.toUpperCase() : config.topText) : '';
    const bottomText = config.bottomText ? (allCaps ? config.bottomText.toUpperCase() : config.bottomText) : '';
    
    const topLines = topText ? wrapText(topText, fontSize, maxTextWidth) : [];
    const bottomLines = bottomText ? wrapText(bottomText, fontSize, maxTextWidth) : [];

    // Map font families to system fonts that are guaranteed to exist
    const fontMapping = {
      'Impact': 'Liberation Sans, Arial, sans-serif',
      'Arial': 'Liberation Sans, Arial, sans-serif',
      'Comic Sans MS': 'FreeSans, Arial, sans-serif',
      'Times New Roman': 'DejaVu Serif, serif'
    };
    
    const systemFont = fontMapping[config.fontFamily] || 'Liberation Sans, Arial, sans-serif';

    // Text anchor mapping for textAlign
    const anchorMap = {
      'left': 'start',
      'center': 'middle',
      'right': 'end'
    };
    const textAnchor = anchorMap[textAlign];
    
    // X position based on alignment
    const getXPosition = () => {
      if (textAlign === 'left') return padding;
      if (textAlign === 'right') return previewWidth - padding;
      return previewWidth / 2;
    };
    const xPos = getXPosition();

    // Generate tspan elements for wrapped text
    const generateTextBlock = (lines, startY, isTop = true) => {
      if (lines.length === 0) return '';
      
      const lineHeight = fontSize * 1.1;
      const totalHeight = lines.length * lineHeight;
      
      const blockY = isTop 
        ? startY 
        : startY - totalHeight + lineHeight;
      
      const tspans = lines.map((line, index) => {
        const y = blockY + (index * lineHeight);
        return `<tspan x="${xPos}" y="${y}" dy="0">${line}</tspan>`;
      }).join('');
      
      return `<text class="meme-text">${tspans}</text>`;
    };

    // Create SVG with preview dimensions (IDENTICAL to preview endpoint)
    const svgText = `
      <svg width="${previewWidth}" height="${previewHeight}">
        <style>
          .meme-text {
            font-family: ${systemFont};
            font-size: ${fontSize}px;
            font-weight: 900;
            text-anchor: ${textAnchor};
            fill: ${fillColor};
            stroke: ${strokeColor};
            stroke-width: ${strokeWidth}px;
            text-transform: ${allCaps ? 'uppercase' : 'none'};
            paint-order: stroke fill;
          }
        </style>
        ${generateTextBlock(topLines, padding + fontSize, true)}
        ${generateTextBlock(bottomLines, previewHeight - padding, false)}
        ${config.watermarkPosition ? `
          <text
            x="${config.watermarkPosition.includes('right') ? previewWidth - 10 : 10}"
            y="${config.watermarkPosition.includes('bottom') ? previewHeight - 10 : 20}"
            style="
              font-family: Arial;
              font-size: 12px;
              text-anchor: ${config.watermarkPosition.includes('right') ? 'end' : 'start'};
              fill: rgba(255,255,255,0.7);
            "
          >@meme-generator</text>
        ` : ''}
      </svg>`;

    console.log('Processing HD image...');

    // Prepare composite layers
    const compositeImages = [{
      input: Buffer.from(svgText),
      top: 0,
      left: 0
    }];

    // Add watermark image if provided
    if (config.watermarkImage) {
      try {
        const base64Data = config.watermarkImage.replace(/^data:image\/\w+;base64,/, '');
        const watermarkBuffer = Buffer.from(base64Data, 'base64');
        
        const resizedWatermark = await sharp(watermarkBuffer)
          .resize(100, 100, { fit: 'inside' })
          .toBuffer();
        
        const watermarkMetadata = await sharp(resizedWatermark).metadata();
        const wmWidth = watermarkMetadata.width;
        const wmHeight = watermarkMetadata.height;
        
        let wmLeft = 10;
        let wmTop = 10;
        
        if (config.watermarkPosition.includes('right')) {
          wmLeft = previewWidth - wmWidth - 10;
        }
        if (config.watermarkPosition.includes('bottom')) {
          wmTop = previewHeight - wmHeight - 10;
        }
        
        compositeImages.push({
          input: resizedWatermark,
          top: wmTop,
          left: wmLeft
        });
      } catch (err) {
        console.error('Watermark processing error:', err);
      }
    }

    // Step 1: Resize to preview size and add text (IDENTICAL to preview)
    const withText = await image
      .resize(previewWidth, previewHeight, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .composite(compositeImages)
      .toBuffer();

    // Step 2: Upscale back to original size for HD output
    const hdImage = await sharp(withText)
      .resize(originalWidth, originalHeight, {
        kernel: 'lanczos3',  // Best quality upscaling
        fit: 'fill'
      })
      .jpeg({ 
        quality: 95,
        progressive: true
      })
      .toBuffer();

    console.log('HD image generation completed');

    // Send the HD image as download
    res.set('Content-Type', 'image/jpeg');
    res.set('Content-Disposition', 'attachment; filename="meme.jpg"');
    res.send(hdImage);

  } catch (err) {
    console.error('HD generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate HD meme',
      details: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
