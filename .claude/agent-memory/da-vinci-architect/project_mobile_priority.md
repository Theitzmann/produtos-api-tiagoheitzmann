---
name: Prioridade Mobile — Ordens de Serviço
description: A prioridade do cliente é otimizar o fluxo mobile de OS para envio a funcionários de campo, incluindo link público e WhatsApp
type: project
---

A prioridade declarada em 2026-03-26 é otimizar a experiência mobile do sistema, com foco central no fluxo de Ordens de Serviço (Servico). O caso de uso principal é: gerente cria OS no dashboard e precisa enviá-la facilmente para o funcionário de campo (operador/motorista) via WhatsApp ou link público, sem que o funcionário precise ter login no sistema.

**Why:** Funcionários de campo operam em canteiro de obras com celular; precisam receber OS de forma rápida e legível sem fricção de autenticação.

**How to apply:** Qualquer design de OS deve incluir: (1) rota pública `/os/[token]` sem auth, (2) botão de compartilhamento WhatsApp nativo, (3) layout mobile-first da visualização da OS.

Problemas identificados no estado atual:
- Tabela de serviços com 7 colunas — ilegível em mobile
- Modal de criação de OS com muitos campos em scroll vertical sem segmentação clara por step
- Botão de menu mobile (hamburger) posicionado em bottom-right conflita com toast
- generateOsText() está duplicado em dashboard/page.tsx e servicos/page.tsx
- Nenhuma rota pública de OS existe — compartilhamento só via clipboard (texto bruto)
- data-table sem responsividade — overflow-x horizontal em telas pequenas é inviável para tabelas de 7 colunas
