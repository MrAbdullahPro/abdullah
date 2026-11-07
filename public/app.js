(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Boot loader ---------- */
  (function boot() {
    var seen = false;
    try { seen = sessionStorage.getItem('booted') === '1'; } catch (e) {}
    if (reduceMotion || seen) return;
    var el = document.createElement('div');
    el.className = 'boot';
    var pre = document.createElement('pre');
    el.appendChild(pre);
    document.body.appendChild(el);
    var lines = [
      '[ OK ] Initializing secure environment...',
      '[ OK ] Loading modules: recon, exploit, report',
      '[ OK ] Scanning ports ........ done',
      '[ OK ] Verifying identity: ABDULLAH',
      '>> ACCESS GRANTED'
    ];
    var i = 0;
    (function next() {
      if (i < lines.length) {
        var span = document.createElement('span');
        if (i === lines.length - 1) span.className = 'grant';
        span.textContent = lines[i] + '\n';
        pre.appendChild(span);
        i++;
        setTimeout(next, 260);
      } else {
        setTimeout(function () {
          el.classList.add('out');
          setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
        }, 380);
      }
    })();
    try { sessionStorage.setItem('booted', '1'); } catch (e) {}
  })();

  /* ---------- Matrix rain ---------- */
  (function matrix() {
    var c = $('#matrix');
    if (!c || !c.getContext || reduceMotion) return;
    var ctx = c.getContext('2d');
    var chars = '01<>/{}[]()$#@%&*+=ABCDEF0123456789'.split('');
    var size = 16, cols = 0, drops = [], last = 0, running = true;
    function resize() {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      cols = Math.ceil(c.width / size);
      drops = [];
      for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(draw);
    });
    function draw(t) {
      if (!running) return;
      requestAnimationFrame(draw);
      if (t - last < 55) return;
      last = t;
      ctx.fillStyle = 'rgba(5,8,13,0.12)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#00ff9c';
      ctx.font = size + 'px monospace';
      for (var i = 0; i < cols; i++) {
        var ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > c.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    requestAnimationFrame(draw);
  })();

  /* ---------- Typing effect ---------- */
  (function typing() {
    var el = $('#typed');
    if (!el) return;
    var roles = ['Cybersecurity Professional', 'Ethical Hacker', 'Penetration Tester', 'Network Security Engineer', 'Cloud Security Learner'];
    if (reduceMotion) { el.textContent = roles[0]; return; }
    var r = 0, ch = 0, del = false;
    (function tick() {
      var word = roles[r];
      if (!del) {
        ch++;
        el.textContent = word.slice(0, ch);
        if (ch === word.length) { del = true; return void setTimeout(tick, 1600); }
        setTimeout(tick, 70);
      } else {
        ch--;
        el.textContent = word.slice(0, ch);
        if (ch === 0) { del = false; r = (r + 1) % roles.length; return void setTimeout(tick, 350); }
        setTimeout(tick, 35);
      }
    })();
  })();

  /* ---------- Nav, progress, active link ---------- */
  var nav = $('#nav'), progress = $('#progress');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = $('#navToggle'), links = $('#navLinks');
  function closeMenu() {
    if (!toggle || !links) return;
    toggle.classList.remove('open');
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  if ('IntersectionObserver' in window) {
    var secs = $$('main section[id]');
    var navLinks = $$('.links a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll + counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target;
          t.classList.add('in');
          io.unobserve(t);
          setTimeout(function () { t.style.transitionDelay = ''; t.classList.add('done'); }, 1300);
        }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el, i) {
      el.style.transitionDelay = ((i % 4) * 80) + 'ms';
      io.observe(el);
    });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    counters.forEach(animateCount);
  }

  /* ---------- Card spotlight, tilt, cursor glow ---------- */
  $$('.card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(800px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-3px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    var glow = $('#glow');
    if (glow) {
      window.addEventListener('mousemove', function (e) {
        glow.style.transform = 'translate(' + (e.clientX - 210) + 'px,' + (e.clientY - 210) + 'px)';
      }, { passive: true });
    }
  }

  /* ---------- Footer year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Interactive terminal ---------- */
  (function terminal() {
    var out = $('#itermOut'), input = $('#itermIn'), quick = $('#quick');
    if (!out || !input) return;

    var EMAIL = 'abdullahqureshi7642@gmail.com';
    var data = {
      help: [
        'Available commands:',
        '  whoami       who is Abdullah',
        '  about        career objective',
        '  skills       technical skills',
        '  certs        certifications & trainings',
        '  experience   internship details',
        '  education    degree',
        '  project      final year project',
        '  contact      how to reach me',
        '  cv           download my CV',
        '  sudo hire-me try it :)',
        '  clear        clear the screen'
      ],
      whoami: ['abdullah - Cybersecurity Professional | Ethical Hacking, Networking & Cloud Security', 'Lahore, Pakistan'],
      about: ['CEH-certified, BSCS graduate, hands-on ethical hacking internship.', 'Skilled in pentesting, vulnerability assessment and intrusion detection.', 'Available for immediate joining - on-site (Lahore) or remote.'],
      skills: [
        'Offensive : Penetration Testing, Vulnerability Assessment, Threat Hunting,',
        '            Nmap, Wireshark, Metasploit, Burp Suite, Kali Linux',
        'Networking: CCNA & CCNP concepts, Routing & Switching, Network Security',
        'Systems   : Linux Administration (RHCSA), Windows Server Admin (MCSA)',
        'Cloud     : Microsoft Azure Cloud Fundamentals',
        'Other     : ML for Intrusion Detection, Dataset Handling, Report Writing'
      ],
      certs: [
        '[+] CEH  - Certified Ethical Hacker (EC-Council, NAVTTC)',
        '[+] CCNA - Cisco Certified Network Associate (Corvit Systems)',
        '[+] CCNP - Cisco Certified Network Professional (Corvit Systems)',
        '[+] RHCSA - Red Hat Certified System Administrator (Corvit Systems)',
        '[+] Microsoft Azure Cloud (Corvit Systems)',
        '[+] MCSA - Server Administration (Corvit Systems)'
      ],
      experience: ['Ethical Hacking Intern - Corvit Systems, Lahore (Jan 2026 - Jun 2026)', '6 months hands-on: pentesting methodology, vulnerability assessment,', 'network scanning, exploitation, reconnaissance and reporting.'],
      education: ['BSCS - Virtual University of Pakistan (2026)'],
      project: ['ML-Based Cyber Intrusion Detection System (Final Year Project, 2026)', 'Simulated DDoS attacks, processed network datasets, trained an ML', 'classifier to separate normal vs malicious traffic.'],
      contact: ['Email   : ' + EMAIL, 'Phone   : 0308-8531221', 'Location: Lahore, Pakistan']
    };

    var history = [], hIdx = 0;

    function print(text, cls) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.textContent = text;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
    }
    function printLines(arr, cls) { arr.forEach(function (l) { print(l, cls); }); }

    function run(raw) {
      var cmd = raw.trim();
      print('visitor@abdullah:~$ ' + cmd, 'cmd');
      if (!cmd) return;
      var key = cmd.toLowerCase();
      if (key === 'projects') key = 'project';
      if (key === 'clear') { out.textContent = ''; return; }
      if (key === 'cv') {
        print('Downloading Abdullah_CV.pdf ...', 'okk');
        var a = document.createElement('a');
        a.href = 'assets/Abdullah_CV.pdf';
        a.download = 'Abdullah_CV.pdf';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        return;
      }
      if (key === 'sudo hire-me' || key === 'sudo hire me') {
        print('[sudo] password for recruiter: ********', 'hl');
        print('Authentication successful. Access granted.', 'okk');
        print('Opening your mail client...', 'okk');
        setTimeout(function () {
          window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Opportunity for Abdullah');
        }, 900);
        return;
      }
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        printLines(data[key], key === 'help' ? 'hl' : '');
        return;
      }
      if (key.indexOf('sudo') === 0) { print('Nice try. Only "sudo hire-me" is allowed here.', 'err'); return; }
      if (key === 'ls') { print('about  skills  certs  experience  education  project  contact  cv', 'hl'); return; }
      print('command not found: ' + cmd + "  (type 'help')", 'err');
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = input.value;
        if (v.trim()) { history.push(v); hIdx = history.length; }
        run(v);
        input.value = '';
      } else if (e.key === 'ArrowUp') {
        if (hIdx > 0) { hIdx--; input.value = history[hIdx] || ''; }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } else { hIdx = history.length; input.value = ''; }
        e.preventDefault();
      }
    });
    if (quick) {
      quick.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button[data-cmd]') : null;
        if (b) run(b.getAttribute('data-cmd'));
      });
    }
    print('Welcome, visitor. Type "help" to see what I can do.', 'okk');
  })();
})();
