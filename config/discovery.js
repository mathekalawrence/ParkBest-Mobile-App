// Network discovery for local development
const discoverBackend = async () => {
  const possibleIPs = [
    'localhost:5000',
    '192.168.1.100:5000', // Common router range
    '192.168.0.100:5000',
    '10.0.0.100:5000'     // Another common range
  ];

  for (const ip of possibleIPs) {
    try {
      const response = await fetch(`http://${ip}/api`, { timeout: 2000 });
      if (response.ok) {
        return `http://${ip}/api`;
      }
    } catch (error) {
      continue;
    }
  }
  
  return 'http://localhost:5000/api'; // fallback
};

export { discoverBackend };