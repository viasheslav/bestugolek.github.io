const header = document.getElementById('header');
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const mobile = matchMedia('(max-width: 860px)');
function setMenu(open, restoreFocus = false) {
  document.body.classList.toggle('menu-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.inert = mobile.matches && !open;
  if (open) nav.querySelector('a').focus({ preventScroll: true });
  else if (restoreFocus) burger.focus();
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
// Safari before 14 supports only the legacy MediaQueryList listener API.
if (typeof mobile.addEventListener === 'function') {
  mobile.addEventListener('change', () => setMenu(false));
} else if (typeof mobile.addListener === 'function') {
  mobile.addListener(() => setMenu(false));
}
setMenu(false);
document.body.classList.add('menu-ready');
addEventListener('pageshow', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (burger.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') setMenu(false, true);
  if (event.key === 'Tab') {
    const links = [...nav.querySelectorAll('a'), burger];
    const index = links.indexOf(document.activeElement);
    if (event.shiftKey && index === 0) { event.preventDefault(); burger.focus(); }
    else if (!event.shiftKey && index === links.length - 1) { event.preventDefault(); links[0].focus(); }
  }
});
const updateHeader = () => header.classList.toggle('scrolled', scrollY > 40);
addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('.faq-q').forEach((button, index) => {
  const answer = button.nextElementSibling;
  answer.id = `answer-${index}`;
  button.id = `question-${index}`;
  button.setAttribute('aria-controls', answer.id);
  button.setAttribute('aria-expanded', 'false');
  answer.setAttribute('aria-labelledby', button.id);
  answer.hidden = true;
  button.querySelector('.pm').setAttribute('aria-hidden', 'true');
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.parentElement.classList.toggle('open', open);
    answer.hidden = !open;
  });
});

document.querySelectorAll('[data-interest]').forEach(button => button.addEventListener('click', () => {
  document.getElementById('interest').value = button.dataset.interest;
  // Product requests retain their context in the submitted message.
  const card = button.closest('.pcard');
  const message = document.getElementById('msg');
  if (card && !message.value.trim()) message.value = `Интересует: ${card.querySelector('h3').textContent.trim()}. `;
}));

const form = document.getElementById('leadForm');
form.addEventListener('submit', async event => {
  event.preventDefault();
  const phone = document.getElementById('phone');
  phone.setCustomValidity(phone.value.replace(/\D/g, '').length < 10 ? 'Введите телефон, содержащий не менее 10 цифр.' : '');
  if (!form.reportValidity() || form.getAttribute('aria-busy') === 'true') return;
  const button = form.querySelector('[type="submit"]');
  const error = document.getElementById('formError');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  error.hidden = true;
  form.setAttribute('aria-busy', 'true');
  button.disabled = true;
  button.textContent = 'Отправляем…';
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Submission failed');
    form.hidden = true;
    const success = document.getElementById('formSuccess');
    success.style.display = 'block';
    success.focus();
  } catch {
    error.textContent = 'Не удалось подтвердить отправку. Повторите попытку или свяжитесь с нами по телефону из раздела контактов.';
    error.hidden = false;
  } finally {
    clearTimeout(timeout);
    form.removeAttribute('aria-busy');
    button.disabled = false;
    button.textContent = 'Отправить заявку';
  }
});
document.getElementById('phone').addEventListener('input', event => event.target.setCustomValidity(''));
document.getElementById('year').textContent = new Date().getFullYear();
