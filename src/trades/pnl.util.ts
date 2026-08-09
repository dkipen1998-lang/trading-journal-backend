// backend file
// Mirrors calcPnl() from the frontend so stored numbers always match what
// the UI would compute, unless the user has typed a manual override.
export function calcPnl(params: {
  side: 'long' | 'short';
  entryPrice: number;
  positionSize: number | null | undefined;
  stopLoss: number | null | undefined;
  exitPrice: number | null | undefined;
}): { pnl: number | null; pnlPercent: number | null; rMultiple: number | null } {
  const { side, entryPrice, positionSize, stopLoss, exitPrice } = params;

  if (exitPrice == null || !entryPrice || !positionSize) {
    return { pnl: null, pnlPercent: null, rMultiple: null };
  }

  const normalizedSide = `${side ?? 'long'}`.toLowerCase();
  const dir = normalizedSide === 'short' || normalizedSide === 'sell' ? -1 : 1;
  const pnl = (Number(exitPrice) - Number(entryPrice)) * Number(positionSize) * dir;
  const cost = Number(entryPrice) * Number(positionSize);
  const pnlPercent = cost ? (pnl / cost) * 100 : 0;

  let rMultiple: number | null = null;
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

