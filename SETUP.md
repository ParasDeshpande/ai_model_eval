# Setup & Deployment Guide

Complete walkthrough — from a blank folder to a live hosted dashboard
with Google Sheets data storage and a password-protected Analytics tab.

---

## Overview

```
Your Files  →  GitHub Pages (hosting)
                    ↕  fetch / POST
              Google Apps Script (backend)
                    ↕  read / write
              Google Sheets (database)
```

Total time: ~20 minutes.

---

## Part A — Google Sheets & Apps Script

### A1. Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **Blank spreadsheet**
3. Rename it (top-left) to something like `Diwali AI Evaluation Results`
4. Leave the tab open — the script will create the `Responses` sheet
   and all column headers automatically on the first submission

---

### A2. Open Apps Script

1. Inside the spreadsheet, click **Extensions → Apps Script**
2. A new browser tab opens with a code editor
3. Select all the placeholder code (`Ctrl+A`) and **delete it**

---

### A3. Paste the script

1. Open `Code.gs` from this project folder
2. Copy the entire file contents (`Ctrl+A`, `Ctrl+C`)
3. Paste into the Apps Script editor (`Ctrl+V`)
4. Press **Ctrl+S** to save
5. When prompted for a project name, enter: `Evaluation Collector`

---

### A4. Deploy as a Web App

1. Click the blue **Deploy** button (top-right) → **New deployment**
2. Click the **gear icon ⚙️** next to "Select type" → choose **Web app**
3. Set the fields exactly as below:

   | Field | Value |
   |---|---|
   | Description | Evaluation Collector v1 |
   | Execute as | **Me** *(your Google account)* |
   | Who has access | **Anyone** |

   > `Anyone` is required — it lets your hosted page POST data to the
   > script without visitors needing a Google account.

4. Click **Deploy**

5. **Authorize the app** when prompted:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** (bottom-left of the warning screen)
   - Click **Go to Evaluation Collector (unsafe)**
   - Click **Allow**

   > The "unsafe" label is standard Google boilerplate for any
   > unverified script — it just means you haven't submitted it
   > for Google's OAuth verification process.

6. You will now see a **Web app URL**:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. **Copy this URL** — you need it in the next step

---

### A5. Paste the URL into dashboard.html

1. Open `dashboard.html` in a text editor or the Kiro IDE
2. Find these two lines near the top of the `<script>` block:

   ```js
   const APPS_SCRIPT_URL = "YOUR_APPS_SCRIPT_URL_HERE";
   const ANALYTICS_PASS  = "diwali2024";
   ```

3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with your copied URL:

   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   const ANALYTICS_PASS  = "diwali2024";   // ← change this password too!
   ```

4. **Change `ANALYTICS_PASS`** to a private password only you know —
   this is the password that guards the Analytics tab in the UI.

5. Save the file (`Ctrl+S`)

---

### A6. Test locally before deploying

1. Open a terminal in the project folder and run:
   ```
   npx serve .
   ```
   *(If prompted to install `serve`, press `y`)*

2. Open `http://localhost:3000/dashboard.html` in your browser

3. Fill in the form completely and hit **Submit Evaluation**

4. Go back to your Google Sheet — you should see a new **Responses**
   tab with a header row and your test submission as the first row

5. Test the **Analytics tab** in the dashboard:
   - Click `📊 Analytics` in the tab nav
   - Enter your password
   - You should see charts populated with your test submission

> If the submission spins and fails, see the Troubleshooting section below.

---

## Part B — GitHub Pages Deployment

### B1. Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon (top-right) → **New repository**
3. Fill in:
   - **Repository name:** `diwali-ai-evaluation` (or any name)
   - **Visibility:** `Public` *(required for free GitHub Pages)*
   - Leave everything else as default
4. Click **Create repository**
5. **Copy the repository URL** shown on the next screen, e.g.:
   ```
   https://github.com/yourusername/diwali-ai-evaluation.git
   ```

---

### B2. Initialize git and push from your machine

Open a terminal (PowerShell on Windows) and run these commands
**one by one** from inside the project folder:

