export const SHARE_TAGLINES = [
  'Nunca subestime sua incapacidade',
  'Nunca é tarde para desistir',
  'Não tenha medo do fracasso, tenha certeza',
  'Depois do sacrificio vem a derrota',
  'Sorria pra não chorar',
  'Quando disserem que não vai dar certo, acredite!',
  'Até o cheque é especial e você não',
  'Não há saúde sem sáude mental',
  'Nunca fica mais difícil, é você que fica mais fraco',
  'Você ainda não chegou lá, mas olha o quanto você já se fudeu',
  'O problema não é dia do azar, é a sua incompetência',
  'Tentar é o primeiro passo rumo ao fracasso',
] as const

export function pickShareTagline() {
  const index = Math.floor(Math.random() * SHARE_TAGLINES.length)
  return SHARE_TAGLINES[index]
}
