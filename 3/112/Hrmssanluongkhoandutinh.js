var HrmsSanLuongKhoanDuTinh = {
	SERVICE_ID: 3,
	EMP: function () { return n$.user.tag; },
	url: null,
	dsSanPham: [],
	dong: [],

	ICON: {
		bottle: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4v4l2 3v12a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9l2-3z"/><path d="M8 13h8"/></svg>',
		can: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l1 2v13l-1 2H7l-1-2V6z"/><path d="M6 8h12M6 17h12"/></svg>'
	},

	css: function () {
		return '<style>' +
			'.hsl{font:13px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937}' +
			'.hsl-head{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border-radius:10px;background:linear-gradient(135deg,#8b1d1d,#c2410c);color:#fff}' +
			'.hsl-head small{opacity:.85;display:block;font-size:11px}' +
			'.hsl-head b{font-size:14px}' +
			'.hsl-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}' +
			'.hsl-tile{position:relative;border:1px solid #f1e3d3;border-radius:10px;padding:6px 8px;background:#fffaf5;display:flex;flex-direction:column;gap:3px}' +
			'.hsl-tile.td{border-color:#fdba74;background:#fff7ed}' +
			'.hsl-tile.td:after{content:"★";position:absolute;top:3px;right:6px;color:#ea580c;font-size:11px}' +
			'.hsl-tile .t{display:flex;align-items:center;gap:6px;color:#b45309;font-weight:600}' +
			'.hsl-tile .t span{color:#1f2937;font-size:12px;line-height:1.1}' +
			'.hsl-tile .u{font-size:11px;color:#9ca3af}' +
			'.hsl-tile input{width:100%;box-sizing:border-box;padding:5px 6px;border:1px solid #e5e7eb;border-radius:6px;font-size:15px;text-align:right;font-variant-numeric:tabular-nums}' +
			'.hsl-tile input:focus{outline:none;border-color:#c2410c;box-shadow:0 0 0 2px #fed7aa}' +
			'.hsl-tile .v{font-size:20px;font-weight:700;text-align:right;color:#8b1d1d;font-variant-numeric:tabular-nums}' +
			'.hsl-total{display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border-radius:10px;background:#fff8f1;border:1px solid #fde2c4}' +
			'.hsl-total b{font-size:20px;color:#8b1d1d;font-variant-numeric:tabular-nums}' +
			'.hsl-note{font-size:11px;color:#6b7280;margin-top:6px}' +
			'.hsl-wrap{position:relative;box-sizing:border-box;height:100%;padding:10px 12px}.hsl-wrap .hsl{display:flex;flex-direction:column;gap:8px;height:100%}.hsl-wrap .hsl-note{margin-top:0}' +
			'.hsl-bar{display:flex;align-items:center;justify-content:space-between;gap:8px}.hsl-bar b{font-size:13px}' +
			'.hsl-add{border:1px solid #fdba74;background:#fff7ed;color:#9a3412;border-radius:8px;padding:7px 14px;font:600 13px system-ui,sans-serif;cursor:pointer}.hsl-add:hover{background:#ffedd5}' +
			'.hsl-empty{padding:16px 12px;border-radius:10px;background:#fffaf5;border:1px dashed #fdba74;color:#9a3412;text-align:center;font-size:12.5px}.hsl-empty[hidden]{display:none}' +
			'.hsl-list{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px}' +
			'.hsl-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid #f1e3d3;border-radius:10px;background:#fffaf5}.hsl-row.td{border-color:#fdba74;background:#fff7ed}' +
			'.hsl-row .n{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#1f2937}.hsl-row .n>span:not(.s){overflow:hidden;text-overflow:ellipsis}.hsl-row .s{color:#ea580c;font-size:13px}.hsl-row .u{font-size:11px;color:#9ca3af}' +
			'.hsl-row input{width:92px;box-sizing:border-box;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;font-size:15px;text-align:right;font-variant-numeric:tabular-nums}.hsl-row input:focus{outline:none;border-color:#c2410c;box-shadow:0 0 0 2px #fed7aa}' +
			'.hsl-td{flex:none;display:inline-flex;align-items:center;gap:3px;padding:4px 7px;border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#9ca3af;font-size:11.5px;font-weight:600;cursor:pointer;user-select:none;white-space:nowrap}.hsl-td input{position:absolute;opacity:0;width:0;height:0}.hsl-td b{font-size:14px;line-height:1}.hsl-td:has(input:checked),.hsl-td.on{border-color:#fdba74;background:#ffedd5;color:#c2410c}.hsl-td:has(input:focus-visible){box-shadow:0 0 0 2px #fed7aa}' +
			'.hsl-x{width:26px;height:26px;border:0;border-radius:50%;background:transparent;color:#9ca3af;font:700 12px system-ui;cursor:pointer}.hsl-x:hover{background:#fee2e2;color:#dc2626}' +
			'.hsl-pk{position:absolute;inset:0;z-index:5;box-sizing:border-box;background:#fff;padding:10px 12px;display:flex;flex-direction:column;gap:8px}.hsl-pk-h{display:flex;align-items:center;justify-content:space-between}.hsl-pk-h b{font-size:14px}' +
			'.hsl-pk input[type=text]{box-sizing:border-box;width:100%;padding:7px 9px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px}' +
			'.hsl-pk-list{flex:1;min-height:0;overflow:auto;border:1px solid #f1e3d3;border-radius:10px}' +
			'.hsl-pk-i{display:flex;align-items:center;gap:10px;margin:0;padding:8px 10px;border-bottom:1px solid #f5ebe0;cursor:pointer}.hsl-pk-i:hover{background:#fff7ed}.hsl-pk-i[hidden]{display:none}.hsl-pk-i input{flex:none;width:18px;height:18px;accent-color:#c2410c}.hsl-pk-i span{flex:1;min-width:0;font-size:13px;font-weight:600}.hsl-pk-i small{display:block;font-size:11px;font-weight:400;color:#9ca3af}.hsl-pk-i em{font-style:normal;color:#ea580c}' +
			'.hsl-pk-f{display:flex;align-items:center;justify-content:space-between;gap:10px}.hsl-pk-f small{font-size:12px;color:#6b7280}' +
			'</style>';
	},

	esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); },

	head: function (emp, thang, nam, label) {
		return '<div class="hsl-head"><div><small>Nhân viên</small><b>' + this.esc(emp) + '</b></div>' +
			'<div style="text-align:right"><small>' + label + '</small><b>Tháng ' + thang + '/' + nam + '</b></div></div>';
	},

	iconSP: function (sp) { return /\blon\b/i.test(sp.tensanpham || "") ? this.ICON.can : this.ICON.bottle; },

	popupW: function () { return Math.min(480, window.innerWidth - 16); },

	popupH: function (soSP, extra) {
		var rows = Math.max(1, Math.ceil(soSP / 3));
		return Math.min(150 + rows * 92 + extra, window.innerHeight - 20);
	},

	// Ẩn thanh cuộn của khung popup chứa form
	anCuon: function () {
		setTimeout(function () {
			var el = document.querySelector(".hsl");
			while (el && el !== document.body) {
				el.style.overflow = "hidden";
				if (el.id === "w2ui-popup" || el.classList.contains("w2ui-popup")) break;
				el = el.parentElement;
			}
		}, 50);
	},

	taiSanPham: function (cb) {
		var me = this;
		NUT.ds.select({
			url: me.url + "data/sanpham"
		}, function (res) {
			if (!res.success) return cb(false);
			me.dsSanPham = res.result.slice().sort(function (a, b) {
				return String(a.tensanpham || a.masanpham).localeCompare(String(b.tensanpham || b.masanpham), "vi");
			});
			cb(true);
		});
	},

	timChiTieu: function (ky, cb) {
		NUT.ds.select({
			url: this.url + "data/chitieu",
			where: [["manhanvien", "=", ky.emp], ["nam", "=", ky.nam], ["thang", "=", ky.thang]]
		}, cb);
	},

	timChiTiet: function (ids, cb) {
		NUT.ds.select({
			url: this.url + "data/chitieu_ct",
			where: [["idchitieu", "in", ids]]
		}, cb);
	},

	// Mỗi đối tác (madoitac) một phiếu chitieu. Trả về: dsPhieu (mọi phiếu trong tháng), ct (chi tiết của các phiếu đó).
	// Phiếu có nhưng chưa có chi tiết (ghi lỗi giữa chừng) coi như chưa khoán
	docKhoan: function (ky, cb) {
		var me = this;
		me.timChiTieu(ky, function (res) {
			if (!res.success) return cb(false);
			var dsPhieu = res.result || [];
			if (!dsPhieu.length) return cb(true, dsPhieu, []);
			me.timChiTiet(dsPhieu.map(function (p) { return p.idchitieu; }), function (r2) {
				if (!r2.success) return cb(false);
				cb(true, dsPhieu, r2.result || []);
			});
		});
	},

	// Menu isopen được gọi đúng 1 lần khi mở ứng dụng, trước mọi lần bấm tay
	laTuBat: function () {
		var cfg = n$.app.appConfig;
		if (this.cfgDaChay === cfg) return false;
		this.cfgDaChay = cfg;
		return !!cfg && (cfg.menus || []).some(function (m) { return String(m.execname || "").toLowerCase() === "hrmssanluongkhoandutinh" && m.isopen; });
	},

	coBuoiChamCong: function (ky, cb) {
		NUT.ds.select({
			url: this.url + "data/chamcong",
			select: "thoigianden",
			limit: 100,
			where: [["manhanvien", "=", ky.emp], ["nam", "=", ky.nam], ["thang", "=", ky.thang], ["dulieu", "=", 0]]
		}, function (res) {
			cb(res.success, res.success && res.result.some(function (r) { return !!r.thoigianden; }));
		});
	},

	run: function (p, target) {
		var me = HrmsSanLuongKhoanDuTinh;
		me.url = NUT.services[me.SERVICE_ID].url;
		var now = new Date();
		var emp = me.EMP();
		var tuBat = me.laTuBat();
		if (!emp) { if (!tuBat) NUT.notify("Tài khoản chưa được gán mã nhân viên!", "red"); return; }
		me.ky = { emp: emp, nam: now.getFullYear(), thang: now.getMonth() + 1 };

		me.taiSanPham(function (okSP) {
			if (!okSP) { if (!tuBat) NUT.notify("Lỗi đọc danh mục sản phẩm!", "red"); return; }
			me.docKhoan(me.ky, function (ok, phieu, ct) {
				if (!ok) { if (!tuBat) NUT.notify("Lỗi đọc chỉ tiêu!", "red"); return; }
				if (ct.length) { if (!tuBat) me.xemChiTieu(phieu, ct); return; }
				me.moFormNhap();
			});
		});
	},

	// Form nhập khoán: bấm ＋ chọn sản phẩm từ danh mục (sanpham), mỗi sản phẩm một dòng nhập chỉ tiêu; người dùng tự tích ★ trọng điểm cho từng dòng (lưu vào chitieu_ct.trongdiem)
	moFormNhap: function () {
		var me = HrmsSanLuongKhoanDuTinh;
		if (!me.dsSanPham.length) { NUT.notify("Chưa có sản phẩm nào trong danh mục!", "red"); return; }
		me.dong = []; me.kseq = 0;
		NUT.w2popup.open({
			title: '🎯 <i>Sản lượng khoán</i>',
			modal: true,
			showClose: false,
			keyboard: false,
			width: me.popupW(),
			height: Math.min(560, window.innerHeight - 20),
			body: '<div class="hsl-wrap">' + me.css() + '<div class="hsl">' + me.head(me.ky.emp, me.ky.thang, me.ky.nam, "Nhập khoán") +
				'<div class="hsl-bar"><b>Sản phẩm khoán</b><button type="button" class="hsl-add" onclick="HrmsSanLuongKhoanDuTinh.moChon()">＋ Thêm sản phẩm</button></div>' +
				'<div id="hsl_empty" class="hsl-empty">Chưa có sản phẩm. Bấm “＋ Thêm sản phẩm” để chọn sản phẩm và nhập chỉ tiêu.</div>' +
				'<div id="hsl_list" class="hsl-list"></div>' +
				'<div class="hsl-total"><span>Tổng khoán</span><b id="hsl_sum">0</b></div>' +
				'<div class="hsl-note">Tích ★ để đánh dấu sản phẩm trọng điểm của bạn trong tháng. Nhập chỉ tiêu tại đầu tháng dành cho nhân viên, sau khi xác nhận bạn có thể liên hệ quản lý để cập nhật.</div>' +
				'<div class="hsl-note">Sản lượng khoán: ghi theo két/thùng.</div></div></div>',
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Hủy</button>' +
				'<button id="hsl_ok" class="w2ui-btn w2ui-btn-blue" onclick="HrmsSanLuongKhoanDuTinh.doKhoanSanLuong()">✔️ Xác nhận</button>'
		});
		me.anCuon();
	},

	dongHtml: function (it) {
		var me = HrmsSanLuongKhoanDuTinh, sp = it.sp;
		return '<div class="hsl-row" id="hsl_r_' + it.k + '"><span class="n">' + me.iconSP(sp) + '<span>' + me.esc(sp.tensanpham || sp.masanpham) + '</span></span>' +
			'<label class="hsl-td" title="Đánh dấu sản phẩm trọng điểm"><input type="checkbox" id="hsl_td_' + it.k + '" onchange="HrmsSanLuongKhoanDuTinh.doiTD(' + it.k + ', this.checked)"><b>★</b>Trọng điểm</label>' +
			'<input type="number" min="0" step="1" inputmode="numeric" id="hsl_v_' + it.k + '" placeholder="0" oninput="HrmsSanLuongKhoanDuTinh.sumLive()"><span class="u">két</span>' +
			'<button type="button" class="hsl-x" title="Bỏ sản phẩm" aria-label="Bỏ sản phẩm" onclick="HrmsSanLuongKhoanDuTinh.boSP(' + it.k + ')">✕</button></div>';
	},

	// tích / bỏ tích trọng điểm trên một dòng
	doiTD: function (k, on) {
		var r = document.getElementById("hsl_r_" + k), l = r && r.querySelector(".hsl-td");
		if (r) r.classList.toggle("td", !!on);
		if (l) l.classList.toggle("on", !!on);
	},

	capNhatTrong: function () {
		var e = document.getElementById("hsl_empty"); if (e) e.hidden = this.dong.length > 0;
	},

	boSP: function (k) {
		var me = HrmsSanLuongKhoanDuTinh;
		me.dong = me.dong.filter(function (it) { return it.k !== k; });
		var r = document.getElementById("hsl_r_" + k); if (r && r.parentNode) r.parentNode.removeChild(r);
		me.capNhatTrong(); me.sumLive();
	},

	// danh sách chọn sản phẩm (chưa thêm)
	moChon: function () {
		var me = HrmsSanLuongKhoanDuTinh;
		var co = {}; me.dong.forEach(function (it) { co[it.sp.masanpham] = 1; });
		var ds = me.dsSanPham.filter(function (sp) { return !co[sp.masanpham]; });
		var wrap = document.querySelector(".hsl-wrap");
		if (!wrap || document.getElementById("hsl_pk")) return;
		if (!ds.length) { NUT.notify("Đã thêm hết sản phẩm trong danh mục.", "yellow"); return; }
		me.dsChon = ds;
		wrap.insertAdjacentHTML("beforeend", '<div class="hsl-pk" id="hsl_pk" role="dialog" aria-label="Chọn sản phẩm">' +
			'<div class="hsl-pk-h"><b>Chọn sản phẩm</b><button type="button" class="hsl-x" title="Đóng" aria-label="Đóng" onclick="HrmsSanLuongKhoanDuTinh.dongChon()">✕</button></div>' +
			'<input type="text" id="hsl_pk_q" autocomplete="off" placeholder="Tìm theo tên hoặc mã sản phẩm…" oninput="HrmsSanLuongKhoanDuTinh.locChon(this.value)">' +
			'<div class="hsl-pk-list">' + ds.map(function (sp, i) {
				return '<label class="hsl-pk-i" data-q="' + me.esc(((sp.tensanpham || "") + " " + sp.masanpham).toLowerCase()) + '"><input type="checkbox" value="' + i + '" onchange="HrmsSanLuongKhoanDuTinh.demChon()">' +
					'<span>' + me.esc(sp.tensanpham || sp.masanpham) + '<small>' + me.esc(sp.masanpham) + (sp.madoitac ? ' · ' + me.esc(sp.madoitac) : '') + '</small></span></label>';
			}).join("") + '</div>' +
			'<div class="hsl-pk-f"><small id="hsl_pk_n">Chưa chọn sản phẩm nào</small><button type="button" class="w2ui-btn w2ui-btn-blue" id="hsl_pk_ok" disabled onclick="HrmsSanLuongKhoanDuTinh.themChon()">Thêm vào</button></div></div>');
		var q = document.getElementById("hsl_pk_q"); if (q) q.focus();
	},

	dongChon: function () {
		var pk = document.getElementById("hsl_pk"); if (pk && pk.parentNode) pk.parentNode.removeChild(pk);
		this.dsChon = null;
	},

	locChon: function (q) {
		q = String(q || "").toLowerCase().trim();
		Array.prototype.forEach.call(document.querySelectorAll("#hsl_pk .hsl-pk-i"), function (l) { l.hidden = !!q && l.getAttribute("data-q").indexOf(q) < 0; });
	},

	demChon: function () {
		var n = document.querySelectorAll("#hsl_pk .hsl-pk-i input:checked").length, ok = document.getElementById("hsl_pk_ok"), lab = document.getElementById("hsl_pk_n");
		if (lab) lab.textContent = n ? "Đã chọn " + n + " sản phẩm" : "Chưa chọn sản phẩm nào";
		if (ok) { ok.disabled = !n; ok.textContent = n ? "Thêm " + n + " sản phẩm" : "Thêm vào"; }
	},

	themChon: function () {
		var me = HrmsSanLuongKhoanDuTinh, list = document.getElementById("hsl_list"), ds = me.dsChon;
		if (!list || !ds) return;
		var dau = null;
		Array.prototype.forEach.call(document.querySelectorAll("#hsl_pk .hsl-pk-i input:checked"), function (b) {
			var sp = ds[Number(b.value)]; if (!sp) return;
			var it = { k: ++me.kseq, sp: sp };
			me.dong.push(it);
			list.insertAdjacentHTML("beforeend", me.dongHtml(it));
			if (!dau) dau = document.getElementById("hsl_v_" + it.k);
		});
		me.dongChon(); me.capNhatTrong(); me.sumLive();
		if (dau) dau.focus();
	},

	xemChiTieu: function (phieu, ct) {
		var me = HrmsSanLuongKhoanDuTinh;
		var n = function (v) { return parseInt(v) || 0; };
		var tenSP = {};
		me.dsSanPham.forEach(function (sp, i) { tenSP[sp.masanpham] = { sp: sp, i: i }; });
		ct = ct.slice().sort(function (a, b) {
			var ia = tenSP[a.masanpham] ? tenSP[a.masanpham].i : 999, ib = tenSP[b.masanpham] ? tenSP[b.masanpham].i : 999;
			return (b.trongdiem ? 1 : 0) - (a.trongdiem ? 1 : 0) || ia - ib;
		});
		var sum = 0;
		var tiles = ct.map(function (r) {
			var sp = tenSP[r.masanpham] ? tenSP[r.masanpham].sp : { masanpham: r.masanpham, tensanpham: r.masanpham };
			sum += n(r.soluong);
			return '<div class="hsl-tile' + (r.trongdiem ? ' td' : '') + '"' + (r.trongdiem ? ' title="Sản phẩm trọng điểm"' : '') + '><span class="t">' + me.iconSP(sp) + '<span>' + me.esc(sp.tensanpham || sp.masanpham) + '</span></span>' +
				'<span class="v">' + n(r.soluong).toLocaleString("vi-VN") + '</span><span class="u" style="text-align:right">két</span></div>';
		}).join("");
		NUT.w2popup.open({
			title: '🎯 <i>Sản lượng khoán</i>',
			modal: true,
			width: me.popupW(),
			height: me.popupH(ct.length, 50), // chiều cao form xem
			body: '<div style="padding:10px 12px">' + me.css() + '<div class="hsl">' + me.head(me.ky.emp, me.ky.thang, me.ky.nam, "Đã khoán") +
				'<div class="hsl-grid">' + tiles + '</div>' +
				'<div class="hsl-total"><span>Tổng khoán</span><b>' + sum.toLocaleString("vi-VN") + '</b></div></div></div>',
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Đóng</button>'
		});
		me.anCuon();
	},

	sumLive: function () {
		var s = 0;
		this.dong.forEach(function (it) {
			var e = document.getElementById("hsl_v_" + it.k);
			var v = e ? parseInt(e.value) : 0;
			if (v > 0) s += v;
		});
		var e = document.getElementById("hsl_sum"); if (e) e.textContent = s.toLocaleString("vi-VN");
	},

	doKhoanSanLuong: function () {
		var me = HrmsSanLuongKhoanDuTinh;
		if (!me.dong.length) { NUT.notify("Bấm “＋ Thêm sản phẩm” để chọn sản phẩm cần khoán.", "yellow"); return; }
		var dong = [], thieu = [];
		me.dong.forEach(function (it) {
			var v = parseInt(document.getElementById("hsl_v_" + it.k).value);
			var td = document.getElementById("hsl_td_" + it.k);
			if (v > 0) dong.push({ masanpham: it.sp.masanpham, madoitac: it.sp.madoitac || "", soluong: v, trongdiem: !!(td && td.checked) });
			else thieu.push(it.sp.tensanpham || it.sp.masanpham);
		});
		if (thieu.length) { NUT.notify("Nhập chỉ tiêu (lớn hơn 0) cho: " + thieu.join(", ") + ".", "yellow"); return; }
		var khongDT = dong.filter(function (d) { return !d.madoitac; });
		if (khongDT.length) { NUT.notify("Sản phẩm chưa gán đối tác trong danh mục: " + khongDT.map(function (d) { return d.masanpham; }).join(", ") + ".", "red"); return; }

		// Bảng chitieu bắt buộc madoitac → mỗi đối tác một phiếu
		var nhom = {}, dsDT = [];
		dong.forEach(function (d) {
			if (!nhom[d.madoitac]) { nhom[d.madoitac] = []; dsDT.push(d.madoitac); }
			nhom[d.madoitac].push(d);
		});

		var btn = document.getElementById("hsl_ok");
		var baoLoi = function (msg, chiTiet) {
			if (btn) btn.disabled = false;
			if (chiTiet && typeof chiTiet === "string") console.warn("HrmsSanLuongKhoanDuTinh:", chiTiet);
			NUT.notify(msg, "red");
		};
		if (btn) btn.disabled = true;

		var ghiChiTiet = function (idchitieu, ds, cb) {
			var data = ds.map(function (d) { return { idchitieu: idchitieu, masanpham: d.masanpham, soluong: d.soluong, trongdiem: d.trongdiem }; });
			NUT.ds.insert({ url: me.url + "data/chitieu_ct", data: data }, function (r) {
				if (!r || !r.success) return baoLoi("Ghi chi tiết chỉ tiêu thất bại, vui lòng thử lại!", r && r.result);
				cb();
			});
		};

		// Lấy id phiếu vừa tạo; nếu API không trả id thì đọc lại phiếu mới nhất của đối tác đó
		var layIdMoi = function (res, madoitac, cb) {
			var r = res && res.result;
			var id = Array.isArray(r) ? r[0] : r;
			if (id && typeof id === "object") id = id.idchitieu;
			if (parseInt(id) > 0) return cb(parseInt(id));
			me.timChiTieu(me.ky, function (r2) {
				var ds = r2.success ? r2.result.filter(function (p) { return p.madoitac === madoitac; }) : [];
				cb(ds.length ? Math.max.apply(null, ds.map(function (p) { return parseInt(p.idchitieu) || 0; })) : null);
			});
		};

		// Kiểm tra lại trước khi ghi: có thể đã nhập ở tab/thiết bị khác
		me.docKhoan(me.ky, function (ok, dsPhieu, ct) {
			if (!ok) return baoLoi("Lỗi kiểm tra chỉ tiêu, vui lòng thử lại!");
			if (ct.length) {
				NUT.notify("Tháng này đã khoán, không thể nhập thêm.", "yellow");
				NUT.w2popup.close();
				return;
			}
			var phieuCu = {};
			dsPhieu.forEach(function (p) { if (!phieuCu[p.madoitac]) phieuCu[p.madoitac] = p.idchitieu; });

			var i = 0;
			var tiep = function () {
				if (i >= dsDT.length) {
					NUT.notify("Đã ghi nhận sản lượng khoán.", "lime");
					NUT.w2popup.close();
					return;
				}
				var dt = dsDT[i++];
				// phiếu trống còn sót từ lần ghi lỗi trước thì dùng lại
				if (phieuCu[dt]) return ghiChiTiet(phieuCu[dt], nhom[dt], tiep);
				NUT.ds.insert({
					url: me.url + "data/chitieu",
					returnid: true, // API chỉ nhận true/false, không nhận tên cột
					data: { manhanvien: me.ky.emp, nam: me.ky.nam, thang: me.ky.thang, madoitac: dt }
				}, function (res) {
					if (!res || !res.success) return baoLoi("Khoán sản lượng thất bại, vui lòng thử lại!", res && res.result);
					layIdMoi(res, dt, function (id) {
						if (!id) return baoLoi("Không lấy được mã phiếu chỉ tiêu, vui lòng thử lại!");
						ghiChiTiet(id, nhom[dt], tiep);
					});
				});
			};
			tiep();
		});
	}
};