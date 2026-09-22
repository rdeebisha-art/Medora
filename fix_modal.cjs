const fs = require('fs');
let content = fs.readFileSync('src/components/CommunicationCenterModal.tsx', 'utf8');

content = content.replace(
  'const handleConfirmSend = () => {',
  'const handleConfirmSend = async () => {'
);

content = content.replace(
  'sendMessageToContacts({',
  'await sendMessageToContacts({'
);

fs.writeFileSync('src/components/CommunicationCenterModal.tsx', content, 'utf8');
