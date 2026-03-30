### API REST de Produtos
**Aluno:** Tiago Heitzmann
**Matrícula:** 202602597586

Trabalho individual da disciplina de Projeto de Ciência de Dados II do professor Cristiano Neto.

#### Como rodar o projeto
1. Instale as dependências com o comando: `npm install`
2. Inicie o servidor com: `npm run dev`

#### Tabela de endpoints
| Verbo | Path | Descrição | Status esperado |
| ------ | ------ | ------ | ------ |
| GET | /api/v1/produtos | Lista todos os produtos | 200 OK |
| GET | /api/v1/produtos/:id | Retorna um produto pelo ID | 200 OK / 404 Not Found |
| POST | /api/v1/produtos | Cria um novo produto | 201 Created / 400 Bad Request |
| PUT | /api/v1/produtos/:id | Atualiza completamente um produto | 200 OK / 404 Not Found |
| DELETE | /api/v1/produtos/:id | Remove um produto | 204 No Content / 404 Not Found |