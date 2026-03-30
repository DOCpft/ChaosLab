# ChaosLab — платформа для хаос-инжиниринга

**ChaosLab** — это распределённая система для проведения экспериментов по проверке отказоустойчивости микросервисов. Она позволяет инженерам безопасно вносить сбои (задержки, ошибки, отказы) в целевые сервисы, наблюдать за поведением системы и получать автоматические рекомендации по улучшению надёжности.

## Возможности

- Управление экспериментами через веб-интерфейс (React)
- Централизованный API Gateway (NestJS) с JWT‑аутентификацией
- Асинхронная оркестрация через RabbitMQ
- Хранение метаданных в PostgreSQL, аналитических логов — в ClickHouse
- Распределённые блокировки и кэширование на Redis
- Легковесные агенты-прокси, внедряющие сбои без изменения кода целевых сервисов
- (опционально) AI‑модуль для анализа результатов экспериментов и выдачи рекомендаций

## Архитектура
+-------------------------------------------------------------------------------+
|                           ChaosLab – Distributed System                        |
|                      for Chaos Engineering with AI Analytics                  |
+-------------------------------------------------------------------------------+

                                   [User]
                                      |
                                      v
                              +-------------------+
                              |     React UI      |
                              +--------+----------+
                                       | HTTP
                                       v
+-------------------------------------------------------------------------------+
|                            API Gateway                                         |
|  (NestJS, PostgreSQL, JWT, Swagger)                                            |
|  - User, experiment, agent management                                          |
|  - Agent registration                                                          |
|  - Start/stop experiments                                                      |
|  - Retrieve results and AI analytics                                           |
+-----------------------------------+-------------------------------------------+
                                    | (HTTP) – create experiment, query status
                                    |
                                    | (RabbitMQ: emit 'experiment.start/stop')
                                    v
+-------------------------------------------------------------------------------+
|                              RabbitMQ                                          |
|  Exchange: chaos.exchange (topic)                                              |
|  Queues:                                                                       |
|    - orchestrator_queue (routing key: orchestrator)                            |
|    - agent.<agentId> (routing key: agent.<agentId>)                            |
+-----------------------------------+-------------------------------------------+
                                    | (message experiment.start)
                                    v
+-------------------------------------------------------------------------------+
|                            Orchestrator                                        |
|  (NestJS microservice, listens to RabbitMQ, uses Redis, ClickHouse)            |
|  - Receives start/stop commands                                                |
|  - Manages Redis locks (one experiment per agent)                              |
|  - Sends commands to agents via RabbitMQ                                       |
|  - Sets timers for experiment duration                                         |
|  - Logs events to ClickHouse                                                   |
|  - After experiment, calls AI module (gRPC/HTTP) for analysis                  |
+-----------------------------------+-------------------------------------------+
                                    | (command inject_latency, inject_error, clear_fault)
                                    | via RabbitMQ (routing key: agent.<agentId>)
                                    v
+-------------------------------------------------------------------------------+
|                           Agents (one or more)                                 |
|  (NestJS/Express, proxy server)                                                |
|  - Register with API Gateway on startup (get agentId)                          |
|  - Listen to their RabbitMQ queue                                              |
|  - Proxy requests to target services                                           |
|  - Apply faults on command (delay, error, failure)                             |
|  - Log statuses to ClickHouse (or via orchestrator)                            |
+-----------------------------------+-------------------------------------------+
                                    | (HTTP proxy)
                                    v
+-------------------------------------------------------------------------------+
|                         Target Services (client's)                             |
|  (any HTTP applications, e.g., payments, cart)                                 |
+-------------------------------------------------------------------------------+

+-------------------------------------------------------------------------------+
|                               Data Layer                                       |
+-----------------------------------------------+-------------------------------+
| PostgreSQL    | Redis            | ClickHouse                                 |
| - Users       | - locks          | - experiment logs                         |
| - Experiments | - states         | - aggregated metrics                      |
| - Agents      | - rate limits    | - AI analysis results                     |
+---------------+---------------+-----------------------------------------------+
        ^               ^                 ^
        |               |                 |
        +---------------+-----------------+
                        | (gRPC/HTTP)
                        v
+-------------------------------------------------------------------------------+
|                            AI Module (Advisor)                                 |
|  (separate NestJS microservice)                                                |
|  - Receives request from orchestrator after experiment ends                    |
|  - Retrieves experiment logs from ClickHouse                                   |
|  - Sends data to LLM (OpenAI API / local model) with a prompt                  |
|  - Generates analytical report: causes, impact, recommendations                |
|  - Saves report to ClickHouse (or PostgreSQL)                                  |
|  - Provides API for analytics (via API Gateway)                                |
+-------------------------------------------------------------------------------+

### Основные компоненты

- **React UI** – интерфейс для создания, запуска и мониторинга экспериментов.
- **API Gateway** – центральная точка входа, обрабатывает HTTP‑запросы, управляет аутентификацией и хранит метаданные в PostgreSQL.
- **Оркестратор** – микросервис, слушающий RabbitMQ. Получает команды на старт/стоп, проверяет блокировки через Redis, отправляет команды агентам, логирует события в ClickHouse.
- **Агенты** – прокси-серверы, разворачиваемые в инфраструктуре клиента. Получают команды через RabbitMQ и применяют сбои к целевому сервису.
- **RabbitMQ** – брокер сообщений, обеспечивает асинхронную связь между API Gateway, оркестратором и агентами.
- **PostgreSQL** – хранит пользователей, эксперименты, зарегистрированных агентов.
- **ClickHouse** – колоночная БД для хранения логов экспериментов и аналитики.
- **Redis** – используется для распределённых блокировок (чтобы на одном агенте не запускалось два эксперимента одновременно) и кэширования.
- **AI Advisor** – модуль, анализирующий логи экспериментов и выдающий рекомендации по улучшению надёжности (например, через OpenAI API).

## Технологии

| Компонент         | Технологии                                                   |
|-------------------|------------------------------------------------              |
| Backend (API GW)  | NestJS, TypeScript, TypeORM, JWT, Swagger                    |
| Оркестратор       | NestJS (microservices), RabbitMQ, ioredis, ClickHouse client |
| Агенты            | Node.js / Express, http-proxy-middleware, amqplib            |
| Базы данных       | PostgreSQL, ClickHouse, Redis                                |
| Брокер            | RabbitMQ                                                     |
| Фронтенд          | React                                                        |
| Контейнеризация   | Docker, Docker Compose (Kubernetes в перспективе)            |
| AI                | OpenAI API / Ollama, @nestjs/axios                           |
