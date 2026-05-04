export type StartupMetric = {
  label: string;
  value: string;
  detail: string;
};

export type PhotoStat = {
  label: string;
  value: string;
  detail: string;
};

export type Startup = {
  id: string;
  name: string;
  country: string;
  region: string;
  category: string;
  image: string;
  headline: string;
  description: string;
  technologies: string[];
  metrics: StartupMetric[];
  photoStats: PhotoStat[];
  contact: string;
};

export const startups: Startup[] = [
  {
    id: "helia-grid",
    name: "Helia Grid",
    country: "Mexico",
    region: "Latam Climate",
    category: "Energy AI",
    image: "/assets/01.webp",
    headline:
      "Orquesta microredes solares con IA para reducir cortes energeticos en comunidades industriales.",
    description:
      "Helia Grid conecta sensores, clima, demanda y baterias en una capa predictiva que decide cuando almacenar, vender o distribuir energia. Su tablero prioriza continuidad operativa, ahorro y trazabilidad de carbono.",
    technologies: ["Edge AI", "Digital twins", "LoRaWAN", "Battery analytics"],
    metrics: [
      { label: "energia monitoreada", value: "48M", detail: "kWh al ano" },
      { label: "menos cortes", value: "-32%", detail: "en pilotos activos" },
      { label: "nodos conectados", value: "1,240", detail: "sensores de red" }
    ],
    photoStats: [
      { label: "senal operativa", value: "98%", detail: "uptime en campo" },
      { label: "comunidades", value: "+18", detail: "microredes activas" },
      { label: "impacto", value: "ENERGIA LIMPIA", detail: "distribuida" }
    ],
    contact: "helia@500.demo"
  },
  {
    id: "nativa-orbit",
    name: "Nativa Orbit",
    country: "Colombia",
    region: "Bioeconomia",
    category: "Nature Data",
    image: "/assets/02.webp",
    headline:
      "Convierte imagenes satelitales y reportes de campo en creditos verificables de biodiversidad.",
    description:
      "Nativa Orbit ayuda a fincas, reservas y fondos climaticos a medir regeneracion con modelos MRV, mapas de especies y evidencia auditada. Cada proyecto queda listo para inversion de impacto.",
    technologies: ["Remote sensing", "MRV models", "Geospatial AI", "Blockchain proofs"],
    metrics: [
      { label: "hectareas medidas", value: "126K", detail: "con trazabilidad" },
      { label: "especies indexadas", value: "3,780", detail: "senal biologica" },
      { label: "auditorias listas", value: "74", detail: "paquetes MRV" }
    ],
    photoStats: [
      { label: "biomasa estimada", value: "+41%", detail: "en parcelas piloto" },
      { label: "aliados locales", value: "+372", detail: "guardianes de datos" },
      { label: "vertical", value: "NATURALEZA", detail: "y comunidad" }
    ],
    contact: "nativa@500.demo"
  },
  {
    id: "awake-health",
    name: "Awake Health",
    country: "Chile",
    region: "Health Access",
    category: "Rural Care",
    image: "/assets/03.webp",
    headline:
      "Lleva diagnostico asistido por IA a clinicas rurales con expedientes sincronizados sin conexion.",
    description:
      "Awake Health combina captura de signos vitales, triage conversacional y expedientes offline-first para que equipos medicos atiendan zonas con baja conectividad sin perder calidad clinica.",
    technologies: ["On-device AI", "FHIR", "Offline sync", "Privacy vaults"],
    metrics: [
      { label: "consultas asistidas", value: "92K", detail: "en 11 meses" },
      { label: "tiempo de triage", value: "-46%", detail: "por paciente" },
      { label: "clinicas piloto", value: "38", detail: "operando offline" }
    ],
    photoStats: [
      { label: "precision triage", value: "91%", detail: "validacion interna" },
      { label: "familias cubiertas", value: "+58K", detail: "acceso primario" },
      { label: "vertical", value: "SALUD", detail: "sin conexion" }
    ],
    contact: "awake@500.demo"
  },
  {
    id: "terra-ledger",
    name: "Terra Ledger",
    country: "Peru",
    region: "Fintech Impact",
    category: "Supply Chain",
    image: "/assets/04.webp",
    headline:
      "Financia cadenas agricolas con riesgo dinamico, pagos programables y trazabilidad de lote a lote.",
    description:
      "Terra Ledger une facturas, cosechas, contratos y datos logisticos para que compradores puedan adelantar capital a productores con reglas automatizadas y visibilidad de cumplimiento.",
    technologies: ["Smart contracts", "Risk scoring", "Open banking", "Traceability APIs"],
    metrics: [
      { label: "capital habilitado", value: "$31M", detail: "lineas rotativas" },
      { label: "menos mora", value: "-27%", detail: "vs. cartera base" },
      { label: "productores", value: "14K", detail: "con historial vivo" }
    ],
    photoStats: [
      { label: "pagos liberados", value: "2.8M", detail: "transacciones" },
      { label: "lotes trazados", value: "+63K", detail: "desde origen" },
      { label: "vertical", value: "CAPITAL", detail: "productivo" }
    ],
    contact: "terra@500.demo"
  },
  {
    id: "lumen-loop",
    name: "Lumen Loop",
    country: "Brasil",
    region: "Future Work",
    category: "AI Ops",
    image: "/assets/05.webp",
    headline:
      "Automatiza operaciones de soporte B2B con agentes que aprenden de tickets, llamadas y producto.",
    description:
      "Lumen Loop crea flujos de resolucion para equipos de customer success: detecta patrones, propone acciones, ejecuta tareas repetibles y escala solo cuando el contexto lo requiere.",
    technologies: ["Agentic workflows", "RAG", "Speech analytics", "CRM automations"],
    metrics: [
      { label: "tickets resueltos", value: "64%", detail: "sin escalacion" },
      { label: "horas ahorradas", value: "18K", detail: "cada trimestre" },
      { label: "integraciones", value: "42", detail: "SaaS conectados" }
    ],
    photoStats: [
      { label: "respuesta media", value: "22s", detail: "primer contacto" },
      { label: "equipos activos", value: "+210", detail: "ops y soporte" },
      { label: "vertical", value: "IA OPERATIVA", detail: "para SaaS" }
    ],
    contact: "lumen@500.demo"
  },
  {
    id: "civica-flow",
    name: "Civica Flow",
    country: "Argentina",
    region: "GovTech",
    category: "Public AI",
    image: "/assets/06.webp",
    headline:
      "Digitaliza tramites municipales con expedientes inteligentes, identidad segura y analitica civica.",
    description:
      "Civica Flow reemplaza procesos fragmentados por un sistema modular para permisos, pagos, turnos y seguimiento ciudadano. Los municipios obtienen tableros de capacidad y cuellos de botella en tiempo real.",
    technologies: ["Identity wallets", "Process mining", "Secure forms", "Data dashboards"],
    metrics: [
      { label: "tramites procesados", value: "1.7M", detail: "en sandbox" },
      { label: "menos espera", value: "-54%", detail: "en permisos" },
      { label: "municipios piloto", value: "23", detail: "con analitica" }
    ],
    photoStats: [
      { label: "satisfaccion", value: "4.8/5", detail: "encuesta ciudadana" },
      { label: "formularios", value: "+320", detail: "flujos listos" },
      { label: "vertical", value: "GOBIERNO", detail: "digital" }
    ],
    contact: "civica@500.demo"
  }
];
