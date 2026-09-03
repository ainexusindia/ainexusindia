/* ============================================================
   AI Nexus India — main.js
   Handles: mobile nav, AI Pulse news loading + filtering,
   and the Nexi assistant (rule-based, fully client-side, no API key).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initPulse();
  initNexi();
});

/* ---------------- Mobile nav ---------------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

/* ---------------- AI Pulse (daily news) ---------------- */
let PULSE_ITEMS = [];
let PULSE_FILTER = 'All';

function initPulse() {
  const grid = document.getElementById('pulse-grid');
  if (!grid) return;

  fetch('assets/data/news.json', { cache: 'no-store' })
    .then(res => {
      if (!res.ok) throw new Error('news fetch failed');
      return res.json();
    })
    .then(data => {
      PULSE_ITEMS = Array.isArray(data.items) ? data.items : [];
      const updatedEl = document.getElementById('pulse-updated');
      if (updatedEl && data.updated) {
        updatedEl.textContent = 'Last updated ' + formatDate(data.updated) + ' \u00B7 refreshes automatically every day';
      }
      renderPulse();
      fillHeroTicker(data);
    })
    .catch(() => {
      grid.innerHTML = '<div class="pulse-error">Today\u2019s feed couldn\u2019t be loaded right now. It refreshes automatically each day \u2014 please check back soon, or visit our <a href="https://www.youtube.com/@AINEXUSINDIA">YouTube channel</a> for the latest updates.</div>';
    });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      PULSE_FILTER = btn.dataset.filter;
      renderPulse();
    });
  });
}

function renderPulse() {
  const grid = document.getElementById('pulse-grid');
  if (!grid) return;
  let items;
  if (PULSE_FILTER === 'All') {
    items = PULSE_ITEMS;
  } else if (PULSE_FILTER === 'India') {
    items = PULSE_ITEMS.filter(i => i.region === 'India');
  } else {
    items = PULSE_ITEMS.filter(i => (i.category || 'General') === PULSE_FILTER);
  }

  if (!items.length) {
    grid.innerHTML = '<div class="pulse-empty">No stories in this view yet \u2014 try \u201CAll\u201D or check back tomorrow.</div>';
    return;
  }

  grid.innerHTML = items.map(item => {
    const tagClass = item.category === 'Tech' ? 'pulse-tag tag-tech' : 'pulse-tag';
    const indiaBadge = item.region === 'India' ? '<span class="pulse-tag tag-india">\uD83C\uDDEE\uD83C\uDDF3 India</span>' : '';
    return `
      <article class="pulse-card">
        <div class="pulse-tags">
          <span class="${tagClass}">${escapeHtml(item.category || 'General')}</span>${indiaBadge}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <div class="pulse-meta">
          <span>${escapeHtml(item.source || '')} \u00B7 ${formatDate(item.date)}</span>
          <a href="${escapeAttr(item.url)}" target="_blank" rel="noopener">Read more \u2192</a>
        </div>
      </article>`;
  }).join('');
}

function fillHeroTicker(data) {
  const ticker = document.getElementById('hero-ticker');
  if (!ticker || !data.items || !data.items.length) return;
  const top = data.items[0];
  ticker.innerHTML = `<strong>Today\u2019s AI Pulse:</strong> <a href="${escapeAttr(top.url)}" target="_blank" rel="noopener">${escapeHtml(top.title)}</a>`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }

