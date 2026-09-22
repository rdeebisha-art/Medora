const fs = require('fs');
let content = fs.readFileSync('src/services/communicationService.ts', 'utf8');

const newCode = fs.readFileSync('fix_comms.txt', 'utf8');

content = content.replace(
  /export const sendMessageToContacts = \([\s\S]*?\n\};/,
  newCode
);

fs.writeFileSync('src/services/communicationService.ts', content, 'utf8');
