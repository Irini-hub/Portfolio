document.addEventListener('DOMContentLoaded', () => {
  // ===== Header hide/show on scroll =====
  let lastScrollY = window.scrollY;
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
      if (lastScrollY < window.scrollY && window.scrollY > 100) {
         header.classList.add('hidden');
      } else {
         header.classList.remove('hidden');
      }
      lastScrollY = window.scrollY;document.addEventListener
   });
  
// --- Логика для светового пятна курсора ---
   const spotlight = document.getElementById('cursor-spotlight');
   if (spotlight) { // Проверяем, существует ли элемент
         window.addEventListener('mousemove', (e) => {
            // Обновляем позицию нашего "фонарика"
            spotlight.style.left = e.clientX + 'px';// e.clientX — горизонтальная координата курсора
            spotlight.style.top = e.clientY + 'px';// e.clientY — вертикальная координата курсора
         });
   }

  // ===== Section reveal on scroll =====
  const sections = document.querySelectorAll('.content-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { rootMargin: '0px', threshold: 0.18 });
  sections.forEach(section => observer.observe(section));

  // ===== Tabs / Highlighter logic =====
  const tabs = Array.from(document.querySelectorAll('#experience .tabs-list button'));
  const panels = Array.from(document.querySelectorAll('#experience .tabs-panels [role="tabpanel"]'));
  const highlighter = document.querySelector('#experience .tabs-list .highlighter');

  if (!highlighter || tabs.length === 0) return;

  const BUTTON_HEIGHT = Math.round(parseFloat(getComputedStyle(tabs[0]).height)) || 48;

  const MOVE_MS = 300;
  const TAIL_MS = 180;
  const EASING  = 'cubic-bezier(.2,.9,.2,1)';

  let tailTimer = null;

  function getTranslateY(el) {
      const style = window.getComputedStyle(el);
      const transform = style.transform || style.webkitTransform;
      if (!transform || transform === 'none') return 0;
      const m2 = transform.match(/matrix\(([-0-9.,\s]+)\)/);
      if (m2) return parseFloat(m2[1].split(',')[5]) || 0;
      const m3 = transform.match(/matrix3d\(([-0-9.,\s]+)\)/);
      if (m3) return parseFloat(m3[1].split(',')[13]) || 0;
      return 0;
  }

  function clearTailTimer() {
      if (tailTimer) { clearTimeout(tailTimer); tailTimer = null; }
  }

  function initHighlighter() {
      const activeIndex = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      const idx = activeIndex >= 0 ? activeIndex : 0;
      highlighter.style.transition = 'none';
      highlighter.style.transform = `translateY(${idx * BUTTON_HEIGHT}px)`;
      highlighter.style.height = `${BUTTON_HEIGHT}px`;
      void highlighter.offsetWidth;
  }
  initHighlighter();

  function moveHighlighter(targetIndex) {
    clearTailTimer();

    const currentY = getTranslateY(highlighter);
    const targetY = targetIndex * BUTTON_HEIGHT;
    const delta = targetY - currentY;

    if (Math.round(currentY) === Math.round(targetY)) return;

    void highlighter.offsetWidth;

    if (delta > 0) {
      // ===== ДВИЖЕНИЕ ВНИЗ =====
      highlighter.style.transition = 'none';
      highlighter.style.height = `${BUTTON_HEIGHT + Math.round(delta)}px`;
      highlighter.style.transform = `translateY(${currentY}px)`;
      void highlighter.offsetWidth;
      highlighter.style.transition = `transform ${MOVE_MS}ms ${EASING}, height ${MOVE_MS}ms ${EASING}`;
      highlighter.style.transform = `translateY(${targetY}px)`;
      highlighter.style.height = `${BUTTON_HEIGHT}px`;
      tailTimer = setTimeout(() => {
         highlighter.style.transition = `height ${TAIL_MS}ms ease-out`;
         highlighter.style.height = `${BUTTON_HEIGHT}px`;
         tailTimer = null;
      }, MOVE_MS + 8);
    } else {
      // ===== ДВИЖЕНИЕ ВВЕРХ =====
      const absDelta = Math.abs(Math.round(delta));
      const extra = Math.round(BUTTON_HEIGHT * 0.25); // +25% высоты для хвоста

      // 1) Увеличиваем рамку немного вниз, хвост слегка длиннее
      highlighter.style.transition = 'none';
      highlighter.style.height = `${BUTTON_HEIGHT + extra}px`;
      highlighter.style.transform = `translateY(${currentY}px)`;
      void highlighter.offsetWidth;

      // 2) Двигаем рамку вверх, хвост всё время сохраняет extra-приращение
      highlighter.style.transition = `transform ${MOVE_MS}ms ${EASING}`;
      highlighter.style.transform = `translateY(${targetY}px)`;

      // 3) После достижения позиции убираем extra
      tailTimer = setTimeout(() => {
         highlighter.style.transition = `height ${TAIL_MS}ms ease-out`;
         highlighter.style.height = `${BUTTON_HEIGHT}px`;
         tailTimer = null;
      }, MOVE_MS + 8);
    }
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      panels.forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.classList.remove('hidden');
      moveHighlighter(idx);
    });
  });

  const contactButtons = Array.from(document.querySelectorAll('#contact-menu button'));
  const contactContents = Array.from(document.querySelectorAll('#contact-details .contact-content'));

  contactButtons.forEach(button => {
    button.addEventListener('click', () => {
      contactButtons.forEach(btn => btn.classList.remove('active'));
      contactContents.forEach(content => content.classList.remove('active'));
      const targetId = button.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      button.classList.add('active');
      if (targetContent) targetContent.classList.add('active');
    });
  });
// ===== Логика для показа сертификатов по клику =====
const courseCards = document.querySelectorAll('.course-card');
const overlay = document.getElementById('certificate-overlay');
const overlayImage = document.getElementById('certificate-image');

courseCards.forEach(card => {
   const preview = card.querySelector('.certificate-preview img'); // сразу ищем img
   if (!preview) return;

   // Показываем сертификат по клику на карточку
   card.addEventListener('click', (event) => {
      overlayImage.src = preview.src; // берем src из картинки внутри карточки
      overlay.classList.add('visible');
   });
});

// Закрытие при клике на сам оверлей
overlay.addEventListener('click', () => {
   overlay.classList.remove('visible');
   overlayImage.src = ""; // очистим, чтобы не грузить память
});
window.addEventListener('beforeunload', () => { clearTailTimer(); }); });

//-----Footer-----
const footer = document.querySelector("footer");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
   if (entry.isIntersecting) {
      footer.classList.add("visible");// появляется
    } else {
      footer.classList.remove("visible"); // исчезает
    }
   });
}, { threshold: 0.3 }); // срабатывает, когда футер хотя бы на 30% виден
observer.observe(footer);
