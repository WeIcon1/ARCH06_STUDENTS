const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');

themeToggle.addEventListener('click', () => {
  const dark = root.dataset.theme !== 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.textContent = dark ? '☀️ Светлая тема' : '🌙 Сменить тему';
});

const dialog = document.querySelector('#settings-dialog');
let dialogTrigger;
for (const trigger of document.querySelectorAll('#open-dialog, [data-open-dialog]')) {
  trigger.addEventListener('click', () => {
    dialogTrigger = trigger;
    dialog.showModal();
  });
}
dialog.addEventListener('close', () => {
  dialogTrigger?.focus({ preventScroll: true });
});

const form = document.querySelector('#demo-form');
const fields = [...form.querySelectorAll('input[required]')];
const formFeedback = document.querySelector('#form-feedback');

function validate(input) {
  const invalid = !input.validity.valid || !input.value.trim();
  const hint = input.parentElement.querySelector('.ui-field__hint');
  const error = input.parentElement.querySelector('.ui-field__error');

  input.setAttribute('aria-invalid', String(invalid));
  input.setAttribute('aria-describedby', invalid ? `${hint.id} ${error.id}` : hint.id);
  error.hidden = !invalid;
  return !invalid;
}

for (const input of fields) {
  input.addEventListener('blur', () => validate(input));
  input.addEventListener('input', () => {
    formFeedback.textContent = '';
    if (input.hasAttribute('aria-invalid')) validate(input);
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const invalidFields = fields.filter(input => !validate(input));
  formFeedback.textContent = invalidFields.length
    ? 'Исправьте отмеченные поля.'
    : 'Данные прошли проверку.';
  invalidFields[0]?.focus();
});

const alerts = document.querySelector('.alerts-stack');
const restoreAlerts = document.querySelector('#restore-alerts');
const initialAlerts = Array.from(alerts.children, alert => alert.cloneNode(true));

alerts.addEventListener('click', event => {
  const dismiss = event.target.closest('.ui-alert__dismiss');
  if (!dismiss) return;
  const alert = dismiss.closest('.ui-alert');
  const neighbor = alert.nextElementSibling ?? alert.previousElementSibling;
  alert.remove();
  (neighbor?.querySelector('.ui-alert__dismiss') ?? restoreAlerts).focus();
});

restoreAlerts.addEventListener('click', () => {
  alerts.replaceChildren(...initialAlerts.map(alert => alert.cloneNode(true)));
});

for (const input of document.querySelectorAll('.ui-switch input')) {
  input.addEventListener('change', () => {
    const name = input.closest('.ui-switch').querySelector('.ui-switch__label').textContent;
    document.querySelector('#switch-feedback').textContent =
      `${name}: ${input.checked ? 'включено' : 'выключено'}`;
  });
}

const legacyAction = document.querySelector('.legacy-action');
const legacyDetails = document.getElementById(legacyAction.getAttribute('aria-controls'));
legacyAction.addEventListener('click', () => {
  legacyDetails.hidden = !legacyDetails.hidden;
  legacyAction.setAttribute('aria-expanded', String(!legacyDetails.hidden));
});
