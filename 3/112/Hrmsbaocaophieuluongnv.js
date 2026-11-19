// Phiếu lương của kỳ gần nhất trước tháng hiện tại; nhiều lần chuyển thì cộng dồn.
var HrmsBaoCaoPhieuLuongNV = {
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
	LUUY_MUC: { thuetncn: 1, bhxh: 2 },

	css: function () {
		return '<style>' +
			'.w2ui-popup:has(.hpl-wrap) .w2ui-popup-title,.w2ui-popup:has(.hpl-wrap) .w2ui-popup-title-btns{display:none!important}.w2ui-popup:has(.hpl-wrap) .w2ui-box,.w2ui-popup:has(.hpl-wrap) .w2ui-popup-body{top:0!important}' +
			'.hpl-ten{display:flex;align-items:center;flex-wrap:wrap;gap:10px;min-width:0;padding:6px 14px;border-radius:10px;background:linear-gradient(135deg,#8b1d1d,#c2410c);color:#fff}.hpl-dong{flex:none;width:36px;height:36px;margin:-2px -6px -2px 0;padding:0;border:0;border-radius:50%;background:none;color:#475569;font:500 30px/36px system-ui;touch-action:manipulation;cursor:pointer;transition:color .18s,transform .18s}.hpl-dong:hover{color:#b91c1c;transform:scale(1.15)}.hpl-dong:focus-visible{outline:2px solid #94a3b8;outline-offset:2px}' +
			'.hpl-wrap{--py:5px;padding:10px 12px;height:100%;overflow:auto;box-sizing:border-box}' +
			'.hpl{font:14px/1.3 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937}' +
			'.hpl-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}' +
			'.hpl-title h2{margin:0;color:#fff!important;font-size:16px;font-weight:700;letter-spacing:.04em}.hpl-title span{flex:none;padding:0 0 0 10px;border-left:1px solid rgba(255,255,255,.55);color:#fff;font-size:14px;font-weight:600;line-height:1.2}' +
			'.hpl-info{width:100%;box-sizing:border-box;border-collapse:separate;border-spacing:0;margin-bottom:8px;padding:5px 12px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px}.hpl-info th{padding:2px 8px 2px 0;text-align:left;vertical-align:top;font-weight:400;color:#6b7280;white-space:nowrap}.hpl-info td{padding:2px 14px 2px 0;vertical-align:top}' +
			'.hpl-bang{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}' +
			'.hpl-tbl{width:100%;border-collapse:collapse}.hpl-tbl th,.hpl-tbl td{padding:var(--py) 12px;border-bottom:1px solid #f1f5f9;font-weight:400;text-align:left}.hpl-tbl tr>:nth-child(3){border-left:1px solid #e5e7eb}' +
			'.hpl-tbl col:nth-child(1){width:33%}.hpl-tbl col:nth-child(2),.hpl-tbl col:nth-child(4){width:19%}.hpl-tbl col:nth-child(3){width:29%}' +
			'.hpl-tbl thead th{padding-top:6px;padding-bottom:6px;font-size:12px;font-weight:700;text-align:center;letter-spacing:.02em;border-bottom:1px solid #e5e7eb}.hpl-tbl th.thu{background:#ecfdf5;color:#047857}.hpl-tbl th.tru{background:#fef2f2;color:#b91c1c}' +
			'.hpl-tbl td.s{text-align:right;white-space:nowrap;font-weight:600;font-variant-numeric:tabular-nums}.hpl-tbl td.z{color:#b6c0cc;font-weight:400}.hpl-tbl td.trong{border-bottom:0}' +
			'.hpl-tbl tfoot td{background:#f8fafc;font-weight:700;border-top:1px solid #e5e7eb;border-bottom:0}.hpl-tbl tfoot td.thu{color:#047857}.hpl-tbl tfoot td.tru{color:#b91c1c}' +
			'.hpl-tbl td.net{padding:0;border:0;white-space:normal}.hpl-net{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 12px;background:linear-gradient(135deg,#047857,#059669);color:#fff}' +
			'.hpl-net span{font-weight:700;letter-spacing:.03em}.hpl-net b{flex:none;font-size:18px;font-weight:700;line-height:1.15;font-variant-numeric:tabular-nums}' +
			'.hpl-luuy{margin-top:8px;padding:0 4px;color:#6b7280;font-size:11.5px;line-height:1.35}.hpl-luuy b{color:#9a3412}.hpl-luuy div{display:flex;gap:4px}.hpl-luuy div span{flex:none}.hpl-sn{color:#b91c1c;font-size:10px;font-weight:600}' +
			'.hpl-canh{margin-top:10px;padding:6px 10px;border-radius:8px;background:#fff7ed;border:1px solid #fdba74;color:#9a3412;font-size:12.5px;line-height:1.4}' +
			'@media (max-width:480px){.hpl-wrap{padding:8px}.hpl{font-size:12.5px}.hpl-tbl col{width:auto!important}.hpl-tbl th,.hpl-tbl td{padding-left:5px;padding-right:5px;font-size:12px}.hpl-tbl thead .m{display:none}.hpl-tbl thead th{font-size:11px}' +
			'.hpl-title{margin-bottom:6px}.hpl-ten{padding:5px 12px}.hpl-title h2{font-size:15px}.hpl-title span{font-size:12.5px}.hpl-info{margin-bottom:6px}.hpl-info th{padding-right:5px}.hpl-info td{padding-right:8px}' +
			'.hpl-net{padding:7px 8px}.hpl-net b{font-size:16px}.hpl-luuy{margin-top:6px;font-size:11px}.hpl-canh{margin-top:6px;font-size:11.5px}}' +
			'@media (min-width:380px) and (max-width:480px){.hpl-tbl td{white-space:nowrap}}' +
			'.hpl-gon.hpl-wrap{padding:6px 10px}.hpl-gon .hpl{line-height:1.2}.hpl-gon .hpl-title{margin-bottom:5px}.hpl-gon .hpl-ten{padding:4px 12px}.hpl-gon .hpl-title h2{font-size:15px}.hpl-gon .hpl-title span{font-size:12.5px}' +
			'.hpl-gon .hpl-info{margin-bottom:5px;padding:3px 10px}.hpl-gon .hpl-dong{width:32px;height:32px;font-size:26px;line-height:32px}.hpl-gon .hpl-info th,.hpl-gon .hpl-info td{padding-top:0;padding-bottom:0}.hpl-gon .hpl-tbl thead th{padding-top:3px;padding-bottom:3px}' +
			'.hpl-gon .hpl-net{padding:5px 10px}.hpl-gon .hpl-net b{font-size:16px}.hpl-gon .hpl-luuy{margin-top:4px;line-height:1.25}.hpl-gon .hpl-canh{margin-top:5px;padding:3px 8px;font-size:11.5px;line-height:1.2}' +
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

	run: function () {
		var me = HrmsBaoCaoPhieuLuongNV, ma = me.EMP();
		if (!ma) { NUT.notify("Tài khoản " + n$.user.username + " chưa được gán mã nhân viên (Tag).", "yellow"); return; }
		me.url = NUT.services[me.SERVICE_ID].url;
		NUT.ds.select({
			url: me.url + "data/diluong", limit: 12,
			where: ["manhanvien", "=", ma],
			orderby: "nam desc,thang desc"
		}, function (res) {
			if (!res.success) { NUT.notify("Không đọc được dữ liệu lương.", "red"); return; }
			var rec = me.kyGanNhat(res.result);
			if (!rec) { NUT.notify("Bạn chưa có phiếu lương.", "yellow"); return; }
			me.layHoTen(ma, function (hoten) { me.show(rec, hoten); });
		});
	},

	kyGanNhat: function (rows) {
		var me = HrmsBaoCaoPhieuLuongNV, now = new Date(), kyNay = now.getFullYear() * 12 + now.getMonth() + 1;
		var ky = function (r) { return Number(r.nam) * 12 + Number(r.thang); };
		var ds = rows.filter(function (r) { return ky(r) < kyNay; });
		if (!ds.length) return null;
		var cungKy = ds.filter(function (r) { return ky(r) === ky(ds[0]); });
		cungKy.sort(function (a, b) { return (Number(a.lan) || 0) - (Number(b.lan) || 0); });
		var rec = Object.assign({}, cungKy[cungKy.length - 1]);
		me.THU.concat(me.TRU, [["sotien"]]).forEach(function (x) {
			rec[x[0]] = cungKy.reduce(function (s, r) { return s + (Number(r[x[0]]) || 0); }, 0);
		});
		rec.ghichu = cungKy.map(function (r) { return r.ghichu; }).filter(function (g, i, a) { return g && a.indexOf(g) === i; }).join("; ");
		me.cacLan = cungKy;
		return rec;
	},

	// n$.user.fullname có thể là tên bộ phận nên chỉ là phương án cuối
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

	show: function (rec, hoten) {
		var me = HrmsBaoCaoPhieuLuongNV;
		var n = function (v) { return Number(v) || 0; };
		var fmt = function (v) { return n(v).toLocaleString("vi-VN"); };
		var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };
		var ngayVN = function (v) { return String(v || "").replace(/^(\d{4})-(\d{2})-(\d{2}).*/, "$3/$2/$1"); };
		var tong = function (ds) { return ds.reduce(function (s, x) { return s + n(rec[x[0]]); }, 0); };
		var o = function (x) { return '<td>' + x[1] + (me.LUUY_MUC[x[0]] ? ' <sup class="hpl-sn">(' + me.LUUY_MUC[x[0]] + ')</sup>' : '') + '</td><td class="s' + (n(rec[x[0]]) ? '' : ' z') + '">' + fmt(rec[x[0]]) + '</td>'; };
		var dong = me.THU.map(function (x, i) {
			return '<tr>' + o(x) + (i < me.TRU.length ? o(me.TRU[i]) : i === me.TRU.length ? '<td class="trong" colspan="2" rowspan="' + (me.THU.length - me.TRU.length) + '"></td>' : '') + '</tr>';
		}).join("");
		var tongThu = tong(me.THU), tongTru = tong(me.TRU), conLai = tongThu - tongTru, daChuyen = n(rec.sotien);
		var coChiTiet = !!(tongThu || tongTru);
		var thucNhan = coChiTiet ? conLai : daChuyen, chu = me.bangChu(thucNhan);
		var nhieuLan = me.cacLan.length > 1, ten = String(hoten || rec.hoten || n$.user.fullname || "").trim();

		var canh = "";
		if (!coChiTiet && daChuyen) canh = "Các khoản chi tiết của kỳ này chưa được nhập; thực nhận tạm theo số tiền đã chuyển.";
		else if (daChuyen && daChuyen !== conLai) canh = "Số tiền đã chuyển " + fmt(daChuyen) + " đ, chênh " + fmt(daChuyen - conLai) + " đ so với tổng thực nhận. Liên hệ bộ phận nhân sự nếu cần đối chiếu.";

		var html = me.css() + '<div class="hpl">' +
			'<div class="hpl-title"><div class="hpl-ten"><h2>PHIẾU LƯƠNG</h2><span>Tháng ' + esc(rec.thang) + '/' + esc(rec.nam) + '</span></div>' +
			'<button type="button" class="hpl-dong" aria-label="Đóng" title="Đóng" onclick="NUT.w2popup.close()">&times;</button></div>' +
			'<table class="hpl-info">' +
			'<tr><th>Họ và tên</th><td><b>' + esc(ten) + '</b></td><th>Mã NV</th><td><b>' + esc(rec.manhanvien || me.EMP()) + '</b></td></tr>' +
			(nhieuLan ? '<tr><th>Các lần</th><td colspan="3">' + me.cacLan.map(function (r) { return 'Lần ' + esc(r.lan) + ' · ' + esc(ngayVN(r.ngaychuyen)) + ': <b>' + fmt(r.sotien) + ' đ</b>'; }).join('<br>') + '</td></tr>'
				: rec.ngaychuyen || rec.lan != null ? '<tr><th>Ngày chuyển</th><td>' + esc(ngayVN(rec.ngaychuyen)) + '</td><th>Lần</th><td>' + esc(rec.lan) + '</td></tr>' : '') +
			'<tr><th>Bằng chữ</th><td colspan="3"><i>' + (thucNhan < 0 ? 'Âm ' + chu : chu.charAt(0).toUpperCase() + chu.slice(1)) + ' đồng chẵn</i></td></tr>' +
			(rec.ngaycong != null ? '<tr><th>Ngày công</th><td colspan="3"><b>' + esc(rec.ngaycong) + '</b></td></tr>' : '') +
			(rec.ghichu ? '<tr><th>Ghi chú</th><td colspan="3">' + esc(rec.ghichu) + '</td></tr>' : '') + '</table>' +
			'<div class="hpl-bang"><table class="hpl-tbl"><colgroup><col><col><col><col></colgroup>' +
			'<thead><tr><th colspan="2" class="thu"><span class="m">CÁC KHOẢN </span>THU NHẬP (VNĐ)</th><th colspan="2" class="tru"><span class="m">CÁC KHOẢN </span>KHẤU TRỪ (VNĐ)</th></tr></thead>' +
			'<tbody>' + dong + '</tbody><tfoot>' +
			'<tr><td>Tổng thu nhập</td><td class="s thu">' + fmt(tongThu) + '</td><td>Tổng khấu trừ</td><td class="s tru">' + fmt(tongTru) + '</td></tr>' +
			'<tr><td class="net" colspan="4"><div class="hpl-net"><span>TỔNG THỰC NHẬN' + (nhieuLan ? ' · CỘNG DỒN ' + me.cacLan.length + ' LẦN' : '') + '</span>' +
			'<b>' + fmt(thucNhan) + ' đ</b></div></td></tr>' +
			'</tfoot></table></div>' +
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
