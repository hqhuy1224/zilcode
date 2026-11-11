var DashboardTuyenDung = {
    url: null,
    frame: null,
    core: null,
    scriptUrl: typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : '',

    run: function (p) {
        p = p || {};
        if (typeof NUT === 'undefined' || !NUT.services || !NUT.services[3]) {
            throw new Error('Chưa có phiên ứng dụng hoặc service dữ liệu tuyển dụng.');
        }
        var title = typeof divTitle !== 'undefined' ? divTitle : document.getElementById('divTitle');
        if (!title) throw new Error('Không tìm thấy vùng tiêu đề cửa sổ báo cáo.');
        // Chữ ký thực tế trong wwwroot/js/nut.js: (divTitle, winid, tag, callback).
        var a = NUT.createWindowTitle(title, 'DashboardTuyenDung');
        if (!a) return;
        a.innerHTML = '📊 Dashboard tuyển dụng';
        this.url = NUT.services[3].url;
        this.initLayout(a.div, p);
    },

    initLayout: function (container, p) {
        if (!container) throw new Error('Không tìm thấy vùng nội dung báo cáo.');
        container.replaceChildren();
        var frame = document.createElement('iframe');
        frame.title = 'Dashboard tổng quan tuyển dụng';
        frame.style.cssText = 'display:block;width:100%;height:100%;border:0;background:#f4f7fb';
        this.frame = frame;
        this.core = this.createCore();
        var self = this;
        frame.onload = function () {
            if (self.frame !== frame || !frame.isConnected) return;
            var win = frame.contentWindow;
            win.RecruitmentDashboardCore = self.core;
            win.DashboardTuyenDungOptions = p || {};
            self.initReport(win);
        };
        var base = this.scriptUrl ? new URL('.', this.scriptUrl).href : new URL('site/3/112/', document.baseURI).href;
        var safeBase = base.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
        frame.srcdoc = this.pageMarkup().replace('<head>', '<head><base href="' + safeBase + '">');
        container.appendChild(frame);
    },

    pullData: function () {
        if (this.frame && this.frame.contentWindow.DashboardTuyenDungReport) return this.frame.contentWindow.DashboardTuyenDungReport.refresh();
    },

    setData: function (data, mapping) {
        if (!this.frame || !this.frame.contentWindow.DashboardTuyenDungReport) throw new Error('Cửa sổ báo cáo chưa sẵn sàng.');
        return this.frame.contentWindow.DashboardTuyenDungReport.setData(data, mapping);
    },

    /* HTML/CSS được đặt trong iframe cùng origin để không ảnh hưởng các báo cáo khác. */
    pageMarkup: function () {
        return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Tổng quan tuyển dụng | ORIT</title>
    <style>
        :root{--page:#f4f7fb;--surface:#fff;--ink:#142438;--muted:#6b7a8d;--line:#e5ebf2;--teal:#10968b;--teal-soft:#e8f8f5;--indigo:#6366e8;--indigo-soft:#eeefff;--amber:#e7a331;--amber-soft:#fff6e7;--rose:#e66a88;--rose-soft:#fff0f4;--radius:18px;--shadow:0 4px 22px rgba(30,53,80,.035)}
        *{box-sizing:border-box}body{margin:0;background:var(--page);color:var(--ink);font-family:"Segoe UI",Arial,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}button,input,select{font:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.45}a{color:var(--teal)}button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible,[tabindex]:focus-visible{outline:3px solid #92c8fb;outline-offset:3px}svg{display:block}.icon{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}[hidden]{display:none!important}
        .app-header{background:var(--surface);border-bottom:1px solid var(--line)}.header-inner{max-width:1600px;margin:auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:12px;min-width:0}.brand-logo{width:78px;height:42px;object-fit:contain}.brand-divider{width:1px;height:28px;background:var(--line);margin:0 6px}.brand-product{font-size:14px;font-weight:650;color:#35485f}.brand-caption{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase}.header-right{display:flex;align-items:center;gap:10px}.header-badge{display:flex;align-items:center;gap:7px;font-size:12px;color:#52647b;background:#f4f7fb;border:1px solid var(--line);padding:7px 12px;border-radius:30px}.header-badge .icon{width:14px;height:14px}
        main{max-width:1600px;padding:30px 32px 24px;margin:auto}.page-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:25px}.eyebrow{color:var(--teal);font-size:11px;font-weight:750;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px}h1{font-size:30px;line-height:1.25;letter-spacing:-.8px;margin:0;font-weight:750}.page-subtitle{color:var(--muted);margin:8px 0 0;font-size:13px}.heading-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid #dbe3ed;background:#fff;color:#415269;padding:10px 15px;border-radius:10px;font-size:12px;font-weight:650;min-height:40px;transition:background .15s,box-shadow .15s}.button:hover{background:#f7f9fc;box-shadow:0 2px 8px #192c4210}.button-primary{background:var(--teal);border-color:var(--teal);color:#fff;box-shadow:0 3px 8px #10968b1c}.button-primary:hover{background:#0c857c;border-color:#0c857c}.button-quiet{border-color:transparent;color:var(--muted);background:transparent}.button-quiet:hover{background:#eef3f8}.button .icon{width:16px;height:16px}.connection-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 14px;font-size:11px;color:var(--muted)}.data-status{display:inline-flex;align-items:center;gap:7px;font-weight:650;color:#4d657f}.data-status:before{content:"";width:6px;height:6px;border-radius:50%;background:#99adc2;flex-shrink:0}.data-status.live,.data-status.success,.data-status.ready{color:#0b8275}.data-status.live:before,.data-status.success:before,.data-status.ready:before{background:var(--teal);box-shadow:0 0 0 3px #10968b13}.data-status.error{color:#bd4664}.data-status.error:before{background:var(--rose)}.data-status.loading:before{background:var(--amber);animation:pulse 1.6s ease-in-out infinite}@keyframes pulse{50%{opacity:.35}}
        .filter-card{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);margin-bottom:20px;overflow:hidden}.filter-top{padding:17px 20px 14px;display:flex;align-items:center;justify-content:space-between;gap:14px;border-bottom:1px solid #edf1f6}.filter-title{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:700}.filter-title .icon{color:var(--teal);width:16px;height:16px}.filter-tip{color:var(--muted);font-size:11px}.filter-fields{display:grid;grid-template-columns:1.05fr 1fr 1fr .9fr 1.1fr 1.1fr 1.1fr;gap:14px;padding:18px 20px 16px}.field{min-width:0}.field label{display:block;font-size:11px;font-weight:650;color:#627087;margin-bottom:7px}.field select,.field input{width:100%;height:39px;border:1px solid #dfe6ef;border-radius:8px;background:#fbfcfe;color:#2d4057;padding:8px 10px;font-size:12px;min-width:0}.field select{padding-right:22px}.field input:hover,.field select:hover{border-color:#b6c8d9}.field input:focus,.field select:focus{background:#fff;border-color:#70bab2}.filter-bottom{padding:0 20px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between}.search-field{position:relative;max-width:420px;width:100%}.search-field .icon{position:absolute;top:11px;left:12px;width:16px;height:16px;color:#94a0b0}.search-field input{padding-left:38px}.filter-bottom .button{min-height:37px;padding:8px 11px;white-space:nowrap;font-size:11px}.scope-note{color:#768397;font-size:11px;padding:12px 20px;margin:0;background:#fafbfd;border-top:1px solid #edf1f6;line-height:1.6}.scope-note strong{color:#54647a;font-weight:650}.message{padding:13px 16px;margin:0 0 18px;border:1px solid #e7d295;background:#fff9e9;color:#866620;border-radius:10px;font-size:12px;line-height:1.6}.message.error{border-color:#f0c5d0;background:#fff4f6;color:#9a3f58}
        .kpi-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px;margin-bottom:24px}.kpi-card{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:19px 18px 16px;min-width:0;box-shadow:var(--shadow);overflow:hidden}.kpi-card:after{content:"";position:absolute;top:0;left:0;width:100%;height:3px;background:#c7d4e3}.kpi-card.teal:after{background:var(--teal)}.kpi-card.indigo:after{background:var(--indigo)}.kpi-card.amber:after{background:var(--amber)}.kpi-card.rose:after{background:var(--rose)}.kpi-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}.kpi-label{color:#637289;font-size:11px;font-weight:650;line-height:1.5}.kpi-icon{display:flex;align-items:center;justify-content:center;width:31px;height:31px;flex-shrink:0;color:var(--teal);background:var(--teal-soft);border-radius:9px}.kpi-icon .icon{width:16px;height:16px}.indigo .kpi-icon{color:var(--indigo);background:var(--indigo-soft)}.amber .kpi-icon{color:#c88a25;background:var(--amber-soft)}.rose .kpi-icon{color:var(--rose);background:var(--rose-soft)}.kpi-value{font-size:30px;font-weight:760;letter-spacing:-.8px;line-height:1.2;font-variant-numeric:tabular-nums;margin:6px 0 7px}.kpi-meta{color:#8a96a6;font-size:10px;line-height:1.5}.kpi-meta strong{color:#597089;font-weight:600}.kpi-unit{font-size:11px;color:var(--muted);font-weight:500;margin-left:4px;letter-spacing:0}.kpi-delta{font-size:10px;color:var(--teal);background:var(--teal-soft);padding:3px 7px;border-radius:20px}
        .section-label{display:flex;align-items:center;gap:9px;margin:0 0 12px;font-size:11px;font-weight:750;letter-spacing:.09em;text-transform:uppercase;color:#768397}.section-label:after{content:"";height:1px;background:var(--line);flex:1}.chart-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px;margin-bottom:24px}.panel{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);min-width:0;overflow:hidden}.panel-wide{grid-column:span 8}.panel-third{grid-column:span 4}.panel-half{grid-column:span 6}.panel-heading{padding:20px 22px 0;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.panel-heading h2{font-size:14px;font-weight:750;line-height:1.4;margin:0;letter-spacing:-.1px}.panel-description{color:#8a96a6;font-size:11px;line-height:1.5;margin:5px 0 0}.panel-symbol{height:29px;width:29px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f4f7fb;color:#8393a7;flex-shrink:0}.panel-symbol .icon{width:15px;height:15px}.panel-body{padding:15px 22px 20px}.chart-area{width:100%;min-height:260px;position:relative}.chart-area svg{width:100%;height:auto;overflow:visible}.chart-area svg text{font-family:"Segoe UI",Arial,sans-serif}.chart-area svg [tabindex]{outline-offset:2px}.chart-area.compact{min-height:210px}.chart-area.medium{min-height:236px}.chart-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:245px;padding:26px 20px;color:#8a96a6;font-size:12px;gap:11px}.chart-empty .icon{width:29px;height:29px;stroke:#c3ccd8}.chart-empty small{font-size:11px;color:#a2acbb}.compact .chart-empty{min-height:200px}.panel-caption{color:#7e8b9e;font-size:10px;line-height:1.6;margin:12px 0 0;padding-top:11px;border-top:1px solid #eff3f7}.chart-legend{display:flex;gap:16px;flex-wrap:wrap;align-items:center;font-size:10px;color:#7e8b9e;margin:2px 0 14px}.legend-item{display:inline-flex;align-items:center;gap:6px}.legend-dot{display:inline-block;width:8px;height:8px;border-radius:3px;flex-shrink:0}.legend-line{display:inline-block;width:17px;height:3px;border-radius:4px}.bar-list{display:flex;flex-direction:column;gap:15px;padding:4px 0}.bar-row{min-width:0}.bar-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:6px}.bar-label{font-size:11px;color:#627087;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bar-value{font-size:11px;font-weight:700;color:#3c5069;font-variant-numeric:tabular-nums}.bar-track{height:9px;background:#f0f4f8;border-radius:5px;overflow:hidden}.bar-fill{height:100%;border-radius:5px;background:var(--teal);min-width:0}.bar-pair{display:flex;gap:3px;flex-direction:column}.bar-pair .bar-track{height:7px}.chart-list{display:flex;flex-direction:column;gap:12px}.chart-list-item{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#68778c;gap:8px}.chart-list-label{display:flex;gap:7px;align-items:center;min-width:0}.chart-list-value{font-weight:700;font-variant-numeric:tabular-nums;color:#354a64}.donut-layout{display:flex;align-items:center;gap:20px}.donut-layout svg{max-width:170px;flex:0 0 45%;width:45%}.donut-layout .chart-list{flex:1}.chart-tooltip{position:fixed;z-index:1000;max-width:300px;border:1px solid #ffffff24;border-radius:9px;background:#162c44;color:#fff;box-shadow:0 6px 22px #14243833;padding:10px 13px;pointer-events:none;font-size:11px;line-height:1.7}.chart-tooltip strong{font-weight:700}.chart-tooltip .tooltip-muted{color:#b4c5d6}
        .insights-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-bottom:24px}.insights-grid .panel{height:100%}.interview-list{display:flex;flex-direction:column;gap:0;max-height:280px;overflow:auto}.interview-item{display:flex;align-items:flex-start;gap:11px;padding:12px 0;border-bottom:1px solid #edf1f6}.interview-item:first-child{padding-top:3px}.interview-item:last-child{border-bottom:0}.interview-date{flex:0 0 43px;border:1px solid #dfece9;background:#f0faf7;border-radius:8px;text-align:center;color:#14867c;padding:5px 3px;font-size:10px;line-height:1.3}.interview-date strong{display:block;font-size:18px;font-weight:750;line-height:1.4}.interview-main{min-width:0;flex:1;font-size:11px;color:#7c899b}.interview-main strong,.interview-title{display:block;color:#3c5069;font-size:12px;font-weight:650;margin-bottom:3px}.interview-time{display:inline-flex;gap:4px;align-items:center;white-space:nowrap;font-size:10px;color:#728399;padding:3px 6px;border-radius:5px;background:#f3f6fa}.interview-time .icon{width:12px;height:12px}.interview-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:5px}
        .table-panel{margin-bottom:20px}.table-panel .panel-heading{padding-bottom:16px;align-items:center}.table-actions{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--muted)}.table-tabs{display:flex;align-items:center;gap:6px;padding:0 22px 15px;border-bottom:1px solid var(--line);overflow-x:auto}.table-tab{border:1px solid transparent;background:transparent;color:#7c899b;font-size:12px;font-weight:650;padding:8px 13px;border-radius:8px;white-space:nowrap}.table-tab:hover{background:#f4f7fb}.table-tab.active,.table-tab[aria-selected="true"]{color:#0d877d;background:var(--teal-soft);border-color:#d3ece7}.tab-count{font-size:10px;border-radius:5px;padding:2px 5px;background:#fff8;margin-left:5px}.table-scroll{overflow-x:auto;max-width:100%;min-height:180px}table{width:100%;border-collapse:collapse;font-size:11px;text-align:left}thead{background:#f8fafc}th{color:#7e8b9e;font-size:10px;font-weight:700;padding:12px 16px;border-bottom:1px solid var(--line);white-space:nowrap}td{padding:13px 16px;border-bottom:1px solid #edf1f6;color:#53667e;vertical-align:middle;line-height:1.5}th:first-child,td:first-child{padding-left:22px}th:last-child,td:last-child{padding-right:22px}tbody tr:last-child td{border-bottom:0}tbody tr:hover{background:#fbfcff}td.number{text-align:right;font-variant-numeric:tabular-nums}td strong{color:#354a64;font-weight:650}.table-empty{padding:40px 22px;text-align:center;color:#95a0af}.table-cell-main{font-weight:650;color:#354a64}.table-cell-sub{font-size:10px;color:#94a0b0;margin-top:3px}.table-link{color:#159389;text-decoration:none;font-weight:650}.table-link:hover{text-decoration:underline}.badge,.status-pill{display:inline-flex;align-items:center;gap:5px;border-radius:5px;padding:3px 7px;background:#f0f4f8;color:#6b7c92;font-size:10px;font-weight:600;white-space:nowrap;line-height:1.5}.badge.teal,.badge.success,.status-pill.teal,.status-pill.success{background:var(--teal-soft);color:#138477}.badge.indigo,.badge.info,.status-pill.indigo,.status-pill.info{background:var(--indigo-soft);color:#6966c9}.badge.amber,.badge.warning,.status-pill.amber,.status-pill.warning{background:var(--amber-soft);color:#b98528}.badge.rose,.badge.danger,.status-pill.rose,.status-pill.danger{background:var(--rose-soft);color:#ca6381}.table-footer{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 22px;border-top:1px solid var(--line);color:#8a96a6;font-size:11px}.pagination{display:flex;align-items:center;gap:12px;white-space:nowrap}.pagination .button{padding:6px 8px;min-height:30px;border-radius:7px}.pagination .icon{width:13px;height:13px}#pageInfo{font-size:10px;color:#6f7e92;font-variant-numeric:tabular-nums}.footer{display:flex;justify-content:space-between;gap:20px;color:#96a1af;font-size:10px;line-height:1.7;padding:4px 0 8px}.footer p{margin:0}.footer-brand{font-weight:700;letter-spacing:.04em;white-space:nowrap;color:#7e8fa4}
        .donut-layout{display:grid;grid-template-columns:minmax(110px,170px) minmax(0,1fr);gap:16px}.donut-layout>*{min-width:0}.donut-layout svg{width:100%;max-width:170px;flex:none}.interview-time{white-space:normal;overflow-wrap:anywhere;align-self:flex-start;max-width:100%;min-width:0}.interview-date{overflow-wrap:anywhere}.chart-footnote{color:#7e8b9e;font-size:10px;line-height:1.6;margin:12px 0 0;padding-top:11px;border-top:1px solid #eff3f7}
        :root{--page:#f3f6fb;--ink:#172b4d;--teal:#089b8f;--indigo:#6366ef;--shadow:0 6px 28px rgba(30,53,80,.045)}body{background:radial-gradient(ellipse at 10% 0%,#e8eefc80,transparent 40%),var(--page)}.app-header{background:#ffffffeb}.brand-product{font-size:15px}.brand-caption{letter-spacing:.1em}.eyebrow{letter-spacing:.15em}h1{font-size:32px}.page-subtitle{font-size:14px}.button{min-height:42px;transition:background .18s,box-shadow .18s,transform .18s}.button:active{transform:translateY(1px)}.kpi-card{border-radius:16px;transition:transform .2s,box-shadow .2s}.kpi-card:hover{transform:translateY(-3px);box-shadow:0 9px 24px #263f5910}.kpi-meta{font-size:11px}.kpi-label{font-size:12px}.panel{border-color:#e3eaf4;box-shadow:var(--shadow)}.panel-full{grid-column:span 12}.panel-heading h2{font-size:15px}.panel-description{font-size:12px;color:#7b8aa0}.panel-heading>div{min-width:0}.chart-export{min-height:34px;padding:6px 10px;border-radius:8px;font-size:11px;background:#f5faf8;color:#218362;border-color:#dfeee6;flex-shrink:0}.chart-export .icon{width:14px;height:14px}.chart-export:hover,.button-excel:hover{background:#eaf7f0}.button-excel{color:#218362;border-color:#cfe8da;background:#f2faf5}.chart-legend{font-size:12px;gap:18px;margin-bottom:18px}.legend-dot{width:9px;height:9px}.chart-scroll{overflow-x:auto;scrollbar-width:thin;padding:0 0 5px}.chart-scroll svg{display:block;min-width:560px}.chart-area{min-height:255px}.chart-area svg{overflow:hidden}.chart-caption,.panel-caption{font-size:11px}.position-bars{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:36px;row-gap:20px}.bar-label,.bar-value,.chart-list-item,.chart-list-value{font-size:12px}.bar-track{height:10px;background:#eef2f8}.bar-fill{transition:width .5s ease,filter .18s}.chart-list-item{display:block}.chart-list-label{overflow-wrap:anywhere}.bar-header{margin-bottom:8px}.bar-row[data-tip],.chart-list-item[data-tip]{padding:8px;border-radius:9px;transition:background .18s;cursor:default}.bar-row.is-hovered,.chart-list-item.is-hovered{background:#f2f6fc}.chart-hit{cursor:crosshair;outline:none}.chart-hit .hover-band{fill:#eef2ff;opacity:0;transition:opacity .15s}.chart-hit .hover-guide{opacity:0;stroke:#93a4bb;stroke-dasharray:4 4}.chart-hit.is-hovered .hover-band,.chart-hit:focus-visible .hover-band,.chart-hit.is-hovered .hover-guide,.chart-hit:focus-visible .hover-guide{opacity:1}.chart-hit .chart-bar{transition:filter .15s}.chart-hit.is-hovered .chart-bar{filter:brightness(1.12)}.chart-hit .line-marker{transition:r .15s,stroke-width .15s}.chart-hit.is-hovered .line-marker{r:6;stroke-width:3}.line-path{fill:none;stroke-width:2.8;stroke-linejoin:round;stroke-linecap:round;pointer-events:none}.donut-layout{display:flex;flex-direction:column;gap:18px}.donut-graphic{width:194px;max-width:100%;margin:auto}.donut-layout svg{width:100%;max-width:194px}.donut-layout .chart-list{width:100%;gap:3px;max-height:180px;overflow:auto;scrollbar-width:thin}.donut-slice{cursor:pointer;transition:stroke-width .18s,filter .18s;pointer-events:stroke}.donut-slice.is-hovered{stroke-width:26;filter:brightness(1.12)}.share-label{font-size:11px;color:#8996a9;font-weight:400;margin-left:8px}.chart-tooltip{min-width:215px;max-width:310px;padding:14px 16px;border-radius:13px;background:#182b48ed;backdrop-filter:blur(12px);box-shadow:0 12px 32px #14243833;transition:opacity .12s;animation:tip-in .14s ease-out;font-size:12px;line-height:1.6}.tooltip-title{font-size:12px;font-weight:700;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #ffffff26}.tooltip-row{display:flex;align-items:center;justify-content:space-between;gap:24px;margin:5px 0}.tooltip-row span{display:flex;align-items:center;gap:7px;color:#d4dfed}.tooltip-row b{font-size:14px;font-variant-numeric:tabular-nums}.tooltip-note{margin-top:9px;font-size:11px;color:#bdcce0;max-width:250px}@keyframes tip-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.detail-toolbar{padding:18px 22px 12px;display:grid;grid-template-columns:1.6fr repeat(5,minmax(115px,1fr)) auto;gap:12px;align-items:end}.detail-toolbar:has(#detailSourceField:not([hidden])){grid-template-columns:1.4fr repeat(6,minmax(100px,1fr)) auto}.detail-toolbar .button{font-size:11px;white-space:nowrap;min-height:39px;padding:8px}.detail-filter-note{margin:0;padding:0 22px 15px;color:#8391a4;font-size:11px}.detail-filter-note.error{color:#bc4165}.table-tabs{padding-bottom:12px}.table-tab{font-size:13px;min-height:40px}table{font-size:12px}th{font-size:11px}td{padding-top:15px;padding-bottom:15px}.status-pill{font-size:11px}.table-summary-label{color:#445b78;font-weight:600}.interview-main strong{font-size:13px}.interview-main{font-size:12px}.interview-time{font-size:11px}.filter-card{border-radius:16px}.filter-fields .field label{font-size:12px}.field select,.field input{font-size:13px;height:40px}.filter-title{font-size:14px}.scope-note{font-size:11px}.connection-row{margin-bottom:18px}.footer{font-size:11px}
        #sourceChart{overflow:visible}#requestStatusChart,#planStatusChart{max-height:245px;overflow:auto;scrollbar-width:thin}#exportFeedback{color:#218362}
        .panel-filters{display:grid;grid-template-columns:minmax(0,1fr) minmax(125px,1.12fr);align-items:center;gap:8px;padding:13px 22px 0}.panel-filters select,.panel-filters input{height:33px;min-width:0;width:100%;border:1px solid #e0e8f2;background:#f8fafd;border-radius:8px;padding:5px 9px;font-size:11px;color:#536783}.panel-filters select:hover,.panel-filters input:hover{border-color:#a9c9c5}.panel-filters input:disabled{opacity:.45}.panel-period{position:relative;min-width:0}.panel-period .icon{position:absolute;left:9px;top:10px;width:13px;height:13px;color:#7994ac;pointer-events:none}.panel-period select{padding-left:29px}.panel-plan-select,.panel-filter-summary{grid-column:1/-1}.panel-plan-select{overflow:hidden;text-overflow:ellipsis}.panel-filter-summary{font-size:10px;color:#8191a7;line-height:1.5;min-height:15px}.panel-filters+.panel-body{padding-top:11px}.status-pill{border-radius:7px;padding:4px 8px}.status-pill.status-success{background:#e6f7ed;color:#168257}.status-pill.status-waiting{background:#fff3d9;color:#a77717}.status-pill.status-rejected{background:#fff0f1;color:#c34559}.status-pill.status-approved{background:#e6f7ed;color:#168257}.status-pill.status-neutral{background:#edf1f6;color:#758397}tbody tr.status-row-success{background:#f2fbf6}tbody tr.status-row-waiting{background:#fffbf0}tbody tr.status-row-rejected{background:#fff5f5}tbody tr.status-row-approved{background:#f2fbf6}tbody tr.status-row-neutral{background:#fcfdfe}.rank-col{display:flex;flex-direction:column;gap:4px;min-width:0}.rank-row{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:10px;transition:background .18s;cursor:default}.rank-row:hover,.rank-row.is-hovered{background:#f2f6fc}.rank-no{flex:0 0 26px;height:26px;border-radius:8px;background:#eef1f8;color:#5b6b82;font-size:12px;font-weight:750;display:flex;align-items:center;justify-content:center;font-variant-numeric:tabular-nums}.rank-no.top{background:#6366ef;color:#fff}.rank-main{flex:1;min-width:0}.rank-main .bar-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.rank-value{font-size:12px;color:#5b6b82;white-space:nowrap;font-variant-numeric:tabular-nums}.rank-value strong{color:#172b4d;font-size:14px}.rank-sub{color:#94a3b8}.rank-row .bar-fill{background:linear-gradient(90deg,#6366ef,#8b8cf8)}#positionChart{min-height:0}.rank-top3{gap:8px}.rank-top3 .rank-row{border:1px solid #e6ebf3;border-radius:12px;padding:12px 14px}.rank-top3 .rank-row:first-child{border-color:#c9caf9;background:linear-gradient(90deg,#f5f5ff,#fff)}.rank-top3 .rank-no{flex-basis:32px;height:32px;border-radius:10px;font-size:14px}.rank-top3 .rank-row:nth-child(2) .rank-no{background:#8b8cf8}.rank-top3 .rank-row:nth-child(3) .rank-no{background:#b4b5fb}.source-items{margin:3px 0 0 15px;font-size:11px;color:#8492a8;line-height:1.45;overflow-wrap:anywhere}.tab-badge{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:18px;padding:0 5px;margin-left:7px;border-radius:999px;background:#ef4444;color:#fff;font-size:10px;font-weight:750;line-height:1;font-variant-numeric:tabular-nums;box-shadow:0 0 0 2px #fff;animation:badge-pop .25s ease-out}@keyframes badge-pop{from{transform:scale(.6);opacity:0}}@media(prefers-reduced-motion:reduce){.tab-badge{animation:none}}.new-pill{display:inline-block;margin-right:6px;padding:1px 7px;border-radius:999px;background:#fee2e2;color:#dc2626;font-size:10px;font-weight:700;vertical-align:1px}tbody tr.status-row-success:hover{background:#e8f7ee}tbody tr.status-row-waiting:hover{background:#fff5dd}tbody tr.status-row-rejected:hover{background:#ffebef}tbody tr.status-row-approved:hover{background:#e8f7ee}tbody tr[class*="status-row-"] td:first-child{border-left:3px solid transparent}tbody tr.status-row-success td:first-child{border-left-color:#1aa977}tbody tr.status-row-waiting td:first-child{border-left-color:#e8ac39}tbody tr.status-row-rejected td:first-child{border-left-color:#e16a7c}tbody tr.status-row-approved td:first-child{border-left-color:#1aa977}tbody tr.status-row-neutral td:first-child{border-left-color:#c1ccd9}
        @media(min-width:1500px){.kpi-grid{gap:18px}.kpi-card{padding:21px}.kpi-value{font-size:34px}.kpi-label{font-size:12px}.kpi-meta{font-size:11px}.panel-heading h2{font-size:15px}}
        @media(max-width:1180px){.filter-fields{grid-template-columns:repeat(4,minmax(0,1fr))}.kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.panel-wide{grid-column:span 7}.panel-third{grid-column:span 5}.insights-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.insights-grid .panel:last-child{grid-column:span 2}.interview-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px}.header-inner{padding:16px 24px}main{padding:24px}}
        @media(max-width:850px){.panel-wide,.panel-third,.panel-half{grid-column:span 12}.chart-grid{gap:16px}.chart-area{min-height:235px}.page-heading{align-items:flex-start}.heading-actions{justify-content:flex-end}.heading-actions .button{padding:9px 11px}.filter-tip{display:none}.insights-grid{gap:16px}.panel-heading{padding:18px 18px 0}.panel-body{padding:15px 18px 18px}.donut-layout svg{max-width:180px}}
        @media(max-width:600px){.header-inner{padding:13px 16px}.brand-logo{width:62px;height:32px}.brand-divider{margin:0 2px;height:23px}.brand-product{font-size:12px}.brand-caption{font-size:9px}.header-badge{padding:5px 8px;font-size:10px}.header-badge .icon{display:none}main{padding:20px 14px}.page-heading{display:block;margin-bottom:17px}h1{font-size:26px}.page-subtitle{font-size:12px}.heading-actions{justify-content:flex-start;margin-top:16px}.heading-actions .button{font-size:11px;min-height:36px}.filter-fields{grid-template-columns:repeat(2,minmax(0,1fr));padding:15px;gap:12px}.filter-fields .field:last-child{grid-column:span 2}.filter-top{padding:13px 15px}.filter-bottom{padding:0 15px 14px}.scope-note{padding:10px 15px;font-size:10px}.kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:20px}.kpi-card{padding:15px 13px;min-height:123px}.kpi-value{font-size:27px}.kpi-label{font-size:10px}.kpi-meta{font-size:9px}.kpi-icon{width:27px;height:27px}.insights-grid{grid-template-columns:1fr}.insights-grid .panel:last-child{grid-column:auto}.interview-list{display:flex}.panel-heading h2{font-size:13px}.panel-description{font-size:10px}.panel-body{padding:14px 16px 17px}.panel-heading{padding:17px 16px 0}.chart-grid{gap:14px;margin-bottom:20px}.table-panel .panel-heading{padding-bottom:13px}.table-tabs{padding:0 16px 12px}.table-tab{font-size:11px;padding:7px 10px}.table-footer{flex-wrap:wrap;padding:12px 16px;gap:10px}.table-footer .pagination{margin-left:auto}.footer{display:block;font-size:9px}.footer-brand{margin-top:8px!important}.chart-tooltip{max-width:250px}.connection-row{font-size:10px;gap:8px}.chart-legend{gap:12px}.search-field input{font-size:11px}}
        @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
        @media print{@page{size:A4 landscape;margin:12mm}body{background:#fff;font-size:10px;color:#111}.header-inner,main{max-width:none;padding:10px 0}.app-header{border-color:#ddd}.heading-actions,.filter-bottom,.pagination,.header-badge,.chart-tooltip{display:none!important}.page-heading{margin-bottom:12px}h1{font-size:22px}.filter-card{box-shadow:none;margin-bottom:12px}.filter-fields{padding:10px;gap:8px;grid-template-columns:repeat(7,minmax(0,1fr))}.field label{font-size:9px}.field select,.field input{font-size:9px;height:28px;padding:4px}.filter-top{padding:8px 10px}.scope-note{font-size:9px;padding:8px 10px}.kpi-grid{grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-bottom:15px}.kpi-card{padding:10px;box-shadow:none;min-height:90px}.kpi-value{font-size:23px}.kpi-label{font-size:9px}.kpi-meta{font-size:8px}.kpi-icon{display:none}.panel{box-shadow:none;break-inside:avoid}.panel-wide{grid-column:span 8}.panel-third{grid-column:span 4}.panel-half{grid-column:span 6}.panel-heading{padding:12px 12px 0}.panel-heading h2{font-size:11px}.panel-body{padding:10px 12px}.panel-description,.panel-caption{font-size:8px}.chart-grid,.insights-grid{gap:10px;margin-bottom:15px}.insights-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.insights-grid .panel:last-child{grid-column:auto}.chart-area{min-height:170px}.chart-area.compact,.chart-area.medium{min-height:150px}.interview-list{max-height:none;overflow:visible;display:flex}.table-scroll{overflow:visible}.table-panel{break-inside:auto}th,td{font-size:8px;padding:7px}.table-tabs{padding:0 12px 8px}.table-tab{font-size:9px;padding:5px 8px}.table-footer{padding:8px 12px}.footer{font-size:8px}.chart-area svg{overflow:visible}.data-status:before{print-color-adjust:exact}.kpi-card,.badge,.status-pill,.bar-fill,svg{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
        @media(max-width:1380px){.detail-toolbar,.detail-toolbar:has(#detailSourceField:not([hidden])){grid-template-columns:repeat(4,minmax(0,1fr))}.detail-search{grid-column:span 2}}
        @media(max-width:850px){.position-bars{grid-template-columns:1fr}.detail-toolbar,.detail-toolbar:has(#detailSourceField:not([hidden])){grid-template-columns:repeat(3,minmax(0,1fr))}.detail-search{grid-column:auto}.donut-layout{display:grid;grid-template-columns:minmax(140px,194px) minmax(0,1fr);align-items:center}.donut-layout .chart-list{max-height:240px}.page-heading h1{font-size:29px}}
        @media(max-width:600px){.detail-toolbar,.detail-toolbar:has(#detailSourceField:not([hidden])){grid-template-columns:repeat(2,minmax(0,1fr));padding:14px 16px}.detail-search{grid-column:span 2}.detail-toolbar .button{min-height:42px}.detail-filter-note{padding:0 16px 13px}.table-panel .panel-heading{align-items:flex-start;flex-wrap:wrap}.table-tab{min-height:44px}.chart-export{min-height:36px}.panel-description{font-size:11px}.kpi-meta{font-size:10px}.kpi-label{font-size:11px}.chart-legend{font-size:11px}.donut-layout{display:flex}.donut-layout .chart-list{max-height:none}.heading-actions .button{min-height:42px}.chart-tooltip{min-width:195px;max-width:calc(100vw - 24px)}.panel-heading{gap:8px}}
        @media(max-width:600px){.panel-filters{padding:12px 16px 0}.panel-filters select,.panel-filters input{height:40px;font-size:12px}.panel-period .icon{top:13px}.panel-filter-summary{font-size:11px}.status-pill{white-space:normal}}
        @media print{.chart-export,.detail-toolbar,.button-excel{display:none!important}.position-bars{grid-template-columns:repeat(2,minmax(0,1fr))}.chart-scroll{overflow:visible}.chart-scroll svg{min-width:0!important}.donut-layout{display:flex}.panel-filters select,.panel-filters input{height:28px;font-size:9px}}
    </style>
</head>
<body>
    <svg class="sr-only" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>
        <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.5-1L20 9M4 15l2.4 3a7 7 0 0 0 11.5-1"/></symbol>
        <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/></symbol>
        <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 5h16M7 12h10M10 19h4"/><circle cx="8" cy="5" r="2" fill="white"/><circle cx="15" cy="12" r="2" fill="white"/><circle cx="12" cy="19" r="2" fill="white"/></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></symbol>
        <symbol id="i-reset" viewBox="0 0 24 24"><path d="M3 10V4m0 6h6"/><path d="M4.5 8a8 8 0 1 1-.2 7"/></symbol>
        <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 3v17h17M8 16v-5m5 5V6m5 10V9"/></symbol>
        <symbol id="i-trend" viewBox="0 0 24 24"><path d="m3 17 6-6 4 4 8-10m-6 0h6v6"/></symbol>
        <symbol id="i-users" viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2"/></symbol>
        <symbol id="i-briefcase" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12a22 22 0 0 0 18 0m-9 1v3"/></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="m6 12 4 4 8-8"/><circle cx="12" cy="12" r="9"/></symbol>
        <symbol id="i-source" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="4" r="2"/><circle cx="19" cy="4" r="2"/><circle cx="5" cy="20" r="2"/><circle cx="19" cy="20" r="2"/><path d="m6.5 5.5 3.5 4m4-0 3.5-4m-11 13 3.5-4m4 0 3.5 4"/></symbol>
        <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-14 4h3m4 0h3m-10 4h3"/></symbol>
        <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
        <symbol id="i-left" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></symbol>
        <symbol id="i-right" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></symbol>
        <symbol id="i-document" viewBox="0 0 24 24"><path d="M14 3H5v18h14V8l-5-5m0 0v5h5M8 12h8m-8 4h6"/></symbol>
    </svg>
    <a class="sr-only" href="#dashboardContent">Đến nội dung tổng quan</a>
    <header class="app-header">
        <div class="header-inner">
            <div class="brand">
                <img class="brand-logo" src="LOGO.jpg" alt="ORIT" width="78" height="42">
                <span class="brand-divider" aria-hidden="true"></span>
                <div><div class="brand-product">Quản lý tuyển dụng</div><div class="brand-caption">Recruitment analytics</div></div>
            </div>
            <div class="header-right"><span class="header-badge"><svg class="icon" aria-hidden="true"><use href="#i-grid"/></svg> Dashboard tổng quan</span></div>
        </div>
    </header>
    <main id="dashboardContent">
        <div class="page-heading">
            <div>
                <p class="eyebrow">Trung tâm tuyển dụng</p>
                <h1>Dashboard tuyển dụng</h1>
                <p class="page-subtitle">Theo dõi nhu cầu tuyển, kế hoạch và hành trình ứng viên trong một nơi.</p>
            </div>
            <div class="heading-actions">
                <button id="refreshButton" class="button button-primary" type="button"><svg class="icon" aria-hidden="true"><use href="#i-refresh"/></svg>Tải lại dữ liệu</button>
            </div>
        </div>
        <div class="connection-row" aria-live="polite"><span id="dataStatus" class="data-status loading">Đang tải dữ liệu</span><span id="updatedAt">Chưa cập nhật</span><span id="exportFeedback" hidden></span></div>
        <section class="filter-card" aria-labelledby="filterHeading">
            <div class="filter-top">
                <div id="filterHeading" class="filter-title"><svg class="icon" aria-hidden="true"><use href="#i-filter"/></svg>Bộ lọc tổng quan</div>
                <span class="filter-tip">Điều chỉnh phạm vi để xem các chỉ số và biểu đồ</span>
            </div>
            <div class="filter-fields">
                <div class="field"><label for="periodPreset">Khoảng thời gian</label><select id="periodPreset"><option value="all">Toàn bộ thời gian</option><option value="day" selected>Hôm nay</option><option value="week">Tuần này</option><option value="month">Tháng này</option><option value="quarter">Quý này</option><option value="custom">Tùy chọn</option></select></div>
                <div class="field"><label for="dateFrom">Từ ngày</label><input id="dateFrom" type="date"></div>
                <div class="field"><label for="dateTo">Đến ngày</label><input id="dateTo" type="date"></div>
                <div class="field"><label for="granularity">Nhóm biểu đồ</label><select id="granularity"><option value="day">Theo ngày</option><option value="week">Theo tuần</option><option value="month" selected>Theo tháng</option></select></div>
                <div class="field"><label for="departmentFilter">Phòng ban</label><select id="departmentFilter"><option value="">Tất cả phòng ban</option></select></div>
                <div class="field"><label for="positionFilter">Vị trí tuyển dụng</label><select id="positionFilter"><option value="">Tất cả vị trí</option></select></div>
                <div class="field"><label for="statusFilter">Trạng thái ứng viên</label><select id="statusFilter"><option value="">Tất cả trạng thái</option></select></div>
            </div>
            <div class="filter-bottom">
                <div class="field search-field"><label for="searchInput" class="sr-only">Tìm kiếm yêu cầu, kế hoạch hoặc ứng viên</label><svg class="icon" aria-hidden="true"><use href="#i-search"/></svg><input id="searchInput" type="search" placeholder="Tìm yêu cầu, kế hoạch, ứng viên…" autocomplete="off"></div>
                <button id="resetButton" class="button button-quiet" type="button"><svg class="icon" aria-hidden="true"><use href="#i-reset"/></svg>Đặt lại bộ lọc</button>
            </div>
            <p id="scopeNote" class="scope-note" hidden></p>
        </section>
        <div id="message" class="message" role="status" hidden></div>
        <section aria-label="Các chỉ số tuyển dụng" id="kpiGrid" class="kpi-grid" aria-live="polite">
            <article class="kpi-card teal"><div class="kpi-top"><span class="kpi-label">Yêu cầu tuyển dụng</span><span class="kpi-icon"><svg class="icon" aria-hidden="true"><use href="#i-document"/></svg></span></div><div class="kpi-value">—</div><div class="kpi-meta">Đang tải dữ liệu</div></article>
            <article class="kpi-card indigo"><div class="kpi-top"><span class="kpi-label">Nhu cầu tuyển</span><span class="kpi-icon"><svg class="icon" aria-hidden="true"><use href="#i-briefcase"/></svg></span></div><div class="kpi-value">—</div><div class="kpi-meta">Số người cần tuyển</div></article>
            <article class="kpi-card teal"><div class="kpi-top"><span class="kpi-label">Kế hoạch tuyển dụng</span><span class="kpi-icon"><svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg></span></div><div class="kpi-value">—</div><div class="kpi-meta">Đang tải dữ liệu</div></article>
            <article class="kpi-card indigo"><div class="kpi-top"><span class="kpi-label">Hồ sơ ứng viên</span><span class="kpi-icon"><svg class="icon" aria-hidden="true"><use href="#i-users"/></svg></span></div><div class="kpi-value">—</div><div class="kpi-meta">Đang tải dữ liệu</div></article>
            <article class="kpi-card amber"><div class="kpi-top"><span class="kpi-label">Lịch phỏng vấn</span><span class="kpi-icon"><svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg></span></div><div class="kpi-value">—</div><div class="kpi-meta">Đang tải dữ liệu</div></article>
            <article class="kpi-card rose"><div class="kpi-top"><span class="kpi-label">Trạng thái ứng viên</span><span class="kpi-icon"><svg class="icon" aria-hidden="true"><use href="#i-check"/></svg></span></div><div class="kpi-value">—</div><div class="kpi-meta">Đang tải dữ liệu</div></article>
        </section>
        <p class="section-label">Xu hướng &amp; hành trình ứng viên</p>
        <div class="chart-grid">
            <section class="panel panel-wide" aria-labelledby="trendHeading">
                <div class="panel-heading"><div><h2 id="trendHeading">Nhịp tuyển dụng theo thời gian</h2><p class="panel-description">Yêu cầu mới, kế hoạch mới và hồ sơ ứng viên mới</p></div><button class="button chart-export" type="button" data-export="trend" aria-label="Xuất Excel xu hướng tuyển dụng" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-body"><div id="trendChart" class="chart-area"><div class="chart-empty">Đang tải xu hướng tuyển dụng</div></div></div>
            </section>
            <section class="panel panel-third" aria-labelledby="statusHeading">
                <div class="panel-heading"><div><h2 id="statusHeading">Trạng thái ứng viên</h2><p class="panel-description">Cơ cấu hồ sơ trong quy trình tuyển dụng</p></div><button class="button chart-export" type="button" data-export="candidateStatuses" aria-label="Xuất Excel trạng thái ứng viên" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-body"><div id="statusChart" class="chart-area medium"><div class="chart-empty">Đang tải trạng thái ứng viên</div></div></div>
            </section>
            <section class="panel panel-wide" aria-labelledby="comparisonHeading">
                <div class="panel-heading"><div><h2 id="comparisonHeading">Nhu cầu tuyển &amp; lượng ứng viên</h2><p class="panel-description">Biểu đồ cột so sánh số người cần tuyển và số hồ sơ</p></div><button class="button chart-export" type="button" data-export="comparison" aria-label="Xuất Excel so sánh nhu cầu và ứng viên" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-body"><div id="comparisonChart" class="chart-area"><div class="chart-empty"><svg class="icon" aria-hidden="true"><use href="#i-chart"/></svg><span>Đang tải biểu đồ so sánh</span></div></div></div>
            </section>
            <section class="panel panel-third" aria-labelledby="sourceHeading">
                <div class="panel-heading"><div><h2 id="sourceHeading">Nguồn ứng viên</h2><p class="panel-description">Những kênh mang về hồ sơ tuyển dụng</p></div><button class="button chart-export" type="button" data-export="sources" aria-label="Xuất Excel nguồn ứng viên" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-body"><div id="sourceChart" class="chart-area medium"><div class="chart-empty"><svg class="icon" aria-hidden="true"><use href="#i-source"/></svg><span>Đang tải nguồn ứng viên</span></div></div></div>
            </section>
            <section class="panel panel-full" aria-labelledby="positionHeading">
                <div class="panel-heading"><div><h2 id="positionHeading">Vị trí tuyển nhiều nhất</h2><p class="panel-description">Top 3 vị trí có số người cần tuyển cao nhất</p></div><button class="button chart-export" type="button" data-export="positions" aria-label="Xuất Excel vị trí tuyển nhiều nhất" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-body"><div id="positionChart" class="chart-area"><div class="chart-empty">Đang tải dữ liệu vị trí</div></div></div>
            </section>
        </div>
        <p class="section-label">Tiến độ tuyển dụng</p>
        <div class="insights-grid">
            <section class="panel" aria-labelledby="requestStatusHeading">
                <div class="panel-heading"><div><h2 id="requestStatusHeading">Trạng thái yêu cầu</h2><p class="panel-description">Theo dõi phê duyệt tuyển dụng</p></div><button class="button chart-export" type="button" data-export="requestStatuses" aria-label="Xuất Excel trạng thái yêu cầu" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-filters"><div class="panel-period"><svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg><select id="requestPeriod" data-panel-filter aria-label="Khoảng thời gian trạng thái yêu cầu"><option value="all">Toàn bộ</option><option value="day" selected>Ngày</option><option value="week">Tuần</option><option value="month">Tháng</option></select></div><input id="requestAnchor" data-panel-filter type="date" aria-label="Ngày tham chiếu trạng thái yêu cầu"><span id="requestScope" class="panel-filter-summary" aria-live="polite"></span></div>
                <div class="panel-body"><div id="requestStatusChart" class="chart-area compact"><div class="chart-empty">Đang tải trạng thái yêu cầu</div></div></div>
            </section>
            <section class="panel" aria-labelledby="planStatusHeading">
                <div class="panel-heading"><div><h2 id="planStatusHeading">Tiến độ kế hoạch</h2><p class="panel-description">Hành trình ứng viên</p></div><button class="button chart-export" type="button" data-export="planStatuses" aria-label="Xuất Excel ứng viên theo kế hoạch" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-filters"><div class="panel-period"><svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg><select id="planPeriod" data-panel-filter aria-label="Khoảng thời gian ứng viên theo kế hoạch"><option value="all">Toàn bộ</option><option value="day" selected>Ngày</option><option value="week">Tuần</option><option value="month">Tháng</option></select></div><input id="planAnchor" data-panel-filter type="date" aria-label="Ngày tham chiếu ứng viên theo kế hoạch"><select id="planFilter" class="panel-plan-select" data-panel-filter aria-label="Chọn kế hoạch tuyển dụng"><option value="">Tất cả ứng viên</option></select><span id="planScope" class="panel-filter-summary" aria-live="polite"></span></div>
                <div class="panel-body"><div id="planStatusChart" class="chart-area compact"><div class="chart-empty">Đang tải tiến độ kế hoạch</div></div></div>
            </section>
            <section class="panel" aria-labelledby="interviewHeading">
                <div class="panel-heading"><div><h2 id="interviewHeading">Lịch phỏng vấn</h2><p class="panel-description">Các cuộc hẹn tuyển dụng</p></div><button class="button chart-export" type="button" data-export="interviews" aria-label="Xuất Excel lịch phỏng vấn" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Excel</button></div>
                <div class="panel-filters"><div class="panel-period"><svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg><select id="interviewPeriod" data-panel-filter aria-label="Khoảng thời gian lịch phỏng vấn"><option value="all">Toàn bộ</option><option value="day" selected>Ngày</option><option value="week">Tuần</option><option value="month">Tháng</option></select></div><input id="interviewAnchor" data-panel-filter type="date" aria-label="Ngày tham chiếu lịch phỏng vấn"><select id="interviewPlanFilter" class="panel-plan-select" data-panel-filter aria-label="Kế hoạch của lịch phỏng vấn"><option value="">Tất cả kế hoạch</option></select><span id="interviewScope" class="panel-filter-summary" aria-live="polite"></span></div>
                <div class="panel-body"><div id="interviewList" class="interview-list"><div class="chart-empty">Đang tải lịch phỏng vấn</div></div></div>
            </section>
        </div>
        <section class="panel table-panel" aria-labelledby="detailHeading">
            <div class="panel-heading"><div><h2 id="detailHeading">Tra cứu dữ liệu tuyển dụng</h2><p class="panel-description">Lọc riêng từng mục và xuất toàn bộ kết quả phù hợp sang Excel</p></div><button id="detailExport" class="button button-excel" type="button" data-export="detail" disabled><svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Xuất Excel yêu cầu</button></div>
            <div class="table-tabs" role="tablist" aria-label="Loại dữ liệu chi tiết">
                <button id="requestsTab" class="table-tab active" type="button" data-table="requests" role="tab" aria-selected="true" aria-controls="detailTablePanel">Yêu cầu tuyển dụng</button>
                <button id="plansTab" class="table-tab" type="button" data-table="plans" role="tab" tabindex="-1" aria-selected="false" aria-controls="detailTablePanel">Kế hoạch tuyển dụng</button>
                <button id="candidatesTab" class="table-tab" type="button" data-table="candidates" role="tab" tabindex="-1" aria-selected="false" aria-controls="detailTablePanel">Ứng viên</button>
                <button id="interviewsTab" class="table-tab" type="button" data-table="interviews" role="tab" tabindex="-1" aria-selected="false" aria-controls="detailTablePanel">Lịch phỏng vấn</button>
            </div>
            <div class="detail-toolbar">
                <div class="field detail-search"><label for="detailSearch">Tìm trong mục đang xem</label><input id="detailSearch" type="search" placeholder="Nhập mã, tên hoặc từ khóa…"></div>
                <div class="field"><label for="detailStatus">Trạng thái</label><select id="detailStatus"><option value="">Tất cả trạng thái</option></select></div>
                <div class="field"><label id="detailCategoryLabel" for="detailCategory">Phòng yêu cầu</label><select id="detailCategory"><option value="">Tất cả</option></select></div>
                <div id="detailSourceField" class="field" hidden><label for="detailSource">Nguồn ứng viên</label><select id="detailSource"><option value="">Tất cả nguồn</option></select></div>
                <div class="field"><label id="detailDateLabel" for="detailFrom">Ngày tạo từ</label><input id="detailFrom" type="date"></div>
                <div class="field"><label for="detailTo">Đến ngày</label><input id="detailTo" type="date"></div>
                <div class="field"><label for="detailSort">Sắp xếp</label><select id="detailSort"><option value="dateDesc">Mới nhất</option><option value="dateAsc">Cũ nhất</option><option value="nameAsc">Tên A → Z</option><option value="codeAsc">Mã A → Z</option></select></div>
                <button id="detailReset" class="button button-quiet" type="button" aria-label="Xóa bộ lọc của mục đang xem"><svg class="icon" aria-hidden="true"><use href="#i-reset"/></svg>Xóa lọc mục</button>
            </div>
            <p id="detailFilterNote" class="detail-filter-note" aria-live="polite" hidden></p>
            <div id="detailTablePanel" class="table-scroll" role="tabpanel" aria-labelledby="requestsTab" tabindex="0"><table id="detailTable"><caption class="sr-only">Chi tiết tuyển dụng theo phạm vi lọc</caption><thead><tr><th scope="col">Dữ liệu tuyển dụng</th></tr></thead><tbody><tr><td class="table-empty">Đang tải dữ liệu chi tiết…</td></tr></tbody></table></div>
            <div class="table-footer"><span id="tableSummary" aria-live="polite">Đang tải dữ liệu</span><div class="pagination"><button id="prevPage" class="button" type="button" aria-label="Trang trước" disabled><svg class="icon" aria-hidden="true"><use href="#i-left"/></svg></button><span id="pageInfo" aria-live="polite">—</span><button id="nextPage" class="button" type="button" aria-label="Trang tiếp theo" disabled><svg class="icon" aria-hidden="true"><use href="#i-right"/></svg></button></div></div>
        </section>
        <footer class="footer"><p>Tổng quan hoạt động tuyển dụng.</p><p class="footer-brand">ORIT · Recruitment Dashboard</p></footer>
    </main>
    <div id="chartTooltip" class="chart-tooltip" role="tooltip" hidden></div>
</body>
</html>
`;
    },

    /* Domain tuyển dụng do khách hàng cung cấp; INTERVIEW hiển thị vàng theo yêu cầu. */
    statusInfo: function (value, type) {
        var text = String(value == null ? '' : value).trim(), code = text.toUpperCase();
        var requests = {
            DRAFT: ['Nháp', 'neutral'], SUBMIT: ['Chờ duyệt', 'waiting'], ACCEPT: ['Đã chấp nhận', 'success'],
            PLAN_SUBMIT: ['Chờ duyệt kế hoạch', 'waiting'], APPROVED: ['Đã phê duyệt', 'approved'], REFUSE: ['Từ chối', 'rejected']
        };
        var candidates = {
            SCREENING: ['Sàng lọc', 'neutral'], ROUND1_SUBMIT: ['Chờ vòng 1', 'waiting'], INTERVIEW: ['Đang phỏng vấn', 'waiting'],
            ROUND2_SUBMIT: ['Chờ vòng 2', 'waiting'], ROUND3_SUBMIT: ['Chờ vòng 3', 'waiting'], FINISH: ['Đạt', 'success'], REJECT: ['Loại', 'rejected']
        };
        var entry = (type === 'requests' || type === 'plans' ? requests : candidates)[code];
        if (!entry && type === 'interviews') entry = requests[code];
        var normal = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
        var tone = entry ? entry[1] : /reject|refuse|decline|fail|cancel|loai|tu choi|khong dat|chua dat|khong hop le/.test(normal) ? 'rejected' : /submit|interview|pending|waiting|\bcho\b|\bdang\b|phong van|chua bat dau|chua co|len lich/.test(normal) ? 'waiting' : /^(finish|finished|success|passed|accept|accepted|dat|da dat|hoan thanh|da chap nhan)$/.test(normal) ? 'success' : /^(approved|da phe duyet|da duyet)$/.test(normal) ? 'approved' : 'neutral';
        var colors = { success: '#17a673', waiting: '#e6ab32', rejected: '#df6277', approved: '#17a673', neutral: '#9aaabd' };
        return { code: code, label: entry ? entry[0] : text || 'Chưa xác định', tone: tone, color: colors[tone] };
    },

    /* Nguồn ứng viên (nguonuv) theo quy định khách hàng: 1 Quảng cáo (FB, Zalo, TikTok), 2 Ứng viên cũ/trong CSDL,
       3 Nhân viên giới thiệu, 4 Đơn vị cung ứng/đối tác. Giá trị chữ được nhận theo từ khóa; còn lại giữ nguyên. */
    sourceGroup: function (value) {
        var text = String(value == null ? '' : value).trim();
        var key = text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        var groups = {
            1: ['Quảng cáo (FB, Zalo, TikTok)', '#2f80ed'],
            2: ['Ứng viên cũ / trong cơ sở dữ liệu', '#8b5cf6'],
            3: ['Nhân viên giới thiệu', '#f59e0b'],
            4: ['Đơn vị cung ứng / đối tác tuyển dụng', '#db2777']
        };
        if (!key) return { group: 'Chưa xác định', label: 'Chưa xác định', color: '#cbd5e1' };
        var code = /^(?:nguon\s*)?([1-4])$/.exec(key);
        var rules = [
            [4, /\b(cung ung|doi tac|head ?hunt\w*|agency|dich vu (tuyen dung|nhan su)|trung tam (gioi thieu )?viec lam|outsourc\w*)\b/],
            [2, /\b(ung vien cu|da (tung )?ung tuyen|tung ung tuyen|co so du lieu|csdl|database|du lieu (ung vien|cu)|kho (ho so|ung vien)|luu tru|tai ung tuyen)\b/],
            [3, /\b(gioi thieu|nhan vien|noi bo|nguoi quen|referral|refer|ban be|nguoi than)\b/],
            [1, /\b(quang cao|ads?|facebook|fb|zalo|tik ?tok|instagram|insta|youtube|linked ?in|mxh|mang xa hoi|social|fanpage|top ?cv|vietnam ?works|career ?builder|itviec|vieclam24h|job ?street|jobs ?go|indeed|glints|website|web)\b/]
        ];
        var group = code ? Number(code[1]) : 0;
        for (var r = 0; !group && r < rules.length; r++) if (rules[r][1].test(key)) group = rules[r][0];
        if (!group) return { group: text, label: text, color: null };
        // Giá trị là mã 1–4 thì hiển thị tên nhóm; giá trị chữ giữ nguyên để đối chiếu.
        return { group: groups[group][0], label: code ? groups[group][0] : text, color: groups[group][1] };
    },

    /* Tổng hợp thuần: mã yêu cầu/ứng viên, chi tiết, bộ lọc và tuần thứ Hai. */
    createCore: function () {
        'use strict';

        var UNKNOWN = 'Chưa xác định';
        var fields = {
            request: {
                code: ['MaYCTD'], id: ['yctuyendungid', 'yeucautuyendungid', 'YCTDId', 'requestId'],
                name: ['tenyc'], date: ['ngaytao'], department: ['phongyc'], status: ['status'],
                detailId: ['ctyeucauid', 'ctyctuyendungid', 'ctyctdId', 'yctuyendungctid', 'requestDetailId'],
                position: ['vitri'], quantity: ['sltuyen'],
                requestRef: ['MaYCTD', 'yctuyendungid', 'yeucautuyendungid', 'YCTDId', 'requestId']
            },
            plan: {
                code: ['MaKH'], id: ['kehoachid', 'kehoachtuyendungid', 'KHTDId', 'planId'],
                name: ['tenkh'], date: ['ngaytao'], start: ['ngayBD'], end: ['ngayKT'], status: ['status'],
                detailId: ['ctkehoachid', 'ctkehoachtuyendungid', 'ctkhtuyendungid', 'ctkhtdId', 'planDetailId'],
                quantity: ['soluongNST'], cost: ['chiphiTD'],
                requestRef: ['MaYCTD', 'yctuyendungid', 'yeucautuyendungid', 'YCTDId', 'requestId'],
                planRef: ['MaKH', 'kehoachid', 'kehoachtuyendungid', 'KHTDId', 'planId']
            },
            candidate: {
                code: ['MaUV'], id: ['ungvienid', 'UVId', 'candidateId'],
                name: ['hoten'], date: ['ngaytao'], status: ['status'],
                detailId: ['ctungvienid', 'candidateDetailId'], position: ['vitri'], source: ['nguonuv'],
                requestRef: ['MaYCTD', 'yctuyendungid', 'yeucautuyendungid', 'YCTDId', 'requestId'],
                planRef: ['MaKH', 'kehoachid', 'kehoachtuyendungid', 'KHTDId', 'planId'],
                candidateRef: ['MaUV', 'ungvienid', 'UVId', 'candidateId']
            },
            planLink: {
                planRef: ['MaKH', 'kehoachid', 'kehoachtuyendungid', 'KHTDId', 'planId'],
                requestRef: ['MaYCTD', 'yctuyendungid', 'yeucautuyendungid', 'YCTDId', 'requestId'],
                candidateRef: ['MaUV', 'ungvienid', 'UVId', 'candidateId']
            },
            interview: {
                id: ['MaLPV', 'lichphongvanid', 'LichPVId', 'interviewId'],
                candidateRef: ['MaUV', 'ungvienid', 'UVId', 'candidateId'],
                planRef: ['MaKH', 'kehoachid', 'kehoachtuyendungid', 'KHTDId', 'planId'],
                requestRef: ['MaYCTD', 'yctuyendungid', 'yeucautuyendungid', 'YCTDId', 'requestId'],
                date: ['ngayphongvan', 'ngayPV', 'ngayhen', 'interviewDate'],
                time: ['giophongvan', 'gioPV', 'giohen', 'interviewTime'],
                status: ['status', 'trangthai', 'interviewStatus'],
                position: ['vitri'], name: ['ungvien', 'hoten', 'tenungvien', 'candidateName']
            }
        };

        function text(value) { return value == null ? '' : String(value).trim(); }
        function unique(values) { return Array.from(new Set(values.filter(function (v) { return v !== '' && v != null; }))); }
        function normal(value) {
            return text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        }
        function stableString(value) {
            if (Array.isArray(value)) return '[' + value.map(stableString).join(',') + ']';
            if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(function (k) { return JSON.stringify(k) + ':' + stableString(value[k]); }).join(',') + '}';
            return JSON.stringify(value);
        }
        function number(value) {
            if (value === null || value === undefined || text(value) === '') return null;
            if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
            var str = text(value).replace(/\s/g, '');
            // Data APIs usually return numbers. Permit the common Vietnamese decimal format.
            if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(str)) str = str.replace(/\./g, '').replace(',', '.');
            else if (/^\d+,\d+$/.test(str)) str = str.replace(',', '.');
            var parsed = Number(str);
            return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
        }
        function localDate(value) {
            if (Object.prototype.toString.call(value) === '[object Date]') return Number.isNaN(value.getTime()) ? null : new Date(value.getFullYear(), value.getMonth(), value.getDate());
            var str = text(value), match;
            if (!str) return null;
            if ((match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T].*)?$/.exec(str))) {
                return validDate(Number(match[1]), Number(match[2]), Number(match[3]));
            }
            if ((match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T].*)?$/.exec(str))) {
                return validDate(Number(match[3]), Number(match[2]), Number(match[1]));
            }
            if ((match = /^\/Date\((\d+)(?:[+-]\d+)?\)\/$/.exec(str))) return localDate(new Date(Number(match[1])));
            return null;
        }
        function validDate(year, month, day) {
            var d = new Date(year, month - 1, day);
            return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? d : null;
        }
        function dateKey(value) {
            var d = localDate(value);
            if (!d) return null;
            return String(d.getFullYear()).padStart(4, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }
        function shiftDay(d, count) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + count); }
        function monday(d) { return shiftDay(d, -((d.getDay() + 6) % 7)); }
        function periodRange(preset, now) {
            var d = localDate(now || new Date()) || localDate(new Date()), from, to;
            switch (preset) {
                case 'today': case 'day': from = to = d; break;
                case 'yesterday': from = to = shiftDay(d, -1); break;
                case 'week': case 'thisWeek': from = monday(d); to = shiftDay(from, 6); break;
                case 'lastWeek': from = shiftDay(monday(d), -7); to = shiftDay(from, 6); break;
                case 'month': case 'thisMonth': from = new Date(d.getFullYear(), d.getMonth(), 1); to = new Date(d.getFullYear(), d.getMonth() + 1, 0); break;
                case 'lastMonth': from = new Date(d.getFullYear(), d.getMonth() - 1, 1); to = new Date(d.getFullYear(), d.getMonth(), 0); break;
                case 'quarter': case 'thisQuarter': from = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1); to = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 0); break;
                case 'lastQuarter': from = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 - 3, 1); to = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 0); break;
                case 'last7': case 'last7days': from = shiftDay(d, -6); to = d; break;
                case 'last30': case 'last30days': from = shiftDay(d, -29); to = d; break;
                case 'year': case 'thisYear': from = new Date(d.getFullYear(), 0, 1); to = new Date(d.getFullYear(), 11, 31); break;
                default: return { from: '', to: '' };
            }
            return { from: dateKey(from), to: dateKey(to) };
        }
        function escapeHtml(value) { return text(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
        function csvCell(value) {
            var str = value == null ? '' : String(value);
            if (/^\s*[=+\-@]/.test(str) || /^[\t\r\n]/.test(str)) str = "'" + str;
            return '"' + str.replace(/"/g, '""') + '"';
        }

        function buildModel(input, options) {
            input = input || {}; options = options || {};
            var mapping = options.mapping || {}, warnings = [], warningSet = new Set();
            var model = { requests: [], plans: [], candidates: [], interviews: [], warnings: warnings };
            function warn(message) { if (!warningSet.has(message)) { warningSet.add(message); warnings.push(message); } }
            function aliases(entity, field) {
                var custom = mapping[entity] && mapping[entity][field];
                return (custom ? (Array.isArray(custom) ? custom : [custom]) : []).concat((fields[entity] && fields[entity][field]) || []);
            }
            function read(row, entity, field) {
                var keys = Object.keys(row || {}), look = {};
                keys.forEach(function (key) { look[key.toLowerCase()] = key; });
                var names = aliases(entity, field);
                for (var i = 0; i < names.length; i++) {
                    var key = look[String(names[i]).toLowerCase()];
                    if (key !== undefined && row[key] !== null && row[key] !== undefined && text(row[key]) !== '') return row[key];
                }
                return null;
            }
            function refs(row, entity, field) {
                var keys = Object.keys(row || {}), look = {};
                keys.forEach(function (key) { look[key.toLowerCase()] = key; });
                return unique(aliases(entity, field).map(function (name) {
                    var key = look[String(name).toLowerCase()];
                    return key === undefined ? '' : text(row[key]);
                }));
            }
            function rows(name) {
                if (!Array.isArray(input[name])) { if (input[name] != null) warn('Chưa đọc được dữ liệu ' + name + '.'); return []; }
                return input[name].filter(function (row) { return row && typeof row === 'object' && !Array.isArray(row); });
            }
            function groups(source, entity, prefix) {
                var result = new Map();
                source.forEach(function (row) {
                    var code = text(read(row, entity, 'code')), id = text(read(row, entity, 'id'));
                    var identity = code || id;
                    if (!identity) { identity = 'row:' + stableString(row); warn('Một số hồ sơ ' + prefix + ' chưa có mã.'); }
                    var key = prefix + ':' + identity;
                    if (!result.has(key)) result.set(key, { key: key, code: code || id, rows: [], identifiers: [] });
                    var group = result.get(key);
                    group.rows.push(row);
                    group.identifiers = unique(group.identifiers.concat(refs(row, entity, entity === 'request' ? 'requestRef' : entity === 'plan' ? 'planRef' : 'candidateRef')));
                });
                return Array.from(result.values());
            }
            function first(group, entity, field) {
                for (var i = 0; i < group.rows.length; i++) { var value = read(group.rows[i], entity, field); if (value !== null) return value; }
                return null;
            }
            function details(group, entity) {
                var seen = new Set();
                return group.rows.filter(function (row) {
                    var detailId = text(read(row, entity, 'detailId'));
                    var key = detailId ? 'id:' + detailId : 'row:' + stableString(row);
                    if (seen.has(key)) return false;
                    seen.add(key); return true;
                }).map(function (row) { return { row: row, key: text(read(row, entity, 'detailId')) || 'row:' + stableString(row) }; });
            }
            function sumKnown(list, property) {
                if (!list.length || list.some(function (item) { return item[property] === null; })) return null;
                return list.reduce(function (sum, item) { return sum + item[property]; }, 0);
            }
            var requestGroups = groups(rows('requests'), 'request', 'yc');
            var planGroups = groups(rows('plans').filter(function (row) {
                var code = read(row, 'plan', 'code');
                // selectKH: ISNULL(kh.kehoachid, -yc.MaYCTD). Giá trị âm không phải kế hoạch.
                return code == null || !Number.isFinite(Number(code)) || Number(code) > 0;
            }), 'plan', 'kh');
            var candidateGroups = groups(rows('candidates'), 'candidate', 'uv');
            var requestIndex = new Map(), planIndex = new Map(), candidateIndex = new Map();
            function indexGroups(list, index) {
                list.forEach(function (g) { g.identifiers.forEach(function (id) { if (!index.has(id)) index.set(id, []); index.get(id).push(g.key); }); });
            }
            indexGroups(requestGroups, requestIndex); indexGroups(planGroups, planIndex); indexGroups(candidateGroups, candidateIndex);
            function resolve(row, entity, field, index) {
                return unique(refs(row, entity, field).flatMap(function (id) {
                    var matches = index.get(id) || [];
                    if (matches.length > 1) { warn('Một số mã bị trùng nên chưa xác định được hồ sơ liên quan.'); return []; }
                    return matches;
                }));
            }
            function resolveGroup(group, entity, field, index) { return unique(group.rows.flatMap(function (row) { return resolve(row, entity, field, index); })); }
            requestGroups.forEach(function (g) {
                var ds = details(g, 'request').map(function (d) { return { key: g.key + ':' + d.key, position: text(read(d.row, 'request', 'position')) || UNKNOWN, quantity: number(read(d.row, 'request', 'quantity')) }; });
                var date = dateKey(first(g, 'request', 'date'));
                if (!date) warn('Một số yêu cầu chưa có ngày tạo nên không hiện khi lọc theo thời gian.');
                if (ds.some(function (d) { return d.quantity === null; })) warn('Một số yêu cầu chưa nhập số lượng cần tuyển.');
                model.requests.push({
                    key: g.key, code: g.code, name: text(first(g, 'request', 'name')), date: date,
                    department: text(first(g, 'request', 'department')) || UNKNOWN, status: text(first(g, 'request', 'status')) || UNKNOWN,
                    details: ds, quantity: sumKnown(ds, 'quantity')
                });
            });
            planGroups.forEach(function (g) {
                var ds = details(g, 'plan').map(function (d) { return { quantity: number(read(d.row, 'plan', 'quantity')), cost: number(read(d.row, 'plan', 'cost')) }; });
                var date = dateKey(first(g, 'plan', 'date'));
                if (!date) warn('Một số kế hoạch chưa có ngày tạo nên không hiện khi lọc theo thời gian.');
                model.plans.push({
                    key: g.key, code: g.code, requestKeys: resolveGroup(g, 'plan', 'requestRef', requestIndex),
                    name: text(first(g, 'plan', 'name')), date: date, start: dateKey(first(g, 'plan', 'start')), end: dateKey(first(g, 'plan', 'end')),
                    status: text(first(g, 'plan', 'status')) || UNKNOWN, quantity: sumKnown(ds, 'quantity'), cost: sumKnown(ds, 'cost')
                });
            });
            candidateGroups.forEach(function (g) {
                var ds = details(g, 'candidate'), date = dateKey(first(g, 'candidate', 'date'));
                if (!date) warn('Một số ứng viên chưa có ngày tạo nên không hiện khi lọc theo thời gian.');
                model.candidates.push({
                    key: g.key, code: g.code, name: text(first(g, 'candidate', 'name')), date: date,
                    status: text(first(g, 'candidate', 'status')) || UNKNOWN,
                    applications: ds.map(function (d) {
                        return {
                            positions: unique([text(read(d.row, 'candidate', 'position'))]),
                            requestKeys: resolve(d.row, 'candidate', 'requestRef', requestIndex),
                            planKeys: resolve(d.row, 'candidate', 'planRef', planIndex)
                        };
                    }).filter(function (a) { return a.requestKeys.length || a.planKeys.length; }),
                    positions: unique(ds.map(function (d) { return text(read(d.row, 'candidate', 'position')); })),
                    sources: unique(ds.map(function (d) { return text(read(d.row, 'candidate', 'source')); })),
                    requestKeys: resolveGroup(g, 'candidate', 'requestRef', requestIndex), planKeys: resolveGroup(g, 'candidate', 'planRef', planIndex)
                });
            });
            var planByKey = new Map(model.plans.map(function (x) { return [x.key, x]; }));
            var candidateByKey = new Map(model.candidates.map(function (x) { return [x.key, x]; }));
            rows('planLinks').forEach(function (row) {
                var plans = resolve(row, 'planLink', 'planRef', planIndex), requests = resolve(row, 'planLink', 'requestRef', requestIndex), candidates = resolve(row, 'planLink', 'candidateRef', candidateIndex);
                plans.forEach(function (key) { var p = planByKey.get(key); p.requestKeys = unique(p.requestKeys.concat(requests)); });
                candidates.forEach(function (key) { var c = candidateByKey.get(key); c.planKeys = unique(c.planKeys.concat(plans)); c.requestKeys = unique(c.requestKeys.concat(requests)); });
                if (!plans.length && !requests.length && !candidates.length) warn('Một số ứng viên chưa gắn được với kế hoạch.');
            });
            var interviewSeen = new Map();
            rows('interviews').forEach(function (row) {
                var id = text(read(row, 'interview', 'id')), key = 'pv:' + (id || 'row:' + stableString(row));
                if (id && Number.isFinite(Number(id)) && Number(id) <= 0) return;
                if (!id) { warn('Một số lịch phỏng vấn chưa có mã lịch nên chưa được tính.'); return; }
                var cs = resolve(row, 'interview', 'candidateRef', candidateIndex), ps = resolve(row, 'interview', 'planRef', planIndex), rs = resolve(row, 'interview', 'requestRef', requestIndex);
                cs.forEach(function (candidateKey) {
                    var c = candidateByKey.get(candidateKey); c.planKeys = unique(c.planKeys.concat(ps)); c.requestKeys = unique(c.requestKeys.concat(rs));
                    if (ps.length || rs.length) c.applications.push({ positions: unique([text(read(row, 'interview', 'position'))]), planKeys: ps.slice(), requestKeys: rs.slice() });
                });
                if (interviewSeen.has(key)) {
                    var existing = interviewSeen.get(key);
                    existing.candidateKeys = unique(existing.candidateKeys.concat(cs)); existing.planKeys = unique(existing.planKeys.concat(ps)); existing.requestKeys = unique(existing.requestKeys.concat(rs)); return;
                }
                var date = dateKey(read(row, 'interview', 'date'));
                if (!date) warn('Một số lịch phỏng vấn chưa có ngày phỏng vấn.');
                if (!id) warn('Một số lịch phỏng vấn chưa có mã.');
                if (!cs.length && !ps.length && !rs.length) warn('Một số lịch phỏng vấn chưa gắn với yêu cầu, kế hoạch hoặc ứng viên.');
                var interview = {
                    key: key, candidateKeys: cs, planKeys: ps, requestKeys: rs, date: date, time: text(read(row, 'interview', 'time')),
                    status: text(read(row, 'interview', 'status')) || UNKNOWN, position: text(read(row, 'interview', 'position')), name: text(read(row, 'interview', 'name'))
                };
                interviewSeen.set(key, interview); model.interviews.push(interview);
            });
            model.candidates.forEach(function (c) {
                c.requestKeys = unique(c.requestKeys.concat(c.planKeys.flatMap(function (key) { return planByKey.get(key).requestKeys; })));
                c.applications.forEach(function (a) { a.requestKeys = unique(a.requestKeys.concat(a.planKeys.flatMap(function (key) { return planByKey.get(key).requestKeys; }))); });
            });
            model.interviews.forEach(function (i) {
                // An applicant can have several applications. Keep the schedule's own
                // plan links; copying every plan of that applicant would invent links.
                i.requestKeys = unique(i.requestKeys.concat(i.planKeys.flatMap(function (key) { return planByKey.get(key).requestKeys; })));
                if (!i.name) i.name = i.candidateKeys.map(function (key) { return candidateByKey.get(key).name; }).filter(Boolean).join(', ');
            });
            if (model.plans.some(function (p) { return !p.requestKeys.length; })) warn('Một số kế hoạch chưa gắn với yêu cầu tuyển dụng.');
            if (model.candidates.some(function (c) { return !c.requestKeys.length && !c.planKeys.length; })) warn('Một số ứng viên chưa gắn với yêu cầu hoặc kế hoạch nên không hiện khi lọc theo phòng ban.');
            // Keep all entities in their own date cohorts. Relationship metadata is based on full source data.
            return model;
        }

        function filterModel(model, filter) {
            filter = filter || {};
            var from = dateKey(filter.from), to = dateKey(filter.to), department = text(filter.department), position = text(filter.position), candidateStatus = text(filter.candidateStatus), search = normal(filter.search);
            var warnings = (model.warnings || []).slice();
            if (from && to && from > to) warnings.push('Ngày bắt đầu đang lớn hơn ngày kết thúc.');
            function dateMatches(item) { return (!from && !to) || (!!item.date && (!from || item.date >= from) && (!to || item.date <= to)); }
            function searchMatches(parts) { return !search || normal(parts.filter(Boolean).join(' ')).includes(search); }
            function same(a, b) { return normal(a) === normal(b); }
            var requestsByKey = new Map(model.requests.map(function (x) { return [x.key, x]; }));
            var plansByKey = new Map(model.plans.map(function (x) { return [x.key, x]; }));
            var candidatesByKey = new Map(model.candidates.map(function (x) { return [x.key, x]; }));
            function requestScope(keys, includePosition) {
                return keys.map(function (key) { return requestsByKey.get(key); }).filter(Boolean).some(function (r) {
                    return (!department || same(r.department, department)) && (!includePosition || !position || r.details.some(function (d) { return same(d.position, position); }));
                });
            }
            function candidateScope(candidate) {
                var positionMatches = !position || candidate.positions.some(function (p) { return same(p, position); });
                if (!department) return positionMatches;
                if (!position) return requestScope(candidate.requestKeys, false);
                return positionMatches && (candidate.applications || []).some(function (a) {
                    return requestScope(a.requestKeys, true) && (a.positions.some(function (p) { return same(p, position); }) || (!a.positions.length && candidate.requestKeys.length === 1));
                });
            }
            var requests = model.requests.filter(function (r) {
                return dateMatches(r) && (!department || same(r.department, department)) && (!position || r.details.some(function (d) { return same(d.position, position); })) && searchMatches([r.code, r.name, r.department, r.status].concat(r.details.map(function (d) { return d.position; })));
            }).map(function (r) {
                if (!position) return r;
                var ds = r.details.filter(function (d) { return same(d.position, position); });
                return Object.assign({}, r, { details: ds, quantity: ds.some(function (d) { return d.quantity === null; }) ? null : ds.reduce(function (sum, d) { return sum + d.quantity; }, 0) });
            });
            var plans = model.plans.filter(function (p) {
                return dateMatches(p) && ((!department && !position) || requestScope(p.requestKeys, true)) && searchMatches([p.code, p.name, p.status]);
            });
            var candidates = model.candidates.filter(function (c) {
                return dateMatches(c) && candidateScope(c) && (!candidateStatus || same(c.status, candidateStatus)) && searchMatches([c.code, c.name, c.status].concat(c.positions, c.sources));
            });
            var interviews = model.interviews.filter(function (i) {
                var cs = i.candidateKeys.map(function (key) { return candidatesByKey.get(key); }).filter(Boolean);
                var departmentMatches = !department || requestScope(i.requestKeys, false) || (!i.requestKeys.length && !i.planKeys.length && cs.some(function (c) { return requestScope(c.requestKeys, false); }));
                var positionMatches = !position || (i.position ? same(i.position, position) : cs.some(function (c) { return c.positions.length === 1 && same(c.positions[0], position); }));
                var statusMatches = !candidateStatus || cs.some(function (c) { return same(c.status, candidateStatus); });
                return dateMatches(i) && departmentMatches && positionMatches && statusMatches && searchMatches([i.name, i.position, i.status].concat(cs.flatMap(function (c) { return [c.code, c.name]; }), i.planKeys.map(function (key) { var p = plansByKey.get(key); return p && p.code; })));
            });
            return {
                requests: requests, plans: plans, candidates: candidates, interviews: interviews, warnings: unique(warnings),
                filter: { from: from || '', to: to || '', department: department, position: position, candidateStatus: candidateStatus, search: text(filter.search) }
            };
        }

        function aggregate(filtered, granularity) {
            granularity = ['day', 'week', 'month'].includes(granularity) ? granularity : 'day';
            var requests = filtered.requests || [], plans = filtered.plans || [], candidates = filtered.candidates || [], interviews = filtered.interviews || [];
            var timelineMap = new Map(), positionMap = new Map();
            function knownSum(items, property) { return items.reduce(function (sum, item) { return sum + (item[property] === null ? 0 : item[property] || 0); }, 0); }
            var missingDemand = requests.reduce(function (count, r) { return count + r.details.filter(function (d) { return d.quantity === null; }).length; }, 0);
            var demand = requests.reduce(function (sum, r) { return sum + knownSum(r.details, 'quantity'); }, 0);
            function groupLabel(d) {
                if (granularity === 'month') return String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
                var key = dateKey(d), dd = key.slice(8), mm = key.slice(5, 7);
                return (granularity === 'week' ? 'Tuần ' : '') + dd + '/' + mm;
            }
            function period(value) {
                var d = localDate(value); if (!d) return null;
                if (granularity === 'week') d = monday(d);
                else if (granularity === 'month') d = new Date(d.getFullYear(), d.getMonth(), 1);
                return { key: dateKey(d), label: groupLabel(d) };
            }
            function bucket(value) {
                var p = period(value); if (!p) return null;
                if (!timelineMap.has(p.key)) timelineMap.set(p.key, { key: p.key, label: p.label, demand: 0, candidates: 0, requests: 0, plans: 0, missingDemand: 0 });
                return timelineMap.get(p.key);
            }
            function position(label) {
                label = label || UNKNOWN;
                if (!positionMap.has(label)) positionMap.set(label, { label: label, demand: 0, candidates: 0, missingDemand: 0 });
                return positionMap.get(label);
            }
            // Include empty periods in the selected range, or between first/last dated records.
            var f = filtered.filter || {}, start = localDate(f.from), end = localDate(f.to);
            if (!start || !end) {
                var dates = requests.concat(plans, candidates).map(function (r) { return r.date; }).filter(Boolean).sort();
                start = start || localDate(dates[0]); end = end || localDate(dates[dates.length - 1]);
            }
            if (start && end && start <= end) {
                var cursor = granularity === 'week' ? monday(start) : granularity === 'month' ? new Date(start.getFullYear(), start.getMonth(), 1) : start;
                var totalPeriods = granularity === 'month' ? (end.getFullYear() - cursor.getFullYear()) * 12 + end.getMonth() - cursor.getMonth() + 1 : Math.floor((Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(cursor.getFullYear(), cursor.getMonth(), cursor.getDate())) / 86400000 / (granularity === 'week' ? 7 : 1)) + 1;
                // Long day ranges remain sparse; do not zero-fill just the beginning of the range.
                if (totalPeriods <= 1500) while (cursor <= end) { bucket(cursor); cursor = granularity === 'month' ? new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1) : shiftDay(cursor, granularity === 'week' ? 7 : 1); }
            }
            requests.forEach(function (r) {
                var b = bucket(r.date); if (b) { b.requests++; b.demand += knownSum(r.details, 'quantity'); b.missingDemand += r.details.filter(function (d) { return d.quantity === null; }).length; }
                r.details.forEach(function (d) { var p = position(d.position); if (d.quantity === null) p.missingDemand++; else p.demand += d.quantity; });
            });
            plans.forEach(function (p) { var b = bucket(p.date); if (b) b.plans++; });
            candidates.forEach(function (c) {
                var b = bucket(c.date); if (b) b.candidates++;
                var positions = unique(c.positions.length ? c.positions : [UNKNOWN]);
                if (f.position) positions = positions.filter(function (p) { return normal(p) === normal(f.position); });
                positions.forEach(function (label) { position(label).candidates++; });
            });
            function counts(items, getter) {
                var map = new Map();
                items.forEach(function (item) { unique(getter(item).length ? getter(item) : [UNKNOWN]).forEach(function (label) { map.set(label, (map.get(label) || 0) + 1); }); });
                return Array.from(map, function (entry) { return { label: entry[0], value: entry[1] }; }).sort(function (a, b) { return b.value - a.value || a.label.localeCompare(b.label, 'vi'); });
            }
            return {
                metrics: {
                    requests: requests.length, demand: demand, missingDemand: missingDemand, plans: plans.length, planDemand: knownSum(plans, 'quantity'),
                    missingPlanDemand: plans.filter(function (p) { return p.quantity === null; }).length, candidates: candidates.length, interviews: interviews.length,
                    coverage: !missingDemand && demand > 0 ? candidates.length / demand * 100 : null
                },
                timeline: Array.from(timelineMap.values()).sort(function (a, b) { return a.key.localeCompare(b.key); }),
                positions: Array.from(positionMap.values()).sort(function (a, b) { return b.demand + b.candidates - a.demand - a.candidates || a.label.localeCompare(b.label, 'vi'); }),
                candidateStatuses: counts(candidates, function (c) { return [c.status || UNKNOWN]; }),
                requestStatuses: counts(requests, function (r) { return [r.status || UNKNOWN]; }),
                planStatuses: counts(plans, function (p) { return [p.status || UNKNOWN]; }),
                sources: counts(candidates, function (c) { return c.sources; })
            };
        }

        return { buildModel: buildModel, filterModel: filterModel, aggregate: aggregate, dateKey: dateKey, periodRange: periodRange, escapeHtml: escapeHtml, csvCell: csvCell };

    },

    /* Self-contained browser XLSX writer. No CDN, formulas or external dependencies. */
    workbook: function (headers, rows, title, metadata) {
        'use strict';
        var MAX_ROWS = 1048576, MAX_COLS = 16384, MAX_CELL = 32767;
        if (!Array.isArray(headers) || !headers.length || headers.length > MAX_COLS) throw new Error('Báo cáo Excel phải có từ 1 đến 16.384 cột.');
        if (!Array.isArray(rows) || rows.length + 1 > MAX_ROWS) throw new Error('Báo cáo Excel vượt giới hạn 1.048.576 dòng, gồm dòng tiêu đề.');
        if (typeof TextEncoder === 'undefined') throw new Error('Trình duyệt chưa hỗ trợ xuất Excel.');
        var encoder = new TextEncoder();

        function cleanText(value) {
            var str;
            if (value === null || value === undefined) str = '';
            else if (value instanceof Date) {
                if (Number.isNaN(value.getTime())) throw new Error('Báo cáo có giá trị ngày không hợp lệ.');
                function pad(n) { return String(n).padStart(2, '0'); }
                str = value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate()) + ' ' + pad(value.getHours()) + ':' + pad(value.getMinutes()) + ':' + pad(value.getSeconds());
            } else if (typeof value === 'object') str = JSON.stringify(value);
            else str = String(value);
            if (str.length > MAX_CELL) throw new Error('Một ô trong báo cáo vượt giới hạn 32.767 ký tự của Excel.');
            str = str.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
            var result = '';
            for (var i = 0; i < str.length; i++) {
                var code = str.charCodeAt(i);
                if (code >= 0xD800 && code <= 0xDBFF) {
                    var next = str.charCodeAt(i + 1);
                    if (next >= 0xDC00 && next <= 0xDFFF) { result += str[i] + str[++i]; }
                } else if (code < 0xDC00 || code > 0xDFFF) result += str[i];
            }
            return result;
        }
        function xml(value) { return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]; }); }
        function inlineText(value) {
            var str = cleanText(value), tokens = /_x[0-9A-Fa-f]{4}_/g, match, segments = [], cursor = 0;
            // Split literal Excel escape tokens across rich text runs. This preserves
            // their original text in Excel and readers that do not decode ST_Xstring.
            while ((match = tokens.exec(str))) { segments.push(str.slice(cursor, match.index + 1)); cursor = match.index + 1; }
            if (!segments.length) return '<t xml:space="preserve">' + xml(str) + '</t>';
            segments.push(str.slice(cursor));
            return segments.map(function (part) { return '<r><t xml:space="preserve">' + xml(part) + '</t></r>'; }).join('');
        }
        function colName(index) {
            var result = '', n = index + 1;
            while (n > 0) { var digit = (n - 1) % 26; result = String.fromCharCode(65 + digit) + result; n = Math.floor((n - 1) / 26); }
            return result;
        }
        function widthOf(value) {
            var str = cleanText(value), lines = str.split('\n'), widest = 0;
            lines.forEach(function (line) {
                var wide = line.length + (line.match(/[\u2E80-\uFFFF]/g) || []).length;
                widest = Math.max(widest, wide);
            });
            return widest;
        }
        // heading: tiêu đề in đầu trang tính (gộp ô, căn giữa), kèm dòng thời điểm xuất.
        function worksheet(head, data, heading) {
            var top = heading ? 3 : 1, lastCol = colName(head.length - 1);
            if (head.length > MAX_COLS || data.length + top > MAX_ROWS) throw new Error('Trang tính vượt giới hạn dòng hoặc cột của Excel.');
            var last = lastCol + (data.length + top), sizes = head.map(widthOf);
            for (var w = 0; w < Math.min(data.length, 300); w++) {
                if (!Array.isArray(data[w]) || data[w].length > head.length) throw new Error('Dòng báo cáo phải là danh sách ô và không được vượt số cột tiêu đề.');
                for (var c = 0; c < head.length; c++) sizes[c] = Math.max(sizes[c], widthOf(data[w][c]));
            }
            var cols = sizes.map(function (size, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + Math.min(60, Math.max(14, size + 3)) + '" customWidth="1"/>'; }).join('');
            function cell(value, r, c, header) {
                var ref = colName(c) + r;
                if (!header && typeof value === 'number') {
                    if (!Number.isFinite(value)) throw new Error('Báo cáo có giá trị số không hợp lệ.');
                    return '<c r="' + ref + '" s="2"><v>' + value + '</v></c>';
                }
                if (!header && typeof value === 'boolean') return '<c r="' + ref + '" t="b"><v>' + (value ? 1 : 0) + '</v></c>';
                return '<c r="' + ref + '" s="' + (header ? 1 : 0) + '" t="inlineStr"><is>' + inlineText(value) + '</is></c>';
            }
            var sheetRows = [];
            if (heading) {
                sheetRows.push('<row r="1" ht="34" customHeight="1"><c r="A1" s="3" t="inlineStr"><is>' + inlineText(cleanText(heading).toLocaleUpperCase('vi')) + '</is></c></row>');
                sheetRows.push('<row r="2" ht="20" customHeight="1"><c r="A2" s="4" t="inlineStr"><is>' + inlineText('Xuất lúc ' + new Date().toLocaleString('vi-VN')) + '</is></c></row>');
            }
            sheetRows.push('<row r="' + top + '" ht="30" customHeight="1">' + head.map(function (h, i) { return cell(h, top, i, true); }).join('') + '</row>');
            for (var r = 0; r < data.length; r++) {
                var row = data[r];
                if (!Array.isArray(row) || row.length > head.length) throw new Error('Dòng báo cáo phải là danh sách ô và không được vượt số cột tiêu đề.');
                var parts = [];
                for (var cc = 0; cc < head.length; cc++) parts.push(cell(row[cc], r + top + 1, cc, false));
                sheetRows.push('<row r="' + (r + top + 1) + '">' + parts.join('') + '</row>');
            }
            var merges = heading && head.length > 1 ? '<mergeCells count="2"><mergeCell ref="A1:' + lastCol + '1"/><mergeCell ref="A2:' + lastCol + '2"/></mergeCells>' : '';
            return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
                '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
                '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:' + last + '"/>' +
                '<sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="' + top + '" topLeftCell="A' + (top + 1) + '" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A' + (top + 1) + '" sqref="A' + (top + 1) + '"/></sheetView></sheetViews>' +
                '<sheetFormatPr defaultRowHeight="20"/><cols>' + cols + '</cols><sheetData>' + sheetRows.join('') + '</sheetData>' +
                '<autoFilter ref="A' + top + ':' + last + '"/>' + merges + '<printOptions horizontalCentered="1"/><pageMargins left="0.35" right="0.35" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>' +
                '<pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/>' +
                '</worksheet>';
        }
        function sheetName(value) {
            var str = cleanText(value).replace(/[\[\]:*?\/\\]/g, ' ').replace(/^'+|'+$/g, '').trim() || 'Báo cáo';
            // Names are limited to 31 UTF-16 code units; avoid splitting an emoji pair.
            str = str.slice(0, 31);
            if (/[\uD800-\uDBFF]$/.test(str)) str = str.slice(0, -1);
            return str || 'Báo cáo';
        }
        var mainName = sheetName(title || 'Báo cáo tuyển dụng');
        var sheets = [{ name: mainName, xml: worksheet(headers, rows, title || mainName) }];
        if (metadata !== null && metadata !== undefined) {
            var info = [['Báo cáo', title || mainName]];
            if (Array.isArray(metadata)) {
                metadata.forEach(function (pair) { if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Thông tin báo cáo phải có dạng [nhãn, giá trị].'); info.push(pair); });
            } else if (typeof metadata === 'object') Object.keys(metadata).forEach(function (key) { info.push([key, metadata[key]]); });
            else throw new Error('Thông tin báo cáo phải là đối tượng hoặc danh sách [nhãn, giá trị].');
            sheets.push({ name: mainName.toLowerCase() === 'thông tin' ? 'Thông tin (2)' : 'Thông tin', xml: worksheet(['Thông tin', 'Giá trị'], info, 'Thông tin báo cáo') });
        }

        var decl = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        var sheetOverrides = sheets.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('');
        var contents = decl + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' + sheetOverrides + '</Types>';
        var rels = decl + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>';
        var workbook = decl + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>' + sheets.map(function (sheet, i) { return '<sheet name="' + xml(sheet.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets></workbook>';
        var workbookRels = decl + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
        var styles = decl + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
            '<fonts count="4"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="16"/><color rgb="FF1F2A44"/><name val="Calibri"/><family val="2"/></font><font><i/><sz val="10"/><color rgb="FF6B7280"/><name val="Calibri"/><family val="2"/></font></fonts>' +
            '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1F2A44"/><bgColor indexed="64"/></patternFill></fill></fills>' +
            '<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF9AA6B8"/></left><right style="thin"><color rgb="FF9AA6B8"/></right><top style="thin"><color rgb="FF9AA6B8"/></top><bottom style="thin"><color rgb="FF9AA6B8"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
            '<cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>' +
            '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf></cellXfs>' +
            '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
        var stamp = new Date().toISOString();
        var core = decl + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + xml(cleanText(title || mainName)) + '</dc:title><dc:creator>Zilcode</dc:creator><cp:lastModifiedBy>Zilcode</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">' + stamp + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + stamp + '</dcterms:modified></cp:coreProperties>';
        var app = decl + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Zilcode</Application><AppVersion>1.0</AppVersion></Properties>';
        var files = [
            { name: '[Content_Types].xml', data: contents }, { name: '_rels/.rels', data: rels },
            { name: 'xl/workbook.xml', data: workbook }, { name: 'xl/_rels/workbook.xml.rels', data: workbookRels },
            { name: 'xl/styles.xml', data: styles }, { name: 'docProps/core.xml', data: core }, { name: 'docProps/app.xml', data: app }
        ];
        sheets.forEach(function (sheet, i) { files.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: sheet.xml }); });

        var crcTable = new Uint32Array(256);
        for (var t = 0; t < 256; t++) {
            var crc = t;
            for (var bit = 0; bit < 8; bit++) crc = (crc & 1) ? 0xEDB88320 ^ (crc >>> 1) : crc >>> 1;
            crcTable[t] = crc >>> 0;
        }
        function crc32(data) {
            var crc = 0xFFFFFFFF;
            for (var i = 0; i < data.length; i++) crc = crcTable[(crc ^ data[i]) & 255] ^ (crc >>> 8);
            return (crc ^ 0xFFFFFFFF) >>> 0;
        }
        var now = new Date(), year = Math.max(1980, Math.min(2107, now.getFullYear()));
        var dosDate = ((year - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
        var dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
        var localParts = [], centralParts = [], offset = 0, centralSize = 0;
        files.forEach(function (file) {
            var name = encoder.encode(file.name), data = encoder.encode(file.data), checksum = crc32(data);
            if (data.length > 0xFFFFFFFF || offset + 30 + name.length + data.length > 0xFFFFFFFF) throw new Error('Báo cáo quá lớn cho định dạng ZIP của Excel.');
            var local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
            lv.setUint32(0, 0x04034B50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true);
            lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true); lv.setUint32(14, checksum, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true); lv.setUint16(26, name.length, true);
            local.set(name, 30); localParts.push(local, data);
            var central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
            cv.setUint32(0, 0x02014B50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true);
            cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true); cv.setUint32(16, checksum, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true);
            central.set(name, 46); centralParts.push(central); centralSize += central.length; offset += local.length + data.length;
        });
        if (offset + centralSize + 22 > 0xFFFFFFFF) throw new Error('Báo cáo quá lớn cho định dạng ZIP của Excel.');
        var end = new Uint8Array(22), ev = new DataView(end.buffer);
        ev.setUint32(0, 0x06054B50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
        var output = new Uint8Array(offset + centralSize + end.length), position = 0;
        localParts.concat(centralParts, [end]).forEach(function (part) { output.set(part, position); position += part.length; });
        return output;
    },

    /* Đọc đủ trang, biểu đồ tương tác, tra cứu theo mục và xuất XLSX. */
    initReport: function (root) {
        var document = root.document;
        'use strict';
        var C = root.RecruitmentDashboardCore;
        var SOURCES = {
            requests: 'ba_yctuyendung_v', plans: 'ba_selectKHtuyendung_view', candidates: 'ba_ungvien_v',
            interviews: 'ba_selectLichPhongVan_view'
        };
        var COLORS = ['#6366f1', '#0d9488', '#f59e0b', '#ec4899', '#38bdf8', '#8b5cf6', '#64748b', '#84cc16'];
        var state = { model: null, filtered: null, aggregate: null, panels: null, table: 'requests', page: 1, busy: false, valid: true, stale: false, requestId: 0, detailFilters: {}, unseen: null, highlight: {} };
        var SEEN_KEY = 'DashboardTuyenDung.seen.v1', SEEN_TABLE = 'ba_dashboard_daxem';
        var TABLE_NAMES = { requests: 'yêu cầu', plans: 'kế hoạch', candidates: 'ứng viên', interviews: 'lịch phỏng vấn' };
        var $ = function (id) { return document.getElementById(id); };
        var fmt = function (v) { return Number(v || 0).toLocaleString('vi-VN'); };
        var esc = function (v) { return C.escapeHtml(v == null ? '' : v); };
        var dateText = function (v) { var d = C.dateKey(v); return d ? d.slice(8) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : 'Chưa có ngày'; };
        function statusInfo(value, type) { return DashboardTuyenDung.statusInfo(value, type); }
        function statusBadge(value, type) { var info = statusInfo(value, type); return '<span class="status-pill status-' + info.tone + '">' + esc(info.label) + '</span>'; }
        function message(text, error) {
            $('message').hidden = !text;
            $('message').textContent = text || '';
            $('message').classList.toggle('error', !!error);
        }
        function options() { return root.DashboardTuyenDungOptions || {}; }
        function session() {
            var config = options();
            if (config.serviceUrl) return { url: config.serviceUrl, token: config.token || null };
            var windows = [root];
            try { if (root.opener && !root.opener.closed) windows.push(root.opener); } catch (_) { /* cross-origin */ }
            try { if (root.parent !== root) windows.push(root.parent); } catch (_) { /* cross-origin */ }
            for (var i = 0; i < windows.length; i++) {
                try {
                    var nut = windows[i].NUT;
                    if (nut && nut.services && nut.services[3] && nut.services[3].url) {
                        return { url: nut.services[3].url, token: nut.ds && nut.ds.token };
                    }
                } catch (_) { /* Phiên khác origin không được đọc. */ }
            }
            throw new Error('Chưa có phiên dữ liệu. Vui lòng mở báo cáo từ module tuyển dụng trong phiên demo đã đăng nhập.');
        }
        async function request(url, token) {
            var controller = new AbortController();
            var timer = setTimeout(function () { controller.abort(); }, 30000);
            try {
                var headers = { Accept: 'application/json' };
                if (token) headers.Authorization = token;
                var response = await fetch(url, { headers: headers, credentials: 'same-origin', signal: controller.signal, cache: 'no-store' });
                if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? 'Phiên đăng nhập không hợp lệ hoặc chưa có quyền đọc dữ liệu (' + response.status + ').' : 'Không đọc được dữ liệu (HTTP ' + response.status + ').');
                var data;
                try { data = await response.json(); } catch (_) { throw new Error('Máy chủ không trả về dữ liệu JSON hợp lệ.'); }
                if (!data || data.success !== true || !Array.isArray(data.result)) throw new Error('View không trả về dữ liệu đúng định dạng {success, result}.');
                return data;
            } catch (e) {
                if (e.name === 'AbortError') throw new Error('Hết thời gian chờ dữ liệu. Vui lòng tải lại.');
                throw e;
            } finally { clearTimeout(timer); }
        }
        function dataUrl(base, view, params) {
            var url = new URL('data/' + view, base.replace(/\/?$/, '/'));
            url.searchParams.set('where', '');
            Object.keys(params).forEach(function (key) { url.searchParams.set(key, String(params[key])); });
            return url;
        }
        async function readCount(ctx, view) {
            try {
                var res = await request(dataUrl(ctx.url, view, { select: 'count(*) as dashboard_count' }), ctx.token);
                var row = res.result[0];
                if (row && Object.prototype.hasOwnProperty.call(row, 'dashboard_count')) {
                    var count = Number(row.dashboard_count);
                    if (Number.isSafeInteger(count) && count >= 0) return count;
                }
            } catch (_) { /* Một số quyền chỉ cho phép select thông thường. */ }
            return null;
        }
        async function readView(ctx, view) {
            var count = await readCount(ctx, view);
            if (count === 0) return [];
            var sample = await request(dataUrl(ctx.url, view, { limit: 1 }), ctx.token);
            if (!sample.result.length) {
                if (count > 0) throw new Error('Dữ liệu thay đổi trong lúc tải. Vui lòng tải lại.');
                return [];
            }
            var columns = Object.keys(sample.result[0]).filter(function (k) { return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k); });
            var keys = columns.filter(function (k) { return /id$/i.test(k) || /^(MaYCTD|MaKH|MaUV|MaLPV|MaPV)$/i.test(k); });
            var explicit = options().orderBy && options().orderBy[view];
            if (explicit) {
                if (!Array.isArray(explicit) || !explicit.length || explicit.some(function (key) { return !columns.includes(key); })) throw new Error('Cấu hình orderBy của ' + view + ' phải là danh sách tên cột có trong dữ liệu.');
                keys = explicit;
            }
            if (!keys.length) keys = columns.filter(function (k) { return /ngaytao|ngaypv|ngayphongvan|createddate/i.test(k); });
            var order = keys.map(function (k) { return '[' + k + ']'; }).join(',');
            var rows = [], offset = 0, previous = '', limit = 1000, pageCount = 0;
            while (true) {
                var query = { offset: offset, limit: limit };
                if (order) query.orderby = order;
                var res = await request(dataUrl(ctx.url, view, query), ctx.token);
                var page = res.result;
                if (!page.length) break;
                var fingerprint = JSON.stringify(page);
                if (offset && fingerprint === previous) throw new Error('Máy chủ không phân trang ổn định. Báo cáo dừng để tránh số liệu thiếu hoặc trùng.');
                previous = fingerprint;
                pageCount++;
                rows = rows.concat(page);
                offset += page.length;
                if (rows.length > 200000) throw new Error('Dữ liệu vượt giới hạn 200.000 dòng của báo cáo. Cần thu hẹp dữ liệu tại nguồn.');
                if (count !== null && offset >= count) break;
                // Khi chưa biết tổng, đọc tới trang rỗng, kể cả máy chủ áp limit nhỏ hơn 1000.
            }
            if (count !== null && rows.length !== count) throw new Error('Số dòng tải về khác tổng dữ liệu nguồn. Vui lòng tải lại.');
            if (pageCount > 1) {
                if (!keys.length) throw new Error('Chưa có khóa sắp xếp để phân trang ' + view + '. Cần khai báo orderBy theo khóa duy nhất của view.');
                var seen = new Set();
                rows.forEach(function (row) {
                    var key = JSON.stringify(keys.map(function (column) { return row[column]; }));
                    if (seen.has(key)) throw new Error('Khóa phân trang của ' + view + ' chưa duy nhất. Cần khai báo orderBy bao gồm khóa chi tiết để tránh đếm thiếu hoặc trùng.');
                    seen.add(key);
                });
            }
            if (count !== null && await readCount(ctx, view) !== count) throw new Error('Dữ liệu thay đổi trong lúc tải. Vui lòng tải lại.');
            return rows;
        }
        async function refresh() {
            if (state.busy) return;
            state.busy = true;
            var requestId = ++state.requestId;
            $('refreshButton').disabled = true;
            $('dataStatus').textContent = 'Đang tải dữ liệu';
            $('dataStatus').className = 'data-status loading';
            hideTooltip(); syncExportButtons();
            message('');
            try {
                var raw = options().data;
                if (!raw) {
                    var ctx = session();
                    var names = Object.keys(SOURCES);
                    var results = await Promise.allSettled(names.map(function (name) { return readView(ctx, SOURCES[name]); }));
                    var failures = [];
                    raw = {};
                    results.forEach(function (result, i) {
                        if (result.status === 'fulfilled') raw[names[i]] = result.value;
                        else failures.push(SOURCES[names[i]] + ': ' + result.reason.message);
                    });
                    if (failures.length) throw new Error(failures.join(' · '));
                }
                var supplied = raw;
                raw = {};
                Object.keys(SOURCES).forEach(function (name) { raw[name] = supplied[name] || supplied[SOURCES[name]]; });
                Object.keys(SOURCES).forEach(function (name) {
                    if (!Array.isArray(raw[name])) throw new Error('Thiếu tập dữ liệu ' + SOURCES[name] + '. Báo cáo cần đầy đủ bốn nguồn để tính đúng.');
                });
                raw.planLinks = []; // selectKH chỉ liên kết YC–KH, không có khóa ứng viên.
                var model = C.buildModel(raw, { mapping: options().mapping || {} });
                var today = C.dateKey(new Date());
                model.plans.forEach(function (plan) {
                    plan.requestStatus = plan.status; // status trong selectKH là yc.status.
                    plan.status = !plan.start && !plan.end ? 'Chưa có thời gian' : plan.start && plan.end && plan.start > plan.end ? 'Khoảng ngày chưa hợp lệ' : plan.start && plan.start > today ? 'Chưa bắt đầu' : plan.end && plan.end < today ? 'Đã kết thúc' : 'Đang triển khai';
                });
                if (!options().data) await applyPositionNames(model);
                var seen = await loadSeen();
                if (requestId !== state.requestId) return;
                state.model = model; state.stale = false;
                state.requestMap = new Map(model.requests.map(function (r) { return [r.key, r.code]; }));
                state.candidateMap = new Map(model.candidates.map(function (r) { return [r.key, r.name || r.code]; }));
                syncNotices(seen);
                populatePlanFilters();
                populateFilters();
                applyFilters();
                $('dataStatus').textContent = options().data ? 'Dữ liệu được cung cấp' : 'Đã tải dữ liệu';
                $('dataStatus').className = 'data-status ready';
                $('updatedAt').textContent = (options().data ? 'Nạp báo cáo lúc ' : 'Cập nhật ') + new Date().toLocaleString('vi-VN');
            } catch (e) {
                state.stale = !!state.model;
                $('dataStatus').textContent = state.model ? 'Chưa cập nhật được' : 'Chưa có dữ liệu';
                $('dataStatus').className = 'data-status error';
                message(e.message + (state.model ? ' Các số liệu đang hiển thị thuộc lần tải thành công trước.' : ''), true);
                if (!state.model) {
                    document.querySelectorAll('.chart-empty').forEach(function (el) { el.textContent = 'Chưa có dữ liệu để hiển thị'; });
                    $('tableSummary').textContent = 'Chưa có dữ liệu';
                    $('detailTable').querySelector('tbody').innerHTML = '<tr><td class="table-empty">Chưa có dữ liệu để hiển thị</td></tr>';
                }
            } finally {
                state.busy = false;
                $('refreshButton').disabled = false;
                syncExportButtons();
            }
        }
        function setSelect(id, values, label) {
            var select = $(id), old = select.value;
            select.replaceChildren();
            select.add(new Option(label, ''));
            Array.from(new Set(values.filter(Boolean))).sort(function (a, b) { return String(a).localeCompare(String(b), 'vi'); }).forEach(function (value) { select.add(new Option(value, value)); });
            if (Array.from(select.options).some(function (item) { return item.value === old; })) select.value = old;
        }
        function populateFilters() {
            setSelect('departmentFilter', state.model.requests.map(function (r) { return r.department; }), 'Tất cả phòng ban');
            setSelect('positionFilter', state.model.requests.flatMap(function (r) { return r.details.map(function (d) { return d.position; }); }).concat(state.model.candidates.flatMap(function (r) { return r.positions; })), 'Tất cả vị trí');
            setStatusSelect('statusFilter', state.model.candidates.map(function (r) { return r.status; }), 'Tất cả trạng thái', 'candidates');
        }
        function setStatusSelect(id, values, label, type) {
            setSelect(id, values, label);
            Array.from($(id).options).forEach(function (option) { if (option.value) option.textContent = statusInfo(option.value, type).label; });
        }
        function filterValues() {
            return { from: $('dateFrom').value, to: $('dateTo').value, department: $('departmentFilter').value, position: $('positionFilter').value, candidateStatus: $('statusFilter').value, search: $('searchInput').value.trim() };
        }
        function applyFilters() {
            if (!state.model) return;
            var filters = filterValues();
            if (filters.from && filters.to && filters.from > filters.to) {
                message('Từ ngày phải nhỏ hơn hoặc bằng đến ngày.', true);
                state.valid = false; hideTooltip(); syncExportButtons();
                return;
            }
            state.valid = true;
            message('');
            state.filtered = C.filterModel(state.model, filters);
            state.aggregate = C.aggregate(state.filtered, $('granularity').value);
            state.aggregate.sources = sourceStats(state.filtered.candidates);
            state.page = 1;
            render();
        }
        function kpis() {
            var m = state.aggregate.metrics;
            var data = [
                ['Phiếu yêu cầu', m.requests, 'Yêu cầu tuyển dụng trong kỳ', 'document', 'indigo'],
                ['Nhu cầu tuyển', m.missingDemand ? fmt(m.demand) + ' +' : m.demand, m.missingDemand ? 'Nhu cầu đang cập nhật' : 'Số người cần tuyển', 'briefcase', 'teal'],
                ['Kế hoạch tuyển dụng', m.plans, 'Kế hoạch được tạo trong kỳ', 'briefcase', 'indigo'],
                ['Ứng viên', m.candidates, '', 'users', 'teal'],
                ['Lịch phỏng vấn', m.interviews, 'Các cuộc hẹn tuyển dụng', 'calendar', 'amber'],
                ['Hồ sơ / nhu cầu', m.coverage == null ? '—' : Number(m.coverage).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%', 'Hồ sơ so với nhu cầu tuyển', 'check', 'rose']
            ];
            $('kpiGrid').innerHTML = data.map(function (r) {
                return '<article class="kpi-card ' + r[4] + '"><div class="kpi-top"><span class="kpi-label">' + esc(r[0]) + '</span><span class="kpi-icon ' + r[4] + '"><svg class="icon" aria-hidden="true"><use href="#i-' + r[3] + '"></use></svg></span></div><div class="kpi-value">' + (typeof r[1] === 'number' ? fmt(r[1]) : esc(r[1])) + '</div><div class="kpi-meta">' + esc(r[2]) + '</div></article>';
            }).join('');
        }
        function empty(id, text) { $(id).innerHTML = '<div class="chart-empty">' + esc(text || 'Không có dữ liệu trong bộ lọc đã chọn') + '</div>'; }
        function legend(items) {
            return '<div class="chart-legend">' + items.map(function (r) { return '<span class="legend-item"><i class="legend-dot" style="background:' + r[1] + '"></i>' + esc(r[0]) + '</span>'; }).join('') + '</div>';
        }
        function tipAttributes(title, rows, note) {
            var data = { title: title, rows: rows, note: note || '' };
            var label = title + '. ' + rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('. ') + (note ? '. ' + note : '');
            return ' data-tip="' + esc(JSON.stringify(data)) + '" tabindex="0" aria-label="' + esc(label) + '"';
        }
        function periodTitle(r) { return ($('granularity').value === 'month' ? 'Tháng ' + r.label : ($('granularity').value === 'week' ? 'Tuần bắt đầu ' : 'Ngày ') + dateText(r.key)); }
        function chartFrame(id, rows, series, label) {
            var width = Math.max(640, $(id).clientWidth || 0, rows.length * 46 + 80), top = 22, bottom = 236, left = 48;
            var max = Math.max(1, ...rows.flatMap(function (r) { return series.map(function (s) { return r[s[0]]; }); }));
            var magnitude = Math.pow(10, Math.floor(Math.log10(max / 4))), normalized = max / 4 / magnitude;
            var tick = Math.max(1, (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude);
            var ticks = Math.max(2, Math.ceil(max / tick)), ceiling = ticks * tick, step = (width - left - 24) / rows.length;
            // The x position remains proportional to time even when a very long range is not fully zero-filled.
            var ordinal = function (r) { var d = r.key.split('-').map(Number); return $('granularity').value === 'month' ? d[0] * 12 + d[1] : Date.UTC(d[0], d[1] - 1, d[2]) / 86400000 / ($('granularity').value === 'week' ? 7 : 1); };
            var first = ordinal(rows[0]), span = ordinal(rows[rows.length - 1]) - first;
            var x = function (r) { return left + step / 2 + (span ? (ordinal(r) - first) / span * (width - left - 24 - step) : 0); };
            var y = function (v) { return bottom - v / ceiling * (bottom - top); };
            var svg = '<svg viewBox="0 0 ' + width + ' 282" role="group" aria-label="' + esc(label) + '" style="min-width:' + width + 'px">';
            for (var i = 0; i <= ticks; i++) svg += '<line x1="' + left + '" x2="' + (width - 20) + '" y1="' + y(i * tick) + '" y2="' + y(i * tick) + '" stroke="#e7edf5" stroke-dasharray="3 5"/><text x="' + (left - 10) + '" y="' + (y(i * tick) + 4) + '" text-anchor="end" fill="#8492a8" font-size="11">' + fmt(i * tick) + '</text>';
            rows.forEach(function (r, i) { if (i % Math.max(1, Math.ceil(rows.length / 12)) === 0 || i === rows.length - 1) svg += '<text x="' + x(r) + '" y="264" text-anchor="middle" fill="#7a899f" font-size="11">' + esc(r.label) + '</text>'; });
            var band = function (i) { return Math.min(72, step, i ? x(rows[i]) - x(rows[i - 1]) : step, i + 1 < rows.length ? x(rows[i + 1]) - x(rows[i]) : step); };
            return { svg: svg, width: width, top: top, bottom: bottom, x: x, y: y, step: step, band: band, ordinal: ordinal };
        }
        function trend() {
            var rows = state.aggregate.timeline;
            if (!rows.length) { empty('trendChart', 'Chưa có dữ liệu có ngày tạo trong phạm vi lọc'); return; }
            var series = [['candidates', 'Ứng viên mới', '#089b8f'], ['requests', 'Yêu cầu mới', '#6366ef'], ['plans', 'Kế hoạch mới', '#f0a638']];
            var f = chartFrame('trendChart', rows, series, 'Biểu đồ đường theo ngày tạo'), svg = f.svg;
            svg += '<defs><linearGradient id="candidateArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#089b8f" stop-opacity=".13"/><stop offset="100%" stop-color="#089b8f" stop-opacity="0"/></linearGradient></defs>';
            if (rows.length === 1) {
                var r0 = rows[0], cx = f.x(r0), w = 16, gap = 8, band0 = f.band(0);
                svg += '<defs>' + series.map(function (s) { return '<linearGradient id="g-' + s[0] + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + s[2] + '"/><stop offset="100%" stop-color="' + s[2] + '" stop-opacity=".55"/></linearGradient>'; }).join('') + '</defs>';
                svg += '<g class="chart-hit"' + tipAttributes(periodTitle(r0), series.map(function (s) { return [s[1], fmt(r0[s[0]]), s[2]]; })) + '><rect class="hover-band" x="' + (cx - band0 / 2) + '" y="' + f.top + '" width="' + band0 + '" height="' + (f.bottom - f.top) + '" rx="10"/>';
                series.forEach(function (s, i) {
                    var bx = cx - (w * 1.5 + gap) + i * (w + gap), by = f.y(r0[s[0]]), h = Math.max(f.bottom - by, r0[s[0]] ? 3 : 0);
                    svg += '<rect class="chart-bar" x="' + bx + '" y="' + (f.bottom - h) + '" width="' + w + '" height="' + h + '" rx="5" fill="url(#g-' + s[0] + ')"/><text x="' + (bx + w / 2) + '" y="' + (f.bottom - h - 7) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + s[2] + '">' + fmt(r0[s[0]]) + '</text>';
                });
                svg += '<rect x="' + (cx - band0 / 2) + '" y="' + f.top + '" width="' + band0 + '" height="' + (f.bottom - f.top) + '" fill="transparent"/></g>';
                $('trendChart').innerHTML = legend(series.map(function (s) { return [s[1], s[2]]; })) + '<div class="chart-scroll">' + svg + '</svg></div>';
                return;
            }
            var continuous = rows.every(function (r, i) { return !i || f.ordinal(r) - f.ordinal(rows[i - 1]) <= 1.001; });
            var path = function (s) { return rows.map(function (r, i) { return (i && f.ordinal(r) - f.ordinal(rows[i - 1]) <= 1.001 ? 'L' : 'M') + f.x(r) + ',' + f.y(r[s]); }).join(' '); };
            if (continuous) svg += '<path d="' + path('candidates') + ' L' + f.x(rows[rows.length - 1]) + ',' + f.bottom + ' L' + f.x(rows[0]) + ',' + f.bottom + ' Z" fill="url(#candidateArea)" pointer-events="none"/>';
            rows.forEach(function (r, i) {
                var band = f.band(i);
                svg += '<g class="chart-hit"' + tipAttributes(periodTitle(r), series.map(function (s) { return [s[1], fmt(r[s[0]]), s[2]]; })) + '><rect class="hover-band" x="' + (f.x(r) - band / 2) + '" y="' + f.top + '" width="' + band + '" height="' + (f.bottom - f.top) + '" rx="7"/><line class="hover-guide" x1="' + f.x(r) + '" x2="' + f.x(r) + '" y1="' + f.top + '" y2="' + f.bottom + '"/>';
                series.forEach(function (s) { svg += '<circle class="line-marker" cx="' + f.x(r) + '" cy="' + f.y(r[s[0]]) + '" r="3.5" fill="white" stroke="' + s[2] + '" stroke-width="2"/>'; });
                svg += '<rect x="' + (f.x(r) - band / 2) + '" y="' + f.top + '" width="' + band + '" height="' + (f.bottom - f.top) + '" fill="transparent"/></g>';
            });
            series.forEach(function (s) { svg += '<path class="line-path" d="' + path(s[0]) + '" stroke="' + s[2] + '"/>'; });
            $('trendChart').innerHTML = legend(series.map(function (s) { return [s[1], s[2]]; })) + '<div class="chart-scroll">' + svg + '</svg></div>';
        }
        function comparison() {
            var rows = state.aggregate.timeline;
            if (!rows.length) { empty('comparisonChart'); return; }
            var f = chartFrame('comparisonChart', rows, [['demand'], ['candidates']], 'Biểu đồ cột nhu cầu tuyển và lượng ứng viên'), svg = f.svg;
            rows.forEach(function (r, index) {
                var x = f.x(r), band = f.band(index), bar = Math.min(17, band * .28), gap = Math.min(2, band * .04), note = r.missingDemand ? fmt(r.missingDemand) + ' vị trí chưa nhập số lượng cần tuyển.' : '';
                svg += '<g class="chart-hit"' + tipAttributes(periodTitle(r), [['Nhu cầu tuyển', fmt(r.demand) + (r.missingDemand ? ' +' : ''), '#6366ef'], ['Hồ sơ ứng viên', fmt(r.candidates), '#089b8f'], ['Phiếu yêu cầu', fmt(r.requests), '#94a3b8']], note) + '><rect class="hover-band" x="' + (x - band / 2) + '" y="' + f.top + '" width="' + band + '" height="' + (f.bottom - f.top) + '" rx="7"/>';
                [r.demand, r.candidates].forEach(function (v, i) {
                    var bx = x + (i ? gap : -bar - gap), color = i ? '#089b8f' : '#6366ef';
                    svg += '<rect class="chart-bar" x="' + bx + '" y="' + f.y(v) + '" width="' + bar + '" height="' + (f.bottom - f.y(v)) + '" rx="4" fill="' + color + '"/>';
                    if (rows.length <= 7) svg += '<text x="' + (bx + bar / 2) + '" y="' + (f.y(v) - 7) + '" text-anchor="middle" font-size="11" font-weight="700" fill="' + color + '">' + fmt(v) + '</text>';
                });
                svg += '<rect x="' + (x - band / 2) + '" y="' + f.top + '" width="' + band + '" height="' + (f.bottom - f.top) + '" fill="transparent"/></g>';
            });
            $('comparisonChart').innerHTML = legend([['Nhu cầu tuyển · người', '#6366ef'], ['Ứng viên · hồ sơ', '#089b8f']]) + '<div class="chart-scroll">' + svg + '</svg></div>';
        }
        function topPositions() {
            return state.aggregate.positions.filter(function (r) { return r.demand > 0 || r.missingDemand > 0; }).sort(function (a, b) { return b.demand - a.demand || b.candidates - a.candidates || a.label.localeCompare(b.label, 'vi'); }).slice(0, 3);
        }
        function positions() {
            var rows = topPositions();
            if (!rows.length) { empty('positionChart', 'Chưa có vị trí cần tuyển trong bộ lọc đã chọn'); return; }
            var max = Math.max(1, ...rows.map(function (r) { return r.demand; }));
            function item(r, i) {
                return '<div class="rank-row"' + tipAttributes('#' + (i + 1) + ' · ' + r.label, [['Cần tuyển', fmt(r.demand) + ' người', '#6366ef'], ['Hồ sơ ứng viên', fmt(r.candidates), '#089b8f']], r.missingDemand ? fmt(r.missingDemand) + ' yêu cầu chưa nhập số lượng cần tuyển.' : '') + '><span class="rank-no' + (i < 3 ? ' top' : '') + '">' + (i + 1) + '</span><div class="rank-main"><div class="bar-header"><span class="bar-label">' + esc(r.label) + '</span><span class="rank-value"><strong>' + fmt(r.demand) + '</strong> người<span class="rank-sub"> · ' + fmt(r.candidates) + ' hồ sơ</span></span></div><div class="bar-track"><div class="bar-fill" style="width:' + r.demand / max * 100 + '%"></div></div></div></div>';
            }
            $('positionChart').innerHTML = '<div class="rank-col rank-top3">' + rows.map(item).join('') + '</div>';
        }
        // Mỗi ứng viên tính một lần cho mỗi nhóm nguồn; chi tiết giữ tên nguồn đọc được.
        function sourceStats(candidates) {
            var groups = new Map(), extra = ['#64748b', '#0f766e', '#a16207', '#be185d', '#4338ca', '#15803d'], next = 0;
            candidates.forEach(function (c) {
                var counted = new Set();
                (c.sources.length ? c.sources : ['']).forEach(function (raw) {
                    var info = DashboardTuyenDung.sourceGroup(raw);
                    if (!groups.has(info.group)) groups.set(info.group, { label: info.group, color: info.color, value: 0, items: new Map() });
                    var g = groups.get(info.group);
                    if (!counted.has(info.group)) { counted.add(info.group); g.value++; }
                    g.items.set(info.label, (g.items.get(info.label) || 0) + 1);
                });
            });
            return Array.from(groups.values()).sort(function (a, b) { return b.value - a.value || a.label.localeCompare(b.label, 'vi'); }).map(function (g) {
                if (!g.color) g.color = extra[next++ % extra.length];
                g.items = Array.from(g.items, function (e) { return { label: e[0], value: e[1] }; }).sort(function (a, b) { return b.value - a.value || a.label.localeCompare(b.label, 'vi'); });
                return g;
            });
        }
        function distribution(id, rows, donut) {
            if (!rows.length) { empty(id); return; }
            var total = rows.reduce(function (sum, r) { return sum + r.value; }, 0), max = Math.max(1, ...rows.map(function (r) { return r.value; }));
            var source = id === 'sourceChart', type = id === 'requestStatusChart' ? 'requests' : 'candidates';
            var unit = source ? 'hồ sơ' : type === 'requests' ? 'yêu cầu' : 'ứng viên';
            function color(r, i) { return source ? r.color || COLORS[i % COLORS.length] : statusInfo(r.label, type).color; }
            function label(r) { return source ? r.label || 'Chưa xác định' : statusInfo(r.label, type).label; }
            function details(r) { return source && r.items && (r.items.length > 1 || r.items[0].label !== r.label) ? r.items : []; }
            function attrs(r, i) { return tipAttributes(label(r), [['Số ' + unit, fmt(r.value), color(r, i)], ['Tỷ trọng', (r.value / total * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%', '#94a3b8']].concat(details(r).slice(0, 6).map(function (d) { return [d.label, fmt(d.value), '#cbd5e1']; }))); }
            var list = rows.map(function (r, i) {
                return '<div class="chart-list-item"' + attrs(r, i) + '><div class="bar-header"><span class="chart-list-label"><i class="legend-dot" style="background:' + color(r, i) + '"></i>' + esc(label(r)) + '</span><strong class="chart-list-value">' + fmt(r.value) + '<span class="share-label">' + (r.value / total * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%</span></strong></div>' + (details(r).length ? '<div class="source-items">' + details(r).map(function (d) { return esc(d.label) + ' ' + fmt(d.value); }).join(' · ') + '</div>' : '') + (!donut ? '<div class="bar-track"><div class="bar-fill" style="background:' + color(r, i) + ';width:' + r.value / max * 100 + '%"></div></div>' : '') + '</div>';
            }).join('');
            if (!donut) { $(id).innerHTML = '<div class="bar-list">' + list + '</div>'; return; }
            // Each segment is a path, so hover targets only its visible arc.
            var offset = -Math.PI / 2, radius = 72, svg = '<svg viewBox="0 0 210 210" role="group" aria-label="Biểu đồ tròn ' + (source ? 'nguồn ứng viên' : 'trạng thái ứng viên') + '"><circle cx="105" cy="105" r="72" fill="none" stroke="#edf2f7" stroke-width="21"/>';
            rows.forEach(function (r, i) {
                var angle = r.value / total * Math.PI * 2, gap = rows.length > 1 ? Math.min(.035, angle * .15) : 0;
                var start = offset + gap / 2, end = offset + angle - gap / 2;
                var x1 = 105 + radius * Math.cos(start), y1 = 105 + radius * Math.sin(start), x2 = 105 + radius * Math.cos(end), y2 = 105 + radius * Math.sin(end);
                var d = angle >= Math.PI * 2 - .00001 ? 'M105,33 A72,72 0 1 1 105,177 A72,72 0 1 1 105,33' : 'M' + x1 + ',' + y1 + ' A72,72 0 ' + (end - start > Math.PI ? 1 : 0) + ' 1 ' + x2 + ',' + y2;
                svg += '<path class="donut-slice"' + attrs(r, i) + ' d="' + d + '" fill="none" stroke="' + color(r, i) + '" stroke-width="21" stroke-linecap="butt"/>'; offset += angle;
            });
            svg += '<text x="105" y="104" text-anchor="middle" font-size="32" font-weight="750" fill="#172b4d">' + fmt(total) + '</text><text x="105" y="126" text-anchor="middle" font-size="12" fill="#7a899f">' + (source ? 'hồ sơ' : 'hồ sơ ứng viên') + '</text></svg>';
            $(id).innerHTML = '<div class="donut-layout"><div class="donut-graphic">' + svg + '</div><div class="chart-list">' + list + '</div></div>';
        }
        function populatePlanFilters() {
            ['planFilter', 'interviewPlanFilter'].forEach(function (id) {
                var select = $(id), old = select.value;
                select.replaceChildren(); select.add(new Option(id === 'planFilter' ? 'Tất cả ứng viên' : 'Tất cả kế hoạch', ''));
                state.model.plans.slice().sort(function (a, b) { return a.code.localeCompare(b.code, 'vi', { numeric: true }); }).forEach(function (plan) {
                    select.add(new Option(plan.code + (plan.name ? ' · ' + plan.name : ''), plan.key));
                });
                if (Array.from(select.options).some(function (item) { return item.value === old; })) select.value = old;
                select.title = select.selectedOptions[0].textContent;
            });
        }
        function panelPeriod(prefix) {
            var mode = $(prefix + 'Period').value, anchor = $(prefix + 'Anchor');
            anchor.disabled = mode === 'all';
            var key = C.dateKey(anchor.value);
            if (mode !== 'all' && !key) return { valid: false, mode: mode, from: null, to: null };
            var parts = key ? key.split('-').map(Number) : null;
            var range = mode === 'all' ? { from: null, to: null } : C.periodRange(mode, new Date(parts[0], parts[1] - 1, parts[2]));
            return { valid: true, mode: mode, from: range.from, to: range.to };
        }
        function inPanelPeriod(row, period) { return period.valid && (period.mode === 'all' || row.date && row.date >= period.from && row.date <= period.to); }
        function statusCounts(rows, type) {
            var counts = new Map(), order = type === 'requests' ? ['DRAFT', 'SUBMIT', 'ACCEPT', 'PLAN_SUBMIT', 'APPROVED', 'REFUSE'] : ['SCREENING', 'ROUND1_SUBMIT', 'INTERVIEW', 'ROUND2_SUBMIT', 'ROUND3_SUBMIT', 'FINISH', 'REJECT'];
            rows.forEach(function (row) { var label = row.status || 'Chưa xác định'; counts.set(label, (counts.get(label) || 0) + 1); });
            return Array.from(counts, function (entry) { return { label: entry[0], value: entry[1] }; }).sort(function (a, b) {
                var ai = order.indexOf(String(a.label).toUpperCase()), bi = order.indexOf(String(b.label).toUpperCase());
                return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi) || b.value - a.value || a.label.localeCompare(b.label, 'vi');
            });
        }
        function panelSummary(id, period, count, unit) {
            var range = !period.valid ? 'Chọn ngày để xem' : period.mode !== 'all' ? (period.from === period.to ? dateText(period.from) : dateText(period.from) + ' – ' + dateText(period.to)) + ' · ' : '';
            $(id).textContent = range + (period.valid ? fmt(count) + ' ' + unit : '');
        }
        function periodEmpty(period, unit) {
            if (!period.valid) return 'Chọn ngày để xem';
            if (period.mode === 'all') return '';
            var when = period.mode === 'day' ? (period.from === C.dateKey(new Date()) ? 'hôm nay' : 'ngày ' + dateText(period.from)) : period.mode === 'week' ? 'tuần đã chọn' : 'tháng đã chọn';
            return 'Chưa có ' + unit + ' trong ' + when;
        }
        function renderPanels() {
            hideTooltip();
            if (!state.filtered) return;
            var rp = panelPeriod('request'), pp = panelPeriod('plan'), ip = panelPeriod('interview');
            var planKey = $('planFilter').value, interviewPlan = $('interviewPlanFilter').value;
            var requests = state.filtered.requests.filter(function (r) { return inPanelPeriod(r, rp); });
            var candidates = state.filtered.candidates.filter(function (c) { return inPanelPeriod(c, pp) && (!planKey || c.planKeys.includes(planKey)); });
            var interviews = state.filtered.interviews.filter(function (i) { return inPanelPeriod(i, ip) && (!interviewPlan || i.planKeys.includes(interviewPlan)); });
            state.panels = { requestRows: requests, planCandidates: candidates, interviewRows: interviews, requestStatuses: statusCounts(requests, 'requests'), planStatuses: statusCounts(candidates, 'candidates'), periods: { requestStatuses: rp, planStatuses: pp, interviews: ip }, planKey: planKey, interviewPlanKey: interviewPlan };
            distribution('requestStatusChart', state.panels.requestStatuses, false);
            if (!requests.length) empty('requestStatusChart', periodEmpty(rp, 'yêu cầu'));
            distribution('planStatusChart', state.panels.planStatuses, false);
            if (!candidates.length) empty('planStatusChart', planKey && pp.mode === 'all' ? 'Chưa có ứng viên trong kế hoạch này' : periodEmpty(pp, 'ứng viên'));
            interviewList();
            if (!interviews.length) empty('interviewList', periodEmpty(ip, 'lịch phỏng vấn'));
            panelSummary('requestScope', rp, requests.length, 'yêu cầu'); panelSummary('planScope', pp, candidates.length, 'ứng viên'); panelSummary('interviewScope', ip, interviews.length, 'lịch hẹn');
            ['planFilter', 'interviewPlanFilter'].forEach(function (id) { $(id).title = $(id).selectedOptions[0].textContent; });
            syncExportButtons();
        }
        function interviewList() {
            var today = C.dateKey(new Date());
            var rows = state.panels.interviewRows.slice().sort(function (a, b) {
                var af = a.date && a.date >= today, bf = b.date && b.date >= today;
                if (af !== bf) return af ? -1 : 1;
                return af ? String(a.date).localeCompare(String(b.date)) : String(b.date || '').localeCompare(String(a.date || ''));
            });
            if (!rows.length) { empty('interviewList'); return; }
            var candidateMap = new Map(state.model.candidates.map(function (r) { return [r.key, r.name || r.code]; }));
            $('interviewList').innerHTML = rows.slice(0, 8).map(function (r) {
                var names = r.candidateKeys.map(function (key) { return candidateMap.get(key); }).filter(Boolean);
                var date = C.dateKey(r.date);
                var badge = date ? '<strong>' + date.slice(8) + '</strong><span style="font-size:9px">' + date.slice(5, 7) + '/' + date.slice(0, 4) + '</span>' : 'Chưa có ngày';
                return '<article class="interview-item"><div class="interview-date" title="' + esc(dateText(r.date)) + '">' + badge + '</div><div class="interview-main"><strong>' + esc(r.name || names.join(', ') || 'Lịch phỏng vấn') + '</strong><span>' + esc(r.position || 'Chưa có vị trí') + '</span></div><div class="interview-time">' + esc(r.time || '') + statusBadge(r.status, 'interviews') + '</div></article>';
            }).join('') + (rows.length > 8 ? '<p class="chart-footnote">Hiển thị 8 / ' + fmt(rows.length) + ' lịch; ưu tiên lịch sắp tới.</p>' : '');
        }
        function detailFilter(type) { return state.detailFilters[type || state.table] || (state.detailFilters[type || state.table] = { search: '', status: '', category: '', source: '', from: '', to: '', sort: 'dateDesc' }); }
        function normalized(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLocaleLowerCase('vi').trim(); }
        function categories(type, r) {
            if (type === 'requests') return [r.department];
            if (type === 'plans') return r.requestKeys.map(function (key) { return state.requestMap.get(key) || key; });
            return type === 'candidates' ? r.positions : [r.position];
        }
        function detailControls() {
            var type = state.table, rows = state.filtered ? state.filtered[type] : [], f = detailFilter();
            $('detailSearch').value = f.search; $('detailFrom').value = f.from; $('detailTo').value = f.to; $('detailSort').value = f.sort;
            setStatusSelect('detailStatus', rows.map(function (r) { return r.status; }).concat(f.status), type === 'plans' ? 'Tất cả tiến độ' : 'Tất cả trạng thái', type); $('detailStatus').value = f.status;
            setSelect('detailCategory', rows.flatMap(function (r) { return categories(type, r); }).concat(f.category), 'Tất cả'); $('detailCategory').value = f.category;
            setSelect('detailSource', (state.filtered ? state.filtered.candidates : []).flatMap(function (r) { return r.sources; }).concat(f.source), 'Tất cả nguồn'); $('detailSource').value = f.source;
            Array.from($('detailSource').options).forEach(function (option) { if (option.value) option.textContent = sourceName(option.value); });
            $('detailSourceField').hidden = type !== 'candidates';
            $('detailCategoryLabel').textContent = type === 'requests' ? 'Phòng yêu cầu' : type === 'plans' ? 'Mã yêu cầu liên quan' : 'Vị trí ứng tuyển';
            $('detailDateLabel').textContent = type === 'interviews' ? 'Ngày phỏng vấn từ' : 'Ngày tạo từ';
            $('detailStatus').previousElementSibling.textContent = type === 'plans' ? 'Tiến độ theo lịch' : 'Trạng thái';
            $('detailExport').innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-download"/></svg>Xuất Excel ' + TABLE_NAMES[type];
            $('detailExport').setAttribute('aria-label', 'Xuất Excel toàn bộ kết quả ' + TABLE_NAMES[type]);
            document.querySelectorAll('[data-table]').forEach(function (b) { b.innerHTML = ({ requests: 'Yêu cầu tuyển dụng', plans: 'Kế hoạch tuyển dụng', candidates: 'Ứng viên', interviews: 'Lịch phỏng vấn' })[b.dataset.table] + badge(b.dataset.table); });
        }
        function sourceName(value) { return DashboardTuyenDung.sourceGroup(value).label; }
        function badge(type) {
            var n = state.unseen && state.unseen[type] ? state.unseen[type].size : 0;
            return n ? '<span class="tab-badge" aria-hidden="true">' + (n > 99 ? '99+' : n) + '</span><span class="sr-only"> (' + n + ' mới)</span>' : '';
        }
        function saveDetailFilter() {
            state.detailFilters[state.table] = { search: $('detailSearch').value.trim(), status: $('detailStatus').value, category: $('detailCategory').value, source: $('detailSource').value, from: $('detailFrom').value, to: $('detailTo').value, sort: $('detailSort').value };
            state.page = 1; table(); syncExportButtons();
        }
        function dataRows(type, rows) {
            var requestMap = state.requestMap;
            if (type === 'requests') return { headers: ['Mã yêu cầu', 'Tên yêu cầu', 'Ngày tạo', 'Phòng yêu cầu', 'Vị trí tuyển', 'Số người cần tuyển', 'Trạng thái'], rows: rows.map(function (r) { return [r.code, r.name, dateText(r.date), r.department, Array.from(new Set(r.details.map(function (d) { return d.position; }))).join(', '), r.quantity == null ? 'Chưa đủ số lượng' : r.quantity, r.status]; }) };
            if (type === 'plans') return { headers: ['Mã kế hoạch', 'Tên kế hoạch', 'Mã yêu cầu', 'Ngày tạo', 'Bắt đầu', 'Kết thúc', 'Trạng thái yêu cầu', 'Tiến độ theo lịch'], rows: rows.map(function (r) { return [r.code, r.name, r.requestKeys.map(function (key) { return requestMap.get(key) || key; }).join(', '), dateText(r.date), dateText(r.start), dateText(r.end), r.requestStatus, r.status]; }) };
            if (type === 'candidates') return { headers: ['Mã ứng viên', 'Họ tên', 'Vị trí ứng tuyển', 'Ngày tạo', 'Nguồn ứng viên', 'Trạng thái'], rows: rows.map(function (r) { return [r.code, r.name, r.positions.join(', '), dateText(r.date), r.sources.map(sourceName).join(', '), r.status]; }) };
            var candidates = state.candidateMap;
            return { headers: ['Mã lịch', 'Ứng viên', 'Vị trí', 'Ngày phỏng vấn', 'Giờ phỏng vấn', 'Mã yêu cầu', 'Mã kế hoạch', 'Trạng thái'], rows: rows.map(function (r) { return [r.key.slice(3), r.name || r.candidateKeys.map(function (key) { return candidates.get(key) || key; }).join(', '), r.position, dateText(r.date), r.time, r.requestKeys.map(function (key) { return requestMap.get(key) || key; }).join(', '), r.planKeys.map(function (key) { return key.replace(/^kh:/, ''); }).join(', '), r.status]; }) };
        }
        function tableData() {
            if (!state.filtered) return { headers: [], rows: [] };
            var type = state.table, f = detailFilter(), invalid = f.from && f.to && f.from > f.to;
            var rows = invalid ? [] : state.filtered[type].filter(function (r) {
                return (!f.status || r.status === f.status) && (!f.category || categories(type, r).includes(f.category)) && (type !== 'candidates' || !f.source || r.sources.includes(f.source)) && (!(f.from || f.to) || r.date && (!f.from || r.date >= f.from) && (!f.to || r.date <= f.to));
            });
            var search = normalized(f.search);
            if (search) rows = rows.filter(function (r) { return dataRows(type, [r]).rows[0].some(function (v) { return normalized(v).includes(search); }); });
            rows.sort(function (a, b) {
                if (f.sort === 'nameAsc') return String(a.name || '').localeCompare(String(b.name || ''), 'vi') || String(a.code || a.key).localeCompare(String(b.code || b.key), 'vi', { numeric: true });
                if (f.sort === 'codeAsc') return String(a.code || a.key).localeCompare(String(b.code || b.key), 'vi', { numeric: true });
                if (!a.date || !b.date) return a.date ? -1 : b.date ? 1 : 0;
                return f.sort === 'dateAsc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
            });
            var result = dataRows(type, rows); result.items = rows;
            return result;
        }
        function table() {
            if (!state.filtered) return;
            var data = tableData(), size = 12, pages = Math.max(1, Math.ceil(data.rows.length / size));
            state.page = Math.min(pages, Math.max(1, state.page));
            $('detailTable').querySelector('thead').innerHTML = '<tr>' + data.headers.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr>';
            var start = (state.page - 1) * size, fresh = state.highlight[state.table], today = C.dateKey(new Date());
            $('detailTable').querySelector('tbody').innerHTML = data.rows.slice(start, start + size).map(function (row, index) {
                var statusIndex = state.table === 'plans' ? row.length - 2 : row.length - 1, type = state.table === 'plans' ? 'requests' : state.table;
                var item = data.items[start + index], isNew = !!item && (state.table === 'interviews' ? !!(fresh && fresh.has(item.key)) : item.date === today);
                return '<tr class="status-row-' + statusInfo(row[statusIndex], type).tone + (isNew ? ' is-new' : '') + '">' + row.map(function (v, i) {
                    return '<td' + (typeof v === 'number' ? ' class="number"' : '') + '>' + (i === 0 && isNew ? '<span class="new-pill">Mới</span>' : '') + (i === statusIndex || i === row.length - 1 ? statusBadge(v, i === statusIndex ? type : 'calendar') : esc(typeof v === 'number' ? fmt(v) : v || '—')) + '</td>';
                }).join('') + '</tr>';
            }).join('') || '<tr><td colspan="' + data.headers.length + '" style="text-align:center;padding:32px">Không có dữ liệu trong bộ lọc đã chọn</td></tr>';
            var f = detailFilter(), invalid = f.from && f.to && f.from > f.to;
            $('detailFilterNote').hidden = !invalid;
            $('detailFilterNote').textContent = invalid ? 'Từ ngày phải nhỏ hơn hoặc bằng đến ngày.' : '';
            $('detailFilterNote').classList.toggle('error', !!invalid);
            $('tableSummary').textContent = fmt(data.rows.length) + ' / ' + fmt(state.filtered[state.table].length) + ' bản ghi · ' + TABLE_NAMES[state.table];
            $('pageInfo').textContent = 'Trang ' + state.page + ' / ' + pages;
            $('prevPage').disabled = state.page <= 1;
            $('nextPage').disabled = state.page >= pages;
        }
        function render() {
            hideTooltip(); kpis(); trend(); comparison(); positions();
            distribution('statusChart', state.aggregate.candidateStatuses, true);
            distribution('sourceChart', state.aggregate.sources, true);
            renderPanels(); detailControls(); table(); syncExportButtons();
            var f = filterValues();
            var scope = [];
            if (f.from || f.to) scope.push((f.from ? dateText(f.from) : 'Tất cả ngày trước') + ' – ' + (f.to ? dateText(f.to) : 'Tất cả ngày sau'));
            if (f.department) scope.push(f.department); if (f.position) scope.push(f.position); if (f.candidateStatus) scope.push(statusInfo(f.candidateStatus, 'candidates').label); if (f.search) scope.push('Tìm: ' + f.search);
            $('scopeNote').hidden = !scope.length; $('scopeNote').textContent = scope.join(' · ');
        }
        function preset() {
            var value = $('periodPreset').value;
            if (value === 'custom') return;
            var range = C.periodRange(value, new Date());
            $('dateFrom').value = range.from || '';
            $('dateTo').value = range.to || '';
            applyFilters();
        }
        var tooltipTarget = null, tooltipPinned = false;
        function hideTooltip() {
            if (tooltipTarget) { tooltipTarget.classList.remove('is-hovered'); tooltipTarget.removeAttribute('aria-describedby'); }
            tooltipTarget = null; tooltipPinned = false;
            if ($('chartTooltip')) $('chartTooltip').hidden = true;
        }
        function placeTooltip(event) {
            if (!tooltipTarget) return;
            var tip = $('chartTooltip'), box = tip.getBoundingClientRect(), rect = tooltipTarget.getBoundingClientRect();
            var px = event && Number.isFinite(event.clientX) ? event.clientX : rect.left + Math.min(rect.width / 2, 120);
            var py = event && Number.isFinite(event.clientY) ? event.clientY : rect.top + Math.min(rect.height / 2, 80);
            var x = px + 16, y = py + 16;
            if (x + box.width > root.innerWidth - 12) x = px - box.width - 16;
            if (y + box.height > root.innerHeight - 12) y = py - box.height - 16;
            tip.style.left = Math.max(12, Math.min(x, root.innerWidth - box.width - 12)) + 'px';
            tip.style.top = Math.max(12, Math.min(y, root.innerHeight - box.height - 12)) + 'px';
        }
        function showTooltip(target, event) {
            if (tooltipTarget !== target) hideTooltip();
            var data;
            try { data = JSON.parse(target.dataset.tip); } catch (_) { return; }
            tooltipTarget = target; target.classList.add('is-hovered'); target.setAttribute('aria-describedby', 'chartTooltip');
            var tip = $('chartTooltip');
            tip.innerHTML = '<div class="tooltip-title">' + esc(data.title) + '</div>' + data.rows.map(function (r) { return '<div class="tooltip-row"><span><i class="legend-dot" style="background:' + esc(r[2] || '#94a3b8') + '"></i>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('') + (data.note ? '<div class="tooltip-note">' + esc(data.note) + '</div>' : '');
            tip.hidden = false; placeTooltip(event);
        }
        function bindTooltips() {
            var closest = function (e) { return e.target && e.target.closest ? e.target.closest('[data-tip]') : null; };
            document.addEventListener('pointerover', function (e) { var target = closest(e); if (target && e.pointerType !== 'touch' && !tooltipPinned) showTooltip(target, e); });
            document.addEventListener('pointermove', function (e) { if (tooltipTarget && !tooltipPinned && e.pointerType !== 'touch') placeTooltip(e); });
            document.addEventListener('pointerout', function (e) { var target = closest(e); if (!tooltipPinned && target && (!e.relatedTarget || !target.contains(e.relatedTarget))) hideTooltip(); });
            document.addEventListener('focusin', function (e) { var target = closest(e); if (target) showTooltip(target); });
            document.addEventListener('focusout', function (e) { if (closest(e) && !tooltipPinned) hideTooltip(); });
            document.addEventListener('click', function (e) {
                var target = closest(e);
                if (!target) { hideTooltip(); return; }
                if (tooltipPinned && tooltipTarget === target) { hideTooltip(); return; }
                showTooltip(target, e); tooltipPinned = true;
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') hideTooltip();
                if ((e.key === 'Enter' || e.key === ' ') && closest(e)) { e.preventDefault(); var target = closest(e); if (tooltipPinned && tooltipTarget === target) hideTooltip(); else { showTooltip(target); tooltipPinned = true; } }
            });
            document.addEventListener('scroll', function () {
                if (tooltipTarget && document.activeElement === tooltipTarget) placeTooltip();
                else hideTooltip();
            }, true); root.addEventListener('resize', hideTooltip);
        }
        function chartData(key) {
            var a = state.aggregate, rows, title, note = '';
            if (key === 'detail') { var data = tableData(); data.title = 'Danh sách ' + ({ requests: 'yêu cầu tuyển dụng', plans: 'kế hoạch tuyển dụng', candidates: 'ứng viên', interviews: 'lịch phỏng vấn' })[state.table]; data.note = 'Toàn bộ danh sách theo bộ lọc đang chọn.'; return data; }
            if (key === 'trend') return { title: 'Xu hướng tuyển dụng', headers: ['Ngày đầu kỳ', 'Kỳ', 'Yêu cầu mới', 'Kế hoạch mới', 'Ứng viên mới'], rows: a.timeline.map(function (r) { return [r.key, r.label, r.requests, r.plans, r.candidates]; }), note: 'Số yêu cầu, kế hoạch và ứng viên mới theo từng kỳ.' };
            if (key === 'comparison') return { title: 'Nhu cầu và ứng viên', headers: ['Ngày đầu kỳ', 'Kỳ', 'Nhu cầu tuyển (người)', 'Ứng viên (hồ sơ)', 'Phiếu yêu cầu', 'Chưa nhập số lượng'], rows: a.timeline.map(function (r) { return [r.key, r.label, r.demand, r.candidates, r.requests, r.missingDemand]; }), note: 'So sánh số người cần tuyển với số hồ sơ nhận được theo từng kỳ.' };
            if (key === 'positions') return { title: 'Vị trí tuyển nhiều nhất', headers: ['Hạng', 'Vị trí', 'Số người cần tuyển', 'Số hồ sơ ứng viên', 'Yêu cầu chưa nhập số lượng'], rows: topPositions().map(function (r, i) { return [i + 1, r.label, r.demand, r.candidates, r.missingDemand]; }), note: 'Top 3 vị trí có số người cần tuyển cao nhất.' };
            if (key === 'interviews') { var interviews = dataRows('interviews', state.panels.interviewRows); interviews.title = 'Lịch phỏng vấn'; interviews.note = 'Toàn bộ lịch phỏng vấn theo bộ lọc đang chọn.'; return interviews; }
            var titles = { candidateStatuses: 'Trạng thái ứng viên', requestStatuses: 'Trạng thái yêu cầu', planStatuses: 'Ứng viên theo kế hoạch', sources: 'Nguồn ứng viên' };
            title = titles[key]; rows = key === 'requestStatuses' || key === 'planStatuses' ? state.panels[key] : a[key];
            var total = rows.reduce(function (sum, r) { return sum + r.value; }, 0);
            if (key === 'sources') note = 'Tỷ lệ hồ sơ đến từ mỗi kênh tuyển dụng.';
            if (key === 'planStatuses') note = 'Trạng thái hiện tại của ứng viên trong kế hoạch.';
            if (key === 'sources') return { title: title, headers: ['Nhóm nguồn', 'Nguồn chi tiết', 'Số hồ sơ', 'Tỷ trọng (%)'], rows: rows.map(function (r) { return [r.label, r.items.map(function (d) { return d.label + ' (' + d.value + ')'; }).join(', '), r.value, Math.round(r.value / total * 10000) / 100]; }), note: note };
            return { title: title, headers: ['Trạng thái', 'Mã trạng thái', 'Số lượng', 'Tỷ trọng (%)'], rows: rows.map(function (r) { return [statusInfo(r.label, key === 'requestStatuses' ? 'requests' : 'candidates').label, r.label, r.value, Math.round(r.value / total * 10000) / 100]; }), note: note };
        }
        function syncExportButtons() {
            var allowed = !!state.aggregate && !state.busy && !state.exporting && state.valid;
            document.querySelectorAll('[data-export]').forEach(function (button) {
                var key = button.dataset.export, count = 0;
                if (allowed) {
                    if (key === 'detail') count = tableData().rows.length;
                    else if (key === 'trend' || key === 'comparison') count = state.aggregate.timeline.length;
                    else if (key === 'positions') count = topPositions().length;
                    else if (key === 'interviews') count = state.panels ? state.panels.interviewRows.length : 0;
                    else if (key === 'requestStatuses' || key === 'planStatuses') count = state.panels ? state.panels[key].length : 0;
                    else count = state.aggregate[key].length;
                }
                button.disabled = !allowed || !count;
            });
        }
        async function exportExcel(button) {
            if (state.searchPending) { clearTimeout(state.searchTimer); state.searchPending = false; applyFilters(); }
            if (button.disabled) return;
            state.exporting = true; syncExportButtons();
            $('exportFeedback').hidden = false; $('exportFeedback').textContent = 'Đang tạo file Excel…';
            try {
                var key = button.dataset.export, exportName = key === 'detail' ? state.table : key, data = chartData(key), f = filterValues(), detail = key === 'detail' ? detailFilter() : null;
                var info = [
                    ['Thời điểm xuất', new Date().toLocaleString('vi-VN')], ['Dữ liệu cập nhật', $('updatedAt').textContent], ['Số dòng kết quả', data.rows.length],
                    ['Từ ngày', f.from || 'Toàn bộ'], ['Đến ngày', f.to || 'Toàn bộ'], ['Nhóm thời gian', $('granularity').selectedOptions[0].textContent],
                    ['Phòng ban', f.department || 'Tất cả'], ['Vị trí', f.position || 'Tất cả'], ['Trạng thái ứng viên', f.candidateStatus || 'Tất cả'], ['Tìm tổng quan', f.search || 'Không'],
                    ['Ghi chú', data.note || 'Theo bộ lọc đang chọn.'],
                    ['Chưa có ngày tạo', 'Yêu cầu: ' + state.filtered.requests.filter(function (r) { return !r.date; }).length + '; Kế hoạch: ' + state.filtered.plans.filter(function (r) { return !r.date; }).length + '; Ứng viên: ' + state.filtered.candidates.filter(function (r) { return !r.date; }).length],
                    ['Chưa nhập số lượng cần tuyển', state.aggregate.metrics.missingDemand], ['Cách lọc ngày', 'Theo ngày tạo với yêu cầu, kế hoạch, ứng viên; theo ngày hẹn với lịch phỏng vấn.'],
                    ['Lưu ý', Array.from(new Set((state.filtered.warnings || []).concat(state.model.warnings || []))).join(' ') || 'Không']
                ];
                if (state.stale) info.push(['Lần tải lại gần nhất', 'Chưa thành công; file dùng dữ liệu của lần tải trước.']);
                var panelPeriod = state.panels.periods[key];
                if (panelPeriod) {
                    info.push(['Từ ngày biểu đồ', panelPeriod.from || 'Toàn bộ'], ['Đến ngày biểu đồ', panelPeriod.to || 'Toàn bộ']);
                    var planSelect = key === 'planStatuses' ? $('planFilter') : key === 'interviews' ? $('interviewPlanFilter') : null;
                    if (planSelect) info.push(['Kế hoạch đang xem', planSelect.selectedOptions[0].textContent]);
                    info.push(['Ngày dùng tại biểu đồ', key === 'interviews' ? 'Ngày phỏng vấn' : key === 'planStatuses' ? 'Ngày tạo ứng viên' : 'Ngày tạo yêu cầu']);
                }
                if (detail) info.push(['Mục chi tiết', TABLE_NAMES[state.table]], ['Tìm trong mục', detail.search || 'Không'], ['Trạng thái trong mục', detail.status || 'Tất cả'], ['Điều kiện trong mục', detail.category || 'Tất cả'], ['Nguồn trong mục', state.table === 'candidates' ? detail.source || 'Tất cả' : 'Không áp dụng'], ['Khoảng ngày trong mục', (detail.from || 'Không giới hạn') + ' — ' + (detail.to || 'Không giới hạn')], ['Sắp xếp trong mục', $('detailSort').selectedOptions[0].textContent]);
                await new Promise(function (resolve) { root.requestAnimationFrame(resolve); });
                var bytes = DashboardTuyenDung.workbook(data.headers, data.rows, data.title, info);
                var url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                var link = document.createElement('a'); link.href = url; link.download = 'TuyenDung_' + exportName + '_' + C.dateKey(new Date()) + '.xlsx';
                document.body.appendChild(link); link.click(); link.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
                $('exportFeedback').textContent = 'Đã tạo Excel: ' + data.title + ' · ' + fmt(data.rows.length) + ' dòng';
            } catch (e) { $('exportFeedback').textContent = 'Không tạo được Excel: ' + e.message; }
            finally { state.exporting = false; syncExportButtons(); }
        }
        // Thông báo bản ghi mới theo từng tab. Danh sách mã đã xem lưu ở bảng ba_dashboard_daxem theo người dùng;
        // chưa có bảng/quyền hoặc đang dùng dữ liệu nạp sẵn thì lưu tạm trên trình duyệt.
        function readSeenLocal() { try { return JSON.parse(root.localStorage.getItem(SEEN_KEY)) || {}; } catch (e) { return {}; } }
        function writeSeenLocal(seen) { try { root.localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch (e) { /* Trình duyệt chặn lưu trữ. */ } }
        function sqlText(value) { return "'" + String(value).replace(/'/g, "''") + "'"; }
        function seenTarget() {
            if (options().data) return null;
            var windows = [root];
            try { if (root.parent !== root) windows.push(root.parent); } catch (_) { /* cross-origin */ }
            try { if (root.opener && !root.opener.closed) windows.push(root.opener); } catch (_) { /* cross-origin */ }
            for (var i = 0; i < windows.length; i++) {
                try {
                    var user = windows[i].n$ && windows[i].n$.user;
                    if (user && user.userid != null && String(user.userid) !== '') return { ctx: session(), userid: String(user.userid) };
                } catch (_) { /* Không đọc được phiên người dùng. */ }
            }
            return null;
        }
        function seenUrl(target, type) {
            var url = new URL('data/' + SEEN_TABLE, target.ctx.url.replace(/\/?$/, '/'));
            url.searchParams.set('where', type ? '(userid=' + sqlText(target.userid) + ' and loai=' + sqlText(type) + ')' : 'userid=' + sqlText(target.userid));
            return url;
        }
        async function send(method, url, body, token) {
            var headers = { Accept: 'application/json', 'Content-Type': 'application/json;charset=UTF-8' };
            if (token) headers.Authorization = token;
            var response = await fetch(url, { method: method, headers: headers, body: JSON.stringify(body), credentials: 'same-origin', cache: 'no-store' });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            var data = null;
            try { data = await response.json(); } catch (_) { /* Một số API ghi không trả JSON. */ }
            if (data && data.success === false) throw new Error(String(data.result || 'Máy chủ từ chối ghi dữ liệu'));
            return data;
        }
        // vitri trong các view lưu mã; đổi sang tên theo đúng cấu hình trường của form:
        // domainid -> NUT.domains, linktableid -> bảng danh mục (columnkey/columndisplay). Không tra được thì giữ nguyên.
        function nutWindow() {
            var windows = [root];
            try { if (root.parent !== root) windows.push(root.parent); } catch (_) { /* cross-origin */ }
            try { if (root.opener && !root.opener.closed) windows.push(root.opener); } catch (_) { /* cross-origin */ }
            for (var i = 0; i < windows.length; i++) {
                try { if (windows[i].NUT && windows[i].NUT.URL) return windows[i]; } catch (_) { /* Phiên khác origin. */ }
            }
            return null;
        }
        function nutApp() { var win = nutWindow(); return win && win.NUT.tables ? win.NUT : null; }
        // Cấu hình trường giống form: NUT.windows (form đã mở) hoặc rest/token/cache/<winid> của các menu.
        async function windowFields(nut, win) {
            var fields = [];
            function collect(conf) { (conf && conf.allTabs || []).forEach(function (tab) { (tab.fields || []).forEach(function (f) { fields.push({ field: f, table: tab.table || {} }); }); }); }
            Object.keys(nut.windows || {}).forEach(function (id) { collect(nut.windows[id]); });
            if (fields.some(function (x) { return /^vitri$/i.test(x.field.columnname || ''); })) return fields;
            var app = win.n$ && win.n$.app, menus = app && app.appConfig && app.appConfig.menus || [];
            var ids = Array.from(new Set(menus.map(function (m) { return m.linkwindowid; }).filter(function (id) { return id && !(nut.windows || {})[id]; })));
            if (!ids.length || !win.zipson || !nut.configWindow || !nut.URL_TOKEN) return fields;
            var token = nut.ds && nut.ds.token;
            await Promise.all(ids.map(async function (id) {
                try {
                    var res = await fetch(nut.URL_TOKEN + 'cache/' + id, { headers: token ? { Authorization: token } : {}, cache: 'no-store' });
                    if (!res.ok) return;
                    var cache = (await res.json()).result;
                    if (cache && cache.configjson) collect(nut.configWindow(win.zipson.parse(cache.configjson), null));
                } catch (_) { /* Bỏ qua form không đọc được. */ }
            }));
            return fields;
        }
        async function positionNames() {
            var win = nutWindow(), nut = nutApp();
            if (!nut) return {};
            var token = nut.ds && nut.ds.token, cache = {}, result = {};
            var fields = (await windowFields(nut, win)).filter(function (x) { return /^vitri$/i.test(x.field.columnname || '') && (x.field.domainid || x.field.linktableid); });
            async function lookup(field) {
                var id = field.domainid ? 'd' + field.domainid : 'l' + field.linktableid + (field.whereclause || '');
                if (cache[id]) return cache[id];
                var names = new Map();
                function add(key, label) { if (key != null && label != null && String(label).trim()) names.set(String(key), String(label).trim()); }
                var domain = field.domainid ? nut.domains && nut.domains[field.domainid] : nut.dmlinks && nut.dmlinks[field.linktableid + (field.whereclause || '')];
                if (domain && domain.lookup) {
                    Object.keys(domain.lookup).forEach(function (key) { var item = domain.lookup[key]; add(key, Array.isArray(item) ? item[1] : item && item.text); });
                } else if (field.linktableid) {
                    var table = field.linktable || nut.tables[field.linktableid];
                    if (table && table.urlview) {
                        var key = field.bindfieldname || field.linkcolumn || table.columnkey, display = table.columndisplay || key;
                        var url = new URL(table.urlview), where = '';
                        if (field.whereclause) { try { where = nut.ds.decodeSql({ where: JSON.parse(field.whereclause) }); } catch (_) { where = ''; } }
                        url.searchParams.set('where', where); url.searchParams.set('select', key + ',' + display);
                        (await request(url, token)).result.forEach(function (row) { add(row[key], row[display]); });
                    }
                }
                return (cache[id] = names);
            }
            // Ưu tiên trường vitri của đúng bảng; thiếu thì dùng của yêu cầu tuyển dụng.
            var hints = { requests: /yctuyendung|yeucau|yctd/i, candidates: /ungvien/i, interviews: /phongvan|lichpv/i };
            function tableName(x) { return [x.table.tablename, x.table.urlview, x.table.alias].filter(Boolean).join(' '); }
            for (var type in hints) {
                var found = fields.find(function (x) { return hints[type].test(tableName(x)); });
                if (found) result[type] = await lookup(found.field);
            }
            if (!result.requests && fields.length) result.requests = await lookup(fields[0].field);
            result.candidates = result.candidates || result.requests; result.interviews = result.interviews || result.requests;
            if (root.console) root.console.info('Dashboard: danh mục vị trí', fields.length ? fields.map(function (x) { return tableName(x) + '.vitri → ' + (x.field.domainid ? 'domain ' + x.field.domainid : 'bảng ' + ((x.field.linktable || {}).tablename || x.field.linktableid)); }) : 'không tìm thấy cấu hình trường vitri');
            return result;
        }
        async function applyPositionNames(model) {
            var maps;
            try { maps = await positionNames(); } catch (e) {
                if (root.console) root.console.warn('Dashboard: chưa đọc được danh mục vị trí (' + e.message + '); hiển thị giá trị gốc.');
                return;
            }
            function name(type, value) { var map = maps[type]; return map && map.has(String(value)) ? map.get(String(value)) : value; }
            function names(type, list) { return Array.from(new Set(list.map(function (v) { return name(type, v); }))); }
            model.requests.forEach(function (r) { r.details.forEach(function (d) { d.position = name('requests', d.position); }); });
            model.candidates.forEach(function (c) {
                c.positions = names('candidates', c.positions);
                (c.applications || []).forEach(function (a) { a.positions = names('candidates', a.positions || []); });
            });
            model.interviews.forEach(function (i) { if (i.position) i.position = name('interviews', i.position); });
        }
        async function loadSeen() {
            state.seenTarget = seenTarget(); state.seenRows = {};
            if (state.seenTarget) {
                try {
                    var res = await request(seenUrl(state.seenTarget), state.seenTarget.ctx.token), seen = {};
                    res.result.forEach(function (row) {
                        var keys = null;
                        try { keys = JSON.parse(row.dsma); } catch (_) { /* Dòng hỏng: coi như chưa có mốc. */ }
                        if (Array.isArray(keys) && Object.prototype.hasOwnProperty.call(TABLE_NAMES, row.loai)) { seen[row.loai] = keys; state.seenRows[row.loai] = true; }
                    });
                    return seen;
                } catch (e) {
                    if (root.console) root.console.warn('Dashboard: chưa dùng được bảng ' + SEEN_TABLE + ' (' + e.message + '); lưu trạng thái đã xem trên trình duyệt.');
                    state.seenTarget = null;
                }
            }
            return readSeenLocal();
        }
        function saveSeen(type) {
            var keys = state.seen[type].slice(), target = state.seenTarget;
            if (!target) { writeSeenLocal(state.seen); return; }
            var now = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
            var row = { dsma: JSON.stringify(keys), ngaycapnhat: C.dateKey(now) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds()) };
            // Ghi tuần tự để lần xem sau không bị lần ghi trước đè lên.
            state.seenQueue = (state.seenQueue || Promise.resolve()).then(async function () {
                var base = new URL('data/' + SEEN_TABLE, target.ctx.url.replace(/\/?$/, '/'));
                if (state.seenRows[type]) await send('PUT', seenUrl(target, type), [row], target.ctx.token);
                else {
                    try { await send('POST', base, [Object.assign({ userid: target.userid, loai: type }, row)], target.ctx.token); }
                    catch (e) { await send('PUT', seenUrl(target, type), [row], target.ctx.token); }
                    state.seenRows[type] = true;
                }
            }).catch(function (e) {
                if (root.console) root.console.warn('Dashboard: không lưu được trạng thái đã xem lên máy chủ (' + e.message + ').');
                writeSeenLocal(state.seen);
            });
        }
        function syncNotices(seen) {
            state.seen = seen || {}; state.unseen = {};
            var today = C.dateKey(new Date());
            Object.keys(TABLE_NAMES).forEach(function (type) {
                var keys = state.model[type].map(function (r) { return r.key; });
                // Lần mở đầu tiên lấy dữ liệu cũ làm mốc; chỉ bản ghi tạo hôm nay được báo là mới.
                if (!Array.isArray(state.seen[type])) {
                    state.seen[type] = state.model[type].filter(function (r) { return type === 'interviews' || r.date !== today; }).map(function (r) { return r.key; });
                    saveSeen(type);
                }
                var known = new Set(state.seen[type]);
                state.unseen[type] = new Set(keys.filter(function (key) { return !known.has(key); }));
            });
        }
        function markSeen(type) {
            if (!state.model || !state.unseen) return;
            var fresh = state.unseen[type];
            if (fresh && fresh.size) state.highlight[type] = new Set(Array.from(state.highlight[type] || []).concat(Array.from(fresh)));
            state.unseen[type] = new Set();
            var keys = state.model[type].map(function (r) { return r.key; }), old = state.seen[type] || [];
            if (old.length === keys.length && old.every(function (key, i) { return key === keys[i]; })) return;
            state.seen[type] = keys;
            saveSeen(type);
        }
        function activateTable(button, focus) {
            saveDetailFilter(); state.table = button.dataset.table; state.page = 1; markSeen(state.table);
            document.querySelectorAll('[data-table]').forEach(function (b) { b.classList.toggle('active', b === button); b.setAttribute('aria-selected', String(b === button)); b.tabIndex = b === button ? 0 : -1; });
            $('detailTablePanel').setAttribute('aria-labelledby', button.id); detailControls();
            if (state.filtered) { table(); syncExportButtons(); }
            if (focus) button.focus();
        }
        function init() {
            if (!$('kpiGrid')) return;
            if (!C) { $('message').hidden = false; $('message').textContent = 'Không khởi tạo được bộ tổng hợp của báo cáo.'; return; }
            $('refreshButton').addEventListener('click', refresh);
            bindTooltips();
            ['request', 'plan', 'interview'].forEach(function (prefix) { $(prefix + 'Anchor').value = C.dateKey(new Date()); });
            document.querySelectorAll('[data-panel-filter]').forEach(function (control) { control.addEventListener('change', renderPanels); });
            document.querySelectorAll('[data-export]').forEach(function (button) { button.addEventListener('click', function () { exportExcel(button); }); });
            $('periodPreset').addEventListener('change', preset);
            ['dateFrom', 'dateTo'].forEach(function (id) { $(id).addEventListener('change', function () { $('periodPreset').value = 'custom'; applyFilters(); }); });
            ['granularity', 'departmentFilter', 'positionFilter', 'statusFilter'].forEach(function (id) { $(id).addEventListener('change', applyFilters); });
            $('searchInput').addEventListener('input', function () { clearTimeout(state.searchTimer); state.searchPending = true; state.searchTimer = setTimeout(function () { state.searchPending = false; applyFilters(); }, 180); });
            $('resetButton').addEventListener('click', function () {
                setToday();
                $('departmentFilter').value = ''; $('positionFilter').value = ''; $('statusFilter').value = ''; $('searchInput').value = '';
                applyFilters();
            });
            document.querySelectorAll('[data-table]').forEach(function (button) { button.addEventListener('click', function () { activateTable(button); }); });
            document.querySelector('.table-tabs').addEventListener('keydown', function (e) {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
                var buttons = Array.from(document.querySelectorAll('[data-table]')), current = buttons.findIndex(function (b) { return b.dataset.table === state.table; });
                var next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (current + (e.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
                e.preventDefault(); activateTable(buttons[next], true);
            });
            ['detailStatus', 'detailCategory', 'detailSource', 'detailFrom', 'detailTo', 'detailSort'].forEach(function (id) { $(id).addEventListener('change', saveDetailFilter); });
            $('detailSearch').addEventListener('input', saveDetailFilter);
            $('detailReset').addEventListener('click', function () { delete state.detailFilters[state.table]; state.page = 1; detailControls(); if (state.filtered) { table(); syncExportButtons(); } });
            $('prevPage').addEventListener('click', function () { state.page--; table(); });
            $('nextPage').addEventListener('click', function () { state.page++; table(); });
            setToday();
            refresh();
        }
        // Mặc định xem số liệu của ngày mở dashboard.
        function setToday() {
            var range = C.periodRange('day', new Date());
            $('periodPreset').value = 'day'; $('dateFrom').value = range.from; $('dateTo').value = range.to;
        }
        root.DashboardTuyenDungReport = {
            refresh: refresh, setData: function (data, mapping) {
                if (state.busy) throw new Error('Báo cáo đang tải dữ liệu, vui lòng thử lại sau.');
                root.DashboardTuyenDungOptions = { data: data, mapping: mapping || {} }; return refresh();
            }
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();


    }
};

if (typeof module === 'object' && module.exports) module.exports = DashboardTuyenDung;
