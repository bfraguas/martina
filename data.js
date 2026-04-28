// --- FECHA NACIMIENTO ---
const BIRTH = new Date("2025-09-18");

function getAgeMonths() {
  const now = new Date();
  return (now.getFullYear() - BIRTH.getFullYear()) * 12 + (now.getMonth() - BIRTH.getMonth()) -
    (now.getDate() < BIRTH.getDate() ? 1 : 0);
}
function getAgeDays() { return Math.floor((new Date() - BIRTH) / 86400000); }
function getAgeLabel() {
  const m = getAgeMonths(), days = getAgeDays() - m * 30;
  if (m < 1) return `${getAgeDays()} dias`;
  if (days > 3) return `${m} meses y ${days} dias`;
  return `${m} meses`;
}
function todayKey() { return new Date().toISOString().split("T")[0]; }
function fmtDate(d) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

// --- RUTINA ---
function getRoutine(ageMonths) {
  return [
    { time:"06:30", label:"Biberon desayuno", icon:"🍼", type:"feed",
      note:"240-270ml Formula 2 + 2-5 cazos cereales (sin gluten primero, luego multicereales).",
      placeholder:"Cuantos ml tomo? Lo termino? Como amaneció..." },
    { time:"08:00", label:"Juego y estimulacion", icon:"🌟", type:"activity",
      note:"30-45 min de juego activo antes de la primera siesta.",
      placeholder:"Que jugasteis? Como estuvo de humor..." },
    { time:"09:00", label:"Siesta corta (1a)", icon:"😴", type:"sleep",
      note:"45-60 min. No dejar pasar mas de 2h de vigilia antes de dormir.",
      placeholder:"A que hora se durmio? Cuanto duro..." },
    { time:"10:00", label:"Vitamina D", icon:"💊", type:"health",
      note:"1 gota diaria sin falta. Con cuchara o en el biberon.",
      placeholder:"Se la dio? Como fue..." },
    { time:"10:30", label:"Paseo manana", icon:"🌳", type:"activity",
      note:"30-60 min. Parque de Andalucia (Avda. Valdelaparra), Parque Arroyo de la Vega, Parque Cataluna o Parque Comunidad de Madrid. Evita sol directo.",
      placeholder:"A donde fuisteis? Como lo disfruto..." },
    { time:"11:30", label:"Biberon media manana", icon:"🍼", type:"feed",
      note:"240-270ml Formula 2 + 2-5 cazos cereales.",
      placeholder:"Cuantos ml tomo? Observaciones..." },
    { time:"12:30", label:"Siesta larga (2a)", icon:"😴", type:"sleep",
      note:"1,5-2h. La mas importante del dia.",
      placeholder:"Cuanto duro? Como fue..." },
    { time:"14:30", label:"Pure de verduras + biberon", icon:"🥣", type:"food",
      note: ageMonths >= 8 ? "~120-150g de pure. AOVE en crudo. Proteina: pollo, ternera, yema de huevo o legumbres (desde 8m). Biberon complemento 100-120ml si no llega." : "~90g de pure. AOVE en crudo siempre. Desde dia 5 lleva pollo o ternera. Biberon complemento 120-150ml Formula 2 despues.",
      placeholder:"Cuanto pure? Biberon complemento? Nuevo alimento..." },
    { time:"16:00", label:"Juego / paseo tarde", icon:"🌆", type:"activity",
      note:"Paseo tranquilo o juego en casa. Tu momento con Martina.",
      placeholder:"Que hicisteis? Como estuvo..." },
    { time:"17:00", label:"Siesta corta (3a)", icon:"😴", type:"sleep",
      note:"30-45 min. NO dejar dormir despues de las 17:30.",
      placeholder:"Se durmio? Cuanto duro..." },
    { time:"17:30", label:"Biberon tarde", icon:"🍼", type:"feed",
      note:"240-270ml Formula 2 + 2-5 cazos cereales.",
      placeholder:"Cuantos ml tomo? Observaciones..." },
    { time:"18:30", label:"Pure de frutas + biberon", icon:"🍑", type:"food",
      note: ageMonths >= 8 ? "~120-150g pure de 4-5 frutas + 1 galleta Maria. Biberon complemento si no llega." : "~90g pure de 4 frutas + 1 galleta Maria. Biberon complemento 120-150ml despues. Agua del grifo.",
      placeholder:"Cuanto pure? Biberon complemento? Alguna fruta nueva..." },
    { time:"19:30", label:"Bano", icon:"🛁", type:"routine",
      note:"SIEMPRE bano ANTES del biberon de noche. ~10 min, agua 37C. Masajito con crema. Luz tenue.",
      placeholder:"Como fue el bano? Observaciones sobre la piel..." },
    { time:"21:00", label:"Biberon noche + dormir", icon:"🌙", type:"feed",
      note:"240-270ml Formula 2 + cereales, en penumbra DESPUES del bano. Si se despierta de noche: 150ml rescate.",
      placeholder:"Cuantos ml? Se durmio facil? Se desperto en la noche..." },
  ];
}

