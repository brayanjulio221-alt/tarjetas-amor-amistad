(() => {
  const form = document.getElementById('form');
  const result = document.getElementById('result');
  const messageInput = document.getElementById('mensaje');
  const gallery = document.getElementById('gallery');
  const resultTitle = document.getElementById('resultTitle');
  const resultName = document.getElementById('resultName');
  const resultText = document.getElementById('resultText');
  const resultSignature = document.getElementById('resultSignature');
  const resultTone = document.getElementById('resultTone');
  const presetButtons = document.querySelectorAll('.presetBtn');
  const themeButtons = document.querySelectorAll('.themeChoice');
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
  const installBtn = document.getElementById('installBtn');
  const shareUrlInput = document.getElementById('linkCompartir');
  const songInput = document.getElementById('cancion');
  const songLabel = document.getElementById('songLabel');
  const audioPreview = document.getElementById('audioPreview');
  const videoInput = document.getElementById('video');
  const videoLabel = document.getElementById('videoLabel');
  const videoPreview = document.getElementById('videoPreview');
  const STORAGE_KEY = 'amor-amistad-draft-v1';

  function getCurrentDraft() {
    const galleryImages = Array.from(document.querySelectorAll('#gallery img')).map((img) => img.src);
    const heartColor = document.querySelector('input[name="heartColor"]:checked')?.value || '#ff4d67';
    const theme = document.querySelector('.themeChoice.active')?.dataset.style || 'premium';

    return {
      nombre: document.getElementById('nombre').value,
      tipo: document.getElementById('tipo').value,
      mensaje: document.getElementById('mensaje').value,
      firma: document.getElementById('firma').value,
      tono: document.getElementById('tono').value,
      tema: theme,
      heartColor,
      gallery: galleryImages,
      songName: songLabel.textContent,
      songDataUrl: audioPreview.src || '',
      videoName: videoLabel.textContent,
      videoDataUrl: videoPreview.src || ''
    };
  }

  function saveDraft() {
    return undefined;
  }

  function setGalleryFromDraft(images) {
    const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
    const cards = Array.from(gallery.children);

    cards.forEach((node, index) => {
      const src = validImages[index];
      if (!src) return;

      const img = document.createElement('img');
      img.src = src;
      img.alt = `Foto ${index + 1}`;
      node.replaceWith(img);
    });
  }

  function resetGalleryPlaceholders() {
    gallery.innerHTML = '';
    const placeholders = [
      'Tu foto aparecerá aquí 📷',
      'Agrega un recuerdo ✨',
      'Hazlo inolvidable 💕'
    ];

    placeholders.forEach((label) => {
      const empty = document.createElement('div');
      empty.className = 'emptyPhoto';
      empty.textContent = label;
      gallery.appendChild(empty);
    });
  }

  function clearVideoSelection() {
    if (videoInput) videoInput.value = '';
    if (videoLabel) videoLabel.textContent = 'Selecciona un video';
    if (videoPreview) {
      videoPreview.removeAttribute('src');
      videoPreview.hidden = true;
    }
  }

  function setSongFromDraft(songName, songDataUrl) {
    if (!songName || !songDataUrl) return;

    songLabel.textContent = songName;
    audioPreview.src = songDataUrl;
    audioPreview.hidden = false;
  }

  function setVideoFromDraft(videoName, videoDataUrl) {
    if (!videoName || !videoDataUrl) return;

    videoLabel.textContent = videoName;
    videoPreview.src = videoDataUrl;
    videoPreview.hidden = false;

    gallery.innerHTML = '';
    const videoElement = document.createElement('video');
    videoElement.src = videoDataUrl;
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.muted = true;
    videoElement.className = 'mediaVideo';
    gallery.appendChild(videoElement);
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw);
      if (!draft) return;

      if (draft.nombre) document.getElementById('nombre').value = draft.nombre;
      if (draft.tipo) document.getElementById('tipo').value = draft.tipo;
      if (draft.mensaje) document.getElementById('mensaje').value = draft.mensaje;
      if (draft.firma) document.getElementById('firma').value = draft.firma;
      if (draft.tono) document.getElementById('tono').value = draft.tono;

      if (draft.heartColor) {
        const radio = document.querySelector(`input[name="heartColor"][value="${draft.heartColor}"]`);
        if (radio) radio.checked = true;
        applyHeartColor(draft.heartColor);
      }

      if (draft.tema) {
        const themeButton = document.querySelector(`.themeChoice[data-style="${draft.tema}"]`);
        if (themeButton) {
          themeButtons.forEach((btn) => btn.classList.toggle('active', btn === themeButton));
          applyTheme(draft.tema);
        }
      }

      if (Array.isArray(draft.gallery) && draft.gallery.length) {
        setGalleryFromDraft(draft.gallery);
      }

      if (draft.songName && draft.songDataUrl) {
        setSongFromDraft(draft.songName, draft.songDataUrl);
      }

      if (draft.videoName && draft.videoDataUrl) {
        setVideoFromDraft(draft.videoName, draft.videoDataUrl);
      }

      fillResult();
    } catch (error) {
      console.warn('No se pudo restaurar el borrador:', error);
    }
  }

  function getShareLink() {
    const customValue = (shareUrlInput && shareUrlInput.value.trim()) || '';
    if (customValue) {
      return customValue.startsWith('http') ? customValue : `https://${customValue}`;
    }

    if (location.protocol !== 'file:') {
      if (location.hostname.includes('github.io')) {
        return `${location.origin}${location.pathname}`;
      }
      return location.href;
    }

    return 'https://brayanjulio221-alt.github.io/tarjetas-amor-amistad/';
  }

  const presets = {
    dulce: (name, message) => `Querido/a ${name}, hoy quiero celebrar la alegría de tenerte en mi vida. ${message || 'Gracias por regalarme momentos que hacen mis días mucho más bonitos.'} Que nunca te falten razones para sonreír y personas que te quieran de verdad. 💜 Feliz Día del Amor y la Amistad.`,
    romantico: (name, message) => `Mi querido/a ${name}, en este Día del Amor y la Amistad quiero recordarte lo especial que eres para mí. ${message || 'Tú eres de esas personas que hacen que mi corazón sonría y que los momentos sencillos se conviertan en recuerdos inolvidables.'} ❤️`,
    amigable: (name, message) => `${name}, hoy celebro nuestra amistad y todos esos momentos que nos han hecho reír, aprender y seguir adelante. ${message || 'Gracias por cada risa, cada consejo y cada recuerdo compartido.'} ¡Feliz Día del Amor y la Amistad! 💜`,
    profundo: (name, message) => `Para ${name}: en este día quiero agradecer que nuestros caminos se hayan cruzado. ${message || 'Hay personas que dejan una huella bonita en el corazón sin darse cuenta, y tú eres una de ellas.'} Gracias por existir, por ser tú y por todos los recuerdos que hacen especial esta historia. ✨`
  };

  const quickTemplates = {
    romantico: 'Te quiero por la forma en que haces que todo se sienta más bonito y más alegre.',
    amistad: 'Gracias por ser esa persona que hace que cada día se sienta más ligero y más especial.',
    gratitud: 'Gracias por estar, por acompañar y por hacer que los momentos sean más bonitos.',
    aniversario: 'Hoy quiero recordarte lo especial que eres para mí y lo afortunado que me siento de tenerte.'
  };

  function setGalleryImage(index, dataUrl) {
    const cards = [...gallery.children];
    const current = cards[index];
    const img = document.createElement('img');
    img.src = dataUrl;
    img.alt = `Foto ${index + 1}`;
    current.replaceWith(img);
  }

  function loadPhoto(input, slot) {
    const file = input.files && input.files[0];
    if (!file) return;

    clearVideoSelection();

    const reader = new FileReader();
    reader.onload = () => {
      setGalleryImage(slot, reader.result);
      saveDraft();
    };
    reader.readAsDataURL(file);
  }

  function applyHeartColor(color) {
    document.documentElement.style.setProperty('--heart-color', color);
  }

  function applyTheme(theme) {
    const palette = {
      premium: {
        bg: 'linear-gradient(135deg, #140b20 0%, #221134 28%, #090712 100%)',
        cardTop: 'rgba(46, 19, 74, 0.92)',
        cardBottom: 'rgba(18, 9, 31, 0.9)',
        accent: '#ff7bd5'
      },
      luna: {
        bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 35%, #020817 100%)',
        cardTop: 'rgba(21, 37, 61, 0.9)',
        cardBottom: 'rgba(8, 15, 26, 0.9)',
        accent: '#8ec5ff'
      },
      minimal: {
        bg: 'linear-gradient(135deg, #1d1d29 0%, #111827 30%, #09090b 100%)',
        cardTop: 'rgba(25, 25, 35, 0.92)',
        cardBottom: 'rgba(9, 9, 11, 0.9)',
        accent: '#f9a8d4'
      },
      rosado: {
        bg: 'linear-gradient(135deg, #3d0b2b 0%, #5c123d 35%, #1b0a1e 100%)',
        cardTop: 'rgba(70, 22, 58, 0.94)',
        cardBottom: 'rgba(29, 13, 27, 0.9)',
        accent: '#ff8dcf'
      },
      luxury: {
        bg: 'linear-gradient(135deg, #120d1d 0%, #1f122c 28%, #0b0716 100%)',
        cardTop: 'rgba(32, 18, 44, 0.96)',
        cardBottom: 'rgba(10, 8, 19, 0.96)',
        accent: '#d9b36c'
      }
    };

    const themeData = palette[theme] || palette.premium;
    document.documentElement.style.setProperty('--accent-color', themeData.accent);
    document.documentElement.style.setProperty('--accent-soft', `${themeData.accent}33`);
    document.documentElement.style.setProperty('--accent-strong', themeData.accent);
    document.documentElement.style.setProperty('--card-top', themeData.cardTop);
    document.documentElement.style.setProperty('--card-bottom', themeData.cardBottom);
    document.body.style.background = themeData.bg;
    document.body.dataset.theme = theme;
  }

  function buildTitle(type) {
    if (type === 'amor') return 'Feliz Amor y Amistad ❤️';
    if (type === 'amistad') return 'Feliz Día de la Amistad 💜';
    return 'Para una persona especial ✨';
  }

  function fillResult() {
    const name = document.getElementById('nombre').value.trim() || 'alguien muy especial';
    const type = document.getElementById('tipo').value;
    const tone = document.getElementById('tono').value;
    const signature = document.getElementById('firma').value.trim() || 'Con mucho cariño';

    resultTitle.textContent = buildTitle(type);
    resultName.textContent = name;
    resultText.textContent = presets[tone](name, messageInput.value.trim());
    resultSignature.textContent = '— ' + signature;
    resultTone.textContent = `Tono ${document.getElementById('tono').options[document.getElementById('tono').selectedIndex].text}`;
    resultTone.dataset.tone = tone;
  }

  function applyQuickTemplate(selectedTemplate) {
    const templateKey = selectedTemplate || document.querySelector('.presetBtn.active')?.dataset.template;
    if (quickTemplates[templateKey] && (!messageInput.value.trim() || messageInput.dataset.autofill === 'true')) {
      messageInput.value = quickTemplates[templateKey];
      messageInput.dataset.autofill = 'true';
    }
    fillResult();
  }

  document.querySelectorAll('input[name="heartColor"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      applyHeartColor(radio.value);
      saveDraft();
    });
  });

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      presetButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      applyQuickTemplate(button.dataset.template);
    });
  });

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      themeButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
      applyTheme(button.dataset.style);
      saveDraft();
    });
  });

  messageInput.addEventListener('input', () => {
    messageInput.dataset.autofill = 'false';
    fillResult();
    saveDraft();
  });

  ['nombre', 'tipo', 'tono', 'firma'].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      fillResult();
      saveDraft();
    });
    input.addEventListener('change', () => {
      fillResult();
      saveDraft();
    });
  });

  const defaultHeartColor = document.querySelector('input[name="heartColor"]:checked');
  applyHeartColor(defaultHeartColor.value);
  applyTheme(document.querySelector('.themeChoice.active')?.dataset.style || 'premium');
  applyQuickTemplate(document.querySelector('.presetBtn.active')?.dataset.template || 'romantico');
  localStorage.removeItem(STORAGE_KEY);

  ['#foto1', '#foto2', '#foto3'].forEach((selector, index) => {
    const input = document.querySelector(selector);
    input.addEventListener('change', () => loadPhoto(input, index));
  });

  if (songInput) {
    songInput.addEventListener('change', () => {
      const file = songInput.files && songInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        songLabel.textContent = file.name;
        audioPreview.src = dataUrl;
        audioPreview.hidden = false;
        saveDraft();
      };
      reader.readAsDataURL(file);
    });
  }

  if (videoInput) {
    videoInput.addEventListener('change', () => {
      const file = videoInput.files && videoInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        videoLabel.textContent = file.name;
        videoPreview.src = dataUrl;
        videoPreview.hidden = false;

        const existingImages = Array.from(document.querySelectorAll('#gallery img'));
        existingImages.forEach((img) => img.remove());
        gallery.innerHTML = '';
        const videoElement = document.createElement('video');
        videoElement.src = dataUrl;
        videoElement.controls = true;
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.className = 'mediaVideo';
        gallery.appendChild(videoElement);

        saveDraft();
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    fillResult();
    saveDraft();
    form.style.display = 'none';
    document.body.classList.add('result-mode');
    result.classList.add('show');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('editBtn').addEventListener('click', () => {
    result.classList.remove('show');
    form.style.display = 'grid';
    document.body.classList.remove('result-mode');
    form.scrollIntoView({ behavior: 'smooth' });
  });

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth, lineHeight) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function getGallerySources() {
    return Array.from(document.querySelectorAll('#gallery img')).map((img) => img.src).filter(Boolean);
  }

  function buildCardHtml() {
    const name = document.getElementById('nombre').value.trim() || 'alguien muy especial';
    const title = resultTitle.textContent || 'Feliz Amor y Amistad';
    const message = resultText.textContent || 'Gracias por ser parte de mi vida.';
    const signature = resultSignature.textContent.replace('— ', '') || 'Con mucho cariño';
    const gallerySources = getGallerySources();
    const songSource = (audioPreview && audioPreview.src && audioPreview.src.startsWith('data:audio/')) ? audioPreview.src : '';
    const videoSource = (videoPreview && videoPreview.src && !videoPreview.hidden) ? videoPreview.src : '';
    const galleryMarkup = gallerySources.length
      ? `
        <div class="gallery-grid">
          ${gallerySources.map((src) => `<img src="${src}" alt="Foto especial" />`).join('')}
        </div>`
      : '';
    const audioMarkup = songSource
      ? `
        <div class="audio-wrap">
          <audio controls autoplay loop>
            <source src="${songSource}" />
          </audio>
        </div>`
      : '';
    const mediaMarkup = videoSource
      ? `
        <div class="video-wrap">
          <video controls playsinline muted>
            <source src="${videoSource}" />
          </video>
        </div>`
      : '';

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #140b20 0%, #221134 28%, #090712 100%);
      color: white;
    }
    .card {
      width: min(92vw, 520px);
      background: linear-gradient(180deg, rgba(46,19,74,0.96), rgba(18,9,31,0.96));
      border-radius: 26px;
      padding: 28px 22px;
      box-shadow: 0 22px 52px rgba(0,0,0,0.35);
      text-align: center;
      border: 1px solid rgba(255,255,255,0.12);
    }
    .heart {
      font-size: 60px;
      color: #ff6ec7;
      margin: 8px 0 12px;
    }
    h1 {
      margin: 0;
      font-size: clamp(28px, 7vw, 40px);
      font-family: Georgia, serif;
    }
    .name {
      margin: 16px 0 12px;
      color: #ff9fe4;
      font-size: 22px;
      font-weight: 700;
    }
    .message {
      font-size: 18px;
      line-height: 1.7;
      font-family: Georgia, serif;
      margin: 0 auto 20px;
      max-width: 420px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
      margin: 18px auto;
      max-width: 360px;
    }
    .gallery-grid img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      border-radius: 14px;
      display: block;
    }
    .audio-wrap,
    .video-wrap {
      margin: 14px auto 18px;
      max-width: 360px;
    }
    audio,
    video {
      width: 100%;
      border-radius: 12px;
      display: block;
      max-height: 220px;
      background: rgba(0,0,0,0.2);
    }
    .signature {
      color: #eadcf5;
      font-size: 14px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="heart">♥</div>
    <h1>${title}</h1>
    <div class="name">${name}</div>
    <p class="message">${message}</p>
    ${galleryMarkup}
    ${mediaMarkup}
    ${audioMarkup}
    <div class="signature">— ${signature}</div>
  </div>
</body>
</html>`;
  }

  function downloadHtmlCard() {
    const html = buildCardHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dedicatoria-amor-amistad.html';
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCardAsImage() {
    const canvas = document.createElement('canvas');
    const width = 900;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#180b29');
    gradient.addColorStop(0.45, '#2d1141');
    gradient.addColorStop(1, '#0b0713');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const heartColor = getComputedStyle(document.documentElement).getPropertyValue('--heart-color').trim() || '#ff6ec7';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(120, 140, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(760, 1000, 150, 0, Math.PI * 2);
    ctx.fill();

    const cardX = 75;
    const cardY = 125;
    const cardW = width - 150;
    const cardH = height - 150;

    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 36);
    ctx.fillStyle = 'rgba(45, 19, 68, 0.96)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f6e7ff';
    ctx.font = '700 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AMOR ♥ AMISTAD', width / 2, 200);

    ctx.fillStyle = heartColor;
    ctx.font = '700 90px serif';
    ctx.fillText('♥', width / 2, 310);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 56px Georgia';
    ctx.textAlign = 'center';
    const title = resultTitle.textContent || 'Feliz Amor y Amistad';
    ctx.fillText(title, width / 2, 390);

    const name = resultName.textContent || 'alguien muy especial';
    ctx.fillStyle = '#ff9fe4';
    ctx.font = '700 28px sans-serif';
    ctx.fillText(name, width / 2, 455);

    const photos = getGallerySources();
    const slots = [
      { x: 150, y: 500, w: 180, h: 180 },
      { x: 360, y: 500, w: 180, h: 180 },
      { x: 570, y: 500, w: 180, h: 180 }
    ];

    photos.slice(0, 3).forEach((src, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      const slot = slots[index];
      if (img.complete) {
        ctx.save();
        drawRoundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 22);
        ctx.clip();
        ctx.drawImage(img, slot.x, slot.y, slot.w, slot.h);
        ctx.restore();
      } else {
        img.onload = () => {
          ctx.save();
          drawRoundedRect(ctx, slot.x, slot.y, slot.w, slot.h, 22);
          ctx.clip();
          ctx.drawImage(img, slot.x, slot.y, slot.w, slot.h);
          ctx.restore();
        };
      }
    });

    const videoSource = videoPreview && videoPreview.src && !videoPreview.hidden ? videoPreview.src : '';
    if (videoSource && !photos.length) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      drawRoundedRect(ctx, 220, 500, 460, 220, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 46px sans-serif';
      ctx.fillText('🎬 VIDEO', width / 2, 610);
      ctx.font = '600 22px sans-serif';
      ctx.fillText('Video incluido en la tarjeta', width / 2, 655);
    }

    ctx.fillStyle = '#f3ebff';
    ctx.font = 'italic 30px Georgia';
    const text = resultText.textContent || 'Gracias por ser parte de mi vida.';
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, text, 640, 38);
    const startY = 760;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * 38);
    });

    ctx.fillStyle = '#e8d5f6';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(resultSignature.textContent.replace('— ', ''), width / 2, 930);

    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '600 18px sans-serif';
    ctx.fillText('Hecho con cariño • Amor & Amistad 💜', width / 2, 990);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'dedicatoria-amor-amistad.png';
    link.href = url;
    link.click();
  }

  downloadBtn.addEventListener('click', exportCardAsImage);
  downloadHtmlBtn.addEventListener('click', downloadHtmlCard);

  async function shareCardAsFile() {
    const name = document.getElementById('nombre').value.trim() || 'alguien especial';
    const title = resultTitle.textContent || 'Feliz Amor y Amistad';
    const message = resultText.textContent || 'Gracias por ser parte de mi vida.';
    const signature = resultSignature.textContent.replace('— ', '') || 'Con mucho cariño';
    const gallerySources = getGallerySources();
    const shareLink = getShareLink();
    const photoMarkup = gallerySources.length
      ? `
        <div class="gallery-grid">
          ${gallerySources.map((src) => `<img src="${src}" alt="Foto especial" />`).join('')}
        </div>`
      : '';
    const songSource = (audioPreview && audioPreview.src && audioPreview.src.startsWith('data:audio/')) ? audioPreview.src : '';
    const videoSource = (videoPreview && videoPreview.src && !videoPreview.hidden) ? videoPreview.src : '';
    const audioMarkup = songSource ? `<audio controls autoplay loop><source src="${songSource}" /></audio>` : '';
    const videoMarkup = videoSource ? `<video controls playsinline muted><source src="${videoSource}" /></video>` : '';

    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #140b20 0%, #221134 28%, #090712 100%);
      color: white;
    }
    .card {
      width: min(92vw, 520px);
      background: linear-gradient(180deg, rgba(46,19,74,0.96), rgba(18,9,31,0.96));
      border-radius: 26px;
      padding: 28px 22px;
      box-shadow: 0 22px 52px rgba(0,0,0,0.35);
      text-align: center;
    }
    .heart {
      font-size: 60px;
      color: #ff6ec7;
      margin: 8px 0 12px;
    }
    h1 {
      margin: 0;
      font-size: clamp(28px, 7vw, 40px);
      font-family: Georgia, serif;
    }
    .name {
      margin: 16px 0 12px;
      color: #ff9fe4;
      font-size: 22px;
      font-weight: 700;
    }
    .message {
      font-size: 18px;
      line-height: 1.7;
      font-family: Georgia, serif;
      margin: 0 auto 20px;
      max-width: 420px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
      margin: 18px auto;
      max-width: 360px;
    }
    .gallery-grid img {
      width: 100%;
      height: 110px;
      object-fit: cover;
      border-radius: 14px;
      display: block;
    }
    audio, video {
      width: 100%;
      max-width: 360px;
      margin: 12px auto;
      display: block;
      border-radius: 12px;
    }
    .signature {
      color: #eadcf5;
      font-size: 14px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="heart">♥</div>
    <h1>${title}</h1>
    <div class="name">${name}</div>
    <p class="message">${message}</p>
    ${photoMarkup}
    ${videoMarkup}
    ${audioMarkup}
    <div class="signature">— ${signature}</div>
  </div>
</body>
</html>`;

    const htmlFile = new File([html], 'dedicatoria-amor-amistad.html', { type: 'text/html' });
    const filesToShare = [htmlFile];

    const imageFiles = [];
    for (const src of gallerySources) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        imageFiles.push(new File([blob], `foto-${imageFiles.length + 1}.${blob.type.split('/')[1] || 'png'}`, { type: blob.type || 'image/png' }));
      } catch (error) {
        console.warn('No se pudo adjuntar una foto:', error);
      }
    }
    filesToShare.push(...imageFiles);

    let songFile = null;
    if (songInput && songInput.files && songInput.files[0]) {
      songFile = songInput.files[0];
    } else if (audioPreview && audioPreview.src && audioPreview.src.startsWith('data:audio/')) {
      const response = await fetch(audioPreview.src);
      const blob = await response.blob();
      songFile = new File([blob], songLabel.textContent || 'cancion.mp3', { type: blob.type || 'audio/mpeg' });
    }

    let videoFile = null;
    if (videoInput && videoInput.files && videoInput.files[0]) {
      videoFile = videoInput.files[0];
    } else if (videoPreview && videoPreview.src && !videoPreview.hidden) {
      const response = await fetch(videoPreview.src);
      const blob = await response.blob();
      videoFile = new File([blob], videoLabel.textContent || 'video.mp4', { type: blob.type || 'video/mp4' });
    }

    if (songFile) filesToShare.push(songFile);
    if (videoFile) filesToShare.push(videoFile);

    const shareText = `Te preparé una dedicatoria especial 💜 para ${name}.\n\nMira la tarjeta aquí:\n${shareLink}`;

    if (navigator.share && navigator.canShare && navigator.canShare({ files: filesToShare })) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareLink,
          files: filesToShare
        });
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          return;
        }
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  }

  document.getElementById('shareBtn').addEventListener('click', shareCardAsFile);

  let deferredPrompt = null;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch((error) => {
        console.warn('No se pudo registrar el service worker:', error);
      });
    });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
  });
})();
