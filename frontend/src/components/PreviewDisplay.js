import React from 'react';

const PreviewDisplay = ({ previewUrl }) => {
  return (
    <div className="preview-display">
      <h3>Preview</h3>
      {previewUrl ? (
        <img 
          src={previewUrl} 
          alt="Meme preview" 
          style={{ maxWidth: '100%', maxHeight: '500px' }}
        />
      ) : (
        <div className="no-preview">
          Select an image and add text to see preview
        </div>
      )}
    </div>
  );
};

export default PreviewDisplay;