// --- TIPOS ---
const TYPES = {
  sleep:    { bg:"#eef4ff", text:"#5b8dee", dot:"#5b8dee", label:"Sueno" },
  feed:     { bg:"#f3f0fd", text:"#9b7fe8", dot:"#9b7fe8", label:"Biberon" },
  food:     { bg:"#edf7f1", text:"#5db87a", dot:"#5db87a", label:"Pure + biberon" },
  health:   { bg:"#fef7ec", text:"#e8a84a", dot:"#e8a84a", label:"Salud" },
  activity: { bg:"#edf8fc", text:"#4ab8d4", dot:"#4ab8d4", label:"Actividad" },
  routine:  { bg:"#fdf0f4", text:"#e86a8a", dot:"#e86a8a", label:"Rutina" },
};

// --- JUEGOS ---
const GAMES_BY_MONTH = {
  6: [
    { icon:"🤸", title:"Tummy time (boca abajo)", freq:"Varias veces al dia · 5-10 min",
      desc:"Pon a Martina boca abajo sobre una superficie firme. Coloca un espejo o juguete de colores vivos delante para que levante la cabeza. Fundamental para fortalecer cuello, hombros y preparar el gateo." },
    { icon:"🪞", title:"Espejo facial", freq:"Diario · 5 min",
      desc:"Acerca su cara a un espejo irrompible para bebes. Senala sus ojos, nariz, boca mientras nombras las partes. Le fascina la imagen, desarrolla autoconciencia y lenguaje." },
    { icon:"🎵", title:"Canciones con movimiento", freq:"2-3 veces al dia",
      desc:"Los pollitos, palmas. Mueve sus manitas mientras cantas. El ritmo estimula el cerebro y crea vinculo." },
    { icon:"🧸", title:"Alcanzar objetos colgantes", freq:"Diario · 5-10 min",
      desc:"Cuelga juguetes suaves a la altura de sus manos. Animala a alcanzarlos y agarrarlos. Trabaja coordinacion ojo-mano y motricidad fina." },
    { icon:"🌈", title:"Estimulacion visual con colores", freq:"Diario",
      desc:"Muestra tarjetas o libros con contrastes fuertes (blanco-negro, colores primarios). A los 6 meses ya distingue todos los colores. Acerca objetos a 30cm." },
  ],
  7: [
    { icon:"🤸", title:"Tummy time avanzado", freq:"Varias veces al dia · 10-15 min",
      desc:"Ahora debe aguantar bien. Pon juguetes alrededor para que intente girarse o arrastrarse hacia ellos. Si ya se da la vuelta sola, practica los dos sentidos." },
    { icon:"🧊", title:"Exploracion de texturas", freq:"Diario · 5-10 min",
      desc:"Dale objetos de distintas texturas: un trapo suave, una esponja, papel de seda, una pelota con relieve. Nombra cada textura: suave, rugoso, frio. Estimula el tacto y el vocabulario." },
    { icon:"🫧", title:"Burbujas de jabon", freq:"2-3 veces por semana",
      desc:"Sopla burbujas delante de ella. Que intente seguirlas con la mirada y atraparlas. Mejora seguimiento visual, concentracion y causa-efecto." },
    { icon:"🥁", title:"Percusion con objetos", freq:"Diario · 5 min",
      desc:"Dale una cuchara de madera y una olla. Que golpee y haga ruido. Trabaja la coordinacion bilateral y el concepto causa-efecto." },
    { icon:"📚", title:"Lectura de cuentos con imagenes", freq:"Cada noche antes del bano",
      desc:"Libros de tela o carton con imagenes grandes y colores. Senala los dibujos, nombra lo que ves. El tono y el ritual le encantan." },
    { icon:"🏊", title:"Juego en banera", freq:"Noche (durante el bano)",
      desc:"Aprovecha el bano para jugar: juguetes flotantes, verter agua con un vasito. Desarrolla sensorialidad y disfruta del agua." },
    { icon:"🌳", title:"Exploracion en el parque", freq:"Cada paseo",
      desc:"En el Parque de Andalucia o Arroyo de la Vega: deja que toque hojas, hierba, tierra (vigilando que no se la lleve a la boca). El contacto con la naturaleza estimula todos los sentidos." },
  ],
  8: [
    { icon:"🚂", title:"Arrastre y gateo asistido", freq:"Varias veces al dia",
      desc:"Pon un juguete un poco lejos y animala a llegar hasta el. Si no gatea aun, ayuda poniendo tu mano bajo su barriga. El arrastre es tan valido como el gateo clasico." },
    { icon:"📦", title:"Sacar y meter objetos", freq:"Diario · 10 min",
      desc:"Una caja con objetos variados (tapas, pelotas pequenas, cubos). Que saque todo y luego intente meterlos. Trabaja pinza, planificacion motora y concentracion." },
    { icon:"👋", title:"Juego de escondite (peekaboo)", freq:"Varias veces al dia",
      desc:"Tapate la cara con las manos o una tela y aparece con aqui estoy. A los 8 meses entiende la permanencia del objeto. Provoca risa asegurada." },
    { icon:"🎭", title:"Imitacion de gestos", freq:"Diario",
      desc:"Mueve los brazos, saca la lengua, aplaude. Espera a que ella lo imite. La imitacion es el primer paso del lenguaje." },
    { icon:"🧩", title:"Encajables y apilables", freq:"Diario · 10 min",
      desc:"Cubos apilables de diferentes tamanos, aros en palo. Aunque todo acabe en el suelo, el intento trabaja planificacion cognitiva." },
    { icon:"🎶", title:"Baile libre", freq:"Diario",
      desc:"Ponla de pie aguantandola por las axilas, pon musica y baila con ella. Fortalece piernas y prepara la bipedestacion." },
    { icon:"🌊", title:"Juego sensorial con agua", freq:"2-3 veces por semana",
      desc:"Un barreno con un poco de agua tibia, vasos, cucharas. Verter, salpicar, meter la mano. Estimulacion sensorial total." },
  ],
  9: [
    { icon:"🚶", title:"Practica de pie agarrada", freq:"Varias veces al dia",
      desc:"Ayudala a ponerse de pie agarrandose al sofa o a una mesita baja. Que aguante 10-30 segundos. No la sueltes, solo reduce el apoyo gradualmente." },
    { icon:"🫳", title:"Pinza con alimentos", freq:"En cada comida",
      desc:"Pon trocitos pequenos de fruta blanda (platano, pera) en el plato. Que intente cogerlos con los dedos. Trabaja la pinza fina que necesitara para escribir." },
    { icon:"🎠", title:"Juego simbolico basico", freq:"Diario",
      desc:"Dale un muneco y muestrale como darle de comer o abrazarlo. Imitar acciones cotidianas activa la empatia y el lenguaje." },
    { icon:"📱", title:"Nombrar todo lo que ves", freq:"Todo el dia",
      desc:"Durante el paseo, la comida, el bano: nombra constantemente lo que ves. A los 9m el cerebro ya asocia palabra-objeto. La base del habla." },
  ],
  10: [
    { icon:"👶", title:"Primeros pasos laterales", freq:"Diario",
      desc:"Agarrada al sofa, animala a dar pasos laterales hacia un juguete. Cruising se llama. La mayoria anda sola entre 10-14 meses." },
    { icon:"🎨", title:"Pintura sensorial con dedos", freq:"Semanal",
      desc:"Pinturas de dedo no toxicas o pure de zanahoria sobre papel. Que embadurne, toque, explore. Arte sensorial sin restricciones." },
    { icon:"📖", title:"Senalar en libros", freq:"Diario",
      desc:"Donde esta el perrito? y espera. A los 10m empieza a senalar con el dedo indice. Cuando lo haga, celebra y nombra lo senalado." },
  ],
  11: [
    { icon:"🎯", title:"Lanzar y recoger pelotas", freq:"Diario",
      desc:"Pelotas blandas de varios tamanos. Que las lance, tu se las devuelves. Trabaja turno, anticipacion y motricidad gruesa." },
    { icon:"🏗️", title:"Construccion y derribo", freq:"Diario",
      desc:"Construye una torre de 3-4 cubos y deja que la tire. El derribo es tan importante como la construccion: causa-efecto y satisfaccion." },
    { icon:"🫶", title:"Juego de dar y recibir", freq:"Todo el dia",
      desc:"Damelo con la mano extendida. Que te de el juguete y tu se lo devuelves. Primera conversacion no verbal, turno, reciprocidad social." },
  ],
  12: [
    { icon:"🚶", title:"Primeros pasos independientes", freq:"Todo el dia",
      desc:"Si aun no camina, no hay prisa: el rango normal es 9-15 meses. Animala a soltarse del mueble. Alfombra en el suelo para amortiguar caidas." },
    { icon:"🖍️", title:"Garabatos con ceras gruesas", freq:"Semanal",
      desc:"Ceras blandas gruesas. Papel grande en el suelo. Primer contacto con el dibujo, agarre palmar." },
  ],
};

