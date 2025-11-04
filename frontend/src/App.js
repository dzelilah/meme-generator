import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import TextConfigForm from './components/TextConfigForm';
import PreviewDisplay from './components/PreviewDisplay';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [config, setConfig] = useState({
    topText: '',
    bottomText: '',
    fontSize: 26,
    fillColor: '#ffffff',
    strokeColor: '#000000',
    fontFamily: 'Impact',
    strokeWidth: 4,
    padding: 10,
    watermarkPosition: 'bottom-right',
    textAlign: 'center',
    allCaps: true  // default true for meme style
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const generatePreview = useCallback(async () => {
      console.log('Generating preview...');
      if (!selectedImage) {
        console.log('No image selected');
        return;
      }

      // Clear previous preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      console.log('Selected image:', selectedImage);
      console.log('Current config:', config);
      console.log('Config stringified:', JSON.stringify(config, null, 2));

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('config', JSON.stringify(config));

      try {
        console.log('Sending request with formData:', {
          image: selectedImage.name,
          imageSize: selectedImage.size,
          imageType: selectedImage.type,
          config: config
        });

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/meme/preview`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`Preview generation failed: ${errorText}`);
        }

        // Convert the response to a blob and create an object URL
        const blob = await response.blob();
        console.log('Received blob:', {
          size: blob.size,
          type: blob.type
        });
        
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (error) {
        console.error('Error generating preview:', error);
        alert('Failed to generate preview: ' + error.message);
      }
  }, [selectedImage, config]);

  const handleImageSelect = (file) => {
    console.log('Image selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('Image size should be less than 15MB');
      return;
    }

    setSelectedImage(file);
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  // Use useEffect to generate preview when image or config changes
  useEffect(() => {
    if (selectedImage) {
      const timeoutId = setTimeout(() => {
        generatePreview();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [selectedImage, config, generatePreview]);  const generateHDMeme = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
      return;
    }

    try {
      console.log('Generating HD meme...');
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('config', JSON.stringify(config));

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/meme/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HD generation failed: ${errorText}`);
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meme.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('HD meme downloaded successfully');
    } catch (error) {
      console.error('Error generating HD meme:', error);
      alert('Failed to generate HD meme: ' + error.message);
    }
  };  return (
    <div className="App">
      <header className="App-header">
        <h1>MEME GENERATOR</h1>
      </header>
      <main className="App-main">
        <div className="editor-container">
          <div className="left-panel">
            <PreviewDisplay previewUrl={previewUrl} />
          </div>
          <div className="right-panel">
            <ImageUpload onImageSelect={handleImageSelect} />
            <TextConfigForm 
              config={config} 
              onConfigChange={handleConfigChange}
              onGenerateClick={generateHDMeme}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
