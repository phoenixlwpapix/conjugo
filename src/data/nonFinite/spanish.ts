import type { NonFiniteVerbForms } from './types';

const spanishInfinitives = [
  'ser', 'tener', 'ir', 'estar', 'hacer', 'decir', 'poder', 'querer', 'saber', 'ver',
  'venir', 'poner', 'salir', 'dar', 'hablar', 'amar', 'mirar', 'escuchar', 'trabajar', 'caminar',
  'preguntar', 'llamar', 'llevar', 'dejar', 'pasar', 'esperar', 'estudiar', 'visitar', 'cantar', 'bailar',
  'preparar', 'ganar', 'olvidar', 'usar', 'aceptar', 'necesitar', 'comer', 'beber', 'aprender', 'vender',
  'comprender', 'correr', 'responder', 'vivir', 'abrir', 'escribir', 'recibir', 'decidir', 'subir', 'compartir',
  'haber', 'leer', 'oír', 'pensar', 'buscar', 'encontrar', 'comprar', 'pagar', 'dormir', 'conocer',
  'creer', 'pedir', 'sentir', 'jugar', 'traer', 'empezar', 'llegar', 'quedar', 'romper', 'tocar',
  'tomar', 'entender', 'perder', 'volver', 'devolver', 'contar', 'costar', 'seguir', 'conseguir', 'elegir',
  'enviar', 'cerrar', 'apagar', 'encender', 'recordar', 'morir', 'nacer', 'volar', 'viajar', 'nadar',
  'enseñar', 'ayudar', 'cambiar', 'cocinar', 'terminar', 'saludar', 'desayunar', 'cenar', 'mandar', 'regalar',
  'caer', 'caber', 'valer', 'conducir', 'traducir', 'producir', 'andar', 'construir', 'huir', 'incluir',
  'reír', 'servir', 'repetir', 'mentir', 'preferir', 'mantener', 'suponer', 'ofrecer', 'parecer', 'mostrar',
] as const;

const irregularPastParticiples: Record<string, string> = {
  abrir: 'abierto',
  decir: 'dicho',
  devolver: 'devuelto',
  escribir: 'escrito',
  hacer: 'hecho',
  morir: 'muerto',
  poner: 'puesto',
  romper: 'roto',
  suponer: 'supuesto',
  ver: 'visto',
  volver: 'vuelto',
};

// Stems ending in a, e, or o need an accent on í to break the hiatus in -ído.
const accentedPastParticiples: Record<string, string> = {
  caer: 'caído',
  creer: 'creído',
  leer: 'leído',
  oír: 'oído',
  reír: 'reído',
  traer: 'traído',
};

const irregularGerunds: Record<string, string> = {
  // e -> i stem-changing -ir verbs (plus venir, decir)
  decir: 'diciendo',
  venir: 'viniendo',
  pedir: 'pidiendo',
  sentir: 'sintiendo',
  seguir: 'siguiendo',
  conseguir: 'consiguiendo',
  elegir: 'eligiendo',
  servir: 'sirviendo',
  repetir: 'repitiendo',
  mentir: 'mintiendo',
  preferir: 'prefiriendo',
  // o -> u stem-changing verbs
  poder: 'pudiendo',
  dormir: 'durmiendo',
  morir: 'muriendo',
  // -yendo when unstressed i sits between vowels or starts the form
  ir: 'yendo',
  caer: 'cayendo',
  creer: 'creyendo',
  leer: 'leyendo',
  oír: 'oyendo',
  traer: 'trayendo',
  construir: 'construyendo',
  huir: 'huyendo',
  incluir: 'incluyendo',
  // e -> i with hiatus reduction (ri + iendo -> riendo)
  reír: 'riendo',
};

function deriveSpanishNonFinite(infinitive: string): NonFiniteVerbForms {
  const stem = infinitive.slice(0, -2);
  const ending = infinitive.slice(-2);

  const regularPastParticiple = ending === 'ar' ? `${stem}ado` : `${stem}ido`;
  const regularGerund = ending === 'ar' ? `${stem}ando` : `${stem}iendo`;

  return {
    pastParticiple:
      irregularPastParticiples[infinitive]
      ?? accentedPastParticiples[infinitive]
      ?? regularPastParticiple,
    gerund: irregularGerunds[infinitive] ?? regularGerund,
  };
}

export const spanishNonFiniteForms: Record<string, NonFiniteVerbForms> = Object.fromEntries(
  spanishInfinitives.map((infinitive) => [infinitive, deriveSpanishNonFinite(infinitive)]),
);
