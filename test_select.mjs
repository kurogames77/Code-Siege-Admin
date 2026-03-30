import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
const envMap = {};
lines.forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
        envMap[key] = values.join('=').replace(/"/g, '').trim();
    }
});

const supabase = createClient(envMap.VITE_SUPABASE_URL, envMap.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data: users, error } = await supabase
        .from('users')
        .select('id, username, email, role, student_id, college, is_banned, avatar_url, created_at, xp, level, gems')
        .limit(1);
    
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        console.log('Success:', users);
    }
}

test();
