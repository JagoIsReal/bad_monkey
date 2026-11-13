(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const CYCLE = 150;
  const green = '#99be6c';
  const yellow = '#d5d85c';
  const phases = [
    { start: 0, title: 'CONNECTING', description: 'Establishing an encrypted uplink.', tag: 'LINK' },
    { start: 22, title: 'MAPPING', description: 'Resolving local network topology.', tag: 'SCAN' },
    { start: 55, title: 'BREACHING', description: 'Isolating active ICE countermeasures.', tag: 'ICE' },
    { start: 90, title: 'EXTRACTING', description: 'Routing data through a ghost relay.', tag: 'DATA' },
    { start: 130, title: 'PURGING', description: 'Clearing logs and rotating the uplink.', tag: 'WIPE' }
  ];
  const events = [
    [0, 'LINK', 'Secure relay connected. Initializing ghost protocol.'],
    [5, 'AUTH', 'Neural handshake verified. Operator B4d_M0nk3y authenticated.'],
    [13, 'LINK', 'AES-256 tunnel established. Signature masking enabled.'],
    [22, 'SCAN', 'Network sweep started. Resolving subnet 192.168.07.0.'],
    [31, 'NODE', 'Eight active relays identified. Four dormant nodes isolated.'],
    [43, 'SCAN', 'CORE_01 located. Access vector cached.'],
    [55, 'ICE', 'Adaptive ICE detected. Running countermeasure analysis.', 'warning'],
    [63, 'ICE', 'Trace process identified. Deploying optical cloak.', 'warning'],
    [72, 'ICE', 'Daemon injected into sandbox. Decoy signature accepted.'],
    [83, 'ICE', 'Countermeasures isolated. Core access granted.'],
    [90, 'DATA', 'Extraction channel open. Routing through RELAY_04.'],
    [102, 'DATA', 'Encrypted shards received. Verifying payload integrity.'],
    [116, 'DATA', 'Checksum verified. Transferring remaining data blocks.'],
    [130, 'WIPE', 'Extraction complete. Clearing session artifacts.'],
    [138, 'WIPE', 'Access logs cleared. Neural signature removed.'],
    [147, 'LINK', 'Uplink rotation queued. Preparing next autonomous cycle.']
  ];
  const processLogs = [
    ['TLS handshake accepted / cipher suite 0x1302', 'Neural buffer synchronized / 98.7% integrity', 'Routing table refreshed / ghost uplink available', 'Verifying session keys / checksum OK'],
    ['Resolving node fingerprints / subnet 07', 'Passive scan returned 8 active endpoints', 'Relay response accepted / RTT within threshold', 'Topology cache updated / no packet loss'],
    ['ICE fingerprint matched / adaptive barrier v.05', 'Decoy process running / isolated memory', 'Rewriting access token / privilege escalation', 'Countermeasure sandbox synchronized'],
    ['Receiving shard / integrity verified', 'Buffer flush completed / encrypted storage', 'Ghost relay forwarding / no trace returned', 'Payload decompression / checksum matched'],
    ['Removing temporary session keys', 'Zeroing neural cache / secure overwrite', 'Rotating relay identifiers / route detached', 'Local artifact scan / zero matches']
  ];

  const state = {
    elapsed: 0, uptime: 0, cycle: 1, phase: -1,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    trace: 4, ping: 0, eventIndex: 0,
    nextLog: 3.5, nextMetric: 0, logIndex: 0, graphTime: 0,
    nextCode: .55, streamOffset: 0, breachStep: -1
  };
  const pad = (value, length = 2) => String(Math.floor(value)).padStart(length, '0');
  const nowString = () => new Date().toLocaleTimeString('en-GB', { hour12: false });
  function log(tag, message, type = '') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    for (const [className, text] of [['log-time', nowString()], ['log-tag', `[${tag}]`], ['log-content', message]]) {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = text;
      line.append(span);
    }
    const container = $('terminal-lines');
    container.append(line);
    while (container.children.length > 40) container.firstElementChild.remove();
    container.scrollTop = container.scrollHeight;
  }
  function dispatchEvent(event) {
    log(event[1], event[2], event[3] || '');
    if (event[1] === 'SCAN' || event[1] === 'NODE') state.ping = 1;
  }

  // The network is entirely local and fictional. No connections are opened.
  const nodes = [
    { x: -195, y: -108, z: 32, name: 'RELAY_01', address: '10.07.0.11' },
    { x: -42, y: -205, z: 49, name: 'PROXY_02', address: '10.07.0.12' },
    { x: 147, y: -155, z: 33, name: 'RELAY_03', address: '10.07.0.13' },
    { x: 208, y: -7, z: 52, name: 'RELAY_04', address: '10.07.0.14' },
    { x: 150, y: 144, z: 27, name: 'CACHE_05', address: '10.07.0.15' },
    { x: 5, y: 207, z: 40, name: 'RELAY_06', address: '10.07.0.16' },
    { x: -154, y: 146, z: 30, name: 'GATE_07', address: '10.07.0.17' },
    { x: -218, y: 19, z: 55, name: 'PROXY_08', address: '10.07.0.18' },
    { x: -168, y: -228, z: 16, name: 'OFFLINE_09', address: '10.07.0.19', offline: true },
    { x: 215, y: -218, z: 20, name: 'OFFLINE_10', address: '10.07.0.20', offline: true },
    { x: 236, y: 138, z: 16, name: 'OFFLINE_11', address: '10.07.0.21', offline: true },
    { x: -193, y: 235, z: 14, name: 'OFFLINE_12', address: '10.07.0.22', offline: true }
  ];
  const canvas = $('network-canvas');
  const mainContext = canvas.getContext('2d');
  let ctx = mainContext;
  const sceneLayers = Array.from({ length: 3 }, () => document.createElement('canvas'));
  let cachedPhase = -1;
  const routes = nodes.map(node => [[0, 0, 1], [node.x * .6, 0, 1], [node.x * .6, node.y, 1], [node.x, node.y, 1]]);
  const sortedNodes = nodes.map((node, i) => ({ ...node, i })).sort((a, b) => a.x + a.y - b.x - b.y);
  let width = 0, height = 0, scale = 1;
  function resizeCanvas(element, context) {
    const rect = element.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    element.width = Math.round(rect.width * dpr);
    element.height = Math.round(rect.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [rect.width, rect.height];
  }
  function resize() {
    [width, height] = resizeCanvas(canvas, ctx);
    scale = Math.min(width / 760, height / 445) * 1.13;
    cachedPhase = -1;
    drawNetwork();
  }
  const project = (x, y, z = 0) => ({ x: width * 0.5 + (x - y) * 0.86 * scale, y: height * 0.59 + ((x + y) * 0.415 - z * 0.98) * scale });
  function line(points, color, lineWidth = 0.7, dash = []) {
    ctx.beginPath();
    points.forEach((point, index) => {
      const p = Array.isArray(point) ? project(...point) : point;
      if (index) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  function polygon(points, fill, stroke) {
    ctx.beginPath();
    points.forEach((point, i) => { const p = project(...point); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.7; ctx.stroke(); }
  }
  function ring(radius, z, color, dash = [], offset = 0) {
    line(Array.from({ length: 101 }, (_, i) => { const a = i * Math.PI / 50 + offset; return [Math.cos(a) * radius, Math.sin(a) * radius, z]; }), color, 0.7, dash);
  }
  function tower(x, y, z, size, color, offline = false) {
    const a = [x - size, y - size, 0], b = [x + size, y - size, 0], c = [x + size, y + size, 0], d = [x - size, y + size, 0];
    const upper = [a, b, c, d].map(p => [p[0], p[1], z]);
    polygon([a, b, upper[1], upper[0]], offline ? '#11160f' : '#1a2415', color + '60');
    polygon([b, c, upper[2], upper[1]], offline ? '#0c110c' : '#111c11', color + '60');
    polygon(upper, offline ? '#151b12' : '#28351a', color + 'a0');
    line([d, a], color + '45');
    line([d, upper[3]], color + '35');
    for (let level = 8; level < z - 2; level += 9) line([[x + size, y - size, level], [x + size, y + size, level]], color + '40', 0.5);
    if (!offline) {
      const p = project(x, y, z + 1);
      ctx.fillStyle = color;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
    const padding = size + 9;
    line([[x - padding, y - padding, 0], [x + padding, y - padding, 0], [x + padding, y + padding, 0], [x - padding, y + padding, 0], [x - padding, y - padding, 0]], color + '38', 0.7);
  }
  function pathPoint(points, t) {
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1], (p[2] || 0) - (points[i][2] || 0)));
    let distance = t * lengths.reduce((sum, length) => sum + length, 0);
    for (let i = 0; i < lengths.length; i++) {
      if (distance <= lengths[i]) { const f = distance / lengths[i]; return points[i].map((v, k) => v + ((points[i + 1][k] || 0) - v) * f); }
      distance -= lengths[i];
    }
    return points.at(-1);
  }
  function drawCore(t) {
    const coreColor = state.phase === 2 ? yellow : green;
    ring(86, 0, coreColor + '50', [3, 5]);
    ring(73, 2, coreColor + '40');
    const base = 43;
    polygon([[-base, -base, 0], [base, -base, 0], [base, base, 0], [-base, base, 0]], '#1b2313', coreColor + '55');
    tower(0, 0, 25, 34, coreColor);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const x = Math.cos(a) * 63, y = Math.sin(a) * 63;
      line([[x, y, 0], [x, y, 28], [x * .67, y * .67, 36]], coreColor + '60');
    }
    const radius = 53, centerZ = 102;
    const rotation = state.reducedMotion ? .3 : t * .035;
    const spherePoint = (lat, lon) => [Math.cos(lat) * Math.cos(lon + rotation) * radius, Math.cos(lat) * Math.sin(lon + rotation) * radius, centerZ + Math.sin(lat) * radius];
    const halo = project(0, 0, centerZ);
    const gradient = ctx.createRadialGradient(halo.x, halo.y, 0, halo.x, halo.y, 95 * scale);
    gradient.addColorStop(0, coreColor + '0b');
    gradient.addColorStop(1, coreColor + '00');
    ctx.fillStyle = gradient;
    ctx.fillRect(halo.x - 100 * scale, halo.y - 100 * scale, 200 * scale, 200 * scale);
    for (let i = -3; i <= 3; i++) {
      const lat = i * Math.PI / 8;
      line(Array.from({ length: 65 }, (_, j) => spherePoint(lat, j * Math.PI / 32)), coreColor + (i === 0 ? 'a0' : '55'), 0.65);
    }
    for (let i = 0; i < 12; i++) {
      line(Array.from({ length: 49 }, (_, j) => spherePoint(-Math.PI / 2 + j * Math.PI / 48, i * Math.PI / 6)), coreColor + '65', .65);
    }
    for (let i = 0; i < 18; i++) {
      const p = project(...spherePoint(Math.sin(i * 2.3) * 1.15, i * 2.399));
      ctx.fillStyle = i % 4 === 0 ? yellow : coreColor;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    ring(63, centerZ, yellow + '58', [10, 5], t * .02);
    const pole = project(0, 0, centerZ + radius + 14);
    const fontSize = Math.max(7, 9 * Math.min(scale, 1.2));
    ctx.textAlign = 'center';
    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
    ctx.fillStyle = yellow;
    ctx.fillText('CORE_01', pole.x, pole.y - 12);
    ctx.fillStyle = '#67764f';
    ctx.font = `${Math.max(6, fontSize - 2)}px "Share Tech Mono", monospace`;
    ctx.fillText(state.phase === 2 ? 'ICE ACTIVE / LVL.05' : 'ACCESS POINT / ENCRYPTED', pole.x, pole.y);
  }
  function relayColor(node, i) {
    return node.offline ? '#50623d' : state.phase === 3 && i === 3 ? yellow : green;
  }
  function drawRelay(node) {
    const color = relayColor(node, node.i);
    tower(node.x, node.y, node.z, node.offline ? 11 : 16, color, node.offline);
    if (node.offline) return;
    const p = project(node.x, node.y, node.z + 13);
    ctx.textAlign = 'center';
    ctx.font = `${Math.max(6, 7.5 * Math.min(scale, 1.2))}px "Share Tech Mono", monospace`;
    ctx.fillStyle = color + 'b0';
    ctx.fillText(node.name, p.x, p.y - 5);
    ctx.fillStyle = '#63704d';
    ctx.font = `${Math.max(5, 6 * Math.min(scale, 1.2))}px "Share Tech Mono", monospace`;
    ctx.fillText(node.address, p.x, p.y + 5);
  }
  function cacheScene() {
    // Static geometry is rasterized only on resize, font load or phase change.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    try {
      for (const layer of sceneLayers) {
        layer.width = canvas.width;
        layer.height = canvas.height;
        layer.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      ctx = sceneLayers[0].getContext('2d');
      for (let i = -320; i <= 320; i += 32) {
        const color = i % 128 === 0 ? '#677c3420' : '#677c3410';
        line([[-320, i, 0], [320, i, 0]], color, .6);
        line([[i, -320, 0], [i, 320, 0]], color, .6);
      }
      ring(242, 0, '#7c94552b', [2, 7]);
      ring(277, 0, '#7c945518');
      nodes.forEach((node, i) => line(routes[i], relayColor(node, i) + (node.offline ? '18' : '38'), .7, node.offline ? [2, 4] : []));
      ctx.textAlign = 'left';
      ctx.font = '6px "Share Tech Mono", monospace';
      ctx.fillStyle = '#455236';
      for (let i = 0; i < 6; i++) {
        const y = height * .24 + i * height * .085;
        ctx.fillText(pad(i * 32, 3), 14, y);
        ctx.fillRect(33, y - 2, i % 2 ? 3 : 5, .5);
      }
      ctx = sceneLayers[1].getContext('2d');
      sortedNodes.filter(node => node.x + node.y <= 5).forEach(drawRelay);
      ctx = sceneLayers[2].getContext('2d');
      sortedNodes.filter(node => node.x + node.y > 5).forEach(drawRelay);
      cachedPhase = state.phase;
    } finally {
      ctx = mainContext;
    }
  }
  function drawNetwork() {
    if (!width || !height) return;
    if (cachedPhase !== state.phase) cacheScene();
    const t = state.graphTime;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(sceneLayers[0], 0, 0, width, height);
    const sweep = state.reducedMotion ? 1.2 : t * .06;
    line([[0, 0, 0], [Math.cos(sweep) * 278, Math.sin(sweep) * 278, 0]], '#a3bc5130', 1);
    if (state.ping > .01) ring((1 - state.ping) * 330, 1, `rgba(213,216,92,${state.ping * .45})`);
    if (!state.reducedMotion) nodes.forEach((node, i) => {
      if (node.offline) return;
      for (let packet = 0; packet < 2; packet++) {
        const p = project(...pathPoint(routes[i], (t * .045 + i * .117 + packet * .5) % 1));
        ctx.fillStyle = relayColor(node, i) + 'b0';
        ctx.fillRect(p.x - 1, p.y - 1, 2.3, 2.3);
      }
    });
    ctx.drawImage(sceneLayers[1], 0, 0, width, height);
    drawCore(t);
    ctx.drawImage(sceneLayers[2], 0, 0, width, height);
  }
  const radioBars = Array.from({ length: 56 }, () => $('radio-waveform').appendChild(document.createElement('i')));
  const initialStream = document.createDocumentFragment();
  let warmingUp = true;
  const matrixValues = [
    'BD', '55', 'E9', 'E9', '7A',
    '1C', 'BD', '55', '7A', '1C',
    '1C', 'E9', 'BD', '55', '7A',
    '55', '7A', '1C', 'E9', 'BD',
    'E9', '1C', '55', 'BD', '7A'
  ];
  const breachPath = [0, 10, 13, 3, 4, 19];
  const matrixCells = matrixValues.map(value => {
    const cell = document.createElement('span');
    cell.className = 'matrix-cell';
    cell.textContent = value;
    $('code-matrix').append(cell);
    return cell;
  });
  const bufferSlots = Array.from({ length: 6 }, () => {
    const slot = document.createElement('span');
    slot.className = 'buffer-slot';
    $('buffer-slots').append(slot);
    return slot;
  });
  const terminalCommands = [
    'uplink --persist --channel 07',
    'route --resolve 192.168.07.0',
    'ice --isolate --decoy deadwire',
    'shard --receive --verify',
    'session --purge --rotate'
  ];
  const streamHex = ['BD', '1C', '55', 'E9', '7A', 'FF', '00', 'A3', 'D8', '4F', 'C2', '09'];
  function streamLine(text, type = '') {
    const row = document.createElement('div');
    row.className = `code-row ${type}`;
    row.textContent = text;
    const stream = warmingUp ? initialStream : $('code-lines');
    stream.append(row);
    while (stream.children.length > 160) stream.firstElementChild.remove();
    if (!warmingUp) stream.scrollTop = stream.scrollHeight;
  }
  function terminalPhase(phase) {
    streamLine(`B4d_M0nk3y@nc:~$ ${terminalCommands[phase]}`, 'stream-command');
    $('terminal-waiting').textContent = terminalCommands[phase];
    updateBreach();
  }
  function advanceCode() {
    const n = state.streamOffset++;
    const offset = (0xf420 + n * 16).toString(16).toUpperCase().padStart(8, '0');
    const bytes = Array.from({ length: 12 }, (_, i) => streamHex[(n * 7 + i * 5 + Math.floor(n / 4)) % streamHex.length]).join(' ');
    const lines = [
      `${offset}  ${bytes}`,
      `RX::${offset} ${bytes.replaceAll(' ', '')}`,
      `sig:${(n * 7829 + 0xa4f7).toString(16)} / ${phases[state.phase].tag.toLowerCase()} / accepted`,
      `${offset}  ${bytes}`,
      `route[07] > relay_${pad(n % 8 + 1)} > core_01`,
      `${offset}  ${bytes}`,
      `${offset}  ${bytes}`,
      `:: ${phases[state.phase].title} / ${processLogs[state.phase][n % 4]}`,
      `${offset}  ${bytes}`,
      `NC/07/${pad(state.cycle, 3)}::${bytes.replaceAll(' ', '')}`,
      `${offset}  ${bytes}`,
      `checksum ${((n * 3911 + 0x3ec81) >>> 0).toString(16)} / verified`,
      `${offset}  ${bytes}`
    ];
    streamLine(lines[n % lines.length], n % 13 === 7 ? 'stream-command' : n % 4 === 0 ? 'stream-dim' : '');
  }
  function updateBreach() {
    const step = state.phase < 2 ? 0 : state.phase > 2 ? 6 : Math.min(6, Math.floor((state.elapsed - 55) / 4.5));
    $('breach-time').textContent = state.phase === 2 ? Math.max(0, 90 - state.elapsed).toFixed(2) : state.phase > 2 ? '00.00' : '--.--';
    if (step === state.breachStep) return;
    state.breachStep = step;
    const last = step > 0 ? breachPath[step - 1] : 0;
    matrixCells.forEach((cell, i) => {
      const inTrack = step < 6 && (step % 2 === 0 ? Math.floor(i / 5) === Math.floor(last / 5) : i % 5 === last % 5);
      cell.className = 'matrix-cell' + (inTrack ? ' matrix-track' : '') + (breachPath.slice(0, step).includes(i) ? ' matrix-chosen' : '') + (step > 0 && i === last ? ' matrix-current' : '');
    });
    bufferSlots.forEach((slot, i) => { slot.textContent = i < step ? matrixValues[breachPath[i]] : ''; slot.classList.toggle('filled', i < step); });
    [3, 5, 6].forEach((threshold, i) => {
      const daemon = $(`daemon-${i}`);
      daemon.classList.toggle('uploaded', step >= threshold);
      daemon.querySelector('.daemon-state').textContent = step >= threshold ? 'UPLOADED' : 'QUEUED';
    });
  }
  function updatePhase() {
    const phase = phases.findLastIndex(p => state.elapsed >= p.start);
    if (state.phase === phase) return;
    state.phase = phase;
    terminalPhase(phase);
    $('phase-title').textContent = phases[phase].title;
  }
  function traceAtTime(t) {
    if (t < 22) return 4 + t * .13;
    if (t < 55) return 7 + (t - 22) * .33;
    if (t < 72) return 18 + (t - 55) * 2.8;
    if (t < 90) return 65 - (t - 72) * 3.15;
    if (t < 130) return 8 + Math.sin((t - 90) * .18) * 3;
    return Math.max(0, 6 - (t - 130) * .4);
  }
  function updateMetrics() {
    const salt = state.uptime;
    state.trace = Math.round(traceAtTime(state.elapsed));
    radioBars.forEach((bar, i) => {
      const envelope = Math.sin(i / 55 * Math.PI) * .7 + .15;
      const signal = .25 + Math.abs(Math.sin(i * .79 + salt * .65) * Math.cos(i * .27 - salt * .32));
      bar.style.height = `${Math.max(2, signal * envelope * 27)}px`;
    });
    updateBreach();
  }

  function restart() {
    state.elapsed = 0;
    state.phase = -1;
    state.eventIndex = 0;
    state.nextLog = state.uptime + 3.5;
    state.cycle += 1;
    $('cycle-number').textContent = pad(state.cycle, 3);
    updatePhase();
    updateMetrics();
  }

  // The first rAF timestamp can precede script execution in the same frame.
  // Establish the origin from rAF itself, also after returning to this tab.
  let previous = null, lastDraw = 0, lastClock = 0;
  function frame(timestamp) {
    const delta = previous === null ? 0 : Math.max(0, Math.min((timestamp - previous) / 1000, .25));
    previous = timestamp;
    if (!document.hidden) {
      const dt = delta;
      state.elapsed += dt;
      state.uptime += dt;
      state.graphTime += dt;
      state.ping = Math.max(0, state.ping - dt * .16);
      if (state.elapsed >= CYCLE) restart();
      updatePhase();
      while (state.eventIndex < events.length && state.elapsed >= events[state.eventIndex][0]) dispatchEvent(events[state.eventIndex++]);
      if (state.uptime >= state.nextLog) {
        const lines = processLogs[state.phase];
        log(phases[state.phase].tag, lines[state.logIndex++ % lines.length], state.phase === 2 && state.trace > 38 ? 'warning' : 'dim');
        state.nextLog = state.uptime + 4.5 + (state.logIndex % 3);
      }
      if (state.uptime >= state.nextCode) {
        advanceCode();
        state.nextCode = state.uptime + (state.reducedMotion ? 3 : .55);
      }
      if (state.uptime >= state.nextMetric) {
        updateMetrics();
        state.nextMetric = state.uptime + 1;
      }
    }
    if (timestamp - lastClock > 1000) { $('clock').textContent = nowString(); lastClock = timestamp; }
    const drawInterval = state.reducedMotion ? 1000 : 1000 / 24;
    if (!document.hidden && timestamp - lastDraw >= drawInterval) {
      drawNetwork();
      if (state.phase === 2) $('breach-time').textContent = Math.max(0, 90 - state.elapsed).toFixed(2);
      lastDraw = timestamp - (timestamp - lastDraw) % drawInterval;
    }
    requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => { previous = null; });
  const observer = new ResizeObserver(resize);
  observer.observe($('map-stage'));
  document.fonts.ready.then(resize);
  document.body.classList.toggle('reduced-motion', state.reducedMotion);
  updatePhase();
  for (let i = 0; i < 46; i++) advanceCode();
  $('code-lines').append(initialStream);
  warmingUp = false;
  $('code-lines').scrollTop = $('code-lines').scrollHeight;
  updateMetrics();
  $('clock').textContent = nowString();
  log('BOOT', 'BLACKWALL neural operating system v.2.077', 'dim');
  log('SYS', 'Deadwire uplink connected / relay chain established', 'dim');
  log('SYS', 'Autonomous protocol initialized / continuous loop');
  log('AUTH', 'Operator B4d_M0nk3y / session synchronized');
  setTimeout(() => document.body.classList.remove('booting'), 1200);
  resize();
  requestAnimationFrame(frame);
})();
