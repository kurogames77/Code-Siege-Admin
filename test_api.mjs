async function testApi() {
    const API_URL = "https://code-siege-backend.onrender.com/api";
    
    console.log("Testing API:", API_URL);
    try {
        const usersRes = await fetch(`${API_URL}/instructor/users?page=1&limit=10`);
        console.log("getUsers status:", usersRes.status);
        console.log("getUsers body:", await usersRes.text());
    } catch(err) {
        console.error("Fetch error:", err);
    }
}

testApi();
