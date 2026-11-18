var MonthlyMS01Report = {

    url: "",
    serviceIndex: 3,
    domainThiTruong: 1201,
    madoitac: "HABECO",
    template: "MonthlyMS01Report.html",

    /* ================= CẤU HÌNH ================= */

    dinhMucCong: 26,          // "Ngày công chuẩn"
    targetInKet: true,        // chitieu_ct.soluong đã tính theo két/thùng? (false = chai/lon, sẽ chia cho sanpham.ket)
    viewName: "MS03_View",    // view tính sẵn công + sản lượng két theo nhân viên/tháng (dùng cho khối "Tổng kết tháng")
    maField: "dms",           // cột lấy "Mã Điểm bán" trong chamcong_v (thiếu thì dùng madiemban)

    // 8 cột sản phẩm của bảng ngày, đúng thứ tự trên mẫu (sanpham.masanpham viết HOA).
    // Chưa có mã Keg trong sanpham nên cột Keg 1L để trống cho tới khi có mã.
    cols: [
        { codes: ["KEG", "KEG1L"] },
        { codes: ["BOLD"] },
        { codes: ["LIGHT"] },
        { codes: ["BOLDL"] },
        { codes: ["LIGHTL"] },
        { codes: ["TRUCBACHL"] },
        { codes: ["HANOIPREL"] },
        { codes: ["HANOIPRE"] }
    ],

    // 6 nhóm của khối "Tổng kết báo cáo tháng" (khớp data-s trong HTML: kh-<key>, ban-<key>, ch-<key>)
    groups: [
        { key: "keg" }, { key: "bold" }, { key: "light" },
        { key: "tb" }, { key: "prelon" }, { key: "prechai" }
    ],

    // Mã sản phẩm → nhóm (để cộng chỉ tiêu) + hệ số két dự phòng
    products: {
        "KEG":       { g: "keg",     dv: 12 },
        "KEG1L":     { g: "keg",     dv: 12 },
        "BOLD":      { g: "bold",    dv: 20 },
        "BOLDL":     { g: "bold",    dv: 24 },
        "LIGHT":     { g: "light",   dv: 20 },
        "LIGHTL":    { g: "light",   dv: 24 },
        "TRUCBACH":  { g: "tb",      dv: 20 },
        "TRUCBACHL": { g: "tb",      dv: 24 },
        "HANOIPRE":  { g: "prechai", dv: 20 },
        "HANOIPREL": { g: "prelon",  dv: 24 }
    },

    /* ================= TIỆN ÍCH ================= */

    util: {
        num: function (v) { var n = Number(v); return isNaN(n) ? 0 : n; },
        str: function (v) { return v === null || v === undefined ? "" : String(v).trim(); },
        pad2: function (n) { return String(n).padStart(2, "0"); },
        zeros: function (n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; },
        uniq: function (list) {
            var seen = Object.create(null), out = [];
            list.forEach(function (x) {
                x = (x === null || x === undefined) ? "" : String(x).trim();
                if (x && !seen[x]) { seen[x] = true; out.push(x); }
            });
            return out;
        },
        // hiển thị số: tối đa 2 số lẻ, bỏ số 0 thừa; null → để trống
        q: function (v) { return v === null || v === undefined ? "" : String(Math.round(v * 100) / 100); },
        esc: function (s) {
            return String(s).replace(/[&<>"]/g, function (c) {
                return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
            });
        },
        // 07:30:00 → 07:30
        hhmm: function (v) {
            var s = v === null || v === undefined ? "" : String(v).trim();
            var m = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
            return m ? m[1].padStart(2, "0") + ":" + m[2] : s;
        }
    },

    /* ================= HỘP THOẠI ================= */

    run: async function () {
        var self = MonthlyMS01Report, U = self.util, now = new Date();
        self.url = NUT.services[self.serviceIndex].url;

        // danh sách khu vực (tài khoản có giới hạn khu vực thì chỉ thấy khu vực của mình)
        var regions = [];
        try {
            var opt = { select: "makhuvuc,tenkhuvuc,tenthitruong,thitruong,stt", orderby: "stt,thitruong", limit: 5000 };
           // if (n$.user.orgs) opt.where = [["makhuvuc", "in", n$.user.orgs]];
            regions = await self.sel("khuvuc", opt);
        } catch (e) {
            NUT.notify(e.message, "red");
        }

        var kvOptions = "<option value=''>-- Tất cả --</option>" + regions.map(function (r) {
            return "<option value='" + U.esc(r.makhuvuc) + "'>" + U.esc(r.thitruong) + "</option>";
        }).join("");

        NUT.w2popup.open({
            title: "📜 <i>Monthly MS01 - Báo cáo kết quả làm việc</i>",
            modal: true,
            width: 520,
            height: 600,

            body:
                "<table style='margin:auto;width:100%'>" +
                "<tr><td colspan='4'><input id='chk_MS01Blank' type='checkbox' onchange='MonthlyMS01Report.toggleBlank(this.checked)'>" +
                    "<label for='chk_MS01Blank'>In bảng trắng</label></td></tr>" +
                "<tr>" +
                    "<td>Năm</td>" +
                    "<td><input id='num_Year' type='number' style='width:75px' value='" + now.getFullYear() + "'></td>" +
                    "<td>Tháng</td>" +
                    "<td><input id='num_Month' type='number' min='1' max='12' style='width:55px' value='" + (now.getMonth() + 1) + "'></td>" +
                "</tr>" +
                "<tr><td>Đối tác</td><td colspan='3'>" + self.madoitac + "</td></tr>" +
                "<tbody id='ms01_DataFields'>" +
                "<tr>" +
                    "<td>Khu vực</td>" +
                    "<td colspan='3'><select id='cbo_KhuVuc' style='width:250px' onchange='MonthlyMS01Report.loadNhanVien(this.value)'>" + kvOptions + "</select></td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Nhân viên</td>" +
                    "<td colspan='3'><select id='cbo_NhanVien' style='width:250px' disabled><option value=''>-- Chọn khu vực trước --</option></select></td>" +
                "</tr>" +
                "</tbody>" +
                "<tbody id='ms01_BlankFields' hidden>" +
                    self.blankFields.map(function (f) {
                        return "<tr><td colspan='2'><label for='ms01_blank_" + f.key + "'>" + f.label + "</label></td>" +
                            "<td colspan='2'><input class='w2ui-input' id='ms01_blank_" + f.key + "' type='" + (f.type || "text") +
                            "' style='width:100%' value='" + U.esc(f.value || "") + "'></td></tr>";
                    }).join("") +
                    "<tr><td colspan='4'>Bảng số liệu và thông tin nhân viên, điểm bán sẽ để trống.</td></tr>" +
                "</tbody></table>",

            buttons:
                "<button class='w2ui-btn' onclick='NUT.w2popup.close()'>⛌ Close</button>" +
                "<button class='w2ui-btn' onclick='MonthlyMS01Report.runReport()'>✔️ Xuất báo cáo</button>"
        });
    },

    blankFields: [
        { key: "tl", label: "TL/PG Sup" },
        { key: "gs", label: "Giám sát khu vực" },
        { key: "kv", label: "Khu vực/Thị trường" },
        { key: "hnb", label: "HNB", value: "HNB" },
        { key: "mahieu", label: "Mã hiệu", value: "QT.01/HNB.TM-01/NVTT" },
        { key: "bhsd", label: "BH/SĐ", value: "1/0" },
        { key: "ngay", label: "Ngày", type: "date", value: "2026-05-04" }
    ],

    toggleBlank: function (checked) {
        document.getElementById("ms01_DataFields").hidden = checked;
        document.getElementById("ms01_BlankFields").hidden = !checked;
    },

    buildBlankModel: function (nam, thang, fields) {
        var nDays = new Date(nam, thang, 0).getDate();
        var rows = [];
        for (var d = 0; d < nDays; d++) rows.push(new Array(32).fill(""));
        return {
            nam: nam, thang: thang, nDays: nDays, blank: true, warnings: [],
            pages: [Object.assign({ rows: rows }, fields)]
        };
    },

    // Chọn khu vực → nạp danh sách nhân viên của khu vực đó (bỏ qua kết quả cũ nếu người dùng đổi khu vực nhanh)
    loadNhanVien: async function (makhuvuc) {
        var self = MonthlyMS01Report, U = self.util;
        var box = document.getElementById("cbo_NhanVien");
        if (!box) return;

        var seq = self.nvSeq = (self.nvSeq || 0) + 1;

        if (!makhuvuc) {
            box.innerHTML = "<option value=''>-- Chọn khu vực trước --</option>";
            box.disabled = true;
            return;
        }

        box.disabled = true;
        box.innerHTML = "<option value=''>Đang tải…</option>";

        try {
            var rows = await self.sel("ba_ungvien", {
                select: "manhanvien,hoten", orderby: "hoten", limit: 5000,
                where: [["makhuvuc", "=", makhuvuc]]
            });
            if (seq !== self.nvSeq) return;

            box = document.getElementById("cbo_NhanVien");
            if (!box) return;
            box.innerHTML = "<option value=''>-- Tất cả --</option>" + rows.map(function (r) {
                return "<option value='" + U.esc(r.manhanvien) + "'>" + U.esc(r.hoten || "") + " · " + U.esc(r.manhanvien) + "</option>";
            }).join("");
            box.disabled = false;
        } catch (e) {
            if (seq !== self.nvSeq) return;
            box = document.getElementById("cbo_NhanVien");
            if (box) box.innerHTML = "<option value=''>-- Tất cả --</option>";
            NUT.notify(e.message, "red");
        }
    },

    /* ================= ĐỌC DỮ LIỆU ================= */

    // Đọc một bảng/view; lỗi hoặc chạm giới hạn dòng thì báo ngay (không âm thầm thiếu số liệu).
    sel: function (table, options) {
        var self = MonthlyMS01Report;

        return new Promise(function (resolve, reject) {
            try {
                NUT.ds.select(Object.assign({ url: self.url + "data/" + table }, options), function (res) {
                    if (!res || !res.success) {
                        return reject(new Error("Không đọc được dữ liệu " + table + "." +
                            (res && typeof res.result === "string" ? " " + res.result : "")));
                    }
                    var rows = res.result || [];
                    if (options.limit && rows.length >= options.limit) {
                        return reject(new Error(table + " vượt giới hạn " + options.limit +
                            " dòng nên số liệu sẽ không đầy đủ. Hãy thu hẹp bộ lọc (chọn khu vực hoặc nhân viên)."));
                    }
                    resolve(rows);
                });
            } catch (e) { reject(e); }
        });
    },

    // Đọc theo danh sách id, chia từng đợt (mỗi đợt tối đa ~24 dòng chi tiết / id nên chưa chạm giới hạn).
    selectIn: async function (table, field, ids, options, chunk) {
        var self = MonthlyMS01Report, jobs = [], out = [];
        chunk = chunk || 400;

        for (var i = 0; i < ids.length; i += chunk) {
            jobs.push(self.sel(table, Object.assign({}, options, {
                where: [[field, "in", ids.slice(i, i + chunk).join("','")]]
            })));
        }

        (await Promise.all(jobs)).forEach(function (part) { out = out.concat(part); });
        return out;
    },

    runReport: async function () {
        var self = MonthlyMS01Report, U = self.util;

        var nam = Number(document.getElementById("num_Year").value);
        var thang = Number(document.getElementById("num_Month").value);

        if (!Number.isInteger(nam) || nam < 1 || nam > 9999 ||
            !Number.isInteger(thang) || thang < 1 || thang > 12) {
            NUT.notify("Nhập năm, tháng hợp lệ trước khi thực hiện!", "yellow");
            return;
        }

        var blankBox = document.getElementById("chk_MS01Blank");
        if (blankBox && blankBox.checked) {
            var fields = {};
            self.blankFields.forEach(function (f) {
                fields[f.key] = U.str(document.getElementById("ms01_blank_" + f.key).value);
            });
            if (fields.ngay) fields.ngay = fields.ngay.split("-").reverse().join("/");
            self.openReport(self.buildBlankModel(nam, thang, fields));
            return;
        }

        var kvBox = document.getElementById("cbo_KhuVuc");
        var makhuvuc = kvBox.value;
        if (makhuvuc === "") {
            NUT.notify("Chọn khu vực trước khi xuất báo cáo!", "yellow");
            return;
        }
        var thiTruongText = !makhuvuc && n$.user.kvhcnames
            ? n$.user.kvhcnames
            : (kvBox && makhuvuc && kvBox.selectedIndex >= 0 ? kvBox.options[kvBox.selectedIndex].text : "");

        var manv = U.str((document.getElementById("cbo_NhanVien") || {}).value);
       // var dulieu = document.getElementById("chk_Edit").checked ? 1 : 0;
        var date = nam + "-" + U.pad2(thang) + "-15";

        var where = [["nam", "=", nam], ["thang", "=", thang], ["madoitac", "=", self.madoitac] /*, ["dulieu", "=", dulieu] */];
        if (makhuvuc) where.push(["makhuvuc", "=", makhuvuc]);
       // else if (n$.user.orgs) where.push(["makhuvuc", "in", n$.user.orgs]);
        if (manv) where.push(["manhanvien", "=", manv]);

        var nvWhere = [["nam", "=", nam], ["thang", "=", thang], ["madoitac", "=", self.madoitac]];
        if (manv) nvWhere.push(["manhanvien", "=", manv]);

        try {
            var got = await Promise.all([
                self.sel("chamcong_v", { limit: 20000, orderby: "sttkv,stt,madiemban,ngay", where: where }),
                // TL (Team Leader), TF (Task Force), GDCN (giám sát khu vực) còn hiệu lực ngày 15 của tháng
                self.sel("chucvuhabeco", {
                    limit: 10000,
                    where: [
                        ["machucvu", "in", "TF','TL','GDCN"],
                        ["or", ["ngaybatdau", "is", null], ["ngaybatdau", "<=", date]],
                        ["or", ["ngayketthuc", "is", null], ["ngayketthuc", ">=", date]]
                    ]
                }),
                self.sel("chitieu", { limit: 20000, where: nvWhere }),
                // công + sản lượng két theo nhân viên cho khối "Tổng kết tháng" (cùng nguồn với báo cáo MS03)
                self.sel(self.viewName, { limit: 20000, where: nvWhere }),
                self.sel("sanpham", {
                    select: "masanpham,tensanpham,trongdiem,ket",
                    limit: 5000,
                    where: [["madoitac", "=", self.madoitac]]
                })
            ]);

            var records = got[0], cvRows = got[1], heads = got[2], viewRows = got[3], sanpham = got[4];

            if (!records.length) {
                NUT.notify("Không có dữ liệu báo cáo!", "yellow");
                return;
            }

            // chỉ lấy chi tiết của các lần có Check IN (chỉ những lần này có sản lượng)
            var ids = [], seen = Object.create(null);
            records.forEach(function (r) {
                if (r.idchamcong === null || r.idchamcong === undefined || !U.str(r.thoigianden)) return;
                var id = String(r.idchamcong);
                if (!seen[id]) { seen[id] = true; ids.push(id); }
            });

            var headIds = heads.map(function (h) { return h.idchitieu; })
                .filter(function (x) { return x !== null && x !== undefined; });

            var parts = await Promise.all([
                ids.length ? self.selectIn("chamcong_ct", "idchamcong", ids, { limit: 20000 }) : [],
                headIds.length ? self.selectIn("chitieu_ct", "idchitieu", headIds, { limit: 20000 }) : []
            ]);

            var model = self.buildModel({
                nam: nam, thang: thang, thiTruongText: thiTruongText,
                records: records, details: parts[0], cvRows: cvRows,
                ctHeads: heads, ctDetails: parts[1], viewRows: viewRows, sanpham: sanpham
            });

            self.openReport(model);

        } catch (e) {
            console.error(e);
            NUT.notify(e.message, "red");
        }
    },

    /* ================= TÍNH SỐ LIỆU (không đụng tới giao diện) =================
       Mỗi trang = một nhân viên tại một điểm bán, với các ngày trong tháng.
       Trong ngày (có thể nhiều lần Check IN/OUT tại cùng điểm):
         tồn đầu  = tồn đầu của lần đầu tiên có số liệu
         nhập     = tổng nhập các lần
         bán      = tổng (tồn đầu + nhập − tồn cuối) các lần đã có tồn cuối (không âm)
         tồn cuối = tồn cuối của lần sau cùng có số liệu
       Khối "Tổng kết tháng" lấy công và số bán (két) của cả tháng từ view MS03_View,
       so với chỉ tiêu (chitieu_ct) của nhân viên.
    */
    buildModel: function (inp) {
        var self = MonthlyMS01Report, U = self.util, G = self.groups, NG = G.length, NC = self.cols.length;
        var nDays = new Date(inp.nam, inp.thang, 0).getDate();
        var unmapped = Object.create(null), noCol = Object.create(null);

        var groupIndex = {};
        G.forEach(function (g, i) { groupIndex[g.key] = i; });

        var codeCol = Object.create(null);
        self.cols.forEach(function (c, i) { c.codes.forEach(function (k) { codeCol[k] = i; }); });

        // hệ số két theo sanpham.ket (chỉ cần khi chỉ tiêu tính theo chai/lon)
        var ketOf = Object.create(null);
        (inp.sanpham || []).forEach(function (x) { ketOf[U.str(x.masanpham).toUpperCase()] = U.num(x.ket); });

        // bỏ trùng theo idchamcong (view JOIN TL/TF làm một bản ghi xuất hiện 2 lần)
        var seenId = Object.create(null), records = [];
        (inp.records || []).forEach(function (r) {
            if (r.idchamcong !== null && r.idchamcong !== undefined) {
                var id = String(r.idchamcong);
                if (seenId[id]) return;
                seenId[id] = true;
            }
            records.push(r);
        });

        // chi tiết sản lượng: idchamcong → mã → {a, n, c}; mỗi (mã, loại) lấy dòng đầu tiên
        var KIND = { 0: "a", 1: "c", 2: "n" };
        var bag = Object.create(null);
        (inp.details || []).forEach(function (row) {
            var id = String(row.idchamcong), code = U.str(row.masanpham).toUpperCase(), f = KIND[Number(row.daucuoi)];
            if (!code || !f) return;
            var per = bag[id] || (bag[id] = Object.create(null));
            var x = per[code] || (per[code] = {});
            if (x[f] === undefined) x[f] = Math.max(0, U.num(row.soluong));
        });

        // Team Leader / Task Force / Giám sát theo khu vực
        var role = { TL: Object.create(null), TF: Object.create(null), GDCN: Object.create(null) };
        (inp.cvRows || []).forEach(function (cv) {
            var c = U.str(cv.machucvu).toUpperCase();
            if (role[c]) role[c][U.str(cv.makhuvuc)] = U.str(cv.hoten);
        });

        // chỉ tiêu theo nhân viên (két/thùng, cộng theo nhóm)
        var idToNv = Object.create(null);
        (inp.ctHeads || []).forEach(function (h) { idToNv[String(h.idchitieu)] = U.str(h.manhanvien); });
        var target = Object.create(null);
        (inp.ctDetails || []).forEach(function (d) {
            var ma = idToNv[String(d.idchitieu)];
            if (!ma) return;
            var code = U.str(d.masanpham).toUpperCase(), base = self.products[code];
            if (!base) { unmapped[code || "(trống)"] = true; return; }
            var q = U.num(d.soluong);
            if (!self.targetInKet) q = q / (ketOf[code] > 0 ? ketOf[code] : base.dv);
            var t = target[ma] || (target[ma] = U.zeros(NG));
            t[groupIndex[base.g]] += q;
        });

        // công + két đã bán trong tháng (view)
        var viewBy = Object.create(null);
        (inp.viewRows || []).forEach(function (v) { viewBy[U.str(v.manhanvien)] = v; });

        // gom bản ghi theo (nhân viên, điểm bán): chỉ các lần có Check IN
        var pagesBy = Object.create(null), order = [];
        records.forEach(function (r) {
            var ma = U.str(r.manhanvien), pt = U.str(r.madiemban);
            if (!ma || !pt || !U.str(r.thoigianden)) return;
            var key = ma + "\u0001" + pt;
            var p = pagesBy[key];
            if (!p) { p = pagesBy[key] = { ma: ma, pt: pt, recs: [], info: r }; order.push(p); }
            p.recs.push(r);
        });

        var perNv = Object.create(null);     // mã nhân viên → số điểm bán
        order.forEach(function (p) { perNv[p.ma] = (perNv[p.ma] || 0) + 1; });

        order.sort(function (a, b) {
            return (U.num(a.info.sttkv) - U.num(b.info.sttkv)) ||
                   U.str(a.info.makhuvuc).localeCompare(U.str(b.info.makhuvuc)) ||
                   (U.num(a.info.stt) - U.num(b.info.stt)) ||
                   a.ma.localeCompare(b.ma) || a.pt.localeCompare(b.pt);
        });

        var noView = Object.create(null), noCt = Object.create(null), multi = Object.create(null);

        var pages = order.map(function (p) {
            var info = p.info, kv = U.str(info.makhuvuc);

            // số liệu từng ngày: days[d][c] = { a, n, c, ban }
            var days = [];
            for (var d = 0; d <= nDays; d++) days.push(null);

            p.recs.slice().sort(function (x, y) { return U.num(x.lan) - U.num(y.lan); }).forEach(function (r) {
                var day = Number(r.ngay);
                if (!(day >= 1 && day <= nDays)) return;
                var per = bag[String(r.idchamcong)];
                if (!per) return;

                Object.keys(per).forEach(function (code) {
                    var ci = codeCol[code];
                    if (ci === undefined) {
                        if (self.products[code]) noCol[code] = true; else unmapped[code] = true;
                        return;
                    }
                    var x = per[code];
                    var row = days[day] || (days[day] = []);
                    var cell = row[ci] || (row[ci] = { a: null, n: null, c: null, ban: null });

                    if (cell.a === null && x.a !== undefined) cell.a = x.a;
                    if (x.n !== undefined) cell.n = (cell.n || 0) + x.n;
                    if (x.c !== undefined) {
                        cell.c = x.c;
                        cell.ban = (cell.ban || 0) + Math.max(0, (x.a || 0) + (x.n || 0) - x.c);
                    }
                });
            });

            // 4 khối x 8 cột chuỗi hiển thị cho từng ngày
            var rows = [];
            for (var dd = 1; dd <= nDays; dd++) {
                var out = [], src = days[dd] || [];
                ["a", "n", "ban", "c"].forEach(function (f) {
                    for (var c = 0; c < NC; c++) out.push(src[c] ? U.q(src[c][f]) : "");
                });
                rows.push(out);
            }

            // khối tổng kết tháng
            var v = viewBy[p.ma] || null, ct = target[p.ma] || null;
            if (!v) noView[p.ma] = true;
            if (!ct) noCt[p.ma] = true;
            if (perNv[p.ma] > 1) multi[p.ma] = true;

            var sum = { groups: [], tot: { kh: 0, ban: 0 }, cong: v ? U.num(v.cong) : 0, hasView: !!v, hasCt: !!ct };
            G.forEach(function (g, i) {
                var kh = ct ? ct[i] : 0, ban = v ? Math.max(0, U.num(v[g.key + "_ket"])) : 0;
                sum.groups.push({ key: g.key, kh: kh, ban: ban, show: kh > 0 || ban > 0 });
                sum.tot.kh += kh;
                sum.tot.ban += ban;
            });

            var diaChi = U.uniq([info.sonha, info.duong, info.huyen]).join(", ");
            var gio = [U.hhmm(info.gioden) && U.hhmm(info.giove) ? U.hhmm(info.gioden) + " - " + U.hhmm(info.giove) : "",
                       U.hhmm(info.gioden2) && U.hhmm(info.giove2) ? U.hhmm(info.gioden2) + " - " + U.hhmm(info.giove2) : ""]
                       .filter(function (shift) { return shift && shift !== "00:00 - 00:00"; }).join("; ");

            return {
                ma: p.ma,
               // kv: U.str(info.tenkhuvuc,"/",U.str(info.tenthitruong)) || "",
                kv: [U.str(info.tenkhuvuc),U.str(info.tenthitruong)].filter(Boolean).join(" / "),
                nv: U.str(info.hotenNVTT) || U.str(info.hoten) || p.ma,
                tl: role.TL[kv] || "",
                tf: role.TF[kv] || "",
                gs: role.GDCN[kv] || "",
                ten: U.str(info.tendiemban),
                diachi: diaChi,
                maDiemBan: U.str(info[self.maField]) || p.pt,
                gio: gio,
                rows: rows,
                sum: sum
            };
        });

        // var warnings = [], list;
        // if ((list = Object.keys(unmapped)).length) {
        //     warnings.push("Mã sản phẩm chưa map nên bị bỏ qua: " + list.join(", ") + ". Bổ sung vào MonthlyMS01Report.cols / products.");
        // }
        // if ((list = Object.keys(noCol)).length) {
        //     warnings.push("Mã " + list.join(", ") + " có sản lượng nhưng bảng ngày không có cột tương ứng (vẫn nằm trong khối tổng kết tháng).");
        // }
        // if ((list = Object.keys(noView)).length) {
        //     warnings.push(list.length + " nhân viên chưa có trong " + self.viewName + " nên công và số bán tháng = 0.");
        // }
        // if ((list = Object.keys(noCt)).length) {
        //     warnings.push(list.length + " nhân viên chưa có chỉ tiêu tháng " + U.pad2(inp.thang) + "/" + inp.nam + " (SL khoán để trống).");
        // }
        // if ((list = Object.keys(multi)).length) {
        //     warnings.push(list.length + " nhân viên làm từ 2 điểm bán trở lên (" + list.slice(0, 5).join(", ") +
        //         (list.length > 5 ? "..." : "") + "): khối tổng kết tháng tính trên TẤT CẢ điểm bán của nhân viên, bảng ngày chỉ của điểm bán trên trang.");
        // }
        // if (!self.cols[0].codes.some(function (c) { return (inp.sanpham || []).some(function (x) { return U.str(x.masanpham).toUpperCase() === c; }); })) {
        //     warnings.push("Cột Keg 1L để trống vì danh mục sanpham chưa có mã keg.");
        // }

        return { nam: inp.nam, thang: inp.thang, nDays: nDays, pages: pages };
    },

    /* ================= VẼ BÁO CÁO ================= */

    openReport: function (model) {
        var self = MonthlyMS01Report;
        var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/" + self.template);

        if (!win) {
            NUT.notify("Trình duyệt đã chặn cửa sổ báo cáo!", "yellow");
            return;
        }

        var tries = 0;
        var timer = setInterval(function () {
            var ready = false;
            try {
                ready = win.document.readyState !== "loading" && !!win.document.querySelector("#divReport table.rpt");
            } catch (e) {}

            if (ready) {
                clearInterval(timer);
                try {
                    self.draw(win.document, model);
                } catch (err) {
                    console.error(err);
                    NUT.notify("Lỗi vẽ báo cáo: " + err.message, "red");
                }
            } else if (++tries > 100) {
                clearInterval(timer);
                NUT.notify("Không mở được template " + self.template + " (kiểm tra tên file/đường dẫn).", "yellow");
            }
        }, 100);
    },

    draw: function (doc, m) {
        var self = MonthlyMS01Report, U = self.util, NG = self.groups.length;

        var box = doc.getElementById("divReport");
        var tpl = box && box.querySelector("table.rpt");
        if (!tpl) throw new Error("Template HTML thiếu bảng .rpt trong #divReport");

        var proto = tpl.cloneNode(true);
        box.innerHTML = "";

        var THU = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

        function setF(t, name, value) {
            var elements = t.querySelectorAll('[data-f="' + name + '"]');
            Array.prototype.forEach.call(elements, function (e) {
                e.textContent = value === null || value === undefined ? "" : String(value);
            });
        }
        function setS(t, name, value) {
            var e = t.querySelector('[data-s="' + name + '"]');
            if (e) e.textContent = value === null || value === undefined ? "" : String(value);
        }

        m.pages.forEach(function (pg) {
            var t = proto.cloneNode(true);
            var template = doc.defaultView && doc.defaultView.MS01Template;
            if (template) template.layout(t, m.nDays);

            setF(t, "thang", U.pad2(m.thang));
            setF(t, "nam", m.nam);
            setF(t, "kv", pg.kv);
            setF(t, "nv", pg.nv);
            setF(t, "tl", pg.tl);
            setF(t, "tf", pg.tf);
            setF(t, "gs", pg.gs);
            setF(t, "ten", pg.ten);
            setF(t, "diachi", pg.diachi);
            setF(t, "ma", pg.maDiemBan);
            setF(t, "gio", pg.gio);
            if (m.blank) {
                ["hnb", "mahieu", "bhsd", "ngay"].forEach(function (name) {
                    setF(t, name, pg[name]);
                });
            }

            // các dòng ngày
            var trs = t.querySelectorAll("tbody tr.d");
            Array.prototype.forEach.call(trs, function (tr) {
                var d = Number(tr.getAttribute("data-day"));
                if (d > m.nDays) { tr.parentNode.removeChild(tr); return; }

                var g = new Date(m.nam, m.thang - 1, d).getDay();
                tr.cells[0].textContent = U.pad2(d);
                tr.cells[1].textContent = THU[g];
                tr.classList.toggle("sun", g === 0);

                var vals = pg.rows[d - 1];
                for (var i = 0; i < 32; i++) tr.cells[2 + i].textContent = vals[i];
            });

            // ô gộp dọc co lại theo số ngày của tháng (28–31)
            var xn = t.querySelector("td.xn");
            if (xn) xn.rowSpan = m.nDays + 2;
            var sgb = t.querySelector("td.sgb");
            if (sgb) sgb.rowSpan = m.nDays - 11;

            // khối tổng kết tháng
            if (m.blank) {
                Array.prototype.forEach.call(t.querySelectorAll("[data-s], [data-total]"), function (e) {
                    e.textContent = "";
                });
                box.appendChild(t);
                return;
            }
            var s = pg.sum;
            s.groups.forEach(function (g) {
                setS(t, "kh-" + g.key, g.kh > 0 ? U.q(g.kh) : "");
                setS(t, "ban-" + g.key, g.show ? U.q(g.ban) : "");
                setS(t, "ch-" + g.key, "");
            });
            setS(t, "kh-tot", s.hasCt ? U.q(s.tot.kh) : "");
            setS(t, "ban-tot", s.hasView ? U.q(s.tot.ban) : "");
            setS(t, "ch-tot", "");
            setS(t, "congchuan", self.dinhMucCong);
            setS(t, "congthuc", s.hasView ? U.q(s.cong) : "");

            box.appendChild(t);
        });

        var warn = doc.getElementById("divWarn");
        if (warn) {
            if (m.warnings && m.warnings.length) {
                warn.innerHTML = m.warnings.map(function (w) { return "⚠ " + U.esc(w); }).join("<br>");
                warn.hidden = false;
            } else {
                warn.hidden = true;
            }
        }

        if (!m.pages.length) {
            box.innerHTML = "<p style='padding:20px'>Không có nhân viên nào có Check IN trong tháng.</p>";
        }
    }
};
