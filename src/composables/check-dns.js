export function useCheckDns() {

  async function checkDns(url) {
    const startTime = performance.now();
    let status = 'Error';
    let responseTime = 0;

    try {
      const response = await fetch(url, { method: 'GET' });
      const endTime = performance.now();

      status = response.status === 200 ? 'Online' : 'Offline';
      responseTime = parseInt(endTime - startTime);
    } catch (error) {
      const endTime = performance.now();
      responseTime = parseInt(endTime - startTime);
    }

    return {
      url,
      status,
      responseTime,
      timestamp: Date.now(),
    };
  }

  return {
    checkDns,
  };
}
