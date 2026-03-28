document.addEventListener('DOMContentLoaded', () => {
    const totalInvInput = document.querySelector('input[type="number"][class*="text-4xl"]');
    const rowsContainer = document.querySelector('.space-y-4.mb-12');
    
    function getRows() {
        return document.querySelectorAll('.glass-panel.p-1.rounded-\\[1\\.5rem\\]');
    }

    const resultEls = document.querySelectorAll('.fixed.bottom-8 .font-black');
    if(resultEls.length < 3) return; // Prevent crashes if UI changes
    const lucroLiquidoEl_ = resultEls[0];
    const roiEl_ = resultEls[1];
    const retornoTotalEl_ = resultEls[2];
    
    function parseNumber(str) { return parseFloat(str.replace(/[^0-9.-]+/g,"")) || 0; }
    function formatMoney(num) { return 'R$ ' + num.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
    
    function calculate() {
        let I = parseFloat(totalInvInput.value) || 0;
        let legs = [];
        let rows = getRows();
        
        rows.forEach((row, index) => {
            if (row.parentElement && (row.parentElement.classList.contains('opacity-40') || row.parentElement.classList.contains('opacity-20'))) return;
            
            const inputs = row.querySelectorAll('input[type="number"]');
            if (inputs.length < 2) return;
            
            const oddInput = inputs[0];
            const commInput = inputs[1];
            
            let oddRaw = parseFloat(oddInput.value) || 0;
            let comm = (parseFloat(commInput.value) || 0) / 100;
            
            const selects = row.querySelectorAll('select');
            let boost = 0;
            if (selects.length > 1) {
                let boostText = selects[1].value;
                if (boostText.includes('25')) boost = 0.25;
                if (boostText.includes('30')) boost = 0.30;
                if (boostText.includes('50')) boost = 0.50;
            }
            if (boost > 0 && oddRaw > 1) {
                oddRaw = 1 + (oddRaw - 1) * (1 + boost);
            }
            
            const buttons = row.querySelectorAll('button');
            let isLay = false;
            if (buttons.length > 1 && buttons[1].classList.contains('bg-[#E85B24]')) {
                isLay = true;
            }
            
            const fbToggle = row.querySelector('.material-symbols-outlined.cursor-pointer');
            let isFreebet = fbToggle && fbToggle.textContent === 'toggle_on';
            
            // Outputs
            const outputs = row.querySelectorAll('.text-lg.font-black');
            if(outputs.length < 2) return;
            
            legs.push({
                row, oddRaw, isLay, isFreebet, comm,
                stakeOutput: outputs[0],
                retOutput: outputs[1]
            });
        });
        
        if (legs.length === 0) return;
        
        // Basic Arbitrage Math: Equalize Return (Ret) across all legs.
        // If Back: Ret = Stake * Odd
        // If Lay: Liability = Stake * (Odd - 1). Return (if lay wins, meaning back loses) = Stake * (1 - Comm)
        // This is an approximate robust calculator for demonstration.
        
        let invSumRaw = 0;
        legs.forEach(l => {
            let E = l.oddRaw;
            if (l.isFreebet) E = l.oddRaw - 1;
            if (l.isLay) E = l.oddRaw / (1 - l.comm); 
            if (E > 0) invSumRaw += (1/E);
        });
        
        let ReturnEst = I / invSumRaw;
        let realTotalInv = 0;
        
        legs.forEach(l => {
            let E = l.oddRaw;
            if (l.isFreebet) E = l.oddRaw - 1;
            if (l.isLay) E = l.oddRaw / (1 - l.comm); 
            
            let S = 0;
            if (E > 0) S = ReturnEst / E;
            
            if (l.isLay) {
                let Liab = S * (l.oddRaw - 1);
                l.stakeOutput.textContent = formatMoney(Liab); 
                l.retOutput.textContent = formatMoney(S * (1 - l.comm)); 
                realTotalInv += Liab;
                
                // Update label to reflect Liability
                let label = l.row.querySelector('.uppercase.tracking-widest');
                if(label) label.textContent = 'Responsabilidade';
            } else {
                l.stakeOutput.textContent = formatMoney(S);
                l.retOutput.textContent = formatMoney(S * l.oddRaw);
                if (!l.isFreebet) realTotalInv += S;
                
                let label = l.row.querySelector('.uppercase.tracking-widest');
                if(label) label.textContent = 'Stake Sugerida';
            }
        });
        
        if(realTotalInv > 0) {
            let profit = ReturnEst - realTotalInv;
            let roi = (profit / realTotalInv) * 100;
            lucroLiquidoEl_.textContent = formatMoney(profit);
            roiEl_.textContent = roi.toFixed(2) + '%';
            retornoTotalEl_.textContent = formatMoney(ReturnEst);
        }
    }
    
    // Attach events using event delegation for dynamic rows
    document.body.addEventListener('input', (e) => {
        if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') calculate();
    });
    
    document.body.addEventListener('click', (e) => {
        // Lay/Back toggles
        if (e.target.tagName === 'BUTTON' && (e.target.textContent === 'BACK' || e.target.textContent === 'LAY')) {
            const row = e.target.closest('.glass-panel');
            if (row) {
                const buttons = row.querySelectorAll('button');
                if (buttons.length > 1) {
                    if (e.target.textContent === 'BACK') {
                        buttons[0].className = 'flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-secondary-container text-on-secondary transition-all';
                        buttons[1].className = 'flex-1 py-1.5 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all';
                    } else {
                        buttons[1].className = 'flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-[#E85B24] text-white transition-all';
                        buttons[0].className = 'flex-1 py-1.5 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-on-surface transition-all';
                    }
                    calculate();
                }
            }
        }
        
        // Freebet Toggle
        if (e.target.textContent.includes('toggle_')) {
            e.target.textContent = e.target.textContent === 'toggle_off' ? 'toggle_on' : 'toggle_off';
            e.target.classList.toggle('text-primary-container');
            calculate();
        }
    });

    // Make hidden Add Casa rows clickable
    const hiddenWrappers = document.querySelectorAll('.opacity-40, .opacity-20');
    hiddenWrappers.forEach(hw => {
        hw.addEventListener('click', function activate() {
            hw.removeEventListener('click', activate);
            hw.className = 'transition-opacity duration-300';
            const templateHTML = getRows()[0].outerHTML;
            hw.innerHTML = templateHTML;
            calculate();
        });
    });

    calculate();
});
