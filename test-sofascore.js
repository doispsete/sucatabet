const fetch = require('node-fetch');

const baseUrl = 'https://api.sofascore.com/api/v1';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

async function testSearch(term, date) {
    console.log(`Buscando term="${term}" na data=${date}...`);
    try {
        const url = `${baseUrl}/sport/football/scheduled-events/${date}`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': userAgent,
                'Accept': 'application/json',
            },
        });

        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            console.log('Erro na resposta');
            return;
        }

        const data = await response.json();
        console.log(`Total de eventos recebidos: ${data.events ? data.events.length : 0}`);
        
        if (data.events) {
            const searchTerm = term.toLowerCase();
            const filtered = data.events.filter(event => 
                event.homeTeam.name.toLowerCase().includes(searchTerm) || 
                event.awayTeam.name.toLowerCase().includes(searchTerm)
            );
            console.log(`Eventos filtrados: ${filtered.length}`);
            filtered.forEach(e => {
                console.log(`- ${e.homeTeam.name} vs ${e.awayTeam.name} (ID: ${e.id}) [${e.status.type}]`);
            });
        }
    } catch (error) {
        console.error('Falha:', error.message);
    }
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dateStr = tomorrow.toISOString().split('T')[0];

testSearch('chelsea', dateStr);
