const fs = require('fs');
const file = 'src/context/MedoraContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /elderlyDetails: \{[^\}]+\},/,
  match => match + "\n    emergencyContacts: [\n      { emergencyContactId: 'EC-P1001-1', patientId: 'P-1001', name: 'Lakshmi Kumar', relationship: 'Wife', phoneNumber: '+919876543210', priority: 1, isPrimary: true, createdAt: '2026-01-10' },\n      { emergencyContactId: 'EC-P1001-2', patientId: 'P-1001', name: 'Arun Kumar', relationship: 'Son', phoneNumber: '+919876543211', priority: 2, isPrimary: false, createdAt: '2026-01-10' },\n    ],"
);

content = content.replace(
  /category: 'maternity',([^]*?)maternityDetails: \{([^]*?)\},/,
  match => match + "\n    emergencyContacts: [\n      { emergencyContactId: 'EC-P1002-1', patientId: 'P-1002', name: 'Ramesh Kumar', relationship: 'Husband', phoneNumber: '+919876543210', priority: 1, isPrimary: true, createdAt: '2026-01-10' },\n    ],"
);

content = content.replace(
  /category: 'child',([^]*?)childDetails: \{([^]*?)\},/,
  match => match + "\n    emergencyContacts: [\n      { emergencyContactId: 'EC-P1003-1', patientId: 'P-1003', name: 'Ramesh Kumar', relationship: 'Father', phoneNumber: '+919876543210', priority: 1, isPrimary: true, createdAt: '2026-01-10' },\n    ],"
);

fs.writeFileSync(file, content, 'utf8');