// --- VACUNAS ---
const VACCINES = [
  { month:0,  label:"Recien nacido",     fixed:true,  items:["Hepatitis B (1a dosis)"] },
  { month:2,  label:"2 meses",           fixed:true,  items:["Hexavalente 1a","Neumococo 13v 1a","Rotavirus 1a","Meningococo B 1a"] },
  { month:4,  label:"4 meses",           fixed:true,  items:["Hexavalente 2a","Neumococo 13v 2a","Rotavirus 2a","Meningococo B 2a"] },
  { month:6,  label:"6 meses",           fixed:true,  items:["Hexavalente 3a","Neumococo 13v 3a","Rotavirus 3a","Meningococo B 3a"] },
  { month:12, label:"12 meses",          fixed:false, items:["Triple virica SRP 1a","Varicela 1a","Meningococo C","Neumococo 13v (refuerzo)"] },
  { month:15, label:"15 meses",          fixed:false, items:["Triple virica SRP 2a","Varicela 2a","Meningococo B (refuerzo)"] },
  { month:18, label:"18 meses",          fixed:false, items:["Hexavalente (refuerzo)"] },
  { month:36, label:"3 anos",            fixed:false, items:["Varicela (si no se puso)"] },
  { month:72, label:"6 anos",            fixed:false, items:["DTPa refuerzo","Triple virica SRP refuerzo","VPH (ninas)"] },
];

