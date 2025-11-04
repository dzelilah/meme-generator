import React from 'react';

const TextConfigForm = ({ config, onConfigChange, onGenerateClick }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' 
      ? checked 
      : ['fontSize', 'strokeWidth', 'padding'].includes(name) 
        ? parseInt(value, 10) 
        : value;
    
    console.log('TextConfigForm handleChange:', { name, type, value, checked, newValue });
    
    onConfigChange({
      ...config,
      [name]: newValue
    });
  };

  const handleWatermarkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onConfigChange({
        ...config,
        watermarkImage: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="text-config-form">
      <div className="form-row">
        <input
          type="text"
          name="topText"
          value={config.topText || ''}
          onChange={handleChange}
          placeholder="Top Text"
          className="full-width"
        />
      </div>

      <div className="form-row">
        <input
          type="text"
          name="bottomText"
          value={config.bottomText || ''}
          onChange={handleChange}
          placeholder="Bottom Text"
          className="full-width"
        />
      </div>

      <div className="form-row two-columns">
        <div className="form-group">
          <label>Font Family</label>
          <select
            name="fontFamily"
            value={config.fontFamily || 'Impact'}
            onChange={handleChange}
            className="full-width"
          >
            <option value="Impact">Impact</option>
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
          </select>
        </div>

        <div className="form-group">
          <label>Font Size</label>
          <input
            type="number"
            name="fontSize"
            value={config.fontSize || 26}
            onChange={handleChange}
            min="12"
            max="120"
            className="full-width"
          />
        </div>
      </div>

      <div className="form-row two-columns">
        <div className="form-group">
          <label>Text Color</label>
          <input
            type="color"
            name="fillColor"
            value={config.fillColor || '#ffffff'}
            onChange={handleChange}
            className="full-width"
          />
        </div>

        <div className="form-group">
          <label>Stroke Color</label>
          <input
            type="color"
            name="strokeColor"
            value={config.strokeColor || '#000000'}
            onChange={handleChange}
            className="full-width"
          />
        </div>
      </div>

      <div className="form-row two-columns">
        <div className="form-group">
          <label>Stroke Width</label>
          <select
            name="strokeWidth"
            value={config.strokeWidth || 4}
            onChange={handleChange}
            className="full-width"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="6">6</option>
          </select>
        </div>

        <div className="form-group">
          <label>Text Align</label>
          <select
            name="textAlign"
            value={config.textAlign || 'center'}
            onChange={handleChange}
            className="full-width"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div className="form-row two-columns">
        <div className="form-group">
          <label>Padding</label>
          <select
            name="padding"
            value={config.padding || 10}
            onChange={handleChange}
            className="full-width"
          >
            <option value="0">0</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              name="allCaps"
              checked={config.allCaps === true}
              onChange={handleChange}
              style={{ width: 'auto', margin: 0 }}
            />
            All Caps (Uppercase)
          </label>
        </div>
      </div>

      <div className="form-row two-columns">
        <div className="form-group">
          <label>Watermark Position</label>
          <select
            name="watermarkPosition"
            value={config.watermarkPosition || 'bottom-right'}
            onChange={handleChange}
            className="full-width"
          >
            <option value="bottom-right">Bottom Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="top-right">Top Right</option>
            <option value="top-left">Top Left</option>
          </select>
        </div>

        <div className="form-group">
          <label>Custom Watermark Image</label>
          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleWatermarkUpload}
            className="full-width"
            style={{ padding: '8px' }}
          />
          {config.watermarkImage && (
            <small style={{ color: '#4CAF50' }}>✓ Watermark uploaded</small>
          )}
        </div>
      </div>

      <div className="form-row button-group">
        <button 
          className="generate-button"
          onClick={(e) => {
            e.preventDefault();
            onGenerateClick();
          }}
        >
          Generate Meme
        </button>
      </div>
    </div>
  );
};

export default TextConfigForm;