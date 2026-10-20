# BlenderPDS

Editor de modelagem 3D no navegador com edição colaborativa em tempo real. O front é uma SPA em React + three.js; o backend em Spring Boot guarda usuários, amigos e sessões, sequencia as operações e retransmite o que cada participante ainda não tem.

Projeto da disciplina **Projeto Detalhado de Software — Grupo 03**.

## Funcionalidades

**Modelagem**

- Primitivas: cubo, cilindro, toro, esfera e cápsula.
- Gizmo de transformação: mover (`G`), rotacionar (`R`) e escalar (`C`).
- Modo de edição de malha (`Tab`): seleção de vértices, arestas e faces; faces coplanares são selecionadas em conjunto.
- Extrude (`E`) e divisão de aresta (`P`).
- Cor do objeto pelo seletor de cores.
- Importação de `.obj` e exportação da cena em `.obj`.
- Desfazer/refazer (`Z`/`Y`) por comando.

**Colaboração**

- Sessão hospedada com código compartilhável; entrada por código ou pela lista de amigos.
- Operações replicadas em CRDT (relógio de Lamport + registradores LWW): a ordem de chegada não muda o resultado.
- Reconexão com troca de version vectors: cada lado envia só o que falta.
- Presença e trava de seleção (avisa quando outro jogador já selecionou o objeto).
- Chat da sessão e timeline das edições com scrubber.
- Snapshot periódico da cena para inspecionar a sessão; o log continua sendo a fonte de verdade e a reabertura ainda o replica.

**Contas e amigos**

- Cadastro com confirmação por e-mail e login por sessão (cookie `JSESSIONID`).
- Pedidos de amizade; só amigos do host entram na sessão.

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React 19, TypeScript 7, Vite 8, three.js 0.161, React Router 7 |
| Backend | Java 21, Spring Boot 4.1.1 (Web MVC, Security, Data JPA, WebSocket, Mail), Maven |
| Dados | PostgreSQL 16 (Docker Compose) |
| E-mail (dev) | Mailpit — interface em `http://localhost:8025` |
| Testes | JUnit + Spring Boot Test no backend |

## Estrutura do repositório

```
PDS/
├── backend/blenderpds/
│   ├── src/main/java/com/grupo03/blenderpds/
│   │   ├── config/         # segurança, WebSocket, auditoria
│   │   ├── controller/     # REST: auth, users, friends, sessions
│   │   ├── service/        # regras de negócio
│   │   ├── websocket/      # handshake, conexões, validação e relay de operações
│   │   ├── model/          # entidades JPA
│   │   └── repository/     # Spring Data
│   ├── src/test/java/      # testes de controller, service, modelo e WebSocket
│   └── compose.yaml        # Postgres 16 + Mailpit
└── frontend/
    ├── src/api/            # cliente REST (sessão + CSRF)
    ├── src/collab/         # CRDT: operações, log, estado, sync, presença
    ├── src/core/           # Engine (composition root), EventBus, controllers
    ├── src/entity/         # malha half-edge, modos e navegação
    ├── src/manager/        # cena, câmera, seleção, ferramentas, comandos, input
    ├── src/network/        # Transport, WebSocketTransport e WebRTC
    ├── src/tool/           # ferramentas
    ├── src/command/        # comandos com undo
    ├── src/react/          # viewport e UI (lobby, toolbar, chat, timeline)
    └── docs/               # arquitetura e protocolo
```

## Como rodar (desenvolvimento)

Pré-requisitos:

- Node.js `^20.19` ou `>=22.12` (o projeto foi desenvolvido com Node 22).
- JDK 21 no `PATH` (ou `JAVA_HOME` apontando para ele — o `./mvnw` exige um dos dois).
- Docker em execução (o backend sobe Postgres e Mailpit pelo `compose.yaml`).

**1. Backend**

```bash
cd backend/blenderpds
./mvnw spring-boot:run
```

O Spring Boot Docker Compose inicia o Postgres e o Mailpit automaticamente. A API fica em `http://localhost:8080` e o painel de e-mails em `http://localhost:8025`.

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite faz proxy de `/api` e `/ws` para o backend, então o navegador enxerga uma única origem — é isso que mantém o cookie de sessão válido também no handshake do WebSocket.

