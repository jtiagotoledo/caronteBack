const express = require('express');
const path = require('path');
const YahooFinance = require('yahoo-finance2').default;
const api = express();
const PORT = 5000;

const yFinance = new YahooFinance();

api.use('/api/logos', express.static(path.join(__dirname, 'public/logos')));

api.get('/api', (req, res) => {
    res.send('Servidor Caronte rodando!');
});

api.get('/api/cotacao/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const resultado = await yFinance.quote(ticker);
        if (!resultado) {
            return res.status(404).json({ error: 'Ativo não encontrado' });
        }
        res.json({
            ticker: resultado.symbol,
            nome: resultado.longName || resultado.shortName,
            preco: resultado.regularMarketPrice,
            variacaoPercentual: resultado.regularMarketChangePercent,
            variacao: resultado.regularMarketChange,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

api.get('/api/pesquisa/:search', async (req, res) => {
    try {
        const termoOriginal = req.params.search.toUpperCase().trim();
        const termoComSa = req.params.search.endsWith('.SA') ? termoComSa : `${termoComSa}.SA`;

        const [resultadoOriginal, resultadoSa] = await Promise.all([
            yFinance.search(termoOriginal).catch(() => null),
            yFinance.search(termoComSa).catch(() => null)
        ])

        const quotesOriginal = resultadoOriginal?.quotes || [];
        const quotesSa = resultadoSa?.quotes || [];

        const mapaAtivos = new Map();

        quotesSa.forEach(ativo => {
            if (ativo && ativo.symbol) {
                mapaAtivos.set(ativo.symbol, ativo);
            }
        });

        quotesOriginal.forEach(ativo => {
            if (ativo && ativo.symbol && !mapaAtivos.has(ativo.symbol)) {
                mapaAtivos.set(ativo.symbol, ativo);
            }
        });

        const todosAtivos = Array.from(mapaAtivos.values());

        if (todosAtivos.length === 0) {
            return res.status(404).json({ error: 'A pesquisa não retornou nada!' });
        }

        const ativosFormat = todosAtivos.map(ativo => ({
            nome: ativo.longName || ativo.shortName || ativo.name || 'Nome não disponével',
            ticker: ativo.symbol
        }));

        res.json({ ativosFormat });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

api.get('/api/buscaLogo/:ticker', async (req, res) => {
    try {
        const ticker = req.params.ticker.toUpperCase();
        const sumary = await yFinance.quoteSummary(ticker, { modules: ['summaryProfile'] });
        if (!sumary || !sumary.summaryProfile) {
            return res.status(404).json({ error: 'Não foi encontrado os dados do ticker' });
        }
        const website = sumary.summaryProfile.website;
        res.json({
            site: website || 'Site não informado'
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

api.listen(PORT, () => {
    console.log(`Servidor Caronte rodando na porta ${PORT}`);
});