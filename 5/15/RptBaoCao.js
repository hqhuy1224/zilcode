var RptBaoCao = {
    url: NUT.services[13].url,
    run: function () {
        // var domainObj = NUT.domains[1120] || {};
        // var items = domainObj.items || [];
        // var cboDM = document.createElement("select");
        // cboDM.id = "cboDM";
        // cboDM.className = 'w2ui-input';
        // cboDM.style.width = "230px";

        // var optAll = document.createElement("option");
        // optAll.value = "";
        // optAll.innerHTML = "Tất cả";
        // cboDM.add(optAll);

        // items
        //     .filter(i => i.text)
        //     .sort((a, b) => a.id - b.id)
        //     .forEach(i => {
        //         let opt = document.createElement("option");
        //         opt.value = i.text;
        //         opt.innerHTML = i.text;
        //         cboDM.add(opt);
        //     });
        var now = new Date().toISOString().substring(0, 10);
        NUT.w2popup.open({
            title: '📃 <i>Báo cáo Thu – Chi</i>',
            modal: true,
            width: 300,
            height: 230,
            body: `
                <table style="margin:auto">
                    <tr>
                        <td>Từ ngày *</td>
                        <td><input id="datTuNgay" type="date" value="${now}"/></td>
                    </tr>
                    <tr>
                        <td>Đến ngày *</td>
                        <td><input id="datDenNgay" type="date" value="${now}"/></td>             
                </table>
            `,
            //    </tr>
            //             <tr>
            //             <td>Loại</td>
            //             <td>${cboDM.outerHTML}</td>
            //         </tr>
            actions: {
                "Đóng": NUT.w2popup.close,
                "Mở báo cáo": function () {
                    let tuNgay = datTuNgay.value;
                    let denNgay = datDenNgay.value;
                    // let type = document.getElementById("cboDM").value;

                    if (!tuNgay || !denNgay) {
                        return NUT.notify("⚠️ Chọn từ ngày và đến ngày!", "yellow");
                    }
                    if (tuNgay > denNgay) {
                        return NUT.notify("⚠️ Từ ngày không được lớn hơn đến ngày!", "yellow");
                    }
                    let where = [
                        ["txn_date", ">=", tuNgay],
                        ["txn_date", "<=", denNgay]
                    ];
                    // if (type) {
                    //     where.push(["type", "=", type]);
                    // }

                    NUT.ds.select({
                        url: RptBaoCao.url + "data/v_transactions",
                        where: where,
                        orderby: "txn_date"
                    }, function (res) {

                        if (!res.success || !res.result.length) {
                            return NUT.notify("⚠️ Không có dữ liệu!", "yellow");
                        }

                        let map = {};
                        res.result.forEach(t => {
                            let d = new Date(t.txn_date);
                            let m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                            if (!map[m]) map[m] = { income: 0, expense: 0 };

                            if (t.type === 'income') map[m].income += t.amount;
                            if (t.type === 'expense') map[m].expense += t.amount;
                        });

                        let win = window.open(
                            "site/" + n$.user.siteid + "/" + n$.app.appid + "/RptThuChi.html"
                        );
                        win.onload = function () {
                            let tbody = win.document.getElementById("tbodyData");
                            Object.keys(map).sort().forEach(m => {
                                let tr = win.document.createElement("tr");
                                tr.innerHTML = `
                                    <td>${m}</td>
                                    <td style="text-align:right">${map[m].income.toLocaleString('vi-VN')}</td>
                                    <td style="text-align:right">${map[m].expense.toLocaleString('vi-VN')}</td>
                                    <td style="text-align:right;
                                        color:${map[m].income - map[m].expense >= 0 ? 'green' : 'red'}">
                                        ${(map[m].income - map[m].expense).toLocaleString('vi-VN')}
                                    </td>
                                `;
                                tbody.appendChild(tr);
                            });
                        };
                    });
                }
            }
        });
    }
};
