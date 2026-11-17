# Notas de refatoração — BlenderPDS → `collab3d`

Registro objetivo das premissas que o plano manda verificar (§0.4 e §11), das divergências entre
o manifesto e o código real, e das decisões tomadas pelo agente de implementação.

- Snapshot de arquitetura de referência: `docs/architecture/architecture-v0.0-baseline.md`
  (estado do commit `1c03688`, versionado em `90b48ff`).
- Plano executado: `docs/plano-framework-collab3d-completo.md`.
- Estado do repositório no início da Fase 0: HEAD `90b48ff`, árvore limpa,
  `./mvnw test` = **116 testes, 0 falhas**, `npm run build` verde.

Formato das respostas: **resposta objetiva** + evidência (`arquivo:linha`) + decisão.

---

## 1. Premissas do §0.4 (verificadas em P0.1)

### 1.1 Onde ficam os campos específicos de cada `kind`: no envelope ou em `payload`?

**Resposta: no NÍVEL DO ENVELOPE (top-level). Não existe objeto `payload` aninhado.**

O envelope é `{id:{siteId,lamport}, author, deps, kind, <campos do kind na raiz>}`.

Evidências:

- `frontend/src/collab/Operation.ts:19-24` — `AddObject` declara `kind`, `objectId`, `geometry`,
  `transform`, `color` todos no mesmo nível de `BaseOperation` (`id`, `author`, `deps`:
  `frontend/src/collab/Operation.ts:11-17`). O mesmo vale para `remove_object`
  (`Operation.ts:29-30`), `change_color` (`Operation.ts:34-36`) e `set_transform` (`Operation.ts:41-43`).
- `backend/blenderpds/src/main/java/com/grupo03/blenderpds/websocket/OperationValidator.java:111-122`
  — `hasValidPayload(kind, node)` valida lendo `node.get("objectId")`, `node.get("geometry")`,
  `node.get("transform")`, `node.get("matrix")`, `node.get("color")` **na raiz** do frame.
- `OperationValidator.java:104` — o que vai para `session_operations.payload` é
  `objectMapper.writeValueAsString(node)`, isto é, **o envelope inteiro serializado** (não um
  sub-objeto). As colunas `site_id`/`lamport`/`kind` são extraídas do envelope para colunas
  próprias (mesma linha), e `seq` é atribuído pelo servidor.
- `backend/.../websocket/SessionSocketHandler.java:287-288` — ao retransmitir, o servidor
  **reidrata** o `payload` do banco como JSON e insere `seq` nele; portanto o frame `sync_ops`
  que o cliente recebe tem o mesmo envelope + `seq`.
- `frontend/src/collab/validate.ts:36` — o cliente exige `author === id.siteId` e `deps` vazio.

**Decisão:** o plano está correto ao assumir o envelope
`{id, author, deps, kind, ...campos-do-kind}`; a "persistência do JSON bruto" é do **envelope
inteiro**, não de um payload reduzido. Consequência para a Fase 1: `OperationKindValidator`
valida `op.path("<campo>")` na raiz do `JsonNode`, e `AppendedOperation.operation` é o envelope.

### 1.2 `UserDetailsServiceImpl` devolve um `UserDetails` customizado com `id`?

**Resposta: NÃO.** Devolve o `User` embutido do Spring Security, sem o id do domínio.

- `backend/.../service/implementation/UserDetailsServiceImpl.java:30-35`:
  `org.springframework.security.core.userdetails.User.withUsername(u.getEmail()).password(...).roles(...).disabled(...).build()`.
  O `username` é o **e-mail**; não há atributo com `users.id`, embora o `User` do domínio já tenha
  sido carregado duas linhas antes (`userRepository.findByEmail(...)`).

**Decisão:** P3.1 precisa mesmo criar `AppUserDetails implements UserDetails` com `id` e trocar o
retorno de `UserDetailsServiceImpl`. Nada em P0.1/P0.2 depende disso.

### 1.3 O `SessionHandshakeInterceptor` consegue ler o `Principal` do handshake?

**Resposta: hoje NÃO lê; e a leitura do principal no handshake é POSSÍVEL mas NÃO CONFIRMADA
empiricamente.**

- Hoje a identidade vem só da query: `SessionHandshakeInterceptor.java:44` (`parseUserId`) e
  `:90-92` (`UriComponentsBuilder...getQueryParams().getFirst("userId")`); os atributos da sessão
  WS guardam `sessionId`/`userId` (`:65-66`). Não há nenhuma chamada de `getPrincipal()` no arquivo.
- O handshake **passa pelo `SecurityFilterChain`**: `SecurityConfig.java:66-78` deixa
  `.anyRequest().authenticated()` (e `WebSocketConfig.java:35` registra `/ws/sessions/*` sob esse
  mesmo contexto), e `SessionWebSocketTest` conecta com HTTP Basic no cabeçalho e obtém sucesso —
  logo a requisição de upgrade é autenticada pela cadeia de filtros.
