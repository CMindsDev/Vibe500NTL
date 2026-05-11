import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const startups = [
  // ─── Split 1: IDs 1–5 ───
  {
    id: 1,
    name: "Codebreaker",
    category: "Datos y Tecnología Ambiental",
    website: "https://codebreaker.bio/",
    operatingCountry: "Chile",
    operatingCoordinates: "-41.273969, -73.010122",
    basedCountry: "Chile",
    basedCoordinates: "-41.273969, -73.010122",
    header: "ADN e IA para optimizar la producción",
    tracks: "Foodtech, Aquacultura",
    description:
      "Codebreaker Bioscience es una startup chilena de biotecnología que ayuda a productores agrícolas y acuícolas a entender y gestionar los microbiomas de suelo, agua y alimentos mediante tecnología avanzada de secuenciación de ADN e inteligencia artificial. Su plataforma Micro-ID™ analiza los microorganismos presentes en entornos productivos para anticipar riesgos, mejorar la salud biológica y aumentar la eficiencia de la producción. A partir de esos datos complejos, transforma la información en decisiones prácticas que reducen pérdidas y favorecen prácticas más sostenibles.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Codebreaker/video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Codebreaker/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Codebreaker/Image2.webp",
    impacto:
      "Codebreaker está transformando la producción de alimentos al permitir a productores anticipar riesgos sanitarios, maximizar rendimientos y producir de manera más sostenible mediante el análisis avanzado del microbioma con su plataforma Micro-ID™, usando secuenciación de ADN e inteligencia artificial para convertir datos invisibles en decisiones concretas que mejoran eficiencia y sostenibilidad en acuicultura, agricultura y otros sistemas productivos.",
    data1:
      "El factor invisible que define la productividad\n\nEl microbioma aunque no se ve determina la salud, el crecimiento y la eficiencia de sistemas productivos como la acuicultura y la agricultura. Cuando está en equilibrio, aumenta el rendimiento y reduce enfermedades; cuando se desequilibra, crecen las pérdidas y baja la productividad. Codebreaker se ha dado cuenta que gestionarlo es clave para producir más con menos y de manera sostenible.",
    data2:
      "Plataforma Clave: Su plataforma principal, Micro-ID™, junto con soluciones como Micro-Safe™ y Micro-Digital Twin™, permiten identificar y gestionar microbiomas para mejorar salud, rendimiento y sostenibilidad en sistemas productivos.",
    data3:
      "Tecnología Aplicada: La plataforma combina biología molecular, robótica, informática e inteligencia artificial para transformar datos de microbiomas invisibles en decisiones productivas inteligentes.",
    quote: "Diseñamos redes de microorganismos para el bien de la humanidad.",
    quoteName: "Alejandro Bisquertt\nCEO & Co-fundador",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Codebreaker/Quotephoto.webp",
  },
  {
    id: 2,
    name: "EIRÚ",
    category: "Datos y Tecnología Ambiental",
    website: "https://eiru.tech/#prensa",
    operatingCountry: "Panamá",
    operatingCoordinates: "8.348485, -82.290451",
    basedCountry: "Argentina",
    basedCoordinates: "-35.924766, -66.806960",
    header: "Tecnología que mide y protege la biodiversidad en tiempo real",
    tracks: "Agricultura sustentable",
    description:
      "EIRU es una startup tecnológica argentina que desarrolla soluciones de monitoreo, reporte y verificación de biodiversidad para ayudar a empresas, gobiernos y organizaciones a evaluar, gestionar y predecir el estado de los ecosistemas de forma accesible y rigurosa usando imágenes satelitales, dispositivos IoT y modelos de simulación. Su tecnología permite transformar datos ambientales complejos en información accionable para la toma de decisiones.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Eiru/Video.webp",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Eiru/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Eiru/Image2.webp",
    impacto:
      "EIRU está cerrando la brecha crítica de datos sobre biodiversidad al ofrecer un sistema accesible y escalable de Monitoreo, Reporte y Verificación (MRV) que permite medir la salud de los ecosistemas en tiempo real usando imágenes satelitales, sensores IoT y modelos predictivos —algo tradicionalmente muy costoso y difícil de hacer con métodos convencionales.",
    data1:
      "Sistema propio MRV de biodiversidad: EIRU desarrolló un sistema de Monitoreo, Reporte y Verificación (MRV) para medir la salud de la biodiversidad, enfocado en dos indicadores clave: polinizadores y plantas.",
    data2:
      "Tecnologías integradas: Su plataforma combina imágenes satelitales y dispositivos IoT de campo para evaluar ecosistemas y generar datos accionables sobre biodiversidad.",
    data3:
      "Enfoque de impacto: Los resultados del MRV se usan para analizar tendencias ecológicas y predecir el impacto de prácticas sostenibles, facilitando decisiones basadas en datos para regenerar y proteger ecosistemas.",
    quote:
      "Podemos producir más mientras protegemos la vida que hace posible esa producción.",
    quoteName: "Lucas Garibaldi\n\nCo-Fundador & Director Científico",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Eiru/Quotephoto.webp",
  },
  {
    id: 3,
    name: "Amazonía Emprende",
    category: "Biodiversidad y Restauración",
    website: "www.amazoniaemprende.com",
    operatingCountry: "Colombia",
    operatingCoordinates:
      "Caquetá: 1.682691, -75.773327\nPutumayo: 0.343937, -75.839875",
    basedCountry: "Florencia, Colombia",
    basedCoordinates: "1.626857, -75.571425",
    header:
      "Restaurando la Amazonía: ciencia, comunidad y acción para regenerar el bosque",
    tracks: "Bosques y selvas, Agricultura sustentable",
    description:
      "Amazonía Emprende es una empresa social colombiana dedicada a la restauración ecológica y la conservación de la Amazonía, especialmente en Caquetá. Trabaja en la recuperación de bosques degradados mediante la producción y siembra de especies nativas desde su Centro de Semillas. Además, impulsa procesos de investigación, educación y formación a través de su Escuela Bosque. Su modelo integra ciencia, restauración y trabajo con comunidades locales para generar alternativas económicas sostenibles y contribuir a frenar la deforestación.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Amazonia%20Emprende/Video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Amazonia%20Emprende/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Amazonia%20Emprende/Image2.webp",
    impacto:
      "Amazonía Emprende genera impacto restaurando bosques degradados en la Amazonía colombiana, produciendo especies nativas desde su Centro de Semillas y formando comunidades en prácticas de restauración ecológica. Desde Caquetá, operan como un laboratorio vivo que integra ciencia, educación y acción en territorio. Su modelo impulsa economías locales sostenibles y contribuye a frenar la deforestación y recuperar la biodiversidad.",
    data1:
      "30 hectáreas restauradas: Han restaurado y desarrollado un laboratorio vivo de restauración de 30 hectáreas en su sede en Caquetá, demostrando modelos replicables de recuperación de bosques degradados.",
    data2:
      'Más de 13,000 árboles nativos: En las 30 hectáreas de la "Escuela Bosque" han sembrado más de 13 000 árboles nativos de alrededor de 60 especies distintas para enriquecer áreas degradadas y biodiversas.',
    data3:
      "Un saber compartido: A través de Escuela Bosque y Escuela Páramo, se comparte conocimiento y colaboran con emprendedores, familias rurales, empresas, jóvenes y niños en restauración ecológica y prácticas sostenibles, fortaleciendo capacidades locales para proteger y regenerar la Amazonía.",
    quote: null,
    quoteName:
      "Julio Andrés Rozo -\nEcosystem Restoration Director at Amazonía Emprende",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Amazonia%20Emprende/Quotephoto.webp",
  },
  {
    id: 4,
    name: "Regenera",
    category: "Biodiversidad y Restauración",
    website: "www.regenera.earth",
    operatingCountry: "Perú",
    operatingCoordinates:
      "Paucartambo: -13.312830, -71.594725\nRequena: -5.065887, -73.850777\nMachu Picchu: -13.163229, -72.545145\nAbancay: -13.641067, -72.891612",
    basedCountry: "Perú",
    basedCoordinates: "-9.995844, -74.768829",
    header: "Un impacto positivo para la tierra",
    tracks: "Bosques y selvas, Agricultura sustentable, Economía azul",
    description:
      "Regenera conecta empresas con la naturaleza para transformar impacto en regeneración real. Trabaja en la Amazonía y los Andes del Perú ayudando a medir, reducir y compensar la huella ambiental, mientras canaliza recursos hacia comunidades guardianas del territorio. Más que plantar árboles, impulsa la regeneración integral de ecosistemas liderada por quienes mejor conocen la tierra, creando alianzas que restauran paisajes, fortalecen comunidades y generan impacto climático positivo.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Regenera/Video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Regenera/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Regenera/Image2.webp",
    impacto:
      "Regenera trabaja con gestores de paisaje locales, proporcionando apoyo técnico y financiero para proteger y restaurar ecosistemas, compensar emisiones y fomentar la gestión regenerativa de territorios naturales, logrando resultados ambientales, climáticos y sociales medibles.",
    data1:
      "350 249 toneladas de emisiones de carbono han sido evitadas o capturadas gracias a sus acciones de protección y restauración.",
    data2:
      "24 gestores de paisaje (Guardianes) reciben apoyo técnico y financiero para proteger y restaurar sus territorios.",
    data3:
      "3 207 hasta más de 108 000 hectáreas bajo gestión regenerativa, incluyendo bosque y turberas bajo restauración. En diferentes paisajes gestionados por la plataforma.",
    quote:
      "Estamos orgullosos de las miles de hectáreas de paisajes vivos que estamos regenerando en la Amazonía y los Andes del Perú. Pero apenas estamos comenzando. Y todas las personas tienen un papel que desempeñar. ¡Ahora es el momento de actuar!",
    quoteName: "Frank Hajek CEO Regenera",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Regenera/Quotephoto.webp",
  },
  {
    id: 5,
    name: "Reforest Latam",
    category: "Biodiversidad y Restauración",
    website: "www.reforest-latam.com",
    operatingCountry: "Brazil",
    operatingCoordinates: "-9.250109, -54.802986",
    basedCountry: "Argentina",
    basedCoordinates: "-26.831722, -65.219897",
    header: "Plantando Tecnología",
    tracks: "Bosques y selvas",
    description:
      "ReForest LATAM, es una empresa que combina biotecnología, inteligencia artificial y drones para acelerar la reforestación de bosques y ecosistemas degradados, superando las limitaciones de los métodos tradicionales. Desarrolla cápsulas de semillas (iSeeds) con biotecnología que maximizan la germinación y crecimiento de especies nativas, las cuales son dispersadas por drones incluso en terrenos de difícil acceso.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/ReForest%20LATAm/video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/ReForest%20LATAm/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/ReForest%20LATAm/Image2.webp",
    impacto:
      "Reforest Latam ha intervenido y reforestado con su tecnología de drones e inteligencia artificial, usando cápsulas biotecnológicas de semillas nativas para regenerar ecosistemas degradados. Su método tecnológico permite sembrar miles de árboles por día, reforestando áreas inaccesibles mucho más rápido que con plantación tradicional.",
    data1:
      "Más de 400 hectáreas intervenidas en Argentina y Brasil con su tecnología de reforestación mediante drones e inteligencia artificial.",
    data2:
      "14 proyectos activos de restauración de ecosistemas en Argentina, Bolivia y Brasil.",
    data3:
      "Un esfuerzo que vuelve al origen: Más allá de plantar, se enfocan en restaurar la estructura y función ecológica de los bosques, favoreciendo la recuperación de su biodiversidad original.",
    quote:
      '"Nuestra visión es clara: reforestar bosques, regenerar ecosistemas y asegurar un futuro sostenible"',
    quoteName:
      "Damián Rivadeneira\nCEO & Founder en ReForest Latam | Assisted Natural Regeneration | Nature-Based Solutions",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/ReForest%20LATAm/Quotephoto.webp",
  },

  // ─── Split 2: IDs 11–15 ───
  {
    id: 11,
    name: "Bilda Education",
    category: "Economía Sostenible",
    website: "https://bildaeducation.com/",
    operatingCountry: "Ecuador",
    operatingCoordinates: "-0.185146, -78.479373",
    basedCountry: "Ecuador",
    basedCoordinates: "-1.8312, -78.1834",
    header: "Aprendizaje efectivo e impacto medible con WhatsApp",
    tracks: "Bosques y selvas, Agricultura sustentable",
    description:
      "Bilda Education es una startup de tecnología educativa con sede en Quito, Ecuador, que desarrolla chatbots para empoderar comunidades y transformar información en impacto medible. A través de aprendizaje conversacional en plataformas accesibles como WhatsApp y SMS, permite que organizaciones capaciten personas, recopilen información directamente desde el territorio y comprendan, en tiempo real, qué tan efectivos son sus programas en campo.",
    video: null,
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Bilda%20Education/image1.jpg",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Bilda%20Education/image2.jpg",
    impacto:
      "Una solución que transforma conversaciones en impacto medible, permitiendo que organizaciones capaciten, escuchen y acompañen a comunidades a través de WhatsApp mientras recopilan datos que ayudan a mejorar decisiones y resultados en sus programas.",
    data1:
      "Conocimiento en un Mensaje: Entrega contenidos cortos e interactivos directamente en WhatsApp, sin necesidad de descargar aplicaciones.",
    data2:
      "Recolección de datos: Permite hacer encuestas, diagnósticos y seguimiento a participantes en tiempo real.",
    data3:
      "Medición de impacto: Genera dashboards e informes para que organizaciones evalúen resultados y mejoren sus programas.",
    quote: null,
    quoteName: "David Vasquez L. CEO",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Bilda%20Education/Quote%20Photo.jpg",
  },
  {
    id: 12,
    name: "Foresta Labs",
    category: "Economía Sostenible",
    website: "https://foresta.network",
    operatingCountry: "Ecuador, Costa Rica, Brazil, Colombia",
    operatingCoordinates:
      "Ecuador: -1.8312, -78.1834\nCosta Rica: 9.7489, -83.7534\nBrasil: -14.2350, -51.9253\nColombia: 4.5709, -74.2973",
    basedCountry: "Ecuador",
    basedCoordinates: "-1.8312, -78.1834",
    header: "Empoderando futuros a través de finanzas sostenibles",
    tracks: "Bosques y selvas",
    description:
      "Foresta es un protocolo para la emisión, comercio y gestión de créditos de carbono certificados que redefine esfuerzos globales de conservación aprovechando el poder de la gobernanza impulsada por la comunidad y validación descentralizada.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Foresta/Video.webm",
    image1: null,
    image2: null,
    impacto:
      "Al combinar blockchain, inteligencia artificial y monitoreo en tiempo real, la iniciativa busca mejorar la confianza en los créditos de carbono, facilitar el acceso de comunidades a financiamiento climático y generar modelos sostenibles que protejan los ecosistemas mientras apoyan economías locales.\n\nEste enfoque permite que los esfuerzos de conservación sean medibles, verificables y escalables, promoviendo una relación más directa entre quienes protegen los bosques y quienes invierten en su preservación.",
    data1:
      "Tecnología de confianza para mercados comunitarios de carbono: Plataforma descentralizada basada en blockchain para la gestión transparente de créditos de carbono comunitarios.",
    data2: "Radar Forestal: Monitoreo de bosques en tiempo real",
    data3: "Comunidades al Centro del Cambio: Fortalecen las capacidades de las comunidades locales para que lideren la gestión sostenible de sus territorios. Promoviendo su participación en la toma de decisiones, impulsando autonomía, conocimiento técnico y oportunidades económicas que generan impacto ambiental y social duradero.",
    quote: null,
    quoteName:
      "CriptoPoeta_Full-Stack Dev & Conservation Scientist, Rafat_Full_Stack Blockchain Engineer, Damienx_Back-End & Blockchain Engineer, SoniSondeis_Communications & Political Scientist",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Foresta/Quote%20Photo.png",
  },
  {
    id: 13,
    name: "HeyTierra!",
    category: "Biodiversidad y Restauración",
    website: "heytierra.mx",
    operatingCountry: "México",
    operatingCoordinates: "23.6345, -102.5528",
    basedCountry: "Mexico",
    basedCoordinates: "23.6345, -102.5528",
    header:
      "Regenerando la biodiversidad urbana a través de tecnología y comunidad",
    tracks: "Ciudades positivas para la naturaleza",
    description:
      "HeyTierra! MX es una iniciativa que impulsa la regeneración de la biodiversidad urbana en México combinando tecnología, educación y participación comunitaria. A través de herramientas digitales, inteligencia artificial, sensores ambientales y un marketplace sostenible, facilita que las personas comiencen a cultivar y cuidar la naturaleza en entornos urbanos de forma sencilla, accesible y atractiva.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/HeyTierra/Video.mp4",
    image1: null,
    image2: null,
    impacto:
      "Transformación de la relación entre las personas y la naturaleza en entornos urbanos.\nA través de educación gamificada, tecnología para monitorear microclimas y la regeneración de microbiomas del suelo, HeyTierra! MX impulsa comunidades más sostenibles, resilientes y conectadas con la biodiversidad.",
    data1:
      "Suelos Vivos, Ciudades Vivas: Promueve la restauración de microbiomas del suelo, base para regenerar ecosistemas urbanos saludables.",
    data2:
      "Biodiversidad que Regresa a la Ciudad: Impulsa la reintroducción de especies nativas en entornos urbanos junto con especialistas locales.",
    data3:
      "Acción Ambiental con Valor Digital: Genera acciones ambientales incentivadas con tokens, fomentando la participación ciudadana y una economía circular sostenible.",
    quote: null,
    quoteName: null,
    quotePhoto: null,
  },
  {
    id: 14,
    name: "YAWA PLANETA SAC",
    category: "Economía Sostenible",
    website: "www.yawa.io",
    operatingCountry: "Perú",
    operatingCoordinates: "-9.1900, -75.0152",
    basedCountry: "Perú",
    basedCoordinates: "-9.1900, -75.0152",
    header: "Innovación tecnológica para la sostenibilidad del agua",
    tracks: "Economía azul",
    description:
      "Yawa Planeta SAC es una iniciativa que utiliza tecnología digital para mejorar la gestión y sostenibilidad del agua. A través de una plataforma web que integra distintas tecnologías, trabajan con el sector agrícola, ciudades e industria para optimizar el uso del recurso hídrico. Actualmente incorporan inteligencia artificial para ofrecer recomendaciones personalizadas que ayuden a aumentar la eficiencia y promover un manejo más sostenible del agua.",
    video: null,
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/YAWA/imagen1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/YAWA/imagen2.webp",
    impacto:
      "Yawa Planeta SAC impulsa un comercio electrónico de tecnologías para la sostenibilidad del agua apoyado por inteligencia artificial. La iniciativa facilita la adopción de soluciones que mejoran la eficiencia en el uso del agua, contribuyen a la conservación de ríos, lagos y acuíferos, y promueven prácticas que reducen el impacto ambiental de las actividades productivas.",
    data1:
      "Decisiones Hídricas con IA: Implementación de IA para recomendar tecnologías de uso eficiente del agua según cada contexto.",
    data2:
      "Protección Azul para un Futuro Verde: Contribución a la protección de ecosistemas y biodiversidad al reducir la presión sobre fuentes hídricas naturales.",
    data3:
      "Logística Inteligente: Optimización logística y de suministro que ayuda a disminuir emisiones asociadas al transporte y distribución.",
    quote:
      '"Resolver grandes problemas no siempre requiere gran tecnología. Requiere ideas creativas y grandes compromisos. Nunca dejes de creer en tus propias ideas, porque puedes cambiar la historia"',
    quoteName: "Max Hidalgo Quinto_ director ejecutivo de YAWA",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/YAWA/Quote%20Photo.webp",
  },
  {
    id: 15,
    name: "MAXDRONE S.A.S",
    category: "Datos y Tecnología Ambiental",
    website: "WWW.MAXDRONE.CO",
    operatingCountry: "Colombia",
    operatingCoordinates: "4.5709, -74.2973",
    basedCountry: "Colombia",
    basedCoordinates: "11.007713, -74.796110",
    header: "Misiones Críticas, Soluciones Aéreas Inteligentes",
    tracks: "Bosques y selvas, Economía azul",
    description:
      "Maxdrone es una startup colombiana que desarrolla soluciones tecnológicas basadas en drones para distintas industrias. Su objetivo es ayudar a empresas tradicionales a integrar tecnología aérea para mejorar procesos, reducir riesgos humanos y aumentar la eficiencia operativa. También ofrecen desarrollo de drones especializados, servicios técnicos, capacitación y acompañamiento para implementar estas tecnologías.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/MAXDRONE%20S.A.S/Video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/MAXDRONE%20S.A.S/image1.webp",
    image2: null,
    impacto:
      "Maxdrone permite que organizaciones optimicen tareas complejas como monitoreo ambiental, inspecciones de infraestructura, agricultura de precisión o atención a emergencias. Estas soluciones ayudan a disminuir costos operativos, mejorar la seguridad de los trabajadores y hacer más eficientes procesos que antes eran más lentos o peligrosos.",
    data1: "Más de 52 k: De vuelos seguros realizados",
    data2: "Más de 20 clientes: Empresariales en diversos sectores",
    data3:
      "Operaciones Aéreas de Alcance Nacional: Operaciones y cobertura a nivel nacional en Colombia, adaptando drones a diferentes contextos industriales.",
    quote:
      '"La formación es lo que permite que puedas transformar un \'juguete caro\' en una herramienta útil. Los drones ayudan minimizando riesgos, costos y tiempo, a la vez que pueden utilizarse en diferentes industrias"',
    quoteName: "José Otero_ Founder",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/MAXDRONE%20S.A.S/Quote%20Photo.webp",
  },
  // ─── Split 1: IDs 7, 9, 10 ───
  {
    id: 7,
    name: "MORFO",
    category: "Biodiversidad y Restauración",
    website: "www.morfo.rest",
    operatingCountry: "Brazil",
    operatingCoordinates: "-9.967447, -55.012251",
    basedCountry: "Brazil",
    basedCoordinates: "-9.967447, -55.012251",
    header: "Reforestación inteligente para regenerar ecosistemas a gran escala",
    tracks: "Bosques y selvas",
    description:
      "Morfo es una empresa de restauración ecológica a gran escala.\nSe enfoca en recuperar bosques nativos en zonas tropicales y subtropicales.\nCombina ciencia, drones e inteligencia artificial para diseñar ecosistemas resilientes.\nPlanta múltiples especies nativas para maximizar biodiversidad e impacto climático.\nTrabaja con empresas y gobiernos para restaurar tierras degradadas con resultados medibles.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Morfo/Video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Morfo/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Morfo/Image2.webp",
    impacto:
      "Morfo ha restaurado más de 1.200 hectáreas de ecosistemas forestales con su tecnología.\nActualmente desarrolla proyectos activos en Brasil y otras regiones tropicales y ha involucrado a cientos de personas, generado empleo local en comunidades rurales.\nMonitorea sus proyectos con datos e imágenes para medir biodiversidad y captura de carbono y su impacto combina restauración ambiental medible con beneficios sociales y económicos.",
    data1:
      "≈ 2 000 hectáreas bajo restauración activa:\nMorfo está gestionando alrededor de 2 000 hectáreas de ecosistemas forestales tropicales y subtropicales, con proyectos que combinan diagnóstico, siembra con drones y monitoreo continuo.",
    data2:
      "500 hectáreas en el Amazonia Challenge:\nEn Belém, la iniciativa Amazonia 500 Challenge liderada por Morfo busca restaurar 500 ha (400 de bosque nativo y 100 de sistemas agroforestales), generando beneficios ecológicos y socioeconómicos para la comunidad local.",
    data3:
      "78 % de cobertura vegetal:\nEn el sitio de Crique Korossibo, Morfo transformó un área degradada por minería de 30 ha en un bosque con 78 % de cobertura vegetal gracias a sus métodos de restauración con drones y técnicas ecológicas.",
    quote: null,
    quoteName: "Pascal Asselin\nCo-founder & CEO MORFO",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Morfo/Quotephoto.webp",
  },
  {
    id: 9,
    name: "BioCyclus",
    category: "Economía Sostenible",
    website: "https://biocyclus.estaenlanet.com/",
    operatingCountry: "Honduras",
    operatingCoordinates: "14.062080, -87.469092",
    basedCountry: "Honduras",
    basedCoordinates: "14.062080, -87.469092",
    header: "Soluciones integrales para transformar la sostenibilidad en acción",
    tracks: "Bosques y selvas, Agricultura sustentable",
    description:
      "BioCyclus es una consultora especializada en sostenibilidad ambiental.\nApoya a empresas en la medición y reducción de su impacto, incluyendo huella de carbono y estudios ambientales.\nOfrece servicios técnicos agrícolas como monitoreo con drones y planes de fertilización ecológica.\nDiseña e implementa proyectos socioambientales con enfoque en cambio climático y biodiversidad.\nTambién brinda capacitación y asesoría estratégica para integrar sostenibilidad en organizaciones.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Biocyclus/%20Video.webp",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Biocyclus/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Biocyclus/Image2.webp",
    impacto:
      "Han impulsado la acción climática ayudando a organizaciones a medir, gestionar y reducir su huella de carbono, fortaleciendo la resiliencia de ecosistemas, negocios y comunidades mediante soluciones basadas en datos y herramientas tecnológicas para la sostenibilidad.",
    data1:
      "Reducción de emisiones de GEI: BioCyclus ofrece servicios de cálculo de huella de carbono, lo que permite a empresas conocer y gestionar sus emisiones en toneladas de CO₂ equivalente (tCO₂e) — el estándar global para medir el impacto climático de una organización.",
    data2:
      "Triple impacto ESG: La empresa promueve un modelo con impacto ambiental, social y de gobernanza (ESG), integrando inteligencia territorial y soluciones climáticas en prácticas empresariales y comunitarias.",
    data3:
      "Servicios especializados: Además de huella de carbono, BioCyclus realiza estudios de impacto ambiental, planes de gestión ambiental y asesoría técnica agrícola sostenible.",
    quote:
      "Seguimos trabajando para demostrar que desde Honduras también se puede liderar la transición verde con soluciones tecnológicas, justas y pensadas para nuestra región.",
    quoteName: "Jumairi Puello Mejía\nEspecialista en Sostenibilidad y Desarrollo Rural",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Biocyclus/Quotephoto.webp",
  },
  {
    id: 10,
    name: "Astralintu Space Technologies",
    category: "Datos y Tecnología Ambiental",
    website: "https://www.astralintu.com/",
    operatingCountry: "Ecuador",
    operatingCoordinates: "0.167593, -78.474804",
    basedCountry: "Ecuador",
    basedCoordinates: "0.167593, -78.474804",
    header: "Tecnología Espacial con Propósito",
    tracks: "Bosques y selvas",
    description:
      "Astralintu es una empresa ecuatoriana de tecnología espacial, especializada en Ground Station as a Service (GSaaS), ofreciendo infraestructura terrestre para comunicaciones satelitales.\nOpera estaciones terrestres ubicadas estratégicamente en la línea ecuatorial para mejorar la eficiencia y frecuencia de contacto con satélites. Brinda servicios como seguimiento, telemetría, control (TT&C) y descarga de datos.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Astralintu/Video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Astralintu/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Astralintu/Image2.webp",
    impacto:
      "Astralintu integra criterios de sostenibilidad en sus operaciones espaciales y está comprometida con metas de emisiones netas cero hacia 2050. Trabaja en la medición y reducción de la huella de carbono de misiones satelitales, especialmente CubeSats.\nPromueve buenas prácticas para reducir la basura espacial y asegurar planes de desorbitación responsable. Además, su infraestructura facilita el acceso a datos satelitales que apoyan el monitoreo ambiental y la protección de ecosistemas.",
    data1:
      "Acción Climática en el Sector Espacial\nImpulsa la medición de emisiones en misiones satelitales, especialmente en CubeSats, mediante el desarrollo de estándares de huella de carbono.",
    data2:
      "Gestión Responsable de Residuos Espaciales\nPromueve prácticas responsables para mitigar la basura espacial y reducir riesgos en órbita. Incentiva que cada misión contemple planes de desorbitación segura al final de su vida útil.",
    data3:
      "Monitoreo Ambiental desde el Espacio\nSu infraestructura facilita el acceso rápido a datos e imágenes satelitales de observación terrestre. Estos datos apoyan el seguimiento de fenómenos como deforestación y degradación de ecosistemas.",
    quote:
      "Lo que inició como el sueño de llevar capacidades espaciales a Ecuador hoy es una realidad sólida que fortalece su presencia en el espacio y amplía oportunidades e innovación a lo largo del ecuador",
    quoteName: "Matías Campos Abad\nCEO & Founder at Astralintu Space Technologies",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Astralintu/quotephoto.webp",
  },
  // ─── Split 2: IDs 16–20 ───
  {
    id: 16,
    name: "Nativas Climatech",
    category: "Biodiversidad y Restauración",
    website: "nativas.la",
    operatingCountry: "Colombia, Perú, Bolivia, Ecuador, México",
    operatingCoordinates: "Colombia: 4.5709, -74.2973\nPerú: -9.1900, -75.0152\nBolivia: -16.2902, -63.5887\nEcuador: -1.8312, -78.1834\nMéxico: 23.6345, -102.5528",
    basedCountry: "Argentina",
    basedCoordinates: "-32.9358072, -60.6530284",
    header: "Redefiniendo la relación entre agricultura y naturaleza",
    tracks: "Bosques y selvas, Agricultura sustentable",
    description:
      "Nativas es una empresa de tecnología y naturaleza que trabaja para integrar la biodiversidad dentro de la producción agrícola. Su modelo convierte los servicios que brinda la naturaleza, como captura de carbono y biodiversidad, en activos ambientales que pueden ser adquiridos por empresas para mejorar su sostenibilidad y cadena de valor. La organización combina ciencia, tecnología satelital y modelos ecológicos para medir el impacto ambiental y financiar proyectos que regeneran ecosistemas mientras mantienen la productividad agrícola.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Nativas%20Climatech/video.webm",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Nativas%20Climatech/image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Nativas%20Climatech/image2.webp",
    impacto:
      "Nativas impulsa proyectos que regeneran ecosistemas, conectan la producción agrícola con la conservación y permiten que empresas participen en acciones climáticas reales. Su enfoque busca demostrar que la naturaleza puede generar valor económico mientras se restauran paisajes, se captura carbono y se fortalece la resiliencia de comunidades rurales y sistemas productivos.",
    data1:
      "Tree Asset: Representa la compra y plantación de un árbol. Permite a las empresas contabilizar y demostrar su compromiso con la regeneración de manera transparente y verificable.",
    data2:
      "Carbon Asset: Representa la remoción verificada de carbono. Una solución integral para compensar o mitigar la huella de carbono de las empresas.",
    data3:
      "Nature Positive Asset: Garantiza y certifica que las empresas están integrando la naturaleza en su producción. Una solución para reportar el capital natural en la contabilidad de la empresa.",
    quote: "Más naturaleza es más prosperidad",
    quoteName: "Lionel Orso_ Cofundador, Matías Dutto_Cofundador, Gaspar Mac_Cofundador",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Nativas%20Climatech/Quote%20Photo.webp",
  },
  {
    id: 17,
    name: "Cerco Verde",
    category: "Economía Sostenible",
    website: "www.cercoverde.com",
    operatingCountry: "Colombia, Perú, Bolivia, Brazil, Ecuador",
    operatingCoordinates: "Colombia: 4.5709, -74.2973\nPerú: -9.1900, -75.0152\nBolivia: -16.2902, -63.5887\nBrasil: -14.2350, -51.9253\nEcuador: -1.8312, -78.1834",
    basedCountry: "Bolivia",
    basedCoordinates: "Santa Cruz: -17.764849, -63.192361\nLa Paz: -16.542232, -68.079935",
    header: "El Ecosistema Empresarial de la Biodiversidad",
    tracks: "Bosques y selvas",
    description:
      "Cerco Verde es una plataforma empresarial y tecnológica que articula un ecosistema de negocios basados en la biodiversidad. Su objetivo es crear un nuevo mercado donde los recursos naturales y los servicios de la naturaleza se transformen en valor económico medible, sostenible y escalable, conectando comunidades, innovación y empresas.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Cerco%20Verde/Video.webm",
    image1: null,
    image2: null,
    impacto:
      "Cerco Verde impulsa un modelo colaborativo que conecta patrocinadores, startups, empresas y comunidades indígenas para crear un círculo virtuoso de conservación y desarrollo económico.",
    data1: "2 millones: De hectáreas preservadas",
    data2:
      "Innovación Aérea para Recursos Sostenibles: Se integran tecnologías avanzadas, como monitoreo satelital y drones, para gestionar mejor los recursos naturales.",
    data3:
      "Innovación desde las Comunidades: Se fortalecen líderes emprendedores comunitarios que promueven prácticas sostenibles dentro de sus territorios.",
    quote:
      "Cuando la sostenibilidad se entiende como estrategia y no como tendencia, aparecen propuestas que suman valor real",
    quoteName: "Carola Capra\nDirectora y fundadora",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Cerco%20Verde/Quote%20Photo.webp",
  },
  {
    id: 18,
    name: "Datasketch",
    category: "Datos y Tecnología Ambiental",
    website: "https://www.datasketch.co/",
    operatingCountry: "Colombia",
    operatingCoordinates: "4.5709, -74.2973",
    basedCountry: "Colombia",
    basedCoordinates: "4.655751, -74.059002",
    header: "Democratizando la Ciencia de Datos para un Impacto Global",
    tracks: "Ciudades positivas para la naturaleza",
    description:
      "Datasketch es una empresa de tecnología social que desarrolla herramientas de ciencia de datos, visualización e investigación para que organizaciones, periodistas y ciudadanos puedan entender y usar información de manera sencilla. Su trabajo se centra en hacer accesibles los datos, promover la transparencia y facilitar decisiones basadas en evidencia mediante software, análisis y periodismo de datos.",
    video: null,
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Datasketch/Image1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Datasketch/Image2.webp",
    impacto:
      "Desarrollamos tecnologías cívicas y sociales para democratizar el acceso a datos y empoderar la toma de decisiones informada.",
    data1: "Más de 200 Proyectos basados en datos",
    data2: "130 clientes en diversos sectores",
    data3: "10 países impactados por nuestro trabajo",
    quote:
      "We want to empower small business owners and make them part of the AI revolution. we will help them thrive with accessible and practical data tools.",
    quoteName: "Juan Pablo Marín Díaz CEO",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Datasketch/Quote%20Photo.webp",
  },
  {
    id: 19,
    name: "Understory Labs",
    category: "Datos y Tecnología Ambiental",
    website: "understory.earth",
    operatingCountry: "Colombia, Perú, Brazil, Panamá, México",
    operatingCoordinates: "Colombia: 4.5709, -74.2973\nPerú: -9.1900, -75.0152\nBrasil: -14.2350, -51.9253\nPanamá: 8.5380, -80.7821\nMéxico: 23.6345, -102.5528",
    basedCountry: "México",
    basedCoordinates: "23.6345, -102.5528",
    header: "Monitoreo forestal con tecnología accesible para comunidades",
    tracks: "Bosques y selvas",
    description:
      "Understory desarrolla una plataforma que combina hardware, software e inteligencia artificial para el monitoreo forestal. Su sistema utiliza LiDAR portátil que permite caminar por el bosque y capturar datos extremadamente precisos sobre árboles, biomasa y carbono. La tecnología está diseñada para que organizaciones indígenas y comunidades locales recolecten y gestionen sus propios datos, integrando conocimiento ecológico tradicional con herramientas tecnológicas avanzadas.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Understory/Video.webm",
    image1: null,
    image2: null,
    impacto:
      "Facilitando el acceso a tecnologías avanzadas, las comunidades pueden participar activamente en el monitoreo de sus ecosistemas y en el desarrollo de metodologías de conservación adaptadas a su territorio.",
    data1:
      "30 veces más rápido: Para recolectar datos forestales comparado con métodos tradicionales.",
    data2:
      "Verificación Inteligente: Acelera el proceso de validación y verificación con el respaldo de los datos de campo más confiables.",
    data3: null,
    quote:
      "We started Understory Labs to create a new paradigm — that real empowerment happens through co-creation, and we want to enable it for the long term.",
    quoteName: "Soheil Salehian Founder",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Understory/Quote%20Photo.jpg",
  },
  {
    id: 20,
    name: "Valopes",
    category: "Economía Sostenible",
    website: "https://www.valopes.com/",
    operatingCountry: "Colombia",
    operatingCoordinates: "4.5709, -74.2973",
    basedCountry: "Colombia",
    basedCoordinates: "4.717382, -74.080112",
    header: "Transforma tu Compromiso Climático y Circular en Acción Real",
    tracks: "Bosques y selvas",
    description:
      "Valopes es una plataforma tecnológica que ayuda a organizaciones a medir, analizar y gestionar su impacto ambiental y sobre la biodiversidad. A través de herramientas digitales, integra datos operativos y ambientales para monitorear variables clave como emisiones, recursos naturales y estado de los ecosistemas, facilitando la toma de decisiones informadas para estrategias de sostenibilidad. Permite evaluar impactos mediante indicadores como hectáreas protegidas o restauradas, monitoreo de biodiversidad y variables asociadas a especies, generando información precisa que ayuda a mejorar la gestión ambiental y apoyar acciones frente al cambio climático.",
    video:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Valopes/Video.mp4",
    image1:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Valopes/Imagen1.webp",
    image2:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Valopes/Imagen2.webp",
    impacto:
      "Valopes fortalece la gestión ambiental al transformar datos complejos en información accionable. Su tecnología permite monitorear los efectos de las operaciones en los ecosistemas, optimizar estrategias de conservación y anticipar resultados mediante simulaciones.",
    data1:
      "Monitoreo de biodiversidad: mide indicadores como hectáreas protegidas o restauradas y variables relacionadas con especies y ecosistemas.",
    data2:
      "Análisis en tiempo real: digitaliza datos climáticos y operativos para mejorar la gestión de recursos y la toma de decisiones.",
    data3:
      "Mitiga y conecta: Con opciones para compensar el impacto de la organización y territorios.",
    quote:
      "Aquí la sostenibilidad no es discurso: es operación, datos y decisiones reales.",
    quoteName: "Octavio Torres Quintana Founder & CEO",
    quotePhoto:
      "https://pub-7d8385c441654af4b81cde95bb10edae.r2.dev/ntl500/startups/Valopes/Quote%20Photo.webp",
  },
];

async function main() {
  console.log("Seeding startups...\n");

  for (const s of startups) {
    const result = await prisma.startup.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
    console.log(`✅ ${result.id}. ${result.name}`);
  }

  console.log(`\nSeed complete — ${startups.length} startups.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
