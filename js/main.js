/* JIMON GROUP · выпуск v28 · Claude */

const PAGE_SIZE = 12;
let catalogState = { filter: 'all', q: '', sort: 'default', shown: PAGE_SIZE };

function starsStr(r) {
  if (!r) return '';
  const full = Math.round(Number(r) || 0);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

function showToast(text) {
  const t = document.getElementById('toast');
  const tx = document.getElementById('toastText');
  if (!t) return;
  if (tx) tx.textContent = text || 'Готово';
  t.classList.add('on');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(function () { t.classList.remove('on'); }, 2500);
}

function saveRecent(id) {
  try {
    var list = JSON.parse(localStorage.getItem('jimon_recent') || '[]');
    list = [id].concat(list.filter(function (x) { return x !== id; })).slice(0, 6);
    localStorage.setItem('jimon_recent', JSON.stringify(list));
  } catch (e) {}
}

function getRecentIds() {
  try { return JSON.parse(localStorage.getItem('jimon_recent') || '[]'); } catch (e) { return []; }
}

function openOrderModal(productName) {
  var modal = document.getElementById('orderModal');
  var label = document.getElementById('orderProductLabel');
  if (!modal) return;
  if (productName && label) {
    label.textContent = productName;
    label.classList.add('on');
  } else if (label) {
    label.textContent = '';
    label.classList.remove('on');
  }
  modal.classList.add('on');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  var modal = document.getElementById('orderModal');
  if (!modal) return;
  modal.classList.remove('on');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openProductModal(id) {
  var p = (window.JIMON_PRODUCTS || []).find(function (x) { return x.id === id; });
  if (!p) return;
  var modal = document.getElementById('productModal');
  if (!modal) {
    location.href = 'product.html?id=' + encodeURIComponent(id);
    return;
  }
  saveRecent(id);
  fillProductIntoModal(p);
  modal.classList.add('on');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  var modal = document.getElementById('productModal');
  if (!modal) return;
  modal.classList.remove('on');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function fillProductIntoModal(p) {
  var el;
  el = document.getElementById('pmCat'); if (el) el.textContent = p.badge || p.catName || '';
  el = document.getElementById('pmTitle'); if (el) el.textContent = p.title || '';
  el = document.getElementById('pmDesc'); if (el) el.textContent = p.desc || '';
  el = document.getElementById('pmPrice'); if (el) el.textContent = (p.price || 0).toLocaleString('ru-RU') + ' ₽';

  var oldEl = document.getElementById('pmOldPrice');
  if (oldEl) {
    if (p.oldPrice) {
      oldEl.textContent = p.oldPrice.toLocaleString('ru-RU') + ' ₽';
      oldEl.style.display = '';
    } else {
      oldEl.textContent = '';
      oldEl.style.display = 'none';
    }
  }

  var ratingEl = document.getElementById('pmRating');
  if (ratingEl) {
    ratingEl.innerHTML = p.rating
      ? '<span class="stars">' + starsStr(p.rating) + '</span> <span>' + p.rating + (p.reviews ? ' · ' + p.reviews + ' отзывов' : '') + '</span>'
      : '';
  }

  var imgBox = document.getElementById('pmImg');
  if (imgBox) {
    imgBox.innerHTML = p.img
      ? '<img src="' + p.img + '" alt="' + (p.title || '') + '">'
      : '<div style="font-size:4rem;text-align:center;padding:40px">' + (p.emoji || '🌿') + '</div>';
  }

  var facts = [];
  if (p.volume) facts.push({ ic: '📦', label: 'Объём', value: p.volume });
  if (p.course) facts.push({ ic: '⏱️', label: 'Курс', value: p.course });
  if (p.natural) facts.push({ ic: '🌿', label: 'Состав', value: p.natural });
  var quick = document.getElementById('pmQuick');
  if (quick) {
    quick.innerHTML = facts.map(function (f) {
      return '<div class="qi"><div class="ic">' + f.ic + '</div><div class="label">' + f.label + '</div><div class="value">' + f.value + '</div></div>';
    }).join('');
  }

  var descHtml = '<p>' + (p.fullDescription || p.desc || '') + '</p>';
  if (p.warnings) descHtml += '<p class="tab-warning">' + p.warnings + '</p>';
  el = document.getElementById('tab-desc'); if (el) el.innerHTML = descHtml;

  var comp = p.composition || [];
  el = document.getElementById('tab-composition');
  if (el) {
    el.innerHTML = comp.length
      ? '<ul class="comp-list">' + comp.map(function (c) { return '<li><strong>' + c.n + '</strong> — ' + c.d + '</li>'; }).join('') + '</ul>'
      : '<p>Состав уточняется.</p>';
  }

  var ind = p.indications || [];
  el = document.getElementById('tab-indications');
  if (el) {
    el.innerHTML = ind.length
      ? '<div class="indic-grid">' + ind.map(function (i) {
          return '<div class="indic-card"><div class="ic">' + (i.ic || '✦') + '</div><div><strong>' + i.t + '</strong><p>' + i.d + '</p></div></div>';
        }).join('') + '</div>'
      : '<p>Показания уточняются.</p>';
  }

  var app = p.application || {};
  var appHtml = '';
  if (app.dosage) appHtml += '<p><strong>Дозировка:</strong> ' + app.dosage + '</p>';
  if (app.method) appHtml += '<p><strong>Способ:</strong> ' + app.method + '</p>';
  if (app.time) appHtml += '<p><strong>Время:</strong> ' + app.time + '</p>';
  if (app.course) appHtml += '<p><strong>Курс:</strong> ' + app.course + '</p>';
  if (app.highlight) appHtml += '<p><em>' + app.highlight + '</em></p>';
  if (app.steps && app.steps.length) {
    appHtml += '<ol class="steps-list">' + app.steps.map(function (s) {
      return '<li><strong>' + s.t + '</strong> — ' + s.d + '</li>';
    }).join('') + '</ol>';
  }
  el = document.getElementById('tab-application');
  if (el) el.innerHTML = appHtml || '<p>Применение по инструкции на упаковке.</p>';

  var res = p.results || [];
  var eff = p.effects || [];
  var resHtml = '';
  if (res.length) {
    resHtml += '<div class="indic-grid">' + res.map(function (r) {
      return '<div class="indic-card"><div class="ic">' + (r.ic || '✨') + '</div><div><strong>' + r.t + '</strong><p>' + r.d + '</p></div></div>';
    }).join('') + '</div>';
  }
  if (eff.length) {
    resHtml += '<div class="effects-tags" style="margin-top:16px">' + eff.map(function (e) {
      return '<span class="effect-tag">' + e + '</span>';
    }).join('') + '</div>';
  }
  el = document.getElementById('tab-results');
  if (el) el.innerHTML = resHtml || '<p>Результаты уточняются.</p>';

  var combos = p.combinations || [];
  el = document.getElementById('tab-combos');
  if (el) {
    el.innerHTML = combos.length
      ? '<div class="combos-grid">' + combos.map(function (c, i) {
          return '<div class="combo-card"><div class="combo-num">' + (i + 1) + '</div><h4>' + c.title + '</h4><div class="combo-prods">' + c.products + '</div><p>' + c.desc + '</p></div>';
        }).join('') + '</div>'
      : '<p>Рекомендуемые сочетания уточняются.</p>';
  }

  var modal = document.getElementById('productModal');
  if (modal) {
    modal.querySelectorAll('.tabs__btn').forEach(function (b, i) { b.classList.toggle('active', i === 0); });
    modal.querySelectorAll('.tabs__content').forEach(function (c, i) { c.classList.toggle('active', i === 0); });
  }

  var orderBtn = document.getElementById('pmOrderBtn');
  if (orderBtn) {
    orderBtn.onclick = function () {
      closeProductModal();
      openOrderModal(p.title);
    };
  }
  var share = document.getElementById('pmShareLink');
  if (share) share.href = 'product.html?id=' + encodeURIComponent(p.id);
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderProductPage() {
  var root = document.getElementById('productPageRoot');
  if (!root) return;
  var params = new URLSearchParams(location.search);
  var id = params.get('id');
  var p = (window.JIMON_PRODUCTS || []).find(function (x) { return x.id === id; });
  if (!p) {
    root.innerHTML = '<p style="text-align:center;padding:40px">Товар не найден. <a href="catalog.html">В каталог</a></p>';
    return;
  }
  saveRecent(p.id);
  document.title = p.title + ' — JIMON GROUP';
  var crumb = document.getElementById('crumbProduct');
  if (crumb) crumb.textContent = p.title;

  var rating = p.rating
    ? '<div class="product-modal__rating"><span class="stars">' + starsStr(p.rating) + '</span> <span>' + p.rating + (p.reviews ? ' · ' + p.reviews + ' отзывов' : '') + '</span></div>'
    : '';
  var old = p.oldPrice ? '<span class="product-modal__oldprice">' + p.oldPrice.toLocaleString('ru-RU') + ' ₽</span>' : '';
  var img = p.img
    ? '<img src="' + p.img + '" alt="' + escapeAttr(p.title) + '">'
    : '<div style="font-size:4rem">' + (p.emoji || '🌿') + '</div>';

  root.innerHTML =
    '<div class="product-page__grid">' +
      '<div class="product-page__img">' + img + '</div>' +
      '<div class="product-page__info">' +
        '<span class="product-modal__cat">' + escapeHtml(p.badge || p.catName || '') + '</span>' +
        '<h1>' + escapeHtml(p.title) + '</h1>' +
        rating +
        '<p class="product-modal__desc">' + escapeHtml(p.desc || '') + '</p>' +
        '<div class="product-modal__price-row"><div class="product-modal__price">' + (p.price || 0).toLocaleString('ru-RU') + ' ₽</div>' + old + '</div>' +
        '<div class="product-modal__actions">' +
          '<button type="button" class="btn btn-primary" id="ppOrderBtn">Заказать</button>' +
          '<a class="btn btn-outline-green" href="catalog.html">В каталог</a>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="product-modal__tabs" style="margin-top:32px">' +
      '<div class="tabs__nav">' +
        '<button type="button" class="tabs__btn active" data-tab="desc">Описание</button>' +
        '<button type="button" class="tabs__btn" data-tab="composition">Состав</button>' +
        '<button type="button" class="tabs__btn" data-tab="indications">Показания</button>' +
        '<button type="button" class="tabs__btn" data-tab="application">Применение</button>' +
        '<button type="button" class="tabs__btn" data-tab="results">Результаты</button>' +
        '<button type="button" class="tabs__btn" data-tab="combos">Сочетания</button>' +
      '</div>' +
      '<div class="tabs__content active" id="pp-desc"></div>' +
      '<div class="tabs__content" id="pp-composition"></div>' +
      '<div class="tabs__content" id="pp-indications"></div>' +
      '<div class="tabs__content" id="pp-application"></div>' +
      '<div class="tabs__content" id="pp-results"></div>' +
      '<div class="tabs__content" id="pp-combos"></div>' +
    '</div>';

  var orderBtn = document.getElementById('ppOrderBtn');
  if (orderBtn) {
    orderBtn.addEventListener('click', function () { openOrderModal(p.title); });
  }

  document.getElementById('pp-desc').innerHTML =
    '<p>' + escapeHtml(p.fullDescription || p.desc || '') + '</p>' +
    (p.warnings ? '<p class="tab-warning">' + escapeHtml(p.warnings) + '</p>' : '');

  var comp = p.composition || [];
  document.getElementById('pp-composition').innerHTML = comp.length
    ? '<ul class="comp-list">' + comp.map(function (c) {
        return '<li><strong>' + escapeHtml(c.n) + '</strong> — ' + escapeHtml(c.d) + '</li>';
      }).join('') + '</ul>'
    : '<p>Состав уточняется.</p>';

  var ind = p.indications || [];
  document.getElementById('pp-indications').innerHTML = ind.length
    ? '<div class="indic-grid">' + ind.map(function (i) {
        return '<div class="indic-card"><div class="ic">' + (i.ic || '✦') + '</div><div><strong>' + escapeHtml(i.t) + '</strong><p>' + escapeHtml(i.d) + '</p></div></div>';
      }).join('') + '</div>'
    : '<p>Показания уточняются.</p>';

  var app = p.application || {};
  var appHtml = '';
  if (app.dosage) appHtml += '<p><strong>Дозировка:</strong> ' + escapeHtml(app.dosage) + '</p>';
  if (app.method) appHtml += '<p><strong>Способ:</strong> ' + escapeHtml(app.method) + '</p>';
  if (app.time) appHtml += '<p><strong>Время:</strong> ' + escapeHtml(app.time) + '</p>';
  if (app.course) appHtml += '<p><strong>Курс:</strong> ' + escapeHtml(app.course) + '</p>';
  if (app.steps && app.steps.length) {
    appHtml += '<ol class="steps-list">' + app.steps.map(function (s) {
      return '<li><strong>' + escapeHtml(s.t) + '</strong> — ' + escapeHtml(s.d) + '</li>';
    }).join('') + '</ol>';
  }
  document.getElementById('pp-application').innerHTML = appHtml || '<p>Применение по инструкции на упаковке.</p>';

  var res = p.results || [];
  var eff = p.effects || [];
  var resHtml = '';
  if (res.length) {
    resHtml += '<div class="indic-grid">' + res.map(function (r) {
      return '<div class="indic-card"><div class="ic">' + (r.ic || '✨') + '</div><div><strong>' + escapeHtml(r.t) + '</strong><p>' + escapeHtml(r.d) + '</p></div></div>';
    }).join('') + '</div>';
  }
  if (eff.length) {
    resHtml += '<div class="effects-tags" style="margin-top:16px">' + eff.map(function (e) {
      return '<span class="effect-tag">' + escapeHtml(e) + '</span>';
    }).join('') + '</div>';
  }
  document.getElementById('pp-results').innerHTML = resHtml || '<p>Результаты уточняются.</p>';

  var combos = p.combinations || [];
  document.getElementById('pp-combos').innerHTML = combos.length
    ? '<div class="combos-grid">' + combos.map(function (c, i) {
        return '<div class="combo-card"><div class="combo-num">' + (i + 1) + '</div><h4>' + escapeHtml(c.title) + '</h4><div class="combo-prods">' + escapeHtml(c.products) + '</div><p>' + escapeHtml(c.desc) + '</p></div>';
      }).join('') + '</div>'
    : '<p>Рекомендуемые сочетания уточняются.</p>';
}

function renderRecent() {
  var block = document.getElementById('recentBlock');
  var grid = document.getElementById('recentGrid');
  if (!block || !grid) return;
  var ids = getRecentIds();
  var items = ids.map(function (id) {
    return (window.JIMON_PRODUCTS || []).find(function (p) { return p.id === id; });
  }).filter(Boolean);
  if (!items.length) {
    block.style.display = 'none';
    return;
  }
  block.style.display = '';
  grid.innerHTML = items.map(function (p) {
    var img = p.img ? '<img src="' + p.img + '" alt="' + escapeAttr(p.title) + '" loading="lazy">' : '';
    return (
      '<article class="product-card">' +
        '<div class="product-image">' + img + '</div>' +
        '<div class="product-info">' +
          '<h3 class="product-title">' + escapeHtml(p.title) + '</h3>' +
          '<div class="product-meta"><span class="product-series">' + (p.price || 0).toLocaleString('ru-RU') + ' ₽</span></div>' +
          '<div class="product-actions">' +
            '<a class="btn btn-sm btn-outline-green" href="product.html?id=' + encodeURIComponent(p.id) + '">Подробнее</a>' +
            '<button type="button" class="btn btn-sm" data-order="' + escapeAttr(p.title) + '">Заказать</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');

  grid.querySelectorAll('[data-order]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openOrderModal(btn.getAttribute('data-order'));
    });
  });
}

function applyCatalog() {
  var grid = document.getElementById('products-grid');
  if (!grid) return;
  var empty = document.getElementById('catalogEmpty');
  var moreBtn = document.getElementById('catalogMoreBtn');
  var moreInfo = document.getElementById('catalogMoreInfo');
  var wrap = document.getElementById('catalogMoreWrap');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
  var filter = catalogState.filter;
  var q = catalogState.q;
  var sort = catalogState.sort;

  var matched = cards.filter(function (card) {
    var cat = card.getAttribute('data-category');
    var blob = (card.getAttribute('data-search') || card.getAttribute('data-title') || '').toLowerCase();
    var matchFilter = filter === 'all' || cat === filter;
    var matchSearch = !q || blob.indexOf(q) !== -1;
    return matchFilter && matchSearch;
  });

  if (sort === 'rating') {
    matched.sort(function (a, b) {
      return (parseFloat(b.getAttribute('data-rating')) || 0) - (parseFloat(a.getAttribute('data-rating')) || 0);
    });
  } else if (sort === 'price-asc') {
    matched.sort(function (a, b) {
      return (parseFloat(a.getAttribute('data-price')) || 0) - (parseFloat(b.getAttribute('data-price')) || 0);
    });
  } else if (sort === 'price-desc') {
    matched.sort(function (a, b) {
      return (parseFloat(b.getAttribute('data-price')) || 0) - (parseFloat(a.getAttribute('data-price')) || 0);
    });
  } else if (sort === 'name') {
    matched.sort(function (a, b) {
      return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'ru');
    });
  }

  cards.forEach(function (c) { c.style.display = 'none'; });
  matched.forEach(function (c) { grid.appendChild(c); });

  var total = matched.length;
  var shown = Math.min(catalogState.shown, total);
  matched.forEach(function (c, i) {
    c.style.display = i < shown ? '' : 'none';
  });

  if (empty) empty.style.display = total ? 'none' : 'block';
  if (wrap) wrap.style.display = total > 0 ? '' : 'none';
  if (moreBtn) moreBtn.style.display = shown < total ? '' : 'none';
  if (moreInfo) moreInfo.textContent = total ? ('Показано ' + shown + ' из ' + total) : '';
}

document.addEventListener('click', function (e) {
  var btn = e.target.closest ? e.target.closest('.tabs__btn') : null;
  if (!btn) return;
  var root = btn.closest('.product-modal__tabs');
  if (!root) return;
  var tab = btn.getAttribute('data-tab');
  root.querySelectorAll('.tabs__btn').forEach(function (b) {
    b.classList.toggle('active', b === btn);
  });
  root.querySelectorAll('.tabs__content').forEach(function (c) {
    var id = c.id || '';
    var key = id.replace(/^pp-/, '').replace(/^tab-/, '');
    c.classList.toggle('active', key === tab);
  });
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeOrderModal();
    closeProductModal();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var navbar = document.getElementById('navbar');
  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var burger = document.getElementById('burger');
  if (burger && navbar) {
    burger.addEventListener('click', function () {
      navbar.classList.toggle('open');
    });
  }

  document.querySelectorAll('.stat-num[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var cur = 0;
    var step = Math.max(1, Math.floor(target / 40));
    var tick = function () {
      cur = Math.min(target, cur + step);
      el.textContent = String(cur);
      if (cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  var searchInput = document.getElementById('catalogSearch');
  var sortSelect = document.getElementById('catalogSort');
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      catalogState.filter = btn.getAttribute('data-filter') || 'all';
      catalogState.shown = PAGE_SIZE;
      applyCatalog();
    });
  });
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      catalogState.q = (searchInput.value || '').trim().toLowerCase();
      catalogState.shown = PAGE_SIZE;
      applyCatalog();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      catalogState.sort = sortSelect.value || 'default';
      applyCatalog();
    });
  }
  var moreBtn = document.getElementById('catalogMoreBtn');
  if (moreBtn) {
    moreBtn.addEventListener('click', function () {
      catalogState.shown += PAGE_SIZE;
      applyCatalog();
    });
  }
  if (document.getElementById('products-grid')) applyCatalog();

  var totop = document.getElementById('totop');
  if (totop) {
    window.addEventListener('scroll', function () {
      totop.classList.toggle('on', window.scrollY > 400);
    }, { passive: true });
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Заявка принята! Мы свяжемся с вами.');
      form.reset();
    });
  }

  renderProductPage();
  renderRecent();

  document.querySelectorAll('img.img-fade').forEach(function (img) {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', function () { img.classList.add('loaded'); });
  });
});