- A API existe: `org.springframework.http.server.ServerHttpRequest` estende `HttpRequest`, que
  declara `getPrincipal()`; em ambiente servlet a implementação concreta é
  `ServletServerHttpRequest`, e o Spring Security embrulha a request para devolver o
  `Authentication` em `getUserPrincipal()`.
- **NÃO CONFIRMADO:** não foi exercitado um `request.getPrincipal()` real dentro de
  `beforeHandshake` nesta fase (isso é código da Fase 3). Um `Authentication` presente na
  requisição não prova, sozinho, que ele sobrevive até o ponto do upgrade em todas as combinações
  (Basic × cookie de sessão × `HandshakeHandler`).

**Decisão:** manter o plano como está e tratar P3.1-4 como *verificação obrigatória* com teste
novo. Plano B já previsto no §11 (ticket de curta duração
`POST /sessions/{id}/ws-ticket`) fica registrado como fallback caso o principal não chegue.

### 1.4 `ddl-auto=create` (código) vs. `update` (documentação)?

**Resposta: o código usa `create`.** `backend/.../src/main/resources/application.properties:8`:
`spring.jpa.hibernate.ddl-auto=create`, com o comentário "Creates/updates the entity schema in
development". A afirmação de `update` vinha de `docs/backend-architecture.md`, que **não existe
mais** no repositório (ver §2.1). Ou seja: o débito `ddl_auto_destructive` é real, e o Hibernate
recria o schema a cada start.

**Decisão:** P0.5 substitui por Flyway + `validate` (ver §3.1).

---

## 2. Divergências entre o manifesto e o código real

Registradas conforme a instrução "se o código real divergir do manifesto, o código real vence".

### 2.1 Os guias de arquitetura citados pelo manifesto e pelo plano não existem mais

- O manifesto (`architecture-v0.0-baseline.md`, seção 1) e o plano (P0.0) citam
  `docs/backend-architecture.md` e `docs/frontend-architecture.md`.
- Esses arquivos foram **removidos** em `9fbbf44` ("feat:architecture document"), junto com
  `frontend/backlog.md`; `git ls-tree 1c03688 docs/` mostra que existiam no commit varrido.
- **Decisão:** para a baseline não perder os documentos legados, eles foram restaurados de
  `1c03688` para `docs/architecture/legacy/backend-architecture-v0.0.md` e
  `docs/architecture/legacy/frontend-architecture-v0.0.md`, sem alteração de conteúdo.
- Efeito colateral: `frontend/README.md` (seção "Documentation") aponta para
  `../docs/frontend-architecture.md` e `../docs/backend-architecture.md`, que não existem —
  link quebrado, anotado em §5 e **não corrigido** (fora do escopo da Fase 0).

### 2.2 `frontend/backlog.md` também foi removido

O manifesto cita o roadmap em `frontend/backlog.md`; o arquivo foi removido em `9fbbf44`.
Não foi restaurado (não é citado por nenhuma tarefa do plano). Registro apenas.

### 2.3 Contagem de testes do manifesto

O manifesto estimou "16 classes / 116 métodos `@Test`" por `grep`; a execução real confirma
**116 testes, 0 falhas** (`./mvnw test`, ver §4). Sem divergência.

### 2.4 Jackson 2 vs. Jackson 3 (`mixed_jackson_packages`)

O manifesto registra `dto/UserDto.java:4` importando `com.fasterxml.jackson.annotation.JsonProperty`
como possível mistura de pacotes. **Não é débito:** em Jackson 3 a API de *databind* migrou para
`tools.jackson.*`, mas as **anotações continuam em `com.fasterxml.jackson.annotation`**
(`jackson-annotations` 2.x). A árvore de dependências confirma
`tools.jackson.core:jackson-databind:3.1.5 → com.fasterxml.jackson.core:jackson-annotations:2.21`
(§3.2). O import está correto.

### 2.5 Limite de ~8 KB por frame de texto no WebSocket (não documentado no manifesto)

O manifesto declara `MAX_SNAPSHOT_BYTES = 1_000_000` e um erro `SNAPSHOT_TOO_LARGE`, mas o
**transporte** corta antes: o container aceita frames de texto só até ~8 KB e fecha a conexão com
**1009 (message too big)** quando o frame passa disso. Nada no projeto configura esse limite
(não há `ServletServerContainerFactoryBean` nem `setMaxTextMessageBufferSize` em `backend/`).

Medido em P0.2 (teste `SessionWebSocketTest#textFrameAboveTheContainerBufferClosesTheConnection`
e no experimento que o originou, com frames de `scene_snapshot`):

| Bytes do frame | Resultado observado |
|---|---|
| 1.048 / 7.048 / 8.048 / 8.148 | gravado em `sessions.scene_snapshot`, sem frame de erro |
| 9.048 | conexão fechada (1009), snapshot **não** gravado, nenhum `error` |
| 20.048 / 200.048 / 1.000.048 | o envio seguinte já falha: a sessão está fechada |

Consequências:

- `SNAPSHOT_TOO_LARGE` é **inalcançável pela rede** hoje; o guarda de 1 MB só é exercitável na
  camada de serviço (`SessionServiceImplTest.java:357-358` já o cobre).
