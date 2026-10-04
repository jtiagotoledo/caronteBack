const express = require('express');
const YahooFinance = require('yahoo-finance2').default;
const api = express();
const PORT = 5000;

const yFinance = new YahooFinance();

api.get('/api',(req,res)=>{
    res.send('Servidor Caronte rodando!');
});

api.get('/api/cotacao/:ticker',async(req,res)=>{
    try{
        const ticker = req.params.ticker.toUpperCase();
        const resultado = await yFinance.quote(ticker);
        if(!resultado){
            return res.status(404).json({error:'Ativo não encontrado'});
        }
        res.json({
            ticker: resultado.symbol,
            price: resultado.regularMarketPrice,
            currency: resultado.currency,
            name: resultado.longName||resultado.shortName,
        })
    }catch(error){
        console.error(error);
        res.status(500).json({error: error.message});
    }
})

api.get('/api/pesquisa/:search', async(req,res)=>{
    try{
        const search = req.params.search.toUpperCase();
        const resultado = await yFinance.search(search);
        if(!resultado){
            return res.status(404).json({error:'A pesquisa não restornou nada!'});
        }
        res.json({
            pesquisa: resultado.quotes
        })
    }catch(error){
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

api.get('/api/buscaLogo/:ticker', async(req,res)=>{
    try{
        const ticker = req.params.search.toUpperCase();
        const sumary = await yFinance.quoteSummary(ticker, {modules:['summaryProfile']});
        const website = resultado.sumary.website;
        if(!sumary){
            return res.status(404).json({error:'Não foi encontrado os dados do ticker'});
        }
        res.json({
            site: website
        })
    }catch(error){
        console.error(error);
        res.status(500).json({error: error.message});
    }
})

api.listen(PORT,()=>{
    console.log(`Servidor Caronte rodando na porta ${PORT}`);
});