// =====================================================================
//  ThuViecTuUngVien.js – TOOL 1: Lấy ứng viên "Nhân viên thử việc" → thêm vào bảng ba_thuviec
//  File đặt tại : site/3/112/ThuViecTuUngVien.js
//  Gắn vào      : Window "Thử việc" (1242) → tab "Thử việc" (1439) → Tool
//                 Tên menu = "Nhận thử việc từ ứng viên" (giống BADGE_LABEL bên dưới), Exec Name = ThuViecTuUngVien
//
//  • Chỉ liệt kê ứng viên có status = FINISH ("Nhân viên thử việc", domain 1195) và CHƯA có trong ba_thuviec
//  • Tick chọn → "Thêm vào thử việc": tạo bản ghi ba_thuviec, gắn đúng ứng viên (nhanvienId = MaUV),
//    chép vị trí, ngày bắt đầu/kết thúc thử việc, vào đúng bước Start của workflow 15
//  • Số ứng viên đang chờ hiện thành chấm đỏ (kiểu thông báo Facebook) trên nút tool, tự cập nhật mỗi 60 giây
//
//  Muốn chấm đỏ hiện ngay khi vừa đăng nhập (chưa cần bấm tool lần nào) → thêm vào cuối index.html của bản local:
//      <script src="site/3/112/ThuViecTuUngVien.js"></script>
// =====================================================================
var ThuViecTuUngVien = {

  // ======================= CẤU HÌNH =======================
  BADGE_LABEL: "Nhận thử việc từ ứng viên",   // PHẢI trùng tên menu tool đặt trong App Builder
  UV_STATUS: "FINISH",                        // trạng thái ứng viên "Nhân viên thử việc"
  TB_UV: "ba_ungvien", KEY_UV: "MaUV",
  TB_TV: "ba_thuviec", KEY_TV: "mathuviec", LINK: "nhanvienId",   // ba_thuviec.nhanvienId = ba_ungvien.MaUV
  TRIAL_MONTHS: 2,                            // số tháng thử việc mặc định
  WINDOW_TV: 1242, TAB_TV: 1439,
  REFRESH_SECONDS: 60,
  // Cột ứng viên hiển thị trong danh sách: [cột, tiêu đề, domain (nếu có), độ rộng]
  COLS: [
    ["MaUV", "Mã UV", null, "65px"], ["hoten", "Họ tên", null, "170px"], ["vitri", "Vị trí", 1181, "120px"],
    ["gioitinh", "Giới tính", 1176, "75px"], ["ngaysinh", "Ngày sinh", null, "90px"], ["dienthoai", "Điện thoại", null, "105px"],
    ["email", "Email", null, "190px"], ["CCCD", "CCCD", null, "115px"], ["trinhdo", "Trình độ", 1177, "110px"],
    ["chuyennganh", "Chuyên ngành", 1189, "140px"], ["kinhnghiem", "Kinh nghiệm", 1180, "150px"],
    ["diadiem", "Địa điểm", 1175, "100px"], ["mucluong", "Mức lương", null, "100px"]
  ],
  // ========================================================

  GRID: "grid_tv_tu_uv",
  count: null,

  run: function (p, callback) {
    var self = ThuViecTuUngVien;
    self.conf = (p && p.config) || self.findTab(); self.callback = callback;
    if (!self.conf || !self.conf.table) { NUT.notify("Tool phải gắn vào tab Thử việc (bảng ba_thuviec)", "red"); return; }
    NUT.openDialog({
      title: "🧑‍💼 Ứng viên trúng tuyển – chờ nhận thử việc",
      width: Math.max(900, Math.min(window.innerWidth - 40, 1500)),
      height: Math.max(520, window.innerHeight - 80),
      div: '<div id="' + self.GRID + '_box" class="nut-full" style="height:100%"></div>',
      onOpen: function (evt) { evt.onComplete = function () { self.buildGrid(); self.load(); }; }
    });
  },

  // ---------------- tiện ích dữ liệu ----------------
  findTab: function () {
    var w = NUT.windows && NUT.windows[this.WINDOW_TV];
    return w && (w.tabs || []).filter(function (t) { return t.tabid == ThuViecTuUngVien.TAB_TV; })[0];
  },
  anyUrl: function () {                       // url REST của một bảng bất kỳ đã nạp → suy ra url các bảng khác
    var c = this.conf || this.findTab();
    if (c && c.table && c.table.urledit) return c.table.urledit;
    var ws = NUT.windows || {};
    for (var k in ws) { var tabs = (ws[k] && ws[k].tabs) || []; for (var i = 0; i < tabs.length; i++) if (tabs[i].table && tabs[i].table.urledit) return tabs[i].table.urledit; }
    return null;
  },
  url: function (table) { var u = this.anyUrl(); return u ? u.replace(/[^\/?]+(\?.*)?$/, table + "$1") : null; },
  q: function (table, where) {
    var self = this;
    return new Promise(function (ok, fail) {
      var u = self.url(table); if (!u) return fail(new Error("Chưa nạp cấu hình bảng"));
      var t = setTimeout(function () { fail(new Error("Server không phản hồi")); }, 20000);
      NUT.ds.select({ url: u, where: where }, function (res) {
        clearTimeout(t); res && res.success ? ok(res.result || []) : fail(new Error((res && res.result) || "Lỗi đọc " + table));
      });
    });
  },
  pending: function () {                      // ứng viên FINISH chưa có trong ba_thuviec
    var self = this;
    return Promise.all([self.q(self.TB_UV, ["status", "=", self.UV_STATUS]), self.q(self.TB_TV, [self.KEY_TV, ">", 0])])
      .then(function (r) {
        var used = {}; r[1].forEach(function (x) { if (x[self.LINK] != null) used[x[self.LINK]] = 1; });
        return r[0].filter(function (x) { return !used[x[self.KEY_UV]]; });
      });
  },
  dmText: function (dmid, v) {
    if (v == null || v === "" || !dmid) return v == null ? "" : v;
    var d = NUT.domains[dmid], it = d && d.lookup && d.lookup[v];
    return it ? String(it[1]).trim() : v;
  },
  hasCol: function (col) {
    var c = this.conf, fs = (c && c.fields) || [];
    for (var i = 0; i < fs.length; i++) if (fs[i].columnname === col) return fs[i];
    var tc = c && c.table && c.table.columns;
    if (tc) for (var k in tc) if (tc[k] && tc[k].columnname === col) return tc[k];
    return null;
  },
  day: function (addMonths) {
    var d = new Date(); if (addMonths) d.setMonth(d.getMonth() + addMonths);
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  },
  fmt: function (v) { var m = String(v || "").match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3] + "/" + m[2] + "/" + m[1] : (v || ""); },

  // ---------------- lưới ----------------
  buildGrid: function () {
    var self = this;
    if (NUT.w2ui[self.GRID]) NUT.w2ui[self.GRID].destroy();
    new NUT.w2grid({
      name: self.GRID,
      show: { toolbar: true, footer: true, selectColumn: true, lineNumbers: true, toolbarReload: false, toolbarColumns: true, toolbarSearch: true },
      multiSearch: true,
      columns: self.COLS.map(function (c) {
        return { field: c[0], text: c[1], size: c[3], sortable: true,
                 render: c[2] ? function (r) { return self.dmText(c[2], r[c[0]]); } : (c[0] === "ngaysinh" ? function (r) { return self.fmt(r.ngaysinh); } : undefined) };
      }),
      searches: [{ field: "hoten", label: "Họ tên", type: "text" }, { field: "email", label: "Email", type: "text" },
                 { field: "dienthoai", label: "Điện thoại", type: "text" }, { field: "CCCD", label: "CCCD", type: "text" }],
      records: [],
      toolbar: {
        items: [
          { type: "button", id: "reload", text: "Tải lại", icon: "w2ui-icon-reload" },
          { type: "html", id: "info", html: '<span id="' + self.GRID + '_info" style="padding:0 10px;color:#555"></span>' },
          { type: "spacer" },
          { type: "button", id: "add", text: "➕ Thêm vào thử việc" },
          { type: "button", id: "close", text: "Đóng" }
        ],
        onClick: function (evt) {
          if (evt.target === "reload") self.load();
          else if (evt.target === "add") self.add();
          else if (evt.target === "close") NUT.closeDialog();
        }
      }
    }).render("#" + self.GRID + "_box");
  },

  load: function () {
    var self = this, g = NUT.w2ui[self.GRID];
    g.lock("Đang tải ứng viên...", true);
    self.pending().then(function (list) {
      g.records = list.map(function (x) { return Object.assign({ recid: x[self.KEY_UV] }, x); });
      g.total = g.records.length; g.refresh(); g.unlock();
      var el = document.getElementById(self.GRID + "_info");
      if (el) el.innerHTML = list.length ? "<b style='color:#e41e3f'>" + list.length + "</b> ứng viên chờ nhận thử việc" : "Không còn ứng viên nào chờ";
      self.setBadge(list.length);
    }).catch(function (e) { g.unlock(); NUT.notify("Không tải được ứng viên: " + e.message, "red"); });
  },

  add: function () {
    var self = this, g = NUT.w2ui[self.GRID], conf = self.conf;
    var list = g.getSelection().map(function (id) { return g.get(id); }).filter(Boolean);
    if (!list.length) { NUT.notify("Tick chọn ứng viên cần thêm vào thử việc", "yellow"); return; }

    var wf = {};                                           // vào đúng bước Start của workflow (như bấm Thêm mới)
    if (conf.workflowid && NUT.workflows[conf.workflowid] && NUT.workflows[conf.workflowid][0]) {
      var st = NUT.workflows[conf.workflowid][0];
      if (Number(st.roleid) !== Number(n$.user.roleid)) { NUT.notify("Tài khoản không thuộc bước '" + st.stepname + "' của quy trình thử việc – không được thêm mới", "red"); return; }
      wf = { workflowid: conf.workflowid, stepid: st.stepid, status: st.status, roleid: n$.user.roleid, userid: n$.user.userid, creator: n$.user.username };
    }
    if (!wf.status) wf.status = "DRAFT";
    var vitriField = self.hasCol("vitri");                  // cột vitri có gắn domain → lưu mã, không thì lưu chữ

    g.lock("Đang thêm " + list.length + " người vào thử việc...", true);
    var ok = 0, errs = [];
    list.reduce(function (pr, u) {
      return pr.then(function () {
        var d = Object.assign({
          ngaytao: self.day(), ngaybatdau: self.day(), ngayketthuc: self.day(self.TRIAL_MONTHS), thoigianthuviec: self.TRIAL_MONTHS,
          vitri: u.vitri == null || u.vitri === "" ? null : (vitriField && vitriField.domainid ? u.vitri : self.dmText(1181, u.vitri))
        }, wf);
        d[self.LINK] = u[self.KEY_UV];
        return new Promise(function (done) {
          NUT.ds.insert({ url: conf.table.urledit, data: d, returnid: true }, function (res) {
            if (res && res.success) ok++; else errs.push((u.hoten || u[self.KEY_UV]) + ": " + (res && res.result));
            done();
          });
        });
      });
    }, Promise.resolve()).then(function () {
      g.unlock();
      NUT.notify("Đã thêm " + ok + "/" + list.length + " người vào thử việc" + (errs.length ? " – lỗi: " + errs[0] : ""), errs.length ? "yellow" : "green");
      var main = NUT.w2ui["grid_" + conf.tabid]; if (main) try { main.reload(); } catch (e) {}
      self.load();
    });
  },

  // ---------------- CHẤM ĐỎ THÔNG BÁO TRÊN NÚT TOOL ----------------
  setBadge: function (n) { this.count = n; this.paintBadge(); },
  paintBadge: function () {
    var self = ThuViecTuUngVien, label = self.BADGE_LABEL.toLowerCase();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), node, hosts = [];
    while ((node = walker.nextNode())) {
      var p = node.parentElement;
      if (!p || p.closest("#" + self.GRID + "_box") || p.classList.contains("tv-badge")) continue;
      if (String(node.nodeValue).trim().toLowerCase().indexOf(label) === 0) hosts.push(p);
    }
    hosts.forEach(function (h) {
      var b = h.querySelector(".tv-badge");
      if (!self.count) { if (b) b.remove(); return; }
      if (!b) {
        b = document.createElement("span"); b.className = "tv-badge";
        b.style.cssText = "display:inline-block;min-width:18px;height:18px;line-height:18px;padding:0 5px;margin-left:6px;" +
                          "border-radius:9px;background:#e41e3f;color:#fff;font-size:11px;font-weight:700;text-align:center;" +
                          "vertical-align:middle;box-shadow:0 0 0 2px #fff;";
        h.appendChild(b);
      }
      b.textContent = self.count > 99 ? "99+" : String(self.count);
      b.title = self.count + " ứng viên trúng tuyển chờ nhận thử việc";
    });
  },
  startBadge: function () {
    var self = ThuViecTuUngVien;
    if (self._started) return; self._started = true;
    var refresh = function () {
      if (!window.n$ || !n$.user || !self.anyUrl()) return;
      self.pending().then(function (l) { self.setBadge(l.length); }).catch(function () {});
    };
    setInterval(function () { self.paintBadge(); }, 1500);              // toolbar vẽ lại → gắn lại chấm đỏ
    setInterval(refresh, self.REFRESH_SECONDS * 1000);
    var first = setInterval(function () { if (window.n$ && n$.user && self.anyUrl()) { clearInterval(first); refresh(); } }, 2000);
  }
};
ThuViecTuUngVien.startBadge();