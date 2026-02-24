
# ♟️ ChessClub Multiplayer

Um jogo de Xadrez Multiplayer em tempo real desenvolvido com **Vue 3** e **NestJS**, utilizando **WebSockets** para comunicação instantânea e **MongoDB** para persistência de partidas. O projeto implementa regras oficiais da FIDE, incluindo movimentos especiais como Roque, En Passant e Promoção de Peão.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando uma arquitetura moderna e escalável:

### Frontend
- **Framework:** Vue.js 3 (Composition API + Script Setup)
- **Linguagem:** TypeScript
- **Gerenciamento de Estado:** Pinia
- **UI Framework:** Quasar Framework
- **Estilização:** SCSS / Flexbox

### Backend
- **Framework:** NestJS
- **Linguagem:** TypeScript
- **Comunicação em Tempo Real:** Socket.IO (WebSockets)
- **Banco de Dados:** MongoDB (via Mongoose)
- **Validação:** Lógica de domínio pura (Domain-Driven Design - DDD)

### Infraestrutura
- **Containerização:** Docker & Docker Compose
- **Ambiente:** Node.js 18+

---

## ✨ Funcionalidades

- **Multiplayer em Tempo Real:** Movimentos sincronizados instantaneamente entre jogadores.
- **Sistema de Salas:** Crie ou entre em salas privadas usando um ID único.
- **Validação de Regras (Server-Side):** O backend é a autoridade máxima, impedindo movimentos ilegais.
- **Movimentos Especiais:**
  - ✅ Roque (Castling)
  - ✅ En Passant
  - ✅ Promoção de Peão (Com modal de escolha de peça)
- **Persistência de Jogo:** O estado atual do tabuleiro é armazenado.
- **Histórico de Movimentos:** Visualização passo a passo da partida (Notação Algébrica).
- **Feedback Visual:** Highlight da última jogada, peças capturadas e indicação de xeque/xeque-mate.
- **Responsividade:** Interface adaptável para diferentes tamanhos de tela.

---

## ⚙️ Configuração de Ambiente (.env)

Para que o projeto rode corretamente via Docker (evitando erros de conexão com o Banco ou porta indefinida), é **obrigatório** criar um arquivo de variáveis de ambiente na raiz do projeto.

1. Crie um arquivo chamado `.env` na **raiz do projeto** (na mesma pasta do `docker-compose.yml`).
2. Cole o seguinte conteúdo:

```env
# Porta do Servidor Backend
PORT=3000

# Conexão com o MongoDB (uso interno do Docker)
MONGO_URI=mongodb://mongo:27017/chess

# Configuração de CORS (Permitir acesso do Frontend)
FRONTEND_URL=*

```

> **Nota:** O Docker Compose lê automaticamente este arquivo para configurar os containers. Sem ele, o backend falhará ao iniciar.

---

## 🐳 Como Rodar (Docker)

O projeto está configurado para compilar e rodar automaticamente, sem necessidade de instalar Node.js na sua máquina local.

1. Certifique-se de ter o **Docker** e **Docker Compose** instalados.
2. Na raiz do projeto, execute:

```bash
docker-compose up --build

```

> **O que este comando faz?**
> 1. Cria os containers do Mongo, Backend e Frontend.
> 2. Instala as dependências automaticamente.
> 3. Compila o código TypeScript.
> 4. Inicia os servidores.
> 
> 

### Acessando a Aplicação:

* **Frontend (Jogo):** [http://localhost:9000](http://localhost:9000)
* **Backend (API/Socket):** [http://localhost:3000](http://localhost:3000)

---

## 🎮 Como Jogar

1. Abra o navegador em `http://localhost:9000`.
2. **Jogador 1:** Digite seu Nome e um Nome para a Sala (ex: `sala1`) e clique em "Entrar". Você será as peças **Brancas**.
3. **Jogador 2:** Em outra aba (ou outro computador na mesma rede), digite o Nome e o **mesmo Nome da Sala** (`sala1`). Você será as peças **Pretas**.
4. O jogo começa automaticamente!
5. Arraste e solte as peças para jogar.

---

## 📂 Estrutura do Projeto

```
/
├── backend/            # API NestJS e Lógica de Domínio (Regras do Xadrez)
│   ├── src/
│   │   ├── domain/     # Core Business Logic (Peças, Tabuleiro, Validações)
│   │   ├── modules/    # Módulos NestJS (Gateway, Service, Controller)
│   │   └── ...
│   └── Dockerfile
│
├── frontend/           # Aplicação Vue 3 + Quasar
│   ├── src/
│   │   ├── components/ # Componentes (Tabuleiro, Peças)
│   │   ├── pages/      # Páginas (Login, Jogo)
│   │   ├── stores/     # Gerenciamento de Estado (Pinia)
│   │   └── services/   # Comunicação com Socket.IO
│   └── Dockerfile
│
├── docker-compose.yml  # Orquestração dos containers
└── README.md           # Documentação

```

---

## 🛠️ Próximos Passos (Roadmap)

Funcionalidades planejadas para futuras versões:

* [ ] Adicionar Relógio de Xadrez (Timer com contagem regressiva).
* [ ] Implementar Chat na sala de jogo.
* [ ] Melhorar suporte a reconexão em redes instáveis.

---

## 📄 Licença

Este projeto é para fins educacionais e de portfólio.