**3. Primeiro acesso**

Crie uma conta na tela de registro. O login só é liberado depois de confirmar o e-mail: abra o Mailpit em `http://localhost:8025`, clique no link de confirmação e volte ao app.

O modo **Offline** do lobby abre o editor sem sessão; as edições ficam só naquele navegador.

## Variáveis de ambiente

Backend (todas opcionais em desenvolvimento, com os padrões abaixo):

| Variável | Padrão | Para que serve |
|---|---|---|
| `MAIL_HOST` / `MAIL_PORT` | `localhost` / `1025` | Servidor SMTP (Mailpit no dev) |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | vazio | Credenciais SMTP, se houver |
| `MAIL_SMTP_AUTH` / `MAIL_SMTP_STARTTLS` | `false` | Ajustes de TLS/autenticação do SMTP |
| `MAIL_FROM` | `no-reply@blenderpds.local` | Remetente dos e-mails |
| `APP_BASE_URL` | `http://localhost:8080` | Base do link de confirmação |
| `WS_ALLOWED_ORIGINS` | `http://localhost:5173`, `http://127.0.0.1:5173`, `http://*:5173` | Origens aceitas no handshake do WebSocket |

Frontend:

| Variável | Padrão | Para que serve |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080` | Destino do proxy do Vite; em produção o app chama a mesma origem |

## API e protocolo

O REST cobre o que acontece antes e depois da sessão: autenticação (`/auth/login`, `/auth/logout`, `/auth/csrf`), usuários (`/users`, confirmação de e-mail), amigos (`/users/{id}/friends` e os pedidos em `/users/{id}/friend-requests`) e salas (`/sessions`, `/sessions/{id}/join`, `/sessions/{id}/leave`, `/sessions/{id}/end`, `/sessions/{id}/participants`, `/sessions/friends/{userId}`).

As mutações exigem o token CSRF entregue por `GET /auth/csrf`, ecoado no header que o próprio endpoint informa. As operações colaborativas **não** passam pelo REST: elas viajam como JSON por `ws://<origem>/ws/sessions/{id}` (em dev o Vite encaminha `/ws` para o backend), e o servidor apenas valida o formato, ordena (`seq`) e guarda — o merge é do cliente.

Detalhes do protocolo, do modelo de dados e das regras de entrada em [`frontend/docs/session-backend.md`](frontend/docs/session-backend.md).

## Build e testes

Frontend:

```bash
cd frontend
npm run build     # tsc (strict) + vite build
npm run preview   # serve o build de produção
```

O front ainda não tem runner de testes configurado; a verificação automática é o typecheck do `build`.

Backend:

```bash
cd backend/blenderpds
./mvnw test
```

Os testes usam o Postgres do `compose.yaml` (e o Mailpit no teste de confirmação), então o Docker precisa estar rodando.

## Documentação

- [`frontend/docs/architecture.md`](frontend/docs/architecture.md) — diagramas de classe do engine, ferramentas, comandos, modos e rede.
- [`frontend/docs/crdt-architecture.md`](frontend/docs/crdt-architecture.md) — modelo de operações, regras de conflito e ordem de implementação do CRDT.
- [`frontend/docs/session-backend.md`](frontend/docs/session-backend.md) — sessões no servidor, protocolo WebSocket, autenticação e limites.
- [`frontend/backlog.md`](frontend/backlog.md) — o que falta para as próximas sprints.

## Limitações conhecidas

- O registro de conexões WebSocket vive na memória: uma instância do backend. Escalar horizontalmente exige um broker.
- `scene_snapshot` é uma desnormalização; reabrir uma sessão ainda replica o log (não há `fromSnapshot`).
- Amigos aparecem como “hospedando” ou offline — não existe presença de “online” sem sessão.
- Modelos `.obj` importados são locais: não entram no log, não sincronizam e não têm undo.
- Extrude/split concorrentes na mesma malha não têm merge de topologia; a trava de seleção é consultiva.
- O front não tem testes automatizados.
