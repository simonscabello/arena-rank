export type PersonDisplayFields = {
  fullName: string | null
  email: string
  nickname?: string | null
}

export function displayPerson(person: PersonDisplayFields) {
  if (person.nickname) return person.nickname
  if (person.fullName) return person.fullName
  return person.email.split('@')[0]
}
