// Phiếu lương nhân viên: thu nhập, khấu trừ tính theo công thức; số đã chuyển, giảm trừ khác lấy từ diluong
var HrmsBaoCaoPhieuLuongNV = {
	// Cấu hình
	SERVICE_ID: 3,
	EMP: function () { return String(n$.user.tag || "").trim(); },
	url: null,
	cacLan: [],
	TIEU_DE_POPUP: 4,

	THU: [["luongcoban", "Lương cơ bản"], ["pcthamnien", "Phụ cấp thâm niên"], ["pcxangxe", "Phụ cấp xăng xe"],
		["pctrangdiem", "Phụ cấp trang điểm"], ["pcdienthoai", "Phụ cấp điện thoại"], ["pckhuvuc", "Phụ cấp khu vực"],
		["kpi1", "KPI 1"], ["kpi2", "KPI 2"], ["kpi3", "KPI 3"], ["sinhnhat", "Sinh nhật"],
		["letet", "Lễ tết"], ["hotroluong", "Hỗ trợ"]],
	TRU: [["bhxh", "BHXH"], ["congdoan", "Công đoàn"], ["thuetncn", "Thuế TNCN"], ["giamtrukhac", "Giảm trừ khác"]],

	LUUY: ["Những trường hợp không đóng bảo hiểm (thử việc, part-time, không đủ ngày công,…) sẽ tạm trích trừ 10% thuế TNCN.",
		"Chi trả BHYT đối với người lao động chưa đủ công để đóng BHXH."],
	LUUY_MUC: {},

	// Giao diện
	css: function () {
		return '<style>' +
			'.w2ui-popup:has(.hpl-wrap) .w2ui-popup-title,.w2ui-popup:has(.hpl-wrap) .w2ui-popup-title-btns{display:none!important}.w2ui-popup:has(.hpl-wrap) .w2ui-box,.w2ui-popup:has(.hpl-wrap) .w2ui-popup-body{top:0!important}' +
			'.hpl-ten{display:flex;align-items:center;flex-wrap:wrap;gap:10px;min-width:0;padding:6px 14px;border-radius:10px;background:linear-gradient(135deg,#8b1d1d,#c2410c);color:#fff}.hpl-dong{flex:none;width:36px;height:36px;margin:-2px -6px -2px 0;padding:0;border:0;border-radius:50%;background:none;color:#475569;font:500 30px/36px system-ui;touch-action:manipulation;cursor:pointer;transition:color .18s,transform .18s}.hpl-dong:hover{color:#b91c1c;transform:scale(1.15)}.hpl-dong:focus-visible{outline:2px solid #94a3b8;outline-offset:2px}' +
			'.hpl-wrap{--py:5px;padding:10px 12px;height:100%;overflow:auto;box-sizing:border-box}' +
			'.hpl{font:14px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937}' +
			'.hpl-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}' +
			'.hpl-title h2{margin:0;color:#fff!important;font-size:16px;font-weight:700;letter-spacing:.04em}.hpl-title span{flex:none;padding:0 0 0 10px;border-left:1px solid rgba(255,255,255,.55);color:#fff;font-size:14px;font-weight:600;line-height:1.2}' +
			'.hpl-nv{margin:0 2px 10px}.hpl-nv-ten{font-size:17px;font-weight:700;line-height:1.25;color:#111827}.hpl-nv-phu{margin-top:2px;color:#6b7280;font-size:12.5px;line-height:1.3}.hpl-nv-phu b{color:#374151;font-weight:600}' +
			'.hpl-chiso{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}.hpl-chiso>div{padding:6px 10px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;text-align:center}' +
			'.hpl-chiso span{display:block;margin-bottom:2px;color:#6b7280;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hpl-chiso b{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}.hpl-chiso small{color:#6b7280;font-size:11.5px;font-weight:400}' +
			'.hpl-chiso em{display:inline-block;margin-left:6px;padding:0 6px;border-radius:999px;font-size:11.5px;font-style:normal;font-weight:700;line-height:17px;vertical-align:1px}.hpl-chiso em.dat{background:#dcfce7;color:#047857}.hpl-chiso em.gan{background:#fef3c7;color:#b45309}.hpl-chiso em.chua{background:#fee2e2;color:#b91c1c}' +
			'.hpl-bang{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}' +
			'.hpl-tbl{width:100%;border-collapse:collapse}.hpl-tbl th,.hpl-tbl td{padding:var(--py) 12px;border-bottom:1px solid #f1f5f9;font-weight:400;text-align:left}.hpl-tbl tr>:nth-child(3){border-left:1px solid #e5e7eb}' +
			'.hpl-tbl col:nth-child(1){width:33%}.hpl-tbl col:nth-child(2),.hpl-tbl col:nth-child(4){width:19%}.hpl-tbl col:nth-child(3){width:29%}' +
			'.hpl-tbl thead th{padding-top:6px;padding-bottom:6px;font-size:12px;font-weight:700;text-align:center;letter-spacing:.02em;border-bottom:1px solid #e5e7eb}.hpl-tbl th.thu{background:#ecfdf5;color:#047857}.hpl-tbl th.tru{background:#fef2f2;color:#b91c1c}' +
			'.hpl-tbl td.s{text-align:right;white-space:nowrap;font-weight:600;font-variant-numeric:tabular-nums}.hpl-tbl td.z{color:#b6c0cc;font-weight:400}.hpl-tbl td.trong{border-bottom:0}' +
			'.hpl-tbl tfoot td{background:#f8fafc;font-weight:700;border-top:1px solid #e5e7eb;border-bottom:0}.hpl-tbl tfoot td.thu{color:#047857}.hpl-tbl tfoot td.tru{color:#b91c1c}' +
			'.hpl-tbl td.net{padding:0;border:0;white-space:normal}.hpl-net{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 12px;background:linear-gradient(135deg,#047857,#059669);color:#fff}' +
			'.hpl-net span{font-weight:700;letter-spacing:.03em}.hpl-net b{flex:none;font-size:18px;font-weight:700;line-height:1.15;font-variant-numeric:tabular-nums}' +
			'.hpl-ct{margin-top:8px;padding:0 4px;font-size:12.5px;line-height:1.45;color:#374151}.hpl-ct div{display:flex;gap:6px}.hpl-ct div>span:first-child{flex:none;min-width:68px;color:#6b7280}.hpl-ct b{font-variant-numeric:tabular-nums}' +
			'.hpl-luuy{margin-top:8px;padding:6px 4px 0;border-top:1px dashed #e5e7eb;color:#6b7280;font-size:11.5px;line-height:1.35}.hpl-luuy b{color:#9a3412}.hpl-luuy div{display:flex;gap:4px}.hpl-luuy div span{flex:none}.hpl-sn{color:#b91c1c;font-size:10px;font-weight:600}' +
			'.hpl-canh{margin-top:10px;padding:6px 10px;border-radius:8px;background:#fff7ed;border:1px solid #fdba74;color:#9a3412;font-size:12.5px;line-height:1.4}' +
			'@media (max-width:480px){.hpl-wrap{padding:8px}.hpl{font-size:12.5px}.hpl-tbl col{width:auto!important}.hpl-tbl th,.hpl-tbl td{padding-left:5px;padding-right:5px;font-size:12px}.hpl-tbl thead .m{display:none}.hpl-tbl thead th{font-size:11px}' +
			'.hpl-title{margin-bottom:8px}.hpl-ten{padding:5px 12px}.hpl-title h2{font-size:15px}.hpl-title span{font-size:12.5px}.hpl-nv{margin-bottom:8px}.hpl-nv-ten{font-size:15px}.hpl-nv-phu{font-size:11.5px}' +
			'.hpl-chiso{gap:5px;margin-bottom:8px}.hpl-chiso>div{padding:5px 7px}.hpl-chiso span{font-size:10.5px}.hpl-chiso b{font-size:12.5px;white-space:normal}.hpl-chiso em{display:table;margin:2px auto 0}' +
			'.hpl-net{padding:7px 8px}.hpl-net b{font-size:16px}.hpl-ct{font-size:11.5px}.hpl-ct div>span:first-child{min-width:58px}.hpl-luuy{margin-top:6px;font-size:11px}.hpl-canh{margin-top:6px;font-size:11.5px}}' +
			'@media (min-width:380px) and (max-width:480px){.hpl-tbl td{white-space:nowrap}}' +
			'.hpl-gon.hpl-wrap{padding:6px 10px}.hpl-gon .hpl{line-height:1.2}.hpl-gon .hpl-title{margin-bottom:6px}.hpl-gon .hpl-ten{padding:4px 12px}.hpl-gon .hpl-title h2{font-size:15px}.hpl-gon .hpl-title span{font-size:12.5px}.hpl-gon .hpl-dong{width:32px;height:32px;font-size:26px;line-height:32px}' +
			'.hpl-gon .hpl-nv{margin-bottom:6px}.hpl-gon .hpl-nv-ten{font-size:15px}.hpl-gon .hpl-chiso{margin-bottom:6px}.hpl-gon .hpl-chiso>div{padding:3px 8px}.hpl-gon .hpl-tbl thead th{padding-top:3px;padding-bottom:3px}' +
			'.hpl-gon .hpl-net{padding:5px 10px}.hpl-gon .hpl-net b{font-size:16px}.hpl-gon .hpl-ct{margin-top:4px;line-height:1.3}.hpl-gon .hpl-luuy{margin-top:4px;padding-top:4px;line-height:1.25}.hpl-gon .hpl-canh{margin-top:5px;padding:3px 8px;font-size:11.5px;line-height:1.2}' +
			'</style>';
	},

	bangChu: function (num) {
		num = Math.round(Math.abs(Number(num) || 0));
		if (window.num2vnword && num2vnword.convert) return num2vnword.convert(num);
		var so = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
		var doc3 = function (n, full) {
			var t = Math.floor(n / 100), c = Math.floor(n % 100 / 10), d = n % 10, s = [];
			if (full || t) s.push(so[t] + " trăm");
			if (c > 1) { s.push(so[c] + " mươi"); if (d == 1) s.push("mốt"); else if (d == 5) s.push("lăm"); else if (d) s.push(so[d]); }
			else if (c == 1) { s.push("mười"); if (d == 5) s.push("lăm"); else if (d) s.push(so[d]); }
			else if (d) { if (full || t) s.push("lẻ"); s.push(so[d]); }
			return s.join(" ");
		};
		if (!num) return "không";
		var dv = ["", " nghìn", " triệu", " tỷ"], parts = [], i = 0;
		while (num > 0) { var g = num % 1000; num = Math.floor(num / 1000); if (g) parts.unshift(doc3(g, num > 0) + dv[i % 4] + (i >= 4 && i % 4 == 0 ? " tỷ" : "")); i++; }
		return parts.join(" ").replace(/\s+/g, " ").trim();
	},

	// Luồng chính
	run: async function () {
		var me = HrmsBaoCaoPhieuLuongNV, ma = me.EMP();
		if (!ma) { NUT.notify("Tài khoản " + n$.user.username + " chưa được gán mã nhân viên (Tag).", "yellow"); return; }
		me.url = NUT.services[me.SERVICE_ID].url;
		var res = await me.sel("diluong", { limit: 36, where: ["manhanvien", "=", ma], orderby: "nam desc,thang desc" });
		if (res === null) { NUT.notify("Không đọc được dữ liệu lương.", "red"); return; }
		var rec = me.kyGanNhat(res), coDiLuong = !!rec;
		if (!rec) {
			var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1);
			rec = { manhanvien: ma, nam: d.getFullYear(), thang: d.getMonth() + 1 };
			me.cacLan = [];
		}
		var kq;
		try { kq = await me.tinhLuong(ma, rec); } catch (e) { kq = { loi: e && e.message || String(e) }; }
		if (!coDiLuong && kq.loi) { NUT.notify("Bạn chưa có phiếu lương. " + kq.loi, "yellow"); return; }
		kq.tamTinh = !coDiLuong;
		me.layHoTen(ma, function (hoten) { me.show(rec, hoten, kq); });
	},

	sel: function (bang, o) {
		var me = HrmsBaoCaoPhieuLuongNV;
		var nhay = function (w) {
			if (!Array.isArray(w)) return w;
			if (Array.isArray(w[0])) return w.map(nhay);
			if (String(w[1]).toLowerCase() === "in" && Array.isArray(w[2]))
				return [w[0], w[1], w[2].map(function (v) { return typeof v === "number" ? v : "'" + String(v).replace(/'/g, "''") + "'"; })];
			return w;
		};
		if (o && o.where) o = Object.assign({}, o, { where: nhay(o.where) });
		return new Promise(function (ok) {
			NUT.ds.select(Object.assign({ url: me.url + "data/" + bang }, o), function (r) {
				if (r && r.success) return ok(r.result || []);
				me.loiDoc = bang + ": " + (r && (r.result || r.error) || "lỗi không rõ");
				ok(null);
			});
		});
	},

	// Công thức
	// Biến: ngaycong, khoan, thucdat, khoantd, thucdattd, tyledat, tyletd, luongcoban, ngayphep, ngayle,
	//   thamnien, ngaylam, ngaybhxh, thangsinh, thang, nam, sotien (phụ cấp), các khoản đã tính (bhxh, tongthu…)
	// Hàm: MIN MAX ROUND ABS IF AND OR; nhận kiểu Excel (=, <>, %, ;)
	// Ô KPI: "kpi1 = …; kpi2 = …"
	BIEN_KPI: { congchuan: "k1", ngaycong: "k2", khoan: "k3", thucdat: "k4", khoantd: "k5", thucdattd: "k6", tacphong: "k7", tyledat: "k8", tyletd: "k9" },
	CONG_CHUAN: 26,
	DIEM_TAC_PHONG: 100,
	MA_PHEP: "P", MA_LE: "NL",
	// Công thức mặc định khi ô trong mucluong để trống
	CONG_THUC: {
		hotroluong: "MIN(ngayphep, 1)",
		letet: "0",
		sinhnhat: "bhxh>0 && thangsinh==thang ? 200000 : 0",
		bhxh: "nv = ngaybhxh>=12.5 && ngaycong+ngayle>=12.5 ? luongcoban*10.5% : 0; cty = nv>0 ? luongcoban*21.5% : 0",
		congdoan: "nv = bhxh>0 ? luongcoban*1% : 0; cty = bhxh>0 ? luongcoban*2% : 0",
		thuetncn: "bhxh==0 && tongthu-dienthoai>=2000000 ? (tongthu-dienthoai)*10% : 0"
	},
	DIEN_THOAI: /điện\s*thoại|dien\s*thoai|dienthoai|4g/i,
	PART_TIME: /part/i,

	tinhCT: function (bt, V) {
		var me = HrmsBaoCaoPhieuLuongNV, ten = {}, sai = false;
		Object.keys(me.BIEN_KPI).forEach(function (t) { ten[me.BIEN_KPI[t]] = t; });
		bt = String(bt == null ? "" : bt).trim().replace(/^=/, "").replace(/;\s*$/, "").replace(/;/g, ",").replace(/\bMath\./gi, "");
		if (!bt) return null;
		bt = bt.replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)").replace(/<>/g, "!=").replace(/([^<>=!])=(?!=)/g, "$1==");
		bt = bt.replace(/\b[a-z_]\w*\b/gi, function (w) {
			var t = w.toLowerCase();
			if (/^(min|max|round|if|and|or|abs)$/.test(t)) return "F." + t;
			if (ten[t]) t = ten[t];
			if (Object.prototype.hasOwnProperty.call(V, t)) return "V." + t;
			sai = true; return w;
		});
		if (sai || /[^\d\s.+\-*\/()?:<>=!&|,]/.test(bt.replace(/\b[FV]\.\w+/g, ""))) return null;
		var F = {
			min: Math.min, max: Math.max, abs: Math.abs,
			round: function (x, d) { var m = Math.pow(10, Number(d) || 0); return Math.round(x * m) / m; },
			"if": function (c, a, b) { return c ? a : b; },
			and: function () { return [].every.call(arguments, Boolean); },
			or: function () { return [].some.call(arguments, Boolean); }
		}, v;
		try { v = Number(eval("(" + bt + ")")); } catch (e) { return null; }
		return isFinite(v) ? v : null;
	},

	tinhKPI: function (ct, V) {
		var me = HrmsBaoCaoPhieuLuongNV, kq = { gt: {}, loi: [] };
		String(ct || "").split(";").forEach(function (p, i) {
			var m = p.match(/^\s*kpi\s*([1-4])\s*=([\s\S]*)$/i), so = m ? Number(m[1]) : i + 1, bt = (m ? m[2] : p).trim();
			if (!bt || so > 4) return;
			if ((/\b(khoan|k3)\b/i.test(bt) && !V.khoan) || (/\b(khoantd|k5)\b/i.test(bt) && !V.khoantd)) { kq.gt["kpi" + so] = 0; return; }
			var v = me.tinhCT(bt, V);
			if (v === null) kq.loi.push("KPI " + so); else kq.gt["kpi" + so] = Math.max(0, Math.round(v));
		});
		return kq;
	},

	// TODO TF: trả về các NVTT do TF quản lý để cộng khoán/sản lượng khu vực; tạm thời chỉ chính nhân viên
	dsNhanVienSanLuong: function (ma, vitri) { return Promise.resolve([ma]); },

	// Tính lương
	tinhLuong: async function (ma, rec) {
		var me = HrmsBaoCaoPhieuLuongNV, sel = me.sel;
		var n = function (v) { return Number(v) || 0; };
		var bit = function (v) { return v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true"; };
		var pad = function (x) { return (x < 10 ? "0" : "") + x; };
		var ngay = function (v) {
			if (!v) return "";
			var s = String(v);
			if (/T.*(Z|[+-]\d\d:?\d\d)$/i.test(s)) { var d = new Date(s); if (!isNaN(d)) return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
			return s.substring(0, 10);
		};
		var nam = Number(rec.nam), thang = Number(rec.thang), cuoiD = new Date(nam, thang, 0);
		var dau = nam + "-" + pad(thang) + "-01", cuoi = nam + "-" + pad(thang) + "-" + pad(cuoiD.getDate());

		// 1. Đọc dữ liệu
		var r = await Promise.all([
			sel("ba_ungvien", { select: "manhanvien,status,vitrilv,makhuvuc", where: ["manhanvien", "=", ma] }),
			sel("ba_hopdong", { select: "ngaybatdau,ngayketthuc,ngaythoiviec,vitrilv,makhuvuc,madoitac", where: ["manhanvien", "=", ma] }),
			sel("chamcong", { select: "ngay,chamcong", limit: 1000, where: [["manhanvien", "=", ma], ["nam", "=", nam], ["thang", "=", thang], ["dulieu", "=", 0]] }),
			sel("bangluong", { select: "idbangluong,tungay,denngay,madoitac,phisinhhoat", limit: 1000 })
		]);
		if (r.some(function (x) { return x === null; })) throw new Error("Không đọc được dữ liệu tính lương (" + me.loiDoc + ").");
		var uv = r[0].filter(function (x) { return x.status === "OFFICIAL"; })[0] || r[0][0] || {};
		var hdAll = r[1].filter(function (h) { var b = ngay(h.ngaybatdau); return b && b <= cuoi; });
		// 2. Hợp đồng tính lương
		var conHan = function (h) { var k = ngay(h.ngayketthuc); return !k || k >= dau ? 1 : 0; };
		var hd = hdAll.filter(function (h) { var t = ngay(h.ngaythoiviec); return !t || t >= dau; })
			.sort(function (a, b) { return (conHan(b) - conHan(a)) || (ngay(b.ngaybatdau) < ngay(a.ngaybatdau) ? -1 : 1); })[0] || {};
		var vitri = hd.vitrilv || uv.vitrilv, khuvuc = hd.makhuvuc || uv.makhuvuc || "", doitac = hd.madoitac || "";
		if (!vitri) throw new Error("Chưa có vị trí làm việc.");

		// 3. Ngày công, ngày phép (P), ngày lễ (NL)
		var theoNgay = {};
		r[2].forEach(function (c) { var d = ngay(c.ngay); theoNgay[d] = (theoNgay[d] || 0) + (parseFloat(c.chamcong) || 0); });
		var nc = Object.keys(theoNgay).reduce(function (s, d) { return s + Math.min(1, theoNgay[d]); }, 0);
		var demMa = function (ma2) { var d = {}; r[2].forEach(function (c) { if (String(c.chamcong || "").trim().toUpperCase() === ma2) d[ngay(c.ngay)] = 1; }); return Object.keys(d).length; };
		var ngayPhep = demMa(me.MA_PHEP), ngayLe = demMa(me.MA_LE);

		// 4. Thâm niên, ngày làm, điều kiện BHXH
		var batDau = ngay(hd.ngaybatdau), thamNien = 0, ngayLam = 0, ngayBHXH = 0;
		if (batDau) {
			var b = batDau.split("-").map(Number), bd = new Date(b[0], b[1] - 1, b[2]), NGAY = 864e5;
			thamNien = Math.max(0, (nam - b[0]) * 12 + (thang - b[1]) - (cuoiD.getDate() < b[2] ? 1 : 0));   // như DATEDIF(…,"m")
			var mot = new Date(b[0], b[1], b[2]); if (mot.getDate() !== b[2]) mot = new Date(b[0], b[1] + 1, 0);   // EDATE(+1 tháng)
			ngayLam = Math.round((cuoiD - bd) / NGAY) + 1;
			ngayBHXH = Math.round((cuoiD - mot) / NGAY) + 1;
		}
		var sn = await sel("ba_ungvien", { select: "manhanvien,ngaysinh", where: ["manhanvien", "=", ma] });
		var ngaySinh = ngay(((sn || []).filter(function (x) { return x.ngaysinh; })[0] || {}).ngaysinh), thangSinh = ngaySinh ? Number(ngaySinh.substring(5, 7)) : 0;

		// 5. Bảng lương, mức lương
		var kv = khuvuc ? await sel("khuvuc", { select: "makhuvuc,tenkhuvuc,phisinhhoat", where: ["makhuvuc", "=", khuvuc] }) : [];
		if (kv === null) throw new Error("Không đọc được khu vực (" + me.loiDoc + ").");
		var coPSH = function (x) { return x && x.phisinhhoat != null && x.phisinhhoat !== ""; };
		var psh = coPSH(kv[0]) ? Number(kv[0].phisinhhoat) : 0, tenPSH = "phí sinh hoạt " + (psh ? "cao" : "thấp");
		var tenKV = (kv[0] && kv[0].tenkhuvuc) || khuvuc || "chưa có khu vực";

		var bl = r[3].filter(function (b) {
			return (!ngay(b.tungay) || ngay(b.tungay) <= cuoi) && (!ngay(b.denngay) || ngay(b.denngay) >= dau) && (!doitac || !b.madoitac || b.madoitac === doitac);
		}).filter(function (b) { return !coPSH(b) || Number(b.phisinhhoat) === psh; })
			.sort(function (a, b) { return (coPSH(b) - coPSH(a)) || (ngay(b.tungay) < ngay(a.tungay) ? -1 : 1); });
		if (!bl.length) throw new Error("Không có bảng lương " + tenPSH + " hiệu lực tháng " + thang + "/" + nam + " (khu vực " + tenKV + ").");
		var ml = await sel("mucluong", { where: [["mavitrilv", "=", vitri], ["idbangluong", "in", bl.map(function (b) { return b.idbangluong; })]] });
		if (ml === null) throw new Error("Không đọc được mức lương.");
		var bang = bl.filter(function (b) { return ml.some(function (m) { return String(m.idbangluong) === String(b.idbangluong); }); })[0];
		if (!bang) throw new Error("Chưa khai mức lương cho vị trí " + vitri + " trong bảng lương " + tenPSH + " hiệu lực tháng " + thang + "/" + nam + " (khu vực " + tenKV + ").");
		var muc = ml.filter(function (m) { return String(m.idbangluong) === String(bang.idbangluong); })[0];

		// 6. Phụ cấp, khoán, sản lượng
		var dsNV = await me.dsNhanVienSanLuong(ma, vitri);
		var r2 = await Promise.all([
			sel("phucap", { where: [["mavitrilv", "=", vitri], ["idbangluong", "=", bang.idbangluong]] }),
			sel("loaiphucap", { select: "maloaiphucap,tenphucap,tinhtheongay", limit: 1000 }),
			sel("vitrilv", { select: "mavitrilv,tenvitrilv", where: ["mavitrilv", "=", vitri] }),
			sel("chitieu", { select: "idchitieu", limit: 1000, where: [["manhanvien", "in", dsNV], ["nam", "=", nam], ["thang", "=", thang]] }),
			sel("chamcong", { select: "idchamcong", limit: 5000, where: [["manhanvien", "in", dsNV], ["nam", "=", nam], ["thang", "=", thang], ["dulieu", "=", 0]] })
		]);
		if (r2.some(function (x) { return x === null; })) throw new Error("Không đọc được phụ cấp/sản lượng.");
		var idCT = r2[3].map(function (x) { return x.idchitieu; }), idCC = r2[4].map(function (x) { return x.idchamcong; });
		var r3 = await Promise.all([
			idCT.length ? sel("chitieu_ct", { select: "masanpham,soluong,trongdiem", limit: 5000, where: ["idchitieu", "in", idCT] }) : [],
			idCC.length ? sel("chamcong_ct", { select: "idchamcong,masanpham,daucuoi,soluong", limit: 20000, where: ["idchamcong", "in", idCC] }) : []
		]);
		if (r3.some(function (x) { return x === null; })) throw new Error("Không đọc được chỉ tiêu/sản lượng.");

		var td = {}, khoan = 0, khoanTD = 0;
		r3[0].forEach(function (x) { khoan += n(x.soluong); if (bit(x.trongdiem)) { td[x.masanpham] = 1; khoanTD += n(x.soluong); } });
		var lan = {}, ban = {};
		r3[1].forEach(function (x) {
			var key = x.idchamcong + "\u0001" + x.masanpham, it = lan[key] || (lan[key] = { sp: x.masanpham }), f = ["a", "c", "n"][Number(x.daucuoi)];
			if (f === "n") it.n = (it.n || 0) + Math.max(0, n(x.soluong));
			else if (f && it[f] == null) it[f] = Math.max(0, n(x.soluong));
		});
		Object.keys(lan).forEach(function (key) {
			var it = lan[key];
			if (it.c != null) ban[it.sp] = (ban[it.sp] || 0) + Math.max(0, n(it.a) + n(it.n) - it.c);
		});
		var dsSP = Object.keys(ban), ket = {};
		if (dsSP.length) {
			var sp = await sel("sanpham", { select: "masanpham,ket", limit: 5000, where: ["masanpham", "in", dsSP] });
			(sp || []).forEach(function (x) { ket[x.masanpham] = n(x.ket); });
		}
		var dat = 0, datTD = 0, thieuKet = [];
		dsSP.forEach(function (m) {
			if (!(ket[m] > 0)) thieuKet.push(m);
			var v = ket[m] > 0 ? ban[m] / ket[m] : ban[m]; dat += v; if (td[m]) datTD += v;
		});
		var lam = function (v) { return Math.round(v * 100) / 100; };
		var k = { k1: me.CONG_CHUAN, k2: nc, k3: lam(khoan), k4: lam(dat), k5: lam(khoanTD), k6: lam(datTD), k7: me.DIEM_TAC_PHONG };
		var pt = function (d, c) { return c > 0 ? Math.floor(d / c * 10000 + 1e-6) / 100 : 0; };
		k.k8 = pt(dat, khoan); k.k9 = pt(datTD, khoanTD);

		// 7. Tính các khoản
		var vt = r2[2][0] || {}, partTime = me.PART_TIME.test(String(vitri) + " " + (vt.tenvitrilv || ""));
		var CC = me.CONG_CHUAN, ncTinh = Math.min(nc, CC), thu = [], gt = {}, loiCT = [];
		var them = function (key, ten, v) { if (gt[key] == null) thu.push([key, ten]); gt[key] = (gt[key] || 0) + Math.round(v); };
		var lcb = n(muc.luongcoban) * (muc.hesoluong == null || muc.hesoluong === "" ? 1 : n(muc.hesoluong));

		var V = { luongcoban: lcb, ngayphep: ngayPhep, ngayle: ngayLe, thamnien: thamNien, ngaylam: ngayLam, ngaybhxh: ngayBHXH, thangsinh: thangSinh, thang: thang, nam: nam };
		Object.keys(me.BIEN_KPI).forEach(function (t) { V[t] = k[me.BIEN_KPI[t]]; });
		var ct = function (ma2, ten) {
			var bt = muc[ma2] != null && String(muc[ma2]).trim() !== "" ? muc[ma2] : me.CONG_THUC[ma2], v = me.tinhCT(bt, V);
			if (v === null) { loiCT.push(ten); v = 0; }
			return v;
		};
		var ctHai = function (ma2, ten) {
			var bt = String(muc[ma2] != null && String(muc[ma2]).trim() !== "" ? muc[ma2] : me.CONG_THUC[ma2]).trim().replace(/^=/, "");
			var kq2 = { nv: 0, cty: 0 }, coTen = /^(nv|nhanvien|cty|congty)\s*=/i.test(bt);
			var phan = coTen ? bt.split(/;\s*(?=(?:nv|nhanvien|cty|congty)\s*=)/i) : [bt];
			phan.forEach(function (p) {
				var m = p.match(/^\s*(nv|nhanvien|cty|congty)\s*=([\s\S]*)$/i), ai = m && /^c/i.test(m[1]) ? "cty" : "nv";
				var v = me.tinhCT(m ? m[2] : p, Object.assign({}, V, { nv: kq2.nv }));
				if (v === null) { loiCT.push(ten + (ai === "cty" ? " (công ty)" : "")); v = 0; }
				kq2[ai] = Math.max(0, Math.round(v));
			});
			return kq2;
		};

		var ngayHT = Math.max(0, ct("hotroluong", "Hỗ trợ lương"));
		them("luongcoban", "Lương cơ bản", partTime ? lcb * nc : lcb / CC * Math.min(nc, Math.max(0, CC - ngayHT)));

		var loai = {}, dienThoai = 0, tongPC = 0;
		r2[1].forEach(function (l) { loai[l.maloaiphucap] = l; });
		r2[0].forEach(function (p) {
			var ma2 = String(p.maloaiphucap || ""), l = loai[ma2] || {}, tien = n(p.sotien), ten = l.tenphucap || ma2, v;
			if (partTime) v = tien * nc;
			else if (bit(l.tinhtheongay)) v = tien / CC * ncTinh;
			else if (p.congthuc != null && String(p.congthuc).trim() !== "") {
				v = me.tinhCT(p.congthuc, Object.assign({}, V, { sotien: tien }));
				if (v === null) { loiCT.push(ten); v = 0; }
			} else v = tien;
			v = Math.round(v);
			them("pc_" + ma2, ten, v);
			tongPC += v;
			if (me.DIEN_THOAI.test(ma2 + " " + ten)) dienThoai += v;
		});
		V.dienthoai = dienThoai; V.phucap = tongPC;

		var kpi = me.tinhKPI(muc.kpi, V), soKPI = Object.keys(kpi.gt).length ? Math.max.apply(null, Object.keys(kpi.gt).map(function (x) { return Number(x.slice(3)); })) : 0;
		V.kpi = 0;
		for (var i = 1; i <= Math.max(soKPI, partTime ? 0 : 3); i++) { them("kpi" + i, "KPI " + i, kpi.gt["kpi" + i] || 0); V.kpi += kpi.gt["kpi" + i] || 0; }

		them("hotroluong", "Hỗ trợ lương" + (ngayHT ? " (" + ngayHT + " ngày)" : ""), partTime ? lcb * ngayHT : lcb / CC * ngayHT);
		V.hotroluong = gt.hotroluong;
		var tru = {}, cty = {}, h = ctHai("bhxh", "BHXH");
		tru.bhxh = h.nv; cty.bhxh = h.cty; V.bhxh = h.nv; V.bhxhcty = h.cty;
		them("letet", "Lễ tết", Math.max(0, ct("letet", "Lễ tết"))); V.letet = gt.letet;
		them("sinhnhat", "Sinh nhật", Math.max(0, ct("sinhnhat", "Sinh nhật"))); V.sinhnhat = gt.sinhnhat;
		V.tongthu = thu.reduce(function (s, x) { return s + gt[x[0]]; }, 0);
		h = ctHai("congdoan", "Công đoàn");
		tru.congdoan = h.nv; cty.congdoan = h.cty; V.congdoan = h.nv; V.congdoancty = h.cty;
		tru.thuetncn = Math.max(0, Math.round(ct("thuetncn", "Thuế TNCN")));

		return { thu: thu, gt: gt, tru: tru, cty: cty, k: k, loiKPI: kpi.loi.concat(loiCT), thieuKet: thieuKet, vitri: vt.tenvitrilv || vitri };
	},

	// Chọn kỳ diluong
	kyGanNhat: function (rows) {
		var me = HrmsBaoCaoPhieuLuongNV, now = new Date(), kyNay = now.getFullYear() * 12 + now.getMonth() + 1;
		var ky = function (r) { return Number(r.nam) * 12 + Number(r.thang); };
		var ds = rows.filter(function (r) { return ky(r) <= kyNay; });
		if (!ds.length) return null;
		var kyMax = Math.max.apply(null, ds.map(ky));
		var cungKy = ds.filter(function (r) { return ky(r) === kyMax; });
		cungKy.sort(function (a, b) { return (Number(a.lan) || 0) - (Number(b.lan) || 0); });
		var rec = Object.assign({}, cungKy[cungKy.length - 1]);
		[["sotien"]].concat(me.TRU).forEach(function (x) {
			rec[x[0]] = cungKy.reduce(function (s, r) { return s + (Number(r[x[0]]) || 0); }, 0);
		});
		rec.ghichu = cungKy.map(function (r) { return r.ghichu; }).filter(function (g, i, a) { return g && a.indexOf(g) === i; }).join("; ");
		me.cacLan = cungKy;
		return rec;
	},

	layHoTen: function (ma, callback) {
		var me = HrmsBaoCaoPhieuLuongNV;
		NUT.ds.select({ url: me.url + "data/ba_ungvien", select: "manhanvien,hoten,status", where: ["manhanvien", "=", ma] }, function (uv) {
			var ds = uv.success ? uv.result : [];
			var nv = ds.filter(function (x) { return x.status === "OFFICIAL" && x.hoten; })[0] || ds.filter(function (x) { return x.hoten; })[0];
			if (nv) return callback(nv.hoten);
			NUT.ds.select({ url: me.url + "data/nhanvien_v", select: "hoten", where: ["manhanvien", "=", ma] }, function (r) {
				callback(r.success && r.result.length ? r.result[0].hoten : "");
			});
		});
	},

	// Hiển thị phiếu
	show: function (rec, hoten, kq) {
		var me = HrmsBaoCaoPhieuLuongNV;
		var n = function (v) { return Number(v) || 0; };
		kq = kq || {};
		var THU = kq.thu || [], gt = kq.gt || {}, tru = kq.tru || {}, laTru = {};
		me.TRU.forEach(function (x) { laTru[x[0]] = 1; });
		var giaTri = function (key) { return laTru[key] ? n(tru[key] != null ? tru[key] : rec[key]) : n(gt[key]); };
		var fmt = function (v) { return n(v).toLocaleString("vi-VN"); };
		var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };
		var ngayVN = function (v) { return String(v || "").replace(/^(\d{4})-(\d{2})-(\d{2}).*/, "$3/$2/$1"); };
		var tong = function (ds) { return ds.reduce(function (s, x) { return s + giaTri(x[0]); }, 0); };
		var o = function (x) { return '<td>' + esc(x[1]) + (me.LUUY_MUC[x[0]] ? ' <sup class="hpl-sn">(' + me.LUUY_MUC[x[0]] + ')</sup>' : '') + '</td><td class="s' + (giaTri(x[0]) ? '' : ' z') + '">' + fmt(giaTri(x[0])) + '</td>'; };
		var soDong = Math.max(THU.length, me.TRU.length), dong = "";
		var cot = function (ds, i) { return i < ds.length ? o(ds[i]) : i === ds.length ? '<td class="trong" colspan="2" rowspan="' + (soDong - ds.length) + '"></td>' : ''; };
		for (var i = 0; i < soDong; i++) dong += '<tr>' + cot(THU, i) + cot(me.TRU, i) + '</tr>';
		var tongThu = tong(THU), tongTru = tong(me.TRU), conLai = tongThu - tongTru, daChuyen = n(rec.sotien);
		var coChiTiet = !!(tongThu || tongTru);
		var thucNhan = coChiTiet ? conLai : daChuyen, chu = me.bangChu(thucNhan);
		var nhieuLan = me.cacLan.length > 1, ten = String(hoten || rec.hoten || n$.user.fullname || "").trim();

		var canh = "";
		if (!coChiTiet && daChuyen) canh = "Thực nhận tạm theo số tiền đã chuyển.";
		var canhThem = [];
		if (kq.loi) canhThem.push("Chưa tính được lương: " + esc(kq.loi));
		if (kq.loiKPI && kq.loiKPI.length) canhThem.push("Công thức " + esc(kq.loiKPI.join(", ")) + " không hợp lệ nên tạm tính 0.");
		if (kq.thieuKet && kq.thieuKet.length) canhThem.push("Sản phẩm chưa khai quy đổi két (" + esc(kq.thieuKet.join(", ")) + ") đang tạm tính 1 đơn vị = 1 két.");
		if (kq.tamTinh) canhThem.push("Kỳ này chưa ghi nhận chuyển tiền; số liệu là tạm tính.");
		if (canhThem.length) canh = canhThem.join(" ") + (canh ? " " + canh : "");
		var k = kq.k, so = function (v) { return Number(v).toLocaleString("vi-VN"); };
		var phanTram = function (p, ct) {
			if (!(ct > 0)) return "";
			return '<em class="' + (p >= 100 ? "dat" : p >= 90 ? "gan" : "chua") + '">' + Math.floor(p) + '%</em>';
		};
		var chiSo = k ? '<div class="hpl-chiso">' +
			'<div><span>Ngày công</span><b>' + so(k.k2) + '</b><small> / ' + so(k.k1) + '</small></div>' +
			'<div><span>Tổng sản lượng (két/thùng)</span><b>' + so(k.k4) + '</b><small> / ' + so(k.k3) + '</small>' + phanTram(k.k8, k.k3) + '</div>' +
			'<div><span>Trọng điểm (két/thùng)</span><b>' + so(k.k6) + '</b><small> / ' + so(k.k5) + '</small>' + phanTram(k.k9, k.k5) + '</div></div>' : '';
		var maNV = rec.manhanvien || me.EMP();
		var chuyen = nhieuLan
			? me.cacLan.map(function (r) { return '<div><span>Lần ' + esc(r.lan) + '</span><span><b>' + fmt(r.sotien) + ' đ</b> · ' + esc(ngayVN(r.ngaychuyen)) + '</span></div>'; }).join('')
			: daChuyen || rec.ngaychuyen ? '<div><span>Đã chuyển</span><span><b>' + fmt(daChuyen) + ' đ</b>' + (rec.ngaychuyen ? ' · ' + esc(ngayVN(rec.ngaychuyen)) : '') + (rec.lan != null ? ' · lần ' + esc(rec.lan) : '') + '</span></div>' : '';

		var html = me.css() + '<div class="hpl">' +
			'<div class="hpl-title"><div class="hpl-ten"><h2>PHIẾU LƯƠNG</h2><span>Tháng ' + esc(rec.thang) + '/' + esc(rec.nam) + '</span></div>' +
			'<button type="button" class="hpl-dong" aria-label="Đóng" title="Đóng" onclick="NUT.w2popup.close()">&times;</button></div>' +
			'<div class="hpl-nv"><div class="hpl-nv-ten">' + esc(ten || maNV) + '</div>' +
			'<div class="hpl-nv-phu">Mã NV <b>' + esc(maNV) + '</b>' + (kq.vitri ? ' · ' + esc(kq.vitri) : '') + '</div></div>' +
			chiSo +
			'<div class="hpl-bang"><table class="hpl-tbl"><colgroup><col><col><col><col></colgroup>' +
			'<thead><tr><th colspan="2" class="thu"><span class="m">CÁC KHOẢN </span>THU NHẬP (VNĐ)</th><th colspan="2" class="tru"><span class="m">CÁC KHOẢN </span>KHẤU TRỪ (VNĐ)</th></tr></thead>' +
			'<tbody>' + dong + '</tbody><tfoot>' +
			'<tr><td>Tổng thu nhập</td><td class="s thu">' + fmt(tongThu) + '</td><td>Tổng khấu trừ</td><td class="s tru">' + fmt(tongTru) + '</td></tr>' +
			'<tr><td class="net" colspan="4"><div class="hpl-net"><span>TỔNG THỰC NHẬN</span>' +
			'<b>' + fmt(thucNhan) + ' đ</b></div></td></tr>' +
			'</tfoot></table></div>' +
			'<div class="hpl-ct">' +
			'<div><span>Bằng chữ</span><i>' + (thucNhan < 0 ? 'Âm ' + chu : chu.charAt(0).toUpperCase() + chu.slice(1)) + ' đồng chẵn</i></div>' +
			chuyen +
			(rec.ghichu ? '<div><span>Ghi chú</span><span>' + esc(rec.ghichu) + '</span></div>' : '') + '</div>' +
			'<div class="hpl-luuy"><b>Lưu ý</b>' + me.LUUY.map(function (t, i) { return '<div><span>(' + (i + 1) + ')</span> ' + esc(t) + '</div>'; }).join("") + '</div>' +
			(canh ? '<div class="hpl-canh" role="note">' + canh + '</div>' : '') +
			'</div>';

		
		var width = Math.min(600, window.innerWidth - 16), maxH = window.innerHeight - 16;
		var probe = document.createElement("div");
		probe.className = "w2ui-popup";
		probe.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;height:auto;width:" + width + "px";
		probe.innerHTML = '<div class="w2ui-popup-body" style="position:static;height:auto"><div class="hpl-wrap">' + html + '</div></div>';
		document.body.appendChild(probe);
		var wrap = probe.firstChild.firstChild, tran = function () { return probe.offsetHeight + me.TIEU_DE_POPUP > maxH; };
		var gianHang = function () { for (var py = 5; py >= 2; py--) { wrap.style.setProperty("--py", py + "px"); if (!tran()) return true; } return false; };
		if (!gianHang()) { wrap.className += " hpl-gon"; gianHang(); }
		for (var z = 0.99; z >= 0.85 && tran(); z -= 0.01) wrap.style.zoom = z.toFixed(2);
		if (!tran()) wrap.style.overflow = "hidden";
		var height = Math.min(probe.offsetHeight + me.TIEU_DE_POPUP, maxH), body = probe.firstChild.innerHTML;
		document.body.removeChild(probe);

		NUT.w2popup.open({
			modal: true,
			width: width,
			height: height,
			body: body
		});
	}

	/* XUẤT EXCEL 
	 * Bật lại: thêm dấu phẩy sau hàm show, bỏ comment khối này, rồi trong show() thêm:
	 *   me.rec = rec; me.ten = ten;
	 *   và nút vào html: <button type="button" onclick="HrmsBaoCaoPhieuLuongNV.xuatExcel(this)">Tải Excel</button>

	EXCELJS: "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js",
	GHICHU: ["Trường hợp không đóng bảo hiểm (thử việc, part-time, không đủ ngày công…) tạm trích 10% thuế TNCN",
		"Chi trả BHYT đối với người lao động chưa đủ công để đóng BHXH"],

	taiExcelJS: function (ok, loi) {
		if (window.ExcelJS && window.ExcelJS.Workbook) return ok();
		fetch(HrmsBaoCaoPhieuLuongNV.EXCELJS)
			.then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
			.then(function (code) {
				var module = { exports: {} };
				new Function("module", "exports", "define", code)(module, module.exports, undefined);
				if (!module.exports.Workbook) throw new Error("thư viện không hợp lệ");
				window.ExcelJS = module.exports;
			})
			.then(function () { ok(); }, function (e) { loi(new Error("Không tải được thư viện Excel (" + e.message + "), kiểm tra kết nối mạng")); });
	},

	xuatExcel: function (btn) {
		var me = HrmsBaoCaoPhieuLuongNV, rec = me.rec;
		if (!rec) return;
		var nhan = btn.lastChild, chu = nhan.textContent;
		var xong = function () { btn.disabled = false; nhan.textContent = chu; };
		var loi = function (e) { NUT.notify("⚠️ Xuất Excel lỗi: " + (e && e.message || e), "red"); xong(); };
		btn.disabled = true;
		nhan.textContent = "Đang tạo file…";
		me.taiExcelJS(function () {
			fetch("site/" + n$.user.siteid + "/" + n$.app.appid + "/LOGO.jpg")
				.then(function (r) { return r.ok ? r.arrayBuffer() : null; })
				.catch(function () { return null; })
				.then(function (logo) { return me.taoFile(rec, logo).xlsx.writeBuffer(); })
				.then(function (buf) {
					var a = document.createElement("a");
					a.href = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
					a.download = "PhieuLuong_" + String(rec.manhanvien || me.EMP()).replace(/[^\w-]+/g, "_") + "_" + rec.thang + "-" + rec.nam + ".xlsx";
					document.body.appendChild(a);
					a.click();
					a.remove();
					setTimeout(function () { URL.revokeObjectURL(a.href); }, 30000);
					NUT.notify("✔️ Đã lưu " + a.download, "green");
					xong();
				})
				.catch(loi);
		}, loi);
	},

	taoFile: function (rec, logo) {
		var me = HrmsBaoCaoPhieuLuongNV;
		var n = function (v) { return Number(v) || 0; };
		var FONT = "Times New Roman", SO = '#,##0;-#,##0;"-"', DO = "FF9B1C1C";
		var vien = { style: "thin", color: { argb: "FF9CA3AF" } };
		var khung = { top: vien, left: vien, bottom: vien, right: vien };
		var nen = function (argb) { return { type: "pattern", pattern: "solid", fgColor: { argb: argb } }; };

		var wb = new ExcelJS.Workbook();
		var ws = wb.addWorksheet("Phiếu lương", { views: [{ showGridLines: false }] });
		ws.columns = [{ width: 7 }, { width: 36 }, { width: 19 }, { width: 38 }];
		ws.pageSetup = {
			paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true,
			margins: { left: 0.5, right: 0.5, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 }
		};
		var o = function (r, c, c2, v, font, can) {
			if (c2 > c) ws.mergeCells(r, c, r, c2);
			var cell = ws.getCell(r, c);
			cell.value = v;
			cell.font = Object.assign({ name: FONT, size: 12 }, font);
			cell.alignment = Object.assign({ vertical: "middle", wrapText: true }, can);
			return cell;
		};

		if (logo) ws.addImage(wb.addImage({ buffer: logo, extension: "jpeg" }), { tl: { col: 0.1, row: 0.1 }, ext: { width: 40, height: 40 } });
		o(1, 1, 4, "CÔNG TY CỔ PHẦN ĐẦU TƯ ORIT", { bold: true, size: 13 }, { indent: 6 });
		o(2, 1, 4, "Số 3/20, đường Ngụy Như Kon Tum, Thanh Xuân, Hà Nội", { size: 11 }, { indent: 6 });
		ws.getRow(1).height = 20;
		ws.getRow(2).height = 16;
		ws.getRow(4).height = 28;
		o(4, 1, 4, "PHIẾU LƯƠNG THÁNG " + rec.thang + "/" + rec.nam, { bold: true, size: 17, color: { argb: DO } }, { horizontal: "center" });
		o(6, 1, 2, { richText: [{ text: "Họ và tên: ", font: { name: FONT, size: 12 } }, { text: me.ten || "", font: { name: FONT, size: 12, bold: true } }] }, {}, {});
		o(6, 3, 4, { richText: [{ text: "Mã NV: ", font: { name: FONT, size: 12 } }, { text: String(rec.manhanvien || me.EMP()), font: { name: FONT, size: 12, bold: true } }] }, {}, { horizontal: "right" });
		o(7, 1, 2, "Ngày xuất phiếu: " + new Date().toLocaleDateString("vi-VN"), { size: 11, italic: true }, {});
		o(7, 3, 4, "Đơn vị tính: VNĐ", { size: 11, italic: true }, { horizontal: "right" });

		var r = 9;
		["STT", "Khoản mục", "Số tiền", "Ghi chú"].forEach(function (t, i) {
			var c = o(r, i + 1, i + 1, t, { bold: true, color: { argb: "FFFFFFFF" } }, { horizontal: "center" });
			c.fill = nen(DO);
			c.border = khung;
		});
		ws.getRow(r).height = 24;
		var dong = function (stt, ten, tien, ghichu, kieu) {
			r++;
			var dam = kieu != "muc", cells = [
				o(r, 1, 1, stt, { bold: dam, size: dam ? 12 : 11 }, { horizontal: "center" }),
				o(r, 2, 2, ten, { bold: dam, size: dam ? 12 : 11 }, {}),
				o(r, 3, 3, tien, { bold: dam, size: dam ? 12 : 11 }, { horizontal: "right" }),
				o(r, 4, 4, ghichu || "", { italic: true, size: 10, color: { argb: "FF4B5563" } }, {})
			];
			cells[2].numFmt = SO;
			cells.forEach(function (c) { c.border = khung; if (kieu == "nhom") c.fill = nen("FFFDF2E9"); if (kieu == "tong") c.fill = nen("FFFDE2C4"); });
			ws.getRow(r).height = Math.max(20, Math.ceil((ghichu || "").length / 40) * 13.5 + 6);
			return cells;
		};
		var nhom = function (stt, ten, ds) {
			var rNhom = r + 1, kq = ds.reduce(function (s, x) { return s + n(rec[x[0]]); }, 0);
			dong(stt, ten, { formula: "SUM(C" + (rNhom + 1) + ":C" + (rNhom + ds.length) + ")", result: kq }, "", "nhom");
			ds.forEach(function (x, i) {
				var ghi = { thuetncn: 1, giamtrukhac: 2 }[x[0]];
				dong(i + 1, x[1] + (ghi ? " (" + ghi + ")" : ""), n(rec[x[0]]), ghi ? "(" + ghi + ") " + me.GHICHU[ghi - 1] : "", "muc");
			});
			return { dong: rNhom, tien: kq };
		};
		var thu = nhom("I", "THU NHẬP", me.THU), tru = nhom("II", "KHẤU TRỪ", me.TRU);
		var coCT = !!(thu.tien || tru.tien), thucnhan = coCT ? thu.tien - tru.tien : n(rec.sotien), khop = coCT;
		var cuoi = dong("III", "THỰC NHẬN (I − II)", khop ? { formula: "C" + thu.dong + "-C" + tru.dong, result: thucnhan } : thucnhan,
			khop ? "" : "Theo số liệu chi trả", "tong");
		cuoi.forEach(function (c) { c.font = Object.assign({}, c.font, { size: 13 }); });
		cuoi[2].font = Object.assign({}, cuoi[2].font, { color: { argb: "FFB91C1C" } });
		ws.getRow(r).height = 24;

		var chu = me.bangChu(thucnhan);
		r += 1;
		ws.getRow(r).height = 22;
		o(r, 1, 4, { richText: [{ text: "Bằng chữ: ", font: { name: FONT, size: 12 } }, { text: chu.charAt(0).toUpperCase() + chu.slice(1) + " đồng chẵn.", font: { name: FONT, size: 12, italic: true, bold: true } }] }, {}, {});
		return wb;
	}
	 HẾT KHỐI XUẤT EXCEL */
};