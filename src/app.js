const express = require('express');
const app = express();
const produtosRouter = require('./routes/produtos');

// Middleware para interpretar JSON no corpo das requisições
app.use(express.json());

// Middleware de log simples (método, rota e timestamp)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Registrando as rotas da nossa API
app.use('/api/v1/produtos', produtosRouter);

// Middleware de erro global
app.use((err, req, res, next) => {
    res.status(500).json({ erro: err.message });
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});