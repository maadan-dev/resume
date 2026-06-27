document.addEventListener('DOMContentLoaded', () => {
  // 1. Page Fade-In Transition
  document.body.classList.remove('loading');

  // 2. Scroll Animation (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.05
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });

  // 3. Mouse spotlight/glow tracking for project cards
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 4. Copy-to-Clipboard functionality
  const copyButtons = document.querySelectorAll('.btn-copy');
  const toast = document.getElementById('toast');
  let toastTimeout;

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Toggle copy/check icons
        const copyIcon = btn.querySelector('.copy-icon');
        const checkIcon = btn.querySelector('.check-icon');
        
        copyIcon.classList.add('hidden');
        checkIcon.classList.remove('hidden');

        // Show Toast Notification
        toast.textContent = `Copied: ${textToCopy}`;
        toast.classList.add('show');

        // Reset button and toast after delay
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
          copyIcon.classList.remove('hidden');
          checkIcon.classList.add('hidden');
          toast.classList.remove('show');
        }, 2500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    });
  });

  // 5. Smart Tech Tag Filter / Highlight System
  let activeTagKey = null;

  function getTagKey(techName) {
    if (!techName) return '';
    const name = techName.toLowerCase().trim();
    if (name.includes('typescript')) return 'typescript';
    if (name.includes('javascript') || name.includes('es6+')) return 'javascript';
    if (name === 'go' || name.includes('go (net') || name.includes('go,')) return 'go';
    if (name.includes('react')) return 'react';
    if (name.includes('tailwind')) return 'tailwind-css';
    if (name.includes('gemini')) return 'gemini-api';
    if (name.includes('supabase')) return 'supabase';
    if (name.includes('railway')) return 'railway';
    if (name.includes('vercel')) return 'vercel';
    if (name.includes('framer') || name.includes('motion')) return 'framer-motion';
    if (name.includes('sse') || name.includes('streaming')) return 'sse-streaming';
    if (name.includes('learn2earn') || name.includes('fellowship')) return 'learn2earn';
    if (name.includes('math')) return 'mathematics';
    return name.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  const allTagElements = document.querySelectorAll('.tech-tag, .tech-inline');

  allTagElements.forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const rawTechName = el.getAttribute('data-tech') || el.textContent;
      const clickedKey = getTagKey(rawTechName);

      if (!clickedKey) return;

      if (activeTagKey === clickedKey) {
        clearAllHighlights();
        activeTagKey = null;
      } else {
        highlightTech(clickedKey);
        activeTagKey = clickedKey;
      }
    });
  });

  document.addEventListener('click', () => {
    if (activeTagKey) {
      clearAllHighlights();
      activeTagKey = null;
    }
  });

  function highlightTech(key) {
    clearAllHighlights();

    allTagElements.forEach(el => {
      const elKey = getTagKey(el.getAttribute('data-tech') || el.textContent);
      if (elKey === key) {
        if (el.classList.contains('tech-tag')) {
          el.classList.add('active');
        } else if (el.classList.contains('tech-inline')) {
          el.classList.add('highlighted');
        }
      }
    });

    document.querySelectorAll('.project-card').forEach(card => {
      const tagsAttr = card.getAttribute('data-tags') || '';
      const tags = tagsAttr.split(/\s+/);
      if (tags.includes(key)) {
        card.classList.add('highlight');
      }
    });

    document.querySelectorAll('.timeline-item').forEach(item => {
      const tagsAttr = item.getAttribute('data-tags') || '';
      const tags = tagsAttr.split(/\s+/);
      if (tags.includes(key)) {
        item.classList.add('highlight');
      }
    });
  }

  function clearAllHighlights() {
    allTagElements.forEach(el => {
      el.classList.remove('active');
      el.classList.remove('highlighted');
    });

    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.remove('highlight');
    });

    document.querySelectorAll('.timeline-item').forEach(item => {
      item.classList.remove('highlight');
    });
  }

  // 6. Category Quick-Filtering Logic
  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterableItems = document.querySelectorAll('.project-card, .timeline-item, .skills-category-card, .additional-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      // Toggle button states
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter grid/list items
      filterableItems.forEach(item => {
        const categoriesAttr = item.getAttribute('data-category') || '';
        const categories = categoriesAttr.split(/\s+/);
        
        if (filter === 'all' || categories.includes(filter)) {
          item.classList.remove('filtered-out');
        } else {
          item.classList.add('filtered-out');
        }
      });
    });
  });

  // 7. Interactive CLI Terminal Logic
  const btnToggleTerminal = document.getElementById('btn-toggle-terminal');
  const btnCloseTerminal = document.getElementById('btn-close-terminal');
  const btnCloseDot = document.getElementById('btn-close-terminal-dot');
  const terminalWindow = document.getElementById('terminal-window');
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');

  // Toggle drawer visibility
  function toggleTerminal() {
    terminalWindow.classList.toggle('hidden');
    if (!terminalWindow.classList.contains('hidden')) {
      terminalInput.focus();
      // Scroll to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }
  }

  btnToggleTerminal.addEventListener('click', toggleTerminal);
  btnCloseTerminal.addEventListener('click', toggleTerminal);
  if (btnCloseDot) {
    btnCloseDot.addEventListener('click', toggleTerminal);
  }

  // Global Keyboard Shortcuts (Esc to close, Backtick ` to toggle)
  document.addEventListener('keydown', (e) => {
    if (e.key === '`') {
      e.preventDefault();
      toggleTerminal();
    } else if (e.key === 'Escape' && !terminalWindow.classList.contains('hidden')) {
      toggleTerminal();
    }
  });

  // Focus input on body click inside terminal
  terminalBody.addEventListener('click', () => {
    terminalInput.focus();
  });

  // Command history helper
  let commandHistory = [];
  let historyIndex = -1;

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        if (historyIndex === -1) historyIndex = commandHistory.length;
        historyIndex = Math.max(0, historyIndex - 1);
        terminalInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex !== -1) {
        historyIndex = Math.min(commandHistory.length, historyIndex + 1);
        if (historyIndex === commandHistory.length) {
          terminalInput.value = '';
          historyIndex = -1;
        } else {
          terminalInput.value = commandHistory[historyIndex];
        }
      }
    }
  });

  terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const inputVal = terminalInput.value.trim();
      terminalInput.value = '';
      
      if (inputVal) {
        commandHistory.push(inputVal);
        historyIndex = -1;
        handleCommand(inputVal);
      }
    }
  });

  function appendOutput(htmlContent) {
    const line = document.createElement('div');
    line.innerHTML = htmlContent;
    terminalOutput.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function handleCommand(cmd) {
    const cleanedCmd = cmd.toLowerCase().trim();
    
    // Echo the command typed
    appendOutput(`<p><span class="terminal-prompt">guest@maadan.dev:~$</span> <span class="term-cmd">${cmd}</span></p>`);

    switch (cleanedCmd) {
      case 'help':
        appendOutput(`
          <p class="term-info">Available Commands:</p>
          <p><span class="term-highlight">about</span>       - Brief developer overview</p>
          <p><span class="term-highlight">projects</span>    - Showcase product launches & stack</p>
          <p><span class="term-highlight">experience</span>  - Software contractor vertically shipped</p>
          <p><span class="term-highlight">skills</span>      - Tech stack categorized lists</p>
          <p><span class="term-highlight">education</span>   - Fellowship & B.Sc Mathematics</p>
          <p><span class="term-highlight">download</span>    - Download PDF resume copy</p>
          <p><span class="term-highlight">clear</span>       - Clean terminal screen</p>
          <p><span class="term-highlight">close</span>       - Hide terminal drawer</p>
        `);
        break;

      case 'about':
      case 'summary':
        appendOutput(`
          <p class="term-success">Abdulyekeen Maadan &middot; Software Developer</p>
          <p>Lagos-based developer with a Mathematics background and 2+ years delivering production client applications across the full frontend stack (React, TypeScript, Go).</p>
          <p>Incoming Fellow at the Learn2Earn AI Fellowship (Cohort 2), selected from ~4,000 applicants.</p>
        `);
        break;

      case 'projects':
        appendOutput(`
          <p><strong class="term-success">NextRole NG</strong> &mdash; Full-Stack AI CV Optimisation Tool (<a href="https://nextroleng.tech" target="_blank" style="color:#3b82f6;">nextroleng.tech</a>)</p>
          <p><span class="term-bullet">&bull;</span> Built a two-phase Gemini AI pipeline for tailored CV fact extractions and categories re-writing.</p>
          <p><span class="term-bullet">&bull;</span> Designed SSE streaming pipelines for real-time extraction (~15s) with multimodal PDF extraction.</p>
          <p><span class="term-bullet">&bull;</span> Stack: Go, React, TypeScript, Tailwind, Gemini API, Supabase, Railway, Vercel.</p>
        `);
        break;

      case 'experience':
        appendOutput(`
          <p><strong class="term-success">Contract Frontend Developer</strong> &mdash; Self-Employed (May 2023 - Dec 2025)</p>
          <p><span class="term-bullet">&bull;</span> Shipped high-performance React/TypeScript applications vertically for paying international clients (ATEKER Luxury Safaris, segunalabi.me).</p>
          <p><span class="term-bullet">&bull;</span> Implemented interactive visual transitions using Framer Motion and typed API borders.</p>
        `);
        break;

      case 'skills':
        appendOutput(`
          <p><strong class="term-info">Languages:</strong> TypeScript, JavaScript, Go, HTML5, CSS3</p>
          <p><strong class="term-info">Frameworks:</strong> React, Vite, Tailwind CSS, Framer Motion</p>
          <p><strong class="term-info">Backend &amp; DB:</strong> Go (net/http), Supabase (PostgreSQL), REST, SSE Streaming</p>
          <p><strong class="term-info">AI &amp; Workflows:</strong> Gemini API, Prompt Engineering, Git, Vercel, Railway</p>
        `);
        break;

      case 'education':
        appendOutput(`
          <p><strong class="term-bullet">&bull;</strong> <strong class="term-success">AI Engineering Fellowship</strong> | Learn2Earn (Cohort 2, Incoming)</p>
          <p><strong class="term-bullet">&bull;</strong> <strong class="term-success">01-edu Piscine</strong> | Learn2Earn (March 2026 boot camp in Go & Unix shell)</p>
          <p><strong class="term-bullet">&bull;</strong> <strong class="term-success">B.Sc. Mathematics</strong> | FUNAAB (2019 - 2024)</p>
        `);
        break;

      case 'download':
        appendOutput('<p class="term-info">Downloading PDF Resume...</p>');
        const link = document.createElement('a');
        link.href = 'Abdulyekeen_Maadan_Resume.pdf';
        link.download = 'Abdulyekeen_Maadan_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        break;

      case 'clear':
        terminalOutput.innerHTML = '';
        break;

      case 'close':
        toggleTerminal();
        break;

      default:
        appendOutput(`<p class="term-error">Command not found: "${cmd}". Type <span class="term-highlight">help</span> to view valid commands.</p>`);
        break;
    }
    
    // Add spacer
    appendOutput('<p></p>');
  }
});
