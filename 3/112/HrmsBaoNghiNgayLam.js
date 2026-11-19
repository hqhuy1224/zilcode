var HrmsBaoNghiNgayLam = {
	SERVICE_ID: 3,
	BANG_NV: "ba_ungvien", COT_MANV: "manhanvien",
	url: null,
	dsKhuVuc: [],
	nv: null,
	ngayNghi: null,
	SO_NGAY: 3,

	CSS: "<style>\n.hbn{--pri:#157a5c;--pri-d:#0f5f47;--pri-l:#e7f4ef;--ink:#1d2b3a;--mut:#64748b;--line:#dde4ec;--bg:#f5f7fa;font:13px/1.4 system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--ink);background:var(--bg);height:100%;min-height:0;display:flex;flex-direction:column;text-align:left;container-type:inline-size}\n.hbn *{box-sizing:border-box;min-width:0}.hbn-scroll{flex:1;min-height:0;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px}\n.hbn-hero{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,#157a5c,#1f9a74);color:#fff;flex-shrink:0}.hbn-ico{flex:none;width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center}\n.hbn-hero small{display:block;font-size:10px;opacity:.9;text-transform:uppercase;letter-spacing:.04em}.hbn-date{font-size:22px;font-weight:700;line-height:1.2;font-variant-numeric:tabular-nums}.hbn-thu{display:inline-block;font-size:12px;opacity:.9;margin-left:10px}.hbn-date{display:inline-block}.hbn-card>.hbn-field{display:grid;grid-template-columns:80px minmax(0,1fr);align-items:center;gap:10px}.hbn-card>.hbn-field>span{margin:0}.hbn-card>.hbn-field .hbn-tag{display:none}\n\n.hbn-card{background:#fff;border:1px solid var(--line);border-radius:11px;padding:10px 12px;flex-shrink:0}.hbn-card h4{margin:0 0 7px;font-size:10px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.05em}.hbn-field{display:block;margin:0}.hbn-field>span{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#475569;margin-bottom:4px}.hbn-tag{margin-left:auto;font-size:10px;font-weight:500;font-style:normal;color:var(--mut);background:#f1f5f9;border-radius:999px;padding:1px 7px}.hbn-req{color:#dc2626}.hbn-shifts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:8px}\n.hbn .hbn-input{display:block;width:100%;height:34px;margin:0;border:1px solid var(--line);border-radius:8px;padding:6px 9px;font:inherit;color:var(--ink);background:#fff;box-shadow:none}.hbn .hbn-input:hover{border-color:#b6c4d3}.hbn .hbn-input:focus{outline:0;border-color:var(--pri);box-shadow:0 0 0 2px rgba(21,122,92,.15)}.hbn .hbn-input:disabled{background:#f1f5f9;color:#475569;cursor:not-allowed;opacity:1}.hbn textarea.hbn-input{height:84px;min-height:84px;max-height:84px;resize:none;overflow:auto}.hbn-hint{font-size:11px;color:var(--mut);margin-top:7px;line-height:1.4}.hbn-card.hbn-ngay{padding:6px 12px}.hbn-ngay>.hbn-field{grid-template-columns:70px minmax(0,230px)}.hbn-ngay .hbn-input{height:30px;padding:3px 8px}\n.hbn-note{flex-shrink:0;border-radius:9px;padding:7px 10px;font-size:12px;line-height:1.4;background:#fff7ed;border:1px solid #fdba74;color:#9a3412}.hbn-note[hidden]{display:none}.hbn-note.is-block{background:#fef2f2;border-color:#fecaca;color:#b91c1c}\n.hbn-foot{display:flex;flex:none;gap:8px;justify-content:flex-end;padding:8px 12px;background:#fff;border-top:1px solid var(--line)}.hbn-btn{border:1px solid transparent;border-radius:8px;min-height:36px;padding:7px 16px;font:inherit;font-weight:600;background:var(--pri);color:#fff;cursor:pointer}.hbn-btn:hover:not(:disabled){background:var(--pri-d)}.hbn-btn:disabled{opacity:.6;cursor:progress}.hbn-ghost{background:#fff;color:var(--ink);border-color:var(--line)}.hbn-ghost:hover:not(:disabled){background:#f1f5f9}.hbn-btn:focus-visible{outline:2px solid #78bfa9;outline-offset:2px}\n@container(max-width:380px){.hbn-scroll{padding:10px;gap:8px}.hbn-card{padding:9px 10px}.hbn-shifts{grid-template-columns:1fr;gap:7px;margin-top:7px}.hbn-hero{padding:9px 12px}.hbn-foot .hbn-btn{flex:1}}\n@media(max-height:560px) and (min-width:480px){.hbn-scroll{padding:8px 10px;gap:6px}.hbn-hero{padding:7px 12px}.hbn-ico{width:32px;height:32px}.hbn-date{font-size:20px}.hbn-thu{display:none}.hbn-card{padding:8px 10px}.hbn-foot{padding:8px 10px}.hbn textarea.hbn-input{height:62px;min-height:62px;max-height:62px}}\n</style>",

	$: function (id) { return document.getElementById(id); },
	fmt: function (d) { return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2) + "/" + d.getFullYear(); },
	thu: function (d, ngan) {
		return (ngan ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"])[d.getDay()];
	},
	busy: function (b) {
		var btn = HrmsBaoNghiNgayLam.$("btnGuiNghi");
		if (btn) { btn.disabled = b; btn.textContent = b ? "Đang gửi…" : "Gửi báo nghỉ"; }
	},

	run: function (p) {
		var me = HrmsBaoNghiNgayLam;
		me.url = NUT.services[me.SERVICE_ID].url;
		me.code = String(n$.user.tag || "").trim();
		if (!me.code) { NUT.notify("Tài khoản " + n$.user.username + " chưa được gán mã nhân viên (Tag).", "yellow"); return; }
		NUT.ds.select({
			url: me.url + "data/" + me.BANG_NV,
			select: me.COT_MANV + ",hoten,status,makhuvuc",
			where: [me.COT_MANV, "=", me.code]
		}, function (res) {
			if (!res.success) { NUT.notify("Lỗi đọc thông tin nhân viên!", "red"); return; }
			var nv = res.result[0];
			if (!nv) { NUT.notify("Không tìm thấy nhân viên mã " + me.code + ".", "yellow"); return; }
			NUT.ds.select({ url: me.url + "data/khuvuc", select: "makhuvuc,tenkhuvuc" }, function (r2) {
				me.dsKhuVuc = r2.success ? r2.result : [];
				me.openForm(nv);
			});
		});
	},

	timDoiTac: function (d, cb) {
		var me = HrmsBaoNghiNgayLam;
		NUT.ds.select({
			url: me.url + "data/chitieu",
			select: "madoitac",
			where: [["manhanvien", "=", me.code], ["nam", "=", d.getFullYear()], ["thang", "=", d.getMonth() + 1]]
		}, function (res) {
			var hit = res.success ? res.result.filter(function (x) { return x.madoitac; })[0] : null;
			cb(hit ? hit.madoitac : null);
		});
	},

	openForm: function (nv) {
		var me = HrmsBaoNghiNgayLam;
		me.nv = nv;

		var cbo = document.createElement("select");
		cbo.disabled = !!nv.makhuvuc;
		cbo.id = "cboInOut_MaKhuVuc";
		cbo.className = "hbn-input";
		var first = document.createElement("option");
		first.value = nv.makhuvuc || "";
		first.textContent = nv.makhuvuc ? (me.dsKhuVuc.filter(function (k) { return k.makhuvuc === nv.makhuvuc; })[0] || { tenkhuvuc: nv.makhuvuc }).tenkhuvuc : "Chọn khu vực";
		first.setAttribute("selected", "selected");
		cbo.appendChild(first);
		me.dsKhuVuc.forEach(function (k) {
			if (k.makhuvuc === nv.makhuvuc) return;
			var opt = document.createElement("option");
			opt.value = k.makhuvuc;
			opt.textContent = k.tenkhuvuc || k.makhuvuc;
			cbo.appendChild(opt);
		});
		cbo.setAttribute("onchange", "HrmsBaoNghiNgayLam.maKhuVuc_onChange(this.value)");

		var now = new Date();
		me.ngayNghi = now;

		var ten = ["Hôm nay", "Ngày mai", "Ngày kia"], opts = "";
		for (var d = 0; d < me.SO_NGAY; d++) {
			var dt = new Date();
			dt.setDate(dt.getDate() + d);
			opts += "<option value='" + d + "'>" + (ten[d] ? ten[d] + " · " : "") + me.thu(dt, true) + ", " + me.fmt(dt) + "</option>";
		}

		var body = me.CSS + "<div class='hbn'><div class='hbn-scroll'>" +
				"<div class='hbn-hero'><div class='hbn-ico'><svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2'/><path d='M16 2v4M8 2v4M3 10h18'/></svg></div>" +
				"<div><small>Bạn xin nghỉ làm ngày</small><div class='hbn-date' id='labNgayNghi'>" + me.fmt(now) + "</div><div class='hbn-thu' id='labThu'>" + me.thu(now) + "</div></div></div>" +
				"<div class='hbn-card hbn-ngay'><label class='hbn-field'><span>Ngày nghỉ <b class='hbn-req'>*</b></span>" +
				"<select id='cboNgayNghi' class='hbn-input' onchange='HrmsBaoNghiNgayLam.cboNgayNghi_onChange(this.value)'>" + opts + "</select></label></div>" +
				"<div class='hbn-note' id='hbnNhac' role='status' hidden></div>" +
				"<div class='hbn-card'>" +
				"<label class='hbn-field'><span>Khu vực" + (nv.makhuvuc ? "<em class='hbn-tag'>Theo hồ sơ</em>" : " <b class='hbn-req'>*</b>") + "</span>" + cbo.outerHTML + "</label>" +
				"<div class='hbn-shifts'><label class='hbn-field'><span>Điểm bán · Ca 1</span><select id='cboMaDiemBan' class='hbn-input'></select></label>" +
				"<label class='hbn-field'><span>Điểm bán 2 · Ca 2</span><select id='cboMaDiemBan2' class='hbn-input'></select></label></div>" +
				"<div class='hbn-hint'>Chọn ít nhất 1 điểm bán; hai điểm bán không được trùng nhau.</div></div>" +
				"<div class='hbn-card'><label class='hbn-field'><span>Lý do <b class='hbn-req'>*</b></span>" +
				"<textarea id='txtLyDo' class='hbn-input' rows='2' placeholder='Nhập lý do xin nghỉ…'></textarea></label></div>" +
				"</div><div class='hbn-foot'>" +
				"<button type='button' class='hbn-btn hbn-ghost' onclick='NUT.w2popup.close()'>Hủy</button>" +
				"<button type='button' class='hbn-btn' id='btnGuiNghi' onclick='HrmsBaoNghiNgayLam.guiXinPhep()'>Gửi báo nghỉ</button>" +
				"</div></div>";
		var width = Math.min(560, window.innerWidth - 24);
		NUT.w2popup.open({ title: "Báo nghỉ ngày làm việc", modal: true, width: width, height: Math.min(window.innerWidth < 420 ? 600 : 580, window.innerHeight - 24), buttons: "", body: body });
		me.maKhuVuc_onChange(me.nv.makhuvuc);
		me.nhacTheoNgay();
	},

	docNgay: function (d, callback) {
		var me = HrmsBaoNghiNgayLam;
		NUT.ds.select({
			url: me.url + "data/chamcong",
			select: "chamcong,thoigianden",
			where: [
				["nam", "=", d.getFullYear()], ["thang", "=", d.getMonth() + 1], ["ngay", "=", d.getDate()],
				["manhanvien", "=", me.code]
			]
		}, callback);
	},
	daNghi: function (rows) { return rows.some(function (r) { return !!r.chamcong; }); },
	daCheckIn: function (rows) { return rows.some(function (r) { return !!r.thoigianden; }); },

	nhacTheoNgay: function () {
		var me = HrmsBaoNghiNgayLam, seq = me.nhacSeq = (me.nhacSeq || 0) + 1, box = me.$("hbnNhac"), ngay = me.fmt(me.ngayNghi);
		box.hidden = true;
		if (me.$("txtLyDo")) me.$("txtLyDo").placeholder = "Nhập lý do xin nghỉ…";
		me.docNgay(me.ngayNghi, function (res) {
			if (seq !== me.nhacSeq || !res.success) return;
			var nghi = me.daNghi(res.result), vao = me.daCheckIn(res.result);
			if (!nghi && !vao) return;
			box.className = "hbn-note" + (nghi ? " is-block" : "");
			box.textContent = nghi
				? "Bạn đã báo nghỉ ngày " + ngay + ", không cần gửi lại."
				: "Ngày " + ngay + " bạn đã Check IN. Vẫn báo nghỉ được (ghi riêng, không thay đổi dữ liệu chấm công). Hãy ghi rõ nội dung đột xuất/ngoại lệ ở mục Lý do.";
			var ly = me.$("txtLyDo");
			if (ly) ly.placeholder = nghi ? "Nhập lý do xin nghỉ…" : "Đã Check IN: ghi rõ nội dung đột xuất/ngoại lệ…";
			box.hidden = false;
		});
	},

	maKhuVuc_onChange: function (val) {
		var me = HrmsBaoNghiNgayLam;
		var cbo1 = me.$("cboMaDiemBan"), cbo2 = me.$("cboMaDiemBan2");
		cbo1.innerHTML = "<option value=''>Chọn điểm bán</option>";
		cbo2.innerHTML = cbo1.innerHTML;
		if (!val) return;
		NUT.ds.select({
			url: me.url + "data/diemban",
			where: ["makhuvuc", "=", val]
		}, function (res) {
			if (!res.success) { NUT.notify("Không tải được danh sách Điểm bán.", "red"); return; }
			for (var i = 0; i < res.result.length; i++) {
				var opt = document.createElement("option");
				opt.value = res.result[i].madiemban;
				opt.textContent = res.result[i].tendiemban;
				cbo1.appendChild(opt);
			}
			cbo2.innerHTML = cbo1.innerHTML;
		});
	},

	cboNgayNghi_onChange: function (val) {
		var me = HrmsBaoNghiNgayLam;
		val = parseInt(val, 10);
		me.ngayNghi = new Date();
		me.ngayNghi.setDate(me.ngayNghi.getDate() + val);
		me.$("labNgayNghi").textContent = me.fmt(me.ngayNghi);
		me.$("labThu").textContent = me.thu(me.ngayNghi);
		me.nhacTheoNgay();
	},

	guiXinPhep: function () {
		var me = HrmsBaoNghiNgayLam;
		var lyDo = me.$("txtLyDo").value.trim();
		var db1 = me.$("cboMaDiemBan").value;
		var db2 = me.$("cboMaDiemBan2").value;
		var labNgay = me.$("labNgayNghi").textContent;

		if (!(lyDo && (db1 || db2))) {
			NUT.w2alert("Chọn Ca làm việc và ghi Lý do xin nghỉ!");
			return;
		}
		if (db1 && db2 && db1 == db2) {
			NUT.w2alert("Điểm bán 2 không được trùng Điểm bán!");
			return;
		}

		var nam = me.ngayNghi.getFullYear();
		var thang = me.ngayNghi.getMonth() + 1;
		var ngay = me.ngayNghi.getDate();
		var makhuvuc = me.$("cboInOut_MaKhuVuc").value;
		if (!makhuvuc) { NUT.w2alert("Chọn Khu vực!"); return; }
		me.busy(true);

		// Chỉ chặn gửi trùng báo nghỉ; đã Check IN/OUT vẫn gửi được vì báo nghỉ là bản ghi riêng
		me.docNgay(me.ngayNghi, function (res) {
			if (!res.success) { me.busy(false); NUT.w2alert("Lỗi kiểm tra dữ liệu chấm công!"); return; }
			if (me.daNghi(res.result)) {
				me.busy(false);
				NUT.w2alert("Bạn đã xin nghỉ ngày #" + labNgay);
				return;
			}
			var daCheckIn = me.daCheckIn(res.result);
			me.timDoiTac(me.ngayNghi, function (madoitac) {
			var base = {
				nam: nam, thang: thang, ngay: ngay,
				madoitac: madoitac,
				manhanvien: me.code,
				chamcong: "KL",
				makhuvuc: makhuvuc,
				lydo: lyDo,
				dulieu: 0
			};
			var data = [];
			if (db1) data.push(Object.assign({}, base, { madiemban: db1, lan: 1 }));
			if (db2) data.push(Object.assign({}, base, { madiemban: db2, lan: 2 }));

			NUT.ds.insert({ url: me.url + "data/chamcong", data: data }, function (res) {
				if (res && res.success === false) {
					me.busy(false);
					NUT.w2alert("Gửi xin nghỉ thất bại!" + (res.result ? " " + res.result : ""));
					return;
				}
				if (daCheckIn) NUT.notify("Đã gửi báo nghỉ ngày " + labNgay + ". Ngày này đã có Check IN: dữ liệu chấm công giữ nguyên.", "yellow");
				else NUT.notify("Đã gửi báo nghỉ ngày " + labNgay + ".", "lime");
				NUT.w2popup.close();
			});
			});
		});
	}
};