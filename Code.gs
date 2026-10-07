/**
 * Google Apps Script — Diwali AI Image Evaluation Collector
 * ---------------------------------------------------------
 * Two actions:
 *   POST (no param)      → append a new submission row
 *   GET  ?action=getAll  → return all rows as JSON (for Analytics tab)
 *
 * Deploy as Web App → Execute as Me → Anyone can access
 */

var SHEET_NAME = "Responses";

// ── GET handler ────────────────────────────────────────────────────────────
// Uses HtmlService instead of ContentService so Apps Script serves the
// response with Access-Control-Allow-Origin: * headers automatically.
// This allows fetch() in the browser to read the response body (CORS fix).
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || "";

  if (action === "getAll") {
    try {
      var ss    = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_NAME);

      var payload;
      if (!sheet || sheet.getLastRow() < 2) {
        payload = { status: "ok", count: 0, rows: [] };
      } else {
        var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        var data    = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
        var rows = data.map(function(row) {
          var obj = {};
          headers.forEach(function(h, i) { obj[h] = row[i]; });
          return obj;
        });
        payload = { status: "ok", count: rows.length, rows: rows };
      }

      return HtmlService
        .createHtmlOutput(JSON.stringify(payload))
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (err) {
      return HtmlService
        .createHtmlOutput(JSON.stringify({ status: "error", message: err.toString() }))
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
  }

  // Default GET — health check
  return HtmlService
    .createHtmlOutput(JSON.stringify({ status: "ok", message: "Endpoint is live." }))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── POST handler ───────────────────────────────────────────────────────────
// Called on form submission to append a row
function doPost(e) {
  try {
    var raw  = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Auto-create sheet + headers on first run
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      writeHeader(sheet);
    } else if (sheet.getLastRow() === 0) {
      writeHeader(sheet);
    }

    sheet.appendRow(buildRow(data));

    return jsonResponse({ status: "success", message: "Submission saved." });

  } catch (err) {
    return jsonResponse({ status: "error", message: err.toString() });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeHeader(sheet) {
  sheet.appendRow(buildHeaders());
  sheet.setFrozenRows(1);
  var r = sheet.getRange(1, 1, 1, buildHeaders().length);
  r.setBackground("#1a0a00");
  r.setFontColor("#f9c74f");
  r.setFontWeight("bold");
}

// ── Column headers ─────────────────────────────────────────────────────────
function buildHeaders() {
  return [
    "Timestamp", "Name", "Email", "Age",
    "SetA_Winner",
    "SetA_ModelA_Cultural", "SetA_ModelA_Realism", "SetA_ModelA_Prompt", "SetA_ModelA_Avg",
    "SetA_ModelB_Cultural", "SetA_ModelB_Realism", "SetA_ModelB_Prompt", "SetA_ModelB_Avg",
    "SetA_ModelC_Cultural", "SetA_ModelC_Realism", "SetA_ModelC_Prompt", "SetA_ModelC_Avg",
    "SetA_ModelA_Defects", "SetA_ModelB_Defects", "SetA_ModelC_Defects",
    "SetB_Winner",
    "SetB_ModelA_Cultural", "SetB_ModelA_Anat", "SetB_ModelA_Prompt", "SetB_ModelA_Avg",
    "SetB_ModelB_Cultural", "SetB_ModelB_Anat", "SetB_ModelB_Prompt", "SetB_ModelB_Avg",
    "SetB_ModelC_Cultural", "SetB_ModelC_Anat", "SetB_ModelC_Prompt", "SetB_ModelC_Avg",
    "SetB_ModelA_Defects", "SetB_ModelB_Defects", "SetB_ModelC_Defects",
    "Overall_Winner", "Overall_Feedback",
    "Combined_Avg_ModelA", "Combined_Avg_ModelB", "Combined_Avg_ModelC"
  ];
}

// ── Row builder ────────────────────────────────────────────────────────────
function buildRow(d) {
  var p  = d.participant || {};
  var sA = d.setA        || {};
  var sB = d.setB        || {};
  var ov = d.overall     || {};
  var scA = sA.scores  || { A:{}, B:{}, C:{} };
  var scB = sB.scores  || { A:{}, B:{}, C:{} };
  var dfA = sA.defects || { A:[], B:[], C:[] };
  var dfB = sB.defects || { A:[], B:[], C:[] };

  function avg3(a,b,c) {
    var vals = [a,b,c].map(Number).filter(function(v){ return !isNaN(v) && v > 0; });
    return vals.length ? (vals.reduce(function(s,v){return s+v;},0)/vals.length).toFixed(2) : "";
  }
  function jd(arr) { return Array.isArray(arr) ? arr.join(" | ") : ""; }
  function comb(a,b) {
    var x=parseFloat(a), y=parseFloat(b);
    return (!isNaN(x)&&!isNaN(y)) ? ((x+y)/2).toFixed(2) : "";
  }

  var aA=avg3(scA.A.cultural,scA.A.realism,scA.A.prompt);
  var aB=avg3(scA.B.cultural,scA.B.realism,scA.B.prompt);
  var aC=avg3(scA.C.cultural,scA.C.realism,scA.C.prompt);
  var bA=avg3(scB.A.cultural,scB.A.anat,   scB.A.prompt);
  var bB=avg3(scB.B.cultural,scB.B.anat,   scB.B.prompt);
  var bC=avg3(scB.C.cultural,scB.C.anat,   scB.C.prompt);

  return [
    new Date().toISOString(),
    p.name||"", p.email||"", p.age||"",
    sA.winner||"",
    scA.A.cultural||"",scA.A.realism||"",scA.A.prompt||"",aA,
    scA.B.cultural||"",scA.B.realism||"",scA.B.prompt||"",aB,
    scA.C.cultural||"",scA.C.realism||"",scA.C.prompt||"",aC,
    jd(dfA.A),jd(dfA.B),jd(dfA.C),
    sB.winner||"",
    scB.A.cultural||"",scB.A.anat||"",scB.A.prompt||"",bA,
    scB.B.cultural||"",scB.B.anat||"",scB.B.prompt||"",bB,
    scB.C.cultural||"",scB.C.anat||"",scB.C.prompt||"",bC,
    jd(dfB.A),jd(dfB.B),jd(dfB.C),
    ov.winner||"",ov.feedback||"",
    comb(aA,bA),comb(aB,bB),comb(aC,bC)
  ];
}
