const notesRobert = [12,16,18 ]
const nomRobert = "Robert"

// const okRobert = nomRobert.find(nom => nom === 'Rpbert')

// console.log(okRobert)

const okNotes = notesRobert.find(uneNote => uneNote > 12)

console.log(okNotes)

if (nomRobert.startsWith("ber")) console.log('Robert?')
else console.log('inconnu')

if (nomRobert.includes('ber')) console.log('Robert?')
else console.log('inconnu')