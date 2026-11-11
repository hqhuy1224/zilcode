var RptThongKe = {
    chartJS: null,
    url: NUT.services[13].url,
    run: function (p) {
        var a = NUT.createWindowTitle("RptThongKe", divTitle);
        if (!a) return;

        a.innerHTML = "📊 Thống kê Thu – Chi";
        a.div.innerHTML = `
            <div id="divRptTabs"></div>
            <div id="divTongHop" class="nut-full"></div>
            <div id="divChiTiet" class="nut-full" style="display:none"></div>
        `;

        (NUT.w2ui['tabRpt'] || new NUT.w2tabs({
            name: 'tabRpt',
            active: 'tonghop',
            tabs: [
                { id: 'tonghop', text: 'Tổng hợp' },
                { id: 'chitiet', text: 'Chi tiết theo tháng' }
            ],
            onClick(evt) {
                divTongHop.style.display = evt.target === 'tonghop' ? '' : 'none';
                divChiTiet.style.display = evt.target === 'chitiet' ? '' : 'none';
            }
        })).render(divRptTabs);

        this.initTongHop();
        this.initChiTiet();
        this.pullData();
    },

    pullData: function () {
        NUT.ds.select({
            url: this.url + "data/v_transactions"
        }, (res) => {
            if (!res.success || !res.result.length) {
                return NUT.notify("⚠️ Không có dữ liệu thu chi!", "yellow");
            }
            this.showDashboard(res.result);
        });
    },

    initTongHop: function () {
        divTongHop.innerHTML = `
            <table width="100%" height="95%" border="1">
                <tr>
                    <td align="center" id="tongthu"></td>
                    <td align="center" id="tongchi"></td>
                    <td align="center" id="chenhlech"></td>
                </tr>
                <tr>
                    <td colspan="3" align="center">
                        <canvas id="chartThuChiJS" height="140"></canvas>
                    </td>
                </tr>
            </table>
        `;
    },

    initChiTiet: function () {
        divChiTiet.innerHTML = `<div id="gridChiTiet" style="width:100%;height:100%"></div>`;
        new NUT.w2grid({
            name: 'gridChiTiet',
            columns: [
                { field: 'month', text: 'Tháng', size: '25%' },
                { field: 'income', text: 'Thu', size: '25%', render: 'money' },
                { field: 'expense', text: 'Chi', size: '25%', render: 'money' },
                { field: 'diff', text: 'Chênh lệch', size: '25%', render: 'money' }
            ]
        }).render('gridChiTiet');
    },

    showDashboard: function (data) {
        let monthMap = {};
        let totalIncome = 0;
        let totalExpense = 0;

        data.forEach(t => {
            let d = new Date(t.txn_date);
            let month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

            if (!monthMap[month]) {
                monthMap[month] = { income: 0, expense: 0 };
            }

            if (t.type === 'income') {
                monthMap[month].income += t.amount;
                totalIncome += t.amount;
            } else if (t.type === 'expense') {
                monthMap[month].expense += t.amount;
                totalExpense += t.amount;
            }
        });

        let records = [];
        let labels = [];
        let thu = [];
        let chi = [];

        Object.keys(monthMap).sort().forEach(m => {
            let i = monthMap[m].income;
            let e = monthMap[m].expense;

            records.push({
                month: m,
                income: i,
                expense: e,
                diff: i - e
            });

            labels.push(m);
            thu.push(i);
            chi.push(e);
        });
        tongthu.innerHTML =
            `<h3>Tổng thu</h3><h2>${totalIncome.toLocaleString('vi-VN')}</h2>`;

        tongchi.innerHTML =
            `<h3>Tổng chi</h3><h2>${totalExpense.toLocaleString('vi-VN')}</h2>`;

        let diff = totalIncome - totalExpense;
        chenhlech.innerHTML =
            `<h3>Chênh lệch</h3>
             <h2 style="color:${diff >= 0 ? 'green' : 'red'}">
                ${diff.toLocaleString('vi-VN')}
             </h2>`;
        NUT.w2ui.gridChiTiet.records = records;
        NUT.w2ui.gridChiTiet.refresh();

        this.renderChart(labels, thu, chi);
    },

    renderChart: function (labels, thu, chi) {
        let ctx = document.getElementById('chartThuChiJS');
        if (!ctx) return;

        if (this.chartJS) this.chartJS.destroy();

        this.chartJS = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Thu', data: thu, barPercentage: 0.4,
                        categoryPercentage: 0.5
                    },
                    {
                        label: 'Chi', data: chi, barPercentage: 0.4,
                        categoryPercentage: 0.5
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: ctx =>
                                ctx.dataset.label + ': ' +
                                ctx.raw.toLocaleString('vi-VN') + ' ₫'
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: v => v.toLocaleString('vi-VN')
                        }
                    }
                }
            }
        });
    }
};
