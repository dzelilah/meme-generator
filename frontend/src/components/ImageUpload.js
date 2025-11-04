import React, { useRef, useState } from 'react';

const ImageUpload = ({ onImageSelect }) => {
  const fileInputRef = useRef();
  const [localPreview, setLocalPreview] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreview(reader.result);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    } else {
      alert('Please select an image file');
    }
  };

  return (
    <div className="image-upload">
      <div 
        className="upload-area"
        onClick={() => fileInputRef.current.click()}
      >
        {localPreview ? (
          <img 
            src={localPreview} 
            alt="Selected" 
            className="thumbnail-image"
          />
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">⬆</span>
            <span>Upload Image</span>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUpload;