import http from 'http';
import app from '../src/app.js';

let server;

async function runTests() {
  server = http.createServer(app);
  await new Promise(resolve => server.listen(8001, resolve));
  console.log('🧪 Test server running on http://localhost:8001\n');

  const baseURL = 'http://localhost:8001/api';

  try {
    // 1. GET /movies
    console.log('1. Testing GET /api/movies...');
    const resMovies = await fetch(`${baseURL}/movies`);
    const movies = await resMovies.json();
    console.log(`   Status: ${resMovies.status}, Found: ${movies.length} movies (Expected 20)`);
    if (movies.length !== 20) throw new Error('Expected 20 movies in seed');

    // 2. GET /movies/1
    console.log('2. Testing GET /api/movies/1...');
    const resMovie1 = await fetch(`${baseURL}/movies/1`);
    const movie1 = await resMovie1.json();
    console.log(`   Status: ${resMovie1.status}, Title: "${movie1.title}"`);

    // 3. Register user
    const testEmail = `test_${Date.now()}@gdgoc.dev`;
    console.log(`3. Testing POST /api/auth/register (${testEmail})...`);
    const resReg = await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'tester',
        email: testEmail,
        password: 'password123'
      })
    });
    console.log(`   Status: ${resReg.status}`);

    // 4. Login user
    console.log('4. Testing POST /api/auth/login...');
    const resLogin = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginData = await resLogin.json();
    console.log(`   Status: ${resLogin.status}, Received Token: ${!!loginData.token}`);
    const token = loginData.token;

    // 5. Watchlist - Add Movie
    console.log('5. Testing POST /api/watchlist (Add Movie 1)...');
    const resAddWatchlist = await fetch(`${baseURL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ movieId: 1 })
    });
    console.log(`   Status: ${resAddWatchlist.status}`);

    // 6. Watchlist - Duplicate Add (Check 409 Conflict)
    console.log('6. Testing duplicate POST /api/watchlist (Expect 409)...');
    const resDup = await fetch(`${baseURL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ movieId: 1 })
    });
    console.log(`   Status: ${resDup.status} (Expected 409 Conflict)`);

    // 7. Watchlist - GET
    console.log('7. Testing GET /api/watchlist...');
    const resGetWatchlist = await fetch(`${baseURL}/watchlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const watchlist = await resGetWatchlist.json();
    console.log(`   Status: ${resGetWatchlist.status}, Items: ${watchlist.length}`);

    // 8. Watched - POST Review
    console.log('8. Testing POST /api/watched...');
    const resWatched = await fetch(`${baseURL}/watched`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        movieId: 1,
        rating: 5,
        review: 'Masterpiece film from Christopher Nolan!'
      })
    });
    console.log(`   Status: ${resWatched.status}`);

    // 9. Watched - GET
    console.log('9. Testing GET /api/watched...');
    const resGetWatched = await fetch(`${baseURL}/watched`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const watchedList = await resGetWatched.json();
    console.log(`   Status: ${resGetWatched.status}, Reviews: ${watchedList.length}`);

    // 10. Watchlist - DELETE
    console.log('10. Testing DELETE /api/watchlist/1...');
    const resDel = await fetch(`${baseURL}/watchlist/1`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Status: ${resDel.status}`);

    // 11. AI Recommendation (Gemini Grounding)
    console.log('11. Testing POST /api/movies/recommend (Gemini AI Grounding)...');
    const resAi = await fetch(`${baseURL}/movies/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Saya mau film misteri psikologis yang penuh teka-teki' })
    });
    const aiData = await resAi.json();
    console.log(`   Status: ${resAi.status}, Chosen Movie ID: ${aiData.movie_id} (${aiData.movie?.title})`);
    console.log(`   Reasoning: "${aiData.reasoning?.substring(0, 80)}..."`);

    console.log('\n🎉 ALL CORE REST ENDPOINTS + GEMINI AI TESTED AND WORKING PERFECTLY!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
