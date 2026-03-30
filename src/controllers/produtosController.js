let produtos = [];
let nextId = 1;

const listar = (req, res) => {
    const listar = (req, res) => {
    res.status(200).json(produtos);
};
};

const buscarPorId = (req, res) => {
    // TODO
};

const criar = (req, res) => {
    // TODO
};

const atualizar = (req, res) => {
    // TODO
};

const remover = (req, res) => {
    // TODO
};

module.exports = {
    listar,
    buscarPorId,
    criar,
    atualizar,
    remover
};