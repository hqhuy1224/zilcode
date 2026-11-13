// HrmsCheckInOut - chấm công Check IN/OUT (giờ vào/ra, không theo ca). Check IN nhập Tồn đầu; Chỉnh sửa nhập thêm NPP; Check OUT nhập Tồn cuối.
// Sản lượng ghi ở chamcong_ct (mỗi sản phẩm × đầu/nhập/cuối một dòng); danh mục sản phẩm đọc từ bảng sanpham theo đối tác.
var HrmsCheckInOut = (function () {
    'use strict';

    var api = {};
    api.config = {
        serviceId: 3, uploadId: 1455,
        userCodeProp: 'tag', codeTable: 'ba_ungvien', codeField: 'manhanvien', regionField: 'makhuvuc',
        officialStatus: 'OFFICIAL', requireOfficial: true,
        regionLinkId: 1456, regionTable: 'khuvuc', pointTable: 'diemban',
        requireCheckoutPhotos: true, maxImageMB: 10,
        camera: 'environment', maxImageSide: 1600, jpegQuality: 0.85,
        detailTable: 'chamcong_ct', detailKey: 'idchamcongct', detailFk: 'idchamcong',
        targetTable: 'chitieu', targetDetailTable: 'chitieu_ct', productTable: 'sanpham'
    };

    // chamcong_ct.daucuoi: 0 = Tồn đầu, 1 = Tồn cuối, 2 = Nhập
    var KIND = { a: 0, c: 1, n: 2 }, KIND_FIELD = ['a', 'c', 'n'];
    var state = {
        url: '', login: '', user: '', nv: null, date: null, regions: [], rows: [], lookup: {}, sales: {}, salesErr: '', target: null, products: {},
        form: null, busy: false, seq: 0, pointSeq: 0,
        files: {}, urls: [], uploaded: {}, processing: 0, pointNames: {}, warnHidden: ''
    };

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function js(v) { return esc(JSON.stringify(String(v))); }
    function el(id) { return document.getElementById('hcio-' + id); }
    function value(id) { var e = el(id); return e ? e.value : ''; }
    function notify(text, bad) { NUT.notify(text, bad ? 'red' : 'lime'); }
    function fail(text) { throw new Error(text); }
    function today() { var d = new Date(); return { nam: d.getFullYear(), thang: d.getMonth() + 1, ngay: d.getDate() }; }
    function dayKey(d) { return [d.nam, d.thang, d.ngay].join('-'); }
    function dateText(d) { return [d.ngay, d.thang, d.nam].join('/'); }
    function clock(v) {
        if (!v) return 'Chưa ghi nhận';
        var s = String(v), d = v instanceof Date ? v : new Date(/[zZ]$|[+-]\d\d:\d\d$/.test(s) ? s : s + 'Z');
        return isNaN(d.getTime()) ? s : d.toLocaleTimeString('vi-VN');
    }
    // ảnh lưu dạng mảng JSON, chuỗi một đường dẫn hoặc mảng đối tượng {url|path|...}; không giới hạn tiền tố đường dẫn
    function images(raw) {
        if (raw == null) return [];
        var a = raw;
        if (typeof raw === 'string') { var s = raw.trim(); if (!s) return []; try { a = JSON.parse(s); } catch (e) { a = s; } }
        if (!Array.isArray(a)) a = [a];
        return a.map(function (x) {
            return typeof x === 'string' ? x : x && typeof x === 'object' ? (x.url || x.path || x.filepath || x.fileurl || x.link || x.filename || x.name || '') : '';
        }).map(function (x) { return String(x).trim(); }).filter(function (x) { return x && x !== 'null' && x !== 'undefined'; });
    }
    function sizes() {
        return { width: Math.max(280, Math.min(520, window.innerWidth - 24)), height: Math.max(300, Math.min(700, window.innerHeight - 36)) };
    }

    function call(method, options) {
        return new Promise(function (resolve, reject) {
            try {
                NUT.ds[method](options, function (r) {
                    if (r && r.success) resolve(r.result || []);
                    else reject(new Error(r && typeof r.result === 'string' ? r.result : 'Không thể xử lý yêu cầu dữ liệu.'));
                });
            } catch (e) { reject(e); }
        });
    }
    function select(table, options) { return call('select', Object.assign({ url: state.url + 'data/' + table }, options)); }
    function whereDay(d) { return [['nam', '=', d.nam], ['thang', '=', d.thang], ['ngay', '=', d.ngay], ['dulieu', '=', 0], ['manhanvien', '=', state.user]]; }
    function owned(id) { return [['idchamcong', '=', id], ['manhanvien', '=', state.user], ['dulieu', '=', 0]]; }
    function update(id, data) { return call('update', { url: state.url + 'data/chamcong', where: owned(id), data: data }); }
    async function fresh(id) {
        var rows = await select('chamcong', { where: owned(id) });
        if (rows.length !== 1) fail('Bản ghi không còn khả dụng. Hãy làm mới.');
        return rows[0];
    }
    async function insertRound(d, lan, data) {
        var partner = await partnerFor(d);
        var res = await call('insert', { url: state.url + 'data/chamcong', returnid: true, data: Object.assign({
            manhanvien: state.user, madoitac: partner, nam: d.nam, thang: d.thang, ngay: d.ngay, lan: lan, dulieu: 0 }, data) });
        var id = Array.isArray(res) ? res[0] : res;
        if (id && typeof id === 'object') id = id.idchamcong != null ? id.idchamcong : id.id;
        if (id == null || id === '' || typeof id === 'object') fail('Đã gửi ghi nhận nhưng API không trả ID hợp lệ. Đóng và làm mới; không gửi lại.');
        return id;
    }
    function upload(id, files, key) {
        if (state.uploaded[key]) return Promise.resolve(state.uploaded[key]);
        return new Promise(function (resolve, reject) {
            try {
                NUT.uploadFile(api.config.uploadId, id, files, function (r) {
                    if (!r || r.success === false) {
                        var msg = r && typeof r.result === 'string' ? r.result : (r && r.message) || '';
                        return reject(new Error('Tải ảnh chưa thành công' + (msg ? ': ' + msg : '') + '. Có thể thử lại trên bản ghi này.'));
                    }
                    var raw = r.result !== undefined ? r.result : r, list = Array.isArray(raw) ? raw : [raw];
                    var urls = list.map(function (x) {
                        return typeof x === 'string' ? x : x && (x.url || x.path || x.filepath || x.fileurl || x.link || x.filename || x.name) || null;
                    }).filter(Boolean);
                    if (!urls.length) { console.warn('[HrmsCheckInOut] uploadFile không trả đường dẫn:', r); return reject(new Error('Ảnh đã gửi nhưng server không trả đường dẫn.')); }
                    state.uploaded[key] = urls; resolve(urls);
                });
            } catch (e) { reject(e); }
        });
    }
    async function savePhoto(id, column, file, key, existing) {
        var data = {}; data[column] = JSON.stringify((existing || []).concat(await upload(id, [file], key)));
        await update(id, data); delete state.uploaded[key];
    }
    async function loadRegions() {
        state.regions = [];
        if (!api.config.regionTable) return;
        try {
            var rows = await select(api.config.regionTable, { select: 'makhuvuc,tenkhuvuc,stt', orderby: 'stt,tenkhuvuc' });
            state.regions = rows.map(function (x) { return { id: x.makhuvuc, text: x.tenkhuvuc || x.makhuvuc }; });
        } catch (e) { console.warn('[HrmsCheckInOut] không đọc được bảng khu vực:', e.message); }
    }
    function regionName(id) {
        var r = state.regions.filter(function (x) { return String(x.id) === String(id); })[0]; if (r) return r.text;
        var dm = NUT.dmlinks && NUT.dmlinks[api.config.regionLinkId];
        return (dm && dm.lookup && dm.lookup[id]) || id || 'Chưa có khu vực';
    }
    async function reload() {
        state.date = today(); state.dayWarned = false;
        var rowsToday = await select('chamcong', { orderby: 'lan', where: whereDay(state.date) });
        var carry = (await select('chamcong', { orderby: 'lan', where: whereDay(dayBefore(state.date)) })).filter(carryOver);
        carry.forEach(function (r) { r.carry = true; });
        state.rows = carry.concat(rowsToday);
        state.lookup = {}; state.rows.forEach(function (r) { state.lookup[String(r.idchamcong)] = r; });
        partnerCache = {};
        await loadTarget(state.date);
        await loadSales(state.rows);
    }
    async function loadTarget(d) {
        state.target = { partner: '', missing: false, err: '' };
        try { state.target.partner = await partnerFor(d); state.target.ok = true; }
        catch (e) { if (e.noTarget) state.target.missing = true; else state.target.err = 'Không đọc được chỉ tiêu tháng: ' + e.message; }
    }
    function targetBlock() {
        var t = state.target; if (!t || t.ok || !nextRound(state.rows)) return '';
        return t.missing ? targetMsg(state.date) : t.err;
    }
    function targetMsg(d) { return 'Chưa có chỉ tiêu tháng ' + d.thang + '/' + d.nam + '. Cần khai chỉ tiêu sản lượng tháng trước khi Check IN.'; }

    // ---------- Sản lượng (chamcong_ct) ----------
    function detailUrl() { return state.url + 'data/' + api.config.detailTable; }
    // gom dòng chi tiết theo idchamcong: { rows, items: { masanpham: { a, n, c } } }
    function indexSales(list) {
        var map = {}, fk = api.config.detailFk;
        list.forEach(function (x) {
            if (x[fk] == null || !x.masanpham) return;
            var k = String(x[fk]), s = map[k] || (map[k] = { rows: [], items: {} });
            var it = s.items[x.masanpham] || (s.items[x.masanpham] = { a: null, n: null, c: null });
            var f = KIND_FIELD[Number(x.daucuoi)];
            s.rows.push(x);
            if (f && it[f] == null) it[f] = Math.max(0, Number(x.soluong) || 0);
        });
        return map;
    }
    // đối tác đi theo sản phẩm: danh mục là toàn bộ bảng sanpham, mỗi dòng có madoitac riêng
    async function loadProducts() {
        if (state.catalog) return;
        var rows = await select(api.config.productTable, { select: 'masanpham,tensanpham,trongdiem,madoitac' });
        state.catalog = rows.sort(function (a, b) {
            return (b.trongdiem ? 1 : 0) - (a.trongdiem ? 1 : 0) || String(a.madoitac || '').localeCompare(String(b.madoitac || '')) || String(a.masanpham).localeCompare(String(b.masanpham));
        }).map(function (x) { return { ma: x.masanpham, ten: x.tensanpham || x.masanpham, td: !!x.trongdiem, dt: x.madoitac || '' }; });
    }
    // danh mục sản phẩm + mã đã lưu nhưng không còn trong danh mục
    function productsFor(r, s) {
        var list = (state.catalog || []).slice();
        if (s) Object.keys(s.items).forEach(function (ma) {
            if (!list.some(function (p) { return p.ma === ma; })) list.push({ ma: ma, ten: ma });
        });
        return list;
    }
    async function loadSales(rows) {
        state.sales = {}; state.salesErr = '';
        var c = api.config, fk = c.detailFk;
        var ids = rows.filter(function (r) { return r.thoigianden; }).map(function (r) { return Number(r.idchamcong); }).filter(isFinite);
        try {
            await loadProducts();
            if (!ids.length) return;
            var list = await select(c.detailTable, { where: [[fk, '>=', Math.min.apply(null, ids)], [fk, '<=', Math.max.apply(null, ids)]] });
            state.sales = indexSales(list.filter(function (x) { return ids.indexOf(Number(x[fk])) >= 0; }));
        } catch (e) { state.salesErr = 'Không đọc được sản lượng (bảng ' + c.detailTable + '): ' + e.message; }
    }
    function sales(r) { return (r && state.sales[String(r.idchamcong)]) || null; }
    function salesReady() { if (state.salesErr) fail(state.salesErr + ' Bấm Làm mới rồi thử lại.'); }
    async function freshSales(id) {
        var rows = await select(api.config.detailTable, { where: [[api.config.detailFk, '=', id]] });
        return indexSales(rows)[String(id)] || null;
    }
    // đồng bộ chi tiết: sửa dòng đổi số, thêm dòng mới, xóa dòng bỏ trống/trùng
    async function saveSales(id, items) {
        var c = api.config, url = detailUrl(), cur = (await freshSales(id)) || { rows: [] }, want = {}, seen = {}, jobs = [], ins = [];
        items.forEach(function (it) {
            ['a', 'n', 'c'].forEach(function (f) { if (it[f] != null) want[it.ma + '\u0001' + KIND[f]] = it[f]; });
        });
        cur.rows.forEach(function (x) {
            var k = x.masanpham + '\u0001' + Number(x.daucuoi), where = [[c.detailKey, '=', x[c.detailKey]]];
            if (seen[k] || !(k in want)) return jobs.push(call('delete', { url: url, where: where }));
            seen[k] = true;
            if (Number(x.soluong) !== want[k]) jobs.push(call('update', { url: url, where: where, data: { soluong: want[k] } }));
        });
        Object.keys(want).forEach(function (k) {
            if (seen[k]) return;
            var p = k.split('\u0001'), row = { masanpham: p[0], daucuoi: Number(p[1]), soluong: want[k] };
            row[c.detailFk] = Number(id); ins.push(row);
        });
        if (ins.length) jobs.push(call('insert', { url: url, data: ins }));
        await Promise.all(jobs);
    }
    // đối tác lấy theo phiếu chỉ tiêu tháng (chitieu có chi tiết chitieu_ct)
    var partnerCache = {};
    async function partnerFor(d) {
        var c = api.config, key = d.nam + '-' + d.thang;
        if (partnerCache[key]) return partnerCache[key].v;
        var rows = await select(c.targetTable, { select: 'idchitieu', orderby: 'idchitieu',
            where: [['manhanvien', '=', state.user], ['nam', '=', d.nam], ['thang', '=', d.thang]] });
        var ids = rows.map(function (x) { return Number(x.idchitieu); }).filter(isFinite), lines = [];
        if (ids.length) lines = (await select(c.targetDetailTable, { select: 'idchitieu,masanpham', where: [['idchitieu', '>=', Math.min.apply(null, ids)], ['idchitieu', '<=', Math.max.apply(null, ids)]] }))
            .filter(function (x) { return ids.indexOf(Number(x.idchitieu)) >= 0 && x.masanpham; });
        if (!lines.length) { var err = new Error(targetMsg(d)); err.noTarget = true; throw err; }
        await loadProducts();
        var hit = lines.map(function (x) { return (state.catalog.filter(function (p) { return p.ma === x.masanpham; })[0] || {}).dt; }).filter(Boolean)[0] || '';
        partnerCache[key] = { v: hit }; return hit;
    }
    function record(id) { var r = state.lookup[String(id)]; if (!r) fail('Không tìm thấy bản ghi. Hãy làm mới.'); return r; }

    // ---------- Trạng thái một lần chấm công ----------
    function isLeave(r) { return !!r.chamcong && !r.thoigianden; }
    function openRound(rows) { return rows.filter(function (r) { return r.thoigianden && !r.thoigianve; })[0]; }
    function hasStock(r) { var s = sales(r); return !!r.thoigiansanluong || (!!s && s.rows.length > 0); }
    function photoState(r) { var i = images(r.hinhanh).length, o = images(r.hinhanh2).length; return { inN: i, outN: o, inOk: i > 0, outOk: !!r.thoigianve && o > 0 }; }
    // ca qua đêm: chỉ lần Check IN của hôm qua chưa Check OUT mới còn hiện để Check OUT; các ca khác của ngày cũ biến mất sau 00:00
    function dayBefore(d) { var x = new Date(d.nam, d.thang - 1, d.ngay - 1); return { nam: x.getFullYear(), thang: x.getMonth() + 1, ngay: x.getDate() }; }
    function carryOver(r) { return !!r.thoigianden && !isLeave(r) && !r.thoigianve; }
    function editable(r) {
        var t = today(), k = [r.nam, r.thang, r.ngay].join('-');
        return k === dayKey(t) || (k === dayKey(dayBefore(t)) && carryOver(r));
    }
    // một ngày Check IN/OUT được nhiều lần: lần mới chỉ mở khi các lần trước đã Check OUT
    function nextRound(rows) {
        rows = rows.filter(function (r) { return !isLeave(r); });
        if (!rows.length) return 1;
        if (rows.some(function (r) { return !r.thoigianden || !r.thoigianve; })) return null;
        var own = rows.filter(function (r) { return !r.carry; });
        return own.length ? Math.max.apply(null, own.map(function (r) { return Number(r.lan) || 0; })) + 1 : 1;
    }
    // qua 00:00 là sang ngày mới: lần chấm công của ngày cũ không còn hiển thị, không chỉnh sửa được
    function dayChanged() { return !!state.date && dayKey(today()) !== dayKey(state.date); }
    function staleDay() {
        if (!dayChanged()) return false;
        if (!state.form && !state.busy) { NUT.notify('Đã qua 00:00, danh sách chấm công đã chuyển sang ngày mới.', 'yellow'); api.refresh(); }
        return true;
    }
    function ensureToday(cur) {
        if (!editable(cur)) {
            fail('Lần chấm công này thuộc ngày ' + cur.ngay + '/' + cur.thang + '/' + cur.nam + ', đã qua 00:00 nên không thể chỉnh sửa. Đóng form để xem ngày mới.');
        }
    }
    api.checkDay = function () {
        if (!dayChanged() || state.busy || state.refreshing) return;
        if (state.form) {
            var fr = state.form.id && state.lookup[String(state.form.id)];
            if (fr && editable(fr)) return;
            if (!state.dayWarned) { state.dayWarned = true; showError('Đã qua 00:00: các lần chấm công của ngày cũ không còn chỉnh sửa được. Đóng form để xem ngày mới.'); }
            return;
        }
        api.refresh();
    };
    function watchDay() {
        if (state.watch) return;
        state.watch = setInterval(function () {
            if (!document.getElementById('hcio-main')) { clearInterval(state.watch); state.watch = null; return; }
            api.checkDay();
        }, 20000);
    }
    function roundStatus(r) { return r.thoigianve ? { key: 'ok', text: 'Hoàn thành' } : r.carry ? { key: 'open', text: 'Chưa Check OUT ' + r.ngay + '/' + r.thang } : { key: 'open', text: 'Chưa Check OUT' }; }
    function forgotText(r) { return 'Bạn chưa Check OUT ca lần ' + r.lan + ' ngày ' + r.ngay + '/' + r.thang + '/' + r.nam + '.'; }

    // ---------- Giao diện ----------
    var CSS = '<style>' + [
        '.hcio,.hcio-cam{--pri:#157a5c;--pri-d:#0f5f47;--pri-l:#e7f4ef;--ink:#1d2b3a;--mut:#64748b;--line:#dde4ec;--bg:#f5f7fa}',
        '.hcio{font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg);padding:14px;height:100%;overflow:auto;box-sizing:border-box}.hcio *{box-sizing:border-box}',
        '.hcio-btn{border:1px solid transparent;border-radius:9px;background:var(--pri);color:#fff;padding:8px 16px;min-height:38px;font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 1px 2px rgba(16,42,67,.08);transition:background-color .18s,box-shadow .18s,transform .12s,border-color .18s}',
        '.hcio-btn:hover:not(:disabled){background:var(--pri-d);box-shadow:0 6px 16px rgba(21,122,92,.25);transform:translateY(-1px)}.hcio-btn:active:not(:disabled){transform:scale(.98)}.hcio-btn:disabled{opacity:.55;cursor:not-allowed}.hcio-btn:focus-visible{outline:3px solid #78bfa9;outline-offset:2px}',
        '.hcio-btn.hcio-secondary{background:#fff;color:#24415f;border-color:var(--line)}.hcio-btn.hcio-secondary:hover:not(:disabled){background:#f1f5f9;border-color:#c3cfdb;box-shadow:0 4px 10px rgba(16,42,67,.08)}',
        '.hcio-btn.hcio-warn{background:#fff7ed;color:#b45309;border-color:#fcd9b0}.hcio-btn.hcio-warn:hover:not(:disabled){background:#ffedd5;box-shadow:0 4px 10px rgba(180,83,9,.12)}',
        '.hcio-btn.hcio-edit{background:#f3faf7;color:var(--pri-d);border-color:#b7dccd}.hcio-btn.hcio-edit:hover:not(:disabled){background:var(--pri-l);border-color:var(--pri)}',
        '.hcio-btn.hcio-sm{min-height:30px;padding:4px 11px;font-size:12.5px;border-radius:8px}',
        '.hcio-out .hcio-foot .hcio-btn{background:#ea580c}.hcio-out .hcio-foot .hcio-btn:hover:not(:disabled){background:#c2410c;box-shadow:0 6px 16px rgba(234,88,12,.3)}',
        '.hcio-row{display:flex;justify-content:space-between;align-items:center;gap:10px}',
        '.hcio-who{display:flex;align-items:center;gap:10px;min-width:0}.hcio-who b{display:block;font-size:14px;line-height:1.25}.hcio-who small{display:block;font-size:12px;color:var(--mut)}',
        '.hcio-ava{flex:none;width:34px;height:34px;border-radius:50%;background:var(--pri-l);color:var(--pri-d);display:flex;align-items:center;justify-content:center;font-weight:700}',
        '.hcio-launch{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0 12px}',
        '.hcio-refresh{display:inline-flex;align-items:center;gap:6px}.hcio-refresh .ico{display:inline-block;font-size:15px;line-height:1;transition:transform .35s ease}',
        '.hcio-refresh:hover:not(.is-loading) .ico{transform:rotate(120deg)}.hcio-refresh.is-loading{pointer-events:none;color:var(--pri-d);border-color:#b7dccd;background:var(--pri-l)}',
        '.hcio-refresh.is-loading .ico{animation:hcio-rot .75s linear infinite}@keyframes hcio-rot{to{transform:rotate(360deg)}}',
        '#hcio-main.is-fresh{animation:hcio-fade .28s ease}@keyframes hcio-fade{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:none}}',
        '@media(prefers-reduced-motion:reduce){.hcio *,#hcio-main{animation:none!important;transition:none!important}}',
        '.hcio-act{border:0;border-radius:16px;min-height:124px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;color:#fff;font:inherit;box-shadow:0 6px 18px rgba(16,42,67,.12);transition:transform .2s,box-shadow .2s}',
        '.hcio-act-in{background:linear-gradient(135deg,#1c9471,#11604a)}.hcio-act-out{background:linear-gradient(135deg,#f59e0b,#ea580c)}',
        '.hcio-act b{font-size:20px}.hcio-act small{font-size:12.5px;color:rgba(255,255,255,.9);text-align:center}.hcio-act-ico{font-size:30px;line-height:1}',
        '.hcio-act:not([aria-disabled=true]):hover{transform:translateY(-3px);box-shadow:0 12px 26px rgba(16,42,67,.2)}.hcio-act:not([aria-disabled=true]):active{transform:scale(.98)}.hcio-act:focus-visible{outline:3px solid #78bfa9;outline-offset:2px}',
        '.hcio-act[aria-disabled=true]{background:#e8edf3;color:#7a8aa0;box-shadow:none;cursor:not-allowed}.hcio-act[aria-disabled=true] small{color:#7a8aa0}',
        '.hcio-leave{background:#eff6ff;border:1px solid #bfdbfe;color:#1e3a8a;border-radius:12px;padding:8px 10px;font-size:12.5px;margin:0 0 10px}.hcio-leave span{display:block;font-size:12px;color:#334e7e;margin-top:2px}',
        '.hcio-hist{background:#fff;border:1px solid var(--line);border-radius:14px;padding:8px 12px}',
        '.hcio-hist-h{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:var(--mut);padding:2px 0}.hcio-hist-sum{color:var(--pri-d);background:var(--pri-l);border-radius:20px;padding:1px 9px;font-size:11px;font-weight:600}',
        '.hcio-rlist{display:flex;flex-direction:column;gap:8px;padding:6px 0 4px}',
        '.hcio-rcard{border:1.5px solid var(--line);border-radius:12px;padding:8px 10px;background:#fff;display:flex;flex-direction:column;gap:6px;transition:box-shadow .18s}.hcio-rcard:hover{box-shadow:0 4px 14px rgba(16,42,67,.08)}',
        '.hcio-rcard.is-open{border-color:#f59e0b;background:#fffdf8}.hcio-rcard.is-ok{border-color:#22c55e}',
        '.hcio-rtop{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.hcio-rtitle{min-width:0}.hcio-rtitle>div{display:flex;align-items:center;gap:8px}.hcio-rtitle b{font-size:14px}',
        '.hcio-rtitle small{display:block;font-size:12px;color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.hcio-pill{display:inline-flex;align-items:center;border-radius:20px;padding:1px 9px;font-size:11.5px;font-weight:700}.hcio-pill.is-open{background:#ffedd5;color:#c2410c}.hcio-pill.is-ok{background:#dcfce7;color:#15803d}',
        '.hcio-rbtm{display:flex;align-items:center;gap:6px 14px;flex-wrap:wrap}.hcio-time{font-size:12px;color:var(--mut)}.hcio-time b{display:inline-block;min-width:62px;margin-left:3px;color:var(--ink);font-size:13px;font-variant-numeric:tabular-nums;border-bottom:1px dashed #cbd5e1}.hcio-time b:not(:empty){border-bottom-color:transparent}',
        '.hcio-hbtns{display:flex;gap:6px;flex-wrap:wrap;margin-left:auto}',
        '.hcio.hcio-fit{position:relative;display:flex;flex-direction:column;gap:8px;padding:12px 14px;overflow:hidden}',
        '.hcio-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.hcio-title{display:flex;flex-direction:column;min-width:0}.hcio-title h2{font-size:16px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hcio-sub{font-size:12px;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.hcio-close{flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--line);background:#fff;color:#334155;font:600 13px system-ui;cursor:pointer;transition:background-color .18s,transform .18s}.hcio-close:hover{background:#f1f5f9;transform:rotate(90deg)}',
        '.hcio-body{flex:1 1 auto;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:auto}.hcio-body p{margin:0}',
        '.hcio-foot{flex:none;display:flex}.hcio-foot .hcio-btn{flex:1;min-height:40px;font-size:14px}',
        '.hcio-alert{position:relative;flex:none;border-radius:10px;padding:7px 36px 7px 10px;font-size:12.5px;line-height:1.4}.hcio-alert[hidden]{display:none}',
        '.hcio-alert-err{background:#fef2f2;border:1px solid #fecaca;color:#b91c1c}.hcio-alert-warn{background:#fff7ed;border:1px solid #fdba74;color:#9a3412}',
        '.hcio-alert-x{position:absolute;top:50%;right:5px;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;border:0;background:transparent;color:inherit;font:700 12px system-ui;cursor:pointer}.hcio-alert-x:hover{background:rgba(0,0,0,.07)}',
        '.hcio-fields{display:grid;grid-template-columns:minmax(0,1fr);gap:6px}.hcio-fields>div{display:grid;grid-template-columns:68px minmax(0,1fr);align-items:center;gap:8px}.hcio-fields label{display:block;margin:0;font-size:12px;font-weight:600;color:var(--mut)}.hcio .hcio-fields select,.hcio .hcio-fields input[type=text]{min-height:32px;padding:3px 8px}.hcio-fields small{display:block;margin-top:3px;font-size:11px;color:var(--mut)}.hcio-fields small:empty{display:none}',
        '.hcio select,.hcio input[type=text]{width:100%;min-height:34px;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font:inherit;transition:border-color .18s,box-shadow .18s}',
        '.hcio select:hover,.hcio input[type=text]:hover{border-color:#b6c4d3}.hcio select:focus,.hcio input[type=text]:focus{outline:none;border-color:var(--pri);box-shadow:0 0 0 3px rgba(21,122,92,.15)}.hcio select:disabled{background:#f1f5f9;color:#94a3b8}',
        '.hcio-photo-row{flex:none;display:grid;grid-template-columns:1fr 1fr;gap:8px}',
        '.hcio-photo-row.lg{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;gap:6px}',
        '.hcio-tile{position:relative;height:116px;border:2px dashed #c9d5e1;border-radius:12px;background:#fbfcfd;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;overflow:hidden;transition:border-color .18s,background-color .18s}',
        '.hcio-photo-row.lg .hcio-tile{flex:1 1 260px;height:auto;min-height:210px;max-height:420px}',
        '.hcio-photo-row.lg .hcio-tip{flex:none;padding:6px 9px;font-size:11.5px;line-height:1.35}.hcio-photo-row.lg .hcio-tip>b{font-size:12px;margin-bottom:1px}',
        '.hcio-tile:not(.has):hover{border-color:var(--pri);background:var(--pri-l)}.hcio-tile.has{border-style:solid;border-color:var(--pri)}',
        '.hcio-tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#eef2f6}.hcio-tile img:not([src]){display:none}',
        '.hcio-empty{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}.hcio-empty b{font-size:15px;color:#254363}.hcio-tile.has .hcio-empty{display:none}',
        '.hcio-link{border:0;background:none;color:var(--pri);font:600 12px system-ui;text-decoration:underline;cursor:pointer;padding:2px}',
        '.hcio-tile small{position:absolute;left:8px;right:8px;bottom:4px;text-align:center;font-size:11px;color:var(--mut)}.hcio-tile.has small{display:none}',
        '.hcio-x{position:absolute;top:6px;right:6px;width:28px;height:28px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;font:700 12px system-ui;cursor:pointer}.hcio-x:hover{background:#dc2626}.hcio-x[hidden]{display:none}',
        '.hcio-tip{display:flex;flex-direction:column;justify-content:center;background:#fffbeb;border:1px solid #fde68a;color:#92400e;border-radius:12px;padding:8px 10px;font-size:12px;line-height:1.4}.hcio-tip>b{font-size:12.5px;margin-bottom:2px;color:#78350f}.hcio-tip ul{margin:0;padding-left:16px}.hcio-tip li{margin:0}',
        '.hcio-stock{flex:1 1 auto;min-height:150px;display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:9px 10px 8px}',
        '.hcio-stock-h{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:2px 10px}.hcio-stock-h h3{margin:0;font-size:14px}.hcio-formula{font-size:11.5px;color:var(--mut)}',
        '.hcio-hint{background:var(--pri-l);color:var(--pri-d);border-radius:8px;padding:6px 9px;font-size:11.5px}.hcio-hint[hidden]{display:none}',
        '.hcio-scroll{flex:1 1 auto;min-height:0;overflow:auto;border:1px solid #eef2f6;border-radius:8px}',
        '.hcio-stbl{width:100%;border-collapse:collapse;table-layout:fixed}.hcio-stbl th,.hcio-stbl td{padding:3px;border-bottom:1px solid #eef2f6;text-align:left}.hcio-stbl tbody th{font-size:12px;font-weight:600}',
        '.hcio-stbl thead th{position:sticky;top:0;z-index:2;background:#f8fafc;border-bottom:1px solid var(--line);padding:5px 3px;font-size:11px;color:var(--mut);text-align:center}.hcio-stbl thead th:first-child{text-align:left}.hcio-stbl col.hcio-cn{width:84px}.hcio-stbl col.hcio-cs{width:60px}.hcio-stbl col.hcio-cx{width:32px}',
        '.hcio-stbl tfoot th,.hcio-stbl tfoot td{position:sticky;bottom:0;z-index:2;background:#f1f5f9;border:0;padding:6px 5px;font-weight:700;text-align:right;font-variant-numeric:tabular-nums}.hcio-stbl tfoot th{text-align:left}',
        '.hcio-stbl td.hcio-sold{text-align:right;padding-right:6px;font-weight:700;color:var(--pri-d);font-variant-numeric:tabular-nums}',
        '.hcio-stbl tr.hcio-neg th,.hcio-stbl tr.hcio-neg td{background:#fef2f2}.hcio-stbl tr.hcio-neg td.hcio-sold{color:#b91c1c}.hcio-stbl tr.hcio-neg .hcio-step{border-color:#f87171}',
        '.hcio-step{display:flex;border:1px solid var(--line);border-radius:7px;background:#fff;overflow:hidden;transition:border-color .18s,box-shadow .18s}.hcio-step:focus-within{border-color:var(--pri);box-shadow:0 0 0 3px rgba(21,122,92,.15)}',
        '.hcio input.hcio-num{flex:1;min-width:0;height:28px;min-height:28px;border:0;border-radius:0;padding:2px 4px;text-align:right;font:13px system-ui;font-variant-numeric:tabular-nums;background:transparent}.hcio input.hcio-num:focus{box-shadow:none}',
        '.hcio input.hcio-num:disabled{background:#eef2f6;color:#94a3b8}.hcio input.hcio-num::placeholder{color:#b6c2d0;font-size:12px}',
        '.hcio-spin{flex:none;width:17px;display:flex;flex-direction:column;border-left:1px solid var(--line)}.hcio-spin button{flex:1;border:0;padding:0;background:#f8fafc;color:#475569;font-size:7px;line-height:1;cursor:pointer;touch-action:none;user-select:none}',
        '.hcio-spin button+button{border-top:1px solid var(--line)}.hcio-spin button:hover{background:var(--pri-l);color:var(--pri-d)}.hcio-spin button:active{background:var(--pri);color:#fff}.hcio-step:has(:disabled) .hcio-spin button{opacity:.4;cursor:not-allowed}',
        '.hcio-stock-f{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px 12px}.hcio-stock-f small{font-size:11.5px;color:var(--mut)}',
        '.hcio-check{display:flex;align-items:center;gap:7px;font-size:12.5px;cursor:pointer}.hcio-check input{width:16px;height:16px;accent-color:var(--pri)}',
        '.hcio-pick{display:grid;grid-template-columns:1fr 1fr;gap:12px}.hcio-pick button{display:flex;flex-direction:column;align-items:center;gap:8px;padding:30px 10px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);font:inherit;cursor:pointer;transition:border-color .18s,box-shadow .18s,transform .18s}',
        '.hcio-pick button:hover:not(:disabled){border-color:var(--pri);box-shadow:0 6px 16px rgba(21,122,92,.15);transform:translateY(-2px)}.hcio-pick button:disabled{cursor:not-allowed;background:#f8fafc;color:#94a3b8}',
        '.hcio-pick .ico{font-size:40px;line-height:1}.hcio-pick b{font-size:18px}.hcio-pick small{font-size:13px;color:var(--mut)}.hcio-pick .need small{color:#b45309;font-weight:600}',
        '.hcio-kvs{display:grid;grid-template-columns:1fr 1fr;gap:6px}.hcio-kv{background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 8px}.hcio-kv small{display:block;font-size:11px;color:var(--mut)}.hcio-kv b{font-size:13px}',
        '.hcio-note{background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 9px;font-size:12.5px}',
        '.hcio-sec{font-size:12px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.03em}',
        '.hcio-mini{flex:none;width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);font-size:12.5px}.hcio-mini th,.hcio-mini td{padding:5px 8px;text-align:right;border-bottom:1px solid #eef2f6}',
        '.hcio-mini th:first-child{text-align:left;width:36%}.hcio-mini tr:first-child th{font-size:11px;color:var(--mut)}.hcio-mini .hcio-total th,.hcio-mini .hcio-total td{background:#f1f5f9;font-weight:700}',
        '.hcio-cam{position:fixed;inset:0;z-index:2147483000;background:#000}.hcio-cam-inner{position:relative;width:100%;height:100%;display:flex;flex-direction:column}',
        '.hcio-cam video{flex:1;min-height:0;width:100%;object-fit:contain;background:#000}.hcio-cam video.hcio-mirror{transform:scaleX(-1)}',
        '.hcio-cam-msg{position:absolute;top:45%;width:100%;text-align:center;color:#fff;font:15px system-ui}.hcio-cam-msg:empty{display:none}',
        '.hcio-cam-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px calc(16px + env(safe-area-inset-bottom));background:#111}.hcio-cam-bar .hcio-btn{min-width:110px}.hcio-cam-bar .hcio-btn[hidden]{visibility:hidden;display:block}',
        '.hcio-cam-shot{flex:none;width:72px;height:72px;border-radius:50%;border:5px solid #fff;background:#e33;cursor:pointer}.hcio-cam-shot:disabled{opacity:.4}',
        '@media(max-height:560px){.hcio-photo-row.lg .hcio-tile{min-height:100px}}',
        '@media(max-width:420px){.hcio-photo-row{grid-template-columns:1fr}.hcio-tile{height:108px}.hcio-stbl tbody th{font-size:11px}}',
        '.hcio-stbl tbody th b{display:block;font-weight:600;line-height:1.25}.hcio-stbl tbody th small{display:block;font-size:10.5px;font-weight:400;color:var(--mut)}',
        '.hcio-ro{display:block;padding:4px 6px;text-align:right;font-variant-numeric:tabular-nums;color:#475569;font-weight:600}',
        '.hcio-rmbtn{width:26px;height:26px;border:0;border-radius:50%;background:transparent;color:#94a3b8;font:700 12px system-ui;cursor:pointer}.hcio-rmbtn:hover{background:#fee2e2;color:#dc2626}',
        '.hcio-pk{position:absolute;inset:0;z-index:6;background:var(--bg);padding:12px 14px;display:flex;flex-direction:column;gap:8px}.hcio-pk-h{flex:none;display:flex;justify-content:space-between;align-items:center}.hcio-pk-h b{font-size:15px}.hcio-pk input[type=text]{flex:none}',
        '.hcio-pk-list{flex:1 1 auto;min-height:0;overflow:auto;background:#fff;border:1px solid var(--line);border-radius:10px}',
        '.hcio-pk-i{display:flex;align-items:center;gap:10px;margin:0;padding:8px 10px;border-bottom:1px solid #eef2f6;cursor:pointer}.hcio-pk-i:hover{background:var(--pri-l)}.hcio-pk-i[hidden]{display:none}.hcio-pk-i input{flex:none;width:18px;height:18px;accent-color:var(--pri)}.hcio-pk-i span{flex:1;min-width:0}.hcio-pk-i b{display:block;font-size:13px}.hcio-pk-i small{display:block;font-size:11px;color:var(--mut)}.hcio-pk-i em{font-style:normal;color:#d97706}',
        '.hcio-pk-f{flex:none;display:flex;justify-content:space-between;align-items:center;gap:10px}.hcio-pk-f small{font-size:12px;color:var(--mut)}',
        '.hcio-btn.hcio-big{min-height:52px;padding:10px 32px;font-size:16px;border-radius:12px}.hcio-cnt b{min-width:0;margin:0 2px;border-bottom:0}'
    ].join('') + '</style>';

    function shell(html, cls) { return CSS + '<div class="hcio' + (cls ? ' ' + cls : '') + '">' + html + '</div>'; }
    function header(title, sub) {
        return '<div class="hcio-head"><div class="hcio-title"><h2>' + esc(title) + '</h2>' + (sub ? '<span class="hcio-sub">' + esc(sub) + '</span>' : '') + '</div>' +
            '<button type="button" class="hcio-close" aria-label="Quay lại" title="Quay lại" onclick="HrmsCheckInOut.cancel()">✕</button></div>';
    }
    function openPanel(o) {
        cleanup(); state.form = o.form; state.warnHidden = '';
        var html = header(o.title, o.sub) + '<div class="hcio-body">' + o.body + '</div>' +
            '<div id="hcio-errbox" class="hcio-alert hcio-alert-err" role="alert" aria-live="assertive" hidden><span id="hcio-error"></span>' +
            '<button type="button" class="hcio-alert-x" aria-label="Đóng thông báo" title="Đóng" onclick="HrmsCheckInOut.hideError()">✕</button></div>' +
            (o.submit ? '<div class="hcio-foot"><button id="hcio-submit" type="button" class="hcio-btn" onclick="HrmsCheckInOut.submit()">' + esc(o.submit) + '</button></div>' : '');
        NUT.w2popup.message(Object.assign(sizes(), { speed: 0, buttons: '', body: shell(html, 'hcio-fit' + (o.out ? ' hcio-out' : '')) }));
        fitHeight();
    }
    // w2ui cần ~150ms để gỡ message cũ
    function switchPanel(open) { api.cancel(); setTimeout(open, 200); }
    function fitHeight() {
        requestAnimationFrame(function () {
            var list = document.querySelectorAll('.hcio-fit'), root = list[list.length - 1]; if (!root) return;
            var box = root.closest('.w2ui-message') || root.parentElement; if (!box) return;
            var chrome = box.offsetHeight - root.offsetHeight;
            root.style.height = 'auto'; var need = root.scrollHeight; root.style.height = '';
            box.style.height = Math.min(sizes().height, need + Math.max(0, chrome)) + 'px';
        });
    }
    function showError(text) {
        var box = el('errbox'), span = el('error');
        if (span) span.textContent = text || '';
        if (box) { box.hidden = !text; if (text && box.scrollIntoView) box.scrollIntoView({ block: 'nearest' }); }
        fitHeight();
    }
    function cleanup() {
        closeCamera(); state.seq++;
        state.urls.forEach(function (u) { URL.revokeObjectURL(u); });
        state.urls = []; state.files = {}; state.processing = 0;
    }
    function setBusy(b) {
        state.busy = b;
        var btn = el('submit'), point = el('point');
        if (btn) { if (!btn.dataset.label) btn.dataset.label = btn.textContent; btn.disabled = b; btn.textContent = b ? 'Đang xử lý…' : btn.dataset.label; }
        if (point) point.disabled = b || (!!api.config.pointTable && !((state.form && state.form.points) || []).length);
    }
    api.cancel = function () { if (state.busy) return; cleanup(); state.form = null; NUT.w2popup.message(); };
    api.close = function () { if (state.busy) return; cleanup(); NUT.w2popup.close(); };
    api.hideError = function () { showError(''); };

    // ---------- Màn hình chính ----------
    function roundCard(r) {
        var id = js(r.idchamcong), st = roundStatus(r), ph = photoState(r);
        var action = function (cls, fn, label) { return '<button type="button" class="hcio-btn hcio-sm' + cls + '" onclick="HrmsCheckInOut.' + fn + '(' + id + ')">' + label + '</button>'; };
        return '<div class="hcio-rcard is-' + st.key + '">' +
            '<div class="hcio-rtop"><div class="hcio-rtitle"><div><b>Lần ' + esc(r.lan) + (r.carry ? ' · ' + esc(r.ngay + '/' + r.thang) : '') + '</b><span class="hcio-pill is-' + st.key + '">' + esc(st.text) + '</span></div>' +
            '<small>' + esc(r.madiemban || '—') + '</small></div>' +
            action(' hcio-edit', 'openEdit', '✎ Chỉnh sửa') + '</div>' +
            '<div class="hcio-rbtm"><span class="hcio-time">Vào <b>' + esc(clock(r.thoigianden)) + '</b></span>' +
            '<span class="hcio-time">Ra <b>' + (r.thoigianve ? esc(clock(r.thoigianve)) : '') + '</b></span>' +
            '<span class="hcio-hbtns">' + action(!ph.inOk || (r.thoigianve && !ph.outOk) ? ' hcio-warn' : ' hcio-secondary', 'repairIn', 'Bổ sung ảnh') +
            action(' hcio-secondary', 'showDetails', 'Chi tiết') + '</span></div></div>';
    }
    function render() {
        var open = openRound(state.rows), next = nextRound(state.rows), leaves = state.rows.filter(isLeave);
        var done = state.rows.filter(function (r) { return r.thoigianden; }), block = targetBlock();
        if (block) next = null;
        var inWhy = block ? (state.target.missing ? 'Chưa có chỉ tiêu tháng' : 'Chưa đọc được chỉ tiêu')
            : next ? 'Lần ' + next
            : open ? 'Đang trong ca, Check OUT trước' : done.length ? 'Đã hết lượt hôm nay' : 'Không thể Check IN';
        var outWhy = open ? (open.carry ? 'Ca hôm qua ' + open.ngay + '/' + open.thang : 'Lần ' + open.lan) + ' · vào ' + clock(open.thoigianden) : 'Chưa Check IN';
        var initial = (state.nv.hoten || '?').trim().split(/\s+/).pop().charAt(0).toUpperCase();
        var html = '<div class="hcio-row"><div class="hcio-who"><span class="hcio-ava">' + esc(initial) + '</span><div><b>' + esc(state.nv.hoten) + '</b>' +
            '<small>Mã NV: <strong>' + esc(state.nv.manv) + '</strong></small></div></div>' +
            '<button type="button" id="hcio-refresh" class="hcio-btn hcio-sm hcio-secondary hcio-refresh" onclick="HrmsCheckInOut.refresh()"><span class="ico" aria-hidden="true">↻</span><span>Làm mới</span></button></div>' +
            '<div class="hcio-launch">' +
            '<button type="button" class="hcio-act hcio-act-in"' + (next ? '' : ' aria-disabled="true"') + ' onclick="HrmsCheckInOut.start(\'in\')"><span class="hcio-act-ico">→</span><b>Check IN</b><small>' + esc(inWhy) + '</small></button>' +
            '<button type="button" class="hcio-act hcio-act-out"' + (open ? '' : ' aria-disabled="true"') + ' onclick="HrmsCheckInOut.start(\'out\')"><span class="hcio-act-ico">←</span><b>Check OUT</b><small>' + esc(outWhy) + '</small></button></div>';
        if (leaves.length) {
            html += '<div class="hcio-leave" role="note"><b>Bạn đã báo nghỉ hôm nay</b> (' +
                esc(leaves.map(function (r) { return 'Lần ' + r.lan + (r.madiemban ? ' · ' + r.madiemban : '') + ' · ' + r.chamcong; }).join('; ')) + ').' +
                '<span>Báo nghỉ được ghi riêng, không ảnh hưởng chấm công; vẫn Check IN/OUT bình thường.</span></div>';
        }
        if (block) html += '<div class="hcio-alert hcio-alert-warn" role="alert" style="margin:0 0 10px;padding-right:10px">⚠ ' + esc(block) +
            (state.target.missing ? ' Khai xong bấm <b>Làm mới</b>.' : ' Bấm <b>Làm mới</b> để thử lại.') + '</div>';
        if (state.salesErr) html += '<div class="hcio-alert hcio-alert-err" role="alert" style="margin:0 0 10px;padding-right:10px">' + esc(state.salesErr) + ' Chấm công vẫn dùng được; bấm Làm mới để thử lại.</div>';
        if (done.length) {
            var finished = done.filter(function (r) { return roundStatus(r).key === 'ok'; }).length;
            html += '<div class="hcio-hist"><div class="hcio-hist-h"><span>' + (done.some(function (r) { return r.carry; }) ? 'Hôm nay & ca qua đêm' : 'Hôm nay') + '</span><span class="hcio-hist-sum">' + finished + '/' + done.length + ' lần hoàn thành</span></div>' +
                '<div class="hcio-rlist">' + done.map(roundCard).join('') + '</div></div>';
        }
        var root = document.getElementById('hcio-main'), day = dayKey(state.date);
        if (root && root.isConnected && state.renderedDay === day) {
            root.innerHTML = html; root.classList.remove('is-fresh'); void root.offsetWidth; root.classList.add('is-fresh');
            return;
        }
        state.renderedDay = day;
        if (open && open.carry) NUT.notify(forgotText(open), 'yellow');
        NUT.w2popup.open(Object.assign(sizes(), { title: 'Chấm công · ' + esc(dateText(state.date)), modal: true, body: shell('<div id="hcio-main">' + html + '</div>'), buttons: '' }));
        watchDay();
    }
    api.start = function (kind) {
        if (state.busy || staleDay()) return;
        if (kind === 'in') {
            var block = targetBlock(); if (block) return notify(block, true);
            var n = nextRound(state.rows); if (n) return api.openIn(n);
        }
        else { var o = openRound(state.rows); if (o) return api.openOut(o.idchamcong); }
        var why = document.querySelector('.hcio-act-' + kind + ' small');
        notify(why ? why.textContent : 'Chưa thể thực hiện.', true);
    };
    api.run = async function () {
        if (state.busy) return;
        try {
            var c = api.config;
            if (!NUT.services[c.serviceId]) fail('Chưa cấu hình service ' + c.serviceId + '.');
            state.url = NUT.services[c.serviceId].url.replace(/\/?$/, '/');
            state.login = n$.user.username;
            var code = String(n$.user[c.userCodeProp] || '').trim();
            if (!code) fail('Tài khoản ' + state.login + ' chưa được gán mã nhân viên (Tag). Liên hệ quản trị.');
            var found = await select(c.codeTable, { select: c.codeField + ',hoten,status', where: [[c.codeField, '=', code]] });
            if (!found.length) fail('Mã nhân viên chưa được kích hoạt cho tài khoản đang đăng nhập.');
            var me = found.filter(function (x) { return x.status === c.officialStatus; })[0];
            if (!me && c.requireOfficial) fail('Mã ' + code + ' chưa phải nhân viên chính thức.');
            me = me || found[0];
            state.user = code;
            state.nv = { manv: code, hoten: me.hoten || code, makhuvuc: null };
            // khu vực mặc định của NV: cột regionField trong bảng nhân viên
            if (c.regionField) {
                try {
                    var ex = await select(c.codeTable, { select: c.regionField, where: [[c.codeField, '=', code]] });
                    var kv = ex.map(function (x) { return x[c.regionField]; }).filter(Boolean)[0];
                    if (kv) state.nv.makhuvuc = kv;
                } catch (e) { console.warn('[HrmsCheckInOut] chưa đọc được cột ' + c.regionField + ' ở ' + c.codeTable + ':', e.message); }
            }
            await loadRegions();
            await reload(); render();
        } catch (e) { notify(e.message, true); }
    };
    api.refresh = async function () {
        if (state.busy || state.refreshing) return;
        state.refreshing = true;
        var btn = el('refresh'); if (btn) { btn.classList.add('is-loading'); btn.setAttribute('aria-busy', 'true'); }
        var wait = new Promise(function (r) { setTimeout(r, 450); });
        try { await reload(); await wait; render(); }
        catch (e) { notify(e.message, true); }
        finally {
            state.refreshing = false;
            btn = el('refresh'); if (btn) { btn.classList.remove('is-loading'); btn.removeAttribute('aria-busy'); }
        }
    };

    // ---------- Ảnh ----------
    var PHOTO_TIP = '<div class="hcio-tip" role="note">⚠ Chụp trực tiếp rõ biển hiệu/quầy điểm bán, không mờ, không chói.</div>';
    function photoBlock(id, label, large) {
        var a = js(id);
        return '<div class="hcio-photo-row' + (large ? ' lg' : '') + '"><div class="hcio-tile" id="hcio-tile-' + id + '">' +
            '<input id="hcio-' + id + '-cam" type="file" accept="image/*" capture="' + esc(api.config.camera) + '" hidden onchange="HrmsCheckInOut.pick(this,' + a + ')">' +
            '<img id="hcio-preview-' + id + '" alt="' + esc(label) + '">' +
            '<div class="hcio-empty"><b>' + esc(label) + ' *</b>' +
            '<button type="button" class="hcio-btn hcio-big" onclick="HrmsCheckInOut.openCamera(' + a + ')">📷 Chụp ảnh</button></div>' +
            '<small id="hcio-status-' + id + '"></small>' +
            '<button type="button" id="hcio-remove-' + id + '" class="hcio-x" hidden aria-label="Xóa ảnh" title="Xóa ảnh" onclick="HrmsCheckInOut.removePhoto(' + a + ')">✕</button>' +
            '</div>' + PHOTO_TIP + '</div>';
    }
    function setTile(id, has) {
        var tile = el('tile-' + id), rm = el('remove-' + id), img = el('preview-' + id);
        if (tile) tile.classList.toggle('has', has);
        if (rm) rm.hidden = !has;
        if (!has && img) img.removeAttribute('src');
    }
    api.removePhoto = function (id) {
        if (state.busy) return;
        delete state.files[id]; setTile(id, false);
        var st = el('status-' + id); if (st) st.textContent = '';
    };
    function validFile(f) {
        if (!f || !(/^image\/(jpeg|png|webp)$/.test(f.type) || (!f.type && /\.(jpe?g|png|webp)$/i.test(f.name || '')))) fail('Ảnh chụp không hợp lệ (chỉ nhận JPG, PNG, WebP).');
        if (f.size > api.config.maxImageMB * 1024 * 1024) fail('Ảnh vượt quá ' + api.config.maxImageMB + ' MB.');
    }
    function getPhoto(id, label, optional) {
        if (state.processing) fail('Ảnh đang được xử lý, vui lòng đợi giây lát.');
        var f = state.files[id];
        if (!f) { if (optional) return null; fail('Vui lòng chụp ' + label + ' (có thời gian và địa điểm bán) trước khi xác nhận.'); }
        validFile(f); return f;
    }
    function loadImage(file) {
        return new Promise(function (resolve, reject) {
            var u = URL.createObjectURL(file), img = new Image();
            img.onload = function () { URL.revokeObjectURL(u); resolve(img); };
            img.onerror = function () { URL.revokeObjectURL(u); reject(new Error('Không đọc được ảnh.')); };
            img.src = u;
        });
    }
    async function processImage(file) {
        var c = api.config, img = await loadImage(file);
        var k = Math.min(1, c.maxImageSide / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.round(img.naturalWidth * k), h = Math.round(img.naturalHeight * k), cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        var g = cv.getContext('2d'); g.drawImage(img, 0, 0, w, h);
        var d = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
        var code = value('point') || (state.form && state.form.point) || '', name = state.pointNames[code];
        var point = name && name !== code ? name + ' (' + code + ')' : code;
        var lines = [pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()),
            state.user + (point ? ' · ' + point : '')];
        var fs = Math.max(16, Math.round(w / 32)); g.font = '600 ' + fs + 'px system-ui,sans-serif'; g.textBaseline = 'bottom';
        var bw = Math.max.apply(null, lines.map(function (t) { return g.measureText(t).width; })) + fs, bh = lines.length * fs * 1.3 + fs * 0.6;
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, h - bh, bw, bh); g.fillStyle = '#fff';
        lines.forEach(function (t, i) { g.fillText(t, fs / 2, h - bh + fs * 0.3 + (i + 1) * fs * 1.3); });
        var blob = await new Promise(function (resolve) { cv.toBlob(resolve, 'image/jpeg', c.jpegQuality); });
        if (!blob) fail('Không xử lý được ảnh.');
        return new File([blob], 'hcio_' + Date.now() + '.jpg', { type: 'image/jpeg', lastModified: Date.now() });
    }
    async function handleFile(f, id) {
        var seq = state.seq, st = el('status-' + id), img = el('preview-' + id);
        state.processing++; if (st) st.textContent = 'Đang xử lý…';
        try {
            if (f.type && !/^image\//.test(f.type)) fail('Ảnh chụp không hợp lệ.');
            var out; try { out = await processImage(f); } catch (e) { out = f; }
            validFile(out);
            if (seq !== state.seq) return;
            state.files[id] = out;
            var u = URL.createObjectURL(out); state.urls.push(u); if (img) img.src = u;
            if (st) st.textContent = ''; setTile(id, true);
        } catch (e) {
            if (seq === state.seq) { delete state.files[id]; setTile(id, false); if (st) st.textContent = e.message; }
            notify(e.message, true);
        } finally {
            if (seq === state.seq) state.processing = Math.max(0, state.processing - 1);
        }
    }
    api.pick = function (input, id) {
        var f = input.files && input.files[0]; input.value = '';
        if (f) return handleFile(f, id);
    };
    var cam = { stream: null, box: null, facing: null };
    function camKey(e) { if (e.key === 'Escape') { e.stopPropagation(); closeCamera(); } }
    function closeCamera() {
        if (cam.stream) cam.stream.getTracks().forEach(function (t) { t.stop(); });
        if (cam.box && cam.box.parentNode) cam.box.parentNode.removeChild(cam.box);
        cam.stream = null; cam.box = null; document.removeEventListener('keydown', camKey, true);
    }
    function camError(name) {
        if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'Bạn cần cấp quyền sử dụng camera để chụp ảnh. Bấm biểu tượng ổ khóa trên thanh địa chỉ → Cho phép Camera, rồi bấm Chụp ảnh lại.';
        if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Không tìm thấy camera trên thiết bị này.';
        if (name === 'NotReadableError' || name === 'TrackStartError') return 'Camera đang được ứng dụng khác sử dụng. Hãy tắt ứng dụng đó rồi bấm Chụp ảnh lại.';
        return 'Không mở được camera' + (name ? ' (' + name + ')' : '') + '. Hãy kiểm tra quyền camera rồi bấm Chụp ảnh lại.';
    }
    function camFail(id, name) {
        var text = camError(name), st = el('status-' + id);
        if (st) { st.textContent = text; st.style.color = '#b91c1c'; }
        notify(text, true);
    }
    function fallbackCapture(id) { var i = el(id + '-cam'); if (i) i.click(); }
    async function startStream() {
        if (cam.stream) cam.stream.getTracks().forEach(function (t) { t.stop(); });
        cam.stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: cam.facing }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
        var v = cam.box && cam.box.querySelector('video');
        if (v) { v.srcObject = cam.stream; await v.play().catch(function () {}); }
    }
    api.openCamera = async function (id) {
        if (state.busy) return;
        if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return fallbackCapture(id);
        var st0 = el('status-' + id); if (st0) { st0.textContent = ''; st0.style.color = ''; }
        closeCamera(); cam.facing = cam.facing || api.config.camera;
        var box = document.createElement('div'); cam.box = box; box.className = 'hcio-cam';
        box.innerHTML = CSS + '<div class="hcio-cam-inner" role="dialog" aria-label="Chụp ảnh"><video playsinline muted autoplay></video>' +
            '<div class="hcio-cam-msg">Đang mở camera…</div><div class="hcio-cam-bar">' +
            '<button type="button" class="hcio-btn hcio-secondary" data-a="close">Hủy</button>' +
            '<button type="button" class="hcio-cam-shot" data-a="shot" aria-label="Chụp" disabled></button>' +
            '<button type="button" class="hcio-btn hcio-secondary" data-a="flip">Đổi camera</button></div></div>';
        document.body.appendChild(box); document.addEventListener('keydown', camKey, true);
        var msg = box.querySelector('.hcio-cam-msg'), shot = box.querySelector('[data-a=shot]'), video = box.querySelector('video');
        box.addEventListener('click', async function (e) {
            var a = e.target.closest && e.target.closest('[data-a]'); a = a && a.getAttribute('data-a');
            if (a === 'close') closeCamera();
            else if (a === 'flip') {
                cam.facing = cam.facing === 'user' ? 'environment' : 'user';
                try { await startStream(); video.classList.toggle('hcio-mirror', cam.facing === 'user'); } catch (err) { msg.textContent = 'Không đổi được camera. Hãy kiểm tra quyền camera.'; }
            } else if (a === 'shot' && video.videoWidth) {
                var cv = document.createElement('canvas'); cv.width = video.videoWidth; cv.height = video.videoHeight;
                var g = cv.getContext('2d'); if (cam.facing === 'user') { g.translate(cv.width, 0); g.scale(-1, 1); }
                g.drawImage(video, 0, 0); closeCamera();
                cv.toBlob(function (b) { if (b) handleFile(new File([b], 'camera_' + Date.now() + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }), id); }, 'image/jpeg', 0.92);
            }
        });
        try {
            await startStream(); msg.textContent = ''; shot.disabled = false;
            video.classList.toggle('hcio-mirror', cam.facing === 'user');
            navigator.mediaDevices.enumerateDevices().then(function (list) {
                if (list.filter(function (x) { return x.kind === 'videoinput'; }).length < 2) { var f = box.querySelector('[data-a=flip]'); if (f) f.hidden = true; }
            }).catch(function () {});
        } catch (err) {
            closeCamera();
            camFail(id, err && err.name);
        }
    };

    // ---------- Bảng sản lượng ----------
    var COL_LABEL = { a: 'Tồn đầu', n: 'Nhập NPP', c: 'Tồn cuối' }, COL_NO = { a: '1', n: '2', c: '3' };
    function numeric(id, val, label, blank) {
        var v = val == null || val === '' ? (blank ? '' : 0) : Math.max(0, Number(val) || 0), a = js(id);
        return '<div class="hcio-step"><input aria-label="' + esc(label) + '" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9" autocomplete="off" class="hcio-num" id="hcio-' + id + '" value="' + esc(v) + '"' + (blank ? ' placeholder="Nhập"' : '') +
            ' oninput="this.value=this.value.replace(/[^0-9]/g,\'\').replace(/^0+(?=\\d)/,\'\');this.dataset.t=1;HrmsCheckInOut.calc()" onkeydown="HrmsCheckInOut.stepKey(event,this)" onfocus="this.select()">' +
            '<span class="hcio-spin"><button type="button" tabindex="-1" aria-label="Tăng" onpointerdown="HrmsCheckInOut.stepHold(event,' + a + ',1)">▲</button>' +
            '<button type="button" tabindex="-1" aria-label="Giảm" onpointerdown="HrmsCheckInOut.stepHold(event,' + a + ',-1)">▼</button></span></div>';
    }
    function formProducts() { return (state.form && state.form.products) || []; }
    function fmt(v) { return (Number(v) || 0).toLocaleString('vi-VN'); }
    function stockRow(p, f) {
        var k = 'p' + p.k, cells = '';
        ['a', 'n', 'c'].forEach(function (col) {
            var mode = f.cols[col]; if (!mode) return;
            cells += '<td>' + (mode === 'e' ? numeric(k + COL_NO[col], p[col], p.ten + ' – ' + COL_LABEL[col], col !== 'n')
                : '<span class="hcio-ro">' + (p[col] == null ? '—' : fmt(p[col])) + '</span>') + '</td>';
        });
        if (f.cols.c) cells += '<td class="hcio-sold" id="hcio-sold-' + k + '">—</td>';
        if (f.remove) cells += '<td><button type="button" class="hcio-rmbtn" aria-label="Bỏ ' + esc(p.ten) + '" title="Bỏ sản phẩm" onclick="HrmsCheckInOut.removeRow(' + p.k + ')">✕</button></td>';
        return '<tr id="hcio-row-' + k + '"><th title="' + esc(p.ma) + '"><b>' + esc(p.ten) + '</b>' + (p.ten !== p.ma ? '<small>' + esc(p.ma) + '</small>' : '') + '</th>' + cells + '</tr>';
    }
    // f.cols: { a, n, c } = 'e' nhập | 'r' chỉ xem | bỏ trống = ẩn; f.add / f.remove: cho thêm / bỏ dòng sản phẩm
    function stockTable(f, o) {
        var cols = ['a', 'n', 'c'].filter(function (c) { return f.cols[c]; }), sold = !!f.cols.c, n = f.products.length;
        f.zeroCol = o.zero ? o.zero.col : null; f.endRequired = !!o.required;
        var head = '<th>Sản phẩm</th>' + cols.map(function (c) { return '<th>' + COL_LABEL[c] + (c === 'c' && o.required ? ' *' : '') + '</th>'; }).join('') + (sold ? '<th>Số bán</th>' : '') + (f.remove ? '<th></th>' : '');
        var colg = '<col>' + cols.map(function () { return '<col class="hcio-cn">'; }).join('') + (sold ? '<col class="hcio-cs">' : '') + (f.remove ? '<col class="hcio-cx">' : '');
        var foot = '<th>Tổng</th>' + cols.map(function (c) { return '<td id="hcio-t' + COL_NO[c] + '">0</td>'; }).join('') + (sold ? '<td id="hcio-t4" class="hcio-sold">0</td>' : '') + (f.remove ? '<td></td>' : '');
        var minw = 130 + cols.length * 84 + (sold ? 60 : 0) + (f.remove ? 32 : 0);
        return '<section class="hcio-stock" id="hcio-stock">' +
            '<div class="hcio-stock-h"><h3>' + esc(o.title) + '</h3>' +
            (f.add ? '<button type="button" class="hcio-btn hcio-sm hcio-edit" onclick="HrmsCheckInOut.openPicker()">＋ Thêm sản phẩm</button>' : '') + '</div>' +
            (f.add ? '<div id="hcio-empty" class="hcio-hint"' + (n ? ' hidden' : '') + '>Chưa có sản phẩm. Bấm “＋ Thêm sản phẩm” để chọn từ danh mục.</div>' : '') +
            '<div class="hcio-scroll" id="hcio-tblwrap"' + (n ? '' : ' hidden') + '><table class="hcio-stbl" style="min-width:' + minw + 'px"><colgroup>' + colg + '</colgroup>' +
            '<thead><tr>' + head + '</tr></thead><tbody id="hcio-tbody">' + f.products.map(function (p) { return stockRow(p, f); }).join('') + '</tbody>' +
            '<tfoot><tr>' + foot + '</tr></tfoot></table></div>' +
            '<div id="hcio-warn" class="hcio-alert hcio-alert-warn" role="alert" hidden><span id="hcio-warn-text"></span>' +
            '<button type="button" class="hcio-alert-x" aria-label="Đóng cảnh báo" title="Đóng" onclick="HrmsCheckInOut.hideWarn()">✕</button></div>' +
            '<div class="hcio-stock-f">' + (o.zero ? '<label class="hcio-check"><input id="hcio-zero" type="checkbox" onchange="HrmsCheckInOut.zeroCol(this,' + js(o.zero.col) + ')"> ' + esc(o.zero.label) + '</label>' : '<span></span>') +
            (o.note ? '<small>' + esc(o.note) + '</small>' : '') + '</div></section>';
    }
    // v[masanpham] = { a: tồn đầu, n: nhập, c: tồn cuối ('' nếu chưa nhập), b: số bán (null nếu chưa có tồn cuối) }
    function stockOf(s, list) {
        var v = {}, items = (s && s.items) || {};
        list.forEach(function (p) {
            var it = items[p.ma] || {}, a = it.a || 0, n = it.n || 0, has = it.c != null;
            v[p.ma] = { a: a, n: n, c: has ? it.c : '', b: has ? a + n - it.c : null };
        });
        return v;
    }
    function num(id) { var n = parseInt(value(id), 10); return isNaN(n) ? 0 : n; }
    function blank(id) { return String(value(id)).trim() === ''; }
    function syncEmpty() {
        var n = formProducts().length, hint = el('empty'), wrap = el('tblwrap');
        if (hint) hint.hidden = n > 0;
        if (wrap) wrap.hidden = n === 0;
    }
    api.calc = function () {
        var f = state.form; if (!f || !el('stock')) return;
        var total = [0, 0, 0, 0], neg = [];
        f.products.forEach(function (p) {
            var k = 'p' + p.k, a = f.cols.a === 'e' ? num(k + '1') : (p.a || 0), n = f.cols.n === 'e' ? num(k + '2') : (p.n || 0);
            total[0] += a; total[1] += n;
            if (!f.cols.c) return;
            var cell = el('sold-' + k), row = el('row-' + k), has = f.cols.c === 'e' ? !blank(k + '3') : p.c != null;
            if (!has) { if (cell) cell.textContent = '—'; if (row) row.classList.remove('hcio-neg'); return; }
            var c = f.cols.c === 'e' ? num(k + '3') : p.c, s = a + n - c;
            total[2] += c; total[3] += s;
            if (cell) cell.textContent = String(s);
            if (row) row.classList.toggle('hcio-neg', s < 0);
            if (s < 0) neg.push(p.ten + ' (' + s + ')');
        });
        total.forEach(function (t, i) { var e = el('t' + (i + 1)); if (e) e.textContent = String(t); });
        var warn = el('warn'); if (!warn) return;
        var sig = neg.join('|'); if (!neg.length) state.warnHidden = '';
        var show = neg.length > 0 && sig !== state.warnHidden, changed = warn.hidden === show;
        warn.hidden = !show; warn.dataset.sig = sig;
        if (show) el('warn-text').innerHTML = '<b>Số bán âm:</b> ' + esc(neg.join(', ')) + '. Tồn cuối không được lớn hơn Tồn đầu + Nhập NPP.';
        if (changed) fitHeight();
    };
    api.hideWarn = function () { var w = el('warn'); if (!w) return; state.warnHidden = w.dataset.sig || ''; w.hidden = true; fitHeight(); };
    api.removeRow = function (k) {
        var f = state.form; if (!f || state.busy) return;
        f.products = f.products.filter(function (p) { return p.k !== k; });
        var row = el('row-p' + k); if (row && row.parentNode) row.parentNode.removeChild(row);
        syncEmpty(); api.calc(); fitHeight();
    };
    function stepBy(input, d) {
        if (!input || input.disabled) return;
        input.value = String(Math.max(0, Math.min(999999999, (parseInt(input.value, 10) || 0) + d)));
        input.dataset.t = '1'; api.calc();
    }
    api.stepKey = function (e, input) {
        var d = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[e.key]; if (!d) return;
        if (e.shiftKey && Math.abs(d) === 1) d *= 10;
        e.preventDefault(); stepBy(input, d);
    };
    api.stepHold = function (e, id, d) {
        e.preventDefault();
        var input = el(id); if (!input || input.disabled) return;
        stepBy(input, d);
        var t = setTimeout(function () { t = setInterval(function () { stepBy(input, d); }, 70); }, 400);
        var stop = function () { clearTimeout(t); clearInterval(t); document.removeEventListener('pointerup', stop); document.removeEventListener('pointercancel', stop); };
        document.addEventListener('pointerup', stop); document.addEventListener('pointercancel', stop);
    };
    api.zeroCol = function (box, col) {
        formProducts().forEach(function (p) {
            var e = el('p' + p.k + col); if (!e) return;
            if (box.checked) { e.dataset.keep = e.value; e.value = '0'; e.disabled = true; }
            else { e.disabled = false; if (e.dataset.keep != null) e.value = e.dataset.keep; }
        });
        api.calc();
    };
    function readNumber(id, label) {
        var raw = String(value(id)).trim(); if (raw === '') return 0;
        if (!/^\d+$/.test(raw)) fail(label + ': chỉ nhập số nguyên ≥ 0.');
        var n = Number(raw); if (n > 2147483647) fail(label + ': số quá lớn.');
        return n;
    }
    // trả { items: [{ ma, a, n, c }] }; giá trị null = không lưu dòng đó
    function readStock() {
        var f = state.form, cols = f.cols, items = [], noStart = [], noEnd = [], neg = [];
        f.products.forEach(function (p) {
            var k = 'p' + p.k, it = { ma: p.ma, a: null, n: null, c: null };
            if (cols.a === 'e') { if (blank(k + '1')) noStart.push(p.ten); it.a = readNumber(k + '1', p.ten + ' – Tồn đầu'); } else it.a = p.a;
            if (cols.n === 'e') { var n = readNumber(k + '2', p.ten + ' – Nhập NPP'); it.n = n > 0 ? n : null; } else it.n = p.n;
            var stock = (it.a || 0) + (it.n || 0);
            if (cols.c === 'e') {
                if (blank(k + '3')) { if (f.endRequired && stock > 0) noEnd.push(p.ten); }
                else {
                    var c = readNumber(k + '3', p.ten + ' – Tồn cuối');
                    if (stock - c < 0) neg.push(p.ten + ' (' + (stock - c) + ')');
                    if (stock > 0 || c > 0) it.c = c;
                }
            } else it.c = p.c;
            items.push(it);
        });
        if (neg.length) { state.warnHidden = ''; api.calc(); fail('Số bán không được âm: ' + neg.join(', ') + '. Sửa lại Tồn cuối hoặc Tồn đầu/Nhập NPP.'); }
        if (noStart.length) fail('Chưa nhập Tồn đầu cho: ' + noStart.join(', ') + ' (nhập 0 nếu không có hàng).');
        if (noEnd.length) fail('Chưa nhập Tồn cuối cho: ' + noEnd.join(', ') + '. Nếu cuối ca hết hàng, tick "Cuối ca hết hàng".');
        return { items: items };
    }

    api.openPicker = function () {
        var f = state.form; if (!f || !f.add || state.busy) return;
        if (!(f.catalog || []).length) return notify('Chưa có danh mục sản phẩm. Liên hệ quản trị.', true);
        var have = {}; f.products.forEach(function (p) { have[p.ma] = 1; });
        var list = f.catalog.filter(function (p) { return !have[p.ma]; });
        if (!list.length) return notify('Đã thêm hết sản phẩm trong danh mục.', true);
        var roots = document.querySelectorAll('.hcio-fit'), root = roots[roots.length - 1]; if (!root || el('pk')) return;
        state.pickList = list;
        root.insertAdjacentHTML('beforeend', '<div class="hcio-pk" id="hcio-pk" role="dialog" aria-label="Chọn sản phẩm">' +
            '<div class="hcio-pk-h"><b>Chọn sản phẩm</b><button type="button" class="hcio-close" aria-label="Đóng" title="Đóng" onclick="HrmsCheckInOut.closePicker()">✕</button></div>' +
            '<input type="text" id="hcio-pk-q" autocomplete="off" placeholder="Tìm theo tên hoặc mã sản phẩm…" oninput="HrmsCheckInOut.filterPicker(this.value)">' +
            '<div class="hcio-pk-list">' + list.map(function (p, i) {
                return '<label class="hcio-pk-i" data-q="' + esc((p.ten + ' ' + p.ma + ' ' + (p.dt || '')).toLowerCase()) + '"><input type="checkbox" value="' + i + '" onchange="HrmsCheckInOut.pickCount()">' +
                    '<span><b>' + esc(p.ten) + '</b><small>' + esc(p.ma) + (p.dt ? ' · ' + esc(p.dt) : '') + '</small></span>' + (p.td ? '<em title="Sản phẩm trọng điểm">★</em>' : '') + '</label>';
            }).join('') + '</div>' +
            '<div class="hcio-pk-f"><small id="hcio-pk-n">Chưa chọn sản phẩm nào</small><button type="button" class="hcio-btn" id="hcio-pk-ok" disabled onclick="HrmsCheckInOut.pickAdd()">Thêm vào</button></div></div>');
        var q = el('pk-q'); if (q) q.focus();
    };
    api.closePicker = function () { var pk = el('pk'); if (pk && pk.parentNode) pk.parentNode.removeChild(pk); state.pickList = null; };
    api.filterPicker = function (q) {
        q = String(q || '').toLowerCase().trim();
        Array.prototype.forEach.call(document.querySelectorAll('#hcio-pk .hcio-pk-i'), function (l) { l.hidden = !!q && l.getAttribute('data-q').indexOf(q) < 0; });
    };
    api.pickCount = function () {
        var n = document.querySelectorAll('#hcio-pk .hcio-pk-i input:checked').length, ok = el('pk-ok'), lab = el('pk-n');
        if (lab) lab.textContent = n ? 'Đã chọn ' + n + ' sản phẩm' : 'Chưa chọn sản phẩm nào';
        if (ok) { ok.disabled = !n; ok.textContent = n ? 'Thêm ' + n + ' sản phẩm' : 'Thêm vào'; }
    };
    api.pickAdd = function () {
        var f = state.form, list = state.pickList, body = el('tbody'); if (!f || !list || !body) return;
        var boxes = document.querySelectorAll('#hcio-pk .hcio-pk-i input:checked'), first = null, z = el('zero');
        Array.prototype.forEach.call(boxes, function (b) {
            var c = list[Number(b.value)]; if (!c) return;
            var p = { k: ++f.kseq, ma: c.ma, ten: c.ten, a: null, n: null, c: null };
            f.products.push(p); body.insertAdjacentHTML('beforeend', stockRow(p, f));
            if (z && z.checked && f.zeroCol) { var e = el('p' + p.k + f.zeroCol); if (e) { e.dataset.keep = ''; e.value = '0'; e.disabled = true; } }
            if (!first) first = el('p' + p.k + '1');
        });
        api.closePicker(); syncEmpty(); api.calc(); fitHeight();
        if (first) first.focus();
    };

    // ---------- Trường nhập của form ----------
    // khu vực lấy theo hồ sơ nhân viên (không hiện, không cho chọn); chỉ chọn điểm bán thuộc khu vực đó
    function placeFields(region, pointValue) {
        if (!api.config.pointTable) {
            return { region: region, warn: '', html: '<div><label for="hcio-point">Điểm bán *</label><input id="hcio-point" type="text" maxlength="50" autocomplete="off" placeholder="Mã hoặc tên điểm bán" value="' + esc(pointValue || '') + '"></div>' };
        }
        return {
            region: region,
            warn: region ? '' : '<div class="hcio-alert hcio-alert-err">Bạn chưa được gán khu vực. Liên hệ quản trị.</div>',
            html: '<div><label for="hcio-point">Điểm bán *</label><select id="hcio-point" disabled><option>Đang tải…</option></select></div>'
        };
    }
    function lastPoint() {
        var r = state.rows.filter(function (x) { return x.madiemban && !isLeave(x); }).slice(-1)[0]; if (r) return r.madiemban;
        try { return localStorage.getItem('hcio-lastpoint-' + state.user) || ''; } catch (e) { return ''; }
    }
    function rememberPlace(place) {
        try {
            localStorage.setItem('hcio-lastpoint-' + state.user, place.point);
        } catch (e) { /* trình duyệt chặn localStorage: bỏ qua gợi ý lần sau */ }
    }
    api.loadPoints = async function (region) {
        if (!api.config.pointTable) return;
        var seq = ++state.pointSeq, form = state.form, point = el('point'); if (!point || !form) return;
        form.points = []; point.disabled = true;
        point.innerHTML = '<option value="">' + (region ? 'Đang tải điểm bán…' : 'Chưa được gán khu vực') + '</option>';
        if (!region) return;
        try {
            var rows = await select(api.config.pointTable, { select: 'madiemban,tendiemban', where: ['makhuvuc', '=', region] });
            if (seq !== state.pointSeq || state.form !== form) return;
            point = el('point'); if (!point) return;
            form.points = rows;
            rows.forEach(function (r) { if (r.tendiemban) state.pointNames[r.madiemban] = r.tendiemban; });
            point.innerHTML = '<option value="">' + (rows.length ? 'Chọn điểm bán' : 'Khu vực chưa có điểm bán') + '</option>' +
                rows.map(function (r) { return '<option value="' + esc(r.madiemban) + '">' + esc(r.tendiemban) + ' · ' + esc(r.madiemban) + '</option>'; }).join('');
            point.disabled = !rows.length || state.busy;
            var want = form.prefPoint || lastPoint();
            var pick = rows.length === 1 ? rows[0].madiemban : rows.some(function (x) { return String(x.madiemban) === String(want); }) ? want : '';
            if (pick) point.value = pick;
        } catch (e) {
            if (seq !== state.pointSeq) return;
            point = el('point'); if (point) point.innerHTML = '<option value="">Không tải được; hãy mở lại form</option>';
            notify(e.message, true);
        }
    };
    function noteField(r) {
        return '<div><label for="hcio-note">Ghi chú</label><input id="hcio-note" type="text" maxlength="255" autocomplete="off" placeholder="Không bắt buộc" value="' + esc(r.ghichu || '') + '"></div>';
    }
    var ZERO_END = { col: '3', label: 'Cuối ca hết hàng (Tồn cuối = 0)' };

    function roundProducts(r) {
        var s = sales(r), items = (s && s.items) || {}, k = 0;
        return productsFor(r, s).filter(function (p) { return items[p.ma]; }).map(function (p) {
            var it = items[p.ma]; return { k: ++k, ma: p.ma, ten: p.ten, a: it.a == null ? 0 : it.a, n: it.n, c: it.c };
        });
    }

    api.openIn = function (lan) {
        if (state.busy) return;
        var block = targetBlock(); if (block) return notify(block, true);
        var pf = placeFields(state.nv.makhuvuc, '');
        openPanel({
            title: 'Check IN' + (lan > 1 ? ' · Lần ' + lan : ''), sub: dateText(today()) + ' · Bước 1/2 · Chụp ảnh', submit: 'Xác nhận Check IN',
            form: { type: 'in', lan: Number(lan), date: today(), points: [], region: pf.region },
            body: pf.warn + '<div class="hcio-fields">' + pf.html + '</div>' + photoBlock('inPhoto', 'Ảnh Check IN', true)
        });
        if (api.config.pointTable) api.loadPoints(pf.region);
    };
    api.openInStock = function (id) {
        if (state.busy || staleDay()) return;
        try {
            var r = record(id); if (!r.thoigianden || r.thoigianve) return;
            salesReady();
            var list = roundProducts(r);
            var form = { type: 'inStock', id: String(id), point: r.madiemban, products: list, kseq: list.length, cols: { a: 'e' }, add: true, remove: true, catalog: productsFor(r, sales(r)) };
            openPanel({
                title: 'Check IN' + (Number(r.lan) > 1 ? ' · Lần ' + r.lan : '') + ' · Tồn đầu', sub: 'Bước 2/2 · ' + (r.madiemban || '') + ' · Vào ' + clock(r.thoigianden), submit: 'Lưu tồn đầu', form: form,
                body: stockTable(form, { title: 'Tồn đầu', note: 'Bấm ＋ để chọn sản phẩm, chỉ nhập Tồn đầu. Nhập NPP ở “Chỉnh sửa”, Tồn cuối khi Check OUT.' })
            });
            api.calc();
        } catch (e) { notify(e.message, true); }
    };
    api.openSales = function (id) { return api.openEdit(id); };
    function outTitle(r) { return 'Check OUT' + (Number(r.lan) > 1 ? ' · Lần ' + r.lan : ''); }
    api.openOut = function (id) {
        if (state.busy || staleDay()) return;
        var r = record(id); if (!r.thoigianden || r.thoigianve) return;
        try { salesReady(); } catch (e) { return notify(e.message, true); }
        var list = roundProducts(r);
        if (!list.length) return api.openOutPhoto(id);
        var form = { type: 'outStock', id: String(id), point: r.madiemban, products: list, kseq: list.length, cols: { a: 'r', n: 'r', c: 'e' } };
        openPanel({
            title: outTitle(r), sub: 'Bước 1/2 · Xác nhận tồn cuối · ' + (r.madiemban || ''), submit: 'Xác nhận tồn cuối →', out: true, form: form,
            body: stockTable(form, { title: 'Xác nhận tồn cuối', required: true, zero: ZERO_END, note: 'Kiểm đếm hàng còn lại trước khi Check OUT.' })
        });
        api.calc();
    };
    api.openOutPhoto = function (id) {
        if (state.busy || staleDay()) return;
        var r = record(id); if (!r.thoigianden || r.thoigianve) return;
        openPanel({
            title: outTitle(r), sub: (roundProducts(r).length ? 'Bước 2/2 · ' : '') + (r.madiemban || '') + ' · Vào ' + clock(r.thoigianden), submit: 'Check OUT', out: true,
            form: { type: 'out', id: String(id), point: r.madiemban },
            body: '<div class="hcio-fields">' + noteField(r) + '</div>' + photoBlock('outPhoto', 'Ảnh Check OUT', true)
        });
    };
    function stockConfirmed(s) {
        return !s || Object.keys(s.items).every(function (ma) { var x = s.items[ma]; return !(x.a || x.n) || x.c != null; });
    }
    api.openEdit = function (id) {
        if (state.busy || staleDay()) return;
        try {
            var r = record(id); if (!r.thoigianden) fail('Lần này chưa Check IN.');
            salesReady();
            var full = !!r.thoigianve, pf = placeFields(r.makhuvuc || state.nv.makhuvuc, r.madiemban), list = roundProducts(r);
            var form = { type: 'edit', id: String(id), full: full, points: [], prefPoint: r.madiemban, point: r.madiemban, region: pf.region, products: list, kseq: list.length,
                cols: full ? { a: 'e', n: 'e', c: 'e' } : { a: 'e', n: 'e' }, add: true, remove: true, catalog: productsFor(r, sales(r)) };
            openPanel({
                title: 'Chỉnh sửa · Lần ' + r.lan, sub: (r.madiemban || '') + ' · ' + clock(r.thoigianden) + ' → ' + (full ? clock(r.thoigianve) : 'đang trong ca'),
                submit: 'Lưu thay đổi', form: form,
                body: pf.warn + '<div class="hcio-fields">' + pf.html + noteField(r) + '</div>' +
                    stockTable(form, full ? { title: 'Sản lượng ca', required: true, zero: ZERO_END } : { title: 'Tồn đầu · Nhập NPP', note: 'Tồn cuối nhập khi Check OUT.' })
            });
            if (api.config.pointTable) api.loadPoints(pf.region);
            api.calc();
        } catch (e) { notify(e.message, true); }
    };
    api.repairIn = function (id) {
        if (state.busy || staleDay()) return;
        var r = record(id), ph = photoState(r);
        var option = function (kind, label, n, allowed, why) {
            return '<button type="button"' + (allowed ? ' class="need"' : ' disabled') + ' onclick="HrmsCheckInOut.repairOpen(' + js(id) + ',' + js(kind) + ')">' +
                '<span class="ico">' + (n ? '✅' : '📷') + '</span><b>' + label + '</b>' +
                '<small>' + esc(!allowed ? why : n ? 'Đã có ' + n + ' ảnh · bấm để chụp thêm' : 'Chưa có ảnh · bấm để chụp bổ sung') + '</small></button>';
        };
        openPanel({
            title: 'Bổ sung ảnh', sub: 'Lần ' + r.lan + ' · ' + (r.madiemban || '') + ' · Vào ' + clock(r.thoigianden) + (r.thoigianve ? ' · Ra ' + clock(r.thoigianve) : ''),
            form: { type: 'pick', id: String(id) },
            body: '<p>Chọn loại ảnh cần chụp bổ sung. Ảnh Check OUT chỉ bổ sung được sau khi Check OUT.</p><div class="hcio-pick">' +
                option('in', 'Ảnh Check IN', ph.inN, true, '') + option('out', 'Ảnh Check OUT', ph.outN, !!r.thoigianve, 'Chỉ bổ sung sau khi Check OUT') + '</div>'
        });
    };
    api.repairOpen = function (id, kind) {
        if (state.busy) return;
        switchPanel(function () {
            var r = record(id), out = kind === 'out', name = 'Check ' + (out ? 'OUT' : 'IN');
            openPanel({
                title: 'Bổ sung ảnh ' + name, sub: 'Lần ' + r.lan + ' · ' + (r.madiemban || '') + ' · Hiện có ' + photoState(r)[out ? 'outN' : 'inN'] + ' ảnh ' + name,
                submit: 'Lưu ảnh ' + name, out: out,
                form: { type: 'repair', kind: out ? 'out' : 'in', id: String(id), point: r.madiemban },
                body: photoBlock('fixPhoto', 'Ảnh ' + name, true)
            });
        });
    };
    api.showDetails = function (id) {
        if (state.busy) return;
        var r = record(id), s = sales(r), done = !!r.thoigiansanluong, plist = productsFor(r, s), sv = stockOf(s, plist);
        var kv = function (k, v) { return '<div class="hcio-kv"><small>' + esc(k) + '</small><b>' + esc(v) + '</b></div>'; };
        var html = '<div class="hcio-kvs">' + kv('Khu vực', r.makhuvuc ? regionName(r.makhuvuc) : '—') + kv('Điểm bán', r.madiemban || '—') +
            kv('Lần', String(r.lan)) +
            kv('Sản lượng', state.salesErr ? 'Không đọc được' : done ? 'Đã chốt lúc ' + clock(r.thoigiansanluong) : r.thoigianve ? 'Chưa nhập tồn cuối' : hasStock(r) ? 'Đã nhập · chưa chốt' : 'Chưa nhập') +
            kv('Giờ vào', clock(r.thoigianden)) + kv('Giờ ra', r.thoigianve ? clock(r.thoigianve) : '—') + '</div>';
        if (r.ghichu) html += '<div class="hcio-note">' + esc(r.ghichu) + '</div>';
        var body = '', t = { a: 0, n: 0, c: 0, b: 0 };
        plist.forEach(function (p) {
            var x = sv[p.ma], a = x.a, n = x.n, has = x.b != null, b = x.b || 0;
            if (!(a || n || b)) return;
            t.a += a; t.n += n; if (has) { t.c += a + n - b; t.b += b; }
            body += '<tr><th>' + esc(p.ten) + '</th><td>' + a + '</td><td>' + n + '</td><td>' + (has ? a + n - b : '—') + '</td><td>' + (has ? '<b>' + b + '</b>' : '—') + '</td></tr>';
        });
        html += '<div class="hcio-sec">Sản lượng' + (done ? ' · chốt lúc ' + esc(clock(r.thoigiansanluong)) : '') + '</div>';
        html += body
            ? '<table class="hcio-mini"><tr><th>Sản phẩm</th><th>Đầu</th><th>Nhập</th><th>Cuối</th><th>Bán</th></tr>' + body +
                '<tr class="hcio-total"><th>Tổng</th><td>' + t.a + '</td><td>' + t.n + '</td><td>' + t.c + '</td><td>' + t.b + '</td></tr></table>'
            : '<div class="hcio-note">' + (done ? 'Đã chốt với tất cả số lượng = 0 (không tồn, không nhập, không bán).' : 'Chưa có số liệu sản lượng.') + '</div>';
        openPanel({ title: 'Chi tiết · Lần ' + r.lan, body: html, form: { type: 'details', id: String(id) }, submit: r.thoigianden ? '✎ Chỉnh sửa' : null });
    };

    function readPlace(f) {
        var region = f.region !== undefined ? f.region : state.nv.makhuvuc, point;
        if (api.config.pointTable) {
            if (!region) fail('Bạn chưa được gán khu vực. Liên hệ quản trị.');
            point = value('point');
            if (!point || !(f.points || []).some(function (p) { return String(p.madiemban) === point; })) fail('Chọn điểm bán hợp lệ.');
        } else {
            point = value('point').trim();
            if (!point) fail('Nhập điểm bán / địa điểm làm việc.');
        }
        return { region: region, point: point };
    }
    function readNote() { var t = value('note').trim(); if (t.length > 255) fail('Ghi chú tối đa 255 ký tự.'); return t; }
    function checkAccount() {
        if (n$.user.username !== state.login || String(n$.user[api.config.userCodeProp] || '').trim() !== state.user) fail('Tài khoản đã thay đổi. Hãy mở lại chức năng.');
    }
    var SAVE = {
        in: async function (f) {
            var file = getPhoto('inPhoto', 'ảnh Check IN'), id = f.id;
            if (!id) {
                var place = readPlace(f), d = today();
                if (dayKey(d) !== dayKey(f.date)) fail('Đã sang ngày mới. Đóng và mở lại Check IN.');
                var rows = await select('chamcong', { orderby: 'lan', where: whereDay(d) });
                if (nextRound(rows) !== f.lan) fail('Trạng thái chấm công đã thay đổi. Đóng và làm mới để tránh tạo trùng.');
                id = await insertRound(d, f.lan, { makhuvuc: place.region, madiemban: place.point, ca: 0, thoigianden: new Date() });
                f.id = String(id);
                rememberPlace(place);
            }
            var cur = await fresh(id);
            ensureToday(cur);
            if (!cur.thoigianden) fail('Bản ghi không có giờ Check IN.');
            if (!images(cur.hinhanh).length) await savePhoto(id, 'hinhanh', file, 'in:' + id, images(cur.hinhanh));
        },
        inStock: async function (f) {
            var data = readStock(), cur = await fresh(f.id);
            ensureToday(cur);
            if (!cur.thoigianden) fail('Bản ghi chưa Check IN.');
            if (cur.thoigianve) fail('Lần này đã Check OUT. Dùng “Chỉnh sửa” để cập nhật.');
            if (!data.items.length) fail('Chưa thêm sản phẩm nào. Bấm “＋ Thêm sản phẩm”, hoặc đóng form và thêm sau ở “Chỉnh sửa”.');
            await saveSales(f.id, data.items);
        },
        outStock: async function (f) {
            var data = readStock(), cur = await fresh(f.id);
            ensureToday(cur);
            if (!cur.thoigianden || cur.thoigianve) fail('Không thể Check OUT: bản ghi chưa IN hoặc đã OUT.');
            await saveSales(f.id, data.items);
        },
        out: async function (f) {
            var cur = await fresh(f.id);
            var shot = getPhoto('outPhoto', 'ảnh Check OUT', !api.config.requireCheckoutPhotos), note = readNote();
            ensureToday(cur);
            if (!cur.thoigianden || cur.thoigianve) fail('Không thể Check OUT: bản ghi chưa IN hoặc đã OUT.');
            if (!stockConfirmed(await freshSales(f.id))) fail('Chưa xác nhận đủ tồn cuối. Đóng form và bấm Check OUT để nhập lại.');
            var now = new Date(), data = { thoigianve: now, thoigiansanluong: now, ghichu: note };
            if (shot) data.hinhanh2 = JSON.stringify(await upload(f.id, [shot], 'out:' + f.id));
            await update(f.id, data); delete state.uploaded['out:' + f.id];
        },
        edit: async function (f) {
            var data = readStock(), place = readPlace(f), note = readNote(), cur = await fresh(f.id);
            ensureToday(cur);
            if (!cur.thoigianden) fail('Bản ghi chưa Check IN.');
            if (!!cur.thoigianve !== f.full) fail('Trạng thái ca vừa thay đổi (đã Check OUT ở nơi khác). Đóng và mở lại để cập nhật.');
            var upd = { makhuvuc: place.region, madiemban: place.point, ghichu: note };
            if (f.full) upd.thoigiansanluong = new Date();
            await update(f.id, upd);
            await saveSales(f.id, data.items);
        },
        repair: async function (f) {
            var out = f.kind === 'out', column = out ? 'hinhanh2' : 'hinhanh', name = 'Check ' + (out ? 'OUT' : 'IN');
            var file = getPhoto('fixPhoto', 'ảnh ' + name), cur = await fresh(f.id);
            ensureToday(cur);
            if (!cur.thoigianden) fail('Bản ghi chưa Check IN.');
            if (out && !cur.thoigianve) fail('Chưa Check OUT nên chưa bổ sung được ảnh Check OUT.');
            var old = images(cur[column]);
            await savePhoto(f.id, column, file, 'fix' + f.kind + ':' + f.id, old);
            f.total = old.length + 1;
        }
    };
    var SAVED = { in: 'Đã Check IN. Mời nhập tồn đầu.', inStock: 'Đã lưu tồn đầu.', outStock: 'Đã xác nhận tồn cuối. Chụp ảnh để Check OUT.', out: 'Đã Check OUT và chốt sản lượng.', edit: 'Đã cập nhật.', repair: function (f) { return 'Đã bổ sung ảnh Check ' + (f.kind === 'out' ? 'OUT' : 'IN') + '. Hiện có ' + f.total + ' ảnh.'; } };

    api.submit = async function () {
        var f = state.form;
        if (state.busy || !f) return;
        showError('');
        if (f.type === 'details') return switchPanel(function () { api.openEdit(f.id); });
        if (!SAVE[f.type]) return;
        setBusy(true);
        try {
            checkAccount();
            await SAVE[f.type](f);
            setBusy(false); api.cancel();
            notify(typeof SAVED[f.type] === 'function' ? SAVED[f.type](f) : SAVED[f.type]);
            await api.refresh();
            if (f.type === 'outStock') api.openOutPhoto(f.id);
            else if (f.type === 'in') api.openInStock(f.id);
            else if (f.type === 'repair') api.repairIn(f.id);
        } catch (e) {
            setBusy(false);
            showError(e.message + (f.type === 'in' && f.id ? ' Giờ vào đã được lưu; thử lại chỉ bổ sung ảnh, không tạo lần mới.' : ''));
        }
    };

    api.divInOut_onClick = function (elm, lan) { api.openIn(lan); };
    api.divInOut2_onClick = function (elm, id) { api.openOut(id); };
    api.divInOutSL_onClick = function (elm, id) { api.openSales(id); };
    api.divInOut_InfoIn = api.divInOut_InfoOut = api.divInOut_InfoSL = function (elm, id) { api.showDetails(id); };
    return api;
}());