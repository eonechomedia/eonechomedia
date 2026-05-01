const imageSets = [
  {
    mid: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=520&q=80&auto=format&fit=crop",
    midLabel: "Print editorial",
    front: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=520&q=80&auto=format&fit=crop",
    frontLabel: "Digital content"
  },
  {
    mid: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=520&q=80&auto=format&fit=crop",
    midLabel: "Brand campaigns",
    front: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=520&q=80&auto=format&fit=crop",
    frontLabel: "Content strategy"
  },
  {
    mid: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=520&q=80&auto=format&fit=crop",
    midLabel: "Magazine production",
    front: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=520&q=80&auto=format&fit=crop",
    frontLabel: "Editorial writing"
  }
];

let imgIdx = 0;
const midCard = document.querySelector('.card-mid');
const frontCard = document.querySelector('.card-front');

function cycleImages() {
  if (!midCard || !frontCard) return;

  imgIdx = (imgIdx + 1) % imageSets.length;
  const set = imageSets[imgIdx];

  [midCard, frontCard].forEach(card => {
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.5s ease';
  });

  setTimeout(() => {
    const midImg = midCard.querySelector('img');
    const midLabel = midCard.querySelector('.card-label');
    if (midImg) {
      midImg.src = set.mid;
      midImg.alt = set.midLabel;
    }
    if (midLabel) midLabel.textContent = set.midLabel;

    const frontImg = frontCard.querySelector('img');
    const frontLabel = frontCard.querySelector('.card-label');
    if (frontImg) {
      frontImg.src = set.front;
      frontImg.alt = set.frontLabel;
    }
    if (frontLabel) frontLabel.textContent = set.frontLabel;

    [midCard, frontCard].forEach(card => {
      card.style.opacity = '1';
    });
  }, 500);
}

setInterval(cycleImages, 4000);

const heroRight = document.querySelector('.hero-right');
const cardsWrap = document.querySelector('.cards-wrap');

if (heroRight && cardsWrap) {
  heroRight.addEventListener('mousemove', (e) => {
    const rect = heroRight.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    cardsWrap.style.transform = `rotateX(${6 - cy * 8}deg) rotateY(${-10 + cx * 12}deg)`;
    cardsWrap.style.transition = 'transform 0.1s ease';
  });

  heroRight.addEventListener('mouseleave', () => {
    cardsWrap.style.transform = '';
    cardsWrap.style.transition = 'transform 0.8s ease';
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;

  Object.assign(toast.style, {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    background: 'rgba(0,0,0,0.85)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    zIndex: 9999,
    opacity: '0',
    transition: 'opacity .18s'
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = '1');

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 220);
  }, 1600);
}

function sendPrompt(promptText) {
  try {
    const email = 'hello@eonechomedia.com';
    const subject = encodeURIComponent(promptText);
    const body = encodeURIComponent(promptText + '\n\nPlease get back to me.');
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });

    showToast('Opening email client...');
  } catch (e) {
    console.error('sendPrompt error', e);
  }
}

(function setupNicheMore() {
  const nicheMore = document.querySelector('.niche-more');
  const nicheGrid = document.querySelector('.niche-grid');
  if (!nicheMore || !nicheGrid) return;

  const extraNiches = [
    {
      bg: 'var(--sky-light)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#2A6B8A" stroke-width="1.8"><path d="M5 12h14"/></svg>',
      name: 'Sports & Fitness',
      sub: 'Campaigns, athlete stories'
    },
    {
      bg: 'var(--rose-light)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#8A3A4A" stroke-width="1.8"><path d="M12 2l3 7h7l-5.5 4 2 7L12 18l-6.5 5 2-7L2 9h7z"/></svg>',
      name: 'Beauty & Wellness',
      sub: 'Product storytelling, features'
    },
    {
      bg: 'var(--lavender-light)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#5A3A8A" stroke-width="1.8"><rect x="3" y="3" width="18" height="12" rx="2"/></svg>',
      name: 'Enterprise & B2B',
      sub: 'Research, whitepapers, GTM'
    },
    {
      bg: 'var(--peach-light)',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8"><path d="M3 12h18"/></svg>',
      name: 'Automotive',
      sub: 'Product launches, reviews'
    }
  ];

  let expanded = false;
  let insertedNodes = [];

  nicheMore.style.cursor = 'pointer';

  nicheMore.addEventListener('click', () => {
    if (!expanded) {
      extraNiches.forEach(n => {
        const div = document.createElement('div');
        div.className = 'niche-tile';
        div.style.background = n.bg;
        div.innerHTML = `
          <div class="niche-icon">${n.icon}</div>
          <div class="niche-name">${n.name}</div>
          <div class="niche-sub">${n.sub}</div>
        `;
        nicheGrid.insertBefore(div, nicheMore);
        insertedNodes.push(div);
      });

      nicheMore.querySelector('.niche-more-num').textContent = '−';
      nicheMore.querySelector('.niche-more-label').textContent = 'show fewer';
      expanded = true;
    } else {
      insertedNodes.forEach(node => node.remove());
      insertedNodes = [];
      nicheMore.querySelector('.niche-more-num').textContent = '+4';
      nicheMore.querySelector('.niche-more-label').textContent = 'more niches';
      expanded = false;
    }
  });
})();

function connectInstagram(instaId) {
  try {
    const url = `https://instagram.com/${encodeURIComponent(instaId)}`;
    window.open(url, '_blank', 'noopener');
    showToast('Opening Instagram...');
  } catch (e) {
    console.error('connectInstagram error', e);
  }
}

function showContactOptions() {
  if (document.getElementById('contact-modal-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'contact-modal-overlay';

  Object.assign(overlay.style, {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  });

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    width: 'min(520px,92vw)',
    background: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
    color: 'var(--ink)',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  });

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <div>
        <div style="font-family:'Cormorant Garamond', serif;font-size:20px;font-weight:600;">Get in touch</div>
        <div style="font-size:13px;color:var(--muted);margin-top:4px;">Prefer Instagram? Tap the big button or email us directly.</div>
      </div>
      <button id="contact-modal-close" aria-label="Close" style="background:transparent;border:none;font-size:20px;cursor:pointer;color:var(--muted);">×</button>
    </div>

    <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px;">
     <button id="modal-insta" style="border:none;padding:14px 18px;border-radius:10px;font-weight:600;cursor:pointer;font-size:15px;" class="instagram-btn">
        Follow @eonechomedia on Instagram
        </button>

      <button id="modal-email" style="background:var(--ink);color:#fff;border:none;padding:12px 16px;border-radius:10px;font-weight:600;cursor:pointer;font-size:14px;">
        Email us — start a project
      </button>

      <button id="modal-contact-page" style="background:transparent;border:1px solid var(--border);padding:10px 12px;border-radius:10px;cursor:pointer;">
        View contact section
      </button>
    </div>
  `;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  document.getElementById('contact-modal-close').addEventListener('click', () => overlay.remove());

  document.getElementById('modal-contact-page').addEventListener('click', () => {
    overlay.remove();
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('modal-email').addEventListener('click', () => {
    overlay.remove();
    sendPrompt('I want to work with Eon Echo Media — how do we start?');
  });

  document.getElementById('modal-insta').addEventListener('click', () => {
    overlay.remove();
    connectInstagram('eonechomedia');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}