```powershell
# Navigate to the project folder
cd "d:\Projects\josh talks"

# Initialize a git repository
git init

# Stage all project files
git add dashboard.html Code.gs SETUP.md
git add "GPT1-1.png" "GPT1-2.png"
git add "gemini-2.5-1.jpg" "gemini-2.5-2.jpg"
git add "gemini-3.1-flash-1.jpg" "gemini-3.1-flash-2.jpg"

# Create the first commit
git commit -m "Initial commit: Diwali AI evaluation dashboard"

# Rename the default branch to main
git branch -M main

# Connect to your GitHub repository (replace the URL with yours)
git remote add origin https://github.com/yourusername/diwali-ai-evaluation.git

# Push to GitHub
git push -u origin main
```

> If this is your first time using git on this machine, you may be
> asked to sign in to GitHub — a browser window will open automatically.

---

### B3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top tab bar)
3. Click **Pages** (left sidebar, under "Code and automation")
4. Under **Build and deployment → Source**, select:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**
6. Wait 1–2 minutes, then GitHub will show your live URL:
   ```
   https://yourusername.github.io/diwali-ai-evaluation/
   ```

7. Your dashboard is live at:
   ```
   https://yourusername.github.io/diwali-ai-evaluation/dashboard.html
   ```

---

### B4. Share the link

Send participants this URL:
```
https://yourusername.github.io/diwali-ai-evaluation/dashboard.html
```

The Analytics tab is at the same URL — only you can unlock it with your password.

---

## Part C — Updating after changes

If you edit `dashboard.html` (e.g. to change the password or update
the Apps Script URL), push the update to GitHub:

```powershell
cd "d:\Projects\josh talks"
git add dashboard.html
git commit -m "Update dashboard"
git push
```

GitHub Pages will redeploy automatically within ~1 minute.

If you update `Code.gs`:
1. Open Apps Script → **Deploy → Manage deployments**
2. Click the pencil ✏️ on your existing deployment
3. Set Version to **New version**
4. Click **Deploy** — the URL stays the same, no changes needed in dashboard.html

---

## Sheet structure (for reference)

Every form submission adds one row to the `Responses` sheet:

| Columns | Contents |
|---|---|
| A | Timestamp (ISO format) |
| B–D | Participant name, email, age |
| E | Set A winner (A / B / C / Tie) |
| F–H | Set A · Model A scores (Cultural, Realism, Prompt) |
| I | Set A · Model A average |
| J–L | Set A · Model B scores |
| M | Set A · Model B average |
| N–P | Set A · Model C scores |
| Q | Set A · Model C average |
| R–T | Set A defects per model (pipe-separated) |
| U | Set B winner |
| V–X | Set B · Model A scores (Cultural, Anat, Prompt) |
| Y | Set B · Model A average |
| Z–AB | Set B · Model B scores |
| AC | Set B · Model B average |
| AD–AF | Set B · Model C scores |
| AG | Set B · Model C average |
| AH–AJ | Set B defects per model |
| AK | Overall winner |
| AL | Qualitative feedback |
| AM–AO | Combined averages (Model A, B, C) |

---

## Troubleshooting

**Submission spins forever**
- The URL in `dashboard.html` must end with `/exec`, not `/dev`
- "Who has access" must be **Anyone**, not "Anyone with Google account"
- Try opening the URL directly in a browser tab — you should see:
  `{"status":"ok","message":"Endpoint is live."}`

**Analytics tab shows "Could not load data"**
- Same URL check as above
- The `doGet` with `?action=getAll` requires the same deployment settings
- Open Apps Script → **Executions** (left sidebar) to read error logs

**No Responses tab in the sheet**
- The tab is created on the first POST — submit the form at least once
- Check Apps Script → Executions for any errors

**GitHub Pages shows a 404**
- Wait 2–3 minutes after enabling Pages — it takes time to build
- Make sure the branch is `main` (not `master`) and folder is `/`
- The file must be named exactly `dashboard.html` (case-sensitive on GitHub)

**Images not loading on the hosted site**
- All 6 image files must be committed and pushed alongside `dashboard.html`
- File names are case-sensitive — `GPT1-1.png` not `gpt1-1.png`
- Run `git status` to confirm all files are tracked

**CORS error on Analytics fetch**
- This only happens when testing via `file://` — always use `npx serve .` locally
- On the live GitHub Pages URL this will not occur