/* CARD WAVE ANIMATION — как в jimon.css / jimon.js (v27)
   • карточки товаров: prodWaveIn, задержки .1s + .2s·n для первых 8 (дальше без задержки)
   • «Направления»: подъём 50px + scale(.9), .8s, шаг .1s
   • карточки скрыты до старта анимации, запуск когда заголовок секции виден
   • при фильтре / поиске / сортировке / «показать ещё» волна играет заново */
(function () {
  if (!('IntersectionObserver' in window)) return;

  var GRIDS = [
    { grid: '.products-grid', item: '.product-card', anim: 'prodWaveIn',
      delay: function (i) { return i < 8 ? 0.1 + 0.2 * i : 0; } },
    { grid: '.about-grid', item: '.about-card', anim: 'catRiseT',
      delay: function (i) { return 0.1 * (i + 1); } }
  ];

  function visible(c) {
    return c.style.display !== 'none' && !c.classList.contains('hidden');
  }

  function hide(grid, cfg) {
    grid.querySelectorAll(cfg.item).forEach(function (c) {
      c.classList.remove('wave-in', 'waved');
      c.classList.add('wave-pre');
      c.style.removeProperty('--d');
    });
  }

  function play(grid, cfg) {
    var items = Array.prototype.slice.call(grid.querySelectorAll(cfg.item)).filter(visible);
    items.forEach(function (card, i) {
      card.style.setProperty('--d', cfg.delay(i).toFixed(2) + 's');
      card.classList.remove('wave-pre', 'waved', 'wave-in');
      void card.offsetWidth;
      card.classList.add('wave-in');
      function end(e) {
        if (e.target !== card || e.animationName !== cfg.anim) return;
        card.removeEventListener('animationend', end);
        card.classList.remove('wave-in');
        card.classList.add('waved');
      }
      card.addEventListener('animationend', end);
    });
  }

  function replay(grid, cfg) {
    hide(grid, cfg);
    setTimeout(function () { play(grid, cfg); }, 80);
  }

  function arm(grid, cfg) {
    hide(grid, cfg);
    var section = grid.closest('section');
    var head = section && section.querySelector('.section-header, .catalog-head');
    var target = head || grid;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (target.getBoundingClientRect().top < vh) {
      setTimeout(function () { play(grid, cfg); }, 80);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.disconnect(); play(grid, cfg); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -15% 0px' });
    io.observe(target);
  }

  function boot() {
    GRIDS.forEach(function (cfg) {
      document.querySelectorAll(cfg.grid).forEach(function (g) { arm(g, cfg); });
    });
    document.querySelectorAll('.product-card').forEach(function (card) {
      if (card.dataset.tapBound) return;
      card.dataset.tapBound = '1';
      card.addEventListener('touchstart', function () {
        card.classList.add('product-card--tap');
      }, { passive: true });
      card.addEventListener('touchend', function () {
        setTimeout(function () { card.classList.remove('product-card--tap'); }, 280);
      }, { passive: true });
    });
  }

  // скрываем карточки сразу, пока страница ещё не отрисована
  if (document.querySelector('.products-grid, .about-grid') || document.readyState !== 'loading') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }

  // каталог: фильтр / поиск / сортировка / «показать ещё» → волна заново
  if (typeof applyCatalog === 'function' && !applyCatalog._fanWrap) {
    var prev = applyCatalog;
    window.applyCatalog = function () {
      prev.apply(this, arguments);
      document.querySelectorAll('.products-grid').forEach(function (g) {
        replay(g, GRIDS[0]);
      });
    };
    window.applyCatalog._fanWrap = true;
  }
})();
/* END CARD WAVE */

/* v25 · ПОЯВЛЕНИЕ БЛОКОВ ПРИ ПРОКРУТКЕ (reveal) */
(function () {
  if (!('IntersectionObserver' in window)) return;

  function init() {
    var els = document.querySelectorAll('.section-header, .fact-card, .president, .faq-list details');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        el.classList.add('on');
        var wait = parseFloat(el.style.getPropertyValue('--rd')) || 0;
        // после показа возвращаем элементу обычные стили, чтобы не мешать hover
        setTimeout(function () {
          el.classList.remove('reveal', 'on');
          el.style.removeProperty('--rd');
        }, wait * 1000 + 1000);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) {
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--rd', (Math.min(idx, 5) * 0.08).toFixed(2) + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

