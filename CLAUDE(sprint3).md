# BookFlow AI Commerce — CLAUDE.md Sprint 3
# Agentes de IA, Recomendaciones y UX Avanzada
Import rules from .claude/rules/common/caveman.md
## 🪨 CAVEMAN RULES (LECTURA OBLIGATORIA)
Terse like caveman. Technical substance exact. Only fluff die. 
Drop: articles, filler, pleasantries. Fragments OK. 
Pattern: [thing] [action] [reason]. [next step]. 
ACTIVE EVERY RESPONSE. Code/commits: normal. 

---

## 1. CONTEXTO SPRINT 3: "LA PLATAFORMA PROACTIVA"
- Sprint 1 & 2: Base + Integración Real + Pricing.
- Sprint 3: IA conversacional (Asistente), Sistema de Recomendaciones y UX Premium.
- Meta: De herramienta de gestión a socio de ventas inteligente.

## 2. ARQUITECTURA & DISEÑO (CONTRATOS SOLID)

### Principios SOLID & Patterns
1. **S**ingle Responsibility: Cada servicio hace UNA cosa. `pricing-service` solo calcula, no recomienda.
2. **O**pen/Closed: Usa **Strategy Pattern** para cálculos de recomendación. Añade nuevas estrategias sin tocar el core.
3. **L**iskov Substitution: Los adaptadores de APIs externas deben ser intercambiables sin romper la infraestructura.
4. **I**nterface Segregation: Clientes HTTP tipados específicos. No uses un "God Client".
5. **D**ependency Inversion: Capa `domain` NO depende de `infrastructure`. Usa inyección de dependencias.

### Patrones Clave en este Sprint:
- **Observer Pattern**: Para notificaciones de cambio de stock/precio en tiempo real.
- **Factory Pattern**: Para crear agentes de IA específicos (Asistente vs Curador).
- **Decorator Pattern**: Para añadir caché y logs a los adaptadores de API.

---

## 3. STACK & REGLAS ABSOLUTAS (CAVEMAN STYLE)
- **Aislamiento DB**: No shared DB. API only.
- **Comunicación**: REST Async/Sync.
- **IA**: Solo en `ai-assistant-service` y `recommendation-service`.
- **UI**: React 18 + Tailwind. UX centrado en eficiencia.

---

## 4. NUEVOS SERVICIOS (SPRINT 3)
## 4. ASIGNACIONES SPRINT 3 (9 DEVS)

### DEV 1 — Carrito / Preparación (Frontend)
- **Meta:** Interfaz de carrito. [cite_start]Agregar/quitar productos.
- **UX:** Uso de estados locales y sincronización con BFF.
- **Caveman Rule:** UI fast. [cite_start]No backend logic in frontend[cite: 832].

### DEV 2 — Order Service (Backend)
- **Meta:** Crear pedido formal. [cite_start]Validar stock real.
- [cite_start]**DB:** `order_db`.
- [cite_start]**Contrato:** Consulta `inventory-service` antes de confirmar[cite: 506, 822].
- **Pattern:** State Machine para estados del pedido.

### DEV 3 — Flujo End-to-End
- [cite_start]**Meta:** Garantizar que Catálogo → Carrito → Pedido funcione sin fallos.
- **Caveman Rule:** Fix broken pipes. Ensure REST sync works.

### DEV 4 — AI Assistant Service
- **Meta:** Chat IA contextual. [cite_start]Responde disponibilidad y precio.
- [cite_start]**DB:** `assistant_db`[cite: 346].
- **Regla Estricta:** Usa datos reales del sistema. [cite_start]Cero alucinaciones[cite: 826, 827]. [cite_start]Prioriza exactitud operativa[cite: 828].

### DEV 5 — Recomendador / Sugerencias
- [cite_start]**Meta:** Sugerir alternativas al usuario.
- **Pattern:** Strategy Pattern (recomendación por autor vs categoría).

### DEV 6 — BFF Avanzado
- [cite_start]**Meta:** Orquestar el flujo comercial completo. [cite_start]Centralizar requests del frontend[cite: 420].
- **Regla Estricta:** BFF coordina, no calcula. [cite_start]Lógica de negocio prohibida aquí[cite: 833].

### DEV 7 — Auditoría Global del Sistema
- [cite_start]**Meta:** Trazabilidad operativa. Registrar eventos clave (ej: creación de pedidos).
- **Pattern:** Observer/Pub-Sub simulado o logs centralizados.

### DEV 8 — UI Final Integrada
- [cite_start]**Meta:** Experiencia cohesiva. Catálogo + Asistente + Pedidos en una sola UI fluida.

### DEV 9 — Despliegue e Integración Final
- [cite_start]**Meta:** Docker Compose completo y ejecutable de extremo a extremo. 
- **Caveman Rule:** 1 command up. `docker-compose up --build`. [cite_start]Health checks green[cite: 941, 946].

### DEV 10 — AI Assistant Service (Conversacional)
Agent-based chat para ayudar al admin y al cliente.
- **Stack**: LangChain / LangGraph + OpenAI/Claude API.
- **Pattern**: Agentic Workflow.
- **UX**: Chat flotante persistente.

### DEV 11 — Recommendation Service
Motor de sugerencias basado en historial y similitud.
- **Pattern**: Strategy (Collaborative filtering vs Content-based).
- **Integración**: Consume `catalog-service` y `pricing-service`.

---

## 5. DISEÑO UX/UI: REFERENCIAS RECOMENDADAS
Para un e-commerce de libros impulsado por IA, la referencia de oro es **Storygraph** (por sus datos) y **Perplexity** (por su interfaz de IA limpia).

### UX Checklist:
- **Búsqueda Semántica**: "Libros de terror para leer en un viaje corto".
- **Visual Pricing**: Gráficos de tendencia de precio (Price History).
- **Fichas Enriquecidas**: Uso de Skeletons durante la carga de IA.
- **Design System**: Tipografía Serif para títulos (libros) + Sans para UI (acción).
## 5. DISEÑO UX/UI Y REFERENCIAS VISUALES
El diseño no es genérico. Frontend must be fast, clean, and data-dense.

### Frontend Comercial (Catálogo y Pedidos)
- **Referencia Visual:** The Storygraph / Literal.
- **Estilo:** Fichas de libro limpias. Énfasis en metadatos (ISBN, autor, condición). 
- **Tipografía:** Serif para títulos de libros; Sans-serif para UI y botones.
- **UX:** Skeleton loaders durante las consultas al BFF.

### Frontend Administrativo (Pricing Dashboard)
- **Referencia Visual:** Tremor.so / Vercel Dashboard.
- **Estilo:** Dashboard SaaS analítico, no un e-commerce tradicional.
- **Componentes:** Usa "Area Charts" para historial de precios. Badges de estado (Verde = API Externa, Naranja = Fallback interno).

### Interfaz de IA (Asistente)
- **Referencia Visual:** Perplexity.
- **Estilo:** Chat minimalista. Las respuestas de la IA deben incluir la fuente de los datos (trazabilidad).

### Principio Base: Anticipatory Design
UI proactiva. Si el `ai-enrichment-service` falla y trae datos parciales, la UI no se rompe; muestra un badge de "Datos Incompletos" y permite continuar la compra.
---

## 6. DEFINITION OF DONE (CAVEMAN VERSION)
- Spec met.
- Tests > 80%. Green.
- Docker up. Health OK.
- No secrets.
- PR reviewed.