- O `scene_snapshot` periódico do cliente (`SNAPSHOT_INTERVAL_MS = 15000`, `frontend/src/Main.tsx:37`)
  **derruba o socket** quando a cena serializada passa de ~8 KB — risco concreto para cenas reais.
- O `sync_snapshot` da Fase 3 (P3.3) herda o mesmo teto: um snapshot de reidratação não caberia.

**Decisão (Fase 0):** apenas caracterizar, não corrigir — mudar o buffer é mudança de
comportamento e não está no plano desta fase. Fica registrado como pendência para **P1.3**
(`Collab3dProperties`, provável `collab3d.ws.max-message-bytes`) e como pré-requisito de P3.3.

### 2.6 Arquivos citados no plano que ainda não existem

`docs/refactor-notes.md` (este arquivo), `docs/ws-protocol.md`, `docs/new-app-guide.md` e
`CHANGELOG.md` são entregas de fases posteriores; não existiam no início da Fase 0.

---

## 3. Pontos a verificar do §11 (os 5 verificáveis nesta fase)

### 3.1 Flyway no Spring Boot 4: qual starter/dependência?

**Resposta: `org.springframework.boot:spring-boot-starter-flyway` (módulo `spring-boot-flyway`).
Apenas `org.flywaydb:flyway-core` NÃO liga a auto-configuração no Boot 4.** Para PostgreSQL é
preciso também `org.flywaydb:flyway-database-postgresql` (runtime).

Evidências:

- Estado atual: `./mvnw dependency:tree` **não mostra nenhum artefato `org.flywaydb`** — não há
  Flyway no projeto hoje.
- Boot 4 modularizou a auto-configuração: `FlywayAutoConfiguration` saiu de
  `spring-boot-autoconfigure` e vive no módulo `spring-boot-flyway`, registrado pelo próprio
  `AutoConfiguration.imports`. O starter `spring-boot-starter-flyway` traz esse módulo
  (Spring blog "Modularizing Spring Boot", 2025-10-28; Spring Boot 4.0 Migration Guide, lista de
  starters; `docs.spring.io/spring-boot/how-to/data-initialization.html`).
- **Aplicado em P0.5** e confirmado empiricamente: a migração roda no boot e
  `ddl-auto=validate` passa (ver relatório da fase).

**Decisão:** usar o starter (versão gerenciada pelo parent 4.1.1) + `flyway-database-postgresql`
com escopo `runtime`.

### 3.2 Jackson 3: nomes de API (`tools.jackson.*`, `asText()` → `asString()`)

**Resposta: o projeto já usa Jackson 3 (`tools.jackson.databind` 3.1.5). `asText()` continua
existindo, mas está **deprecated** em favor de `asString()`/`asString(String)`; há diferenças de
comportamento relevantes.**

Evidências:

- Dependências: `spring-boot-starter-webmvc` → `spring-boot-starter-jackson` →
  `spring-boot-jackson` → `tools.jackson.core:jackson-databind:3.1.5` (+ `jackson-core:3.1.5`,
  + `com.fasterxml.jackson.core:jackson-annotations:2.21`) — saída de `./mvnw dependency:tree`.
- Uso atual: `SessionSocketHandler.java:96` (`root.path("type").asText("")`),
  `OperationValidator.java:90` (`node.asText()`) e `:135`; compilam hoje, logo `asText()` existe
  na 3.1.5. Já o rename de `fields()` → `properties()` **já está aplicado** em
  `SessionSocketHandler.java:314` (`node.properties().forEach(...)`).
