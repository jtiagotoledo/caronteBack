const express = require('express');
const api = express();
const PORT = 5000;

api.get('/',(res,req)=>{
    res.send('Servidor Caronte rodando!');
});

api.listen(PORT,()=>{
    console.log(`Servidor Caronte rodando na porta ${PORT}`);
});