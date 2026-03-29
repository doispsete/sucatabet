
function getEffectiveOdds(opType, betType, odds) {
  let rawO = odds;
  if (betType === 'Aumento') {
    if (opType === 'BOOST_25') return (rawO - 1) * 1.25 + 1;
    if (opType === 'BOOST_50') return (rawO - 1) * 1.50 + 1;
  }
  return rawO;
}

function calculatePayout(bet, opType) {
  const oo = getEffectiveOdds(opType, bet.type, bet.odds);
  const os = bet.stake;
  const oc = (bet.commission || 0) / 100;
  const cost = bet.cost || 0;
  const isF = bet.type === 'Freebet' || bet.isBenefit;

  if (bet.side === 'BACK') {
    if (isF) {
      // Freebet: (Stake * (Odd - 1)) * (1 - Comm)
      return (os * (oo - 1)) * (1 - oc);
    } else {
      // Normal: Stake + (Stake * (Odd - 1)) * (1 - Comm)
      return os + (os * oo - os) * (1 - oc);
    }
  } else {
    // LAY: Liability (cost) + Stake * (1 - Comm)
    return cost + (os * (1 - oc));
  }
}

const testCases = [
  {
    name: "Normal BACK - Sem Comissão",
    opType: 'NORMAL',
    bet: { side: 'BACK', type: 'Normal', odds: 2.0, stake: 100, cost: 100, commission: 0 },
    expectedPayout: 200
  },
  {
    name: "Freebet BACK - Sem Comissão",
    opType: 'NORMAL',
    bet: { side: 'BACK', type: 'Freebet', odds: 2.0, stake: 100, cost: 0, commission: 0 },
    expectedPayout: 100
  },
  {
    name: "LAY - Comissão 5%",
    opType: 'NORMAL',
    bet: { side: 'LAY', type: 'Normal', odds: 2.0, stake: 100, cost: 100, commission: 5 },
    expectedPayout: 195
  },
  {
    name: "Aumento 25% - Odd 2.0",
    opType: 'BOOST_25',
    bet: { side: 'BACK', type: 'Aumento', odds: 2.0, stake: 100, cost: 100, commission: 0 },
    expectedPayout: 225
  }
];

console.log("=== VERIFICAÇÃO DE CÁLCULOS SUCATABET ===");
let allPass = true;
testCases.forEach(tc => {
  const payout = calculatePayout(tc.bet, tc.opType);
  const pass = Math.abs(payout - tc.expectedPayout) < 0.0001;
  console.log(`${pass ? '✅' : '❌'} ${tc.name}`);
  console.log(`   Esperado: ${tc.expectedPayout} | Calculado: ${payout}`);
  if (!pass) allPass = false;
});

if (!allPass) process.exit(1);
