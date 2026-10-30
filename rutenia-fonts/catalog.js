'use strict';
(() => {
  const input = document.querySelector('#test-text');
  const size = document.querySelector('#sample-size');
  const search = document.querySelector('#font-search');
  const filters = [...document.querySelectorAll('[data-format]')];
  const cards = [...document.querySelectorAll('.font-card')];
  const dialog = document.querySelector('#image-dialog');
  const defaultText = input.value;
  let catalog = [], format = 'all', gallery = null, galleryIndex = 0, opener = null;

  function countLabel(n) {
    const rem100 = n % 100, rem10 = n % 10;
    return `${n} ${rem100 >= 11 && rem100 <= 14 ? 'гарнітур' : rem10 === 1 ? 'гарнітура' : rem10 >= 2 && rem10 <= 4 ? 'гарнітури' : 'гарнітур'}`;
  }
  function filterCards() {
    const query = search.value.trim().toLocaleLowerCase('uk');
    let shown = 0;
    for (const card of cards) {
      const item = catalog.find(font => font.id === card.dataset.font);
      if (!item) continue;
      const matches = `${item.name} ${item.label} ${item.id}`.toLocaleLowerCase('uk').includes(query)
        && (format === 'all' || item.formats.includes(format));
      card.hidden = !matches;
      shown += Number(matches);
    }
    document.querySelector('#results-count').textContent = countLabel(shown);
    document.querySelector('#empty-state').hidden = shown !== 0;
  }
  function updateSamples() {
    const text = input.value;
    for (const card of cards) {
      const item = catalog.find(font => font.id === card.dataset.font);
      if (!item) continue;
      const points = item.points;
      const missing = [...new Set([...text].filter(char => !/\s/u.test(char) && !points.has(char.codePointAt(0))))];
      card.querySelector('.sample').textContent = [...text].map(char => /\s/u.test(char) || points.has(char.codePointAt(0)) ? char : '□').join('');
      const notice = card.querySelector('.missing-glyphs');
      notice.textContent = missing.length ? `У файлі немає символів: ${missing.join(' ')}` : '';
      notice.hidden = missing.length === 0;
    }
  }
  function changeSize() {
    document.documentElement.style.setProperty('--sample-size', `${size.value}px`);
    document.querySelector('#size-value').value = size.value;
  }
  function showImage() {
    const item = gallery.images[galleryIndex];
    const image = document.querySelector('#dialog-image');
    image.src = item.path;
    image.alt = item.alt;
    document.querySelector('#dialog-title').textContent = gallery.label;
    document.querySelector('#dialog-position').textContent = `${galleryIndex + 1} з ${gallery.images.length} / ${gallery.name}`;
    document.querySelector('#dialog-original').href = item.original_url;
    document.querySelector('#gallery-prev').hidden = gallery.images.length < 2;
    document.querySelector('#gallery-next').hidden = gallery.images.length < 2;
  }
  function stepImage(direction) {
    if (!gallery) return;
    galleryIndex = (galleryIndex + direction + gallery.images.length) % gallery.images.length;
    showImage();
  }
  document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
  document.querySelector('#gallery-prev').addEventListener('click', () => stepImage(-1));
  document.querySelector('#gallery-next').addEventListener('click', () => stepImage(1));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
    opener?.focus({preventScroll: true});
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); stepImage(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); stepImage(-1); }
  });
  fetch('catalog-data.json').then(response => {
    if (!response.ok) throw new Error('Catalogue unavailable');
    return response.json();
  }).then(items => {
    catalog = items.map(item => ({...item, points: new Set(item.codepoints)}));
    input.addEventListener('input', updateSamples);
    size.addEventListener('input', changeSize);
    search.addEventListener('input', filterCards);
    filters.forEach(button => button.addEventListener('click', () => {
      format = button.dataset.format;
      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      filterCards();
    }));
    document.querySelector('#reset-text').addEventListener('click', () => {
      input.value = defaultText; size.value = '32'; updateSamples(); changeSize();
    });
    document.querySelector('#clear-search').addEventListener('click', () => {
      search.value = ''; filters[0].click(); search.focus();
    });
    document.querySelectorAll('[data-gallery]').forEach(link => link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (typeof dialog.showModal !== 'function') return;
      const item = catalog.find(font => font.id === link.dataset.gallery);
      if (!item) return;
      event.preventDefault(); gallery = item; galleryIndex = 0; opener = link;
      showImage(); dialog.showModal(); document.body.style.overflow = 'hidden';
    }));
    updateSamples(); filterCards();
    document.documentElement.dataset.catalogReady = 'true';
  }).catch(() => {
    const status = document.querySelector('#status-message');
    status.textContent = 'Пробний набір тимчасово недоступний. Зображення та завантаження працюють.';
    status.hidden = false;
    input.disabled = true; search.disabled = true; size.disabled = true;
    filters.forEach(button => { button.disabled = true; });
  });
})();
