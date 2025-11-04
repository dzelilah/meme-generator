import React, { useState } from 'react';

export default function MemeForm({ onPreview }) {
  const [file, setFile] = useState(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');

  function handleFile(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return alert('Please choose an image');
    const form = new FormData();
    form.append('image', file);
    const config = { topText, bottomText };
    form.append('config', JSON.stringify(config));

    const res = await fetch('/api/meme/preview', { method: 'POST', body: form });
    if (!res.ok) return alert('Preview failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    onPreview(url);
  }

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:8, width:400}}>
      <input type="file" accept="image/*" onChange={handleFile} />
      <input placeholder="Top text" value={topText} onChange={e=>setTopText(e.target.value)} />
      <input placeholder="Bottom text" value={bottomText} onChange={e=>setBottomText(e.target.value)} />
      <button type="submit">Generate preview</button>
    </form>
  );
}
