var MonthlyMS03Report = {
    url: "",
    serviceIndex: 3,
    domainThiTruong: 1201,
    madoitac: "HABECO",
    template: "MonthlyMS03Report.html",
    requestChunkSize: 150,
    requestTimeoutMs: 60000,

    dinhMucCong: 26,
    ngayKy: 15,
    targetInKet: true,
    viewName: "MS03_View",

    groups: [
        { key: "keg", label: "Keg 1L", short: "K", td: true },
        { key: "bold", label: "Bold", short: "Bold", td: false },
        { key: "light", label: "Light", short: "Light", td: false },
        { key: "tb", label: "TB", short: "TB", td: false },
        { key: "prelon", label: "Pre lon sleek", short: "Pre lon", td: true },
        { key: "prechai", label: "Pre chai", short: "Pre chai", td: false }
    ],

    products: {
        KEG:       { g: "keg", dv: 12 },
        KEG1L:     { g: "keg", dv: 12 },
        BOLD:      { g: "bold", dv: 20 },
        BOLDL:     { g: "bold", dv: 24 },
        LIGHT:     { g: "light", dv: 20 },
        LIGHTL:    { g: "light", dv: 24 },
        TRUCBACH:  { g: "tb", dv: 20 },
        TRUCBACHL: { g: "tb", dv: 24 },
        HANOIPRE:  { g: "prechai", dv: 20 },
        HANOIPREL: { g: "prelon", dv: 24 }
    },

    util: {
        num: function (v) {
            var n = Number(v);
            return isNaN(n) ? 0 : n;
        },

        str: function (v) {
            return v === null || v === undefined
                ? ""
                : String(v).trim();
        },

        pad2: function (n) {
            return String(n).padStart(2, "0");
        },

        zeros: function (n) {
            var a = [];
            for (var i = 0; i < n; i++) a.push(0);
            return a;
        },

        truthy: function (v) {
            return v === true ||
                v === 1 ||
                v === "1" ||
                String(v).toLowerCase() === "true";
        },

        uniq: function (list) {
            var seen = Object.create(null);
            var out = [];

            list.forEach(function (x) {
                x = x === null || x === undefined
                    ? ""
                    : String(x).trim();

                if (x && !seen[x]) {
                    seen[x] = true;
                    out.push(x);
                }
            });

            return out;
        },

        r0: function (v) {
            return String(Math.round(v));
        },

        r1: function (v) {
            return String(Math.round(v * 10) / 10);
        },

        f1: function (v) {
            return (Math.round(v * 10) / 10).toFixed(1);
        },

        pct: function (a, b) {
            return b > 0
                ? Math.round(100 * a / b) + "%"
                : "";
        },

        esc: function (s) {
            return String(s).replace(/[&<>"]/g, function (c) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;"
                }[c];
            });
        }
    },

    run: function () {
        var self = MonthlyMS03Report;
        var now = new Date();

        self.url = NUT.services[self.serviceIndex].url;

        var khuVuc = n$.user.orgs
            ? "<tr><td>Khu vực</td><td colspan='3'>" +
                (n$.user.kvhcnames || "") +
                "</td></tr>"
            : "<tr><td>Thị trường</td><td colspan='3'>" +
                NUT.outerCboHTML(
                    NUT.domains[self.domainThiTruong].items,
                    "cbo_ThiTruong"
                ) +
                "</td></tr>";

        NUT.w2popup.open({
            title: "📜 <i>Monthly MS03 - Báo cáo tổng kết hoàn thành chỉ tiêu</i>",
            modal: true,
            width: 380,
            height: 260,

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
                "<tr><td>Đối tác</td><td colspan='3'>" +
                    self.madoitac +
                "</td></tr>" +
                khuVuc +
                "<tr>" +
                    "<td>Vị trí</td>" +
                    "<td colspan='3'>" +
                        "<select id='cbo_ViTriLv'>" +
                            "<option value='' selected>--Tất cả--</option>" +
                            "<option value='BA'>BA</option>" +
                            "<option value='BA_'>BA_PartTime</option>" +
                        "</select>" +
                    "</td>" +
                "</tr>" +
                "<tr><td colspan='4'>" +
                    "<input id='chk_Edit' type='checkbox'>" +
                    "<label for='chk_Edit'>Dùng dữ liệu hiệu chỉnh</label>" +
                "</td></tr>" +
                "</table>",

            buttons:
                "<button class='w2ui-btn' " +
                "onclick='NUT.w2popup.close()'>⛌ Close</button>" +
                "<button class='w2ui-btn' " +
                "onclick='MonthlyMS03Report.runReport()'>" +
                "✔️ Xuất báo cáo</button>"
        });
    },

    sel: function (table, options) {
        var self = MonthlyMS03Report;
        options = options || {};

        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () {
                reject(new Error("Quá thời gian chờ dữ liệu " + table + ". Hãy thử lại hoặc thu hẹp bộ lọc."));
            }, self.requestTimeoutMs);
            try {
                NUT.ds.select(
                    Object.assign({
                        url: self.url + "data/" + table
                    }, options),
                    function (res) {
                        clearTimeout(timer);
                        if (!res || !res.success) {
                            return reject(new Error(
                                "Không đọc được dữ liệu " + table + "." +
                                (
                                    res && typeof res.result === "string"
                                        ? " " + res.result
                                        : ""
                                )
                            ));
                        }

                        var rows = res.result || [];

                        if (options.limit &&
                            rows.length >= options.limit) {
                            return reject(new Error(
                                table + " vượt giới hạn " +
                                options.limit +
                                " dòng nên số liệu sẽ không đầy đủ. " +
                                "Hãy thu hẹp bộ lọc."
                            ));
                        }

                        resolve(rows);
                    }
                );
            } catch (e) {
                clearTimeout(timer);
                reject(e);
            }
        });
    },

    selectIn: async function (table, field, ids, options) {
        var self = MonthlyMS03Report;
        var out = [];
        var uniqueIds = self.util.uniq(ids);
        var chunkSize = self.requestChunkSize;

        for (var offset = 0; offset < uniqueIds.length; offset += chunkSize) {
            var part = await self.sel(
                table,
                Object.assign({}, options, {
                    where: (options && options.where || []).concat([[
                        field,
                        "in",
                        uniqueIds.slice(offset, offset + chunkSize).join("','")
                    ]])
                })
            );
            out = out.concat(part);
        }

        return out;
    },

    runReport: async function () {
        var self = MonthlyMS03Report;
        var U = self.util;

        var nam = Number(
            document.getElementById("num_Year").value
        );

        var thang = Number(
            document.getElementById("num_Month").value
        );

        if (!nam || !thang || thang < 1 || thang > 12) {
            NUT.notify(
                "Nhập năm, tháng hợp lệ trước khi thực hiện!",
                "yellow"
            );
            return;
        }

        var cbo = document.getElementById("cbo_ThiTruong");
        var thiTruong = cbo ? cbo.value : "";

        var thiTruongText = n$.user.orgs
            ? (n$.user.kvhcnames || "")
            : (
                cbo && thiTruong && cbo.selectedIndex >= 0
                    ? cbo.options[cbo.selectedIndex].text
                    : "Tất cả"
            );

        var vitrilv = document
            .getElementById("cbo_ViTriLv").value;

        var dulieu = document
            .getElementById("chk_Edit").checked ? 1 : 0;

        var date = nam + "-" + U.pad2(thang) + "-15";

        var where = [
            ["nam", "=", nam],
            ["thang", "=", thang],
            ["madoitac", "=", self.madoitac],
            ["dulieu", "=", dulieu]
        ];

        if (vitrilv === "BA") {
            where.push(["vitrilv", "=", "BA"]);
        } else if (vitrilv) {
            where.push(["vitrilv", "like", vitrilv + "*"]);
        }

        if (!NUT.reserveReportWindow(self)) return;
        try {
            var got = await Promise.all([
                self.sel("chucvuhabeco", {
                    limit: 10000,
                    where: [
                        ["machucvu", "in", "TF','TL"],
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
                }),

                self.sel("chitieu", {
                    limit: 20000,
                    where: [
                        ["nam", "=", nam],
                        ["thang", "=", thang],
                        ["madoitac", "=", self.madoitac]
                    ]
                }),

                self.sel("sanpham", {
                    select: "masanpham,tensanpham,trongdiem,ket",
                    limit: 5000,
                    where: [
                        ["madoitac", "=", self.madoitac]
                    ]
                }),

                self.sel("chamcong_v", {
                    limit: 20000,
                    orderby: "sttkv,stt,madiemban",
                    where: where
                })
            ]);

            var cvRows = got[0];
            var heads = got[1];
            var sanpham = got[2];
            var records = got[3];

            if (thiTruong && !n$.user.orgs) {
                records = records.filter(function (r) {
                    return U.str(r.thitruong) === U.str(thiTruong);
                });
            }

            if (!records.length) {
                NUT.cancelReportWindow(self);
                NUT.notify("Không có dữ liệu báo cáo!", "yellow");
                return;
            }

            var headIds = heads.map(function (h) {
                return h.idchitieu;
            }).filter(function (x) {
                return x !== null && x !== undefined;
            });

            var parts = await Promise.all([
                headIds.length
                    ? self.selectIn(
                        "chitieu_ct",
                        "idchitieu",
                        headIds,
                        { limit: 20000 }
                    )
                    : [],

                self.sel(self.viewName, {
                    limit: 20000,
                    where: [
                        ["nam", "=", nam],
                        ["thang", "=", thang],
                        ["madoitac", "=", self.madoitac],
                        ["dulieu", "=", dulieu]
                    ]
                })
            ]);

            var model = self.buildModel({
                nam: nam,
                thang: thang,
                thiTruongText: thiTruongText,
                cvRows: cvRows,
                ctHeads: heads,
                ctDetails: parts[0],
                sanpham: sanpham,
                records: records,
                ms03: parts[1]
            });

            await self.openReport(model);
        } catch (e) {
            NUT.cancelReportWindow(self);
            console.error(e);
            NUT.notify(e.message, "red");
        }
    },

    buildModel: function (inp) {
        var self = MonthlyMS03Report;
        var U = self.util;
        var G = self.groups;
        var NG = G.length;

        var unmapped = Object.create(null);
        var groupIndex = {};

        G.forEach(function (g, i) {
            groupIndex[g.key] = i;
        });

        var sp = Object.create(null);
        var spHasTd = false;

        var groupTd = G.map(function () {
            return false;
        });

        (inp.sanpham || []).forEach(function (x) {
            var code = U.str(x.masanpham).toUpperCase();

            if (!code) return;

            sp[code] = x;

            var base = self.products[code];

            if (!base) {
                unmapped[code] = true;
                return;
            }

            if (Object.prototype.hasOwnProperty.call(x, "trongdiem")) {
                spHasTd = true;

                if (
                    U.truthy(x.trongdiem) &&
                    groupIndex[base.g] !== undefined
                ) {
                    groupTd[groupIndex[base.g]] = true;
                }
            }
        });

        function productOf(code) {
            var key = U.str(code).toUpperCase();
            var base = self.products[key];

            if (!base || groupIndex[base.g] === undefined) {
                return null;
            }

            var ket = sp[key] ? U.num(sp[key].ket) : 0;

            return {
                g: base.g,
                dv: ket > 0 ? ket : base.dv
            };
        }

        function total(arr, flags) {
            var s = 0;

            for (var i = 0; i < arr.length; i++) {
                if (!flags || flags[i]) {
                    s += arr[i];
                }
            }

            return s;
        }

        var seenId = Object.create(null);
        var records = [];

        (inp.records || []).forEach(function (r) {
            if (
                r.idchamcong !== null &&
                r.idchamcong !== undefined
            ) {
                var id = String(r.idchamcong);

                if (seenId[id]) return;

                seenId[id] = true;
            }

            records.push(r);
        });

        var tl = Object.create(null);
        var tf = Object.create(null);

        (inp.cvRows || []).forEach(function (cv) {
            var c = U.str(cv.machucvu).toUpperCase();
            var k = U.str(cv.makhuvuc);

            if (c === "TL") {
                tl[k] = U.str(cv.hoten);
            } else if (c === "TF") {
                tf[k] = U.str(cv.hoten);
            }
        });

        var idToNv = Object.create(null);

        (inp.ctHeads || []).forEach(function (h) {
            idToNv[String(h.idchitieu)] = U.str(h.manhanvien);
        });

        var target = Object.create(null);

        (inp.ctDetails || []).forEach(function (d) {
            var ma = idToNv[String(d.idchitieu)];

            if (!ma) return;

            var p = productOf(d.masanpham);

            if (!p) {
                unmapped[U.str(d.masanpham) || "(trống)"] = true;
                return;
            }

            var q = U.num(d.soluong);

            if (!self.targetInKet) {
                q = q / p.dv;
            }

            var t = target[ma] ||
                (target[ma] = U.zeros(NG));

            t[groupIndex[p.g]] += q;
        });

        var viewBy = Object.create(null);

        (inp.ms03 || []).forEach(function (v) {
            viewBy[U.str(v.manhanvien)] = v;
        });

        var cong = Object.create(null);

        Object.keys(viewBy).forEach(function (ma) {
            cong[ma] = U.num(viewBy[ma].cong);
        });

        var emps = Object.create(null);
        var order = [];

        records.forEach(function (rec) {
            var ma = U.str(rec.manhanvien);

            if (!ma) return;

            var e = emps[ma];

            if (!e) {
                e = emps[ma] = {
                    ma: ma,
                    recs: []
                };

                order.push(e);
            }

            e.recs.push(rec);
        });

        var defaultFlags = G.map(function (g) {
            return !!g.td;
        });

        var rows = [];
        var noCt = 0;
        var noView = 0;

        order.forEach(function (e) {
            var cnt = Object.create(null);
            var best = null;

            e.recs.forEach(function (r) {
                var k = U.str(r.makhuvuc);

                cnt[k] = (cnt[k] || 0) + 1;

                if (best === null || cnt[k] > cnt[best]) {
                    best = k;
                }
            });

            var info = e.recs.filter(function (r) {
                return U.str(r.makhuvuc) === best;
            })[0];

            var worked = e.recs.filter(function (r) {
                return U.str(r.thoigianden) !== "";
            });

            var pts = [];
            var seenPt = Object.create(null);

            (worked.length ? worked : e.recs)
                .slice()
                .sort(function (a, b) {
                    return U.str(a.madiemban)
                        .localeCompare(U.str(b.madiemban));
                })
                .forEach(function (r) {
                    var k = U.str(r.madiemban);

                    if (!k || seenPt[k]) return;

                    seenPt[k] = true;
                    pts.push(r);
                });

            if (!pts.length) {
                pts = [info];
            }

            function field(name) {
                return U.uniq(pts.map(function (r) {
                    return r[name];
                })).join(", ");
            }

            // Giữ nguồn tổng tháng của báo cáo gốc.
            var dat = G.map(function (g) {
                var v = viewBy[e.ma];

                return v
                    ? Math.max(0, U.num(v[g.key + "_ket"]))
                    : 0;
            });

            var ct = target[e.ma] || null;
            var flags = spHasTd ? groupTd : defaultFlags;
            var khoan = ct ? ct.slice() : U.zeros(NG);
            var labels = [];

            G.forEach(function (g, i) {
                if (ct && flags[i] && khoan[i] > 0) {
                    labels.push(g.short);
                }
            });

            if (!ct) noCt++;
            if (!viewBy[e.ma]) noView++;

            rows.push({
                ma: e.ma,
                region: best,
                regionName: U.str(info.tenkhuvuc) || best || "Khác",
                sttkv: U.num(info.sttkv),
                stt: U.num(info.stt),
                tlTf: tf[best] || tl[best] || U.str(info.hotenquanly),
                hoten: U.str(info.hotenNVTT) || U.str(info.hoten),
                loai: field("loaihinh"),
                ten: field("tendiemban"),
                sonha: field("sonha"),
                duong: field("duong"),
                huyen: field("huyen"),
                tinh: U.str(info.tenkhuvuc),
                dinhMuc: self.dinhMucCong,
                thucHien: cong[e.ma] || 0,
                hasCt: !!ct,
                khoan: khoan,
                khoanTong: total(khoan),
                khoanTd: total(khoan, flags),
                dat: dat,
                datTong: total(dat),
                datTd: total(dat, flags),
                spTd: labels.join("+")
            });
        });

        rows.sort(function (a, b) {
            return a.sttkv - b.sttkv ||
                a.region.localeCompare(b.region) ||
                a.stt - b.stt ||
                a.ma.localeCompare(b.ma);
        });

        function newSum() {
            return {
                dinhMuc: 0,
                thucHien: 0,
                khoan: U.zeros(NG),
                khoanTong: 0,
                khoanTd: 0,
                dat: U.zeros(NG),
                datTong: 0,
                datTd: 0
            };
        }

        function addTo(s, r) {
            s.dinhMuc += r.dinhMuc;
            s.thucHien += r.thucHien;
            s.khoanTong += r.khoanTong;
            s.khoanTd += r.khoanTd;
            s.datTong += r.datTong;
            s.datTd += r.datTd;

            for (var i = 0; i < NG; i++) {
                s.khoan[i] += r.khoan[i];
                s.dat[i] += r.dat[i];
            }
        }

        var regions = [];
        var byKey = Object.create(null);
        var grand = newSum();

        rows.forEach(function (r, i) {
            r.stt = i + 1;

            var rg = byKey[r.region];

            if (!rg) {
                rg = byKey[r.region] = {
                    ten: r.regionName,
                    rows: [],
                    sum: newSum()
                };

                regions.push(rg);
            }

            rg.rows.push(r);
            addTo(rg.sum, r);
            addTo(grand, r);
        });

        var warnings = [];
        var list = Object.keys(unmapped);

        if (list.length) {
            warnings.push(
                "Mã sản phẩm chưa map nên bị bỏ qua " +
                "(số liệu có thể thiếu): " +
                list.join(", ") +
                ". Bổ sung vào MonthlyMS03Report.products."
            );
        }

        if (noView) {
            warnings.push(
                noView + " nhân viên chưa có trong " +
                self.viewName +
                " nên ngày công và sản lượng thực đạt = 0."
            );
        }

        if (noCt) {
            warnings.push(
                noCt + " nhân viên chưa có chỉ tiêu tháng " +
                U.pad2(inp.thang) + "/" + inp.nam +
                " (để trống phần khoán)."
            );
        }

        if (!spHasTd) {
            warnings.push(
                "Bảng sanpham không có cột trongdiem " +
                "nên dùng bộ trọng điểm mặc định (" +
                G.filter(function (g) {
                    return g.td;
                }).map(function (g) {
                    return g.label;
                }).join(", ") +
                ")."
            );
        }

        return {
            nam: inp.nam,
            thang: inp.thang,
            thiTruongText: inp.thiTruongText,
            regions: regions,
            grand: grand,
            warnings: warnings
        };
    },

    openReport: function (model) {
        var self = MonthlyMS03Report;

        var win = NUT.openReportWindow(self,
            "site/" + n$.user.siteid + "/" +
            n$.app.appid + "/" + self.template
        );

        if (!win) {
            return;
        }

        var tries = 0;

        var timer = setInterval(function () {
            var ready = false;

            try {
                ready = win.document.readyState !== "loading" &&
                    !!win.document.getElementById("tblData");
            } catch (e) {}

            if (ready) {
                clearInterval(timer);

                try {
                    self.draw(win.document, model);
                } catch (err) {
                    console.error(err);

                    NUT.notify(
                        "Lỗi vẽ báo cáo: " + err.message,
                        "red"
                    );
                }
            } else if (++tries > 100) {
                clearInterval(timer);

                NUT.notify(
                    "Không mở được template " + self.template +
                    " (kiểm tra tên file/đường dẫn).",
                    "yellow"
                );
            }
        }, 100);
    },

    draw: function (doc, m) {
        var self = MonthlyMS03Report;
        var U = self.util;
        var NG = self.groups.length;

        var need = [
            "tblData",
            "labThang",
            "labNam",
            "labThiTruong",
            "labNgayKy",
            "labThangKy",
            "labNamKy"
        ];

        var missing = need.filter(function (id) {
            return !doc.getElementById(id);
        });

        if (missing.length) {
            throw new Error(
                "Template HTML thiếu id: " +
                missing.join(", ")
            );
        }

        doc.getElementById("labThang").textContent =
            U.pad2(m.thang);

        doc.getElementById("labNam").textContent = m.nam;

        doc.getElementById("labThiTruong").textContent =
            m.thiTruongText || "Tất cả";

        var nm = m.thang === 12 ? 1 : m.thang + 1;
        var ny = m.thang === 12 ? m.nam + 1 : m.nam;

        doc.getElementById("labNgayKy").textContent = self.ngayKy;
        doc.getElementById("labThangKy").textContent = U.pad2(nm);
        doc.getElementById("labNamKy").textContent = ny;

        var warn = doc.getElementById("divWarn");

        if (warn) {
            if (m.warnings.length) {
                warn.innerHTML = m.warnings.map(function (w) {
                    return "⚠ " + U.esc(w);
                }).join("<br>");

                warn.hidden = false;
            } else {
                warn.hidden = true;
            }
        }

        var body = doc.getElementById("tblData");
        body.innerHTML = "";

        function cell(tr, value, cls, colSpan) {
            var td = doc.createElement("td");

            td.textContent = value === null || value === undefined
                ? ""
                : String(value);

            if (cls) td.className = cls;
            if (colSpan) td.colSpan = colSpan;

            tr.appendChild(td);

            return td;
        }

        function employeeRow(r) {
            var tr = doc.createElement("tr");
            var i;

            cell(tr, r.stt);
            cell(tr, r.tlTf);
            cell(tr, r.hoten, "nm");
            cell(tr, r.loai, "ad");
            cell(tr, r.ten, "ad");
            cell(tr, r.sonha, "ad");
            cell(tr, r.duong, "ad");
            cell(tr, r.huyen, "ad");
            cell(tr, r.tinh, "ad");

            cell(tr, r.dinhMuc);
            cell(tr, U.r1(r.thucHien));

            for (i = 0; i < NG; i++) {
                cell(
                    tr,
                    r.hasCt && r.khoan[i] > 0
                        ? U.r1(r.khoan[i])
                        : ""
                );
            }

            cell(tr, r.hasCt ? U.r1(r.khoanTong) : "", "y");
            cell(tr, r.hasCt ? U.r1(r.khoanTd) : "", "y");

            for (i = 0; i < NG; i++) {
                cell(
                    tr,
                    r.dat[i] > 0 ? U.f1(r.dat[i]) : ""
                );
            }

            cell(tr, U.r0(r.datTong), "y");
            cell(tr, U.r0(r.datTd), "y");

            cell(tr, r.spTd, "sp");
            cell(tr, U.pct(r.datTong, r.khoanTong), "pc");
            cell(tr, U.pct(r.datTd, r.khoanTd), "pc");

            cell(tr, "");
            cell(tr, r.tinh, "tinh");

            return tr;
        }

        function totalRow(s, cls, label) {
            var tr = doc.createElement("tr");
            var i;

            tr.className = cls;

            if (cls === "sub") {
                cell(tr, "");
                cell(tr, label, "lbl", 8);
            } else {
                cell(tr, label, "lbl", 9);
            }

            cell(tr, U.r0(s.dinhMuc));
            cell(tr, U.r1(s.thucHien));

            for (i = 0; i < NG; i++) {
                cell(tr, U.r1(s.khoan[i]));
            }

            cell(tr, U.r1(s.khoanTong), "y");
            cell(tr, U.r1(s.khoanTd), "y");

            for (i = 0; i < NG; i++) {
                cell(tr, U.r0(s.dat[i]));
            }

            cell(tr, U.r0(s.datTong), "y");
            cell(tr, U.r0(s.datTd), "y");

            cell(tr, "");
            cell(tr, U.pct(s.datTong, s.khoanTong), "pc");
            cell(tr, U.pct(s.datTd, s.khoanTd), "pc");
            cell(tr, "");
            cell(tr, "");

            return tr;
        }

        m.regions.forEach(function (rg) {
            rg.rows.forEach(function (r) {
                body.appendChild(employeeRow(r));
            });

            body.appendChild(totalRow(
                rg.sum,
                "sub",
                "TỔNG " + rg.ten.toUpperCase()
            ));
        });

        body.appendChild(totalRow(
            m.grand,
            "grand",
            "TỔNG CỘNG"
        ));
    }
};

