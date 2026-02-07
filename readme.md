# ♟️ Multiplayer Chess Challenge (NestJS + Vue 3)

Projeto desenvolvido para o desafio técnico de Full Stack Developer.
Implementa um jogo de xadrez em tempo real com validação server-side autoritativa, persistência de estado e interface reativa.

## 🚀 Como Rodar

Basta um comando para subir toda a stack (Banco, Back e Front):

```bash
docker-compose up --build
Acesse:

Frontend: http://localhost:9000

Backend API: http://localhost:3000
```

## 🏗️ Arquitetura e Decisões Técnicas

### 1. Backend: The Source of Truth (NestJS)

A lógica do jogo reside inteiramente no servidor para evitar trapaças.

- Core Domain: A pasta domain/chess contém a lógica pura do xadrez (movimentos, xeque, roque), desacoplada do framework NestJS. Isso facilita testes unitários e portabilidade.

- Persistência Inteligente: O estado do jogo é salvo como uma lista de movimentos (moves) no MongoDB. A cada carregamento, utilizamos o padrão Event Sourcing (Lite) para "reidratar" a partida (ChessGame.restore()). Isso garante integridade histórica e permite auditoria.

- Concurrency: O uso de Socket.IO com salas (rooms) isola as partidas perfeitamente.

### 2. Frontend: Reactive UX (Quasar + Pinia)

- Pinia Store: Centraliza o estado. A UI é "burra": ela apenas reflete o estado da Store e despacha intenções (makeMove).

- Socket Service: Um wrapper singleton encapsula a lógica do socket.io-client.

## 🌟 Funcionalidades Entregues

✅ MVP Completo: Movimentação, turnos, capturas e validação de Xeque.

✅ Regras Avançadas: Roque (Castling), En Passant e Promoção de Peão (com escolha de peça).

✅ Detecção de Fim de Jogo: Xeque-mate e Afogamento (Stalemate).

✅ Resiliência: Se o servidor reiniciar ou o usuário der F5, o jogo é restaurado exatamente de onde parou.

✅ Modo Espectador: Terceiros podem entrar na sala apenas para assistir.

## 🧪 Testes

Testes unitários cobrem as regras críticas de movimentação.

```bash
Bash
cd backend && npm test
```
