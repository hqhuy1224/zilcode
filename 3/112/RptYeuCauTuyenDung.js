var RptYeuCauTuyenDung = {
    run: function (p) {
        p = p || {};
        RptYeuCauTuyenDung.url = NUT.services[3].url;

        var now = (new Date()).toISOString().substring(0, 10);

        // Có thể gán ID domain trực tiếp nếu hệ thống của bạn dùng ID cố định.
        // Để null, hàm sẽ tự dò domain theo tên/alias.
        var DOMAIN_PHONG_YC_ID = null;
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

        var cboPhongYC = buildDomainSelect(
            "cboPhongYC",
            "Tất cả phòng yêu cầu",
            DOMAIN_PHONG_YC_ID,
            ["phòng yêu cầu", "phong yeu cau", "phòng ban", "phong ban"]
        );

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

        var buildRowHtml = function (ct, stt) {
            return `
                <td>${stt}</td>
                <td>${ct.loaiTD || ""}</td>
                <td>${formatNumberView(ct.sltuyen)}</td>
                <td>${ct.vitri || ""}</td>
                <td>${ct.motaCV || ""}</td>
                <td>${ct.kynang || ""}</td>
                <td>${ct.kinhnghiem || ""}</td>
                <td>${formatNumberView(ct.mucluong)}</td>
                <td>${ct.ngoaihinh || ""}</td>
                <td>${ct.ngoaingu || ""}</td>
                <td>${ct.trinhdotinhoc || ""}</td>
                <td>${ct.suckhoe || ""}</td>
                <td>${ct.ghichu || ""}</td>
            `;
        };

        var createNewTableStructure = function (win, groupData) {
            var container = win.document.createElement("div");
            container.className = "table-container";
            container.style.marginTop = "5px";

            container.innerHTML = `
                <div class="table-container">
                    <table class="rpt-table" id="tblData">
                        <thead>
                            <tr class="meta-row">
                                <td colspan="4">Mã yêu cầu: ${groupData.MaYCTD || ""}</td>
                                <td colspan="4">Ngày tạo: ${formatDate(groupData.ngaytao)}</td>
                                <td colspan="5">Phòng yêu cầu: ${groupData.phongyc || ""}</td>
                            </tr>

                            <tr class="meta-row">
                                <td colspan="4">Tên yêu cầu: ${groupData.tenyc || ""}</td>
                                <td colspan="4">Ngày cần nhân sự: ${formatDate(groupData.ngaycanns)}</td>
                                <td colspan="5">Trạng thái: ${groupData.status || ""}</td>
                            </tr>

                            <tr class="meta-row">
                                <td colspan="4">Người đề nghị: ${groupData.nguoidenghi || ""}</td>
                                <td colspan="9">Người phê duyệt: ${groupData.nguoipheduyet || ""}</td>
                            </tr>

                            <tr class="header-row">
                                <th class="col-stt">STT</th>
                                <th class="col-loai">Loại tuyển dụng</th>
                                <th class="col-soluong">Số lượng tuyển</th>
                                <th class="col-vitri">Vị trí</th>
                                <th class="col-mota">Mô tả công việc</th>
                                <th class="col-ky-nang">Kỹ năng</th>
                                <th class="col-kinhnghiem">Số năm kinh nghiệm</th>
                                <th class="col-mucluong">Mức lương</th>
                                <th class="col-ngoaihinh">Ngoại hình</th>
                                <th class="col-ngoaingu">Ngoại ngữ</th>
                                <th class="col-tinhoc">Trình độ tin học</th>
                                <th class="col-suckhoe">Yêu cầu sức khỏe</th>
                                <th class="col-ghichu">Ghi chú</th>
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
                    <h1>BÁO CÁO YÊU CẦU TUYỂN DỤNG</h1>
                </div>
            `;

            return header;
        };

        var openReport = function (rows) {
            if (!rows || !rows.length) {
                return NUT.notify("⚠️ Không có dữ liệu yêu cầu tuyển dụng!", "yellow");
            }

            var groupMap = {};
            var groups = [];

            rows.forEach(function (r) {
                var key = r.MaYCTD || "";

                if (!groupMap[key]) {
                    groupMap[key] = {
                        MaYCTD: r.MaYCTD,
                        ngaytao: r.ngaytao,
                        tenyc: r.tenyc,
                        phongyc: r.phongyc,
                        ngaycanns: r.ngaycanns,
                        nguoidenghi: r.nguoidenghi,
                        nguoipheduyet: r.nguoipheduyet,
                        status: r.status,
                        details: []
                    };

                    groups.push(groupMap[key]);
                }

                groupMap[key].details.push(r);
            });

            var win = window.open(
                "site/" + n$.user.siteid + "/" + n$.app.appid + "/RptYeuCauTuyenDung.html"
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
                    var tbody = tableContainer.querySelector("tbody");

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
            var maYCTD = selectedRecord.MaYCTD || selectedRecord.mayctd || selectedRecord.maYCTD;

            if (!maYCTD) {
                return NUT.notify("⚠️ Không xác định được mã yêu cầu tuyển dụng!", "yellow");
            }

            NUT.ds.select({
                url: RptYeuCauTuyenDung.url + "data/ba_yctuyendung_v",
                where: [["MaYCTD", "=", maYCTD]]
            }, function (res) {
                if (!res.success || !res.result.length) {
                    return NUT.notify("⚠️ Không có dữ liệu yêu cầu tuyển dụng!", "yellow");
                }

                openReport(res.result);
            });
        }

        else if (p.popup || (!p.records && typeof p.records === "undefined")) {
            NUT.w2popup.open({
                title: "📃 <i>Báo cáo yêu cầu tuyển dụng</i>",
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
                            <td>Phòng yêu cầu</td>
                            <td>${cboPhongYC.outerHTML}</td>
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
                        var cboPhongYC = document.getElementById("cboPhongYC");
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

                        if (cboPhongYC && cboPhongYC.value !== "") {
                            whereConditions.push(["phongyc", "=", cboPhongYC.value]);
                        }

                        if (cboStatus && cboStatus.value !== "") {
                            whereConditions.push(["status", "=", cboStatus.value]);
                        }

                        NUT.ds.select({
                            url: RptYeuCauTuyenDung.url + "data/ba_yctuyendung_v",
                            where: whereConditions,
                            orderby: "ngaytao, MaYCTD"
                        }, function (res) {
                            if (!res.success || !res.result.length) {
                                return NUT.notify("⚠️ Không có dữ liệu yêu cầu tuyển dụng!", "yellow");
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
