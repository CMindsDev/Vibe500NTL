"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type Locale = "es" | "en";

const dictionaries: Record<Locale, Record<string, string>> = {
  es: {
    // Navbar / general
    "nav.inicio": "Inicio",
    "nav.portafolio": "Emprendimiento",
    "nav.ecos": "Ecos",
    "nav.natura": "Acerca de",

    // Hero
    "hero.verStartup": "Ver Startup",

    // Atlas
    "atlas.title": "ATLAS",

    // Card sections
    "section.descubre": "Descubre",
    "section.raices": "Raíces Firmes",
    "section.raices.subtitle":
      "Iniciativas que son destacadas por su arraigo en los territorios de NatureTech LAC.",
    "section.gobernanza": "Destacadas en Gobernanza Territorial",
    "section.gobernanza.subtitle":
      "Estos proyectos muestran un alto nivel de maduración de TRL.",
    "section.verTodos": "Ver todos",
    "section.verMas": "Ver más",

    // CTA
    "cta.title": "¡Sé parte de 500 Startups!",
    "cta.description":
      "¿Eres founder? ¿Incides en emprendimientos de base nature-tech en América Latina y el Caribe? Entonces añade tu startup ahora mismo.",
    "cta.button": "Crear proyecto",

    // Footer
    "footer.description":
      "NaturaTech LAC builds bridges between innovation, capital, and territories—so that Latin America's regeneration is financeable, scalable, and led by those who make it possible.",
    "footer.copyright": "© NatureTech LAC. Todos los derechos reservados. 2025",
    "footer.language": "Español",

    // Join selector
    "join.step1": "Paso 1",
    "join.selectType.title": "Selecciona tu tipo de organización",
    "join.selectType.description":
      "El formulario cambia de página según el tipo que selecciones.",
    "join.selectType.legend": "Tipo de organización",
    "join.type.startups": "Emprendimientos y startups",
    "join.type.investors": "Inversionistas y fondos",
    "join.type.accelerators": "Aceleradoras y habilitadores",
    "join.type.companies": "Empresas y cadenas de suministro",
    "join.continue": "Continuar",
    "join.back": "← Atrás",

    // Join validations and submit status
    "join.validation.required":
      "Completa los campos obligatorios para continuar.",
    "join.submit.sending": "Enviando...",
    "join.submit.success": "Formulario enviado correctamente.",
    "join.submit.error":
      "Ocurrió un error enviando el formulario. Intenta nuevamente.",

    // Companies and supply chains form
    "join.company.title": "Empresas y cadenas de suministro",
    "join.section.basic": "Información básica",
    "join.section.interest": "Interés",
    "join.section.description": "Descripción",
    "join.section.contact": "Contacto",
    "join.section.social": "Redes sociales",
    "join.section.classification": "Clasificación",
    "join.section.impact": "Impacto",
    "join.section.visualOptional": "Materiales visuales (opcional)",
    "join.section.investmentFocus": "Enfoque de inversión",
    "join.section.focus": "Enfoque",
    "join.company.name": "Nombre de la empresa",
    "join.company.sector": "Sector de la empresa",
    "join.company.hqCountry": "País sede",
    "join.company.website": "Sitio web",
    "join.company.email": "Correo de contacto",
    "join.company.interestType": "Tipo de interés",
    "join.company.interestType.placeholder": "Selecciona tipo de interés",
    "join.company.interestType.other": "Tipo de interés (especificar)",
    "join.company.categoriesLegend":
      "Categorías de producto o servicio que buscan",
    "join.company.category.other": "Categoría (especificar)",
    "join.company.targetGeographies": "Geografías de interés en LAC",
    "join.company.shortDescription": "Descripción breve (máx. 500 caracteres)",
    "join.company.linkedin": "LinkedIn de la empresa",
    "join.option.interest.regenSuppliers": "Busco proveedores regenerativos",
    "join.option.interest.traceability": "Busco soluciones de trazabilidad",
    "join.option.interest.insetting": "Busco compensar o insetting",
    "join.option.interest.multiple": "Varios",
    "join.option.common.other": "Otro",
    "join.option.category.naturalIngredients": "Ingredientes naturales",
    "join.option.category.agriRaw": "Materias primas agrícolas",
    "join.option.category.carbonCredits": "Créditos de carbono",
    "join.option.category.ecosystemServices": "Servicios ecosistémicos",

    // Shared option labels
    "join.option.track.bioeconomy": "Bioeconomía e ingredientes naturales",
    "join.option.track.regenerativeAg": "Agricultura regenerativa",
    "join.option.track.ecosystemRestoration": "Restauración de ecosistemas",
    "join.option.track.blueEconomy": "Economía azul y costera",
    "join.option.track.mrv": "Monitoreo y MRV",
    "join.option.track.aiConservation":
      "Inteligencia artificial para conservación",
    "join.option.track.traceability": "Trazabilidad y cadenas de valor",
    "join.option.track.carbonBiodiversity":
      "Créditos de carbono o biodiversidad",
    "join.option.stage.idea": "Idea",
    "join.option.stage.prototype": "Prototipo",
    "join.option.stage.firstSales": "Primeras ventas",
    "join.option.stage.growth": "Crecimiento",
    "join.option.stage.scale": "Escala",

    // Startups form
    "join.startup.title": "Emprendimientos y startups",
    "join.startup.subtitle":
      "Completa los campos obligatorios y deja opcionales los que no apliquen.",
    "join.startup.name": "Nombre del emprendimiento",
    "join.startup.operatingCountry": "País(es) de operación",
    "join.startup.website": "Sitio web",
    "join.startup.email": "Correo de contacto",
    "join.startup.header": "Titular (máx. 100 caracteres)",
    "join.startup.description": "Descripción (máx. 900 caracteres)",
    "join.startup.trackLegend": "Track temático (selección múltiple)",
    "join.startup.otherTrack": "Otro (especificar)",
    "join.startup.stage": "Etapa",
    "join.startup.stage.placeholder": "Selecciona una etapa",
    "join.startup.impactMetrics": "Métricas de impacto",
    "join.startup.video": "Video institucional",
    "join.startup.photo1": "Fotografía 1",
    "join.startup.photo2": "Fotografía 2",
    "join.startup.otherSocials": "Otras redes",
    "join.startup.previewNote":
      "Vista previa mapeada a Startup disponible para el siguiente paso de guardado.",

    // Investors form
    "join.investor.title": "Inversionistas y fondos",
    "join.investor.orgName": "Nombre de la organización",
    "join.investor.type": "Tipo",
    "join.investor.type.placeholder": "Selecciona tipo",
    "join.investor.type.other": "Tipo (especificar)",
    "join.investor.website": "Sitio web",
    "join.investor.email": "Correo de contacto",
    "join.investor.ticketSize": "Tamaño de ticket típico (rango en USD)",
    "join.investor.geographies": "Geografías de interés en LAC",
    "join.investor.trackLegend": "Tracks temáticos de interés",
    "join.investor.track.other": "Track (especificar)",
    "join.investor.stagesLegend": "Etapas que financian",
    "join.investor.shortDescription": "Descripción breve (máx. 500 caracteres)",
    "join.investor.publicProfile": "Sitio web o perfil público",
    "join.option.investor.impactFund": "Fondo de impacto",
    "join.option.investor.familyOffice": "Family office",
    "join.option.investor.devInstitution": "Institución de desarrollo",
    "join.option.investor.climateFund": "Fondo climático",
    "join.option.stage.seed": "Semilla",
    "join.option.stage.early": "Temprana",

    // Accelerators form
    "join.accelerator.title": "Aceleradoras y habilitadores",
    "join.accelerator.orgName": "Nombre del programa u organización",
    "join.accelerator.supportType": "Tipo de apoyo",
    "join.accelerator.supportType.placeholder": "Selecciona tipo de apoyo",
    "join.accelerator.supportType.other": "Tipo de apoyo (especificar)",
    "join.accelerator.countries": "País(es) donde operan",
    "join.accelerator.website": "Sitio web",
    "join.accelerator.email": "Correo de contacto",
    "join.accelerator.trackLegend": "Tracks temáticos que atienden",
    "join.accelerator.track.other": "Track (especificar)",
    "join.accelerator.stagesLegend": "Etapas que atienden",
    "join.accelerator.shortDescription":
      "Descripción breve (máx. 500 caracteres)",
    "join.option.support.incubation": "Incubación",
    "join.option.support.acceleration": "Aceleración",
    "join.option.support.techAssist": "Asistencia técnica",
    "join.option.support.grants": "Financiamiento no reembolsable",
    "join.option.support.mentoring": "Mentoría",
  },
  en: {
    // Navbar / general
    "nav.inicio": "Home",
    "nav.portafolio": "Ventures",
    "nav.ecos": "Ecos",
    "nav.natura": "About",

    // Hero
    "hero.verStartup": "View Startup",

    // Atlas
    "atlas.title": "ATLAS",

    // Card sections
    "section.descubre": "Discover",
    "section.raices": "Strong Roots",
    "section.raices.subtitle":
      "Initiatives highlighted for their deep roots in NatureTech LAC territories.",
    "section.gobernanza": "Featured in Territorial Governance",
    "section.gobernanza.subtitle":
      "These projects show a high level of TRL maturity.",
    "section.verTodos": "See all",
    "section.verMas": "See more",

    // CTA
    "cta.title": "Join 500 Startups!",
    "cta.description":
      "Are you a founder? Do you work in nature-tech ventures in Latin America and the Caribbean? Then add your startup now.",
    "cta.button": "Create project",

    // Footer
    "footer.description":
      "NaturaTech LAC builds bridges between innovation, capital, and territories—so that Latin America's regeneration is financeable, scalable, and led by those who make it possible.",
    "footer.copyright": "© NatureTech LAC. All rights reserved. 2025",
    "footer.language": "English",

    // Join selector
    "join.step1": "Step 1",
    "join.selectType.title": "Select your organization type",
    "join.selectType.description":
      "The form changes page based on the selected type.",
    "join.selectType.legend": "Organization type",
    "join.type.startups": "Ventures and startups",
    "join.type.investors": "Investors and funds",
    "join.type.accelerators": "Accelerators and enablers",
    "join.type.companies": "Companies and supply chains",
    "join.continue": "Continue",
    "join.back": "← Back",

    // Join validations and submit status
    "join.validation.required":
      "Please complete the required fields to continue.",
    "join.submit.sending": "Sending...",
    "join.submit.success": "Form sent successfully.",
    "join.submit.error":
      "An error occurred while sending the form. Please try again.",

    // Companies and supply chains form
    "join.company.title": "Companies and supply chains",
    "join.section.basic": "Basic information",
    "join.section.interest": "Interest",
    "join.section.description": "Description",
    "join.section.contact": "Contact",
    "join.section.social": "Social media",
    "join.section.classification": "Classification",
    "join.section.impact": "Impact",
    "join.section.visualOptional": "Visual materials (optional)",
    "join.section.investmentFocus": "Investment focus",
    "join.section.focus": "Focus",
    "join.company.name": "Company name",
    "join.company.sector": "Company sector",
    "join.company.hqCountry": "Headquarter country",
    "join.company.website": "Website",
    "join.company.email": "Contact email",
    "join.company.interestType": "Interest type",
    "join.company.interestType.placeholder": "Select interest type",
    "join.company.interestType.other": "Interest type (specify)",
    "join.company.categoriesLegend":
      "Product or service categories you are looking for",
    "join.company.category.other": "Category (specify)",
    "join.company.targetGeographies": "Geographies of interest in LAC",
    "join.company.shortDescription": "Brief description (max. 500 characters)",
    "join.company.linkedin": "Company LinkedIn",
    "join.option.interest.regenSuppliers": "Looking for regenerative suppliers",
    "join.option.interest.traceability": "Looking for traceability solutions",
    "join.option.interest.insetting": "Looking for compensation or insetting",
    "join.option.interest.multiple": "Multiple",
    "join.option.common.other": "Other",
    "join.option.category.naturalIngredients": "Natural ingredients",
    "join.option.category.agriRaw": "Agricultural raw materials",
    "join.option.category.carbonCredits": "Carbon credits",
    "join.option.category.ecosystemServices": "Ecosystem services",

    // Shared option labels
    "join.option.track.bioeconomy": "Bioeconomy and natural ingredients",
    "join.option.track.regenerativeAg": "Regenerative agriculture",
    "join.option.track.ecosystemRestoration": "Ecosystem restoration",
    "join.option.track.blueEconomy": "Blue and coastal economy",
    "join.option.track.mrv": "Monitoring and MRV",
    "join.option.track.aiConservation": "AI for conservation",
    "join.option.track.traceability": "Traceability and value chains",
    "join.option.track.carbonBiodiversity": "Carbon or biodiversity credits",
    "join.option.stage.idea": "Idea",
    "join.option.stage.prototype": "Prototype",
    "join.option.stage.firstSales": "First sales",
    "join.option.stage.growth": "Growth",
    "join.option.stage.scale": "Scale",

    // Startups form
    "join.startup.title": "Ventures and startups",
    "join.startup.subtitle":
      "Complete required fields and leave optional ones blank if they do not apply.",
    "join.startup.name": "Venture name",
    "join.startup.operatingCountry": "Operating country(ies)",
    "join.startup.website": "Website",
    "join.startup.email": "Contact email",
    "join.startup.header": "Headline (max. 100 characters)",
    "join.startup.description": "Description (max. 900 characters)",
    "join.startup.trackLegend": "Thematic track (multiple selection)",
    "join.startup.otherTrack": "Other (specify)",
    "join.startup.stage": "Stage",
    "join.startup.stage.placeholder": "Select a stage",
    "join.startup.impactMetrics": "Impact metrics",
    "join.startup.video": "Institutional video",
    "join.startup.photo1": "Photo 1",
    "join.startup.photo2": "Photo 2",
    "join.startup.otherSocials": "Other social networks",
    "join.startup.previewNote":
      "Startup-mapped preview available for the next save step.",

    // Investors form
    "join.investor.title": "Investors and funds",
    "join.investor.orgName": "Organization name",
    "join.investor.type": "Type",
    "join.investor.type.placeholder": "Select type",
    "join.investor.type.other": "Type (specify)",
    "join.investor.website": "Website",
    "join.investor.email": "Contact email",
    "join.investor.ticketSize": "Typical ticket size (USD range)",
    "join.investor.geographies": "Geographies of interest in LAC",
    "join.investor.trackLegend": "Thematic tracks of interest",
    "join.investor.track.other": "Track (specify)",
    "join.investor.stagesLegend": "Stages they fund",
    "join.investor.shortDescription": "Brief description (max. 500 characters)",
    "join.investor.publicProfile": "Website or public profile",
    "join.option.investor.impactFund": "Impact fund",
    "join.option.investor.familyOffice": "Family office",
    "join.option.investor.devInstitution": "Development institution",
    "join.option.investor.climateFund": "Climate fund",
    "join.option.stage.seed": "Seed",
    "join.option.stage.early": "Early",

    // Accelerators form
    "join.accelerator.title": "Accelerators and enablers",
    "join.accelerator.orgName": "Program or organization name",
    "join.accelerator.supportType": "Support type",
    "join.accelerator.supportType.placeholder": "Select support type",
    "join.accelerator.supportType.other": "Support type (specify)",
    "join.accelerator.countries": "Country(ies) where you operate",
    "join.accelerator.website": "Website",
    "join.accelerator.email": "Contact email",
    "join.accelerator.trackLegend": "Thematic tracks you support",
    "join.accelerator.track.other": "Track (specify)",
    "join.accelerator.stagesLegend": "Stages supported",
    "join.accelerator.shortDescription":
      "Brief description (max. 500 characters)",
    "join.option.support.incubation": "Incubation",
    "join.option.support.acceleration": "Acceleration",
    "join.option.support.techAssist": "Technical assistance",
    "join.option.support.grants": "Non-repayable funding",
    "join.option.support.mentoring": "Mentoring",
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "es",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? key,
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
