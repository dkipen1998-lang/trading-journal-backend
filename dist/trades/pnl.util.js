"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcPnl = calcPnl;
function calcPnl(params) {
    const { side, entryPrice, positionSize, stopLoss, exitPrice } = params;
    if (exitPrice == null || !entryPrice || !positionSize) {
        return { pnl: null, pnlPercent: null, rMultiple: null };
    }
    const normalizedSide = `${side ?? 'long'}`.toLowerCase();
    const dir = normalizedSide === 'short' || normalizedSide === 'sell' ? -1 : 1;
    const pnl = (Number(exitPrice) - Number(entryPrice)) * Number(positionSize) * dir;
    const cost = Number(entryPrice) * Number(positionSize);
    const pnlPercent = cost ? (pnl / cost) * 100 : 0;
    let rMultiple = null;
    if (stopLoss != null && Number(entryPrice) !== Number(stopLoss)) {
        const riskPerUnit = Math.abs(Number(entryPrice) - Number(stopLoss));
        const gainPerUnit = (Number(exitPrice) - Number(entryPrice)) * dir;
        rMultiple = riskPerUnit ? gainPerUnit / riskPerUnit : null;
    }
    return {
        pnl: +pnl.toFixed(2),
        pnlPercent: +pnlPercent.toFixed(2),
        rMultiple: rMultiple != null ? +rMultiple.toFixed(2) : null,
    };
}
//# sourceMappingURL=pnl.util.js.map