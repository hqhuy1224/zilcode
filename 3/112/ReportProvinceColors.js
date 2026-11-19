// Shared, deterministic province colors across HABECO reports.
(function () {
    "use strict";
    function key(value) {
        return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/gi, "d").toLowerCase().replace(/\b(tinh|thanh pho|tp)\b/g, "")
            .replace(/[^a-z0-9]/g, "");
    }
    function color(value) {
        var name = key(value);
        if (!name) return "";
        var hash = 2166136261;
        for (var i = 0; i < name.length; i++) hash = Math.imul(hash ^ name.charCodeAt(i), 16777619);
        hash >>>= 0;
        // Pastel RGB keeps black text legible and exports directly to Excel.
        return "#" + [0, 8, 16].map(function (shift) {
            return (205 + ((hash >>> shift) & 255) % 46).toString(16);
        }).join("");
    }
    function paint() {
        document.querySelectorAll("[data-report-province]").forEach(function (row) {
            var background = color(row.getAttribute("data-report-province"));
            if (!background) return;
            var count = Number(row.getAttribute("data-province-columns"));
            var cells = count ? Array.prototype.slice.call(row.cells, 0, count)
                : row.querySelectorAll("tr.info td.val, tr.info td.rightline");
            Array.prototype.forEach.call(cells, function (cell) {
                if (cell.getAttribute("data-province-color") === background) return;
                cell.setAttribute("data-province-color", background);
                cell.style.setProperty("background-color", background, "important");
                cell.style.setProperty("--report-frozen-background", background);
            });
        });
    }
    window.ReportProvinceColors = { key: key, color: color, paint: paint };
    function init() {
        paint();
        new MutationObserver(paint).observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();