// CapNhatTrangThaiNV – cập nhật trạng thái nhân sự (thử việc / chính thức / tạm nghỉ / nghỉ việc) trên ba_ungvien
var CapNhatTrangThaiNV = {

  TB_TV: "ba_thuviec", KEY_TV: "mathuviec", LINK_TV: "nhanvienId",     
  TV_OFFICIAL: ["EMPLOYEE", "FINISH"],     
  ST: {                                    
    TRIAL: "FINISH",
    OFFICIAL: "OFFICIAL",
    SUSPENDED: "SUSPENDED",
    RESIGNED: "RESIGNED"
  },
  COL_TAMNGHI: "thoigiantamnghi",
  COL_NGAYNGHIVIEC: "ngaynghiviec",
  COL_LYDO: "lydonghi",
  TV_LABELS: {
    DRAFT: ["Tiếp nhận thử việc", "gray"], SUBMIT: ["Chờ duyệt thử việc", "orange"], TRIAL_SUBMIT: ["Chờ duyệt thử việc", "orange"],
    CHECKED: ["Chờ duyệt thử việc", "orange"], RECHECK: ["Chờ duyệt lại", "orange"], SUPPLEMENT: ["Bổ sung thông tin", "orange"],
    EMPLOYEE: ["Nhân viên chính thức", "green"], FINISH: ["Đạt thử việc", "green"], REJECT: ["Không đạt", "red"],
    SUSPEND_REQUEST: ["Chờ duyệt tạm nghỉ", "orange"], RESUME_REQUEST: ["Chờ duyệt đi làm lại", "orange"],
    RESIGN_REQUEST: ["Chờ duyệt nghỉ việc", "orange"], SUSPENDED: ["Tạm nghỉ", "purple"], RESIGNED: ["Đã nghỉ việc", "red"]
  },
  SUGGEST: [["1 tuần", 7], ["2 tuần", 14], ["1 tháng", "1m"], ["3 tháng", "3m"], ["6 tháng", "6m"]],

  GRID: "grid_capnhat_nhansu",
  filter: "all",
  rows: [],

  run: function (p, callback) {
    var self = CapNhatTrangThaiNV;
    self.conf = p && p.config; self.callback = callback;
    if (!self.conf || !self.conf.table || self.conf.table.tablename !== "ba_ungvien") {
      NUT.notify("Tool này gắn vào tab Nhân viên (bảng ba_ungvien)", "red"); return;
    }
    self.key = self.conf.table.columnkey || "MaUV";
    self.preSel = self.mainSelection();
    var miss = [self.ST.OFFICIAL, self.ST.SUSPENDED, self.ST.RESIGNED].filter(function (s) { return !self.inDomain(s); });
    if (miss.length) NUT.notify("Domain cột Trạng thái chưa có mã: " + miss.join(", ") + " – thêm vào domain 1195 rồi đăng nhập lại", "yellow");

    NUT.openDialog({
      title: "👥 Cập nhật nhân sự – đồng bộ chính thức / tạm nghỉ / đi làm lại / nghỉ việc",
      width: Math.max(900, Math.min(window.innerWidth - 40, 1500)),
      height: Math.max(560, window.innerHeight - 70),
      div: '<div style="display:flex;flex-direction:column;height:100%">' +
             '<div id="' + self.GRID + '_act" style="display:none;padding:10px 12px;background:#f4f8ff;border-bottom:1px solid #cdd9ee;font-size:13px"></div>' +
             '<div id="' + self.GRID + '_box" style="flex:1;min-height:0"></div></div>',
      onOpen: function (evt) { evt.onComplete = function () { self.buildGrid(); self.load(); }; }
    });
  },

  field: function (col) {
    var fs = (this.conf && this.conf.fields) || [];
    for (var i = 0; i < fs.length; i++) if (fs[i].columnname === col) return fs[i];
    var tc = this.conf && this.conf.table && this.conf.table.columns;
    if (tc) for (var k in tc) if (tc[k] && tc[k].columnname === col) return tc[k];
    return null;
  },
  hasCol: function (c) { return !!this.field(c); },
  dom: function (id) { if (id) return NUT.domains[id]; var f = this.field("status"); return f && f.domainid ? NUT.domains[f.domainid] : null; },
  inDomain: function (v) { var d = this.dom(); return !d || !!(d.lookup && d.lookup[v]); },
  stText: function (v, dmid) { var d = this.dom(dmid), it = d && d.lookup && d.lookup[v]; return it ? String(it[1]).trim() : (v || ""); },
  badge: function (v, dmid) {
    if (!v) return "";
    var d = this.dom(dmid), it = d && d.lookup && d.lookup[v];
    var c = it && it[2] ? String(it[2]).trim() : "#888";
    return '<span style="display:inline-block;padding:1px 9px;border-radius:10px;color:#fff;font-size:12px;background:' + c + '">' +
           (it ? String(it[1]).trim() : v) + "</span>";
  },

  tvBadge: function (v) {
    if (!v) return "";
    var d = NUT.domains[1197], it = d && d.lookup && d.lookup[v], fb = this.TV_LABELS[v];
    var text = it ? String(it[1]).trim() : (fb ? fb[0] : v), c = it && it[2] ? String(it[2]).trim() : (fb ? fb[1] : "#888");
    return '<span style="display:inline-block;padding:1px 9px;border-radius:10px;color:#fff;font-size:12px;background:' + c + '">' + text + "</span>";
  },

  url: function (t) { return this.conf.table.urledit.replace(/[^\/?]+(\?.*)?$/, t + "$1"); },
  q: function (url, where) {
    return new Promise(function (ok, fail) {
      var tm = setTimeout(function () { fail(new Error("Server không phản hồi")); }, 20000);
      NUT.ds.select({ url: url, where: where }, function (r) { clearTimeout(tm); r && r.success ? ok(r.result || []) : fail(new Error((r && r.result) || "Lỗi đọc dữ liệu")); });
    });
  },
  upd: function (id, data) {
    var self = this;
    return new Promise(function (ok, fail) {
      NUT.ds.update({ url: self.conf.table.urledit, data: data, where: [self.key, "=", id] }, function (r) {
        r && r.success ? ok(r) : fail(new Error((r && r.result) || "Lỗi cập nhật"));
      });
    });
  },
  iso: function (d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); },
  parse: function (s) { var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; },
  fmt: function (v) { var m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : (v || ""); },
  days: function (a, b) { return Math.round((b - a) / 86400000) + 1; },
  mainSelection: function () {
    var g = NUT.w2ui["grid_" + this.conf.tabid];
    return g && g.getSelection ? g.getSelection().map(function (id) { var r = g.get(id); return r && r[CapNhatTrangThaiNV.key]; }).filter(function (x) { return x != null; }) : [];
  },

  buildGrid: function () {
    var self = this;
    if (NUT.w2ui[self.GRID]) NUT.w2ui[self.GRID].destroy();
    var F = [["all", "Tất cả"], ["sync", "Cần đồng bộ"], ["trial", "Đang thử việc"], ["official", "Chính thức"],
             ["susp", "Tạm nghỉ"], ["off", "Đã nghỉ việc"], ["err", "Hồ sơ thử việc lỗi"]];
    new NUT.w2grid({
      name: self.GRID,
      show: { toolbar: true, footer: true, selectColumn: true, lineNumbers: true, toolbarReload: false, toolbarColumns: true, toolbarSearch: true },
      multiSearch: true,
      columns: [
        { field: "MaUV", text: "Mã NV (ID)", size: "80px", sortable: true },
        { field: "hoten", text: "Họ tên", size: "170px", sortable: true,
          render: function (r) { return r._err ? '<span style="color:#d9534f" title="' + r._err + '">⚠ ' + r._err + "</span>" : self.esc(r.hoten); } },
        { field: "status", text: "Trạng thái nhân viên", size: "230px", sortable: true,
          render: function (r) { return self.badge(r.status) + (r._need ? ' <span style="color:#e67e00;font-size:12px">⟳ chờ lên chính thức</span>' : ""); } },
        { field: "_tvst", text: "Trạng thái thử việc", size: "160px", sortable: true, render: function (r) { return self.tvBadge(r._tvst); } },
        { field: "vitri", text: "Vị trí", size: "110px", render: function (r) { return self.stText(r.vitri, 1181); } },
        { field: "_tvtu", text: "Thử việc từ", size: "90px", render: function (r) { return self.fmt(r._tvtu); } },
        { field: "_tvden", text: "đến", size: "90px", render: function (r) { return self.fmt(r._tvden); } },
        { field: "thoigiantamnghi", text: "Thời gian tạm nghỉ", size: "210px", render: function (r) { return self.tamNghiCell(r); } },
        { field: "ngaynghiviec", text: "Ngày nghỉ việc", size: "100px", render: function (r) { return self.fmt(r.ngaynghiviec); } },
        { field: "lydonghi", text: "Lý do", size: "220px", render: function (r) { return self.esc(r.lydonghi); } },
        { field: "dienthoai", text: "Điện thoại", size: "105px" },
        { field: "email", text: "Email", size: "180px" }
      ],
      searches: [{ field: "hoten", label: "Họ tên", type: "text" }, { field: "MaUV", label: "Mã NV", type: "int" },
                 { field: "dienthoai", label: "Điện thoại", type: "text" }, { field: "email", label: "Email", type: "text" }],
      records: [],
      toolbar: {
        items: [
          { type: "menu-radio", id: "filter", selected: "all",
            text: function (it) { return "Lọc: " + (F.filter(function (f) { return f[0] === it.selected; })[0] || F[0])[1]; },
            items: F.map(function (f) { return { id: f[0], text: f[1] }; }) },
          { type: "button", id: "reload", text: "Tải lại", icon: "w2ui-icon-reload" },
          { type: "break" },
          { type: "button", id: "sync", text: "🔄 Đồng bộ chính thức" },
          { type: "break" },
          { type: "button", id: "suspend", text: "⏸ Tạm nghỉ" },
          { type: "button", id: "resume", text: "▶ Đi làm lại" },
          { type: "button", id: "resign", text: "🚪 Nghỉ việc" },
          { type: "spacer" },
          { type: "button", id: "close", text: "Đóng" }
        ],
        onClick: function (evt) {
          var t = evt.target;
          if (t.indexOf("filter:") === 0) { self.filter = t.split(":")[1]; self.apply(); return; }
          if (t === "reload") self.load();
          else if (t === "sync") self.sync();
          else if (t === "suspend" || t === "resume" || t === "resign") self.openAction(t);
          else if (t === "close") NUT.closeDialog();
        }
      }
    }).render("#" + self.GRID + "_box");
  },

  tamNghiCell: function (r) {
    var v = r[this.COL_TAMNGHI]; if (!v) return "";
    if (r.status === this.ST.SUSPENDED && r._tnEnd && r._tnEnd < new Date(new Date().toDateString()))
      return '<span style="color:#d9534f" title="Đã quá ngày kết thúc tạm nghỉ – cập nhật Đi làm lại hoặc gia hạn">⚠ ' + v + "</span>";
    return v;
  },

  load: function () {
    var self = this, g = NUT.w2ui[self.GRID], S = self.ST;
    self.hideAction(); g.lock("Đang tải và đối chiếu ID...", true);
    Promise.all([self.q(self.conf.table.urledit, [self.key, ">", 0]), self.q(self.url(self.TB_TV), [self.KEY_TV, ">", 0])])
      .then(function (res) {
        var uv = {}, tvBy = {}, rows = [], staff = [S.TRIAL, S.OFFICIAL, S.SUSPENDED, S.RESIGNED];
        res[0].forEach(function (x) { uv[x[self.key]] = x; });
        res[1].forEach(function (t) {
          var id = t[self.LINK_TV];
          if (id == null || id === "") { rows.push(self.orphan(t, "Thử việc #" + t[self.KEY_TV] + " chưa chọn nhân viên")); return; }
          if (!uv[id]) { rows.push(self.orphan(t, "Thử việc #" + t[self.KEY_TV] + " không tìm thấy nhân viên")); return; }
          if (!tvBy[id] || Number(t[self.KEY_TV]) > Number(tvBy[id][self.KEY_TV])) tvBy[id] = t;
        });
        Object.keys(uv).forEach(function (id) {
          var u = uv[id], t = tvBy[id];
          if (!t && staff.indexOf(u.status) < 0) return;
          var r = Object.assign({ recid: "u" + id }, u);
          if (t) {
            r._tv = t[self.KEY_TV]; r._tvst = t.status; r._tvtu = t.ngaybatdau; r._tvden = t.ngayketthuc;
            var tvOk = self.TV_OFFICIAL.indexOf(t.status) >= 0; r._tvOk = tvOk;
            var isStaff = [S.OFFICIAL, S.SUSPENDED, S.RESIGNED].indexOf(u.status) >= 0;
            r._need = tvOk && !isStaff;
            r._ok = tvOk && isStaff;
          }
          var m = String(u[self.COL_TAMNGHI] || "").match(/(\d{2})\/(\d{2})\/(\d{4})\s*$|→\s*(\d{2})\/(\d{2})\/(\d{4})/);
          if (m) r._tnEnd = m[4] ? new Date(+m[6], m[5] - 1, +m[4]) : new Date(+m[3], m[2] - 1, +m[1]);
          rows.push(r);
        });
        self.rows = rows; self.apply(); g.unlock();
        var need = rows.filter(function (r) { return r._need; }).length, err = rows.filter(function (r) { return r._err; }).length;
        g.toolbar.set("sync", { text: "🔄 Đồng bộ chính thức" + (need ? ' <span style="background:#e41e3f;color:#fff;border-radius:9px;padding:0 6px;font-size:11px">' + need + "</span>" : "") });
        g.toolbar.refresh();
        if (need) NUT.notify("Có " + need + " nhân viên đã được duyệt đạt thử việc, chờ cập nhật lên chính thức", "yellow");
        if (err) NUT.notify(err + " hồ sơ thử việc chưa gắn đúng nhân viên – chọn Lọc: Hồ sơ thử việc lỗi để xem", "red");
        if (self.preSel.length) {
          self.preSel.forEach(function (id) { if (g.get("u" + id)) g.select("u" + id); }); self.preSel = [];
        }
      }).catch(function (e) { g.unlock(); NUT.notify("Không tải được dữ liệu: " + e.message, "red"); });
  },
  orphan: function (t, msg) {
    return { recid: "t" + t[this.KEY_TV], MaUV: t[this.LINK_TV] || "", hoten: "(không xác định)", _tv: t[this.KEY_TV], _tvst: t.status,
             _tvtu: t.ngaybatdau, _tvden: t.ngayketthuc, _err: msg };
  },
  apply: function () {
    var self = this, g = NUT.w2ui[self.GRID], S = self.ST, f = self.filter;
    g.records = self.rows.filter(function (r) {
      if (f === "sync") return r._need;
      if (f === "err") return !!r._err;
      if (f === "trial") return !r._err && r.status === S.TRIAL;
      if (f === "official") return r.status === S.OFFICIAL;
      if (f === "susp") return r.status === S.SUSPENDED;
      if (f === "off") return r.status === S.RESIGNED;
      return true;
    }).map(function (r) {
      var c = r._err ? "#fdecea" : r._need ? "#fff4e0" : "";
      return Object.assign(r, { w2ui: { style: c ? "background-color:" + c : "" } });
    });
    g.total = g.records.length; g.selectNone(); g.refresh();
  },
  picked: function () {
    var g = NUT.w2ui[this.GRID];
    return g.getSelection().map(function (id) { return g.get(id); }).filter(function (r) { return r && !r._err; });
  },

  sync: function () {
    var self = this, sel = self.picked();
    var list = (sel.length ? sel : self.rows).filter(function (r) { return r._need; });
    if (!list.length) { NUT.notify(sel.length ? "Các dòng đã chọn không cần đồng bộ" : "Không có nhân viên nào cần đồng bộ – dữ liệu đã khớp", "green"); return; }
    var rowsHtml = list.map(function (r, i) {
      var vt = self.stText(r.vitri, 1181);
      return '<tr style="border-top:1px solid #eef0f3">' +
               '<td style="padding:7px 8px;color:#888;width:28px">' + (i + 1) + '</td>' +
               '<td style="padding:7px 8px;font-weight:600">' + self.esc(r.hoten) + '</td>' +
               '<td style="padding:7px 8px;color:#555">' + self.esc(vt || "") + '</td>' +
               '<td style="padding:7px 8px;color:#555;white-space:nowrap">' + (r._tvtu ? "Thử việc " + self.fmt(r._tvtu) + (r._tvden ? " – " + self.fmt(r._tvden) : "") : "") + '</td></tr>';
    }).join("");
    self.ask({
      title: "Xác nhận lên nhân viên chính thức",
      html: '<p style="margin:0 0 10px">Các nhân viên dưới đây đã được <b>Bộ phận thử việc duyệt đạt</b>. ' +
            'Bạn có muốn cập nhật họ thành ' + self.badge(self.ST.OFFICIAL) + ' không?</p>' +
            '<div style="max-height:260px;overflow:auto;border:1px solid #e3e6ea;border-radius:6px">' +
            '<table style="width:100%;border-collapse:collapse;font-size:13px">' + rowsHtml + '</table></div>',
      ok: "Xác nhận (" + list.length + " người)",
      onOk: function () {
        self.batch(list, function () { return { status: self.ST.OFFICIAL }; }, function (ok, n) {
          return ok === n ? "Đã cập nhật " + ok + " nhân viên lên Nhân viên chính thức" : "Đã cập nhật " + ok + "/" + n + " nhân viên lên Nhân viên chính thức";
        });
      }
    });
  },

  ask: function (o) {
    var old = document.getElementById("cnns_ask"); if (old) old.remove();
    var wrap = document.createElement("div");
    wrap.id = "cnns_ask";
    wrap.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:16px";
    wrap.innerHTML =
      '<div style="background:#fff;border-radius:10px;width:100%;max-width:560px;box-shadow:0 12px 40px rgba(0,0,0,.25);font-size:14px;color:#222;overflow:hidden">' +
        '<div style="padding:14px 18px;border-bottom:1px solid #eef0f3;font-size:16px;font-weight:600">' + o.title + '</div>' +
        '<div style="padding:14px 18px">' + o.html + '</div>' +
        '<div style="padding:12px 18px;background:#f8f9fb;text-align:right;display:flex;gap:8px;justify-content:flex-end">' +
          '<button class="w2ui-btn" data-a="no">Huỷ</button>' +
          '<button class="w2ui-btn w2ui-btn-blue" data-a="ok">' + (o.ok || "Xác nhận") + '</button>' +
        '</div></div>';
    var close = function () { wrap.remove(); document.removeEventListener("keydown", key); };
    var key = function (e) { if (e.key === "Escape") close(); };
    wrap.addEventListener("click", function (e) {
      var a = e.target.getAttribute && e.target.getAttribute("data-a");
      if (e.target === wrap || a === "no") close();
      else if (a === "ok") { close(); o.onOk && o.onOk(); }
    });
    document.addEventListener("keydown", key);
    document.body.appendChild(wrap);
    wrap.querySelector('[data-a="ok"]').focus();
  },
  esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); },

  css: function () {
    if (document.getElementById("cnns_css")) return;
    var st = document.createElement("style"); st.id = "cnns_css";
    st.textContent =
      ".cnns-card{background:#fff;border-radius:12px;padding:18px 20px;box-shadow:0 12px 40px rgba(0,0,0,.25);font-size:13px;color:#1f2937;width:100%;max-width:640px;max-height:92vh;overflow:auto}" +
      ".cnns-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}" +
      ".cnns-title{font-size:15px;font-weight:700}" +
      ".cnns-people{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}" +
      ".cnns-person{background:#f1f5fb;border:1px solid #e1e8f3;border-radius:14px;padding:3px 10px;font-size:12px}" +
      ".cnns-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px 14px}" +
      ".cnns-f label{display:block;font-size:12px;color:#5b6472;margin-bottom:5px;font-weight:600}" +
      ".cnns-f label i{color:#d9534f;font-style:normal}" +
      ".cnns-f input,.cnns-f textarea{width:100%;box-sizing:border-box;border:1px solid #cfd6e0;border-radius:7px;padding:8px 10px;font-size:13px;font-family:inherit;background:#fff;outline:none;transition:border-color .15s,box-shadow .15s}" +
      ".cnns-f textarea{min-height:64px;resize:vertical}" +
      ".cnns-f input:focus,.cnns-f textarea:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.15)}" +
      ".cnns-f.bad input,.cnns-f.bad textarea{border-color:#e5484d;box-shadow:0 0 0 3px rgba(229,72,77,.12)}" +
      ".cnns-wide{grid-column:1/-1}" +
      ".cnns-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center}" +
      ".cnns-chip{border:1px solid #cfd6e0;background:#f6f8fb;color:#374151;border-radius:16px;padding:5px 12px;font-size:12px;cursor:pointer;transition:all .15s}" +
      ".cnns-chip:hover{border-color:#3b82f6;color:#2563eb}" +
      ".cnns-chip.on{background:#2563eb;border-color:#2563eb;color:#fff}" +
      ".cnns-days{font-size:12px;font-weight:700;color:#15803d;margin-left:4px}" +
      ".cnns-days.bad{color:#d9534f}" +
      ".cnns-msg{color:#d9534f;font-size:12px;min-height:16px;margin-top:8px}" +
      ".cnns-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}" +
      ".cnns-btn{border:0;border-radius:7px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer}" +
      ".cnns-btn.pri{background:#2563eb;color:#fff}.cnns-btn.pri:hover{background:#1d4ed8}" +
      ".cnns-btn.sec{background:#eef1f5;color:#374151}.cnns-btn.sec:hover{background:#e2e7ee}" +
      ".cnns-btn:disabled{opacity:.6;cursor:default}";
    document.head.appendChild(st);
  },
  hideAction: function () { var d = document.getElementById(this.GRID + "_act"); if (d) { d.style.cssText = "display:none"; d.innerHTML = ""; } },

  // đi làm lại: đã duyệt chính thức bên thử việc → Chính thức, chưa → Nhân viên thử việc
  origin: function (r) { return r._tvOk ? this.ST.OFFICIAL : this.ST.TRIAL; },

  openAction: function (type) {
    var self = this, S = self.ST, sel = self.picked();
    var A = {
      suspend: { from: [S.TRIAL, S.OFFICIAL], to: S.SUSPENDED, title: "⏸ Tạm nghỉ", ok: "Lưu tạm nghỉ" },
      resume:  { from: [S.SUSPENDED], to: null, title: "▶ Đi làm lại", ok: "Lưu đi làm lại" },
      resign:  { from: [S.TRIAL, S.OFFICIAL, S.SUSPENDED], to: S.RESIGNED, title: "🚪 Nghỉ việc", ok: "Lưu nghỉ việc" }
    }[type];
    if (!sel.length) { NUT.notify("Hãy tick chọn nhân viên cần cập nhật trước", "yellow"); return; }
    var bad = sel.filter(function (r) { return A.from.indexOf(r.status) < 0; });
    if (bad.length) {
      NUT.notify(A.title.replace(/^\S+\s/, "") + " chỉ áp dụng cho người đang: " + A.from.map(function (s) { return self.stText(s); }).join(" / ") +
                 ". Chưa phù hợp: " + bad.slice(0, 3).map(function (r) { return r.hoten + " (" + (self.stText(r.status) || "chưa có trạng thái") + ")"; }).join(", "), "red");
      return;
    }
    self.css();
    var id = self.GRID, today = self.iso(new Date());
    var arrow = type === "resume"
      ? '<span style="color:#6b7280">→ về trạng thái gốc:</span> ' + sel.map(function (r) { return self.origin(r); }).filter(function (v, i, a) { return a.indexOf(v) === i; }).map(function (s) { return self.badge(s); }).join(" ")
      : '<span style="color:#6b7280">→</span> ' + self.badge(A.to);
    var f = function (key, label, html, cls) { return '<div class="cnns-f ' + (cls || "") + '" data-k="' + key + '"><label>' + label + "</label>" + html + "</div>"; };
    var body = "";
    if (type === "suspend") {
      body = f("tu", "Từ ngày <i>*</i>", '<input type="date" id="' + id + '_tu" value="' + today + '">') +
             f("den", "Đến ngày <i>*</i>", '<input type="date" id="' + id + '_den">') +
             f("goi", "Thời gian đề xuất", '<div class="cnns-chips">' +
               self.SUGGEST.map(function (s, i) { return '<span class="cnns-chip" data-s="' + i + '">' + s[0] + "</span>"; }).join("") +
               '<span class="cnns-days" id="' + id + '_n"></span></div>', "cnns-wide") +
             f("ly", "Lý do tạm nghỉ <i>*</i>", '<textarea id="' + id + '_ly" placeholder="VD: nghỉ ốm, việc gia đình, nghỉ thai sản..."></textarea>', "cnns-wide");
    } else if (type === "resign") {
      body = f("tu", "Ngày nghỉ việc <i>*</i>", '<input type="date" id="' + id + '_tu" value="' + today + '">') +
             f("ly", "Lý do nghỉ việc <i>*</i>", '<textarea id="' + id + '_ly" placeholder="VD: chuyển công tác, hết hợp đồng, lý do cá nhân..."></textarea>', "cnns-wide");
    } else {
      body = f("tu", "Ngày đi làm lại <i>*</i>", '<input type="date" id="' + id + '_tu" value="' + today + '">') +
             f("ly", "Ghi chú (không bắt buộc)", '<textarea id="' + id + '_ly" placeholder="VD: đã hết thời gian tạm nghỉ, đi làm sớm hơn dự kiến..."></textarea>', "cnns-wide");
    }
    var d = document.getElementById(id + "_act");
    d.innerHTML =
      '<div class="cnns-card">' +
        '<div class="cnns-head"><span class="cnns-title">' + A.title + "</span>" + arrow + "</div>" +
        '<div class="cnns-people">' + sel.map(function (r) { return '<span class="cnns-person">' + self.esc(r.hoten) + "</span>"; }).join("") + "</div>" +
        '<div class="cnns-grid">' + body + "</div>" +
        '<div class="cnns-msg" id="' + id + '_msg"></div>' +
        '<div class="cnns-actions"><button class="cnns-btn sec" id="' + id + '_cancel">Huỷ</button>' +
        '<button class="cnns-btn pri" id="' + id + '_ok">💾 ' + A.ok + " (" + sel.length + " người)</button></div>" +
      "</div>";
    d.style.cssText = "position:fixed;inset:0;z-index:100000;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:16px";
    d.onclick = function (e) { if (e.target === d) self.hideAction(); };

    var $ = function (s) { return document.getElementById(id + s); };
    var mark = function (k, on) { var el = d.querySelector('.cnns-f[data-k="' + k + '"]'); if (el) el.classList.toggle("bad", !!on); };
    var showN = function () {
      var a = self.parse($("_tu").value), b = $("_den") && self.parse($("_den").value), n = $("_n");
      if (!n) return;
      if (a && b && b >= a) { n.className = "cnns-days"; n.textContent = "= " + self.days(a, b) + " ngày"; }
      else if (a && b) { n.className = "cnns-days bad"; n.textContent = "Ngày kết thúc phải sau ngày bắt đầu"; }
      else n.textContent = "";
    };
    if (type === "suspend") {
      var chips = d.querySelectorAll(".cnns-chip");
      chips.forEach(function (c) {
        c.onclick = function () {
          var s = self.SUGGEST[c.getAttribute("data-s")][1], a = self.parse($("_tu").value) || new Date(), e = new Date(a);
          if (typeof s === "string") { e.setMonth(e.getMonth() + parseInt(s, 10)); e.setDate(e.getDate() - 1); } else e.setDate(e.getDate() + s - 1);
          $("_den").value = self.iso(e);
          chips.forEach(function (x) { x.classList.toggle("on", x === c); });
          mark("den", false); showN();
        };
      });
      $("_tu").onchange = function () { var on = d.querySelector(".cnns-chip.on"); if (on) on.onclick(); else showN(); };
      $("_den").onchange = function () { chips.forEach(function (x) { x.classList.remove("on"); }); showN(); };
      chips[2].onclick();
    }
    $("_cancel").onclick = function () { self.hideAction(); };
    $("_ok").onclick = function () {
      var tu = self.parse($("_tu").value), ly = $("_ly").value.trim(), den = $("_den") && self.parse($("_den").value), msg = [];
      ["tu", "den", "ly"].forEach(function (k) { mark(k, false); });
      if (!tu) { mark("tu", true); msg.push("chọn ngày"); }
      if (type === "suspend" && (!den || (tu && den < tu))) { mark("den", true); msg.push("chọn ngày kết thúc tạm nghỉ (sau ngày bắt đầu)"); }
      if (type !== "resume" && !ly) { mark("ly", true); msg.push("nhập lý do"); }
      if (msg.length) { $("_msg").textContent = "Vui lòng " + msg.join(", ") + "."; return; }

      var build = function (r) {
        var x = {};
        if (type === "suspend") {
          x.status = S.SUSPENDED;
          x[self.COL_TAMNGHI] = self.fmt(self.iso(tu)) + " → " + self.fmt(self.iso(den)) + " (" + self.days(tu, den) + " ngày)";
          x[self.COL_LYDO] = ly;
        } else if (type === "resign") {
          x.status = S.RESIGNED;
          x[self.COL_NGAYNGHIVIEC] = self.iso(tu);
          x[self.COL_LYDO] = ly;
        } else {
          x.status = self.origin(r);
          var old = String(r[self.COL_TAMNGHI] || "").replace(/\s*–\s*đi làm lại.*$/, "");
          x[self.COL_TAMNGHI] = (old ? old + " – " : "") + "đi làm lại " + self.fmt(self.iso(tu));
          if (ly) x[self.COL_LYDO] = ly;
        }
        Object.keys(x).forEach(function (k) { if (k !== "status" && !self.hasCol(k)) { delete x[k]; self.warnCol = true; } });
        return x;
      };
      $("_ok").disabled = true; $("_ok").textContent = "Đang lưu...";
      var label = type === "resume" ? "đi làm lại" : self.stText(A.to).toLowerCase();
      self.batch(sel, build, function (ok, n) { return "Đã cập nhật " + label + " cho " + (ok === n ? ok : ok + "/" + n) + " nhân viên"; });
      if (self.warnCol) { NUT.notify("Bảng nhân viên chưa có cột thời gian tạm nghỉ / ngày nghỉ việc / lý do – chạy 8_CotNghiViec_ba_ungvien.sql và thêm field vào tab", "yellow"); self.warnCol = false; }
    };
  },

  batch: function (list, build, msg) {
    var self = this, g = NUT.w2ui[self.GRID], ok = 0, errs = [], sent = {};
    g.lock("Đang cập nhật " + list.length + " người...", true);
    list.reduce(function (pr, r) {
      return pr.then(function () {
        var data = build(r); sent[r.MaUV] = { name: r.hoten, data: data };
        return self.upd(r.MaUV, data).then(function () { ok++; }, function (e) { errs.push(r.hoten + ": " + e.message); delete sent[r.MaUV]; });
      });
    }, Promise.resolve()).then(function () {
      var ids = Object.keys(sent).map(Number);
      return ids.length ? self.q(self.conf.table.urledit, [self.key, "in", ids]).then(function (rows) {
        var by = {}; rows.forEach(function (x) { by[x[self.key]] = x; });
        ids.forEach(function (id) {
          var want = sent[id].data, got = by[id] || {}, wrong = [];
          Object.keys(want).forEach(function (k) {
            var a = want[k] == null ? "" : String(want[k]), b = got[k] == null ? "" : String(got[k]);
            if (/^\d{4}-\d{2}-\d{2}$/.test(a)) b = b.slice(0, 10);
            if (a !== b) wrong.push((self.field(k) && self.field(k).alias) || k);
          });
          if (wrong.length) { ok--; errs.push(sent[id].name + ": chưa lưu được " + wrong.join(", ")); }
        });
      }).catch(function () {}) : null;
    }).then(function () {
      g.unlock(); self.hideAction();
      NUT.notify((typeof msg === "function" ? msg(ok, list.length) : msg + ": " + ok + "/" + list.length) + (errs.length ? " – lỗi: " + errs[0] : ""), errs.length ? "yellow" : "green");
      var m = NUT.w2ui["grid_" + self.conf.tabid]; if (m) try { m.reload(); } catch (e) {}
      self.load();
    });
  }
};