var DailySanLuongReport = {
    url: "",
    serviceIndex: 3,
    domainThiTruong: 1201,

    products: [
        { key: "keg",       label: "Keg 1L",              dv: 12, td: false },
        { key: "bold",      label: "Bold chai 20",        dv: 20, td: false },
        { key: "light",     label: "Light chai 20",       dv: 20, td: false },
        { key: "boldl",     label: "Bold lon 24",         dv: 24, td: false },
        { key: "lightl",    label: "Light lon 24",        dv: 24, td: false },
        { key: "trucbachl", label: "Trúc Bạch 24",        dv: 24, td: false },
        { key: "hanoiprel", label: "Pre lon sleek 24", dv: 24, td: false },
        { key: "hanoipre",  label: "Pre chai 20",      dv: 20, td: false }
    ],

    ctCols: [
        { key: "keg",       label: "Keg 1L" },
        { key: "bold",      label: "Bold" },
        { key: "light",     label: "Light" },
        { key: "trucbach",  label: "Trúc Bạch" },
        { key: "hanoiprel", label: "Pre lon sleek" },
        { key: "hanoipre",  label: "Pre chai" }
    ],

    maSanPhamCT: {
        KEG: "keg",
        KEG1L: "keg",
        BOLD: "bold",
        BOLDL: "boldl",
        LIGHT: "light",
        LIGHTL: "lightl",
        TRUCBACH: "trucbach",
        TRUCBACHL: "trucbachl",
        HANOIPRE: "hanoipre",
        HANOIPREL: "hanoiprel"
    },

    ctMerge: {
        boldl: "bold",
        lightl: "light",
        trucbachl: "trucbach"
    },

    unmapped: {},
    focusKeys: {},

    widthFixed: [
        30, 85, 80, 130, 170, 60,
        65, 140, 55, 160, 90, 70
    ],

    // Giữ vị trí các ngày như bản hiện tại.
    summaryFirst: false,
    widthSP: 42,
    widthSum: 46,
    widthCT: 58,

    /*
     * Đọc cờ trọng điểm từ DB.
     * Gộp theo nhóm như các báo cáo tháng:
     * Bold chai/lon cùng nhóm, Light chai/lon cùng nhóm.
     */
    loadFocus: function (callback) {
        var self = DailySanLuongReport;

        NUT.ds.select({
            url: self.url + "data/sanpham",
            limit: 5000,
            select: "masanpham,trongdiem",
            where: [
                ["madoitac", "=", "HABECO"]
            ]
        }, function (res) {
            if (
                !res ||
                !res.success ||
                !Array.isArray(res.result) ||
                res.result.length >= 5000
            ) {
                NUT.alert(
                    "Không đọc đủ danh mục sản phẩm/trọng điểm. " +
                    "Dừng xuất báo cáo.",
                    "red"
                );
                return;
            }

            var flags = {};
            var known = false;

            res.result.forEach(function (p) {
                if (!Object.prototype.hasOwnProperty.call(
                    p,
                    "trongdiem"
                )) {
                    return;
                }

                known = true;

                var v = p.trongdiem;
                var marked =
                    v === true ||
                    v === 1 ||
                    v === "1" ||
                    String(v).toLowerCase() === "true";

                if (!marked) return;

                var code = String(p.masanpham || "")
                    .trim()
                    .toUpperCase();

                var key = self.maSanPhamCT[code];

                if (!key) return;

                key = self.ctMerge[key] || key;
                flags[key] = true;
            });

            if (!known) {
                NUT.alert(
                    "DB không trả cột sanpham.trongdiem. " +
                    "Không tự chọn sản phẩm trọng điểm.",
                    "red"
                );
                return;
            }

            self.focusKeys = flags;

            self.products.forEach(function (p) {
                var group = self.ctMerge[p.key] || p.key;
                p.td = !!flags[group];
            });

            callback();
        });
    },

    productKey: function (masanpham) {
        var self = DailySanLuongReport;

        var s = String(
            masanpham == null ? "" : masanpham
        ).trim();

        if (!s) return "";

        var up = s.toUpperCase();

        if (self.maSanPhamCT[up]) {
            var k = self.maSanPhamCT[up];

            for (var i = 0; i < self.products.length; i++) {
                if (self.products[i].key === k) {
                    return k;
                }
            }
        }

        var low = s.toLowerCase();

        for (var j = 0; j < self.products.length; j++) {
            if (self.products[j].key === low) {
                return low;
            }
        }

        self.unmapped[up] = true;

        if (window.console) {
            console.warn(
                "[DailySanLuongReport] " +
                "Mã SP không có cột sản lượng ngày: " + s
            );
        }

        return "";
    },

    ctKey: function (masanpham) {
        var self = DailySanLuongReport;

        var s = String(
            masanpham == null ? "" : masanpham
        ).trim();

        if (!s) return "";

        var k = self.maSanPhamCT[s.toUpperCase()] ||
            s.toLowerCase();

        if (self.ctMerge[k]) {
            k = self.ctMerge[k];
        }

        for (var i = 0; i < self.ctCols.length; i++) {
            if (self.ctCols[i].key === k) {
                return k;
            }
        }

        self.unmapped[s.toUpperCase()] = true;

        if (window.console) {
            console.warn(
                "[DailySanLuongReport] " +
                "Mã SP chưa map (chỉ tiêu): " + s
            );
        }

        return "";
    },

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
                    "<td><input id='num_Year' type='number' " +
                    "style='width:75px' value='" +
                    now.getFullYear() + "'></td>" +
                    "<td>Tháng</td>" +
                    "<td><input id='num_Month' type='number' " +
                    "min='1' max='12' style='width:55px' value='" +
                    (now.getMonth() + 1) + "'></td>" +
                "</tr>" +

                "<tr>" +
                    "<td>Thị trường</td>" +
                    "<td colspan='3'>" +
                    NUT.outerCboHTML(
                        NUT.domains[self.domainThiTruong].items,
                        "cbo_ThiTruong"
                    ) +
                    "</td>" +
                "</tr>" +

                "<tr>" +
                    "<td>Vị trí</td>" +
                    "<td colspan='3'>" +
                        "<select id='cbo_ViTriLv'>" +
                            "<option value='' selected>" +
                                "-- Tất cả --" +
                            "</option>" +
                            "<option value='BA'>BA</option>" +
                            "<option value='BA_'>" +
                                "BA_PartTime" +
                            "</option>" +
                        "</select>" +
                    "</td>" +
                "</tr>" +

                "<tr><td colspan='4'>" +
                    "<input id='chk_Edit' type='checkbox'>" +
                    "<label for='chk_Edit'>" +
                        "Dùng dữ liệu hiệu chỉnh" +
                    "</label>" +
                "</td></tr>" +
                "</table>",

            buttons:
                "<button class='w2ui-btn' " +
                "onclick='NUT.w2popup.close()'>" +
                    "⛌ Close" +
                "</button>" +
                "<button class='w2ui-btn' " +
                "onclick='DailySanLuongReport.runReport()'>" +
                    "✔️ Xuất báo cáo" +
                "</button>"
        });
    },

    attachSoldQty: function (records, callback) {
        var self = DailySanLuongReport;
        var ids = [];
        var seen = Object.create(null);

        records.forEach(function (r) {
            var id = r.idchamcong;

            if (id == null || seen[id]) return;

            seen[id] = true;
            ids.push(id);
        });

        if (!ids.length) {
            records.forEach(function (rec) {
                self.products.forEach(function (p) {
                    rec[p.key] = 0;
                });
            });

            callback(records);
            return;
        }

        var chunkSize = 150;
        var chunks = [];

        for (var i = 0; i < ids.length; i += chunkSize) {
            chunks.push(ids.slice(i, i + chunkSize));
        }

        var byId = Object.create(null);
        var done = 0;
        var hadError = false;

        function finishOne() {
            done++;

            if (done < chunks.length) return;

            records.forEach(function (rec) {
                var bag = byId[String(rec.idchamcong)] || {};

                self.products.forEach(function (p) {
                    var x = bag[p.key];

                    rec[p.key] = x && x.hasC
                        ? Math.max(
                            0,
                            (x.a || 0) + (x.n || 0) - (x.c || 0)
                        )
                        : 0;
                });
            });

            if (hadError) {
                NUT.alert(
                    "Không đọc đủ dữ liệu sản lượng " +
                    "(chamcong_ct). Dừng xuất báo cáo " +
                    "để tránh sai số. Hãy xuất lại báo cáo.",
                    "red"
                );
                return;
            }

            callback(records);
        }

        chunks.forEach(function (chunk) {
            NUT.ds.select({
                url: self.url + "data/chamcong_ct",
                limit: 20000,
                where: [[
                    "idchamcong",
                    "in",
                    chunk.join("','")
                ]]
            }, function (resCt) {
                if (
                    !(resCt && resCt.success) ||
                    (resCt.result || []).length >= 20000
                ) {
                    hadError = true;
                    finishOne();
                    return;
                }

                (resCt.result || []).forEach(function (row) {
                    var id = String(row.idchamcong);
                    var key = self.productKey(row.masanpham);

                    if (!key) return;

                    var bag = byId[id] || (byId[id] = {});

                    if (!bag[key]) {
                        bag[key] = {
                            a: 0,
                            n: 0,
                            c: 0,
                            hasC: false
                        };
                    }

                    var qty = Number(row.soluong) || 0;
                    var kind = Number(row.daucuoi);

                    if (kind === 0) {
                        bag[key].a += qty;
                    } else if (kind === 2) {
                        bag[key].n += qty;
                    } else if (kind === 1) {
                        bag[key].c += qty;
                        bag[key].hasC = true;
                    }
                });

                finishOne();
            });
        });
    },

    runReport: function () {
        var self = DailySanLuongReport;

        var nam = Number(
            document.getElementById("num_Year").value
        );

        var thang = Number(
            document.getElementById("num_Month").value
        );

        if (!nam || !thang || thang < 1 || thang > 12) {
            NUT.alert(
                "Nhập năm, tháng trước khi thực hiện!",
                "yellow"
            );
            return;
        }

        var cbo = document.getElementById("cbo_ThiTruong");
        var thiTruong = cbo ? cbo.value : "";
        var thiTruongText = "";

        if (
            cbo &&
            cbo.options &&
            cbo.selectedIndex >= 0 &&
            thiTruong
        ) {
            thiTruongText = cbo.options[cbo.selectedIndex].text;
        }

        var vitrilv = document
            .getElementById("cbo_ViTriLv").value;

        var dulieu = document
            .getElementById("chk_Edit").checked ? 1 : 0;

        var date =
            nam + "-" +
            String(thang).padStart(2, "0") +
            "-15";

        NUT.ds.select({
            url: self.url + "data/chucvuhabeco",
            limit: 10000,
            where: [
                ["machucvu", "in", "TF','TL','GDCN"],
                [
                    "or",
                    ["ngaybatdau", "is", null],
                    ["ngaybatdau", "<=", date]
                ],
                [
                    "or",
                    ["ngayketthuc", "is", null],
                    ["ngayketthuc", ">=", date]
                ]
            ]
        }, function (res2) {
            if (!res2.success) {
                NUT.alert(
                    "Không lấy được dữ liệu chức vụ!",
                    "yellow"
                );
                return;
            }

            var lookupTL = {};
            var lookupTF = {};
            var gdcn = [];

            (res2.result || []).forEach(function (cv) {
                if (cv.machucvu == "TL") {
                    lookupTL[cv.makhuvuc] = cv.hoten;
                } else if (cv.machucvu == "TF") {
                    lookupTF[cv.makhuvuc] = cv.hoten;
                } else if (
                    cv.machucvu == "GDCN" &&
                    cv.hoten &&
                    gdcn.indexOf(cv.hoten) < 0
                ) {
                    gdcn.push(cv.hoten);
                }
            });

            var loadChamCong = function (lookupChiTieu) {
                var where = [
                    ["nam", "=", nam],
                    ["thang", "=", thang],
                    ["madoitac", "=", "HABECO"],
                    ["dulieu", "=", dulieu]
                ];

                if (thiTruong) {
                    where.push(["thitruong", "=", thiTruong]);
                }

                if (vitrilv == "BA") {
                    where.push(["vitrilv", "=", "BA"]);
                } else if (vitrilv) {
                    where.push(["vitrilv", "like", vitrilv + "*"]);
                }

                NUT.ds.select({
                    url: self.url + "data/chamcong_v",
                    limit: 20000,
                    orderby: "sttkv,stt,madiemban",
                    where: where
                }, function (res) {
                    if (!res.success) {
                        NUT.alert(
                            "Không đọc được dữ liệu chamcong_v.",
                            "yellow"
                        );
                        return;
                    }

                    if (!res.result.length) {
                        NUT.alert(
                            "Không có dữ liệu báo cáo!",
                            "yellow"
                        );
                        return;
                    }

                    if (res.result.length >= 20000) {
                        NUT.alert(
                            "Dữ liệu vượt 20000 dòng nên báo cáo " +
                            "sẽ thiếu. Hãy chọn thị trường hoặc " +
                            "vị trí để thu hẹp.",
                            "red"
                        );
                        return;
                    }

                    self.unmapped = {};

                    self.loadFocus(function () {
                        self.attachSoldQty(
                            res.result,
                            function (rowsWithSold) {
                                var miss = Object.keys(self.unmapped);

                                // if (miss.length) {
                                //     NUT.alert(
                                //         "Mã sản phẩm không có cột " +
                                //         "trong báo cáo: " +
                                //         miss.join(", "),
                                //         "yellow"
                                //     );
                                // }

                                self.renderReport(
                                    rowsWithSold,
                                    nam,
                                    thang,
                                    thiTruongText,
                                    lookupTL,
                                    lookupTF,
                                    gdcn,
                                    lookupChiTieu
                                );
                            }
                        );
                    });
                });
            };

            NUT.ds.select({
                url: self.url + "data/chitieu",
                limit: 20000,
                where: [
                    ["nam", "=", nam],
                    ["thang", "=", thang],
                    ["madoitac", "=", "HABECO"]
                ]
            }, function (res3) {
                if (
                    !res3.success ||
                    (res3.result || []).length >= 20000
                ) {
                    NUT.alert(
                        "Không lấy được dữ liệu chỉ tiêu!",
                        "yellow"
                    );
                    return;
                }

                var idToNv = {};
                var ids = [];

                (res3.result || []).forEach(function (h) {
                    idToNv[h.idchitieu] = h.manhanvien;
                    ids.push(h.idchitieu);
                });

                if (!ids.length) {
                    loadChamCong({});
                    return;
                }

                NUT.ds.select({
                    url: self.url + "data/chitieu_ct",
                    limit: 20000,
                    where: [[
                        "idchitieu",
                        "in",
                        ids.join("','")
                    ]]
                }, function (res4) {
                    if (
                        !res4.success ||
                        (res4.result || []).length >= 20000
                    ) {
                        NUT.alert(
                            "Không lấy được chi tiết chỉ tiêu!",
                            "yellow"
                        );
                        return;
                    }

                    var lookupChiTieu = {};

                    (res4.result || []).forEach(function (d) {
                        var ma = idToNv[d.idchitieu];

                        if (ma === undefined) return;

                        var key = self.ctKey(d.masanpham);

                        if (!key) return;

                        var ct = lookupChiTieu[ma] ||
                            (lookupChiTieu[ma] = {});

                        ct[key] =
                            (ct[key] || 0) +
                            (Number(d.soluong) || 0);
                    });

                    loadChamCong(lookupChiTieu);
                });
            });
        });
    },

    renderReport: function (
        data,
        nam,
        thang,
        thiTruongText,
        lookupTL,
        lookupTF,
        gdcn,
        lookupChiTieu
    ) {
        var self = DailySanLuongReport;

        var win = window.open(
            "site/" + n$.user.siteid + "/" +
            n$.app.appid + "/DailySanLuongReport.html"
        );

        if (!win) {
            NUT.alert(
                "Trình duyệt đã chặn cửa sổ báo cáo!",
                "yellow"
            );
            return;
        }

        var draw = function () {
            var doc = win.document;

            var need = [
                "tblReport",
                "tblHead",
                "tblData",
                "labGDCN",
                "labThangNam",
                "labThiTruong",
                "labNgayBaoCao"
            ];

            var missing = need.filter(function (id) {
                return !doc.getElementById(id);
            });

            if (missing.length) {
                NUT.alert(
                    "Template HTML thiếu id: " +
                    missing.join(", "),
                    "yellow"
                );
                return;
            }

            var table = doc.getElementById("tblReport");
            var head = doc.getElementById("tblHead");
            var body = doc.getElementById("tblData");

            var P = self.products;
            var NP = P.length;
            var CT = self.ctCols;
            var NCT = CT.length;

            var soNgay = new Date(nam, thang, 0).getDate();

            function num(v) {
                var n = Number(v);
                return isNaN(n) ? 0 : n;
            }

            function pad2(n) {
                return String(n).padStart(2, "0");
            }

            function r1(v) {
                return String(Math.round(v * 10) / 10);
            }

            function r2(v) {
                return String(Math.round(v * 100) / 100);
            }

            function zeros(n) {
                var a = [];

                for (var i = 0; i < n; i++) {
                    a.push(0);
                }

                return a;
            }

            function pct(a, b) {
                return b
                    ? Math.round(100 * a / b) + "%"
                    : "";
            }

            doc.getElementById("labGDCN").textContent =
                gdcn.join(" + ");

            doc.getElementById("labThangNam").textContent =
                pad2(thang) + "/" + nam;

            doc.getElementById("labThiTruong").textContent =
                thiTruongText ||
                n$.user.kvhcnames ||
                "Tất cả";

            doc.getElementById("labNgayBaoCao").textContent =
                "Ngày báo cáo: " +
                new Date().toLocaleString("vi-VN");

            // Loại trùng bản ghi do JOIN.
            var seenId = Object.create(null);

            var rows = data.filter(function (rec) {
                if (
                    rec.idchamcong === null ||
                    rec.idchamcong === undefined
                ) {
                    return true;
                }

                var id = String(rec.idchamcong);

                if (seenId[id]) return false;

                seenId[id] = true;

                return true;
            });

            // Mỗi nhân viên + điểm bán một dòng Daily.
            var groups = Object.create(null);

            rows.forEach(function (rec) {
                var key = JSON.stringify([
                    rec.manhanvien,
                    rec.madiemban
                ]);

                var g = groups[key];

                if (!g) {
                    g = groups[key] = {
                        info: rec,
                        days: []
                    };
                }

                var day = Number(rec.ngay);

                if (!day || day < 1 || day > soNgay) return;

                var arr = g.days[day];

                if (!arr) {
                    arr = g.days[day] = zeros(NP);
                }

                for (var j = 0; j < NP; j++) {
                    arr[j] += Math.max(
                        0,
                        num(rec[P[j].key])
                    );
                }
            });

            var keys = Object.keys(groups).sort(function (a, b) {
                var x = groups[a].info;
                var y = groups[b].info;

                return num(x.sttkv) - num(y.sttkv) ||
                    num(x.stt) - num(y.stt) ||
                    String(x.manhanvien || "")
                        .localeCompare(String(y.manhanvien || "")) ||
                    String(x.madiemban || "")
                        .localeCompare(String(y.madiemban || ""));
            });

            var dayTot = [];

            for (var d = 1; d <= soNgay; d++) {
                dayTot[d] = zeros(NP);
            }

            var totalSum = zeros(NP);
            var grandTotal = 0;
            var totalTd = 0;

            var list = keys.map(function (key) {
                var g = groups[key];
                var sum = zeros(NP);
                var tdSum = 0;

                for (var d = 1; d <= soNgay; d++) {
                    var arr = g.days[d];

                    if (!arr) continue;

                    for (var j = 0; j < NP; j++) {
                        var v = arr[j];

                        if (!v) continue;

                        dayTot[d][j] += v;
                        sum[j] += v;
                    }
                }

                var grand = 0;

                // Quy đổi và làm tròn từng sản phẩm/từng dòng.
                for (var j = 0; j < NP; j++) {
                    sum[j] = Math.round(
                        sum[j] / P[j].dv * 10
                    ) / 10;

                    grand += sum[j];
                    totalSum[j] += sum[j];

                    if (P[j].td) {
                        tdSum += sum[j];
                    }
                }

                grandTotal += grand;
                totalTd += tdSum;

                return {
                    g: g,
                    rec: g.info,
                    sum: sum,
                    grand: grand,
                    tdSum: tdSum,
                    ct: null,
                    pct: null
                };
            });

            /*
             * Gom bằng mã NV, không phụ thuộc các dòng
             * của nhân viên có nằm liền nhau hay không.
             */
            var emps = [];
            var byNv = Object.create(null);

            list.forEach(function (r, i) {
                var ma = String(r.rec.manhanvien);
                var e = byNv[ma];

                if (!e) {
                    e = byNv[ma] = {
                        ma: ma,
                        first: i,
                        nvSum: 0,
                        nvTd: 0
                    };

                    emps.push(e);
                }

                e.nvSum += r.grand;
                e.nvTd += r.tdSum;
            });

            var ctTot = zeros(NCT);
            var ctSumTot = 0;
            var ctTdTot = 0;

            emps.forEach(function (e) {
                var ct = lookupChiTieu[e.ma];

                if (!ct) return;

                var sumct = 0;

                for (var k = 0; k < NCT; k++) {
                    var v = num(ct[CT[k].key]);

                    sumct += v;
                    ctTot[k] += v;
                }

                var sumcttd = 0;
                var focusNames = [];

                CT.forEach(function (c) {
                    if (!self.focusKeys[c.key]) return;

                    sumcttd += num(ct[c.key]);

                    if (num(ct[c.key]) > 0) {
                        var name =
                            c.key === "keg" ? "K" :
                            c.key === "hanoiprel" ? "Pre lon" :
                            c.key === "hanoipre" ? "Pre chai" :
                            c.label;

                        focusNames.push(name);
                    }
                });

                ctSumTot += sumct;
                ctTdTot += sumcttd;

                // KPI và % ghi tại dòng đầu của NV.
                list[e.first].focusName = focusNames.join("+");

                list[e.first].ct = {
                    row: ct,
                    sumct: sumct,
                    sumcttd: sumcttd
                };

                list[e.first].pct = {
                    dat: pct(e.nvSum, sumct),
                    td: pct(e.nvTd, sumcttd)
                };
            });

            var daysWidths = [];
            var sumWidths = [];

            for (var i = 0; i < soNgay * NP; i++) {
                daysWidths.push(self.widthSP);
            }

            // KPI: 6 sản phẩm + tổng.
            for (var i = 0; i < NCT + 1; i++) {
                sumWidths.push(self.widthCT);
            }

            // Tháng: 8 sản phẩm + tổng + %.
            for (var i = 0; i < NP + 2; i++) {
                sumWidths.push(self.widthSum);
            }

            // Trọng điểm: khoán + thực đạt + % + tên.
            for (var i = 0; i < 4; i++) {
                sumWidths.push(self.widthCT);
            }

            var widths = self.widthFixed.concat(
                self.summaryFirst
                    ? sumWidths.concat(daysWidths)
                    : daysWidths.concat(sumWidths)
            );

            var oldCg = table.querySelector("colgroup");

            if (oldCg) oldCg.remove();

            var cg = doc.createElement("colgroup");

            widths.forEach(function (w) {
                var col = doc.createElement("col");
                col.style.width = w + "px";
                cg.appendChild(col);
            });

            table.insertBefore(cg, table.firstChild);

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

            function addTh(
                tr,
                text,
                rowSpan,
                colSpan,
                cls
            ) {
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

            addTh(
                tr1,
                "Địa chỉ làm việc của NVTT",
                1,
                addressCols.length
            );

            addressCols.forEach(function (label) {
                addTh(tr2, label, 1, 1);
            });

            var addDayHeaders = function () {
                for (var d = 1; d <= soNgay; d++) {
                    var alt = d % 2 === 0 ? "alt" : "";

                    addTh(tr1, pad2(d), 1, NP, alt);

                    for (var j = 0; j < NP; j++) {
                        addTh(tr2, P[j].label, 1, 1, alt);
                    }
                }
            };

            var addSumHeaders = function () {
                var period = pad2(thang) + "/" + nam;

                addTh(
                    tr1,
                    "Chỉ tiêu KPI tháng " + period,
                    1,
                    NCT + 1,
                    "ctc"
                );

                CT.forEach(function (c) {
                    addTh(tr2, c.label, 1, 1, "ctc");
                });

                addTh(
                    tr2,
                    "Tổng chỉ tiêu KPI",
                    1,
                    1,
                    "ctc tot"
                );

                addTh(
                    tr1,
                    "Tổng tháng " + period,
                    1,
                    NP + 2,
                    "qd"
                );

                P.forEach(function (p) {
                    addTh(tr2, p.label, 1, 1, "qd");
                });

                addTh(
                    tr2,
                    "Tổng tháng " + pad2(thang),
                    1,
                    1,
                    "qd tot"
                );

                addTh(
                    tr2,
                    "% Thực đạt Tổng",
                    1,
                    1,
                    "pc"
                );

                addTh(
                    tr1,
                    "Sản lượng trọng điểm",
                    1,
                    3,
                    "ctc"
                );

                addTh(
                    tr2,
                    "Chỉ tiêu tổng SP trọng điểm",
                    1,
                    1,
                    "ctc"
                );

                addTh(
                    tr2,
                    "Tổng thực đạt trọng điểm",
                    1,
                    1,
                    "ctc"
                );

                addTh(
                    tr2,
                    "% Thực đạt trọng điểm",
                    1,
                    1,
                    "pc"
                );

                addTh(
                    tr1,
                    "Sản phẩm trọng điểm",
                    2,
                    1,
                    "ctc"
                );
            };

            if (self.summaryFirst) {
                addSumHeaders();
                addDayHeaders();
            } else {
                addDayHeaders();
                addSumHeaders();
            }

            head.appendChild(tr1);
            head.appendChild(tr2);
            body.innerHTML = "";

            var addDayCells = function (r, addCell) {
                for (var d = 1; d <= soNgay; d++) {
                    var arr = r.g.days[d];
                    var cls = d % 2 === 0 ? "alt" : "";

                    for (var j = 0; j < NP; j++) {
                        addCell(
                            arr && arr[j] ? r2(arr[j]) : "",
                            cls
                        );
                    }
                }
            };

            var addSumCells = function (r, addCell) {
                var ct = r.ct;

                // 1. Chỉ tiêu KPI tháng.
                for (var k = 0; k < NCT; k++) {
                    var raw = ct
                        ? ct.row[CT[k].key]
                        : null;

                    addCell(
                        raw !== null && raw !== undefined
                            ? raw
                            : "",
                        "ctc"
                    );
                }

                addCell(
                    ct ? ct.sumct : "",
                    "ctc tot"
                );

                // 2. Tổng tháng.
                for (var j = 0; j < NP; j++) {
                    addCell(
                        r.sum[j] ? r1(r.sum[j]) : "",
                        "qd"
                    );
                }

                addCell(r1(r.grand), "qd tot");
                addCell(r.pct ? r.pct.dat : "", "pc");

                // 3. Sản lượng trọng điểm.
                addCell(ct ? ct.sumcttd : "", "ctc");
                addCell(r1(r.tdSum), "ctc");
                addCell(r.pct ? r.pct.td : "", "pc");
                addCell(r.focusName || "", "ctc");
            };

            list.forEach(function (r, index) {
                var rec = r.rec;
                var row = doc.createElement("tr");

                function addCell(value, cls) {
                    var td = doc.createElement("td");

                    td.textContent =
                        value === null || value === undefined
                            ? ""
                            : String(value);

                    if (cls) td.className = cls;

                    row.appendChild(td);
                }

                var tlTf =
                    lookupTF[rec.makhuvuc] ||
                    lookupTL[rec.makhuvuc] ||
                    rec.hotenquanly ||
                    "";

                addCell(index + 1, "info");
                addCell(rec.dms, "info");
                addCell(rec.thitruong, "info");
                addCell(tlTf, "info");

                addCell(
                    rec.hotenNVTT || rec.hoten,
                    "info nm"
                );

                addCell(
                    rec.sohoso != null
                        ? rec.sohoso
                        : rec.manhanvien,
                    "info"
                );

                addCell(rec.loaihinh, "info");
                addCell(rec.tendiemban, "info");
                addCell(rec.sonha, "info");
                addCell(rec.duong, "info");
                addCell(rec.huyen, "info");
                addCell(rec.tenkhuvuc, "info");

                if (self.summaryFirst) {
                    addSumCells(r, addCell);
                    addDayCells(r, addCell);
                } else {
                    addDayCells(r, addCell);
                    addSumCells(r, addCell);
                }

                body.appendChild(row);
            });

            var totalRow = doc.createElement("tr");
            totalRow.className = "total-row";

            function addTotal(value, cls, colSpan) {
                var td = doc.createElement("td");

                td.textContent =
                    value === null || value === undefined
                        ? ""
                        : String(value);

                if (cls) td.className = cls;
                if (colSpan) td.colSpan = colSpan;

                totalRow.appendChild(td);
            }

            var addDayTotals = function () {
                for (var d = 1; d <= soNgay; d++) {
                    for (var j = 0; j < NP; j++) {
                        addTotal(
                            dayTot[d][j] ? r2(dayTot[d][j]) : ""
                        );
                    }
                }
            };

            var addSumTotals = function () {
                for (var k = 0; k < NCT; k++) {
                    addTotal(ctTot[k] || "");
                }

                addTotal(ctSumTot || "");

                for (var j = 0; j < NP; j++) {
                    addTotal(
                        totalSum[j] ? r1(totalSum[j]) : ""
                    );
                }

                addTotal(r1(grandTotal));
                addTotal(pct(grandTotal, ctSumTot));

                addTotal(ctTdTot || "");
                addTotal(r1(totalTd));
                addTotal(pct(totalTd, ctTdTot));
                addTotal("");
            };

            addTotal("Tổng cộng", "label", 12);

            if (self.summaryFirst) {
                addSumTotals();
                addDayTotals();
            } else {
                addDayTotals();
                addSumTotals();
            }

            body.appendChild(totalRow);
        };

        var tries = 0;

        var timer = setInterval(function () {
            var ready = false;

            try {
                ready =
                    win.document.readyState !== "loading" &&
                    win.document.getElementById("tblData");
            } catch (e) {}

            if (ready) {
                clearInterval(timer);

                try {
                    draw();
                } catch (err) {
                    console.error(err);

                    NUT.alert(
                        "Lỗi vẽ báo cáo: " + err.message,
                        "yellow"
                    );
                }
            } else if (++tries > 100) {
                clearInterval(timer);

                NUT.alert(
                    "Không mở được template " +
                    "DailySanLuongReport.html " +
                    "(kiểm tra tên file/đường dẫn)",
                    "yellow"
                );
            }
        }, 100);
    }
};