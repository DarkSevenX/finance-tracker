/** Contenido educativo de la landing — estructura para render dinámico. */
import {
  Brain,
  Ban,
  Pin,
  CircleDollarSign,
  Eye,
  CreditCard,
  Settings2,
  Zap,
  Rocket,
  ArrowDownToLine,
  ArrowUpFromLine,
  Landmark,
  ArrowRightLeft,
  Tags,
  Scale,
  Target
} from "lucide-react";

export const coreFeaturesIntro = {
  title: "Control total de tu dinero",
  lead:
    "Una forma sencilla de organizar tus finanzas: registra tus cuentas reales, anota tus ingresos y clasifica tus gastos.",
  footnote:
    "Es flexible: tú creas las categorías que necesites y decides cómo gestionar cada centavo sin reglas estrictas.",
} as const;

export const coreFeaturesColumns = [
  {
    id: "ingresos",
    title: "Ingresos",
    accent: "emerald" as const,
    items: [
      "Registra tu salario",
      "Trabajos freelance",
      "Rendimientos e inversiones",
      "Transferencias recibidas",
    ],
  },
  {
    id: "gastos",
    title: "Gastos",
    accent: "amber" as const,
    items: [
      "Compras y supermercado",
      "Pago de servicios",
      "Entretenimiento y salidas",
      "Cualquier otra salida de dinero",
    ],
  },
  {
    id: "cuentas",
    title: "Cuentas",
    accent: "violet" as const,
    items: [
      "Efectivo en mano",
      "Cuentas bancarias",
      "Tarjetas de crédito",
      "Traspasos internos",
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
    { text: "Sabes en qué usas tu dinero.", icon: Brain },
    { text: "Evitas gastar por impulso o endeudarte sin darte cuenta.", icon: Ban },
    { text: "Puedes priorizar lo que de verdad te importa.", icon: Pin },
    { text: "Tienes un plan para ahorrar, pagar deudas o invertir.", icon: CircleDollarSign },
  ],
  quote:
    "Piensa en tu presupuesto como un mapa: te muestra el camino hacia tus metas y evita que te pierdas (o gastes de más).",
} as const;

export const templateSection = {
  title: "¿Por qué elegir boo-money?",
  lead: "Pensada para organizar tus finanzas sin dolores de cabeza.",
  bullets: [
    { text: "Visualizar **tus ingresos y gastos** en un solo lugar.", icon: Eye },
    { text: "Llevar el saldo real de todas tus **cuentas y tarjetas**.", icon: CreditCard },
    { text: "Adaptarte si tienes sueldo fijo o ingresos variables.", icon: Settings2 },
    { text: "Registrar movimientos en segundos.", icon: Zap },
    { text: "Pasar de “modo sobrevivir” a “modo planificar”.", icon: Rocket },
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
    title: "Gráficos",
    body: "Evolución de ingresos y gastos en los últimos meses.",
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
    { term: "Ingresos", def: "Todo lo que recibes (salario, freelance, propinas, regalos).", icon: ArrowDownToLine },
    { term: "Gastos", def: "Todo lo que sale de tu bolsillo.", icon: ArrowUpFromLine },
    { term: "Cuentas", def: "Donde guardas tu dinero: bancos, efectivo, tarjetas.", icon: Landmark },
    { term: "Traspasos", def: "Movimientos entre tus propias cuentas, sin afectar tus totales.", icon: ArrowRightLeft },
    { term: "Categorías", def: "Etiquetas para saber exactamente en qué gastas.", icon: Tags },
    { term: "Balance", def: "La suma total de todas tus cuentas.", icon: Scale },
    { term: "Metas financieras", def: "Objetivos grandes: un viaje, pagar la tarjeta, una compra importante.", icon: Target },
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

