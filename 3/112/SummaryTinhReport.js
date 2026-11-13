var SummaryTinhReport = {
    serviceIndex: 3,
    madoitac: "HABECO",
    template: "SummaryTinhReport.html",
    viewName: "MS03_View",

    requestChunkSize: 150,
    requestTimeoutMs: 60000,
    dinhMucCong: 26,

    // Theo SUMMARY Excel: SL ngày không cộng Keg.
    // Tổng sản lượng tháng vẫn có Keg.
    includeKegInDailySales: false,

    products: {
        KEG:       { i: 0, group: 0, dv: 12 },
        KEG1L:     { i: 0, group: 0, dv: 12 },
        BOLD:      { i: 1, group: 1, dv: 20 },
        LIGHT:     { i: 2, group: 2, dv: 20 },
        BOLDL:     { i: 3, group: 1, dv: 24 },
        LIGHTL:    { i: 4, group: 2, dv: 24 },
        TRUCBACH:  { i: -1, group: 3, dv: 20 },
        TRUCBACHL: { i: 5, group: 3, dv: 24 },
        HANOIPREL: { i: 6, group: 4, dv: 24 },
        HANOIPRE:  { i: 7, group: 5, dv: 20 }
    },

    number: function (v) {
        var n = Number(v);
        return Number.isFinite(n) ? n : 0;
    },

    text: function (v) {
        return v == null ? "" : String(v).trim();
    },

    round: function (v, d) {
        var p = Math.pow(10, d);
        var a = Math.abs(v) * p;

        return (v < 0 ? -1 : 1) *
            Math.floor(
                a + 0.5 +
                Number.EPSILON * Math.max(1, a) * 4
            ) / p;
    },

    flag: function (v) {
        return v === true ||
            v === 1 ||
            v === "1" ||
            String(v).toLowerCase() === "true";
    },

    sel: function (table, options) {
        var self = this;

        return new Promise(function (resolve, reject) {
            var timer = setTimeout(function () {
                reject(Error("Quá thời gian đọc " + table));
            }, self.requestTimeoutMs);

            try {
                NUT.ds.select(
                    Object.assign({
                        url: self.url + "data/" + table
                    }, options),
                    function (res) {
                        clearTimeout(timer);

                        if (!res || !res.success) {
                            return reject(Error(
                                "Không đọc được " + table
                            ));
                        }

                        var rows = res.result || [];

                        if (!Array.isArray(rows)) {
                            return reject(Error(
                                "Dữ liệu " + table + " không hợp lệ."
                            ));
                        }

                        if (
                            options.limit &&
                            rows.length >= options.limit
                        ) {
                            return reject(Error(
                                table +
                                " chạm giới hạn dòng. " +
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

    selectIn: async function (table, field, ids) {
        var all = [];

        var unique = Array.from(new Set(
            ids.filter(function (id) {
                return id != null;
            }).map(String)
        ));

        for (
            var i = 0;
            i < unique.length;
            i += this.requestChunkSize
        ) {
            var part = await this.sel(table, {
                limit: 20000,
                where: [[
                    field,
                    "in",
                    unique.slice(
                        i,
                        i + this.requestChunkSize
                    ).join("','")
                ]]
            });

            all = all.concat(part);
        }

        return all;
    },

    run: async function () {
        var self = this;
        var now = new Date();

        self.url = NUT.services[self.serviceIndex]
            .url.replace(/\/?$/, "/");

        try {
            var rows = await self.sel("khuvuc", {
                select: "makhuvuc,tenkhuvuc",
                limit: 5000
            });

            var names = Array.from(new Set(
                rows.map(function (r) {
                    return self.text(r.tenkhuvuc) ||
                        self.text(r.makhuvuc);
                }).filter(Boolean)
            )).sort(function (a, b) {
                return a.localeCompare(b, "vi");
            });

            function esc(value) {
                return String(value).replace(
                    /[&<>"']/g,
                    function (c) {
                        return {
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;",
                            "'": "&#39;"
                        }[c];
                    }
                );
            }

            var options =
                "<option value=''>" +
                "-- Tất cả tỉnh/thành --" +
                "</option>";

            names.forEach(function (name) {
                options +=
                    '<option value="' + esc(name) + '">' +
                    esc(name) +
                    "</option>";
            });

            NUT.w2popup.open({
                title: "📜 SUMMARY — Tổng hợp theo tỉnh",
                modal: true,
                width: 420,
                height: 235,

                body:
                    "<table style='margin:auto'>" +

                    "<tr>" +
                        "<td>Năm</td>" +
                        "<td><input id='sumYear' type='number' " +
                        "style='width:75px' value='" +
                        now.getFullYear() + "'></td>" +

                        "<td>Tháng</td>" +
                        "<td><input id='sumMonth' type='number' " +
                        "min='1' max='12' style='width:55px' value='" +
                        (now.getMonth() + 1) + "'></td>" +
                    "</tr>" +

                    "<tr>" +
                        "<td>Tỉnh/Thành</td>" +
                        "<td colspan='3'>" +
                            "<select id='sumProvince' " +
                            "style='width:260px'>" +
                                options +
                            "</select>" +
                        "</td>" +
                    "</tr>" +

                    "<tr><td colspan='4'>" +
                        "<input id='sumEdit' type='checkbox'>" +
                        "<label for='sumEdit'>" +
                            "Dùng dữ liệu hiệu chỉnh" +
                        "</label>" +
                    "</td></tr>" +

                    "</table>",

                buttons:
                    "<button class='w2ui-btn' " +
                    "onclick='NUT.w2popup.close()'>" +
                        "Đóng" +
                    "</button>" +

                    "<button class='w2ui-btn' " +
                    "onclick='SummaryTinhReport.runReport()'>" +
                        "Xuất báo cáo" +
                    "</button>"
            });
        } catch (e) {
            NUT.notify(
                "Không tải được danh sách tỉnh/thành: " +
                e.message,
                "red"
            );
        }
    },

    runReport: async function () {
        var self = this;

        var year = Number(
            document.getElementById("sumYear").value
        );

        var month = Number(
            document.getElementById("sumMonth").value
        );

        if (
            !Number.isInteger(year) ||
            year < 1900 ||
            !Number.isInteger(month) ||
            month < 1 ||
            month > 12
        ) {
            return NUT.notify(
                "Nhập năm/tháng hợp lệ.",
                "yellow"
            );
        }

        var province = self.text(
            document.getElementById("sumProvince").value
        );

        var edit = document
            .getElementById("sumEdit").checked ? 1 : 0;

        // Không lọc thị trường hoặc vị trí.
        var where = [
            ["nam", "=", year],
            ["thang", "=", month],
            ["madoitac", "=", self.madoitac],
            ["dulieu", "=", edit]
        ];

        var win;

        var useHelpers =
            typeof NUT.reserveReportWindow === "function" &&
            typeof NUT.openReportWindow === "function";

        if (useHelpers) {
            if (!NUT.reserveReportWindow(self)) return;
        } else {
            win = window.open("about:blank");

            if (!win) {
                return NUT.notify(
                    "Trình duyệt chặn cửa sổ báo cáo.",
                    "yellow"
                );
            }
        }

        try {
            var headWhere = [
                ["nam", "=", year],
                ["thang", "=", month],
                ["madoitac", "=", self.madoitac]
            ];

            var got = await Promise.all([
                self.sel("chamcong_v", {
                    limit: 20000,
                    orderby:
                        "sttkv,stt,manhanvien,madiemban,ngay,lan",
                    where: where
                }),

                self.sel("sanpham", {
                    limit: 5000,
                    where: [
                        ["madoitac", "=", self.madoitac]
                    ]
                }),

                self.sel("chitieu", {
                    limit: 20000,
                    where: headWhere
                }),

                self.sel(self.viewName, {
                    limit: 20000,
                    where: headWhere.concat([
                        ["dulieu", "=", edit]
                    ])
                })
            ]);

            if (!got[0].length) {
                throw Error("Không có dữ liệu báo cáo.");
            }

            var parts = await Promise.all([
                self.selectIn(
                    "chamcong_ct",
                    "idchamcong",
                    got[0].filter(function (r) {
                        return r.idchamcong != null;
                    }).map(function (r) {
                        return r.idchamcong;
                    })
                ),

                self.selectIn(
                    "chitieu_ct",
                    "idchitieu",
                    got[2].map(function (h) {
                        return h.idchitieu;
                    })
                )
            ]);

            var input = self.normalize({
                year: year,
                month: month,
                records: got[0],
                products: got[1],
                heads: got[2],
                view: got[3],
                details: parts[0],
                targets: parts[1]
            });

            // Giữ nguyên phân bổ tỉnh chính của nhân viên,
            // rồi mới lọc tỉnh trong kết quả đã chuẩn hóa.
            if (province) {
                [
                    "dailyWork",
                    "dailySales",
                    "monthly"
                ].forEach(function (key) {
                    input[key] = input[key].filter(function (r) {
                        return self.text(r.province) === province;
                    });
                });

                if (
                    !input.dailyWork.length &&
                    !input.dailySales.length &&
                    !input.monthly.length
                ) {
                    throw Error(
                        "Không có dữ liệu của tỉnh/thành " +
                        province +
                        " trong tháng đã chọn."
                    );
                }
            }

            var model = self.buildModel(input);

            // Giữ tương thích HTML hiện tại.
            model.market = province || "Tất cả tỉnh/thành";

            var path =
                "site/" + n$.user.siteid + "/" +
                n$.app.appid + "/" + self.template;

            if (useHelpers) {
                win = NUT.openReportWindow(self, path);
            } else {
                win.location.href = path;
            }

            if (!win) {
                throw Error("Không mở được cửa sổ báo cáo.");
            }

            var tries = 0;

            var timer = setInterval(function () {
                if (win.closed) {
                    clearInterval(timer);
                    return;
                }

                if (
                    win.document.readyState !== "loading" &&
                    win.document.getElementById("tblData")
                ) {
                    clearInterval(timer);

                    try {
                        self.draw(win.document, model);
                    } catch (e) {
                        NUT.notify(e.message, "red");
                    }
                } else if (++tries > 150) {
                    clearInterval(timer);

                    NUT.notify(
                        "Không tải được " + self.template,
                        "red"
                    );
                }
            }, 100);
        } catch (e) {
            if (win && !win.closed) {
                win.close();
            }

            NUT.notify(e.message, "red");
        }
    },

    normalize: function (input) {
        var self = this;
        var n = input.year;
        var t = input.month;
        var days = new Date(n, t, 0).getDate();

        var own = function (o, k) {
            return Object.prototype.hasOwnProperty.call(o, k);
        };

        var records = [];
        var seen = new Set();
        var bag = new Map();
        var points = new Map();
        var emps = new Map();
        var warnings = [];
        var unknown = new Set();

        var flags = Array(6).fill(false);
        var focusKnown = false;

        input.products.forEach(function (p) {
            var base = self.products[
                self.text(p.masanpham).toUpperCase()
            ];

            if (base && own(p, "trongdiem")) {
                focusKnown = true;

                if (self.flag(p.trongdiem)) {
                    flags[base.group] = true;
                }
            }
        });

        input.records.forEach(function (r) {
            if (!self.text(r.manhanvien)) return;

            if (r.idchamcong != null) {
                var id = String(r.idchamcong);

                if (seen.has(id)) return;

                seen.add(id);
            }

            records.push(r);
        });

        var duplicate = false;

        input.details.forEach(function (d) {
            if (!seen.has(String(d.idchamcong))) return;

            var code = self.text(d.masanpham).toUpperCase();
            var p = self.products[code];
            var kind = Number(d.daucuoi);

            if (!p || p.i < 0) {
                unknown.add(code);
                return;
            }

            if (![0, 1, 2].includes(kind)) return;

            var id = String(d.idchamcong);
            var a = bag.get(id);

            if (!a) {
                a = new Map();
                bag.set(id, a);
            }

            var x = a.get(p.i);

            if (!x) {
                x = {};
                a.set(p.i, x);
            }

            if (own(x, kind)) {
                duplicate = true;
                return;
            }

            x[kind] = Math.max(
                0,
                self.number(d.soluong)
            );
        });

        // Mỗi nhân viên/ngày tối đa 1 công.
        var workDays = new Map();
        var allocated = new Map();

        records.forEach(function (r) {
            var key = JSON.stringify([
                self.text(r.manhanvien),
                Number(r.ngay)
            ]);

            if (!workDays.has(key)) {
                workDays.set(key, []);
            }

            workDays.get(key).push(r);
        });

        workDays.forEach(function (list) {
            var left = 1;

            list.slice().sort(function (a, b) {
                return (
                    new Date(a.thoigianden) -
                    new Date(b.thoigianden)
                ) || self.number(a.lan) - self.number(b.lan);
            }).forEach(function (r) {
                var take = Math.max(
                    0,
                    Math.min(self.number(r.cong), left)
                );

                left -= take;
                allocated.set(r, take);
            });
        });

        records.forEach(function (r) {
            var ma = self.text(r.manhanvien);

            var province =
                self.text(r.tenkhuvuc) ||
                self.text(r.makhuvuc) ||
                "Chưa xác định tỉnh";

            var key = JSON.stringify([
                ma,
                self.text(r.madiemban),
                province
            ]);

            var pt = points.get(key);

            if (!pt) {
                pt = {
                    ma: ma,
                    province: province,
                    sort: self.number(r.sttkv),
                    work: Array(days).fill(0),
                    values: Array(days).fill(null),

                    qty: Array.from(
                        { length: days },
                        function () {
                            return Array(8).fill(0);
                        }
                    ),

                    month: Array(8).fill(0)
                };

                points.set(key, pt);
            }

            var e = emps.get(ma);

            if (!e) {
                e = {
                    ma: ma,
                    counts: new Map(),
                    first: province,
                    month: Array(6).fill(0)
                };

                emps.set(ma, e);
            }

            e.counts.set(
                province,
                (e.counts.get(province) || 0) + 1
            );

            var day = Number(r.ngay) - 1;

            if (day < 0 || day >= days) return;

            var take = allocated.get(r) || 0;

            if (take > 0) {
                pt.work[day] += take;
                pt.values[day] = pt.work[day];
            }

            if (r.chamcong) {
                pt.values[day] = String(r.chamcong);
            }

            var a = bag.get(String(r.idchamcong));

            if (a) {
                a.forEach(function (x, pi) {
                    // Chưa có tồn cuối thì chưa tính số bán.
                    if (!own(x, 1)) return;

                    var q = Math.max(
                        0,
                        (x[0] || 0) + (x[2] || 0) - x[1]
                    );

                    pt.qty[day][pi] += q;
                    pt.month[pi] += q;
                });
            }
        });

        var spec = [
            { group: 0, dv: 12 },
            { group: 1, dv: 20 },
            { group: 2, dv: 20 },
            { group: 1, dv: 24 },
            { group: 2, dv: 24 },
            { group: 3, dv: 24 },
            { group: 4, dv: 24 },
            { group: 5, dv: 20 }
        ];

        points.forEach(function (pt) {
            pt.month.forEach(function (q, i) {
                emps.get(pt.ma).month[spec[i].group] +=
                    self.round(q / spec[i].dv, 1);
            });
        });

        var headNv = new Map();
        var targets = new Map();

        input.heads.forEach(function (h) {
            headNv.set(
                String(h.idchitieu),
                self.text(h.manhanvien)
            );
        });

        input.targets.forEach(function (d) {
            var ma = headNv.get(String(d.idchitieu));

            var p = self.products[
                self.text(d.masanpham).toUpperCase()
            ];

            if (!ma) return;

            if (!p) {
                unknown.add(self.text(d.masanpham));
                return;
            }

            if (!targets.has(ma)) {
                targets.set(ma, Array(6).fill(0));
            }

            targets.get(ma)[p.group] +=
                self.number(d.soluong);
        });

        var view = new Map();

        input.view.forEach(function (v) {
            var ma = self.text(v.manhanvien);

            if (view.has(ma)) {
                throw Error(
                    "MS03_View có nhiều dòng cùng nhân viên " + ma
                );
            }

            view.set(ma, v);
        });

        var monthly = [];
        var dailySales = [];
        var dailyWork = [];
        var missingView = 0;
        var missingTarget = 0;

        emps.forEach(function (e) {
            var best = e.first;
            var max = -1;

            e.counts.forEach(function (count, province) {
                if (count > max) {
                    max = count;
                    best = province;
                }
            });

            var ct = targets.get(e.ma);
            var v = view.get(e.ma);

            if (!ct) missingTarget++;
            if (!v) missingView++;

            var target = ct
                ? ct.reduce(function (s, v) {
                    return s + v;
                }, 0)
                : null;

            var focusTarget = focusKnown && ct
                ? ct.reduce(function (s, v, i) {
                    return s + (flags[i] ? v : 0);
                }, 0)
                : null;

            monthly.push({
                province: best,
                ma: e.ma,
                planned: self.dinhMucCong,
                actual: v ? self.number(v.cong) : null,
                target: target,

                sales: self.round(
                    e.month.reduce(function (s, v) {
                        return s + v;
                    }, 0),
                    1
                )
            });

            e.focusTarget = focusTarget;
        });

        points.forEach(function (pt) {
            var e = emps.get(pt.ma);

            var focusSale = focusKnown
                ? pt.month.reduce(function (s, q, i) {
                    return s + (
                        flags[spec[i].group]
                            ? self.round(q / spec[i].dv, 1)
                            : 0
                    );
                }, 0)
                : null;

            var values = pt.qty.map(function (a) {
                return a.reduce(function (s, q, i) {
                    return s + (
                        i === 0 &&
                        !self.includeKegInDailySales
                            ? 0
                            : q / spec[i].dv
                    );
                }, 0);
            });

            dailySales.push({
                province: pt.province,
                sort: pt.sort,
                days: values,

                focusTarget:
                    pt.province === e.first &&
                    !e.focusAssigned
                        ? e.focusTarget
                        : 0,

                focusActual: focusSale
            });

            if (
                pt.province === e.first &&
                !e.focusAssigned
            ) {
                e.focusAssigned = true;
            }

            dailyWork.push({
                province: pt.province,
                sort: pt.sort,

                days: pt.values.map(function (v) {
                    return typeof v === "number" ? v : 0;
                })
            });
        });

        if (missingView) {
            warnings.push(
                missingView +
                " NV thiếu ngày công trong MS03_View."
            );
        }

        if (missingTarget) {
            warnings.push(
                missingTarget + " NV thiếu chỉ tiêu tháng."
            );
        }

        if (!focusKnown) {
            warnings.push(
                "Chưa xác định được sanpham.trongdiem; " +
                "để trống phần trọng điểm."
            );
        }

        if (duplicate) {
            warnings.push(
                "Có chi tiết trùng mã/loại; " +
                "lấy dòng đầu như HrmsCheckInOut."
            );
        }

        if (unknown.size) {
            warnings.push(
                "Mã sản phẩm chưa có trong mẫu: " +
                Array.from(unknown).join(", ")
            );
        }

        return {
            year: n,
            month: t,
            dailyWork: dailyWork,
            dailySales: dailySales,
            monthly: monthly,
            warnings: warnings
        };
    },

    buildModel: function (input) {
        var self = this;

        var days = new Date(
            input.year,
            input.month,
            0
        ).getDate();

        var map = new Map();

        function make(province, sort) {
            return {
                province: province,
                sort: sort || 0,
                work: Array(days).fill(0),
                sales: Array(days).fill(0),
                staff: 0,
                planned: 0,
                actual: 0,
                target: 0,
                totalSales: 0,
                focusTarget: 0,
                focusActual: 0
            };
        }

        function row(name, sort) {
            if (!map.has(name)) {
                map.set(name, make(name, sort));
            }

            return map.get(name);
        }

        function add(r, k, v) {
            r[k] = r[k] == null || v == null
                ? null
                : r[k] + v;
        }

        input.dailyWork.forEach(function (x) {
            var r = row(x.province, x.sort);

            x.days.slice(0, days).forEach(function (v, d) {
                r.work[d] += self.number(v);
            });
        });

        input.dailySales.forEach(function (x) {
            var r = row(x.province, x.sort);

            x.days.slice(0, days).forEach(function (v, d) {
                r.sales[d] += self.number(v);
            });

            add(r, "focusTarget", x.focusTarget);
            add(r, "focusActual", x.focusActual);
        });

        input.monthly.forEach(function (x) {
            var r = row(x.province);

            add(r, "planned", x.planned);
            add(r, "actual", x.actual);
            add(r, "target", x.target);
            add(r, "totalSales", x.sales);
        });

        var rows = Array.from(map.values()).sort(function (a, b) {
            return a.sort - b.sort ||
                a.province.localeCompare(b.province, "vi");
        });

        var grand = make("TỔNG CỘNG");

        rows.forEach(function (r) {
            // Tổng NVTT tỉnh = MAX công của các ngày.
            r.staff = Math.max.apply(null, r.work);

            r.work.forEach(function (v, d) {
                grand.work[d] += v;
            });

            r.sales.forEach(function (v, d) {
                grand.sales[d] += v;
            });

            [
                "staff",
                "planned",
                "actual",
                "target",
                "totalSales",
                "focusTarget",
                "focusActual"
            ].forEach(function (k) {
                add(grand, k, r[k]);
            });
        });

        return {
            year: input.year,
            month: input.month,
            days: days,
            rows: rows,
            grand: grand,
            warnings: input.warnings || []
        };
    },

    draw: function (doc, m) {
        var self = this;
        var head = doc.getElementById("tblHead");
        var body = doc.getElementById("tblData");
        var table = doc.getElementById("tblReport");

        doc.getElementById("labPeriod").textContent =
            String(m.month).padStart(2, "0") + "/" + m.year;

        doc.getElementById("labMarket").textContent =
            m.market || "Tất cả";

        doc.getElementById("divWarn").textContent =
            m.warnings.join("\n");

        doc.getElementById("divWarn").hidden =
            !m.warnings.length;

        head.textContent = "";
        body.textContent = "";

        var old = table.querySelector("colgroup");
        if (old) old.remove();

        var cg = doc.createElement("colgroup");

        for (var i = 0; i < 2 * m.days + 12; i++) {
            var col = doc.createElement("col");

            col.style.width = (
                i === 0 ? 32 :
                i === 1 ? 130 :
                i < 2 + 2 * m.days ? 48 :
                94
            ) + "px";

            cg.appendChild(col);
        }

        table.insertBefore(cg, head);

        function cell(tr, text, tag, span, rs, cls) {
            var c = doc.createElement(tag || "td");

            c.textContent = text == null ? "" : text;

            if (span) c.colSpan = span;
            if (rs) c.rowSpan = rs;
            if (cls) c.className = cls;

            tr.appendChild(c);

            return c;
        }

        var a = doc.createElement("tr");
        var b = doc.createElement("tr");
        var c = doc.createElement("tr");

        cell(a, "STT", "th", 1, 3);
        cell(a, "Tỉnh/Thành (cũ)", "th", 1, 3);
        cell(a, "Ngày", "th", 2 * m.days);

        [
            "Tổng số NVTT",
            "Ngày công dự kiến",
            "Ngày công thực đạt",
            "% Thực đạt ngày công",
            "Mức khoán Tổng",
            "Tổng sản lượng thực đạt",
            "% Thực đạt Tổng",
            "Mức khoán trọng điểm",
            "Tổng thực đạt trọng điểm",
            "% Thực đạt trọng điểm"
        ].forEach(function (t, i) {
            cell(
                a,
                t,
                "th",
                1,
                3,
                [3, 6, 9].includes(i) ? "percent" : ""
            );
        });

        for (var d = 1; d <= m.days; d++) {
            cell(
                b,
                String(d).padStart(2, "0"),
                "th",
                2
            );

            cell(c, "NVTT", "th");
            cell(c, "SL", "th", 1, 1, "sale");
        }

        head.append(a, b, c);

        function fmt(v) {
            return v == null
                ? ""
                : self.round(v, 1).toLocaleString(
                    "vi-VN",
                    { maximumFractionDigits: 1 }
                );
        }

        function pct(a, b) {
            if (a == null || b == null) return "";

            return (
                b
                    ? Math.round(self.round(a / b, 2) * 100)
                    : 0
            ) + "%";
        }

        function drawRow(r, index) {
            var tr = doc.createElement("tr");

            if (index == null) {
                tr.className = "total";
                cell(tr, "TỔNG CỘNG", "td", 2);
            } else {
                cell(tr, index + 1);
                cell(tr, r.province, "td", 1, 1, "province");
            }

            for (var d = 0; d < m.days; d++) {
                cell(tr, fmt(r.work[d]));
                cell(tr, fmt(r.sales[d]), "td", 1, 1, "sale");
            }

            [
                r.staff,
                r.planned,
                r.actual,
                pct(r.actual, r.planned),
                r.target,
                r.totalSales,
                pct(r.totalSales, r.target),
                r.focusTarget,
                r.focusActual,
                pct(r.focusActual, r.focusTarget)
            ].forEach(function (v, i) {
                cell(
                    tr,
                    typeof v === "string" ? v : fmt(v),
                    "td",
                    1,
                    1,
                    [3, 6, 9].includes(i) ? "percent" : "metric"
                );
            });

            body.appendChild(tr);
        }

        m.rows.forEach(drawRow);
        drawRow(m.grand, null);
    }
};