/* ---------------- Nexi assistant (rule-based, no API key needed) ---------------- */
const NEXI_KB = [
  {
    kw: ['what is ai nexus', 'about', 'who are you', 'what is this site', 'what is this'],
    a: 'AI Nexus India is a free learning platform covering Artificial Intelligence, technology, cyber security, career development, computer education and science \u2014 built for everyone from school students to senior citizens, technical or not. You can explore it from the menu above, or ask me about a specific topic.'
  },
  {
    kw: ['generative ai', 'gen ai', 'genai'],
    a: 'Generative AI refers to AI systems that can create new content \u2014 text, images, audio, code \u2014 rather than just analysing existing data. Tools like ChatGPT, Claude and Gemini are common examples. Check the "AI Learning" section above for more.'
  },
  {
    kw: ['prompt engineering', 'prompting', 'how to prompt'],
    a: 'Prompt engineering is the skill of writing clear, well-structured instructions so an AI tool gives you better, more accurate results. Being specific, giving examples, and asking for step-by-step reasoning all help. See the AI Learning Hub section for more on this.'
  },
  {
    kw: ['machine learning', 'what is ml'],
    a: 'Machine learning is a branch of AI where a system learns patterns from data instead of being explicitly programmed with rules \u2014 it\u2019s the foundation underneath most modern AI tools.'
  },
  {
    kw: ['career', 'job', 'interview', 'resume', 'cv'],
    a: 'The Career Development Hub covers interview preparation, software testing & QA, and technology career roadmaps for students, freshers and professionals. Scroll up to "Career Hub" in the menu, or tell me if you want tips on a specific area like QA testing or interviews.'
  },
  {
    kw: ['qa', 'testing', 'quality assurance', 'automation testing', 'selenium'],
    a: 'The Career Hub includes content on Manual Testing, Automation Testing, Selenium and QA fundamentals \u2014 useful whether you\u2019re starting out or upskilling.'
  },
  {
    kw: ['cyber security', 'cybersecurity', 'online safety', 'scam', 'phishing', 'hack', 'safe online'],
    a: 'The Cyber Security Awareness section covers mobile security, safe browsing habits, phishing/scam recognition, and general online safety \u2014 written in plain language for non-technical readers too.'
  },
  {
    kw: ['cbse', 'icse', 'school', 'student', 'class', 'syllabus'],
    a: 'The Computer Education section has resources for CBSE and ICSE students \u2014 computer fundamentals, coding basics, digital literacy and AI awareness, matched to school-level learning.'
  },
  {
    kw: ['news', 'today', 'latest', 'update', 'pulse', 'happening'],
    a: 'Good question \u2014 scroll up to the "AI Pulse" section for today\u2019s AI news, refreshed automatically every day. You can filter it to show either everyday-friendly stories or more technical ones.'
  },
  {
    kw: ['free', 'cost', 'price', 'paid', 'subscription'],
    a: 'Everything on AI Nexus India is free to access \u2014 the learning content, the daily AI news, and this chat assistant.'
  },
  {
    kw: ['youtube', 'video', 'channel'],
    a: 'You can find video lessons on the AI Nexus India YouTube channel \u2014 there\u2019s a link in the "Featured Video" section above, or visit youtube.com/@AINEXUSINDIA directly.'
  },
  {
    kw: ['contact', 'email', 'reach', 'connect', 'collaborate', 'collaboration'],
    a: 'You can reach AI Nexus India at hello.manasis@gmail.com or mail2ainexus@gmail.com \u2014 details are in the Contact section below.'
  },
  {
    kw: ['location', 'where', 'based', 'odisha', 'bhubaneswar'],
    a: 'AI Nexus India is based in Bhubaneswar, Odisha, India.'
  },
  {
    kw: ['who runs', 'founder', 'trainer', 'instructor'],
    a: 'AI Nexus India is run by an IT QA specialist and AI trainer who teaches a mixed audience \u2014 technical and non-technical, students to senior citizens \u2014 covering AI, technology and career growth.'
  },
  {
    kw: ['hello', 'hi', 'hey', 'namaste'],
    a: 'Hi there! I\u2019m Nexi \uD83D\uDC4B I can help you find your way around AI Nexus India \u2014 ask me about AI, cyber security, careers, computer education, or today\u2019s AI news.'
  },
  {
    kw: ['thank', 'thanks'],
    a: 'You\u2019re welcome! Happy to help \u2014 feel free to ask me anything else about AI Nexus India.'
  }
];

const NEXI_FALLBACK = 'I don\u2019t have a specific answer for that yet \u2014 I\u2019m a simple guide-bot, not a full AI model. Try asking about AI, cyber security, careers, computer education, or today\u2019s AI news, or email hello.manasis@gmail.com for anything more specific.';

const NEXI_SUGGESTIONS = ['What is Generative AI?', 'Show today\u2019s AI news', 'Career tips for QA testing', 'Is this free?'];

function initNexi() {
  const launcher = document.getElementById('nexi-launcher');
  const panel = document.getElementById('nexi-panel');
  const closeBtn = document.getElementById('nexi-close');
  const form = document.getElementById('nexi-form');
  const input = document.getElementById('nexi-input');
  const body = document.getElementById('nexi-body');
  if (!launcher || !panel || !form) return;

  let greeted = false;

  launcher.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    launcher.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open && !greeted) {
      greeted = true;
      addBotMessage('Hi, I\u2019m Nexi \uD83D\uDC4B your guide to AI Nexus India. Ask me about AI topics, careers, cyber security, computer education, or today\u2019s AI news.', NEXI_SUGGESTIONS);
    }
    if (open) input.focus();
  });
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addUserMessage(text);
    input.value = '';
    respondTo(text);
  });

  body.addEventListener('click', (e) => {
    if (e.target.classList.contains('nexi-chip')) {
      const text = e.target.textContent;
      addUserMessage(text);
      respondTo(text);
    }
  });

  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'nexi-msg user';
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function addBotMessage(text, chips) {
    const el = document.createElement('div');
    el.className = 'nexi-msg bot';
    el.innerHTML = linkify(escapeHtml(text));
    body.appendChild(el);
    if (chips && chips.length) {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'nexi-chips';
      chips.forEach(c => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'nexi-chip';
        chip.textContent = c;
        chipWrap.appendChild(chip);
      });
      body.appendChild(chipWrap);
    }
    body.scrollTop = body.scrollHeight;
  }

  function respondTo(text) {
    const typing = document.createElement('div');
    typing.className = 'nexi-msg bot nexi-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(typing);
    body.scrollTop = body.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const q = text.toLowerCase();
      let best = null;
      let bestScore = 0;
      NEXI_KB.forEach(entry => {
        entry.kw.forEach(k => {
          if (q.includes(k) && k.length > bestScore) {
            bestScore = k.length;
            best = entry;
          }
        });
      });
      if (best) {
        addBotMessage(best.a);
      } else {
        addBotMessage(NEXI_FALLBACK, NEXI_SUGGESTIONS);
      }
    }, 500 + Math.random() * 400);
  }
}

function linkify(text) {
  return text.replace(/(hello\.manasis@gmail\.com|mail2ainexus@gmail\.com)/g, '<a href="mailto:$1">$1</a>');
}
