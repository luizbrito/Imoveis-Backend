process.env.PORT = '3999';

try {
  console.log('=== STARTING BACKEND SMOKE TEST ===');

  await import('../dist/server.js');

  console.log('Server module loaded successfully');

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const response = await fetch('http://127.0.0.1:3999/api/health');
  const body = await response.text();

  console.log('Health status:', response.status);
  console.log('Health body:', body);

  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }

  console.log('=== BACKEND SMOKE TEST PASSED ===');
  process.exit(0);
} catch (error) {
  console.error('=== BACKEND SMOKE TEST FAILED ===');
  console.error(error);
  process.exit(1);
}