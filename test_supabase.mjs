import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
const envMap = {};
lines.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
        envMap[key] = values.join('=').replace(/"/g, '').trim();
    }
});

const url = envMap.VITE_SUPABASE_URL;
const key = envMap.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function test() {
    const { data: users, error } = await supabase.from('users').select('*').limit(10);
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Total users fetched:', users.length);
        if (users.length > 0) {
            console.log('Sample user:', users[0]);
            console.log('User roles:', users.map(u => ({ id: u.id, username: u.username, role: u.role })));
        }
    }
}

test();
