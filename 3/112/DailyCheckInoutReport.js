var DailyCheckInoutReport = {
    url: "",

    run: function () {
        var now = new Date();
        DailyCheckInoutReport.url = NUT.services[3].url;

        NUT.w2popup.open({
            title: "📜 Daily Check In-out Report",
            modal: true,
            width: 380,
            height: 230,

            body:
                "<table style='margin:auto'>" +
                "<tr>" +
                    "<td>Năm</td>" +
                    "<td><input id='num_Year' type='number' " +
                    "style='width:75px' value='" + now.getFullYear() + "'></td>" +
                    "<td>Tháng</td>" +
                    "<td><input id='num_Month' type='number' min='1' max='12' " +
                    "style='width:55px' value='" + (now.getMonth() + 1) + "'></td>" +
                "</tr>" +
                (n$.user.tag ? "" :
                "<tr>" +
                    "<td>Khu vực</td>" +
                    "<td colspan='3'>" +
                        NUT.outerCboHTML(
                            NUT.domains[1201].items,
                            "cbo_ThiTruong"
                        ) +
                    "</td>" +
                "</tr>" +
                "<tr>" +
                    "<td>Vị trí</td>" +
                    "<td colspan='3'>" +
                        "<select id='cbo_ViTri' name='cbo_ViTri'>" +
                            "<option value='' selected>-- Tất cả --</option>" +
                            "<option value='BA'>BA</option>" +
                            "<option value='BA_'>BA_PartTime</option>" +
                        "</select>" +
                    "</td>" +
                "</tr>"
                ) +
               
                "</table>",

            buttons:
                "<button class='w2ui-btn' " +
                "onclick='NUT.w2popup.close()'>Đóng</button>" +
                "<button class='w2ui-btn' " +
                "onclick='DailyCheckInoutReport.runReport()'>✔️ Xuất báo cáo</button>"
        });
    },

    runReport: function () {
        var nam = Number(document.getElementById("num_Year").value);
        var thang = Number(document.getElementById("num_Month").value);

        if (!Number.isInteger(nam) || nam < 1 || nam > 9999 || !Number.isInteger(thang) || thang < 1 || thang > 12) {
            NUT.notify("Nhập năm và tháng hợp lệ!", "yellow");
            return;
        }

        var employeeTag = n$.user.tag;
        var cbo = employeeTag ? null : document.getElementById("cbo_ThiTruong");
        var thiTruong = cbo ? cbo.value : "";

        // Tên hiển thị của thị trường đang chọn (dùng cho dòng "Khu vực" trên báo cáo)
        var thiTruongText = "";
        if (cbo && cbo.options && cbo.selectedIndex >= 0 && thiTruong) {
            thiTruongText = cbo.options[cbo.selectedIndex].text;
        }

        // var dungDuLieuHieuChinh =
        //     document.getElementById("chk_Edit").checked;
        var cboViTri = document.getElementById("cbo_ViTri");
        var viTri = !employeeTag && cboViTri ? cboViTri.value : "";

        var where = [
            ["nam", "=", nam],
            ["thang", "=", thang]
            //["dulieu", "=", dungDuLieuHieuChinh ? 1 : 0],
        ];

        if (employeeTag) where.push(["manhanvien", "=", employeeTag]);

        if (viTri === "BA") {
            where.push(["vitrilv", "=", "BA"]);
        } else if (viTri) {
            where.push(["vitrilv", "like", viTri + "*"]);
        }

        NUT.ds.select({
            url: DailyCheckInoutReport.url + "data/chamcong_v",
            where: where,
            orderby: "manhanvien,madiemban,ngay,lan",
            limit: 20000
        }, function (res) {
            // if (!res.success || !res.result || !res.result.length) {
            //     NUT.notify("Không có dữ liệu báo cáo!", "yellow");
            //     return;
            // }
            if (!(res && res.success && res.result && res.result.some(function (rec) {
                return !employeeTag || rec.manhanvien === employeeTag;
            }))) {
				NUT.notify("Không có dữ liệu báo cáo!", "yellow");
				return;
			}

            if (res.result.length >= 20000) {
                NUT.notify("Dữ liệu chạm giới hạn 20000 dòng. Hãy thu hẹp bộ lọc để tránh xuất thiếu.", "red");
                return;
            }
            var data = res.result;
            if (employeeTag) data = data.filter(function (rec) { return rec.manhanvien === employeeTag; });

            // Lọc thị trường tại JavaScript
            if (thiTruong) {
                data = data.filter(function (rec) {
                    return String(rec.thitruong || "").trim() ===
                        String(thiTruong).trim();
                });

                if (!data.length) {
                    NUT.notify("Không có dữ liệu báo cáo!", "yellow");
                    return;
                }
            }

            DailyCheckInoutReport.renderReport(
                data,
                nam,
                thang,
                thiTruong,
                thiTruongText
            );
        });
    },

    renderReport: function (data, nam, thang, thiTruong, thiTruongText) {
        var win = window.open(
            "site/" + n$.user.siteid + "/" +
            n$.app.appid + "/DailyCheckInoutReport.html"
        );

        if (!win) {
            NUT.notify("Trình duyệt đã chặn cửa sổ báo cáo!", "yellow");
            return;
        }

        win.onload = function () {
            var doc = win.document;
            var head = doc.getElementById("tblHead");
            var body = doc.getElementById("tblData");

            if (!head || !body) {
                NUT.notify("Thiếu tblHead hoặc tblData trong HTML!", "yellow");
                return;
            }

            var soNgay = new Date(nam, thang, 0).getDate();

            doc.getElementById("labThangNam").textContent =
                String(thang).padStart(2, "0") + "/" + nam;

            doc.getElementById("labThiTruong").textContent =
                thiTruongText || thiTruong || "Tất cả";

            doc.getElementById("labNgayBaoCao").textContent =
                "Ngày báo cáo: " + new Date().toLocaleString("vi-VN");


            // Explicit widths keep the identity columns compact when frozen.
            var table = head.parentElement;
            var oldColgroup = table.querySelector("colgroup");
            if (oldColgroup) oldColgroup.remove();
            var colgroup = doc.createElement("colgroup");
            var columnWidths = [30, 80, 75, 110, 110, 55, 85, 140, 65, 160, 100, 100, 100];
            for (var ci = 0; ci < soNgay * 2; ci++) columnWidths.push(42);
            columnWidths.push(75);
            columnWidths.forEach(function (width) {
                var col = doc.createElement("col");
                col.style.width = width + "px";
                colgroup.appendChild(col);
            });
            table.insertBefore(colgroup, table.firstChild);

            var fixedBefore = [
                "STT",
                "Mã điểm bán (DMS)",
                "Khu vực",
                "TL/TF",
                "Họ và tên NVTT",
                "Mã nhân viên",
                "Loại hình điểm bán"
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

            function addTh(tr, text, rowSpan, colSpan) {
                var th = doc.createElement("th");
                th.textContent = text;
                if (rowSpan) th.rowSpan = rowSpan;
                if (colSpan) th.colSpan = colSpan;
                tr.appendChild(th);
                return th;
            }

            fixedBefore.forEach(function (label) {
                addTh(tr1, label, 2, 1);
            });

            addTh(tr1, "Địa chỉ làm việc của NVTT", 1, addressCols.length);
            addressCols.forEach(function (label) {
                addTh(tr2, label, 1, 1);
            });

            addTh(tr1, "Giờ làm việc", 2, 1);

            for (var d = 1; d <= soNgay; d++) {
                addTh(tr1, String(d).padStart(2, "0"), 1, 2);
                addTh(tr2, "Check in", 1, 1);
                addTh(tr2, "Check out", 1, 1);
            }

            addTh(tr1, "Tổng vi phạm", 2, 1);

            head.appendChild(tr1);
            head.appendChild(tr2);
            body.innerHTML = "";

            /* ================= HÀM HỖ TRỢ ================= */

            // Chỉ hiển thị HH:mm nếu có dữ liệu.
            function formatTime(value) {
                if (value === null || value === undefined || value === "") {
                    return "";
                }

                var s = String(value).trim();
                var match = s.match(/(\d{1,2}):(\d{2})/);

                return match ? match[1].padStart(2, "0") + ":" + match[2] : s;
            }

            function formatCheckTime(value) {
                if (value === null || value === undefined || value === "") return "";
                var text = String(value).trim();
                var date = value instanceof Date ? value : new Date(/[zZ]$|[+-]\d\d:\d\d$/.test(text) ? text : text + "Z");
                if (isNaN(date.getTime())) return text;
                return date.toLocaleTimeString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23"
                });
            }

            function hasValue(value) {
                return value !== null &&
                    value !== undefined &&
                    value !== "";
            }

            // 0.5 -> "0.5", 1 -> "1", 1.0 -> "1"
            function formatNumber(n) {
                return String(Number(n.toFixed(2)));
            }

            /* ================= GOM DỮ LIỆU =================
               Mỗi dòng báo cáo = một điểm bán của một NVTT
               (nhân viên + điểm bán), các ngày nằm ngang theo cột.
            */
            var groups = Object.create(null);

            // View JOIN TL/TF nên một bản ghi chấm công có thể xuất hiện 2 lần: bỏ trùng theo idchamcong
            var seenId = Object.create(null);
            data = data.filter(function (rec) {
                if (!hasValue(rec.idchamcong)) return true;
                var id = String(rec.idchamcong);
                if (seenId[id]) return false;
                seenId[id] = true;
                return true;
            });

            data.forEach(function (rec) {
                var key = JSON.stringify([rec.manhanvien, rec.madiemban]);

                var group = groups[key];
                if (!group) {
                    group = groups[key] = {
                        info: rec,
                        days: Object.create(null)
                    };
                }

                var day = Number(rec.ngay);
                if (!day || day < 1 || day > soNgay) return;

                // var dayData = group.days[day];
                // if (!dayData) {
                //     dayData = group.days[day] = {
                //         ins: 0,           // số bản ghi có check in
                //         outs: 0,          // số bản ghi có check out
                //         inTimes: [],      // giờ check in (hiện khi rê chuột)
                //         outTimes: []      // giờ check out
                //     };
                // }
                var dayData = group.days[day];

                if (!dayData) {
                    dayData = group.days[day] = {
                        records: []
                    };
                }

                // Lưu nguyên bản ghi gốc, không làm mất lần chấm công
                dayData.records.push(rec);

                // var nvKey = rec.manhanvien + "|" + day;
                // var nv = nvDays[nvKey];
                // if (!nv) {
                //     nv = nvDays[nvKey] = {
                //         points: Object.create(null),
                //         maxLan: 0
                //     };
                // }

                // nv.points[rec.madiemban] = true;
                // nv.maxLan = Math.max(nv.maxLan, Number(rec.lan) || 0);
            });

            // function isCaGay(manv, day) {
            //     var nv = nvDays[manv + "|" + day];

            //     return !!nv &&
            //         (Object.keys(nv.points).length >= 2 || nv.maxLan >= 2);
            // }

            var keys = Object.keys(groups).sort(function (a, b) {
                var x = groups[a].info;
                var y = groups[b].info;

                return String(x.manhanvien || "").localeCompare(
                    String(y.manhanvien || "")
                ) || String(x.madiemban || "").localeCompare(
                    String(y.madiemban || "")
                );
            });

            /* ================= ĐỔ DỮ LIỆU ================= */
            keys.forEach(function (key, index) {
                var group = groups[key];
                var rec = group.info;
                var row = doc.createElement("tr");
                var violations = 0;

                function addCell(value, align) {
                    var td = doc.createElement("td");
                    td.textContent =
                        value === null || value === undefined
                            ? ""
                            : String(value);

                    if (align) td.style.textAlign = align;

                    row.appendChild(td);
                    return td;
                }

                // TL/TF: ưu tiên tên quản lý, nếu trống thì lấy chức vụ.
                var tlTf = rec.hotenquanly || rec.machucvu || "";

                // Giờ làm việc: ca 1 và (nếu có) ca 2.
                var ca1 = formatTime(rec.gioden) +
                    (rec.giove ? " - " + formatTime(rec.giove) : "");
                var ca2 = formatTime(rec.gioden2) +
                    (rec.giove2 ? " - " + formatTime(rec.giove2) : "");
                var gioLamViec = [ca1, ca2].filter(function (shift) {
                    return shift && shift !== "00:00 - 00:00";
                }).join(", ");

                addCell(index + 1, "center");        // 1  STT
                addCell(rec.dms);              // 2  Mã điểm bán (DMS)
                addCell(rec.thitruong);              // 3  Chi nhánh
                addCell(tlTf);                       // 4  TL/TF
                addCell(rec.hotenNVTT);              // 5  Họ và tên NVTT
                addCell(rec.manhanvien, "center");   // 6  Mã nhân viên
                addCell(rec.loaihinh);               // 7  Loại hình điểm bán
                addCell(rec.tendiemban);             // 8  Tên Nhà hàng
                addCell(rec.sonha);                  // 9  Số nhà
                addCell(rec.duong);                  // 10 Đường
                addCell(rec.huyen);                  // 11 Xã/Phường
                addCell(rec.tenthitruong);              // 12 Tỉnh/Thành (cũ)
                addCell(gioLamViec, "center");       // 13 Giờ làm việc

                /* Ký hiệu chấm công (không còn ca thẳng / ca gãy, một ngày có thể check nhiều lần):
                   x       : ngày có Check in (hoặc Check out) tại điểm bán này, chỉ đánh MỘT dấu x
                             dù trong ngày có bao nhiêu lần chấm công.
                   mã nghỉ : bản ghi báo nghỉ (N, KL, KLO, NL, S, E, KPI...) hiển thị chính mã đó.
                   Ô trống : ngày không có bản ghi chấm công ở điểm bán này.
                   Rê chuột vào ô x để xem giờ chấm các lần trong ngày.
                   Một bản ghi (không phải báo nghỉ) thiếu giờ đến hoặc giờ về tính 1 vi phạm.
                */
                for (var day = 1; day <= soNgay; day++) {

                    var info = group.days[day];

                    if (!info || !info.records.length) {
                        addCell("", "center");
                        addCell("", "center");
                        continue;
                    }

                    var leaveCodes = [];
                    var hasIn = false;
                    var hasOut = false;
                    var inTimes = [];
                    var outTimes = [];

                    info.records.forEach(function (r) {

                        // Giá trị công dạng số không phải mã nghỉ: vẫn xét giờ check in/out.
                        var code = hasValue(r.chamcong) ? String(r.chamcong).trim() : "";
                        if (code && isNaN(Number(code.replace(",", ".")))) {
                            if (leaveCodes.indexOf(code) < 0) leaveCodes.push(code);
                            return;
                        }

                        if (hasValue(r.thoigianden)) {
                            hasIn = true;
                            inTimes.push(formatCheckTime(r.thoigianden));
                        }

                        if (hasValue(r.thoigianve)) {
                            hasOut = true;
                            outTimes.push(formatCheckTime(r.thoigianve));
                        }

                        if (!hasValue(r.thoigianden) || !hasValue(r.thoigianve)) {
                            violations++;
                        }

                    });

                    var leaveText = leaveCodes.join(",");

                    // Check-in: mã nghỉ nếu có, ngược lại 1 dấu x khi có giờ đến
                    var tdIn = addCell(leaveText || (hasIn ? "x" : ""), "center");
                    tdIn.title = inTimes.join(", ");

                    // Check-out: mã nghỉ nếu có, ngược lại 1 dấu x khi có giờ về
                    var tdOut = addCell(leaveText || (hasOut ? "x" : ""), "center");
                    tdOut.title = outTimes.join(", ");
                }

                addCell(formatNumber(violations), "center");   // Tổng vi phạm
                row.setAttribute("data-report-province", rec.tenthitruong || rec.thitruong || "" );
                row.setAttribute("data-province-columns", "12" );
                body.appendChild(row);
            });
        };
    }
};
