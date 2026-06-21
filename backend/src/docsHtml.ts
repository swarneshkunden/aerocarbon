export const docsHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carbon-API | Interactive Documentation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #080d16;
      --bg-card: rgba(17, 24, 39, 0.7);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --accent-emerald: #10b981;
      --accent-emerald-glow: rgba(16, 185, 129, 0.15);
      --accent-blue: #3b82f6;
      --accent-blue-glow: rgba(59, 130, 246, 0.15);
      --accent-violet: #8b5cf6;
      --accent-rose: #f43f5e;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Plus Jakarta Sans', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-primary);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Background Gradients */
    .bg-gradient-1 {
      position: fixed;
      top: -10%;
      left: -10%;
      width: 50vw;
      height: 50vw;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(8, 13, 22, 0) 70%);
      pointer-events: none;
      z-index: -1;
    }

    .bg-gradient-2 {
      position: fixed;
      bottom: -10%;
      right: -10%;
      width: 50vw;
      height: 50vw;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(8, 13, 22, 0) 70%);
      pointer-events: none;
      z-index: -1;
    }

    /* Header */
    header {
      background: rgba(8, 13, 22, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px var(--accent-emerald-glow);
    }

    .logo-icon svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .logo-text {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      background: linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 500;
      color: #34d399;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background-color: var(--accent-emerald);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--accent-emerald);
      animation: pulse 2s infinite ease-in-out;
    }

    /* Main Container Layout */
    .app-container {
      display: flex;
      flex: 1;
      max-width: 1600px;
      margin: 0 auto;
      width: 100%;
    }

    /* Sidebar Navigation */
    aside {
      width: 280px;
      border-right: 1px solid var(--border-color);
      padding: 2rem 1.5rem;
      position: sticky;
      top: 73px;
      height: calc(100vh - 73px);
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      margin-top: 1.5rem;
      font-weight: 600;
    }

    .nav-section-title:first-child {
      margin-top: 0;
    }

    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .nav-item-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .nav-item-link:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.03);
    }

    .nav-item-link.active {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
      border-left: 3px solid var(--accent-emerald);
      padding-left: calc(0.75rem - 3px);
    }

    .method-tag {
      font-family: var(--font-heading);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      min-width: 45px;
      text-align: center;
      text-transform: uppercase;
    }

    .method-get { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
    .method-post { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
    .method-delete { background: rgba(244, 63, 94, 0.1); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.2); }
    .method-ws { background: rgba(139, 92, 246, 0.1); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.2); }

    /* Content Area */
    main {
      flex: 1;
      padding: 2rem 3rem;
      overflow-y: auto;
    }

    .doc-intro {
      margin-bottom: 3rem;
    }

    .doc-intro h1 {
      font-family: var(--font-heading);
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ffffff 0%, #9ca3af 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .doc-intro p {
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 800px;
    }

    /* Endpoint Blocks */
    .endpoint-card {
      background: var(--bg-card);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem 2rem;
      margin-bottom: 2.5rem;
      scroll-margin-top: 90px;
      transition: border-color 0.3s ease;
    }

    .endpoint-card:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .endpoint-path {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .endpoint-title {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 600;
      width: 100%;
      margin-top: 0.5rem;
      color: #e5e7eb;
    }

    .endpoint-desc {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .section-subtitle {
      font-family: var(--font-heading);
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.25rem;
    }

    /* Grid layout for params & playground */
    .endpoint-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .endpoint-body {
        grid-template-columns: 1fr;
      }
      aside {
        display: none;
      }
    }

    .params-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }

    .params-table th, .params-table td {
      text-align: left;
      padding: 0.6rem 0.5rem;
      font-size: 0.9rem;
    }

    .params-table th {
      color: var(--text-secondary);
      font-weight: 600;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .params-table td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .param-name {
      font-family: 'Courier New', Courier, monospace;
      font-weight: bold;
      color: #60a5fa;
    }

    .param-type {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.8rem;
      color: #a78bfa;
    }

    .param-req {
      font-size: 0.75rem;
      color: var(--accent-rose);
      background: rgba(244, 63, 94, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
      font-weight: 600;
    }
    
    .param-opt {
      font-size: 0.75rem;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }

    .code-block-container {
      position: relative;
    }

    .code-block {
      background: #020617;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.85rem;
      color: #38bdf8;
      overflow-x: auto;
      max-height: 250px;
      white-space: pre-wrap;
    }

    /* Live Playground */
    .playground {
      background: rgba(2, 6, 23, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .playground-inputs {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .form-input {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      color: white;
      font-family: var(--font-body);
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent-emerald);
      background: rgba(255, 255, 255, 0.05);
    }

    .btn {
      background: linear-gradient(135deg, var(--accent-emerald) 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.6rem 1.2rem;
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px var(--accent-emerald-glow);
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      box-shadow: none;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: none;
    }

    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }

    .response-status {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .status-2xx { background: rgba(16, 185, 129, 0.1); color: #34d399; }
    .status-4xx, .status-5xx { background: rgba(244, 63, 94, 0.1); color: #fb7185; }

    /* Animations */
    @keyframes pulse {
      0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      70% {
        transform: scale(1);
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
      }
      100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
      }
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-dark);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Key indicator */
    .api-key-banner {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .api-key-text h3 {
      font-family: var(--font-heading);
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .api-key-text p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .api-key-input-container {
      display: flex;
      gap: 0.5rem;
      width: 300px;
    }
  </style>
</head>
<body>

  <div class="bg-gradient-1"></div>
  <div class="bg-gradient-2"></div>

  <header>
    <div class="logo-container">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      </div>
      <span class="logo-text">Carbon-API</span>
    </div>
    <div style="display: flex; gap: 1rem; align-items: center;">
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>API status: Online</span>
      </div>
    </div>
  </header>

  <div class="app-container">
    <aside>
      <div class="nav-section-title">Authentication</div>
      <ul class="nav-list">
        <li><a href="#login" class="nav-item-link active"><span class="method-tag method-post">POST</span>/api/login</a></li>
        <li><a href="#logout" class="nav-item-link"><span class="method-tag method-post">POST</span>/api/logout</a></li>
        <li><a href="#me" class="nav-item-link"><span class="method-tag method-get">GET</span>/api/me</a></li>
      </ul>

      <div class="nav-section-title">Carbon Metrics</div>
      <ul class="nav-list">
        <li><a href="#dashboard" class="nav-item-link"><span class="method-tag method-get">GET</span>/api/dashboard</a></li>
        <li><a href="#readings" class="nav-item-link"><span class="method-tag method-get">GET</span>/api/readings</a></li>
        <li><a href="#health" class="nav-item-link"><span class="method-tag method-get">GET</span>/health</a></li>
      </ul>

      <div class="nav-section-title">Device Registry</div>
      <ul class="nav-list">
        <li><a href="#connect" class="nav-item-link"><span class="method-tag method-post">POST</span>/api/connect-device</a></li>
        <li><a href="#devices" class="nav-item-link"><span class="method-tag method-get">GET</span>/api/devices</a></li>
        <li><a href="#delete-device" class="nav-item-link"><span class="method-tag method-delete">DEL</span>/api/devices</a></li>
      </ul>

      <div class="nav-section-title">Real-time Stream</div>
      <ul class="nav-list">
        <li><a href="#websocket" class="nav-item-link"><span class="method-tag method-ws">WS</span>ws://</a></li>
      </ul>
    </aside>

    <main>
      <div class="doc-intro">
        <h1>Carbon-API Service Documentation</h1>
        <p>Welcome to the Carbon-API documentation. Use this interactive reference to explore endpoints, verify authorization, submit device telemetry (kWh readings), and inspect computed carbon emissions (kg CO2e) in real-time.</p>
      </div>

      <!-- Auth Config Banner -->
      <div class="api-key-banner">
        <div class="api-key-text">
          <h3>Authentication Header</h3>
          <p>Protected endpoints require an API Key if <code>API_KEY</code> is set in the environment. Set it below to authenticate requests in the playground.</p>
        </div>
        <div class="api-key-input-container">
          <input type="password" id="global-api-key" class="form-input" placeholder="x-api-key" style="flex: 1;" oninput="updateGlobalApiKey(this.value)">
        </div>
      </div>

      <!-- POST /api/login -->
      <section id="login" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-post">POST</span>
          <span class="endpoint-path">/api/login</span>
          <div class="endpoint-title">User Authentication</div>
        </div>
        <div class="endpoint-desc">
          Authenticates a user using email and password. If the user doesn't exist, a new account is automatically registered and logged in. Sets an HTTP-only <code>session</code> cookie.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Request Body</div>
            <table class="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="param-name">email</td>
                  <td class="param-type">string</td>
                  <td><span class="param-req">required</span></td>
                  <td>User email address</td>
                </tr>
                <tr>
                  <td class="param-name">password</td>
                  <td class="param-type">string</td>
                  <td><span class="param-req">required</span></td>
                  <td>Plain text password</td>
                </tr>
              </tbody>
            </table>

            <div class="section-subtitle">Example Request Payload</div>
            <div class="code-block-container">
              <pre class="code-block">{
  "email": "user@example.com",
  "password": "supersecretpassword"
}</pre>
            </div>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <div class="playground-inputs">
                <div class="form-group">
                  <label for="login-email">Email</label>
                  <input type="email" id="login-email" class="form-input" value="user@example.com">
                </div>
                <div class="form-group">
                  <label for="login-password">Password</label>
                  <input type="password" id="login-password" class="form-input" value="password123">
                </div>
              </div>
              <button class="btn" onclick="runLogin()">Execute Request</button>
              
              <div class="response-header" style="display: none;" id="login-resp-header">
                <span class="response-status" id="login-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none; max-height: 150px;" id="login-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- POST /api/logout -->
      <section id="logout" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-post">POST</span>
          <span class="endpoint-path">/api/logout</span>
          <div class="endpoint-title">User Logout</div>
        </div>
        <div class="endpoint-desc">
          Clears the session cookie on the client side and deletes the active session from the DB or in-memory session store.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Request Details</div>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">No request body required. This endpoint reads the session ID from cookies.</p>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <button class="btn" onclick="runLogout()">Log Out</button>
              
              <div class="response-header" style="display: none;" id="logout-resp-header">
                <span class="response-status" id="logout-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none; max-height: 120px;" id="logout-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- GET /api/me -->
      <section id="me" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-get">GET</span>
          <span class="endpoint-path">/api/me</span>
          <div class="endpoint-title">Check Authenticated Session</div>
        </div>
        <div class="endpoint-desc">
          Returns information about the logged-in user corresponding to the session cookie.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Request Headers</div>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Requires cookie header: <code>session=YOUR_SESSION_TOKEN</code></p>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <button class="btn" onclick="runMe()">Get Profile</button>
              
              <div class="response-header" style="display: none;" id="me-resp-header">
                <span class="response-status" id="me-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none; max-height: 150px;" id="me-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- GET /api/dashboard -->
      <section id="dashboard" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-get">GET</span>
          <span class="endpoint-path">/api/dashboard</span>
          <div class="endpoint-title">Dashboard Overview Statistics</div>
        </div>
        <div class="endpoint-desc">
          Fetches core carbon and energy usage KPI figures, historical charts, and AI optimization recommendations.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Response Schema</div>
            <pre class="code-block" style="color: #60a5fa">{
  "todayEmissions": number, // kg CO2e
  "unit": string,
  "trend": number, // % trend change
  "weeklyData": Array<{day: string, emissions: number}>,
  "aiSuggestion": string,
  "airQuality": string
}</pre>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <button class="btn" onclick="runDashboard()">Fetch Dashboard Data</button>
              
              <div class="response-header" style="display: none;" id="dash-resp-header">
                <span class="response-status" id="dash-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none;" id="dash-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- POST /api/connect-device -->
      <section id="connect" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-post">POST</span>
          <span class="endpoint-path">/api/connect-device</span>
          <div class="endpoint-title">Publish Device Telemetry (kWh)</div>
        </div>
        <div class="endpoint-desc">
          Receives an energy reading (kWh) from a specific device. Computes carbon footprint (kg CO2e) utilizing the configured emission factor. Optionally registers the device automatically.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Request Parameters</div>
            <table class="params-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="param-name">deviceId</td>
                  <td class="param-type">string</td>
                  <td><span class="param-opt">optional</span></td>
                  <td>Unique external ID (e.g. <code>solar-panel-1</code>). Defaults to "unknown"</td>
                </tr>
                <tr>
                  <td class="param-name">kwh</td>
                  <td class="param-type">number</td>
                  <td><span class="param-req">required</span></td>
                  <td>Active electrical energy reading</td>
                </tr>
                <tr>
                  <td class="param-name">registerDevice</td>
                  <td class="param-type">boolean</td>
                  <td><span class="param-opt">optional</span></td>
                  <td>Set to <code>true</code> to register device if not present</td>
                </tr>
                <tr>
                  <td class="param-name">timestamp</td>
                  <td class="param-type">string</td>
                  <td><span class="param-opt">optional</span></td>
                  <td>ISO timestamp</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <div class="playground-inputs">
                <div class="form-group">
                  <label for="conn-devid">Device ID</label>
                  <input type="text" id="conn-devid" class="form-input" value="solar-inverter">
                </div>
                <div class="form-group">
                  <label for="conn-kwh">Energy Value (kWh)</label>
                  <input type="number" id="conn-kwh" class="form-input" value="1.25" step="0.01">
                </div>
                <div class="form-group" style="flex-direction: row; align-items: center; gap: 0.5rem;">
                  <input type="checkbox" id="conn-register" checked style="width: auto;">
                  <label for="conn-register">Register/Upsert Device</label>
                </div>
              </div>
              <button class="btn" onclick="runConnectDevice()">Submit Telemetry</button>
              
              <div class="response-header" style="display: none;" id="conn-resp-header">
                <span class="response-status" id="conn-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none;" id="conn-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- GET /api/devices -->
      <section id="devices" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-get">GET</span>
          <span class="endpoint-path">/api/devices</span>
          <div class="endpoint-title">List Registered Devices</div>
        </div>
        <div class="endpoint-desc">
          Fetches all registered devices. If user is authenticated, returns only devices registered to their user profile. If unauthenticated, displays global mock devices.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Description</div>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">This endpoint returns an array of devices including status (online/offline), lastSeen, and live currentPower.</p>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <button class="btn" onclick="runGetDevices()">List Devices</button>
              
              <div class="response-header" style="display: none;" id="devs-resp-header">
                <span class="response-status" id="devs-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none;" id="devs-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- DELETE /api/devices/:externalId -->
      <section id="delete-device" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-delete">DELETE</span>
          <span class="endpoint-path">/api/devices/:externalId</span>
          <div class="endpoint-title">Remove Device</div>
        </div>
        <div class="endpoint-desc">
          Unregisters a device and deletes its accumulated historical readings.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Path Parameters</div>
            <table class="params-table">
              <thead>
                <tr>
                  <th>Param</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="param-name">externalId</td>
                  <td class="param-type">string</td>
                  <td><span class="param-req">required</span></td>
                  <td>Unique external ID of the device to delete.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <div class="playground-inputs">
                <div class="form-group">
                  <label for="del-devid">Device ID to Delete</label>
                  <input type="text" id="del-devid" class="form-input" placeholder="e.g. solar-inverter">
                </div>
              </div>
              <button class="btn" style="background: linear-gradient(135deg, var(--accent-rose) 0%, #be123c 100%); box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);" onclick="runDeleteDevice()">Delete Device</button>
              
              <div class="response-header" style="display: none;" id="del-resp-header">
                <span class="response-status" id="del-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none;" id="del-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- GET /api/readings -->
      <section id="readings" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-get">GET</span>
          <span class="endpoint-path">/api/readings</span>
          <div class="endpoint-title">Get Recent Energy Readings</div>
        </div>
        <div class="endpoint-desc">
          Returns the 100 most recent telemetry readings (device ID, energy in kWh, computed carbon offset in kg CO2e, and timestamp).
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Request Headers</div>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">If API key authentication is enabled, supply <code>x-api-key</code>.</p>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <button class="btn" onclick="runGetReadings()">Fetch Readings</button>
              
              <div class="response-header" style="display: none;" id="readings-resp-header">
                <span class="response-status" id="readings-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none;" id="readings-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- GET /health -->
      <section id="health" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-get">GET</span>
          <span class="endpoint-path">/health</span>
          <div class="endpoint-title">Health Check</div>
        </div>
        <div class="endpoint-desc">
          Public endpoint to report basic health status of the service (useful for monitoring, health checks, and Docker container verification).
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Response Schema</div>
            <pre class="code-block" style="color: #60a5fa">{
  "status": "ok",
  "service": "carbon-api",
  "timestamp": "ISO_DATE_STRING"
}</pre>
          </div>

          <div>
            <div class="section-subtitle">Interactive Console</div>
            <div class="playground">
              <button class="btn" onclick="runHealth()">Test Health Endpoint</button>
              
              <div class="response-header" style="display: none;" id="health-resp-header">
                <span class="response-status" id="health-resp-status">200 OK</span>
              </div>
              <pre class="code-block" style="display: none;" id="health-resp-body"></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- WebSocket Section -->
      <section id="websocket" class="endpoint-card">
        <div class="endpoint-header">
          <span class="method-tag method-ws">WS</span>
          <span class="endpoint-path">ws://localhost:4000</span>
          <div class="endpoint-title">Real-time WebSocket Gateway</div>
        </div>
        <div class="endpoint-desc">
          Establish a persistent bi-directional connection. On connection, it sends initial analytics data. Clients receive real-time updates of devices and live emissions savings broadcasts.
        </div>
        
        <div class="endpoint-body">
          <div>
            <div class="section-subtitle">Message Types Broadcasted</div>
            <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.5rem;">
              <li><code>INIT</code>: Initial values of total active users & live offset metrics.</li>
              <li><code>DEVICES</code>: Pushed on connection and whenever the device registry is updated (contains status array).</li>
              <li><code>EMISSION_UPDATE</code>: Emitted every 5 seconds simulating incoming energy savings from global tracking networks.</li>
            </ul>
          </div>

          <div>
            <div class="section-subtitle">Live WebSocket Stream</div>
            <div class="playground">
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn" id="ws-connect-btn" onclick="toggleWebSocket()">Connect WebSocket</button>
                <div class="status-badge" style="display: none;" id="ws-status-badge">
                  <div class="status-dot" id="ws-status-dot" style="background-color: var(--accent-rose); box-shadow: 0 0 8px var(--accent-rose);"></div>
                  <span id="ws-status-text">Disconnected</span>
                </div>
              </div>
              <pre class="code-block" style="max-height: 250px; background: #020617; font-size: 0.75rem; color: #a78bfa;" id="ws-log">Click "Connect WebSocket" to listen to live events...</pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>

  <script>
    let globalApiKey = '';
    let ws = null;

    function updateGlobalApiKey(val) {
      globalApiKey = val.trim();
    }

    // Scroll Spy for sidebar links
    window.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('id');
          if (entry.isIntersecting) {
            document.querySelectorAll('aside a').forEach(link => {
              link.classList.remove('active');
            });
            const activeLink = document.querySelector(\`aside a[href="#\${id}"]\`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      }, { rootMargin: '-20% 0px -60% 0px' });

      document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
      });
    });

    // Helper to display response
    function showResponse(prefix, status, data) {
      const headerEl = document.getElementById(prefix + '-resp-header');
      const statusEl = document.getElementById(prefix + '-resp-status');
      const bodyEl = document.getElementById(prefix + '-resp-body');

      headerEl.style.display = 'flex';
      bodyEl.style.display = 'block';

      statusEl.textContent = status;
      statusEl.className = 'response-status ' + (status >= 200 && status < 300 ? 'status-2xx' : 'status-4xx');
      
      bodyEl.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    }

    function getHeaders(includeApiKey = false) {
      const headers = { 'Content-Type': 'application/json' };
      if (includeApiKey && globalApiKey) {
        headers['x-api-key'] = globalApiKey;
      }
      return headers;
    }

    // API Handlers
    async function runLogin() {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        showResponse('login', res.status, data);
      } catch (err) {
        showResponse('login', 500, err.message);
      }
    }

    async function runLogout() {
      try {
        const res = await fetch('/api/logout', {
          method: 'POST',
          headers: getHeaders()
        });
        const data = await res.json();
        showResponse('logout', res.status, data);
      } catch (err) {
        showResponse('logout', 500, err.message);
      }
    }

    async function runMe() {
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          headers: getHeaders()
        });
        const data = await res.json();
        showResponse('me', res.status, data);
      } catch (err) {
        showResponse('me', 500, err.message);
      }
    }

    async function runDashboard() {
      try {
        const res = await fetch('/api/dashboard', {
          method: 'GET',
          headers: getHeaders()
        });
        const data = await res.json();
        showResponse('dash', res.status, data);
      } catch (err) {
        showResponse('dash', 500, err.message);
      }
    }

    async function runConnectDevice() {
      const deviceId = document.getElementById('conn-devid').value;
      const kwh = parseFloat(document.getElementById('conn-kwh').value);
      const registerDevice = document.getElementById('conn-register').checked;
      
      try {
        let url = '/api/connect-device';
        if (globalApiKey) {
          url += '?apiKey=' + encodeURIComponent(globalApiKey);
        }
        
        const res = await fetch(url, {
          method: 'POST',
          headers: getHeaders(true),
          body: JSON.stringify({ deviceId, kwh, registerDevice })
        });
        const data = await res.json();
        showResponse('conn', res.status, data);
      } catch (err) {
        showResponse('conn', 500, err.message);
      }
    }

    async function runGetDevices() {
      try {
        const res = await fetch('/api/devices', {
          method: 'GET',
          headers: getHeaders()
        });
        const data = await res.json();
        showResponse('devs', res.status, data);
      } catch (err) {
        showResponse('devs', 500, err.message);
      }
    }

    async function runDeleteDevice() {
      const deviceId = document.getElementById('del-devid').value;
      if (!deviceId) return alert('Please input a device ID');
      
      try {
        let url = '/api/devices/' + encodeURIComponent(deviceId);
        if (globalApiKey) {
          url += '?apiKey=' + encodeURIComponent(globalApiKey);
        }
        
        const res = await fetch(url, {
          method: 'DELETE',
          headers: getHeaders(true)
        });
        const data = await res.json();
        showResponse('del', res.status, data);
      } catch (err) {
        showResponse('del', 500, err.message);
      }
    }

    async function runGetReadings() {
      try {
        let url = '/api/readings';
        if (globalApiKey) {
          url += '?apiKey=' + encodeURIComponent(globalApiKey);
        }
        
        const res = await fetch(url, {
          method: 'GET',
          headers: getHeaders(true)
        });
        const data = await res.json();
        showResponse('readings', res.status, data);
      } catch (err) {
        showResponse('readings', 500, err.message);
      }
    }

    async function runHealth() {
      try {
        const res = await fetch('/health', {
          method: 'GET',
          headers: getHeaders()
        });
        const data = await res.json();
        showResponse('health', res.status, data);
      } catch (err) {
        showResponse('health', 500, err.message);
      }
    }

    // WebSocket logic
    function toggleWebSocket() {
      const btn = document.getElementById('ws-connect-btn');
      const badge = document.getElementById('ws-status-badge');
      const dot = document.getElementById('ws-status-dot');
      const statusText = document.getElementById('ws-status-text');
      const logEl = document.getElementById('ws-log');

      if (ws) {
        ws.close();
        return;
      }

      badge.style.display = 'inline-flex';
      statusText.textContent = 'Connecting...';
      dot.style.backgroundColor = 'var(--accent-blue)';
      dot.style.boxShadow = '0 0 8px var(--accent-blue)';
      logEl.textContent = '';

      const loc = window.location;
      const protocol = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = \`\${protocol}//\${loc.host}\`;
      
      logEl.textContent += \`Initiating connection to \${wsUrl}...\\n\`;

      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          statusText.textContent = 'Connected';
          btn.textContent = 'Disconnect WS';
          dot.style.backgroundColor = 'var(--accent-emerald)';
          dot.style.boxShadow = '0 0 8px var(--accent-emerald)';
          logEl.textContent += \`[System] Connected to Real-time Stream!\\n\`;
        };

        ws.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);
            logEl.textContent = \`[\${new Date().toLocaleTimeString()}] Received \${raw.type}:\\n\${JSON.stringify(raw.data, null, 2)}\\n\\n\` + logEl.textContent;
          } catch (e) {
            logEl.textContent = \`[\${new Date().toLocaleTimeString()}] Received text: \${event.data}\\n\` + logEl.textContent;
          }
        };

        ws.onclose = () => {
          statusText.textContent = 'Disconnected';
          btn.textContent = 'Connect WebSocket';
          dot.style.backgroundColor = 'var(--accent-rose)';
          dot.style.boxShadow = '0 0 8px var(--accent-rose)';
          logEl.textContent = \`[System] WebSocket closed.\\n\` + logEl.textContent;
          ws = null;
        };

        ws.onerror = (err) => {
          logEl.textContent = \`[Error] WebSocket error occurred\\n\` + logEl.textContent;
        };
      } catch (err) {
        logEl.textContent = \`[Error] Failed to connect: \${err.message}\\n\`;
        statusText.textContent = 'Error';
        ws = null;
      }
    }
  </script>
</body>
</html>`;
