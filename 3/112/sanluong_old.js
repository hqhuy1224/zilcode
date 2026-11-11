var DailySanLuongReport = {

    url: "",
    serviceIndex: 3,        // NUT.services[...]
    domainThiTruong: 1201,  // NUT.domains[...]

    // 8 sản phẩm theo từng ngày. dv = hệ số quy đổi (sản lượng / dv = thùng/két).
    // td = true: thuộc nhóm "trọng điểm" (so với chỉ tiêu Bold + Light).
    products: [
        { key: "keg",       label: "Keg 1L",              dv: 12, td: false },
        { key: "bold",      label: "Bold chai 20",        dv: 20, td: true  },
        { key: "light",     label: "Light chai 20",       dv: 20, td: true  },
        { key: "boldl",     label: "Bold lon 24",         dv: 24, td: true  },
        { key: "lightl",    label: "Light lon 24",        dv: 24, td: true  },
        { key: "trucbachl", label: "Trúc Bạch 24",        dv: 24, td: false },
        { key: "hanoiprel", label: "HN Pre lon stock 24", dv: 24, td: false },
        { key: "hanoipre",  label: "HN Pre chai 20",      dv: 20, td: false }
    ],

    // Các cột chỉ tiêu (field của bảng chitieu)
    ctCols: [
        { key: "keg",       label: "Keg 1L" },
        { key: "bold",      label: "Bold" },
        { key: "light",     label: "Light" },
        { key: "trucbach",  label: "Trúc Bạch" },
        { key: "hanoiprel", label: "HN Pre lon stock" },
        { key: "hanoipre",  label: "HN Pre chai" }
    ],

    widthFixed: [30, 85, 80, 130, 170, 60, 65, 140, 55, 160, 90, 70],
    freezeCols: 5,
    widthSP: 42,
    widthSum: 46,
    widthCT: 58,


    // ================= POPUP =================

    run: function () {

        var now = new Date();
        var self = DailySanLuongReport;

        self.url = NUT.services[self.serviceIndex].url;

        NUT.w2popup.open({
            title: "📜 <i>Daily Sản lượng Report</i>",
            modal: true,
            width: 380,
            height: 250,

            body:
                "<table style='margin:auto'>" +
                "<tr>" +
                    "<td>Năm</td>" +
                    "<td><input id='num_Year' type='number' style='width:75px' value='" + now.getFullYear() + "'></td>" +
                    "<td>Tháng</td>" +
                    "<td><input id='num_Month' type='number' min='1' max='12' style='width:55px' value='" + (now.getMonth() + 1) + "'></td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Thị trường</td>" +
                    "<td colspan='3'>" + NUT.outerCboHTML(NUT.domains[self.domainThiTruong].items, "cbo_ThiTruong") + "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Vị trí</td>" +
                    "<td colspan='3'>" +
                        "<select id='cbo_ViTriLv'>" +
                            "<option value='' selected>-- Tất cả --</option>" +
                            "<option value='BA'>BA</option>" +
                            "<option value='BA_'>BA_PartTime</option>" +
                        "</select>" +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td colspan='4'>" +
                        "<input id='chk_Edit' type='checkbox'>" +
                        "<label for='chk_Edit'>Dùng dữ liệu hiệu chỉnh</label>" +
                    "</td>" +
                "</tr>" +
                "</table>",

            buttons:
                "<button class='w2ui-btn' onclick='NUT.w2popup.close()'>⛌ Close</button>" +
                "<button class='w2ui-btn' onclick='DailySanLuongReport.runReport()'>✔️ Xuất báo cáo</button>"
        });
    },


    // ================= LẤY DỮ LIỆU =================

    runReport: function () {

        var self = DailySanLuongReport;

        var nam = Number(document.getElementById("num_Year").value);
        var thang = Number(document.getElementById("num_Month").value);

        if (!nam || !thang || thang < 1 || thang > 12) {
            NUT.alert("Nhập năm, tháng trước khi thực hiện!", "yellow");
            return;
        }

        var cbo = document.getElementById("cbo_ThiTruong");
        var thiTruong = cbo ? cbo.value : "";
        var thiTruongText = "";
        if (cbo && cbo.options && cbo.selectedIndex >= 0 && thiTruong) {
            thiTruongText = cbo.options[cbo.selectedIndex].text;
        }

        var vitrilv = document.getElementById("cbo_ViTriLv").value;
        var dulieu = document.getElementById("chk_Edit").checked ? 1 : 0;
        var date = nam + "-" + String(thang).padStart(2, "0") + "-15";

        // 1. Chức vụ TF / TL / GDCN còn hiệu lực ngày 15 của tháng
        NUT.ds.select({
            url: self.url + "data/chucvuhabeco",
            limit: 10000,
            where: [
                ["machucvu", "in", "TF','TL','GDCN"],
                ["or", ["ngaybatdau", "is", null], ["ngaybatdau", "<=", date]],
                ["or", ["ngayketthuc", "is", null], ["ngayketthuc", ">=", date]]
            ]
        }, function (res2) {

            if (!res2.success) {
                NUT.alert("Không lấy được dữ liệu chức vụ!", "yellow");
                return;
            }

            var lookupTL = {}, lookupTF = {}, gdcn = [];
            (res2.result || []).forEach(function (cv) {
                if (cv.machucvu == "TL") lookupTL[cv.makhuvuc] = cv.hoten;
                else if (cv.machucvu == "TF") lookupTF[cv.makhuvuc] = cv.hoten;
                else if (cv.machucvu == "GDCN" && cv.hoten && gdcn.indexOf(cv.hoten) < 0) gdcn.push(cv.hoten);
            });

            // 2. Chỉ tiêu của nhân viên trong tháng
            NUT.ds.select({
                url: self.url + "data/chitieu",
                limit: 20000,
                where: [["nam", "=", nam], ["thang", "=", thang], ["madoitac", "=", "HABECO"]]
            }, function (res3) {

                if (!res3.success) {
                    NUT.alert("Không lấy được dữ liệu chỉ tiêu!", "yellow");
                    return;
                }

                var lookupChiTieu = {};
                (res3.result || []).forEach(function (ct) {
                    lookupChiTieu[ct.manhanvien] = ct;
                });

                // 3. Chấm công + sản lượng
                var where = [["nam", "=", nam], ["thang", "=", thang], ["dulieu", "=", dulieu]];
                if (thiTruong) where.push(["thitruong", "=", thiTruong]);
                if (vitrilv == "BA") where.push(["vitrilv", "=", "BA"]);
                else if (vitrilv) where.push(["vitrilv", "like", vitrilv + "*"]);

                NUT.ds.select({
                    url: self.url + "data/chamcong_v",
                    limit: 50000, // view JOIN cả TL và TF nên số dòng có thể gấp đôi
                    orderby: "sttkv,stt,madiemban",
                    where: where
                }, function (res) {

                    if (!(res.success && res.result.length)) {
                        NUT.alert("No data to report!", "yellow");
                        return;
                    }

                    self.renderReport(res.result, nam, thang, thiTruongText, lookupTL, lookupTF, gdcn, lookupChiTieu);
                });
            });
        });
    },


    // ================= VẼ BÁO CÁO =================

    renderReport: function (data, nam, thang, thiTruongText, lookupTL, lookupTF, gdcn, lookupChiTieu) {

        var self = DailySanLuongReport;

        var win = window.open("site/" + n$.user.siteid + "/" + n$.app.appid + "/DailySanLuongReport.html");

        if (!win) {
            NUT.alert("Trình duyệt đã chặn cửa sổ báo cáo!", "yellow");
            return;
        }

        var draw = function () {

            var doc = win.document;

            var need = ["tblReport", "tblHead", "tblData", "labGDCN", "labThangNam", "labThiTruong", "labNgayBaoCao"];
            var missing = need.filter(function (id) { return !doc.getElementById(id); });
            if (missing.length) {
                NUT.alert("Template HTML thiếu id: " + missing.join(", "), "yellow");
                return;
            }

            var table = doc.getElementById("tblReport");
            var head = doc.getElementById("tblHead");
            var body = doc.getElementById("tblData");

            var P = self.products, NP = P.length;
            var CT = self.ctCols, NCT = CT.length;
            var soNgay = new Date(nam, thang, 0).getDate();

            // ---------- tiện ích ----------
            function num(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
            function pad2(n) { return String(n).padStart(2, "0"); }
            function r1(v) { return String(Math.round(v * 10) / 10); }
            function r2(v) { return String(Math.round(v * 100) / 100); }
            function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
            function pct(a, b) { return b ? Math.round(100 * a / b) + "%" : ""; }

            // ---------- tiêu đề trang ----------
            doc.getElementById("labGDCN").textContent = gdcn.join(" + ");
            doc.getElementById("labThangNam").textContent = pad2(thang) + "/" + nam;
            doc.getElementById("labThiTruong").textContent = thiTruongText || n$.user.kvhcnames || "Tất cả";
            doc.getElementById("labNgayBaoCao").textContent = "Ngày báo cáo: " + new Date().toLocaleString("vi-VN");

            // ---------- chống trùng bản ghi (view JOIN TL/TF) ----------
            var seenId = Object.create(null);
            var rows = data.filter(function (rec) {
                if (rec.idchamcong === null || rec.idchamcong === undefined) return true;
                var id = String(rec.idchamcong);
                if (seenId[id]) return false;
                seenId[id] = true;
                return true;
            });

            // ---------- gom: mỗi (nhân viên, điểm bán) một dòng ----------
            var groups = Object.create(null);

            rows.forEach(function (rec) {
                var key = JSON.stringify([rec.manhanvien, rec.madiemban]);
                var g = groups[key];
                if (!g) g = groups[key] = { info: rec, days: [] };

                var day = Number(rec.ngay);
                if (!day || day < 1 || day > soNgay) return;

                var arr = g.days[day];
                if (!arr) arr = g.days[day] = zeros(NP);
                for (var j = 0; j < NP; j++) {
                    arr[j] += Math.max(0, num(rec[P[j].key])); // nhiều bản ghi cùng ngày: cộng dồn
                }
            });

            var keys = Object.keys(groups).sort(function (a, b) {
                var x = groups[a].info, y = groups[b].info;
                return num(x.sttkv) - num(y.sttkv) ||
                       num(x.stt) - num(y.stt) ||
                       String(x.manhanvien || "").localeCompare(String(y.manhanvien || "")) ||
                       String(x.madiemban || "").localeCompare(String(y.madiemban || ""));
            });

            // ---------- tính từng dòng + tổng theo ngày ----------
            var dayTot = [];
            for (var d = 1; d <= soNgay; d++) dayTot[d] = zeros(NP);

            var totalSum = zeros(NP), grandTotal = 0, totalTd = 0;

            var list = keys.map(function (key) {
                var g = groups[key];
                var sum = zeros(NP), tdSum = 0;

                for (var d = 1; d <= soNgay; d++) {
                    var arr = g.days[d];
                    if (!arr) continue;
                    for (var j = 0; j < NP; j++) {
                        var v = arr[j];
                        if (!v) continue;
                        dayTot[d][j] += v;
                        var ket = v / P[j].dv;
                        sum[j] += ket;
                        if (P[j].td) tdSum += ket;
                    }
                }

                var grand = 0;
                for (var j = 0; j < NP; j++) { grand += sum[j]; totalSum[j] += sum[j]; }
                grandTotal += grand;
                totalTd += tdSum;

                return { g: g, rec: g.info, sum: sum, grand: grand, tdSum: tdSum, ct: null, pct: null };
            });

            // ---------- theo nhân viên: chỉ tiêu (dòng đầu) và % đạt (dòng cuối) ----------
            var emps = [], cur = null;
            list.forEach(function (r, i) {
                if (!cur || cur.ma !== r.rec.manhanvien) {
                    cur = { ma: r.rec.manhanvien, first: i, last: i, nvSum: 0, nvTd: 0 };
                    emps.push(cur);
                }
                cur.last = i;
                cur.nvSum += r.grand;
                cur.nvTd += r.tdSum;
            });

            var ctTot = zeros(NCT), ctSumTot = 0, ctTdTot = 0;

            emps.forEach(function (e) {
                var ct = lookupChiTieu[e.ma];
                if (!ct) return;

                var sumct = 0;
                for (var k = 0; k < NCT; k++) {
                    var v = num(ct[CT[k].key]);
                    sumct += v;
                    ctTot[k] += v;
                }
                var sumcttd = num(ct.bold) + num(ct.light);
                ctSumTot += sumct;
                ctTdTot += sumcttd;

                list[e.first].ct = { row: ct, sumct: sumct, sumcttd: sumcttd };
                list[e.last].pct = { dat: pct(e.nvSum, sumct), td: pct(e.nvTd, sumcttd) };
            });

            // ---------- colgroup ----------
            var widths = self.widthFixed.slice();
            for (var d = 1; d <= soNgay * NP; d++) widths.push(self.widthSP);
            for (var i = 0; i < NP + 1; i++) widths.push(self.widthSum);
            for (var i = 0; i < NCT + 5; i++) widths.push(self.widthCT);

            var oldCg = table.querySelector("colgroup");
            if (oldCg) oldCg.remove();
            var cg = doc.createElement("colgroup");
            widths.forEach(function (w) {
                var col = doc.createElement("col");
                col.style.width = w + "px";
                cg.appendChild(col);
            });
            table.insertBefore(cg, table.firstChild);

            // ---------- cột cố định bên trái (sticky) ----------
            var lefts = [], acc = 0;
            for (var i = 0; i < self.freezeCols; i++) { lefts.push(acc); acc += self.widthFixed[i]; }

            function freeze(el, idx, z) {
                if (idx < self.freezeCols) {
                    el.style.position = "sticky";
                    el.style.left = lefts[idx] + "px";
                    el.style.zIndex = z;
                }
            }

            // ---------- header ----------
            var fixedBefore = ["STT", "Mã Điểm bán (DMS)", "Chi nhánh", "TL/TF", "Họ và tên NVTT", "Mã nhân viên", "Loại hình Điểm bán"];
            var addressCols = ["Tên Nhà hàng", "Số nhà", "Đường (tổ, xóm, ...)", "Xã/ Phường", "Tỉnh/ Thành (cũ)"];

            head.innerHTML = "";
            var tr1 = doc.createElement("tr");
            var tr2 = doc.createElement("tr");

            function addTh(tr, text, rowSpan, colSpan, cls, colIdx) {
                var th = doc.createElement("th");
                th.textContent = text;
                if (rowSpan) th.rowSpan = rowSpan;
                if (colSpan) th.colSpan = colSpan;
                if (cls) th.className = cls;
                if (colIdx !== undefined) freeze(th, colIdx, 5);
                tr.appendChild(th);
            }

            fixedBefore.forEach(function (label, idx) { addTh(tr1, label, 2, 1, "", idx); });

            addTh(tr1, "Địa chỉ làm việc của NVTT", 1, addressCols.length);
            addressCols.forEach(function (label) { addTh(tr2, label, 1, 1); });

            for (var d = 1; d <= soNgay; d++) {
                var alt = d % 2 === 0 ? "alt" : "";
                addTh(tr1, pad2(d), 1, NP, alt);
                for (var j = 0; j < NP; j++) addTh(tr2, P[j].label, 1, 1, alt);
            }

            addTh(tr1, "Sản lượng quy đổi", 1, NP + 1, "qd");
            for (var j = 0; j < NP; j++) addTh(tr2, P[j].label, 1, 1, "qd");
            addTh(tr2, "Tổng", 1, 1, "qd");

            addTh(tr1, "Chỉ tiêu & % hoàn thành", 1, NCT + 5, "ctc");
            CT.forEach(function (c) { addTh(tr2, c.label, 1, 1, "ctc"); });
            ["Tổng chỉ tiêu", "% đạt", "CT trọng điểm", "SL trọng điểm", "% trọng điểm"].forEach(function (t) {
                addTh(tr2, t, 1, 1, "ctc");
            });

            head.appendChild(tr1);
            head.appendChild(tr2);

            // ---------- dữ liệu ----------
            body.innerHTML = "";

            list.forEach(function (r, index) {

                var rec = r.rec;
                var row = doc.createElement("tr");

                function addCell(value, cls) {
                    var td = doc.createElement("td");
                    td.textContent = (value === null || value === undefined) ? "" : String(value);
                    if (cls) td.className = cls;
                    freeze(td, row.cells.length, 2);
                    row.appendChild(td);
                }

                var tlTf = lookupTF[rec.makhuvuc] || lookupTL[rec.makhuvuc] || rec.hotenquanly || "";

                addCell(index + 1, "info");
                addCell(rec.dms, "info");
                addCell(rec.thitruong, "info");
                addCell(tlTf, "info");
                addCell(rec.hotenNVTT || rec.hoten, "info nm");
                addCell(rec.sohoso != null ? rec.sohoso : rec.manhanvien, "info");
                addCell(rec.loaihinh, "info");
                addCell(rec.tendiemban, "info");
                addCell(rec.sonha, "info");
                addCell(rec.duong, "info");
                addCell(rec.huyen, "info");
                addCell(rec.tenkhuvuc, "info");

                // sản lượng theo ngày
                for (var d = 1; d <= soNgay; d++) {
                    var arr = r.g.days[d];
                    var cls = d % 2 === 0 ? "alt" : "";
                    for (var j = 0; j < NP; j++) {
                        addCell(arr && arr[j] ? r2(arr[j]) : "", cls);
                    }
                }

                // quy đổi
                for (var j = 0; j < NP; j++) addCell(r.sum[j] ? r1(r.sum[j]) : "", "qd");
                addCell(r1(r.grand), "qd tot");

                // chỉ tiêu (dòng đầu của nhân viên)
                var ct = r.ct;
                for (var k = 0; k < NCT; k++) {
                    var raw = ct ? ct.row[CT[k].key] : null;
                    addCell(raw !== null && raw !== undefined ? raw : "", "ctc");
                }
                addCell(ct ? ct.sumct : "", "ctc tot");
                addCell(r.pct ? r.pct.dat : "", "pc");          // % đạt (dòng cuối của nhân viên)
                addCell(ct ? ct.sumcttd : "", "ctc");
                addCell(r1(r.tdSum), "ctc");                    // SL trọng điểm của dòng
                addCell(r.pct ? r.pct.td : "", "pc");           // % trọng điểm (dòng cuối của nhân viên)

                body.appendChild(row);
            });

            // ---------- dòng tổng cộng ----------
            var totalRow = doc.createElement("tr");
            totalRow.className = "total-row";

            function addTotal(value, cls, colSpan) {
                var td = doc.createElement("td");
                td.textContent = (value === null || value === undefined) ? "" : String(value);
                if (cls) td.className = cls;
                if (colSpan) td.colSpan = colSpan;
                totalRow.appendChild(td);
                return td;
            }

            var lbl = addTotal("Tổng cộng", "label", 12);
            lbl.style.position = "sticky";
            lbl.style.left = "0px";
            lbl.style.zIndex = 2;

            for (var d = 1; d <= soNgay; d++) {
                for (var j = 0; j < NP; j++) addTotal(dayTot[d][j] ? r2(dayTot[d][j]) : "");
            }
            for (var j = 0; j < NP; j++) addTotal(totalSum[j] ? r1(totalSum[j]) : "");
            addTotal(r1(grandTotal));

            for (var k = 0; k < NCT; k++) addTotal(ctTot[k] || "");
            addTotal(ctSumTot || "");
            addTotal(pct(grandTotal, ctSumTot));
            addTotal(ctTdTot || "");
            addTotal(r1(totalTd));
            addTotal(pct(totalTd, ctTdTot));

            body.appendChild(totalRow);
        };

        // Chờ template tải xong (không phụ thuộc win.onload / ảnh logo), rồi vẽ
        var tries = 0;
        var timer = setInterval(function () {

            var ready = false;
            try {
                ready = win.document.readyState !== "loading" && win.document.getElementById("tblData");
            } catch (e) {}

            if (ready) {
                clearInterval(timer);
                try {
                    draw();
                } catch (err) {
                    console.error(err);
                    NUT.alert("Lỗi vẽ báo cáo: " + err.message, "yellow");
                }
            } else if (++tries > 100) {
                clearInterval(timer);
                NUT.alert("Không mở được template DailySanLuongReport.html (kiểm tra tên file/đường dẫn)", "yellow");
            }

        }, 100);
    }
};