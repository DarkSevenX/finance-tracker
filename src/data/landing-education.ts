/** Contenido educativo de la landing — estructura para render dinámico. */

export const rule502030Intro = {
  title: "¿Qué es la regla del 50-30-20?",
  lead:
    "Una forma sencilla de organizar tus finanzas: divides tus ingresos en tres bloques con un equilibrio claro.",
  footnote:
    "Es flexible: si un mes tienes un gasto extra o quieres guardar más, puedes ajustar sin culpa.",
} as const;

export const rule502030Columns = [
  {
    pct: 50,
    title: "Necesidades básicas",
    accent: "emerald" as const,
    items: [
      "Pago de alquiler",
      "Servicios básicos (luz, agua, gas, internet…)",
      "Alimentación",
      "Transporte",
      "Gastos médicos esenciales",
      "Seguros básicos",
    ],
  },
  {
    pct: 30,
    title: "Deseos (no básicos)",
    accent: "amber" as const,
    items: [
      "Entretenimiento y salidas",
      "Suscripciones (streaming, gym…)",
      "Compras no esenciales",
      "Viajes de placer",
      "Hobbies",
    ],
  },
  {
    pct: 20,
    title: "Ahorros",
    accent: "violet" as const,
    items: [
      "Fondo de emergencia",
      "Jubilación",
      "Inversiones",
      "Pago de deudas",
    ],
  },
] as const;

export const budgetingSection = {
  title: "¿Qué es presupuestar y por qué importa?",
  paragraphs: [
    "Presupuestar es crear un plan para decidir a dónde va tu dinero, antes de que se te escape.",
    "No es algo aburrido ni solo para quien ama los números: es una herramienta para que tus decisiones sean conscientes, no impulsivas.",
  ],
  bullets: [
    { text: "Sabes en qué usas tu dinero.", emoji: "🧠" },
    { text: "Evitas gastar por impulso o endeudarte sin darte cuenta.", emoji: "🚫" },
    { text: "Puedes priorizar lo que de verdad te importa.", emoji: "📌" },
    { text: "Tienes un plan para ahorrar, pagar deudas o invertir.", emoji: "💵" },
  ],
  quote:
    "Piensa en tu presupuesto como un mapa: te muestra el camino hacia tus metas y evita que te pierdas (o gastes de más).",
} as const;

export const templateSection = {
  title: "¿Por qué elegir boo-money?",
  lead: "Pensada para organizar tus finanzas sin dolores de cabeza.",
  bullets: [
    { text: "Visualizar **tus ingresos y gastos** en un solo lugar.", emoji: "👀" },
    { text: "Dividir tu dinero con la **regla 50/30/20** (equilibrio necesidades / disfrute / ahorro).", emoji: "💵" },
    { text: "Adaptarte si tienes sueldo fijo o ingresos variables.", emoji: "🤩" },
    { text: "Seguir metas de ahorro con barras de progreso.", emoji: "🎯" },
    { text: "Pasar de “modo sobrevivir” a “modo planificar”.", emoji: "😼" },
  ],
  closing: "Sin fórmulas raras ni hojas infinitas de Excel: un espacio fácil y personalizable.",
} as const;

/** Funciones concretas de la app (complemento al mensaje anterior). */
export const appCapabilities = [
  {
    n: "01",
    title: "Cuentas",
    body: "Efectivo, bancos y tarjetas con saldo por cuenta.",
  },
  {
    n: "02",
    title: "50/30/20",
    body: "Porcentajes editables e ingresos sin reparto si lo prefieres.",
  },
  {
    n: "03",
    title: "Categorías",
    body: "Subcategorías opcionales para ordenar gastos.",
  },
] as const;

export const conceptsSection = {
  title: "Conceptos clave",
  lead: "Antes de lanzarte, un vocabulario rápido:",
  items: [
    { term: "Ingresos", def: "Todo lo que recibes (salario, freelance, propinas, regalos).", emoji: "💵" },
    { term: "Gastos", def: "Todo lo que sale de tu bolsillo.", emoji: "💸" },
    { term: "Necesidades", def: "Lo esencial para vivir: alquiler, luz, comida, transporte.", emoji: "❗" },
    { term: "Deseos", def: "Lo que mejora tu vida o te divierte: salidas, ropa, hobbies, streaming.", emoji: "😋" },
    { term: "Ahorros / inversión", def: "Dinero que guardas o haces crecer: emergencias, deudas, inversiones, estudios.", emoji: "💰" },
    { term: "Fondo de emergencia", def: "Colchón si pierdes ingresos o aparece un imprevisto.", emoji: "🚨" },
    { term: "Metas financieras", def: "Objetivos grandes: un viaje, pagar la tarjeta, una compra importante.", emoji: "🎯" },
  ],
  closing: "Con estas ideas claras, el resto encaja solo.",
} as const;

export const conclusionSection = {
  title: "Conclusión rápida",
  lead: "Presupuestar no es quitarte libertad, es dártela:",
  freedoms: [
    "Libertad de gastar sin remordimientos.",
    "Libertad de ahorrar sin sentir que sufres.",
    "Libertad de dormir tranquilo sabiendo que tus finanzas no te controlan a ti.",
  ],
  rememberTitle: "Recuerda",
  remember: [
    "No se trata de ser perfecto, sino de ser constante y consciente.",
    "Puedes empezar poco a poco, adaptar la plantilla a tu vida y celebrar tus progresos.",
  ],
} as const;
