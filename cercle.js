document.documentElement.classList.add('js');

// Apparition au scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// En-tête et parallaxe légère du héros
const top = document.querySelector('.top');
const par = document.querySelector('[data-parallax]');
const onScroll = () => {
  const y = window.scrollY;
  top.classList.toggle('scrolled', y > 40);
  if (par && y < window.innerHeight * 1.2) par.style.transform = `translateY(${y * Number(par.dataset.parallax)}px)`;
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// « Réserver un échange » présélectionne l'échange dans le formulaire
document.querySelectorAll('[data-intent]').forEach((a) =>
  a.addEventListener('click', () => {
    const r = document.querySelector(`input[name="intent"][value="${a.dataset.intent}"]`);
    if (r) { r.checked = true; sync(); }
  })
);
document.querySelectorAll('a[href="#travailler"]').forEach((a) =>
  a.addEventListener('click', () => {
    const r = document.querySelector('input[name="intent"][value="echange"]');
    if (r) { r.checked = true; sync(); }
  })
);

// Formulaire → message WhatsApp prêt à envoyer
const NUMBERS = { boris: '33782988589', kevin: '33781270587' };
const NAMES = { boris: 'Boris', kevin: 'Kévin' };
const form = document.getElementById('form');
const err = form.querySelector('.form-error');
const sync = () => {
  const cercle = form.intent.value === 'cercle';
  form.querySelectorAll('.cercle-only').forEach((el) => (el.style.display = cercle ? '' : 'none'));
};
form.querySelectorAll('input[name="intent"]').forEach((r) => r.addEventListener('change', sync));
sync();

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const v = (n) => (form[n] && form[n].value ? form[n].value.trim() : '');
  const cercle = form.intent.value === 'cercle';
  const missing = ['nom', 'profil', 'activite', 'tache'].filter((n) => !v(n));
  if (missing.length) { err.textContent = 'Merci de remplir ton nom, ton profil, ton activité et ce que tu veux confier à l’IA.'; return; }
  if (cercle && !form.engage.checked) { err.textContent = 'Pour rejoindre le Cercle, coche l’engagement à partager où tu en es.'; return; }
  err.textContent = '';
  const to = form.to.value;
  const lines = [
    `Bonjour ${NAMES[to]}, ${cercle ? 'je souhaite rejoindre le Cercle IA Business.' : 'je souhaite réserver un échange découverte.'}`,
    '',
    `Nom : ${v('nom')}`,
    `Profil : ${v('profil')}`,
    `Activité / rôle : ${v('activite')}`,
    v('equipe') && `Équipe : ${v('equipe')}`,
    `Ce que j’aimerais confier à l’IA : ${v('tache')}`,
    v('invest') && `Déjà investi dans un outil, une formation ou un prestataire : ${v('invest')}`,
    cercle && 'Je m’engage à partager où j’en suis dans le Cercle.',
  ].filter((l) => l !== false && l !== '' || l === '');
  const text = lines.filter((l, i) => l || (i === 1)).join('\n');
  window.open(`https://wa.me/${NUMBERS[to]}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
