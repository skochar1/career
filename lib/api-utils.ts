/**
 * Utility function to handle API responses consistently
 */
export async function handleApiResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response received:', text.substring(0, 200));
    throw new Error('Response is not JSON');
  }
  
  return response.json();
}

/**
 * Utility function to safely fetch and parse JSON
 */
export async function fetchJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  return handleApiResponse(response);
}