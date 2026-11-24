// Báo cáo làm việc: ngày công + sản lượng + khoán của nhân viên trong tháng.
var Hrmsbaocaolamviecnv = {
	SERVICE_ID: 3,
	// Same KPI groups and target partner as DailySanLuongReport.
	TARGET_PARTNER: "HABECO",
	KPI_GROUPS: {
		KEG: "keg", KEG1L: "keg", BOLD: "bold", BOLDL: "bold",
		LIGHT: "light", LIGHTL: "light", TRUCBACH: "trucbach", TRUCBACHL: "trucbach",
		HANOIPREL: "hanoiprel", HANOIPRE: "hanoipre"
	},
	EMP: function () { return String(n$.user.tag || "").trim(); },
	url: null,
	isFocus: function (value) { return /^(1|true|x)$/i.test(String(value == null ? "" : value).trim()); },

	ICON: {
		calendar: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
	},

	css: function () {
		return '<style>' +
			'.hbc{font:15px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1f2937}' +
			'.hbc-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 12px;padding:10px 16px;border-radius:12px;background:linear-gradient(135deg,#8b1d1d,#c2410c);color:#fff}' +
			'.hbc-head small{opacity:.85;font-size:13px;margin-right:6px}' +
			'.hbc-head b{font-size:16px;font-weight:600}' +
			'.hbc-head .who{display:flex;flex-wrap:wrap;gap:2px 14px}.hbc-head .g{white-space:nowrap}' +
			'.hbc-head .m{display:flex;align-items:center;gap:6px;white-space:nowrap}' +
			'.hbc-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 0}' +
			'.hbc-card{display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:4px;padding:10px 12px 12px;border:1px solid #fde2c4;background:#fff8f1;border-radius:12px;text-align:center}' +
			'.hbc-card .l{display:flex;align-items:center;justify-content:center;min-height:32px;font-size:12px;line-height:1.3;color:#6b7280;font-weight:500;text-wrap:balance}' +
			'.hbc-card .l i{font-style:normal;color:#d97706;margin-right:3px}' +
			'.hbc-card .v{display:block;font-size:28px;font-weight:700;color:#8b1d1d;line-height:1.1;font-variant-numeric:tabular-nums}' +
			'.hbc-card .s{display:block;font-size:13px;color:#6b7280;font-variant-numeric:tabular-nums;white-space:nowrap}' +
			'.hbc-card .s b{color:#1f2937;font-weight:600}' +
			'.hbc-card .pg{display:block;width:100%;height:5px;border-radius:3px;background:#fde2c4;overflow:hidden}' +
			'.hbc-card .pg.off{visibility:hidden}' +
			'.hbc-card .pg b{display:block;height:100%;border-radius:3px;background:#dc2626}' +
			'.hbc-card .pg b.mid{background:#f59e0b}.hbc-card .pg b.ok{background:#16a34a}' +
			'.hbc-tb{border:1px solid #eee;border-radius:12px;overflow:hidden}' +
			'.hbc-list{overflow-y:auto}' +
			'.hbc-row{display:grid;grid-template-columns:1fr 96px 84px 64px;align-items:center;gap:12px;padding:10px 16px;border-top:1px solid #f1f1f1}' +
			'.hbc-list .hbc-row:first-child{border-top:1px solid #eee}' +
			'.hbc-row.hd{border-top:0;background:#fafafa;font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:#9ca3af;font-weight:600;padding:8px 16px;white-space:nowrap}' +
			'.hbc-row .nm{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
			'.hbc-row .nm .t{display:block;overflow:hidden;text-overflow:ellipsis}' +
			'.hbc-row.td .nm .t:before{content:"★ ";color:#d97706}' +
			'.hbc-row .qc{display:inline-block;margin-top:1px;padding:0 6px;border-radius:8px;background:#f3f4f6;color:#6b7280;font-size:12px;font-weight:500;line-height:18px}' +
			'.hbc-row .qc.no{background:#fee2e2;color:#dc2626}' +
			'.hbc-row .n{text-align:center;font-variant-numeric:tabular-nums}' +
			'.hbc-row .n b{font-weight:600}' +
			'.hbc-row .n.mu,.hbc-row .mu{color:#9ca3af}' +
			'.hbc-row .kh{color:#4b5563;white-space:nowrap}' +
						'.hbc-row .p{text-align:center;font-weight:600;font-variant-numeric:tabular-nums}' +
			'.hbc-row .p.ok{color:#16a34a}.hbc-row .p.mid{color:#d97706}.hbc-row .p.lo{color:#dc2626}' +
			'.hbc-row.tot{background:#fff8f1;border-top:2px solid #fde2c4;font-weight:700;color:#8b1d1d}' +
			'.hbc-row.tot .n{font-weight:700}.hbc-row.tot .kh{color:#8b1d1d}.hbc-row.tot .kh small{color:#c2410c}' +
			'.hbc-note{padding:10px 2px 0;font-size:13px;color:#6b7280}' +
			'.hbc-grp{padding:6px 16px;background:#fef3e8;color:#9a3412;font-weight:700;font-size:13px;border-top:1px solid #fde2c4}' +
			'.hbc-empty{padding:18px;text-align:center;color:#6b7280}' +
			'@media (max-width:520px){' +
				'.hbc{font-size:13px}' +
				'.hbc-head{padding:8px 12px;border-radius:10px}.hbc-head small{font-size:11px;margin-right:4px}.hbc-head b{font-size:14px}' +
				'.hbc-cards{gap:6px;margin:10px 0}' +
				'.hbc-card{padding:8px 4px 9px;border-radius:10px;gap:3px}' +
				'.hbc-card .l{font-size:11px;min-height:28px;font-weight:500}' +
				'.hbc-card .v{font-size:20px}' +
				'.hbc-card .s{font-size:11px}' +
				'.hbc-card .pg{width:80%;height:4px}' +
				'.hbc-tb{border-radius:10px}' +
				'.hbc-row{grid-template-columns:1fr 64px 52px 44px;gap:6px;padding:8px 10px}' +
				'.hbc-row.hd{padding:6px 10px;font-size:10px;letter-spacing:0;white-space:normal;line-height:1.2}' +
				'.hbc-row .nm{font-weight:500}.hbc-row .nm .t{white-space:normal;line-height:1.3}' +
				'.hbc-row .qc{padding:0;background:none;font-size:11px;line-height:16px;font-weight:400;color:#9ca3af}' +
				'.hbc-row .qc.no{background:none}' +
				'.hbc-row .p{font-weight:600}' +
				'.hbc-row.tot .n{font-weight:600}' +
				'.hbc-note{font-size:12px}' +
			'}' +
			'</style>';
	},

	run: function (p, done) {
		var me = Hrmsbaocaolamviecnv, now = new Date(), emp = me.EMP();
		var ky = { nam: now.getFullYear(), thang: now.getMonth() + 1, ngay: now.getDate(), emp: emp };
		if (!emp) { NUT.notify("Tài khoản " + n$.user.username + " chưa được gán mã nhân viên (Tag).", "yellow"); return; }
		me.url = NUT.services[me.SERVICE_ID].url;

		var sel = function (table, opt, cb) {
			opt.url = me.url + "data/" + table;
			opt.limit = opt.limit || 20000;
			NUT.ds.select(opt, function (res) {
				var rows = res && res.success ? res.result || [] : null;
				cb(rows && rows.length < opt.limit ? rows : null);
			});
		};
		var selByIds = function (table, key, ids, cb) {
			if (!ids.length) return cb([]);
			var out = [], offset = 0;
			var next = function () {
				var chunk = ids.slice(offset, offset + 150);
				if (!chunk.length) return cb(out);
				offset += chunk.length;
				sel(table, { where: [[key, "in", chunk.join("','")]],
					orderby: table === "chamcong_ct" ? "idchamcongct" : "idchitieu" }, function (rows) {
					if (!rows) return cb(null);
					out = out.concat(rows);
					next();
				});
			};
			next();
		};

		var base = [["nam", "=", ky.nam], ["thang", "=", ky.thang], ["manhanvien", "=", emp]];
		var data = { cong: 0, goal: {}, tdLine: {}, focusGoal: {}, hasTarget: false, sold: {}, today: {}, names: {}, partners: {}, visits: 0, days: 0, hoten: "" };
		var pending = 4, failed = false;
		var fail = function (m) { if (failed) return; failed = true; NUT.notify(m || "Không đọc được dữ liệu báo cáo. Vui lòng thử lại.", "red"); };
		var step = function () { if (!failed && --pending === 0) { me.show(data, ky); if (done) done(); } };

		sel("ba_ungvien", { select: "manhanvien,hoten,status", where: [["manhanvien", "=", emp]] }, function (uv) {
			var ds = uv || [];
			var nv = ds.filter(function (x) { return x.status === "OFFICIAL" && x.hoten; })[0] || ds.filter(function (x) { return x.hoten; })[0];
			if (nv) { data.hoten = String(nv.hoten).trim(); return step(); }
			sel("nhanvien_v", { select: "hoten", where: [["manhanvien", "=", emp]] }, function (r) {
				data.hoten = r && r.length && r[0].hoten ? String(r[0].hoten).trim() : "";
				step();
			});
		});

		sel("chamcong_v", { select: "idchamcong,manhanvien,ngay,cong", where: base, limit: 20000 }, function (c) {
			if (!c) return fail("Không đọc được dữ liệu ngày công.");
			if (c.length >= 20000) return fail("Dữ liệu ngày công chạm giới hạn 20000 dòng. Không thể tính đủ ngày công.");
			data.cong = me.tinhCong(c);
			step();
		});

		sel("chitieu", { select: "idchitieu", where: base.concat([["madoitac", "=", me.TARGET_PARTNER]]) }, function (t) {
			if (!t) return fail("Không đọc được chỉ tiêu tháng.");
			selByIds("chitieu_ct", "idchitieu", t.map(function (x) { return Number(x.idchitieu); }), function (l) {
				if (!l) return fail("Không đọc được chi tiết chỉ tiêu tháng.");
				l.forEach(function (x) {
					var q = Math.max(0, Number(x.soluong) || 0); if (!x.masanpham) return;
					x.masanpham = String(x.masanpham).trim().toUpperCase();
					data.goal[x.masanpham] = (data.goal[x.masanpham] || 0) + q;
					if (me.isFocus(x.trongdiem)) {
						data.tdLine[x.masanpham] = true;
						data.focusGoal[x.masanpham] = (data.focusGoal[x.masanpham] || 0) + q;
					}
					data.hasTarget = true;
				});
				step();
			});
		});

		sel("chamcong", { select: "idchamcong,ngay,thoigianden,thoigianve", where: base.concat([["dulieu", "=", 0]]) }, function (rounds) {
			if (!rounds) return fail("Không đọc được dữ liệu chấm công.");
			var days = {}, worked = {};
			rounds.forEach(function (r) {
				if (r.thoigianden) worked[r.ngay] = 1;
				if (r.thoigianve) days[String(r.idchamcong)] = Number(r.ngay);
			});
			data.days = Object.keys(worked).length;
			data.visits = Object.keys(days).length;
			selByIds("chamcong_ct", "idchamcong", Object.keys(days).map(Number), function (cts) {
				if (!cts) return fail("Không đọc được sản lượng chấm công.");
				me.tinh(data, cts, days, ky);
				sel("sanpham", { select: "masanpham,tensanpham,trongdiem,madoitac,ket,thutu" }, function (sp) {
					if (!sp) return fail("Không đọc được danh mục sản phẩm (quy cách két).");
					sp.forEach(function (s) {
						s.masanpham = String(s.masanpham || "").trim().toUpperCase();
						var tt = s.thutu == null || s.thutu === "" ? null : Number(s.thutu);
						data.names[s.masanpham] = {
							ten: s.tensanpham || s.masanpham, td: me.isFocus(s.trongdiem), dt: s.madoitac || "", ket: Number(s.ket) || 0,
							tt: isFinite(tt) ? tt : null
						};
					});
					sel("doitac", { select: "madoitac,tendoitac" }, function (dt) {
						(dt || []).forEach(function (d) { data.partners[d.madoitac] = d.tendoitac || d.madoitac; });
						step();
					});
				});
			});
		});
	},

	// daucuoi: 0 = Tồn đầu, 2 = Nhập NPP, 1 = Tồn cuối. Số bán mỗi lần = đầu + nhập − cuối (lần phải có tồn cuối)
	tinh: function (data, list, days, ky) {
		var by = Object.create(null), seen = Object.create(null);
		list.forEach(function (x) {
			var k = String(x.idchamcong), code = String(x.masanpham || "").trim().toUpperCase();
			var q = Math.max(0, Number(x.soluong) || 0), t = Number(x.daucuoi);
			if (!Object.prototype.hasOwnProperty.call(days, k) || !code || [0, 1, 2].indexOf(t) < 0) return;
			var unique = JSON.stringify([k, code, t]);
			if (seen[unique]) return;
			seen[unique] = true;
			var s = by[k] || (by[k] = Object.create(null));
			var p = s[code] || (s[code] = { a: 0, n: 0, c: null });
			if (t === 0) p.a = q; else if (t === 2) p.n = q; else p.c = q;
		});
		Object.keys(by).forEach(function (k) {
			Object.keys(by[k]).forEach(function (ma) {
				var p = by[k][ma]; if (p.c == null) return;
				var v = Math.max(0, p.a + p.n - p.c);
				data.sold[ma] = (data.sold[ma] || 0) + v;
				if (days[k] === ky.ngay) data.today[ma] = (data.today[ma] || 0) + v;
			});
		});
	},

	// Deduplicate attendance and cap each employee's daily work at one day.
	tinhCong: function (records) {
		var seen = Object.create(null), byDay = Object.create(null);
		records.forEach(function (r) {
			if (r.idchamcong !== null && r.idchamcong !== undefined && r.idchamcong !== "") {
				var id = String(r.idchamcong);
				if (seen[id]) return;
				seen[id] = true;
			}
			var day = Number(r.ngay);
			if (!(day >= 1 && day <= 31)) return;
			var key = String(r.manhanvien) + "|" + day;
			byDay[key] = Math.min(1, (byDay[key] || 0) + Math.max(0, Number(r.cong) || 0));
		});
		return Object.keys(byDay).reduce(function (sum, key) { return sum + byDay[key]; }, 0);
	},

	calculateKpi: function (data) {
		var me = Hrmsbaocaolamviecnv, focusGroups = Object.create(null);
		var result = { sold: 0, goal: 0, focusSold: 0, focusGoal: 0, focusGroups: focusGroups };
		Object.keys(data.goal || {}).forEach(function (code) {
			var group = me.KPI_GROUPS[code];
			if (!group) return;
			result.goal += Number(data.goal[code]) || 0;
			if (me.isFocus((data.tdLine || {})[code])) {
				focusGroups[group] = true;
				// Only flagged target lines contribute to the focus denominator.
				result.focusGoal += Number((data.focusGoal || {})[code]) || 0;
			}
		});
		Object.keys(data.sold || {}).forEach(function (code) {
			var group = me.KPI_GROUPS[code], raw = Number(data.sold[code]) || 0;
			if (!group || !raw) return;
			var ket = Number((data.names[code] || {}).ket);
			if (!(Number.isFinite(ket) && ket > 0)) {
				throw new Error("Sản phẩm " + code + " chưa có quy cách sanpham.ket hợp lệ. Không thể tính % hoàn thành.");
			}
			var sold = raw / ket;
			result.sold += sold;
			if (focusGroups[group]) result.focusSold += sold;
		});
		result.percent = result.goal ? Math.round(100 * result.sold / result.goal) : null;
		result.focusPercent = result.focusGoal ? Math.round(100 * result.focusSold / result.focusGoal) : null;
		return result;
	},

	show: function (data, ky) {
		var me = Hrmsbaocaolamviecnv;
		var n = function (v) { return Number(v) || 0; };
		var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return "&#" + c.charCodeAt(0) + ";"; }); };
		var fmt = function (v) { return n(v).toLocaleString("vi-VN"); };
		var lvl = function (pct) { return pct >= 80 ? "ok" : pct >= 50 ? "mid" : "lo"; };
		var info = function (m) { return data.names[m] || { ten: m, td: false, dt: "" }; };
		var qk = function (m, v) { var kt = (data.names[m] || {}).ket; return kt > 0 ? v / kt : v; };
		var noKet = function (m) { return !((data.names[m] || {}).ket > 0); };
		var unit = function (m) { var t = String(info(m).ten || m).toLowerCase(); return /\blon\b/.test(t) ? "lon" : /\bkeg\b/.test(t) ? "keg" : /\bchai\b/.test(t) ? "chai" : "đv"; };
		var qcach = function (m) { return noKet(m) ? '<span class="qc no">Chưa có quy cách</span>' : '<span class="qc">' + fmt(data.names[m].ket) + ' ' + unit(m) + '/két</span>'; };
		var fk = function (v) { return (Math.round(n(v) * 10) / 10).toLocaleString("vi-VN", { maximumFractionDigits: 1 }); };
		var fk1 = fk;
		var kpi;
		try { kpi = me.calculateKpi(data); }
		catch (error) { NUT.notify(error.message, "red"); return; }
		var isTd = function (m) { return !!kpi.focusGroups[me.KPI_GROUPS[m]]; };
		var pname = function (d) { return d ? (data.partners[d] || d) : "Khác"; };

		var codes = Object.keys(data.goal);
		Object.keys(data.sold).forEach(function (m) { if (codes.indexOf(m) < 0 && n(data.sold[m]) > 0) codes.push(m); });
		codes = codes.filter(function (m) { return !!me.KPI_GROUPS[m]; });
		var ord = function (m) { var t = info(m).tt; return t == null ? Infinity : t; };
		codes.sort(function (a, b) {
			var oa = ord(a), ob = ord(b);
			return String(info(a).dt).localeCompare(String(info(b).dt)) || (oa === ob ? 0 : oa < ob ? -1 : 1) || String(info(a).ten).localeCompare(String(info(b).ten));
		});

		var tg = kpi.goal, lkAll = kpi.sold, tgTd = kpi.focusGoal, lkTd = kpi.focusSold;
		var tot = kpi.percent, totTd = kpi.focusPercent;
		var sumSold = kpi.sold, sumGoal = kpi.goal;
		var card = function (label, val, sub, pct) {
			var c = pct == null ? "" : lvl(pct);
			return '<div class="hbc-card"><span class="l"><span>' + label + '</span></span>' +
				'<span class="v">' + val + '</span>' +
				'<span class="s">' + (sub || '&nbsp;') + '</span>' +
				'<i class="pg' + (pct == null ? ' off' : '') + '"><b class="' + c + '" style="width:' + Math.min(100, pct || 0) + '%"></b></i></div>';
		};

		var dts = []; codes.forEach(function (m) { if (dts.indexOf(info(m).dt) < 0) dts.push(info(m).dt); });
		var multi = dts.length > 1;

		var html = me.css() + '<div class="hbc">' +
			'<div class="hbc-head"><div class="who"><span class="g"><small>Nhân viên</small><b title="' + esc(ky.emp) + '">' + esc(data.hoten || ky.emp) + '</b></span>' + (dts.length === 1 ? '<span class="g"><small>Đối tác</small><b>' + esc(pname(dts[0])) + '</b></span>' : '') + '</div>' +
			'<div class="m">' + me.ICON.calendar + '<b>Tháng ' + ky.thang + '/' + ky.nam + '</b></div></div>' +
			'<div class="hbc-cards">' +
			card('Ngày công', fmt(data.cong), '', null) +
			card('<i>★</i>Hoàn thành khoán trọng điểm', totTd == null ? '–' : totTd + '%', tgTd > 0 ? '<b>' + fk(lkTd) + '</b> / ' + fmt(tgTd) + ' két' : 'Chưa có khoán', totTd) +
			card('Hoàn thành khoán tổng', tot == null ? '–' : tot + '%', tg > 0 ? '<b>' + fk(lkAll) + '</b> / ' + fmt(tg) + ' két' : 'Chưa có khoán', tot) +
			'</div>';

		html += '<div class="hbc-tb"><div class="hbc-row hd"><span>Sản phẩm</span><span class="n">Số bán</span><span class="n">Khoán</span><span class="n">Đạt</span></div><div class="hbc-list">';
		if (!codes.length) html += '<div class="hbc-empty">Chưa có sản lượng và chỉ tiêu trong tháng.</div>';
		var lastDt = null;
		codes.forEach(function (m) {
			if (multi && info(m).dt !== lastDt) { lastDt = info(m).dt; html += '<div class="hbc-grp">' + esc(pname(lastDt)) + '</div>'; }
			var f = info(m), kt = (data.names[m] || {}).ket, has = kt > 0;
			var raw = n(data.sold[m]), sk = has ? raw / kt : 0, k = n(data.goal[m]);
			var pct = k > 0 && has ? Math.round(sk * 100 / k) : null, c = pct == null ? "" : lvl(pct);
			var tip = m + ' · Đã bán ' + fmt(raw) + ' ' + unit(m) + (has ? ' = ' + fk(sk) + ' két (' + kt + ' ' + unit(m) + '/két)' : ' — chưa khai quy cách két');
			html += '<div class="hbc-row' + (isTd(m) ? ' td' : '') + '" title="' + esc(tip) + '">' +
				'<span class="nm qx"><span class="t">' + esc(f.ten) + '</span>' + qcach(m) + '</span>' +
				'<span class="n">' + (has ? '<b>' + fk(sk) + '</b>' : '<span class="mu">–</span>') + '</span>' +
				'<span class="n kh">' + (k > 0 ? fk(k) : '<span class="mu">–</span>') + '</span>' +
				'<span class="p ' + c + '">' + (pct == null ? '' : pct + '%') + '</span>' +
				'</div>';
		});
		html += '</div>';
		if (codes.length) {
			var ct = tot == null ? "" : lvl(tot);
			html += '<div class="hbc-row tot">' +
				'<span class="nm">Tổng</span>' +
				'<span class="n">' + fk1(sumSold) + '</span>' +
				'<span class="n kh">' + (sumGoal > 0 ? fk1(sumGoal) : '–') + '</span>' +
				'<span class="p ' + ct + '">' + (tot == null ? '' : tot + '%') + '</span>' +
				'</div>';
		}
		html += '</div>';
		html += '<div class="hbc-note">' + (data.hasTarget ? '' : 'Tháng này chưa khai chỉ tiêu khoán. ') +
			'<b>Lưu ý:</b> Báo cáo được tính số liệu khi đã check out và theo định mức két của sản phẩm.</div></div>';

		var w = Math.min(620, window.innerWidth - 16), maxH = window.innerHeight - 20;
		var h = Math.min(maxH, 380 + (Math.max(1, codes.length) + 1) * 56);
		NUT.w2popup.open({
			title: '📊 <i>Báo cáo làm việc</i>',
			modal: true,
			width: w,
			height: h,
			body: '<div id="hbc-body" style="padding:14px 16px">' + html + '</div>',
			buttons: '<button class="w2ui-btn" onclick="NUT.w2popup.close()">⛌ Đóng</button>'
		});
		var tries = 0, fit = function () {
			var b = document.getElementById("hbc-body"), box = b && b.parentNode, pop = document.getElementById("w2ui-popup");
			if (!b || !box || !pop) { if (++tries < 20) setTimeout(fit, 50); return; }
			var cs = getComputedStyle(box), pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
			var content = Math.max(b.offsetHeight + pad, box.scrollHeight > box.clientHeight ? box.scrollHeight : 0);
			var need = pop.offsetHeight - box.clientHeight + content + 2;
			if (need > maxH) {
				var list = b.querySelector(".hbc-list");
				if (list) list.style.maxHeight = Math.max(140, list.offsetHeight - (need - maxH)) + "px";
				need = maxH;
			}
			box.style.overflow = "hidden";
			if (Math.abs(need - pop.offsetHeight) > 2 && NUT.w2popup.resize) NUT.w2popup.resize(w, need);
			align(); setTimeout(function () { trim(); align(); }, 400);
		};
		var trim = function () {
			var b = document.getElementById("hbc-body"), box = b && b.parentNode, list = b && b.querySelector(".hbc-list");
			if (!box || !list) return;
			var over = box.scrollHeight - box.clientHeight;
			if (over > 0) list.style.maxHeight = Math.max(140, list.offsetHeight - over - 4) + "px";
		};
		var align = function () {
			var b = document.getElementById("hbc-body"), list = b && b.querySelector(".hbc-list"); if (!list) return;
			var sb = list.offsetWidth - list.clientWidth, row = list.querySelector(".hbc-row");
			[].forEach.call(b.querySelectorAll(".hbc-row.hd,.hbc-row.tot"), function (r) {
				r.style.paddingRight = "";
				if (sb > 0) r.style.paddingRight = (parseFloat(getComputedStyle(row || r).paddingRight) + sb) + "px";
			});
		};
		setTimeout(fit, 350);
	}
};