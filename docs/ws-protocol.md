# Protocolo WebSocket do collab3d (v2 — Fase 3)

Este documento é a referência do canal `/ws/sessions/{sessionId}`. Ele descreve os
frames que o servidor aceita e envia, o envelope de snapshot e os limites que valem
hoje. A fonte de verdade continua sendo o log de operações; o snapshot é uma
materialização para reidratação.

## 1. Autenticação do upgrade

O navegador não consegue definir cabeçalhos no upgrade, mas envia cookies: a sessão
Spring (`JSESSIONID`) autentica o handshake. O usuário vem **sempre** do `Principal`
autenticado (P3.1).

- Sem sessão válida → `401`.
- `?userId=` continua aceito por uma versão: é ignorado quando coincide com o
  `Principal` e recusado com `403` quando diverge.
- Sala inexistente → `404`; sem amizade com o host → `403`; sala cheia ou encerrada → `409`.

Os atributos `sessionId` e `userId` ficam na sessão WebSocket e são a única fonte de
identidade dos handlers; nenhum payload pode escolhê-los.

## 2. Frames cliente → servidor

| tipo | payload | efeito |
|---|---|---|
| `sync_hello` | `{ "vv": {siteId: lamport} }` | catch-up. Com `vv` vazio e snapshot armazenado, o servidor manda `sync_snapshot` e depois só as ops com `seq > baseSeq`; com `vv` não vazio, manda as ops que faltam. |
| `sync_ops` | `{ "ops": [op, ...] }` | valida envelope + kind registrado, atribui `seq`, persiste e responde `sync_ack`; retransmite aos demais. |
| `presence` | `{ "siteId": "...", "selectedObjectId": "..." }` | efêmero; retransmitido sem persistir. |
| `chat` | `{ "text": "..." }` | efêmero; o servidor reconstrói o frame (sem campos extras). |
| `scene_snapshot` | `{ "snapshot": SnapshotEnvelope }` | valida e armazena o snapshot (política host). O host o envia a cada `SyncPolicy.snapshotIntervalMs` (30 s por padrão); o convidado não envia. |

### Envelope de operação

```json
{
  "id": { "lamport": 7, "siteId": "site-a" },
  "author": "site-a",
  "deps": [],
  "kind": "set_transform",
  "...": "campos do kind"
}
```

- `id` é o carimbo Lamport + réplica; `(siteId, lamport)` deduplica redeliveries.
- `author` **não é confiável**: o servidor o normaliza para `id.siteId`. A atribuição
  ao usuário é a coluna `author_id`, escrita a partir do ator autenticado.
- `deps` é o campo de referências causais. Hoje é sempre `[]` (entrega ordenada pelo
  servidor); `refs` de outros frames seguem a mesma convenção de lista de `OpId`.
- `seq` é acrescentado pelo servidor nos frames `sync_ops`/`sync_ack`; o cliente o usa
  para depuração, não para ordenar (a ordem do servidor já vem no frame).

## 3. Frames servidor → cliente

| tipo | payload | quando |
|---|---|---|
| `sync_snapshot` | `{ "snapshot": SnapshotEnvelope }` | primeiro frame do catch-up de uma réplica sem versão vetorial, se há snapshot armazenado. **Aditivo** no protocolo v2. |
| `sync_ops` | `{ "ops": [...] }` | catch-up e relay de operações persistidas. |
| `sync_ack` | `{ "siteId", "lamport", "seq" }` | confirmação individual ao remetente. |
| `session_roster` | `{ "sessionId", "status", "participants": [{userId, nickname, active}] }` | presença/estado da sala. |
| `presence` | igual ao recebido | relay efêmero. |
| `chat` | `{ "type": "chat", "text": "..." }` | relay efêmero. |
| `error` | `{ "type": "error", "code": "...", "detail"?: "..." }` | rejeição de um frame. `detail` é aditivo, curto (≤200 caracteres) e nunca contém stack trace nem payload. |

### Códigos de erro

| código | significado |
|---|---|
| `INVALID_MESSAGE` | JSON inválido. |
| `UNKNOWN_TYPE` | `type` sem handler registrado. |
| `INVALID_OP` | envelope ou kind inválido/desconhecido; a operação é descartada e a conexão continua. |
| `INVALID_SNAPSHOT` | frame `scene_snapshot` sem `snapshot`. |
| `SNAPSHOT_TOO_LARGE` | snapshot acima de `collab3d.snapshot.max-bytes`. |
| `SNAPSHOT_REJECTED` | política recusou, `baseSeq` à frente do log/retrocedendo ou checksum inválido. |
| `RATE_LIMITED` | frame acima do orçamento por conexão/tipo; é descartado e a conexão continua. `sync_ops` e `sync_hello` são isentos (descartar operação perderia edição); o teto deles é o de bytes. |
| `SYNC_FAILED` | falha inesperada no catch-up. |
| `INTERNAL_ERROR` | falha inesperada ao tratar o frame. |

## 4. Snapshot de reidratação (P3.3)

```json
{
  "schemaVersion": 1,
  "appType": "design",
  "baseSeq": 5000,
  "versionVector": { "site-a": 5000 },
  "state": { "schemaVersion": 1, "records": [ ... ] },
  "checksum": "<sha-256 hex do state canônico>"
}
```

- `state` é `DocumentState.toSnapshot()`: registros com `meta`, campos LWW **com
  carimbos** e tombstones (`addStamp`, `removeStamp`, `deleted`). Sem os carimbos o
  merge após a reidratação divergiria.
- `baseSeq` é o último `seq` já dobrado no estado. O servidor exige
  `baseSeq <= headSeq` e `baseSeq >= snapshot_seq` armazenado (monotônico).
- `checksum` é o SHA-256 do JSON canônico do `state`: chaves de objeto ordenadas,
  arrays na ordem, sem espaços insignificantes. O cliente calcula a mesma forma.
- Só o host grava (política padrão); o log continua sendo a fonte de verdade e não é
  podado.

## 5. Limites

| limite | valor padrão | configuração |
|---|---|---|
| frame de texto | 7000 bytes | `collab3d.sync.max-frame-bytes` |
| ops por mensagem | 1000 | `collab3d.sync.max-ops-per-message` |
| página de catch-up | 200 | `collab3d.sync.chunk-size` |
| entradas de versão vetorial | 100 | `collab3d.sync.max-version-entries` |
| chat | 500 caracteres | `collab3d.ws.max-chat-length` |
| id/nome curto | 100 caracteres | `OperationFields.MAX_ID_LENGTH` |
| buffer de geometria | 262144 bytes | `design.max-mesh-bytes` (app) |
| mensagens por conexão/tipo | 50/s (exceto `sync_ops`/`sync_hello`) | `collab3d.rate-limit.default-per-second`, `per-type` e `exempt-types` |
| snapshot | 1 MB | `collab3d.snapshot.max-bytes` |