// --- REVISIONES ---
const CHECKUPS = [
  { month:0,  label:"Alta maternidad / 1a semana", fixed:true,  desc:"Control peso, ictericia, prueba talon (PKU), audicion neonatal." },
  { month:1,  label:"1 mes",                        fixed:true,  desc:"Peso, talla, perimetro cefalico. Valoracion desarrollo neurologico." },
  { month:2,  label:"2 meses + vacunas",            fixed:true,  desc:"Control crecimiento. Valoracion cadera. Primera ronda vacunas." },
  { month:4,  label:"4 meses + vacunas",            fixed:true,  desc:"Control crecimiento. Valoracion visual y auditiva basica." },
  { month:6,  label:"6 meses + vacunas",            fixed:true,  desc:"Control. Inicio alimentacion complementaria." },
  { month:9,  label:"9 meses",                      fixed:false, desc:"Control desarrollo psicomotor (se sienta, pinza, balbuceo). Hemoglobina (anemia)." },
  { month:12, label:"12 meses + vacunas",           fixed:false, desc:"Control. Valoracion marcha. Test M-CHAT (autismo)." },
  { month:15, label:"15 meses + vacunas",           fixed:false, desc:"Valoracion lenguaje (al menos 3-5 palabras). Control crecimiento." },
  { month:18, label:"18 meses",                     fixed:false, desc:"Valoracion desarrollo global. Autonomia en alimentacion." },
  { month:24, label:"2 anos",                       fixed:false, desc:"Valoracion lenguaje (frases de 2 palabras). Vision. Higiene dental." },
  { month:36, label:"3 anos",                       fixed:false, desc:"Agudeza visual. Valoracion escolar." },
];