- Javadoc da 3.x: `asText()`/`asText(String)` marcados *Deprecated — Use asString()/asString(String)
  instead*; `asString()` **lança `JsonNodeException` para objetos/arrays** (a 2.x devolvia ""), e
  `asString(String default)` devolve `""` (não o default) para `NullNode` — comportamento diferente
  do `asText(String)` da 2.x.
  (javadoc.io `tools.jackson.databind.JsonNode` 3.2.x; wiki "Jackson Release 3.0", item #4879.)

**Decisão:** código novo segue o plano e usa `asString(...)`; ao migrar código existente
(`asText`), a troca só entra onde houver teste cobrindo o caso "nó ausente/estruturado", porque o
default e o lançamento mudaram. Nenhuma troca feita na Fase 0 (não está no plano).

### 3.3 `LamportClock` faz `observe(max)` ao aplicar ops remotas?

**Resposta: SIM.** `LamportClock.observe` faz `counter = max(counter, remote.lamport)` e é chamado
em toda op remota aceita.

- `frontend/src/collab/LamportClock.ts:27-29` — `observe(_remote) { this.counter = Math.max(this.counter, _remote.lamport) }`.
- `frontend/src/collab/ReplicaSession.ts:41-47` — `receive(op)` só segue depois de `log.append`
  (descarta duplicata) e então chama `this.clock.observe(op.id)`.
- `LamportClock.ts:18-21` — `tick()` incrementa antes de devolver, então uma op local criada após
  observar `lamport = L` recebe `L+1` (ordem causal preservada sem relógio de parede).

Observação técnica (não é bug, é escolha): a formulação clássica é `counter = max(counter, remote) + 1`
no *receive*; aqui o `+1` acontece no `tick()`. O resultado prático é o mesmo para ops locais
subsequentes; o que difere é que `clock.current` após observar vale exatamente `max` e não
`max+1`. **Decisão:** não alterar (mudaria os lamports gravados e o comportamento de dedupe
`(site_id, lamport)`); registrar como observação para a Fase 2, quando `LamportClock` migra para
`@collab3d/core`.

### 3.4 Cookie de sessão no upgrade WebSocket através do proxy do Vite (`ws: true`)

**Resposta: CONFIRMADO em experimento — o cookie chega intacto ao backend.**

Procedimento executado (Vite 8.3.4 do projeto, config `frontend/vite.config.ts:28-33`, com
`BACKEND_URL` apontando para um alvo de teste que registra os cabeçalhos do upgrade):

```
node /tmp/echo-backend.mjs            # alvo na :8099, loga req.headers no evento 'upgrade'
BACKEND_URL=http://localhost:8099 node_modules/.bin/vite --port 5199 --strictPort
curl -i -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' \
     -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
     -H 'Cookie: JSESSIONID=COOKIE-PROBE-123; XSRF-TOKEN=probe' \
     'http://localhost:5199/ws/sessions/1?userId=7'
```

Saída registrada pelo alvo:

```json
{"url":"/ws/sessions/1?userId=7","host":"localhost:8099","cookie":"JSESSIONID=COOKIE-PROBE-123; XSRF-TOKEN=probe"}
```

Conclusões objetivas: (a) o proxy encaminha o upgrade e **preserva o cabeçalho `Cookie`**;
(b) `changeOrigin: true` reescreve `Host` para o alvo; (c) a query (`?userId=7`) é preservada.
O que **não** foi provado aqui é que o Spring Security resolve o `Principal` a partir desse cookie
no `beforeHandshake` — isso é o item §1.3 (NÃO CONFIRMADO, verificação obrigatória em P3.1).

**Decisão:** não é necessário o ticket de curta duração por causa do proxy; a dúvida restante é só
do lado do servidor (P3.1).

### 3.5 Biblioteca de JSON Schema no backend (compatível com Jackson 3?)

**Resposta: SIM, desde que se use a linha **3.x** do `com.networknt:json-schema-validator`
(Java 17+ / Jackson 3). A linha 2.x é Jackson 2.**

- README do projeto networknt: "**2.x.x** — Java 8+ e Jackson 2.x; **3.x.x** — Java 17+ e
  Jackson 3.x"; `doc/upgrading.md` repete a matriz (3.0.0 → "Change to use Jackson 3 for which
  Java 17 is now required"). A 3.0.x depende de `tools.jackson.core:jackson-databind`, e não de
  `com.fasterxml.jackson.databind`, então convive com o Jackson 3.1.5 do Boot 4.1.1.
- Versão estável observada na linha 3.x: 3.0.8/3.0.9 (README e releases).

**Decisão:** na Fase 1, se o `OperationKindValidator` genérico for implementado por JSON Schema,
usar `com.networknt:json-schema-validator:3.x` (versão fixada explicitamente no `pom.xml`, já que
o Boot não a gerencia). Nada adicionado na Fase 0 — o plano coloca a biblioteca na Fase 1
(P1.6/§2-HS3), e a alternativa "validadores escritos à mão + JSON Schema só nos testes de
contrato" continua aberta.

---

## 4. Decisões tomadas pelo agente (Fase 0)

1. **Baseline (P0.0):** o cabeçalho YAML foi *prefixado* ao conteúdo do manifesto, que ficou
   byte-a-byte igual ao original; a proveniência está num bloco de citação logo abaixo do
   cabeçalho. Docs legados restaurados de `1c03688` (ver §2.1) em vez de copiados do working tree,
   porque não existiam mais.
2. **Referências ao caminho antigo:** atualizadas em `docs/plano-framework-collab3d-completo.md:4`.
   Não havia prompts versionados no repositório; nenhum outro arquivo citava o manifesto.
3. **`asText` vs `asString`:** nenhuma migração de API Jackson nesta fase (§3.2).
4. **Flyway:** starter do Boot 4 + `flyway-database-postgresql`; `ddl-auto=validate` (§3.1).
   A estratégia de baseline de schema está detalhada no relatório da Fase 0 (P0.5).
5. **Workspaces npm (P0.6):** os scripts do pacote web passaram a chamar `vite`/`tsc`/`vitest` sem
   o prefixo `node_modules/.bin/`, porque com workspaces os binários ficam no `node_modules/.bin`
   da raiz. Sem isso os scripts quebrariam.

---

## 5. Flyway: estratégia adotada em P0.5

- **Dependências:** `spring-boot-starter-flyway` (traz o módulo `spring-boot-flyway`, onde está a
auto-configuração no Boot 4) + `org.flywaydb:flyway-database-postgresql` em `runtime` (§3.1).
- **`V1__baseline.sql`** foi gerado do banco **real** que o Hibernate criava
  (`pg_dump --schema-only --no-owner --no-privileges`), sem reescrever DDL à mão: os nomes de
  tabelas, colunas, `CHECK`s e constraints (`uk_session_operation_seq`, `uk_session_operation_op`,
  `uk_session_participant`, `sessions.user_id`) são exatamente os do schema anterior.
- **`ddl-auto` passou de `create` para `validate`** (`application.properties`).
- **`spring.flyway.baseline-on-migrate=true`:** a base de desenvolvimento/teste já existia sem
  histórico do Flyway; sem o baseline o Flyway recusa um schema não vazio. Efeito observado: na
  base existente o Flyway gravou `1 | << Flyway Baseline >> | BASELINE` (V1 **não** é reexecutada);
  numa base limpa ele executa V1 de verdade. A adoção silenciosa de uma base antiga é aceitável
  porque até agora `ddl-auto=create` apagava o schema a cada start — não há dado histórico a
  proteger — e fica registrado que **P1.10** deve introduzir `V2` normalmente sobre esse histórico.
- **Verificação (banco limpo):** com um segundo processo apontando para um banco novo
  (`blenderpds_clean`, `--spring.docker.compose.enabled=false`), o log mostrou
  `Migrating schema "public" to version "1 - baseline"` → `Successfully applied 1 migration` →
  `Started BlenderpdsApplication`, e o banco ficou com as 7 tabelas + `flyway_schema_history`
  (`1 | baseline | SQL | t`). O `validate` do Hibernate aceitou o schema criado pelo Flyway; o
  banco de teste foi removido no fim.

**Débito `ddl_auto_destructive`: resolvido.**

## 6. npm workspaces (P0.6)

- `frontend/` foi movido com `git mv` para **`apps/design-editor/web/`** (histórico preservado) e a
  raiz virou o workspace root: `{"name":"collab3d","private":true,"workspaces":["apps/*/web"]}`.
- O `package.json` da raiz **não redeclara mais** `react`, `react-dom`, `react-router-dom` e
  `@types/node` — débito `duplicate_root_package` resolvido. As versões vivem só no manifesto do
  pacote web.
- Scripts do pacote web passaram de `node_modules/.bin/vite`/`node_modules/.bin/tsc` para
  `vite`/`tsc`: com workspaces os binários são içados para `node_modules/.bin` da raiz, e o
  prefixo relativo antigo apontaria para uma pasta inexistente.
- O glob inclui só `apps/*/web`; `framework/*` entra em **P2.1**, quando o pacote existir (um
  workspace sem correspondência faz o `npm install` falhar).
- Comandos passaram a ser `npm install` na raiz + `npm run <script> -w blenderpds`; o
  `README.md` e o `apps/design-editor/web/README.md` foram atualizados (os caminhos antigos e a
  frase "the front end has no test runner" ficariam falsos).
- Verificado: `npm install` na raiz (exit 0, binários içados), `npm run build -w blenderpds`,
  `npm test -w blenderpds` (29 testes) e `npm run build` de dentro da pasta do pacote.

## 7. Observações (fora do escopo da Fase 0 — não corrigidas)

- `frontend/README.md` aponta para `../docs/frontend-architecture.md` e
  `../docs/backend-architecture.md`, removidos em `9fbbf44`. Os snapshots correspondentes agora
  vivem em `docs/architecture/legacy/*-v0.0.md`.
- `SessionService.syncSince` (`SessionServiceImpl.java:273`) carrega o log inteiro e filtra em
  memória (`linear_scans` do manifesto) — corrigido em P1.12, não aqui.
- `SessionService.syncSinceSeq` (`SessionServiceImpl.java:288`) segue sem chamador
  (`stub_or_dead` do manifesto).
- `backend/blenderpds/compose.yaml` mantém a senha do Postgres literal (`hardcoded_dev_credentials`);
  corrigido em P3.4.
- `spring-boot-starter-security-oauth2-client` continua no `pom.xml` sem configuração de client
  OAuth2 (`oauth2_starter_unused`); removido em P3.2.
- A suíte de backend depende de Docker ativo (Postgres do `compose.yaml`, usado também pelos
  testes: `spring.docker.compose.skip.in-tests=false`) e a base do compose é **persistente** —
  relevante para a estratégia de baseline do Flyway em P0.5.
- `DocumentState` (P0.4): (a) um `add_object` que **revive** um objeto apagado atualiza
  `transform`/`addStamp` mas **não** grava `color` (`frontend/src/collab/DocumentState.ts:70-93`),
  então o objeto volta com a cor anterior; (b) `LWWRegister.set` compara **carimbos**, não valores,
  logo um write que vence reporta mudança mesmo com valor idêntico. Ambos ficaram congelados em
  `frontend/src/collab/DocumentState.test.ts` e precisam ser decididos em P2.3 (o `MergeStrategy`
  pode normalizar isso; mudar a semântica invalida os testes de caracterização).
- `SessionSocketHandler` só entrega o `session_roster` inicial **depois** do primeiro `sync_hello`
  do cliente: a conexão nasce em `catchingUp` e `SessionConnection.send` enfileira tudo até
  `finishCatchUp()`. Não é bug (é a proteção contra perder ops durante o catch-up), mas é
  comportamento de protocolo que não estava no manifesto; ficou congelado em P0.2.

---

# Fase 1 — Extração do core backend (P1.1–P1.12)

## 8. Estado encontrado nesta sessão (ponto de partida)

- HEAD `6e23c66` ("refactor (phase1)"), árvore limpa. P1.1 (`d3a9418`), P1.2 (`d5d5e90`),
  P1.3 (`bc35f9f`) e P1.4 (`87968b7`) já estavam commitadas.
- **Divergência 1:** o commit de P1.5 (`6e23c66`) tem mensagem fora do padrão (`refactor (phase1)`,
  sem ID) e **não compilava**:
  - `ws/SessionSocketHandler.java:103` — `catch (InvalidMessageException | MessageRejectedException ex)`
    infere `RuntimeException` como tipo comum, e `ex.code()` não existe nele;
  - `ws/handler/SyncHelloHandler.java:70` — `SessionService.syncSince` devolve `List<SessionOperation>`
    e `WsFrames.syncOps` recebe `List<AppendedOperation>`.
  - Corrigido em `8461b7b` (catches separados + conversão para `AppendedOperation`), sem tocar no
    contrato do frame. `./mvnw test` voltou a 132 testes verdes.

## 9. Divergências entre plano e código real (Fase 1)

1. **P1.5 quebrado e sem ID** — ver §8. O histórico não foi reescrito; o conserto é um commit novo
   referenciando P1.5.
2. **`SessionController.toDto` usa `SessionServiceImpl.MAX_PARTICIPANTS` como capacidade do DTO**
   (`framework/backend-starter/src/main/java/dev/collab3d/api/SessionController.java`). Com uma
   `SessionCapacityPolicy` diferente da default, o REST continua anunciando 4. Não corrigido (fora
   do escopo de P1.9; o contrato do DTO não podia mudar agora) — anotado em §11.
3. **`OperationAppender.appendSystem` continua `UnsupportedOperationException`** — o plano menciona
   operações emitidas pelo servidor (§11 decisão 4) mas nenhuma tarefa da Fase 1 exige implementá-las;
   a primeira aplicação autoritativa é a Fase 4.
4. **"ArchUnit/grep no CI" (P1.6)**: não existe CI no repositório. O gate foi criado como script
   executável, `scripts/check-no-domain-kinds.sh`, e rodado manualmente (verde).
5. **Contratos compartilhados front/back (§10, `contracts/<app>/<kind>.cases.json`)** não foram
   criados: o plano os coloca junto da generalização do frontend (Fase 2). A equivalência atual é
   garantida pelos testes dos validadores do app contra os mesmos limites de `validate.ts`.

## 10. Decisões tomadas (Fase 1)

1. **P1.6 — onde ficam os predicados de campo:** `dev.collab3d.spi.OperationFields` (público) com
   `shortString`, `isMatrix`, `isColor` e os limites; os validadores da aplicação não importam
   classes de `ws`.
2. **P1.6 — `OperationKindRegistry` no pacote `ws`**, ao lado de `OperationValidator` e
   `MessageCatalog`: é o mesmo tipo de tabela (chave → handler) e não pode ler repositórios.
3. **P1.6 — kinds de teste do starter** em `framework/backend-starter/src/test/java/dev/TestKindsConfiguration.java`
   (pacote `dev`, fora de `dev.collab3d`), importado pelo `TestApplication`. Os kinds reais vivem só
   em `apps/design-editor/backend/.../kinds`.
4. **P1.8 — estado reduzido:** `SessionStateStore` no pacote `session` (lê repositório; não pode
   ficar em `ws`/`api`). O reducer é opcional (`ObjectProvider`), o estado é reconstruído do log na
   primeira leitura da sala e avançado por operação aceita, na ordem de `seq`; `evict` no fim da
   sessão.
5. **P1.9 — visibilidade default:** a query congelada já seleciona apenas salas ACTIVE de amigos do
   usuário; `AlwaysVisiblePolicy` não esconde nada e serve de base para apps que queiram restringir.
   A capacidade efetiva é o **mínimo** entre as políticas que suportam o app type.
6. **P1.10 — `sessions.app_type`:** escrita a partir de `collab3d.app-type` na criação (nunca do
   request); `SessionCreateDto.appType` é aceito e ignorado, como o plano descreve, e está documentado
   no DTO. `SessionContextFactory` passou a ler a coluna (com fallback para a configuração).
7. **P1.11 — eventos:** `SessionLifecycleListener` no SPI, eventos no pacote `session`, entrega por
   `SessionLifecycleDispatcher` em `@TransactionalEventListener(AFTER_COMMIT)`; falha de um listener é
   logada e não interrompe os outros nem a requisição já commitada.
8. **P1.12 — catch-up:** `SessionService.syncSinceSeq` virou `(sessionId, seq, limit)` e é o caminho
   do `sync_hello`; `syncSince` (version vector) pagina por `seq` e filtra o vv página a página. Uma
   página = um `chunk` = um frame `sync_ops`, preservando o teto de ~8 KB já conhecido (§2.5).
9. **Gate da Fase 1 pelo lado do app:** `apps/design-editor/backend/.../BlenderpdsApplicationTests`
   sobe o contexto real (Postgres do compose) e confere que o registro de kinds tem exatamente os
   quatro do editor — o starter não parte se exigir um kind de domínio.
10. **Armadilha registrada (teste do app):** um `src/test/resources/application.properties` no módulo
    do app **substitui** o `application.properties` de `src/main/resources` no classpath de teste
    (arquivo homônimo tem precedência). O teste passou a declarar as duas propriedades de docker
    compose em `@SpringBootTest(properties = ...)`, mantendo as propriedades principais.
11. **Configurações de teste fora do pacote escaneado:** `dev.support.*` (não `dev.collab3d.*`).
    Motivo real: `Collab3dAutoConfiguration` faz `@ComponentScan("dev.collab3d")` e o scan roda
    também sobre o classpath de teste, então uma `@TestConfiguration` aninhada em `dev.collab3d.*`
    vira bean de **todos** os contextos da suíte. Descoberto quando a política de join customizada
    derrubou 13 testes de outras classes; a política de admissão da P1.8 já vazava, silenciosamente.

## 11. Observações (fora do escopo da Fase 1 — não corrigidas)

- `SessionController.toDto` anuncia capacidade fixa 4 (ver §9.2). Decidir na Fase 2/4 se o DTO passa
  a receber a capacidade da política.
- `getJoinableSessionsFor` constrói um `SessionContext` por sala listada quando há políticas de
  visibilidade (N+1 leituras). N é o número de salas ACTIVE de amigos; otimização não é do escopo.
- `Collab3dProperties.rateLimit` existe desde P1.3 mas ainda não é aplicado (Fase 3).
- `SessionEndedEvent` tem dois ouvintes independentes (`SessionSocketHandler` e
  `SessionLifecycleDispatcher`); é intencional, mas vale lembrar ao mexer no encerramento.
- `appendSystem` (operações emitidas pelo servidor) segue sem implementação (Fase 4).
- O teto de ~8 KB por frame de texto continua de pé: um `chunk` de 200 operações não cabe nele. O
  catch-up pagina, mas o tamanho do frame não foi reduzido nem configurável (débito da v0.1 §2.5).

---

# Fase 2 — Core frontend e framework compartilhado (P2.1–P2.11)

## 12. Estado encontrado nesta sessão (ponto de partida)

- HEAD `a2069b1` (P1.13), árvore limpa, `./mvnw test` com 156 testes verdes e o frontend com 29
  testes Vitest em 4 arquivos.
- O frontend era um único pacote (`apps/design-editor/web`): CRDT com `switch` por kind, protocolo
  com `switch` por tipo de mensagem, presença acoplada ao protocolo e `Engine.ts` montando renderer,
  câmera, sync e presença à mão.
- **P1.13** (feita antes de P2.1, como pedido): `SessionService.maxParticipants(Long)` é o mínimo
  entre as políticas de capacidade que suportam o app type (fallback `MAX_PARTICIPANTS`) e
  `SessionController.toDto` passou a usá-lo. Shape do DTO inalterado. Teste
  `SessionCapacityDtoTest` com `dev.support.CapacityTwoConfiguration` (capacidade 2).

## 13. Divergências entre plano e código real (Fase 2)

1. **P2.5–P2.9 em um commit só.** As cinco tarefas compartilham a raiz de composição
   (`createCollabApp`): mover o renderer, trocar a presença e remover o `switch` do protocolo não
   compilam separadamente, porque `Engine.ts` era o único ponto que ligava todas as peças. A
   separação teria exigido reconstruir estados intermediários que nunca existiram no repositório.
   O commit `1c7f680` lista as tarefas e o relatório da fase detalha o aceite de cada uma.
2. **P2.10 parcial: importação `.obj` colaborativa continua local.** O `SceneFormatRegistry` e o
   `ObjImporter`/`ObjExporter` existem, mas transformar os meshes em `add_object` esbarraria em
   três limites congelados: (a) `geometry` é `shortString` (≤100 caracteres) no validador do
   servidor e no `validate.ts`; (b) um OBJ real serializa para muito mais que os ~8 KB de um frame;
   (c) `CreateObjectTool.buildPrimitive` só conhece primitivas — não há caminho de geometria
   serializada no projetor. Mudar qualquer um dos três é contrato da Fase 3, então a importação
   segue local e o `.obj` não converge entre réplicas hoje.
3. **Sem `eslint-plugin-boundaries` no repositório.** O gate de fronteira foi implementado com
   `madge` em `scripts/check-boundaries.mjs` (a alternativa que o próprio plano admite), verificando
   que `framework/` não importa `apps/` e que não há ciclos.
4. **TTL de presença desligado no editor.** `PresenceChannel` suporta expiração, mas o editor não
   tem heartbeat: ligar TTL faria um peer parado desaparecer. O `onClose` continua sendo o que
   limpa a presença, como antes.
5. **Testes do CRDT mudaram de casa, não de comportamento.** `LamportClock`, `OpLog` e
   `LWWRegister` foram para `framework/core` com os seus testes. A suíte de convergência
   (`DocumentState.test.ts`) ficou no app e foi reescrita sobre os kinds do editor: os 13 casos e
   as asserções de caracterização são os mesmos (incluindo o revive que não regrava cor e o LWW
   que reporta mudança por carimbo), apenas lendo os campos genéricos do registro.
6. **`OpLog` ficou com genérico `any` por default.** O log é do framework e não conhece a união de
   operações do app; o default permissivo evita obrigar cada aplicação a parametrizar o tipo em
   todo uso. A validação de forma continua no `SyncPolicy.validateOperation` do app.

## 14. Decisões tomadas (Fase 2)

1. **Core sem domínio.** `framework/core` não tem literais de kind, de objeto ou de cena. O que era
   `ObjectRecord` virou `DocumentRecord` genérico: `meta` (valores imutáveis), `fields`
   (`LWWRegister` por nome), `addStamp`/`removeStamp` (tombstone) e `deleted` (cache).
2. **Merge como estratégia.** `LwwStrategy` e `TombstoneSetStrategy` implementam a comutatividade;
   `DocumentState` é um fold que delega ao `OperationKindRegistry`. Nenhum `switch` por kind sobrou
   no core (`grep -R "add_object" framework/core` vazio, verificado no gate).
3. **Kinds e validação pertencem ao app.** Os quatro kinds vivem em
   `apps/design-editor/web/src/kinds/`, cada um com o seu `validate` e o seu `apply`. O editor
   registra-os com `editorKinds()`; o registry é criado por documento e kind duplicado lança.
4. **Contratos compartilhados.** `contracts/design-editor/<kind>.cases.json` é lido pelo
   `EditorKindContractsTest` (JUnit) e pelo `src/kinds/contracts.test.ts` (Vitest). O limite de 100
   caracteres dos campos curtos foi replicado no cliente para o arquivo significar o mesmo dos dois
   lados.
5. **Presença genérica.** `PresenceChannel<T>` cuida de wire, throttle, TTL, conflito por `siteId`
   e limpeza no close; `PresenceService` é o adaptador do editor (claim/lockedBy/onLockLost).
6. **Protocolo por registro.** `MessageRegistry` + `MessageDefinition`: `sync_hello` e `sync_ops`
   são definições como qualquer outra, e chat/snapshot entram pelo mesmo caminho. `SyncPolicy`
   carrega `chunkSize`, `maxOpsPerMessage` e o `validateOperation` do app.
7. **Raiz de composição.** `createCollabApp` constrói `SceneHost` (cena, renderer, câmera, loop) e
   o `SyncEngine`, e chama `mount` para o app montar ferramentas/controles/projeção. O `Engine.ts`
   virou `createEditorApp.ts` com essa função; `Viewport3D` só chama `createEditorApp`.
8. **Alias de fonte, não `dist`.** O app resolve `@collab3d/core` e `@collab3d/react-kit` para o
   `src` via `tsconfig.paths` + alias do Vite/Vitest; os pacotes também têm build próprio (`vite
   build` + `tsc` para `.d.ts`), que é o que o gate de P2.1 valida.
9. **Teto de ~8 KB por frame — decisão registrada para a Fase 3.** O limite do Tomcat (1009) e o
   `chunk-size` de 200 operações não cabem; a **primeira tarefa da Fase 3** é limitar o chunk por
   bytes (não apenas por contagem de ops). Não foi tratado nesta fase.
10. **`OperationAppender.appendSystem` é pré-requisito da Fase 4.** Continua
    `UnsupportedOperationException`; o `game_over` do turn-game é a primeira operação autoritativa
    do servidor e depende dele. Registrado aqui para não se perder entre fases.
11. **Dívida `session_dto_fixed_capacity` resolvida** em P1.13 (capacidade do DTO vem da política);
    marcada como resolvida no delta da v0.3.

## 15. Observações (fora do escopo da Fase 2 — não corrigidas)

- O timeline reconstrói o estado com `replayDocumentState` a cada passo; com logs grandes isso é
  O(n) por frame do scrubber. Otimização não é do escopo.
- `ObjImporter` usa a geometria serializada (`BufferGeometry.toJSON`) só para a cena local; o
  projetor ainda não sabe recriá-la a partir de uma operação (ver §13.2).
- O bundle de `react-kit` inclui o `react-router-dom` (não externalizado por subcaminho); o app
  deduplica React, mas o tamanho do artefato não foi otimizado.
- O gate visual do editor (criar/mover/colorir/excluir numa tela real, duas abas) não foi executado:
  não há Playwright no projeto e o teste de integração cobre o protocolo, não o WebGL.
