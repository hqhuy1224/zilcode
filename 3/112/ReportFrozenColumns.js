// Keep employee identity visible while the remaining report columns scroll.
(function () {
    "use strict";

    var style = document.createElement("style");
    style.textContent = "@media screen {" +
        ".report-frozen-container { width:100%; overflow:auto; max-height:78vh; }" +
        ".report-container .report-sticky-header { position:sticky !important;" +
        "top:var(--report-header-top) !important; z-index:3; }" +
        ".report-container .report-frozen-cell { position:sticky !important;" +
        "left:var(--report-frozen-left) !important; z-index:2 !important;" +
        "background:var(--report-frozen-background) !important; }" +
        ".report-container thead .report-frozen-cell { z-index:5 !important; }" +
        ".report-container .report-frozen-edge { box-shadow:2px 0 0 #777; }" +
        "}" +
        "@media print { .report-frozen-cell, .report-sticky-header {" +
        "position:static !important; left:auto !important; top:auto !important; box-shadow:none !important; } }";
    document.head.appendChild(style);

    function text(cell) {
        return cell.textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ").trim().toLowerCase();
    }

    function background(cell) {
        for (var node = cell; node; node = node.parentElement) {
            var color = window.getComputedStyle(node).backgroundColor;
            if (color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
        }
        return "#fff";
    }

    // Map physical cells to logical columns, including multi-row headers and merged totals.
    function cellsIn(rows) {
        var occupied = [], cells = [];
        Array.prototype.forEach.call(rows, function (row, rowIndex) {
            var col = 0;
            Array.prototype.forEach.call(row.cells, function (cell) {
                while (occupied[col] > rowIndex) col++;
                cells.push({ cell: cell, col: col, row: rowIndex });
                var span = cell.rowSpan || rows.length - rowIndex;
                for (var j = col; j < col + cell.colSpan; j++) occupied[j] = rowIndex + span;
                col += cell.colSpan;
            });
        });
        return cells;
    }

    function freeze(table) {
        if (!table.tHead) return;
        var header;
        var count = Number(table.getAttribute("data-frozen-columns")) || 0;
        Array.prototype.some.call(table.tHead.rows, function (row) {
            if (!row.cells.length || text(row.cells[0]) !== "stt") return false;
            if (count) { header = row; return true; }
            for (var i = 0; i < row.cells.length; i++) {
                count += row.cells[i].colSpan;
                if (/^ho (va )?ten\b/.test(text(row.cells[i]))) {
                    header = row;
                    return true;
                }
            }
            count = 0;
            return false;
        });
        if (!header) return;

        var rows = Array.prototype.slice.call(table.tHead.rows, header.sectionRowIndex);
        var headers = cellsIn(rows);
        var lefts = [];
        // Measure the original column positions even when the user has already scrolled.
        headers.forEach(function (entry) {
            entry.cell.classList.remove("report-frozen-cell", "report-frozen-edge");
        });
        var firstLeft = header.cells[0].getBoundingClientRect().left;
        var top = 0;
        rows.forEach(function (row) {
            Array.prototype.forEach.call(row.cells, function (cell) {
                cell.classList.add("report-sticky-header");
                cell.style.setProperty("--report-header-top", top + "px");
            });
            top += row.getBoundingClientRect().height;
        });
        headers.forEach(function (entry) {
            if (entry.col < count && entry.cell.colSpan === 1) {
                lefts[entry.col] = entry.cell.getBoundingClientRect().left - firstLeft;
            }
        });
        lefts[0] = 0;
        if (lefts.slice(0, count).filter(function (v) { return v !== undefined; }).length !== count) return;

        function apply(cell, col) {
            var end = col + cell.colSpan;
            // Leave merged totals/signatures that cross the frozen boundary alone.
            if (col >= count || end > count) return;
            if (!cell.classList.contains("report-frozen-cell")) {
                cell.style.setProperty("--report-frozen-background", background(cell));
                cell.classList.add("report-frozen-cell");
            }
            cell.style.setProperty("--report-frozen-left", lefts[col] + "px");
            cell.classList.toggle("report-frozen-edge", end === count);
        }

        headers.forEach(function (entry) { apply(entry.cell, entry.col); });
        Array.prototype.forEach.call(table.tBodies, function (body) {
            cellsIn(body.rows).forEach(function (entry) {
                apply(entry.cell, entry.col);
            });
        });
    }

    function init() {
        document.querySelectorAll(".report-container table").forEach(function (table) {
            table.closest(".report-container").classList.add("report-frozen-container");
            var pending = false;
            function schedule() {
                if (pending) return;
                pending = true;
                window.requestAnimationFrame(function () {
                    pending = false;
                    freeze(table);
                });
            }
            // Report data is populated by the opener after the template has loaded.
            new MutationObserver(schedule).observe(table, { childList: true, subtree: true });
            if (window.ResizeObserver) new ResizeObserver(schedule).observe(table);
            window.addEventListener("resize", schedule);
            schedule();
        });
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
