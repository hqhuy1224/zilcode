// GSheetUngVien – câu trả lời Google Biểu mẫu → bảng ba_ungvien
var GSheetUngVien = {

  SHEET_ID: "1i49_7oiFnzc7GU235JXryphOTkGd3msIx38LY7E1A40",
  SHEET_NAME: "Câu trả lời biểu mẫu 1",
  WEBAPP_URL: "https://script.google.com/macros/u/1/s/AKfycbyWJ4wO_MhPZShKh3gEtUvTVVRHvoixquft9z4kSRZCrjsXPg1A835TlXXnK7KT6fZA/exec",
  WEBAPP_KEY: "zilcode_BAv2.0",             // trùng WEBAPP_KEY trong WebAppUngVien.gs
  WEBAPP_MIN_VERSION: 3,
  DATE_ORDER: "dmy",

  // q: tiêu đề câu hỏi trên Biểu mẫu; t: "uv" (ba_ungvien) | "ct" (ba_ctungvien)
  MAP: [
    { t: "uv", q: "Dấu thời gian", col: "ngaytao", label: "Ngày đăng ký", type: "date" },
    { t: "uv", q: "Họ và tên", col: "hoten", label: "Họ tên", type: "text" },
    { t: "uv", q: "Giới tính", col: "gioitinh", label: "Giới tính", type: "gender" },
    { t: "uv", q: "Ngày sinh", col: "ngaysinh", label: "Ngày sinh", type: "date" },
    { t: "uv", q: "Số CCCD", col: "CCCD", label: "CCCD", type: "cccd" },
    { t: "uv", q: "Email", col: "email", label: "Email", type: "email" },
    { t: "uv", q: "Số điện thoại", col: "dienthoai", label: "Điện thoại", type: "phone" },
    { t: "uv", q: "Địa chỉ", col: "diachi", label: "Địa chỉ", type: "text" },
    { t: "uv", q: "Vị trí ứng tuyển", col: "vitri", label: "Vị trí ứng tuyển", type: "text" },
    { t: "uv", q: "Mức lương mong muốn (VNĐ)", col: "mucluong", label: "Mức lương", type: "float" },
    { t: "uv", q: "Địa điểm làm việc mong muốn", col: "diadiem", label: "Địa điểm", type: "text" },
    { t: "uv", q: "Trình độ", col: "trinhdo", label: "Trình độ", type: "text" },
    { t: "uv", q: "Chuyên ngành", col: "chuyennganh", label: "Chuyên ngành", type: "text" },
    { t: "uv", q: "Kinh nghiệm làm việc", col: "kinhnghiem", label: "Kinh nghiệm", type: "text" },
    { t: "uv", q: "Kỹ năng", col: "kynang", label: "Kỹ năng", type: "text" },
    { t: "uv", q: "Bằng cấp", col: "bangcap", label: "Bằng cấp", type: "text" },
    { t: "uv", q: "Chứng chỉ", col: "chungchi", label: "Chứng chỉ", type: "text" },
    { t: "uv", q: "Link CV", col: "CV", label: "CV", type: "text" },
    { t: "uv", q: "Link Portfolio", col: "portfolio", label: "Portfolio", type: "text" },
    { t: "uv", q: "Bạn biết đến tin tuyển dụng qua đâu?", col: "nguonuv", label: "Nguồn UV", type: "text" }
  ],
  KEY_UV: "MaUV",
  LINK_CT: "MaUV",
  TABLE_CT: "ba_ctungvien",
  DEFAULT_STATUS: "DRAFT",                  // phải có trong domain của cột status

  KEYWORD_COLS: ["hoten", "email", "dienthoai", "CCCD", "diachi", "vitri", "diadiem", "chuyennganh"],
  SELECT_COLS: [
    { col: "vitri", label: "Vị trí ứng tuyển" },
    { col: "diadiem", label: "Khu vực" },
    { col: "trinhdo", label: "Trình độ" }
  ],
  EXCELJS_URLS: [
    "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"
  ],

  ST: { NEW: "Mới", SEEN: "Đã xem", EXIST: "Đã có", CHECKING: "Đang kiểm tra", UNKNOWN: "Chưa kiểm tra được" },
  GRID: "grid_gsheet_ungvien",
  ROW_STYLE: { "Mới": "background-color:#e3f6e5;", "Đã xem": "background-color:#fff6db;" },

  run: function (p, callback) {
    var self = GSheetUngVien;
    self.conf = p.config; self.callback = callback;
    self._dm = {}; self._all = []; self._view = [];

    var id = String(self.SHEET_ID).trim();
    if (id.indexOf("/forms/") >= 0) {
      NUT.notify("SHEET_ID đang là link BIỂU MẪU (/forms/). Hãy dán link TRANG TÍNH (/spreadsheets/) – Biểu mẫu → Câu trả lời → Xem trong Trang tính", "red");
      return;
    }
    var m = id.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
    self.SHEET_ID = m ? m[1] : id;
    if (self.WEBAPP_URL && !self.WEBAPP_KEY) { NUT.notify("Chưa cấu hình WEBAPP_KEY trong GSheetUngVien.js", "red"); return; }
    if (!self.WEBAPP_URL && !self.SHEET_ID) { NUT.notify("Chưa cấu hình SHEET_ID trong GSheetUngVien.js", "red"); return; }

    self.injectCss();
    NUT.openDialog({
      title: "📋 Ứng viên từ Google Biểu mẫu",
      width: Math.max(900, Math.min(window.innerWidth - 40, 1600)),
      height: Math.max(560, window.innerHeight - 60),
      div: '<div class="nut-full uvgs">' + self.filterHtml() + '<div id="' + self.GRID + '_box" class="uvgs-grid"></div></div>',
      onOpen: function (evt) {
        evt.onComplete = function () { self.buildGrid(); self.bindFilter(); self.reload(); };
      }
    });
  },

  injectCss: function () {
    var btn = ".uvgs .w2ui-toolbar .w2ui-scroll-wrapper .w2ui-tb-button.uv-btn";
    var colors = { onlyNew: "#00897b", reload: "#5c6bc0", seen: "#e37400", remove: "#d93025", export: "#107c41", import: "#1a73e8" };
    var css = [
      ".uvgs{display:flex;flex-direction:column}",
      ".uvgs-grid{flex:1;min-height:0;position:relative}",
      ".uvgs-filter{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:flex-end;padding:8px 10px;border-bottom:1px solid #e3e5e8;background:#f8f9fb}",
      ".uvgs-filter label{display:flex;flex-direction:column;gap:2px;font-size:11px;color:#5f6368}",
      ".uvgs-filter input,.uvgs-filter select{height:28px;padding:0 8px;border:1px solid #cfd4da;border-radius:4px;background:#fff;font-size:12px;transition:border-color .2s,box-shadow .2s}",
      ".uvgs-filter input:focus,.uvgs-filter select:focus{outline:none;border-color:#1a73e8;box-shadow:0 0 0 3px rgba(26,115,232,.15)}",
      ".uvgs-filter .uvgs-kw{width:240px}",
      ".uvgs-filter select{max-width:200px}",
      ".uvgs-count{margin-left:auto;align-self:center;font-size:12px;color:#5f6368}",
      ".uvgs-clear{height:28px;padding:0 14px;border:0;border-radius:4px;background:#5f6368;color:#fff;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.15);transition:filter .2s,transform .2s,box-shadow .2s}",
      ".uvgs-clear:hover{transform:translateY(-1px);box-shadow:0 4px 10px rgba(0,0,0,.2)}",
      ".uvgs-clear:active{transform:none;box-shadow:0 1px 2px rgba(0,0,0,.2)}",
      // giao diện chung (img/index.css, tailwind.css) ép màu hover bằng !important → phải ghi đè tương tự
      [btn, btn + ":hover", btn + ".over", btn + ".down", btn + ".checked"].join(",") +
        "{background:var(--uv-c)!important;border:1px solid var(--uv-c)!important;color:#fff!important}",
      [btn + " .w2ui-tb-text", btn + ":hover .w2ui-tb-text", btn + ".over .w2ui-tb-text", btn + ".down .w2ui-tb-text", btn + ".checked .w2ui-tb-text",
        btn + " .w2ui-tb-icon>span"].join(",") + "{color:#fff!important}",
      btn + "{margin:0 3px;font-weight:500;box-shadow:0 1px 2px rgba(0,0,0,.15);cursor:pointer;transition:transform .2s,box-shadow .2s}",
      btn + "::after{content:'';position:absolute;left:0;right:0;bottom:-4px;height:4px}",
      btn + ":hover," + btn + ".over{transform:translateY(-1px);box-shadow:0 4px 10px rgba(0,0,0,.22)}",
      btn + ".down{transform:none;box-shadow:0 1px 2px rgba(0,0,0,.2)}",
      btn + ".checked{box-shadow:inset 0 0 0 2px rgba(255,255,255,.7),0 1px 2px rgba(0,0,0,.2)}",
      ".uvgs-ic-xls{display:inline-block;width:14px;height:14px;margin-top:2px;background:#fff;" +
        "-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 3v12m0 0l-5-5m5 5l5-5M4 21h16' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/contain no-repeat;" +
        "mask:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 3v12m0 0l-5-5m5 5l5-5M4 21h16' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") center/contain no-repeat}"
    ];
    Object.keys(colors).forEach(function (k) { css.push(".uvgs .uv-" + k + "{--uv-c:" + colors[k] + "}"); });
    var st = document.getElementById("uvgs-css");
    if (!st) { st = document.createElement("style"); st.id = "uvgs-css"; document.head.appendChild(st); }
    st.textContent = css.join("\n");
  },

  filterHtml: function () {
    var self = GSheetUngVien, id = self.GRID, ST = self.ST;
    var opt = function (v, t) { return '<option value="' + v + '">' + (t || v) + "</option>"; };
    return '<div class="uvgs-filter">' +
      '<label>Từ khoá<input id="' + id + '_kw" class="uvgs-kw" type="search" placeholder="Họ tên, email, SĐT, CCCD, địa chỉ..."></label>' +
      self.SELECT_COLS.map(function (f) {
        return "<label>" + f.label + '<select id="' + id + "_f_" + f.col + '">' + opt("", "Tất cả") + "</select></label>";
      }).join("") +
      '<label>Đăng ký từ<input id="' + id + '_from" type="date"></label>' +
      '<label>Đến<input id="' + id + '_to" type="date"></label>' +
      '<label>Tình trạng<select id="' + id + '_st">' + opt("", "Tất cả") + opt(ST.NEW) + opt(ST.SEEN) + opt(ST.EXIST) + "</select></label>" +
      '<button type="button" id="' + id + '_clear" class="uvgs-clear">Xoá lọc</button>' +
      '<span id="' + id + '_count" class="uvgs-count"></span></div>';
  },

  el: function (suffix) { return document.getElementById(GSheetUngVien.GRID + suffix); },

  bindFilter: function () {
    var self = GSheetUngVien, timer = null, apply = function () { self.applyFilter(); };
    self.el("_kw").addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(apply, 200); });
    ["_from", "_to"].concat(self.SELECT_COLS.map(function (f) { return "_f_" + f.col; }))
      .forEach(function (s) { self.el(s).addEventListener("change", apply); });
    self.el("_st").addEventListener("change", function () { self.syncOnlyNew(); apply(); });
    self.el("_clear").addEventListener("click", function () { self.resetFilter(); apply(); });
  },

  resetFilter: function () {
    var self = GSheetUngVien;
    ["_kw", "_from", "_to", "_st"].concat(self.SELECT_COLS.map(function (f) { return "_f_" + f.col; }))
      .forEach(function (s) { var e = self.el(s); if (e) e.value = ""; });
    self.syncOnlyNew();
  },

  syncOnlyNew: function () {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID];
    if (g && g.toolbar) g.toolbar.set("onlyNew", { checked: self.el("_st").value === self.ST.NEW });
  },

  buildGrid: function () {
    var self = GSheetUngVien, ST = self.ST;
    if (NUT.w2ui[self.GRID]) NUT.w2ui[self.GRID].destroy();

    var badge = {};
    badge[ST.NEW] = '<span style="color:#1e7e34;font-weight:600">● Mới</span>';
    badge[ST.SEEN] = '<span style="color:#b07d00;font-weight:600">● Đã xem</span>';
    badge[ST.EXIST] = '<span style="color:gray">● Đã có</span>';
    var columns = [{
      field: "_tt", text: "Tình trạng", size: "100px", sortable: true,
      render: function (r) { return badge[r._tt] || '<span style="color:#999">… ' + (r._tt || "") + "</span>"; }
    }];
    var nUv = 0, nCt = 0;
    self.MAP.forEach(function (m) {
      if (m.t === "ct") nCt++; else nUv++;
      var col = {
        field: m.col, text: m.label, sortable: true,
        size: /diachi|kinhnghiem|kynang|bangcap|chungchi|CV|portfolio/.test(m.col) ? "200px" : "120px",
        editable: { type: m.type === "date" || m.type === "float" ? m.type : "text" }
      };
      var dm = self.domainOf(m.col);
      if (dm) {
        col.editable = { type: "list", showAll: true, items: self.domainItems(dm).map(function (x) { return { id: x.id, text: String(x.text).trim() }; }) };
        col.render = function (r) {
          var v = r[m.col];
          if (v == null || v === "") return "";
          return self.toDomainId(m.col, v).ok ? self.textOf(m.col, v)
            : '<span style="color:#d9534f" title="Không có trong domain">⚠ ' + v + "</span>";
        };
      }
      columns.push(col);
    });
    var groups = [{ span: 1, text: "" }, { span: nUv, text: "THÔNG TIN ỨNG VIÊN (ba_ungvien)" }];
    if (nCt) groups.push({ span: nCt, text: "CHI TIẾT ỨNG TUYỂN" });

    var actions = {
      onlyNew: function () {
        var st = self.el("_st");
        st.value = st.value === ST.NEW ? "" : ST.NEW;
        self.syncOnlyNew(); self.applyFilter();
      },
      reload: function () { self.reload(true); },
      seen: function () { self.withSelection("Tick chọn ứng viên cần đánh dấu", self.markSeen); },
      remove: function () { self.withSelection("Chưa chọn dòng nào", self.removeSelected); },
      export: function () { self.exportExcel(); },
      import: function () { self.importSelected(); }
    };
    var button = function (id, text, icon) { return { type: "button", id: id, text: text, icon: icon, class: "uv-btn uv-" + id }; };

    new NUT.w2grid({
      name: self.GRID,
      show: { toolbar: true, footer: true, selectColumn: true, lineNumbers: true, toolbarReload: false, toolbarColumns: true, toolbarSearch: false },
      columnGroups: groups,
      columns: columns,
      records: [],
      toolbar: {
        items: [
          button("onlyNew", "Chỉ hiện ứng viên mới", "w2ui-icon-search"),
          button("reload", "Tải lại từ Biểu mẫu", "w2ui-icon-reload"),
          button("seen", "Đánh dấu đã xem", "w2ui-icon-check"),
          button("remove", "Xoá câu trả lời", "w2ui-icon-cross"),
          { type: "spacer" },
          button("export", "Xuất Excel", "uvgs-ic-xls"),
          button("import", "Thêm vào bảng ứng viên", "w2ui-icon-plus")
        ],
        onClick: function (evt) { if (actions[evt.target]) actions[evt.target](); }
      }
    }).render("#" + self.GRID + "_box");
  },

  withSelection: function (emptyMsg, fn) {
    var sel = NUT.w2ui[GSheetUngVien.GRID].getSelection();
    if (!sel.length) NUT.notify(emptyMsg, "yellow"); else fn(sel);
  },

  fold: function (s) {
    return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[đĐ]/g, "d").replace(/\s+/g, " ").trim().toLowerCase();
  },

  indexRecord: function (r) {
    var self = GSheetUngVien;
    r._q = self.KEYWORD_COLS.map(function (c) { return self.fold(self.textOf(c, r[c])); }).join(" | ") +
      " | " + String(r.dienthoai || "").replace(/\D/g, "");
    r._f = {};
    self.SELECT_COLS.forEach(function (f) { r._f[f.col] = self.fold(self.textOf(f.col, r[f.col])); });
  },

  fillSelects: function () {
    var self = GSheetUngVien, esc = self.escHtml;
    self.SELECT_COLS.forEach(function (f) {
      var box = self.el("_f_" + f.col);
      if (!box) return;
      var cur = box.value, seen = {}, opts = [];
      self._all.forEach(function (r) {
        var k = r._f[f.col];
        if (k && !seen[k]) { seen[k] = 1; opts.push({ v: k, t: self.textOf(f.col, r[f.col]) }); }
      });
      opts.sort(function (a, b) { return a.t.localeCompare(b.t, "vi"); });
      box.innerHTML = '<option value="">Tất cả</option>' +
        opts.map(function (o) { return '<option value="' + esc(o.v) + '">' + esc(o.t) + "</option>"; }).join("");
      box.value = seen[cur] ? cur : "";
    });
  },

  applyFilter: function () {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID];
    if (!g || !self.el("_kw")) return;
    var tokens = self.fold(self.el("_kw").value).split(" ").filter(Boolean);
    var from = self.el("_from").value, to = self.el("_to").value, st = self.el("_st").value;
    var sels = self.SELECT_COLS.map(function (f) { return { col: f.col, v: self.el("_f_" + f.col).value }; })
      .filter(function (x) { return x.v; });

    self._view = self._all.filter(function (r) {
      if (st && r._tt !== st) return false;
      if (from && !(r.ngaytao >= from)) return false;
      if (to && !(r.ngaytao <= to)) return false;
      return sels.every(function (s) { return r._f[s.col] === s.v; }) &&
        tokens.every(function (t) { return r._q.indexOf(t) >= 0; });
    });

    var keep = {};
    self._view.forEach(function (r) { keep[r.recid] = 1; });
    var sel = g.getSelection().filter(function (id) { return keep[id]; });
    g.clear(true); g.add(self._view);
    if (sel.length) g.select.apply(g, sel);
    self.el("_count").textContent = "Hiển thị " + self._view.length + "/" + self._all.length + " ứng viên";
  },

  setStatus: function (r, tt) {
    r._tt = tt;
    r.w2ui = r.w2ui || {};
    r.w2ui.style = GSheetUngVien.ROW_STYLE[tt] || "";
  },

  commitEdits: function () {
    var self = GSheetUngVien;
    NUT.w2ui[self.GRID].mergeChanges();
    self._all.forEach(function (r) {
      self.MAP.forEach(function (m) {
        var v = r[m.col];
        if (v && typeof v === "object" && v.id !== undefined) r[m.col] = v.id;
      });
      self.indexRecord(r);
    });
  },

  reload: function (reset) {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID];
    if (self._loading) return;
    self._loading = true;
    if (reset) { self.resetFilter(); g.selectNone(); g.sortData = []; }
    g.lock("Đang tải dữ liệu Biểu mẫu...", true);

    var dup = { done: false, idx: null };
    var dupP = self.loadExisting().then(function (idx) { dup.done = true; dup.idx = idx; });

    self.fetchRows().then(function (rows) {
      var recs = self.toRecords(rows);
      recs.forEach(self.indexRecord);
      self._all = recs;
      self._loading = false;
      g.unlock();
      self.fillSelects();

      if (!recs.length) {
        self.applyFilter();
        NUT.notify(rows.length > 1
          ? "Sheet có " + (rows.length - 1) + " dòng nhưng không ghép được câu hỏi nào – kiểm tra MAP"
          : "Biểu mẫu chưa có câu trả lời nào", "yellow");
        return;
      }
      var finish = function () {
        if (self._all !== recs) return;
        self.applyDup(recs, dup.idx);
        self.applyFilter();
        var count = function (tt) { return recs.filter(function (r) { return r._tt === tt; }).length; };
        NUT.notify("Đọc được " + recs.length + " câu trả lời – " + count(self.ST.NEW) + " mới, " + count(self.ST.SEEN) + " đã xem", "green");
      };
      if (dup.done) return finish();
      recs.forEach(function (r) { self.setStatus(r, self.ST.CHECKING); });
      self.applyFilter();
      return dupP.then(finish);
    }).catch(function (e) {
      self._loading = false;
      g.unlock();
      console.error("[GSheetUngVien]", e);
      NUT.notify("Không đọc được câu trả lời Biểu mẫu: " + e.message, "red");
    });
  },

  fetchRows: function () {
    var self = GSheetUngVien;
    if (self.WEBAPP_URL) {
      return self.callWebApp({ action: "list" }).then(function (res) {
        self._waOld = !(res.version >= self.WEBAPP_MIN_VERSION);
        if (self._waOld) NUT.notify("⚠ Web App đang chạy BẢN CŨ – trạng thái 'Đã xem' sẽ KHÔNG lưu được. " +
          "Vào Apps Script → Triển khai → Quản lý triển khai → ✏️ → Phiên bản mới → Triển khai", "red");
        return res.rows;
      });
    }
    return self.loadSheetJsonp().catch(function (e) {
      return self.loadSheetCsv().catch(function () { throw e; });
    });
  },

  webAppUrl: function (params) {
    var self = GSheetUngVien;
    // link có /u/N/ (nhiều tài khoản Google) sẽ báo "Không tìm thấy trang"
    var base = String(self.WEBAPP_URL).trim().replace(/\/macros\/u\/\d+\/s\//, "/macros/s/");
    var q = Object.keys(params).map(function (k) { return k + "=" + encodeURIComponent(params[k]); });
    q.push("key=" + encodeURIComponent(self.WEBAPP_KEY), "_=" + Date.now());
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + q.join("&");
  },

  callWebApp: function (params) {
    var self = GSheetUngVien;
    var check = function (res) {
      if (!res || !res.ok) throw new Error((res && res.error) || "Web App trả lỗi");
      return res;
    };
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 40000);
    return fetch(self.webAppUrl(params), { credentials: "omit", cache: "no-store", signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        return r.text().then(function (t) {
          try { return JSON.parse(t); } catch (e) {
            throw new Error("Web App trả về trang lỗi (HTTP " + r.status + ") – kiểm tra đã Triển khai 'Bất kỳ ai' và Phiên bản mới");
          }
        });
      })
      .then(check)
      .catch(function (e) {
        if (/Sai khoá|Web App trả/.test(e && e.message)) throw e;
        console.warn("[GSheetUngVien] fetch lỗi, thử JSONP:", e);
        return self.jsonp(function (cb) { return self.webAppUrl(params) + "&cb=" + cb; }, 30000,
          "Không gọi được Web App – nếu Chrome đăng nhập nhiều tài khoản Google, hãy đăng xuất bớt hoặc dùng hồ sơ Chrome khác").then(check);
      })
      .finally(function () { clearTimeout(timer); });
  },

  jsonp: function (buildUrl, ms, errMsg) {
    return new Promise(function (resolve, reject) {
      var cb = "__uvgs" + Date.now() + Math.floor(Math.random() * 1000), done = false;
      var s = document.createElement("script");
      var end = function (fn, arg) {
        if (done) return;
        done = true; clearTimeout(timer); s.remove();
        try { delete window[cb]; } catch (e) { window[cb] = undefined; }
        fn(arg);
      };
      var timer = setTimeout(function () { end(reject, new Error("Hết thời gian chờ phản hồi")); }, ms);
      window[cb] = function (res) { end(resolve, res); };
      s.onerror = function () { end(reject, new Error(errMsg)); };
      s.onload = function () { setTimeout(function () { end(reject, new Error("Phản hồi không hợp lệ – kiểm tra Triển khai 'Bất kỳ ai' / Phiên bản mới")); }, 1500); };
      s.src = buildUrl(cb);
      document.head.appendChild(s);
    });
  },

  sheetUrl: function (tqx) {
    var self = GSheetUngVien;
    return "https://docs.google.com/spreadsheets/d/" + self.SHEET_ID + "/gviz/tq?headers=1&sheet=" +
      encodeURIComponent(self.SHEET_NAME) + "&tqx=" + encodeURIComponent(tqx);
  },

  loadSheetJsonp: function () {
    var self = GSheetUngVien;
    return self.jsonp(function (cb) { return self.sheetUrl("out:json;responseHandler:" + cb); }, 15000,
      "Không tải được Sheet – sai SHEET_ID hoặc Sheet chưa chia sẻ 'Bất kỳ ai có đường liên kết'")
      .then(function (resp) {
        if (!resp || resp.status === "error") {
          var er = resp && resp.errors && resp.errors[0];
          throw new Error((er ? er.detailed_message || er.message : "lỗi không rõ") + " (kiểm tra SHEET_NAME / quyền chia sẻ)");
        }
        var cols = resp.table.cols, rows = [cols.map(function (c) { return c.label || ""; })];
        resp.table.rows.forEach(function (r) {
          rows.push(cols.map(function (c, i) {
            var cell = r.c[i];
            if (!cell) return "";
            if (typeof cell.v === "number" && c.type === "number") return String(cell.v);
            if (cell.f != null) return cell.f;
            return cell.v == null ? "" : String(cell.v);
          }));
        });
        if (rows.length > 1 && rows[0].every(function (h) { return !h; })) rows.shift();
        return rows;
      });
  },

  loadSheetCsv: function () {
    return fetch(GSheetUngVien.sheetUrl("out:csv")).then(function (r) { return r.text(); }).then(function (csv) {
      if (!csv || csv.trim().charAt(0) === "<") throw new Error("Không đọc được CSV");
      return GSheetUngVien.parseCsv(csv);
    });
  },

  toRecords: function (rows) {
    var self = GSheetUngVien;
    if (!rows || rows.length < 2) return [];
    var norm = function (s) { return String(s || "").normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase(); };
    var header = rows[0].map(norm), idx = {}, missing = [];
    self.MAP.forEach(function (m) {
      var q = norm(m.q), cols = [];
      header.forEach(function (h, i) { if (h === q) cols.push(i); });
      if (cols.length) idx[m.col] = cols.reverse(); else missing.push(m.q);
    });
    if (missing.length) NUT.notify("Không thấy câu hỏi trên Biểu mẫu: " + missing.join(", ") + " (sửa MAP)", "yellow");

    var idCol = header.indexOf("_id"), seenCol = header.indexOf("_seen"), recs = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r], empty = true;
      var rec = { recid: r, _rid: idCol >= 0 ? row[idCol] : null, _seen: seenCol >= 0 && String(row[seenCol]) === "1" };
      self.MAP.forEach(function (m) {
        var v = null;
        (idx[m.col] || []).some(function (i) { v = self.convert(row[i], m.type); return v !== null; });
        if (v !== null) empty = false;
        rec[m.col] = v;
      });
      if (!empty) recs.push(rec);
    }
    return recs;
  },

  loadExisting: function () {
    var self = GSheetUngVien, t = self.conf.table, key = t.columnkey || self.KEY_UV;
    var query = function (select, ms) {
      return new Promise(function (resolve) {
        var timer = setTimeout(function () { resolve({ success: false, result: "server không phản hồi" }); }, ms);
        var p = { url: t.urlview, where: [key, ">", 0] };
        if (select) p.select = select;
        NUT.ds.select(p, function (res) { clearTimeout(timer); resolve(res); });
      });
    };
    var run = self._noSelect ? query(null, 15000)
      : query([key, "hoten", "email", "dienthoai", "CCCD"].join(","), 8000).then(function (res) {
        if (res && res.success) return res;
        self._noSelect = true;
        return query(null, 15000);
      });

    return run.then(function (res) {
      if (!res || !res.success) {
        NUT.notify("Không kiểm tra được ứng viên đã có trong bảng: " + (res && res.result), "yellow");
        return null;
      }
      var idx = { cccd: {}, email: {}, phone: {} };
      (res.result || []).forEach(function (x) {
        var k = self.dupKeys(x);
        if (k.cccd) idx.cccd[k.cccd] = 1;
        if (k.email) (idx.email[k.email] = idx.email[k.email] || []).push(k);
        if (k.phone) (idx.phone[k.phone] = idx.phone[k.phone] || []).push(k);
      });
      return idx;
    });
  },

  applyDup: function (recs, idx) {
    var self = GSheetUngVien, ST = self.ST;
    recs.forEach(function (r) {
      self.setStatus(r, !idx ? ST.UNKNOWN : self.isDup(r, idx) ? ST.EXIST : r._seen ? ST.SEEN : ST.NEW);
    });
  },

  // Trùng khi: CCCD | email + (SĐT hoặc họ tên) | SĐT + họ tên
  isDup: function (rec, idx) {
    var k = GSheetUngVien.dupKeys(rec);
    if (k.cccd && idx.cccd[k.cccd]) return true;
    var any = function (list, fn) { return !!list && list.some(fn); };
    return any(k.email && idx.email[k.email], function (o) { return (k.phone && o.phone === k.phone) || (k.name && o.name === k.name); }) ||
      any(k.phone && idx.phone[k.phone], function (o) { return k.name && o.name === k.name; });
  },

  dupKeys: function (x) {
    var digits = function (v) { return String(v == null ? "" : v).replace(/\D/g, ""); };
    var phone = digits(x.dienthoai).replace(/^84(?=\d{9}$)/, "0");
    if (phone.length === 9) phone = "0" + phone;
    var cccd = digits(x.CCCD);
    if (cccd.length >= 9 && cccd.length < 12) cccd = ("000000000000" + cccd).slice(-12);
    return {
      cccd: cccd.length >= 9 ? cccd : "",
      email: String(x.email || "").trim().toLowerCase(),
      phone: phone.length >= 9 ? phone : "",
      name: String(x.hoten || "").normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase()
    };
  },

  markSeen: function (sel) {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID], ST = self.ST;
    if (!self.WEBAPP_URL) { NUT.notify("Cần cấu hình WEBAPP_URL để lưu trạng thái Đã xem", "yellow"); return; }
    if (self._waOld) { NUT.notify("Web App đang chạy bản cũ nên chưa lưu được 'Đã xem'. Hãy Triển khai Phiên bản mới cho WebAppUngVien rồi tải lại.", "red"); return; }
    var list = sel.map(function (id) { return g.get(id); }).filter(function (r) { return r && r._rid && r._tt !== ST.EXIST; });
    if (!list.length) { NUT.notify("Các dòng đã chọn đều đã có trong bảng – không cần đánh dấu", "yellow"); return; }

    var unmark = list.every(function (r) { return r._seen; });
    g.lock(unmark ? "Đang bỏ đánh dấu..." : "Đang đánh dấu đã xem...", true);
    self.callWebApp({ action: "seen", ids: list.map(function (r) { return r._rid; }).join(","), val: unmark ? 0 : 1 })
      .then(function (res) {
        if (res.updated !== list.length) throw new Error("server chỉ lưu " + (res.updated || 0) + "/" + list.length);
        list.forEach(function (r) { r._seen = !unmark; self.setStatus(r, r._seen ? ST.SEEN : ST.NEW); });
        g.selectNone(); self.applyFilter();
        NUT.notify((unmark ? "Đã bỏ đánh dấu " : "Đã đánh dấu đã xem ") + list.length + " ứng viên", "green");
      })
      .catch(function (e) { NUT.notify("Không lưu được trạng thái Đã xem: " + e.message, "red"); })
      .finally(function () { g.unlock(); });
  },

  removeSelected: function (sel) {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID];
    var drop = function (ids) {
      var del = {};
      ids.forEach(function (id) { del[id] = 1; });
      self._all = self._all.filter(function (r) { return !del[r.recid]; });
      self.fillSelects(); self.applyFilter();
    };
    if (!self.WEBAPP_URL) {
      if (window.confirm("Chưa cấu hình WEBAPP_URL nên chỉ ẩn " + sel.length + " dòng khỏi danh sách (KHÔNG xoá trên Biểu mẫu). Tiếp tục?")) drop(sel);
      return;
    }
    var list = sel.map(function (id) { return g.get(id); });
    var names = list.slice(0, 5).map(function (r) { return r.hoten || r.email || "dòng " + r.recid; }).join(", ");
    if (!window.confirm("XOÁ VĨNH VIỄN " + list.length + " câu trả lời trên Google Biểu mẫu và Sheet?\n" + names +
      (list.length > 5 ? "…" : "") + "\n\nKhông thể khôi phục.")) return;

    g.lock("Đang xoá câu trả lời trên Biểu mẫu...", true);
    var done = [], errs = [];
    self.sequence(list, function (r) {
      if (!r._rid) { errs.push("thiếu id câu trả lời"); return Promise.resolve(); }
      return self.callWebApp({ action: "delete", id: r._rid })
        .then(function () { done.push(r.recid); }, function (e) { errs.push(e.message); });
    }).then(function () {
      g.unlock(); drop(done);
      NUT.notify("Đã xoá " + done.length + "/" + list.length + " câu trả lời" + (errs.length ? " – lỗi: " + errs[0] : ""), errs.length ? "yellow" : "green");
    });
  },

  importSelected: function () {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID], conf = self.conf, ST = self.ST;
    self.commitEdits();
    var list = g.getSelection().map(function (id) { return g.get(id); });
    if (!list.length) { NUT.notify("Chọn (tick) các ứng viên cần thêm", "yellow"); return; }
    if (list.some(function (r) { return r._tt === ST.CHECKING; })) { NUT.notify("Đang kiểm tra trùng với bảng ứng viên, vui lòng chờ", "yellow"); return; }
    var dupCount = list.filter(function (r) { return r._tt === ST.EXIST; }).length;
    if (dupCount && !window.confirm(dupCount + " ứng viên đã có trong bảng. Vẫn thêm?")) return;

    // như Thêm mới trên form: hồ sơ vào bước Start của quy trình
    var base = {};
    if (conf.workflowid && NUT.workflows[conf.workflowid]) {
      var start = NUT.workflows[conf.workflowid][0];
      if (start.roleid != n$.user.roleid) {
        NUT.notify("Tài khoản hiện tại không thuộc bước Start '" + start.stepname + "' của quy trình – không được thêm mới", "red");
        return;
      }
      base = { stepid: start.stepid, workflowid: conf.workflowid, roleid: n$.user.roleid, userid: n$.user.userid, creator: n$.user.username };
    }
    base.status = self.pickStatus(conf);

    var ok = 0, errs = [], unmapped = {};
    var insert = function (url, data, returnid) {
      return new Promise(function (resolve) { NUT.ds.insert({ url: url, data: data, returnid: returnid }, resolve); });
    };
    g.lock("Đang thêm " + list.length + " ứng viên...", true);
    self.sequence(list, function (src) {
      var uv = {}, ct = {}, hasCt = false;
      self.MAP.forEach(function (m) {
        var v = src[m.col] === "" || src[m.col] === undefined ? null : src[m.col];
        var d = self.toDomainId(m.col, v);
        if (!d.ok) unmapped[m.label + ": " + v] = 1;
        if (m.t === "ct") { ct[m.col] = d.value; hasCt = hasCt || d.value !== null; } else uv[m.col] = d.value;
      });
      Object.assign(uv, base);
      var added = function () { ok++; self.setStatus(src, ST.EXIST); };
      return insert(conf.table.urledit, uv, true).then(function (res) {
        if (!res.success) { errs.push(res.result); return; }
        if (!hasCt) return added();
        var newId = self.getNewId(res);
        if (newId === null) { added(); errs.push("Không lấy được " + self.KEY_UV + " mới để ghi chi tiết"); return; }
        ct[self.LINK_CT] = newId;
        return insert(self.urlCt(), ct).then(function (res2) {
          if (res2.success) added(); else errs.push("Chi tiết: " + res2.result);
        });
      });
    }).then(function () {
      g.unlock(); g.selectNone(); self.applyFilter();
      var um = Object.keys(unmapped);
      NUT.notify("Đã thêm " + ok + "/" + list.length + " ứng viên" + (errs.length ? " – lỗi: " + errs[0] : "") +
        (um.length ? " – giá trị chưa có trong domain (lưu nguyên chữ): " + um.join("; ") : ""),
        errs.length || um.length ? "yellow" : "green");
      var main = NUT.w2ui["grid_" + conf.tabid];
      if (main) main.reload();
    });
  },

  exportExcel: function () {
    var self = GSheetUngVien, g = NUT.w2ui[self.GRID];
    self.commitEdits();
    var sel = g.getSelection();
    var list = sel.length ? sel.map(function (id) { return g.get(id); }) : self._view;
    if (!list.length) { NUT.notify("Không có ứng viên nào để xuất", "yellow"); return; }

    g.lock("Đang xuất Excel...", true);
    self.loadScript(self.EXCELJS_URLS, "ExcelJS")
      .then(function (ExcelJS) { return self.buildWorkbook(ExcelJS, list).xlsx.writeBuffer(); })
      .then(function (buf) {
        self.saveFile(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
          "DanhSachUngVien_" + self.stamp() + ".xlsx");
        NUT.notify("Đã xuất " + list.length + " ứng viên ra Excel", "green");
      })
      .catch(function (e) { console.error("[GSheetUngVien]", e); NUT.notify("Xuất Excel lỗi: " + e.message, "red"); })
      .finally(function () { g.unlock(); });
  },

  buildWorkbook: function (ExcelJS, list) {
    var self = GSheetUngVien;
    var wb = new ExcelJS.Workbook(), ws = wb.addWorksheet("Ứng viên");
    var cols = [{ header: "STT", width: 6 }, { header: "Tình trạng", width: 14 }].concat(self.MAP.map(function (m) {
      var w = { date: 14, float: 14, email: 28, phone: 14, cccd: 16 }[m.type] ||
        (/diachi|kinhnghiem|kynang|bangcap|chungchi|CV|portfolio/.test(m.col) ? 36 : 20);
      return { header: m.label, width: w, m: m };
    }));
    var n = cols.length, border = { style: "thin", color: { argb: "FFBFC5CC" } };
    var borders = { top: border, left: border, bottom: border, right: border };
    ws.columns = cols.map(function (c) { return { width: c.width }; });

    ws.mergeCells(1, 1, 1, n);
    ws.getCell(1, 1).value = "DANH SÁCH ỨNG VIÊN";
    ws.getCell(1, 1).font = { bold: true, size: 16, color: { argb: "FF1A73E8" } };
    ws.getCell(1, 1).alignment = { horizontal: "center" };
    ws.mergeCells(2, 1, 2, n);
    ws.getCell(2, 1).value = "Nguồn: Google Biểu mẫu – xuất ngày " + new Date().toLocaleString("vi-VN") + " – " + list.length + " ứng viên";
    ws.getCell(2, 1).font = { italic: true, color: { argb: "FF5F6368" } };
    ws.getCell(2, 1).alignment = { horizontal: "center" };

    var head = ws.getRow(4);
    head.values = cols.map(function (c) { return c.header; });
    head.height = 24;
    head.eachCell(function (c) {
      c.font = { bold: true, color: { argb: "FFFFFFFF" } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A73E8" } };
      c.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      c.border = borders;
    });

    list.forEach(function (r, i) {
      var row = ws.addRow([i + 1, r._tt].concat(cols.slice(2).map(function (c) {
        var v = r[c.m.col];
        if (v == null || v === "") return null;
        if (c.m.type === "date") {                              // ExcelJS ghi ngày theo UTC
          var d = String(v).split("-");
          return d.length === 3 ? new Date(Date.UTC(+d[0], d[1] - 1, +d[2])) : v;
        }
        if (c.m.type === "float") return Number(v);
        return self.textOf(c.m.col, v);
      })));
      row.eachCell({ includeEmpty: true }, function (c, ci) {
        var m = cols[ci - 1].m;
        c.border = borders;
        c.alignment = { vertical: "top", wrapText: true, horizontal: ci <= 2 ? "center" : "left" };
        if (m && m.type === "date") c.numFmt = "dd/mm/yyyy";
        if (m && m.type === "float") c.numFmt = "#,##0";
      });
    });

    ws.views = [{ state: "frozen", ySplit: 4, xSplit: 3 }];
    ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: n } };
    ws.pageSetup = { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
    return wb;
  },

  domainOf: function (col) {
    var self = GSheetUngVien, cache = self._dm;
    if (col in cache) return cache[col];
    var conf = self.conf, has = function (c) { return c && c.columnname === col && c.domainid && NUT.domains[c.domainid]; };
    var f = ((conf && conf.fields) || []).filter(has)[0];
    var tb = conf && conf.table && conf.table.columns;
    if (!f && tb) f = Object.keys(tb).map(function (k) { return tb[k]; }).filter(has)[0];
    return (cache[col] = f ? NUT.domains[f.domainid] : null);
  },

  domainItems: function (dm) {
    return (dm.items || []).filter(function (x) { return x && x.id !== "" && x.id != null; });
  },

  toDomainId: function (col, v) {
    var self = GSheetUngVien, dm = v == null || v === "" ? null : self.domainOf(col);
    if (!dm) return { ok: true, value: v };
    var s = String(v).trim();
    if (dm.lookup && dm.lookup[s] !== undefined) return { ok: true, value: s };

    var norm = function (x) { return String(x == null ? "" : x).normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase(); };
    var loose = function (x) { return x.replace(/[\s\/\-().,]/g, ""); };
    var ix = self._dm["#" + col];
    if (!ix) {
      ix = self._dm["#" + col] = { exact: {}, loose: {} };
      self.domainItems(dm).forEach(function (it) {
        var t = norm(it.text), id = norm(it.id);
        if (!(t in ix.exact)) ix.exact[t] = it.id;
        if (!(id in ix.exact)) ix.exact[id] = it.id;
        if (!(loose(t) in ix.loose)) ix.loose[loose(t)] = it.id;
      });
    }
    var key = norm(s);
    if (key in ix.exact) return { ok: true, value: ix.exact[key] };
    if (loose(key) in ix.loose) return { ok: true, value: ix.loose[loose(key)] };
    return { ok: false, value: v };
  },

  textOf: function (col, v) {
    if (v == null || v === "") return "";
    var dm = GSheetUngVien.domainOf(col);
    if (dm && dm.lookup) {
      var d = GSheetUngVien.toDomainId(col, v), it = d.ok && dm.lookup[d.value];
      if (it) return String(it[1]).trim();
    }
    return String(v).trim();
  },

  pickStatus: function (conf) {
    var self = GSheetUngVien, dm = self.domainOf("status"), wf = conf.workflowid && NUT.workflows[conf.workflowid];
    var cands = [self.DEFAULT_STATUS].concat(wf && wf[0] ? [wf[0].status] : []);
    if (!dm) return cands[0];
    for (var i = 0; i < cands.length; i++) {
      var d = self.toDomainId("status", cands[i]);
      if (cands[i] && d.ok && dm.lookup && dm.lookup[d.value] !== undefined) return d.value;
    }
    var first = self.domainItems(dm)[0];
    return first ? first.id : cands[0];
  },

  sequence: function (list, fn) {
    return list.reduce(function (p, item) { return p.then(function () { return fn(item); }); }, Promise.resolve());
  },

  loadScript: function (urls, name) {
    var self = GSheetUngVien;
    if (window[name]) return Promise.resolve(window[name]);
    if (self._scripts[name]) return self._scripts[name];
    var load = function (url) {
      return new Promise(function (resolve, reject) {
        // trang có AMD loader (ArcGIS) → UMD sẽ gọi define() thay vì gắn window[name]; tạm ẩn khi nạp
        var saved = { define: window.define, module: window.module, exports: window.exports };
        var restore = function () { Object.keys(saved).forEach(function (k) { window[k] = saved[k]; }); };
        window.define = window.module = window.exports = undefined;
        var s = document.createElement("script");
        s.src = url;
        s.onload = function () { restore(); if (window[name]) resolve(window[name]); else reject(new Error(name + " không khởi tạo được")); };
        s.onerror = function () { restore(); s.remove(); reject(new Error("không tải được " + url)); };
        document.head.appendChild(s);
      });
    };
    var p = urls.reduce(function (chain, url) {
      return chain.catch(function () { return load(url); });
    }, Promise.reject(new Error("không có URL thư viện")));
    return (self._scripts[name] = p.catch(function (e) {
      delete self._scripts[name];
      throw new Error("không tải được thư viện " + name + " (" + e.message + ")");
    }));
  },
  _scripts: {},

  saveFile: function (blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  },

  stamp: function () {
    var d = new Date(), p = function (x) { return ("0" + x).slice(-2); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "_" + p(d.getHours()) + p(d.getMinutes());
  },

  escHtml: function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  },

  getNewId: function (res) {
    var r = res.result, k = GSheetUngVien.KEY_UV;
    if (Array.isArray(r)) r = r[0];
    if (r && typeof r === "object") r = r[k] !== undefined ? r[k] : r[Object.keys(r)[0]];
    var n = parseInt(r, 10);
    return isNaN(n) ? null : n;
  },

  urlCt: function () {
    var self = GSheetUngVien, conf = self.conf, win = NUT.windows[conf.windowid];
    var tab = win && win.tabs && win.tabs.filter(function (t) { return t.table && t.table.tablename === self.TABLE_CT && t.table.urledit; })[0];
    return tab ? tab.table.urledit : conf.table.urledit.replace(new RegExp(conf.table.tablename + "$", "i"), self.TABLE_CT);
  },

  convert: function (v, type) {
    if (v == null) return null;
    v = String(v).replace(/\s+/g, " ").trim();
    if (v === "") return null;
    switch (type) {
      case "email": return v.toLowerCase().replace(/\s/g, "");
      case "gender":
        var g = v.toLowerCase();
        return /^(nam|male|m)$/.test(g) ? "Nam" : /^(nữ|nu|female|f)$/.test(g) ? "Nữ" : "Khác";
      case "phone":
        v = v.replace(/^\+?84/, "0").replace(/\D/g, "");
        return v.length === 9 ? "0" + v : v;
      case "cccd":
        v = v.replace(/\D/g, "");
        return v.length > 0 && v.length < 12 ? ("000000000000" + v).slice(-12) : v;
      case "float":
        var f = parseFloat(v.replace(/[^\d.,-]/g, "").replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", "."));
        return isNaN(f) ? null : f;
      case "date":
        var pad = function (x) { return ("0" + x).slice(-2); };
        var m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (m) {
          var mdy = GSheetUngVien.DATE_ORDER === "mdy";
          return m[3] + "-" + pad(mdy ? m[1] : m[2]) + "-" + pad(mdy ? m[2] : m[1]);
        }
        m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        return m ? m[1] + "-" + pad(m[2]) + "-" + pad(m[3]) : null;
    }
    return v;
  },

  parseCsv: function (text) {
    var rows = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c !== '"') cell += c;
        else if (text[i + 1] === '"') { cell += '"'; i++; }
        else q = false;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
};
