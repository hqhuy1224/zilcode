var RptKeHoachTuyenDung = {
    run: function (p) {
        p = p || {};
        RptKeHoachTuyenDung.url = NUT.services[3].url;

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
                <td>${escapeHtml(ct.kenhTD)}</td>
                <td>${escapeHtml(formatNumberView(ct.chiphiTD))}</td>
                <td>${escapeHtml(ct.NSphutrach)}</td>
                <td>${escapeHtml(formatNumberView(ct.soluongNST))}</td>
                <td>${escapeHtml(ct.nguonUV)}</td>
                <td>${escapeHtml(ct.hinhthucTD)}</td>
            `;
        };

        var createNewTableStructure = function (win, groupData) {
            var container = win.document.createElement("div");
            container.className = "table-container";
            container.style.marginTop = "5px";

            container.innerHTML = `
                <div class="table-container">
                    <table class="plan-meta-table">
                        <colgroup><col style="width:34%"><col style="width:33%"><col style="width:33%"></colgroup>
                        <tbody>
                            <tr class="meta-row">
                                <td data-excel-span="3">Mã kế hoạch: ${escapeHtml(groupData.MaKH)}</td>
                                <td data-excel-span="2">Mã yêu cầu tuyển dụng: ${escapeHtml(groupData.MaYCTD)}</td>
                                <td data-excel-span="2">Ngày tạo: ${escapeHtml(formatDate(groupData.ngaytao))}</td>
                            </tr>
                            <tr class="meta-row">
                                <td colspan="3" data-excel-span="7">Tên kế hoạch: ${escapeHtml(groupData.tenkh)}</td>
                            </tr>
                            <tr class="meta-row">
                                <td data-excel-span="3">Người lập: ${escapeHtml(groupData.nguoilap)}</td>
                                <td data-excel-span="2">Người duyệt: ${escapeHtml(groupData.nguoiduyet)}</td>
                                <td data-excel-span="2">Ngày duyệt: ${escapeHtml(formatDate(groupData.ngayduyet))}</td>
                            </tr>
                            <tr class="meta-row">
                                <td data-excel-span="3">Ngày bắt đầu: ${escapeHtml(formatDate(groupData.ngayBD))}</td>
                                <td data-excel-span="2">Ngày kết thúc: ${escapeHtml(formatDate(groupData.ngayKT))}</td>
                                <td data-excel-span="2">Trạng thái: ${escapeHtml(groupData.status)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="rpt-table">
                        <colgroup>
                            <col style="width:4%">
                            <col style="width:17%">
                            <col style="width:12%">
                            <col style="width:20%">
                            <col style="width:9%">
                            <col style="width:19%">
                            <col style="width:19%">
                        </colgroup>
                        <thead>
                            <tr class="header-row">
                                <th class="col-stt">STT</th>
                                <th>Kênh tuyển dụng</th>
                                <th>Chi phí tuyển dụng</th>
                                <th>Nhân sự phụ trách</th>
                                <th>Số lượng nhân sự tuyển</th>
                                <th>Nguồn ứng viên</th>
                                <th>Hình thức tuyển dụng</th>
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
                    <h1>BÁO CÁO KẾ HOẠCH TUYỂN DỤNG</h1>
                </div>
            `;

            return header;
        };

        var openReport = function (rows) {
            if (!rows || !rows.length) {
                return NUT.notify("⚠️ Không có dữ liệu kế hoạch tuyển dụng!", "yellow");
            }

            var groupMap = Object.create(null);
            var groups = [];

            rows.forEach(function (r) {
                var key = r.MaKH || "";

                if (!groupMap[key]) {
                    groupMap[key] = {
                        MaKH: r.MaKH,
                        MaYCTD: r.MaYCTD,
                        tenkh: r.tenkh,
                        nguoilap: r.nguoilap,
                        nguoiduyet: r.nguoiduyet,
                        ngayduyet: r.ngayduyet,
                        ngaytao: r.ngaytao,
                        ngayBD: r.ngayBD,
                        ngayKT: r.ngayKT,
                        status: r.status,
                        details: []
                    };

                    groups.push(groupMap[key]);
                }

                groupMap[key].details.push(r);
            });

            var win = window.open(
                "site/" + n$.user.siteid + "/" + n$.app.appid + "/RptKeHoachTuyenDung.html"
            );

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
            var maKH = selectedRecord.MaKH || selectedRecord.makh || selectedRecord.maKH;

            if (!maKH) {
                return NUT.notify("⚠️ Không xác định được mã kế hoạch tuyển dụng!", "yellow");
            }

            NUT.ds.select({
                url: RptKeHoachTuyenDung.url + "data/ba_kehoachtuyendung_v",
                where: [["MaKH", "=", maKH]]
            }, function (res) {
                if (!res.success || !res.result.length) {
                    return NUT.notify("⚠️ Không có dữ liệu kế hoạch tuyển dụng!", "yellow");
                }

                openReport(res.result);
            });
        }

        else if (p.popup || (!p.records && typeof p.records === "undefined")) {
            NUT.w2popup.open({
                title: "📃 <i>Báo cáo kế hoạch tuyển dụng</i>",
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
                            url: RptKeHoachTuyenDung.url + "data/ba_kehoachtuyendung_v",
                            where: whereConditions,
                            orderby: "ngaytao, MaKH"
                        }, function (res) {
                            if (!res.success || !res.result.length) {
                                return NUT.notify("⚠️ Không có dữ liệu kế hoạch tuyển dụng!", "yellow");
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
