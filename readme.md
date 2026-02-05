# Desafio Técnico: Multiplayer Chess

Este projeto implementa uma plataforma de Xadrez Multiplayer em tempo real, focando em escalabilidade, arquitetura limpa e resiliência.

## 🚀 Tecnologias e Arquitetura

O projeto foi construído seguindo os princípios de **Clean Architecture** e **SOLID**.

- **Backend:** NestJS (Node.js)
  - **Comunicação:** WebSocket (Socket.io) para eventos em tempo real.
  - **Persistência:** MongoDB (via Mongoose). Utiliza uma estratégia de **Event Sourcing Simplificado** (salva o histórico de movimentos para reconstruir o estado, garantindo integridade).
  - **Core Domain:** Lógica de xadrez pura em TypeScript, desacoplada de frameworks (fácil de testar e portar).
- **Frontend:** Vue.js 3 + Quasar Framework
  - **Gerenciamento de Estado:** Pinia (Store reativa conectada aos eventos do Socket).
  - **Design:** Componentização atômica e responsiva.
- **Infraestrutura:** Docker & Docker Compose.

## 🛠️ Como Rodar

### Pré-requisitos

- Docker & Docker Compose instalados.

### Execução Rápida

O ambiente é totalmente conteinerizado. Para iniciar a aplicação (Banco + Back + Front):

```bash
docker-compose up --build

```

Acesse:

- **Frontend:** http://localhost:9000
- **Backend API:** http://localhost:3000

## 🧪 Testes

A camada de domínio (Core Business Logic) possui cobertura de testes unitários.

```bash
cd backend
npm test

```

## 📐 Decisões de Projeto (ADR)

1. **Domínio Isolado:** A pasta `domain/` não depende do NestJS. Isso permite que as regras do xadrez sejam validadas sem subir o servidor.
2. **Validação Dupla:** O Frontend valida a vez do jogador visualmente (UX), mas o Backend é a fonte da verdade, rejeitando movimentos ilegais ou fora de turno (Segurança).
3. **Persistência de Estado:** Ao atualizar a página, o Backend reidrata o objeto `ChessGame` a partir dos movimentos salvos no Mongo, permitindo que a partida continue de onde parou.

## 🔮 Melhorias Futuras (Roadmap)

- Implementação das peças restantes (Torre, Cavalo, Bispo, Rei, Rainha).
- Detecção de Xeque e Xeque-mate.
- Timer de jogada.

```

```