// --- HITOS ---
const MILESTONES = [
  { month:2,  icon:"😊", label:"Primera sonrisa social", desc:"Sonrie en respuesta a tu cara o voz. Si no aparece antes de los 3 meses, comentalo al pediatra." },
  { month:3,  icon:"🗣️", label:"Primeros gorjeos", desc:"Emite vocales y sonidos guturales. Responde cuando le hablas." },
  { month:4,  icon:"👐", label:"Agarra objetos", desc:"Cierra el punio sobre un objeto que le pones en la mano." },
  { month:5,  icon:"🔄", label:"Se da la vuelta", desc:"De boca abajo a boca arriba primero, luego al reves." },
  { month:6,  icon:"🪑", label:"Se sienta con apoyo", desc:"Con cojines alrededor. Todavia no se sostiene sola." },
  { month:6,  icon:"🍼", label:"Inicia alimentacion complementaria", desc:"Primer pure. El paso de solo leche a explorar sabores y texturas." },
  { month:7,  icon:"📢", label:"Balbuceo (ba-ba, ma-ma)", desc:"Repite silabas. Mama y papa aun no tienen significado, pero son el inicio del lenguaje." },
  { month:7,  icon:"🙈", label:"Ansiedad de separacion", desc:"Llora cuando te vas. Es positivo: ha formado apego seguro contigo." },
  { month:8,  icon:"🧊", label:"Permanencia del objeto", desc:"Entiende que algo existe aunque no lo vea. Por eso el peekaboo le encanta ahora." },
  { month:8,  icon:"🚼", label:"Se sienta sola sin apoyo", desc:"Se sostiene sentada sin necesitar manos. Gran hito postural." },
  { month:9,  icon:"🤏", label:"Pinza index-pulgar", desc:"Agarra objetos pequenos con dos dedos." },
  { month:9,  icon:"🐛", label:"Gateo o arrastre", desc:"Arrastre, gateo clasico, posicion de oso. Todos son validos." },
  { month:10, icon:"👆", label:"Senala con el dedo indice", desc:"Primer gesto comunicativo intencional." },
  { month:11, icon:"🗺️", label:"Entiende instrucciones simples", desc:"Dame, no, ven aqui. Entiende unas 10-20 palabras aunque no las diga aun." },
  { month:12, icon:"🚶", label:"Primeros pasos (rango: 9-15m)", desc:"Si no camina a los 15 meses, comentar al pediatra." },
  { month:12, icon:"💬", label:"Primera palabra con significado", desc:"Mama, papa, agua, no. Una palabra que usa siempre para lo mismo." },
  { month:18, icon:"🗣️", label:"5-20 palabras", desc:"Si a los 18m tiene menos de 6 palabras, consultar al pediatra." },
  { month:24, icon:"💬", label:"Frases de 2 palabras", desc:"Mama agua, mas pan. Si no aparecen a los 2 anos, valorar." },
];

