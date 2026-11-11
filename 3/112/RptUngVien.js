var RptUngVien = {
    run: function (p) {
        p = p || {};
        RptUngVien.url = NUT.services[3].url;

        var now = (new Date()).toISOString().substring(0, 10);

        // Có thể gán ID domain trực tiếp nếu hệ thống của bạn dùng ID cố định.
        // Để null, hàm sẽ tự dò domain theo tên/alias.
        var DOMAIN_STATUS_ID = null;

        var normalizeText = function (s) {
            return (s || "")
                .toString()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/\s+/g, " ")
                .trim();
        };

        var getDomainByKeywords = function (explicitId, keywords) {
            if (explicitId !== null && explicitId !== undefined && NUT.domains[explicitId]) {
                return NUT.domains[explicitId];
            }

            var domains = NUT.domains || [];
            var keys = Object.keys(domains);

            for (var i = 0; i < keys.length; i++) {
                var d = domains[keys[i]];
                if (!d) continue;

                var domainName = [
                    d.name, d.alias, d.text, d.title, d.code, d.domainname
                ].filter(Boolean).join(" ");

                var n = normalizeText(domainName);
                if (!n) continue;

                var matched = keywords.some(function (kw) {
                    return n.indexOf(normalizeText(kw)) >= 0;
                });

                if (matched && d.items && d.items.length) return d;
            }

            return null;
        };

        var buildDomainSelect = function (id, placeholder, explicitId, keywords) {
            var select = document.createElement("select");
            select.id = id;
            select.className = "w2ui-input";
            select.style.width = "180px";

            var optAll = document.createElement("option");
            optAll.value = "";
            optAll.innerHTML = placeholder;
            select.add(optAll);

            var domainObj = getDomainByKeywords(explicitId, keywords);
            var items = domainObj && domainObj.items ? domainObj.items : [];

            items
                .filter(function (item) {
                    return item && item.text && item.text.toString().trim() !== "";
                })
                .sort(function (a, b) {
                    return (a.id || 0) - (b.id || 0);
                })
                .forEach(function (item) {
                    var opt = document.createElement("option");
                    // Report cũ lọc bằng text domain, giữ cùng cách làm
                    opt.value = item.text || "";
                    opt.innerHTML = item.text || "";
                    select.add(opt);
                });

            return select;
        };


        var cboStatus = buildDomainSelect(
            "cboStatus",
            "Tất cả trạng thái",
            DOMAIN_STATUS_ID,
            ["trạng thái", "trang thai", "status"]
        );

        var formatDate = function (value) {
            if (!value) return "";
            var d = new Date(value);
            if (isNaN(d.getTime())) return value;
            return d.toLocaleDateString("vi-VN");
        };

        var formatNumberView = function (value) {
            if (value === undefined || value === null || value === "") return "";
            var num = Number(value);
            if (isNaN(num)) return value;
            return num.toLocaleString("vi-VN");
        };

        var escapeHtml = function (value) {
            return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
                return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
            });
        };

        var buildRowHtml = function (ct, stt) {
            return `
                <td>${stt}</td>
                <td>${escapeHtml(ct.vitri)}</td>
                <td>${escapeHtml(formatNumberView(ct.mucluong))}</td>
                <td>${escapeHtml(formatNumberView(ct.kinhnghiem))}</td>
                <td>${escapeHtml(ct.trinhdo)}</td>
                <td>${escapeHtml(ct.chuyennganh)}</td>
                <td>${escapeHtml(ct.kynang)}</td>
                <td>${escapeHtml(ct.CV)}</td>
                <td>${escapeHtml(ct.bangcap)}</td>
                <td>${escapeHtml(ct.chungchi)}</td>
                <td>${escapeHtml(ct.portfolio)}</td>
                <td>${escapeHtml(ct.filedinhkem)}</td>
                <td>${escapeHtml(ct.diadiem)}</td>
                <td>${escapeHtml(ct.nguonuv)}</td>
            `;
        };

        var createNewTableStructure = function (win, groupData) {
            var container = win.document.createElement("div");
            container.className = "table-container";
            container.style.marginTop = "5px";

            container.innerHTML = `
                <div class="table-container">
                    <table class="candidate-meta-table">
                        <colgroup><col style="width:34%"><col style="width:33%"><col style="width:33%"></colgroup>
                        <tbody>
                            <tr class="meta-row">
                                <td colspan="1" data-excel-span="5">Mã ứng viên: ${escapeHtml(groupData.MaUV)}</td>
                                <td colspan="2" data-excel-span="9">Họ và tên: ${escapeHtml(groupData.hoten)}</td>
                            </tr>
                            <tr class="meta-row">
                                <td colspan="1" data-excel-span="5">Ngày sinh: ${escapeHtml(formatDate(groupData.ngaysinh))}</td>
                                <td colspan="1" data-excel-span="4">Ngày tạo: ${escapeHtml(formatDate(groupData.ngaytao))}</td>
                                <td colspan="1" data-excel-span="5">Giới tính: ${escapeHtml(groupData.gioitinh)}</td>
                            </tr>
                            <tr class="meta-row">
                                <td colspan="1" data-excel-span="5">CCCD: ${escapeHtml(groupData.CCCD)}</td>
                                <td colspan="1" data-excel-span="4">Email: ${escapeHtml(groupData.email)}</td>
                                <td colspan="1" data-excel-span="5">Điện thoại: ${escapeHtml(groupData.dienthoai)}</td>
                            </tr>
                            <tr class="meta-row">
                                <td colspan="2" data-excel-span="9">Địa chỉ: ${escapeHtml(groupData.diachi)}</td>
                                <td colspan="1" data-excel-span="5">Trạng thái: ${escapeHtml(groupData.status)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="rpt-table">
                        <colgroup>
                            <col style="width:3%">
                            <col style="width:8%">
                            <col style="width:7%">
                            <col style="width:5%">
                            <col style="width:7%">
                            <col style="width:9%">
                            <col style="width:10%">
                            <col style="width:6%">
                            <col style="width:6%">
                            <col style="width:6%">
                            <col style="width:7%">
                            <col style="width:7%">
                            <col style="width:9%">
                            <col style="width:10%">
                        </colgroup>
                        <thead>
                            <tr class="header-row">
                                <th>STT</th>
                                <th>Vị trí ứng tuyển</th>
                                <th>Mức lương</th>
                                <th>Số năm kinh nghiệm</th>
                                <th>Trình độ</th>
                                <th>Chuyên ngành</th>
                                <th>Kỹ năng</th>
                                <th>CV</th>
                                <th>Bằng cấp</th>
                                <th>Chứng chỉ</th>
                                <th>Hồ sơ năng lực</th>
                                <th>Tệp đính kèm</th>
                                <th>Địa điểm</th>
                                <th>Nguồn ứng viên</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            `;

            return container;
        };


        var createPrintHeader = function (win) {
            var header = win.document.createElement("div");
            header.className = "print-only-header";

            header.innerHTML = `
                <div class="company-header">
                    <div class="company-logo">
                        <img src="LOGO.jpg" alt="Logo ORIT">
                    </div>
                    <div class="company-left">
                        <h2>CÔNG TY CỔ PHẦN ĐẦU TƯ ORIT</h2>
                        <div class="address">Số 3/20, đường Ngụy Như Kon Tum, Thanh Xuân, Hà Nội</div>
                    </div>
                </div>

                <div class="rpt-title">
                    <h1>BÁO CÁO ỨNG VIÊN</h1>
                </div>
            `;

            return header;
        };

        var openReport = function (rows) {
            if (!rows || !rows.length) {
                return NUT.notify("⚠️ Không có dữ liệu ứng viên!", "yellow");
            }

            var groupMap = Object.create(null);
            var groups = [];

            rows.forEach(function (r) {
                var key = r.MaUV || "";

                if (!groupMap[key]) {
                    groupMap[key] = {
                        MaUV: r.MaUV,
                        hoten: r.hoten,
                        gioitinh: r.gioitinh,
                        ngaysinh: r.ngaysinh,
                        CCCD: r.CCCD,
                        email: r.email,
                        dienthoai: r.dienthoai,
                        diachi: r.diachi,
                        status: r.status,
                        ngaytao: r.ngaytao,
                        details: []
                    };

                    groups.push(groupMap[key]);
                }

                groupMap[key].details.push(r);
            });

            var win = window.open(
                "site/" + n$.user.siteid + "/" + n$.app.appid + "/RptUngVien.html"
            );

            if (!win) {
                return NUT.notify("Vui lòng cho phép mở cửa sổ báo cáo trên trình duyệt!", "yellow");
            }

            win.onload = function () {
                var reportContent =
                    win.document.getElementById("reportContent") || win.document.body;

                // Giữ nguyên header + title chung khi xem trên màn hình.
                var screenHeader = reportContent.querySelector(".screen-report-header");
                reportContent.innerHTML = "";
                if (screenHeader) {
                    reportContent.appendChild(screenHeader);
                }

                groups.forEach(function (group) {
                    var page = win.document.createElement("div");
                    page.className = "print-report-page";

                    // Header này chỉ hiện khi Ctrl+P / in.
                    page.appendChild(createPrintHeader(win));

                    var tableContainer = createNewTableStructure(win, group);
                    var tbody = tableContainer.querySelector(".rpt-table tbody");

                    var stt = 1;
                    group.details.forEach(function (ct) {
                        var row = win.document.createElement("tr");
                        row.innerHTML = buildRowHtml(ct, stt++);
                        tbody.appendChild(row);
                    });

                    page.appendChild(tableContainer);
                    reportContent.appendChild(page);
                });
            };
        };

        if (p.records && p.records.length) {
            var selectedRecord = p.records[0];
            var maUV = selectedRecord.MaUV || selectedRecord.mauv || selectedRecord.maUV;

            if (!maUV) {
                return NUT.notify("⚠️ Không xác định được mã ứng viên!", "yellow");
            }

            NUT.ds.select({
                url: RptUngVien.url + "data/ba_ungvien_v",
                where: [["MaUV", "=", maUV]]
            }, function (res) {
                if (!res || !res.success || !res.result || !res.result.length) {
                    return NUT.notify("⚠️ Không có dữ liệu ứng viên!", "yellow");
                }

                openReport(res.result);
            });
        }

        else if (p.popup || (!p.records && typeof p.records === "undefined")) {
            NUT.w2popup.open({
                title: "📃 <i>Báo cáo ứng viên</i>",
                modal: true,
                width: 380,
                height: 320,
                body: `
                    <table style="margin:auto">
                        <tr>
                            <td>Từ ngày*</td>
                            <td><input id="datTuNgay" type="date" value="${now}"/></td>
                        </tr>

                        <tr>
                            <td>Đến ngày*</td>
                            <td><input id="datDenNgay" type="date" value="${now}"/></td>
                        </tr>


                        <tr>
                            <td>Trạng thái</td>
                            <td>${cboStatus.outerHTML}</td>
                        </tr>
                    </table>
                `,

                actions: {
                    "_Close": function () {
                        NUT.w2popup.close();
                    },

                    "_Ok": function () {
                        var datTuNgay = document.getElementById("datTuNgay");
                        var datDenNgay = document.getElementById("datDenNgay");
                        var cboStatus = document.getElementById("cboStatus");

                        if (!datTuNgay.value || !datDenNgay.value) {
                            return NUT.notify("⚠️ Chọn từ ngày và đến ngày!", "yellow");
                        }

                        if (datTuNgay.value > datDenNgay.value) {
                            return NUT.notify("⚠️ Từ ngày không được lớn hơn đến ngày!", "yellow");
                        }

                        var whereConditions = [
                            ["ngaytao", ">=", datTuNgay.value],
                            ["ngaytao", "<=", datDenNgay.value]
                        ];


                        if (cboStatus && cboStatus.value !== "") {
                            whereConditions.push(["status", "=", cboStatus.value]);
                        }

                        NUT.ds.select({
                            url: RptUngVien.url + "data/ba_ungvien_v",
                            where: whereConditions,
                            orderby: "ngaytao, MaUV, ctungvienid"
                        }, function (res) {
                            if (!res || !res.success || !res.result || !res.result.length) {
                                return NUT.notify("⚠️ Không có dữ liệu ứng viên!", "yellow");
                            }

                            openReport(res.result);
                        });
                    }
                }
            });
        }

        else {
            NUT.notify("không có bản ghi nào được chọn!", "yellow");
        }
    }
};
