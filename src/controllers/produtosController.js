let produtos = [];
let nextId = 1;

const listar = (req, res) => {
    const listar = (req, res) => {
    res.status(200).json(produtos);
};
};

const buscarPorId = (req, res) => {
    const buscarPorId = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.status(200).json(produto);
};
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