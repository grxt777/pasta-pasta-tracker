async function test() {
  try {
    const res = await fetch('https://pasta-pasta-tracker.vercel.app/api/deliver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driver_id: 123456,
        driver_name: 'Test Driver',
        branch_id: 1,
        lat: 41.311676,
        lng: 69.292960,
        type: 'delivery'
      })
    });
    
    console.log('Status Code:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error during fetch:', err);
  }
}

test();