// --- COMPRA ---
const SHOPPING = [
  { cat:"🍼 Leche y cereales", weekly:true, items:[
    { n:"Formula 2 — Aptamil 2 / Nan Optipro 2 / Blemil Plus 2 / Hero Baby 2", tip:"~1.300ml/dia · 5 tomas. Minimo 2 latas grandes o 10 bricks semanales." },
    { n:"Cereales SIN GLUTEN — Nestle 8C sin gluten / Nutriben Arroz / Hero Baby Arroz-Maiz", tip:"Terminar PRIMERO estos. 2-5 cazos rasados por biberon." },
    { n:"Cereales MULTICEREALES — Nestle Multicereales / Nutriben Multicereales / Hero Baby Multicereales", tip:"Cuando se acaben los sin gluten. Con hierro y calcio." },
    { n:"Galletas Maria Fontaneda — 1 paquete cada 3-4 semanas", tip:"1 galleta/racion pure frutas." },
  ]},
  { cat:"🥕 Verduras para el pure", weekly:true, items:[
    { n:"Patata — 600g/semana (3 medianas)", tip:"1 patata mediana ~200g por tarro. 3 tarros/semana." },
    { n:"Calabaza — 300g/semana (un trozo)", tip:"~100g por tarro." },
    { n:"Judia verde — 150g/semana", tip:"~50g por tarro (un punado). Fresca o congelada." },
    { n:"Zanahoria — 3 unidades/semana", tip:"1 zanahoria mediana por tarro." },
    { n:"Calabacin — 2 unidades/semana", tip:"Medio calabacin por tarro." },
    { n:"Puerro — 1 unidad/semana", tip:"Solo la parte blanca. ~20g por tarro." },
    { n:"Boniato — 1 mediano/semana (rotacion patata)", tip:"Sustituye a la patata 1-2 veces/semana." },
    { n:"Penca de acelga — 2-3 pencas/semana", tip:"Solo la penca blanca, sin hoja verde (nitratos)." },
    { n:"AOVE — botella 500ml (dura 3-4 semanas)", tip:"Chorro en crudo sobre el pure antes de servir." },
  ]},
  { cat:"🍌 Frutas para el pure", weekly:true, items:[
    { n:"Naranja — 4 unidades/semana", tip:"Media naranja por racion." },
    { n:"Pera — 4 unidades/semana", tip:"Media pera por racion." },
    { n:"Platano — 4-5 unidades/semana", tip:"Medio platano por racion." },
    { n:"Manzana golden — 4 unidades/semana", tip:"Media manzana por racion." },
    { n:"Melocoton / albaricoque — 3-4 unidades/semana", tip:"Sin piel hasta los 9 meses." },
    { n:"Mango — 1 unidad/semana", tip:"Sin piel. Rota con otras frutas." },
  ]},
  { cat:"🍖 Proteinas", weekly:true, items:[
    { n:"Pechuga de pollo fresca — 120g/semana", tip:"30g por tarro · 3 tarros/semana. Alterna con ternera." },
    { n:"Ternera (blanca o roja) — 120g/semana (semanas alternas)", tip:"Alterna semanas: una pollo, otra ternera." },
  ]},
  { cat:"🥚 Proximos alimentos (desde 8 meses)", weekly:false, items:[
    { n:"Huevos camperos", tip:"Solo YEMA cocida dura. Clara a los 12 meses." },
    { n:"Lentejas rojas peladas", tip:"Se deshacen solas al triturar. Ricas en hierro." },
    { n:"Merluza / pescadilla fresca", tip:"Sin espinas, al vapor. Desde los 8 meses." },
    { n:"Yogur Danone Bio natural", tip:"De postre tras la comida. Empezar con 1 cucharadita." },
  ]},
  { cat:"🧴 Salud e higiene", weekly:false, items:[
    { n:"Vitamina D gotas", tip:"1 gota diaria. La que recete el pediatra." },
    { n:"Crema hidratante bebe", tip:"Masajito despues del bano." },
    { n:"Gel bebe pH neutro", tip:"Para el bano diario." },
    { n:"Termometro de bano", tip:"Agua siempre a 37C." },
  ]},
  { cat:"🫙 Utensilios", weekly:false, items:[
    { n:"Tarros cristal 400g", tip:"Prepara lunes, miercoles y viernes. Aguanta 48h en nevera." },
    { n:"Batidora / Thermomix", tip:"Textura completamente lisa." },
  ]},
];
