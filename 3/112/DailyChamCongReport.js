var DailyChamCongReport = {

    url: "",

    loaiNgayCong: ["N", "KL", "KLO", "NL", "E", "S"],

    // Một nhân viên một ngày tối đa bao nhiêu công (cộng dồn các lần Check IN/OUT và các điểm bán)
    maxCongNgay: 1,

    // Index trong mảng sum: 0=thực tế, 1=giảm trừ, 2=tổng, 3.. = loại ngày công
    // map mã → index trong sum (giống code 2: KL:3, KLO:4, N:5, NL:6, S:7, E:8)
    lookupCol: {
        "KL": 3,
        "KLO": 4,
        "N": 5,
        "NL": 6,
        "S": 7,
        "E": 8
    },

    holidays: ["01-01", "04-30", "05-01", "09-02"],

    widthFixed: [30, 85, 80, 130, 180, 50, 65, 140, 65, 260, 100, 80],
    widthDay: 44,
    widthTotal: [70, 70, 80],
    widthLoai: 38,
    widthGhiChu: 160,

    run: function () {
        var now = new Date();
        DailyChamCongReport.url = NUT.services[3].url; 

        NUT.w2popup.open({
            title: "📜 Daily Report - Bảng chấm công",
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
                    "<td colspan='3'>" +
                        NUT.outerCboHTML(NUT.domains[1201].items, "cbo_ThiTruong") +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Vị trí</td>" +
                    "<td colspan='3'>" +
                        "<select id='cbo_ViTri'>" +
                           "<option value='' selected></option>" +
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
                "<button class='w2ui-btn' onclick='NUT.w2popup.close()'>Đóng</button>" +
                "<button class='w2ui-btn' onclick='DailyChamCongReport.runReport()'>✔️ Xuất báo cáo</button>"
        });
    },

    // ================= LẤY DỮ LIỆU =================
    runReport: function () {
        var nam = Number(document.getElementById("num_Year").value);
        var thang = Number(document.getElementById("num_Month").value);

        if (!nam || !thang || thang < 1 || thang > 12) {
            NUT.notify("Nhập năm và tháng hợp lệ!", "yellow");
            return;
        }

        var cbo = document.getElementById("cbo_ThiTruong");
        var thiTruong = cbo ? cbo.value : "";
        var thiTruongText = "";
        if (cbo && cbo.options && cbo.selectedIndex >= 0 && thiTruong) {
            thiTruongText = cbo.options[cbo.selectedIndex].text;
        }

        var viTri = document.getElementById("cbo_ViTri").value;
        var dungDuLieuHieuChinh = document.getElementById("chk_Edit").checked ? 1 : 0;
        var date = nam + "-" + String(thang).padStart(2, "0") + "-15";

        // 1. Lookup TL / TF / GDCN
        NUT.ds.select({
            url: DailyChamCongReport.url + "data/chucvuhabeco",
            where: [
                ["machucvu", "in", "TF','TL','GDCN"],
                ["or", ["ngaybatdau", "is", null], ["ngaybatdau", "<=", date]],
                ["or", ["ngayketthuc", "is", null], ["ngayketthuc", ">=", date]]
            ],
            limit: 10000
        }, function (res2) {
            if (!res2.success) {
                NUT.notify("Không lấy được dữ liệu chức vụ!", "yellow");
                return;
            }

            var lookupTL = {};
            var lookupTF = {};
            var gdcn = "";

            (res2.result || []).forEach(function (cv) {
                if (cv.machucvu === "TL") lookupTL[cv.makhuvuc] = cv.hoten;
                else if (cv.machucvu === "TF") lookupTF[cv.makhuvuc] = cv.hoten;
                else if (cv.machucvu === "GDCN") gdcn = cv.hoten;
            });

            // 2. Filter giống code 2
            var where = [
                ["nam", "=", nam],
                ["thang", "=", thang],
               // ["madoitac", "=", "HABECO"],
                ["dulieu", "=", dungDuLieuHieuChinh]
            ];

            // Quyền khu vực hoặc lọc thị trường
            // if (n$.user.orgs) {
            //     where.push(["makhuvuc", "in", n$.user.orgs]);

            // Vị trí: BA exact, BA_ dùng like (giống code 2)
            if (thiTruong) {
                where.push(["thitruong", "=", thiTruong]);
            }

            // Lọc vị trí

            if (viTri === "BA") {
                where.push(["vitrilv", "=", "BA"]);
            }

            else if (viTri) {
                where.push(["vitrilv", "like", viTri + "*"]);   // "BA_" → BA_PartTime...
            }

            NUT.ds.select({
                url: DailyChamCongReport.url + "data/chamcong_v",
                where: where,
                orderby: "sttkv,stt,manhanvien,madiemban,ngay,lan",
                limit: 20000
            }, function (res) {
                if (!(res.success && res.result && res.result.length)) {
                    NUT.notify("Không có dữ liệu báo cáo!", "yellow");
                    return;
                }

                DailyChamCongReport.renderReport(
                    res.result,
                    nam,
                    thang,
                    thiTruong,
                    thiTruongText,
                    lookupTL,
                    lookupTF,
                    gdcn
                );
            });
        });
    },

    // ================= VẼ BÁO CÁO =================
    renderReport: function (
        data,
        nam,
        thang,
        thiTruong,
        thiTruongText,
        lookupTL,
        lookupTF,
        gdcn
    ) {
        var self = DailyChamCongReport;

        var win = window.open(
            "site/" + n$.user.siteid + "/" +
            n$.app.appid + "/DailyChamCongReport.html"
        );

        if (!win) {
            NUT.notify("Trình duyệt đã chặn cửa sổ báo cáo!", "yellow");
            return;
        }

        win.onload = function () {
            var doc = win.document;
            var table = doc.getElementById("tblReport");
            var head = doc.getElementById("tblHead");
            var body = doc.getElementById("tblData");

            if (!table || !head || !body) {
                NUT.notify("Thiếu cấu trúc bảng báo cáo!", "yellow");
                return;
            }

            var soNgay = new Date(nam, thang, 0).getDate();
            var loaiList = self.loaiNgayCong;

            // Label
            var el;
            el = doc.getElementById("labGDCN");
            if (el) el.textContent = gdcn || "";

            el = doc.getElementById("labThangNam");
            if (el) el.textContent = String(thang).padStart(2, "0") + "/" + nam;

            el = doc.getElementById("labThiTruong");
            if (el) {
                el.textContent = n$.user.orgs
                    ? (n$.user.kvhcnames || "")
                    : (thiTruongText || thiTruong || "Tất cả");
            }

            el = doc.getElementById("labNgayBaoCao");
            if (el) el.textContent = "Ngày báo cáo: " + new Date().toLocaleString("vi-VN");

            function hasValue(v) {
                return v !== null && v !== undefined && v !== "";
            }

            function num(v) {
                var n = Number(v);
                return isNaN(n) ? 0 : n;
            }

            function formatNumber(n) {
                if (n === 0) return "0";
                return String(Number(n.toFixed(2)));
            }

            function pad2(n) {
                return String(n).padStart(2, "0");
            }

            function dayClass(d) {
                var mmdd = pad2(thang) + "-" + pad2(d);
                var full = nam + "-" + mmdd;
                if (self.holidays.indexOf(mmdd) >= 0 || self.holidays.indexOf(full) >= 0) {
                    return "hol";
                }
                return new Date(nam, thang - 1, d).getDay() === 0 ? "sun" : "";
            }

            /* ========== LÀM SẠCH DỮ LIỆU ==========
               1) View JOIN TL/TF nên một bản ghi chấm công có thể xuất hiện 2 lần → bỏ trùng theo idchamcong
                  (nếu không, công 0.5 bị cộng thành 1 và mã nghỉ bị đếm đôi).
               2) Bản mới không còn ca thẳng/gãy, một ngày có thể Check IN/OUT nhiều lần và ở nhiều điểm bán:
                  mỗi nhân viên mỗi ngày chỉ được tối đa maxCongNgay công. Các lần được xét theo giờ vào,
                  lần nào đến trước thì được công trước, phần vượt mức không tính.
            */
            var seenId = Object.create(null);
            data = data.filter(function (r) {
                if (!hasValue(r.idchamcong)) return true;
                var id = String(r.idchamcong);
                if (seenId[id]) return false;
                seenId[id] = true;
                return true;
            });

            var congOf = Object.create(null);   // idchamcong → công được tính
            (function () {
                var byDay = Object.create(null);
                data.forEach(function (r) {
                    if (!num(r.cong) || !hasValue(r.idchamcong)) return;
                    var k = String(r.manhanvien) + "|" + String(r.ngay);
                    (byDay[k] || (byDay[k] = [])).push(r);
                });
                Object.keys(byDay).forEach(function (k) {
                    var left = self.maxCongNgay;
                    byDay[k].sort(function (a, b) {
                        return (new Date(a.thoigianden) - new Date(b.thoigianden)) || (num(a.lan) - num(b.lan));
                    }).forEach(function (r) {
                        var take = Math.max(0, Math.min(num(r.cong), left));
                        left -= take;
                        congOf[String(r.idchamcong)] = take;
                    });
                });
            })();

            /* ========== COLGROUP ========== */
            var widths = self.widthFixed.slice();
            for (var d = 0; d < soNgay; d++) widths.push(self.widthDay);
            widths = widths.concat(self.widthTotal);
            loaiList.forEach(function () { widths.push(self.widthLoai); });
            widths.push(self.widthGhiChu);

            var oldCg = table.querySelector("colgroup");
            if (oldCg) oldCg.remove();

            var cg = doc.createElement("colgroup");
            widths.forEach(function (w) {
                var col = doc.createElement("col");
                col.style.width = w + "px";
                cg.appendChild(col);
            });
            table.insertBefore(cg, table.firstChild);

            /* ========== HEADER ========== */
            var fixedBefore = [
                "STT",
                "Mã Điểm bán (DMS)",
                "Khu vực",
                "TL/TF",
                "Họ và tên NVTT",
                "Mã nhân viên",
                "Loại hình Điểm bán"
            ];
            var addressCols = [
                "Tên Nhà hàng",
                "Số nhà",
                "Đường (tổ, xóm, ...)",
                "Xã/ Phường",
                "Tỉnh/ Thành (cũ)"
            ];

            head.innerHTML = "";
            var tr1 = doc.createElement("tr");
            var tr2 = doc.createElement("tr");

            function addTh(tr, text, rowSpan, colSpan, cls) {
                var th = doc.createElement("th");
                th.textContent = text;
                if (rowSpan) th.rowSpan = rowSpan;
                if (colSpan) th.colSpan = colSpan;
                if (cls) th.className = cls;
                tr.appendChild(th);
            }

            fixedBefore.forEach(function (label) {
                addTh(tr1, label, 2, 1);
            });

            addTh(tr1, "Địa chỉ làm việc của NVTT", 1, addressCols.length);
            addressCols.forEach(function (label) {
                addTh(tr2, label, 1, 1);
            });

            addTh(tr1, "", 1, soNgay);
            for (var d = 1; d <= soNgay; d++) {
                addTh(tr2, pad2(d), 1, 1, dayClass(d));
            }

            addTh(tr1, "Ngày công thực tế", 2, 1);
            addTh(tr1, "Ngày công giảm trừ", 2, 1);
            addTh(tr1, "Tổng Ngày công", 2, 1, "tong");

            addTh(tr1, "Loại Ngày công", 1, loaiList.length);
            loaiList.forEach(function (code) {
                addTh(tr2, code, 1, 1);
            });

            addTh(tr1, "Ghi chú", 2, 1);

            head.appendChild(tr1);
            head.appendChild(tr2);
            body.innerHTML = "";

            /* ========== XỬ LÝ TUẦN TỰ  ========== */
            var oldMaNhanVien = null;
            var oldMaDiemBan = null;
            var oldNgay = null;
            var row = null;
            var dayCells = null;   // day → td
            var stt = 0;
            var dayCong = null;    // day → công của dòng này trong ngày
            var leaveSeen = null;  // day|mã nghỉ đã đếm
            var sum = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // [thucte, giamtru, tong, KL, KLO, N, NL, S, E]
            var total = [];        // tổng theo từng ngày (index = ngày)
            for (var t = 0; t <= soNgay; t++) total[t] = 0;
            var grandTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0];
            var notes = [];

            function finishRow() {
                if (!row) return;
                // Ghi các cột tổng của dòng
                // Cột sau ngày: thucTe, giamTru, tong, rồi các loại, rồi ghi chú
                var base = 12 + soNgay; // 12 cột cố định + soNgay cột ngày
                row.cells[base].textContent = formatNumber(sum[0]);       // thực tế
                row.cells[base + 1].textContent = sum[1] ? formatNumber(sum[1]) : ""; // giảm trừ
                row.cells[base + 2].textContent = formatNumber(sum[2]);   // tổng
                row.cells[base + 2].className = "tong";

                // Loại ngày công theo thứ tự loaiList
                // sum index: KL=3, KLO=4, N=5, NL=6, S=7, E=8
                // loaiList = ["N","KL","KLO","NL","E","S"]
                var mapLoaiToSum = { "N": 5, "KL": 3, "KLO": 4, "NL": 6, "E": 8, "S": 7 };
                for (var li = 0; li < loaiList.length; li++) {
                    var idx = mapLoaiToSum[loaiList[li]];
                    var val = idx != null ? sum[idx] : 0;
                    row.cells[base + 3 + li].textContent = val > 0 ? val : "";
                }

                row.cells[base + 3 + loaiList.length].textContent = notes.join("; ");

                // Cộng vào grandTotal
                for (var j = 0; j < sum.length; j++) {
                    grandTotal[j] += sum[j];
                }
            }

            function createRow(rec) {
                finishRow();

                row = doc.createElement("tr");
                body.appendChild(row);
                dayCells = Object.create(null);
                stt++;
                oldNgay = null;
                dayCong = Object.create(null);
                leaveSeen = Object.create(null);
                sum = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                notes = [];

                var tlTf = lookupTF[rec.makhuvuc] || lookupTL[rec.makhuvuc] || "";

                function addCell(value, cls, align) {
                    var td = doc.createElement("td");
                    td.textContent = value === null || value === undefined ? "" : String(value);
                    if (cls) td.className = cls;
                    if (align) td.style.textAlign = align;
                    row.appendChild(td);
                    return td;
                }

                addCell(stt, "", "center");
                addCell(rec.dms || rec.madiemban || "");
                addCell(rec.thitruong || "");
                addCell(tlTf);
                addCell(rec.hoten || rec.hotenNVTT || "");
                addCell(rec.sohoso || rec.manhanvien || "", "", "center");
                addCell(rec.loaihinh || "");
                addCell(rec.tendiemban || "");
                addCell(rec.sonha || "");
                addCell(rec.duong || "");
                addCell(rec.huyen || "");
                addCell(rec.tenkhuvuc || "");

                // Ô từng ngày
                for (var d = 1; d <= soNgay; d++) {
                    var td = addCell("", dayClass(d), "center");
                    dayCells[d] = td;
                }

                // Ô tổng: thucTe, giamTru, tong
                addCell("0", "", "center");
                addCell("", "", "center");
                addCell("0", "tong", "center");

                // Ô loại ngày công
                for (var li = 0; li < loaiList.length; li++) {
                    addCell("", "", "center");
                }

                // Ghi chú
                addCell("", "left");

                oldMaNhanVien = rec.manhanvien;
                oldMaDiemBan = rec.madiemban;
            }

            // Duyệt tuần tự 
            for (var i = 0; i < data.length; i++) {
                var rec = data[i];

                if (rec.manhanvien != oldMaNhanVien || rec.madiemban != oldMaDiemBan) {
                    createRow(rec);
                }

                // Ghi chú
                if (hasValue(rec.ghichu)) {
                    var note = String(rec.ghichu).trim();
                    if (note && notes.indexOf(note) < 0) notes.push(note);
                }

                var day = Number(rec.ngay);
                if (!day || day < 1 || day > soNgay) continue;

                // Công của lần chấm công này (đã bỏ trùng và giới hạn tối đa mỗi ngày)
                var cong = hasValue(rec.idchamcong) ? (congOf[String(rec.idchamcong)] || 0) : num(rec.cong);

                if (cong > 0) {
                    dayCong[day] = (dayCong[day] || 0) + cong;

                    dayCells[day].textContent = formatNumber(dayCong[day]);

                    sum[0] += cong;
                    sum[2] += cong;
                    total[day] += cong;
                }

                // --- Có mã chấm công (báo nghỉ) → ghi đè ô ngày + đếm loại (mỗi ngày mỗi mã một lần) ---
                if (rec.chamcong) {
                    var code = String(rec.chamcong).trim().toUpperCase();
                    dayCells[day].textContent = code;

                    var colIdx = self.lookupCol[code];
                    if (colIdx != null && !leaveSeen[day + "|" + code]) {
                        leaveSeen[day + "|" + code] = true;
                        sum[colIdx]++;
                    }
                }
            }

            // Dòng cuối
            finishRow();

            /* ========== DÒNG TỔNG CỘNG ========== */
            var totalRow = doc.createElement("tr");
            totalRow.className = "total-row";

            function addTotal(value, cls, colSpan) {
                var td = doc.createElement("td");
                td.textContent = value === null || value === undefined ? "" : String(value);
                if (cls) td.className = cls;
                if (colSpan) td.colSpan = colSpan;
                if (!colSpan) td.style.textAlign = "center";
                totalRow.appendChild(td);
            }

            addTotal("Tổng cộng:", "", 12);

            for (var dd = 1; dd <= soNgay; dd++) {
                addTotal(formatNumber(total[dd] || 0));
            }

            addTotal(formatNumber(grandTotal[0]));
            addTotal(grandTotal[1] ? formatNumber(grandTotal[1]) : "");
            addTotal(formatNumber(grandTotal[2]), "tong");

            // Loại theo thứ tự loaiList
            var mapLoaiToSum = { "N": 5, "KL": 3, "KLO": 4, "NL": 6, "E": 8, "S": 7 };
            loaiList.forEach(function (code) {
                var idx = mapLoaiToSum[code];
                addTotal(idx != null && grandTotal[idx] ? grandTotal[idx] : 0);
            });

            addTotal(""); // ghi chú

            body.appendChild(totalRow);
        };
    }
};
