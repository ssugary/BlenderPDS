# BlenderPDS → `collab3d`

Editor 3D colaborativo em navegador (React + three.js) sobre um framework de colaboração
(`collab3d`) e um backend Spring Boot. É o projeto da disciplina **Projeto Detalhado de
Software — Grupo 03**.

O repositório é um monorepo com dois lados:

| Lado | Onde | O quê |
|---|---|---|
| Backend | `framework/backend-starter` + `apps/design-editor/backend` | Framework (`dev.collab3d:collab3d-spring-boot-starter`) e a aplicação do editor |
| Frontend | `framework/core` + `framework/react-kit` + `apps/design-editor/web` | Framework de colaboração 3D, componentes React e o app do editor |

## Requisitos

- **Docker** rodando (o backend sobe Postgres 16 e Mailpit pelo `compose.yaml` da raiz).
- **Java 21** (`java -version`; `JAVA_HOME` ou `PATH`).
- **Node.js 22** (`node -v`; o projeto pede `^20.19` ou `>=22.12`).

## Rodando localmente

### Configuração (obrigatória)

O Postgres do `compose.yaml` não tem senha embutida: ela vem de `POSTGRES_PASSWORD`.
Copie o exemplo e escolha uma senha antes de subir qualquer coisa (o `spring-boot-docker-compose`
e o CI usam a mesma variável):

```bash
cp .env.example .env
# edite .env e defina POSTGRES_PASSWORD=...
```

O `.env` é ignorado pelo git; o `.env.example` é versionado. Sem a variável, o Compose
recusa subir (`POSTGRES_PASSWORD is required`) — isso é intencional.

### Backend

O backend é multi-módulo: o app depende do `collab3d-spring-boot-starter`. Há dois caminhos:

```bash
# Opção A (direto, sem instalar nada no ~/.m2 antes):
./mvnw -pl apps/design-editor/backend spring-boot:run

# Opção B (instala o framework e depois roda o app):
./mvnw -q -DskipTests install -pl framework/backend-starter -am
./mvnw -pl apps/design-editor/backend spring-boot:run
```

Na primeira execução, o Spring Boot Docker Compose sobe o Postgres e o Mailpit. A API fica em
`http://localhost:8080` e a caixa de e-mail de desenvolvimento em `http://localhost:8025`.

### Frontend

```bash
npm install                       # na raiz: instala todos os workspaces
npm run dev -w blenderpds         # http://localhost:5173
```

O Vite faz proxy de `/api` e `/ws` para `http://localhost:8080` (ou `BACKEND_URL`), então o
navegador enxerga uma origem só — é isso que mantém o cookie de sessão válido também no upgrade
do WebSocket.

### Primeiro acesso

Crie a conta na tela de cadastro. O login só libera depois da confirmação de e-mail: abra o
Mailpit em `http://localhost:8025`, clique no link e volte ao app. O modo **Offline** do lobby
abre o editor sem sessão (as edições ficam só naquele navegador).

## Estrutura

```text
.
├── framework/
│   ├── backend-starter/     # framework Java: usuários, salas, WS, sequenciador, SPI
│   ├── core/                # @collab3d/core: CRDT, sync, presença, cena, createCollabApp
│   └── react-kit/           # @collab3d/react-kit: lobby, social, chat, toast
├── apps/design-editor/
│   ├── backend/             # aplicação Spring Boot + os kinds do editor
│   └── web/                 # app React/three.js (workspace npm `blenderpds`)
├── contracts/design-editor/ # casos de contrato de kind (JUnit + Vitest)
├── docs/                    # arquitetura versionada, notas de refatoração, protocolo
└── compose.yaml             # Postgres + Mailpit
```

## Build e testes

Frontend (da raiz):

```bash
npm run build -w @collab3d/core
npm run build -w @collab3d/react-kit
npm run build -w blenderpds
npm test -w @collab3d/core
npm test -w blenderpds
npm run check-boundaries          # framework não importa apps (madge)
```

Backend (da raiz, com Docker ativo):

```bash
./mvnw test
```

## API e protocolo

O REST cobre autenticação (`/auth/*`), usuários (`/users`), amizades
(`/users/{id}/friend-requests`, `/users/{id}/friends`) e salas (`/sessions` e as rotas de
entrada/saída/participantes). As mutações exigem o token de `GET /auth/csrf`.

As operações colaborativas **não** passam pelo REST: vão como JSON pelo WebSocket em
`/ws/sessions/{id}`. O servidor valida, ordena (`seq`) e guarda; a convergência é do CRDT do
cliente. Detalhes em [`docs/ws-protocol.md`](docs/ws-protocol.md).

## Documentação

- [`docs/architecture/README.md`](docs/architecture/README.md) — histórico versionado de arquitetura
  (o snapshot vigente é o último marcado como VIGENTE).
- [`docs/ws-protocol.md`](docs/ws-protocol.md) — protocolo WebSocket, códigos de erro e limites.
- [`docs/refactor-notes.md`](docs/refactor-notes.md) — decisões, divergências e dívidas por fase.
- [`docs/new-app-guide.md`](docs/new-app-guide.md) — como criar outra aplicação sobre o framework.

## Limitações conhecidas

- O registro de conexões WebSocket é em memória: uma instância. Escala horizontal exige broker
  (`SessionBroadcaster` é a SPI, a implementação distribuída está fora do escopo).
- A presença é efêmera e não tem heartbeat; quem cai é removido pelo fechamento da conexão.
- A importação `.obj` local continua no app; a versão colaborativa usa `set_mesh` com o limite
  `design.max-mesh-bytes`.