/*
 * Phần bổ sung đã tích hợp trong cùng file.
 * Giữ cách dựng báo cáo gốc, chỉ thêm dữ liệu và cột tuần.
 */
(function (R) {
    "use strict";

    if (R._weeklyExtension) return;
    R._weeklyExtension = true;

    var oldBuild = R.buildModel;
    var oldOpen = R.openReport;
    var oldDraw = R.draw;

    var codes = [
        "KEG",
        "BOLD",
        "LIGHT",
        "BOLDL",
        "LIGHTL",
        "TRUCBACHL",
        "HANOIPREL",
        "HANOIPRE"
    ];

    var divisors = [
        12, 20, 20, 24, 24, 24, 24, 20
    ];

    var groupOf = [
        0, 1, 2, 1, 2, 3, 4, 5
    ];

    var labels = [
        "Keg 1L",
        "Bold",
        "Light",
        "TB",
        "Pre lon sleek",
        "Pre chai"
    ];

    function empty(n) {
        return Array.from(
            { length: n },
            function () {
                return [0, 0, 0, 0, 0, 0];
            }
        );
    }

    function round1(v) {
        var x = Math.abs(v) * 10;

        return (v < 0 ? -1 : 1) *
            Math.floor(
                x + 0.5 +
                Number.EPSILON * Math.max(1, x) * 4
            ) / 10;
    }

    function weeksOf(year, month) {
        var last = new Date(year, month, 0).getDate();

        var end = 7 - (
            (new Date(year, month - 1, 1).getDay() + 6) % 7
        );

        var start = 1;
        var weeks = [];

        while (start <= last) {
            weeks.push({
                start: start,
                end: Math.min(end, last)
            });

            start = end + 1;
            end += 7;
        }

        return weeks;
    }

    function total(a) {
        return a.reduce(function (s, v) {
            return s + v;
        }, 0);
    }

    function own(o, k) {
        return Object.prototype.hasOwnProperty.call(o, k);
    }

    R.buildModel = function (inp) {
        var m = oldBuild.call(this, inp);
        m._weeklySource = inp;

        return m;
    };

    function calculate(m, detailRows) {
        var source = m._weeklySource;
        var weeks = weeksOf(m.nam, m.thang);

        var records = [];
        var seen = Object.create(null);
        var details = Object.create(null);
        var points = Object.create(null);
        var byEmployee = Object.create(null);

        var duplicate = false;
        var unknown = Object.create(null);

        source.records.forEach(function (r) {
            if (r.idchamcong == null) return;

            var id = String(r.idchamcong);

            if (seen[id]) return;

            seen[id] = true;
            records.push(r);
        });

        detailRows.forEach(function (d) {
            var id = String(d.idchamcong);

            if (!seen[id]) return;

            var code = String(d.masanpham || "")
                .trim()
                .toUpperCase();

            if (code === "KEG1L") {
                code = "KEG";
            }

            var pi = codes.indexOf(code);
            var kind = Number(d.daucuoi);

            if (pi < 0) {
                unknown[code || "(trống)"] = true;
                return;
            }

            if ([0, 1, 2].indexOf(kind) < 0) {
                return;
            }

            var bag = details[id] ||
                (details[id] = Object.create(null));

            var x = bag[pi] || (bag[pi] = {});

            // Giống HrmsCheckInOut.indexSales.
            if (own(x, kind)) {
                duplicate = true;
                return;
            }

            x[kind] = Math.max(
                0,
                Number(d.soluong) || 0
            );
        });

        records.forEach(function (r) {
            var ma = String(r.manhanvien || "").trim();
            var day = Number(r.ngay);

            var wi = weeks.findIndex(function (w) {
                return day >= w.start && day <= w.end;
            });

            if (!ma || wi < 0) return;

            var key = JSON.stringify([
                ma,
                String(r.madiemban || "").trim()
            ]);

            var pt = points[key] || (points[key] = {
                ma: ma,
                month: Array(8).fill(0),
                weekly: weeks.map(function () {
                    return Array(8).fill(0);
                })
            });

            var bag = details[String(r.idchamcong)] || {};

            Object.keys(bag).forEach(function (pi) {
                var x = bag[pi];

                // Chưa có tồn cuối thì chưa tính số bán.
                if (!own(x, 1)) return;

                var sold = Math.max(
                    0,
                    (x[0] || 0) + (x[2] || 0) - x[1]
                );

                pt.month[pi] += sold;
                pt.weekly[wi][pi] += sold;
            });
        });

        /*
         * Excel:
         * ROUND từng sản phẩm / dòng Daily trước,
         * sau đó cộng theo manhanvien.
         */
        Object.keys(points).forEach(function (key) {
            var p = points[key];

            var e = byEmployee[p.ma] ||
                (byEmployee[p.ma] = {
                    weekly: empty(weeks.length),
                    month: [0, 0, 0, 0, 0, 0]
                });

            codes.forEach(function (code, pi) {
                var gi = groupOf[pi];

                e.month[gi] += round1(
                    p.month[pi] / divisors[pi]
                );

                p.weekly.forEach(function (a, wi) {
                    e.weekly[wi][gi] += round1(
                        a[pi] / divisors[pi]
                    );
                });
            });
        });

        function zeroSummary(s) {
            s.weekly = empty(weeks.length);
            s.weeklyMonth = 0;
        }

        function addSummary(s, r) {
            r.weekly.forEach(function (a, wi) {
                a.forEach(function (v, gi) {
                    s.weekly[wi][gi] += v;
                });
            });

            s.weeklyMonth += r.weeklyMonth;
        }

        zeroSummary(m.grand);

        m.regions.forEach(function (rg) {
            zeroSummary(rg.sum);

            rg.rows.forEach(function (r) {
                var e = byEmployee[String(r.ma).trim()];

                r.weekly = e
                    ? e.weekly
                    : empty(weeks.length);

                // Tính tháng riêng, không cộng tuần đã làm tròn.
                r.weeklyMonth = e
                    ? round1(total(e.month))
                    : 0;

                addSummary(rg.sum, r);
                addSummary(m.grand, r);
            });
        });

        m.weeks = weeks;

        if (duplicate) {
            m.warnings.push(
                "Chi tiết sản lượng có dòng trùng mã/loại; " +
                "lấy dòng đầu như chức năng check-in/out."
            );
        }

        if (Object.keys(unknown).length) {
            m.warnings.push(
                "Sản phẩm chưa có cột trong khối tuần của mẫu: " +
                Object.keys(unknown).join(", ") +
                "."
            );
        }
    }

    R.openReport = async function (m) {
        try {
            var ids = Array.from(new Set(
                m._weeklySource.records
                    .filter(function (r) {
                        return r.idchamcong != null;
                    })
                    .map(function (r) {
                        return r.idchamcong;
                    })
            ));

            var rows = ids.length
                ? await this.selectIn(
                    "chamcong_ct",
                    "idchamcong",
                    ids,
                    { limit: 20000 }
                )
                : [];

            calculate(m, rows);

            delete m._weeklySource;

            oldOpen.call(this, m);
        } catch (e) {
            console.error(e);

            NUT.cancelReportWindow(this);
            NUT.notify(
                "Không lấy đủ dữ liệu sản lượng tuần: " +
                e.message,
                "red"
            );
        }
    };

    function layout(doc, m) {
        var table = doc.getElementById("tblReport");

        if (table.dataset.weeklyAdded) return;

        var h1 = table.querySelector("tr.hdr1");
        var h2 = table.querySelector("tr.hdr2");
        var cg = table.querySelector("colgroup");

        if (
            !h1 ||
            !h2 ||
            !cg ||
            cg.children.length !== 32
        ) {
            throw Error(
                "Cần sử dụng HTML gốc 32 cột đi kèm bản JS này."
            );
        }

        var baseWidth = parseFloat(
            doc.defaultView.getComputedStyle(table).width
        ) || 1961;

        var extra = m.weeks.length * 6 + 1;

        var anchor1 = h1.cells[6];
        var anchor2 = h2.cells[7];
        var anchorCol = cg.children[11];

        function th(text, span, rowSpan, cls) {
            var el = doc.createElement("th");

            el.textContent = text;

            if (span) el.colSpan = span;
            if (rowSpan) el.rowSpan = rowSpan;
            if (cls) el.className = cls;

            return el;
        }

        var addedWidth = 0;

        m.weeks.forEach(function (w, wi) {
            h1.insertBefore(
                th(
                    "Tuần " + (wi + 1) +
                    " (" + w.start + "–" + w.end + ")",
                    6
                ),
                anchor1
            );

            labels.forEach(function (name, gi) {
                h2.insertBefore(th(name), anchor2);

                var col = doc.createElement("col");
                var width = gi === 4 ? 50 : 44;

                col.style.width = width + "px";

                cg.insertBefore(col, anchorCol);
                addedWidth += width;
            });
        });

        h1.insertBefore(
            th("Tổng thực đạt", 1, 2, "y"),
            anchor1
        );

        var sumCol = doc.createElement("col");
        sumCol.style.width = "52px";

        cg.insertBefore(sumCol, anchorCol);
        addedWidth += 52;

        table.style.width =
            (baseWidth + addedWidth) + "px";

        // Mở rộng colspan để phủ hết các cột mới.
        table.querySelectorAll(
            "td.t1,td.t2,td.t3"
        ).forEach(function (td) {
            td.colSpan += extra;
        });

        var company = table.querySelectorAll("td.dv");

        if (company.length === 2) {
            company[1].colSpan += extra;
        }

        var footer = doc.getElementById("tblFooter");

        Array.from(footer.rows).forEach(function (tr) {
            var cells = Array.from(tr.cells);
            var allocated = 0;

            cells.forEach(function (td, i) {
                var add = i === cells.length - 1
                    ? extra - allocated
                    : Math.floor(extra * td.colSpan / 32);

                td.colSpan += add;
                allocated += add;
            });
        });

        table.dataset.weeklyAdded = "1";
    }

    R.draw = function (doc, m) {
        oldDraw.call(this, doc, m);

        layout(doc, m);

        var rows = doc.getElementById("tblData").rows;
        var ri = 0;

        function insert(s) {
            var tr = rows[ri++];
            var logical = 0;
            var anchor = null;

            for (var i = 0; i < tr.cells.length; i++) {
                if (logical === 11) {
                    anchor = tr.cells[i];
                    break;
                }

                logical += tr.cells[i].colSpan;
            }

            if (!anchor) {
                throw Error(
                    "Không xác định được vị trí chèn sản lượng tuần."
                );
            }

            function td(value, cls) {
                var cell = doc.createElement("td");

                cell.textContent =
                    value == null || value === ""
                        ? ""
                        : String(round1(value));

                if (cls) cell.className = cls;

                tr.insertBefore(cell, anchor);
            }

            s.weekly.forEach(function (a) {
                a.forEach(function (v) {
                    td(v || "");
                });
            });

            td(s.weeklyMonth, "y");
        }

        m.regions.forEach(function (rg) {
            rg.rows.forEach(insert);
            insert(rg.sum);
        });

        insert(m.grand);
    };
})(MonthlyMS03Report);
