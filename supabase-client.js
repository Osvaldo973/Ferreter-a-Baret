// Configuración del cliente Supabase para la Ferretería Baret
const SUPABASE_URL = 'https://awpbzckvwcsfvvrfeawc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cZj17z3di8dze8Ips3Bpsw_b5KOyqFo';

let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase conectado correctamente');
} else {
    console.warn('⚠️ Supabase JS SDK no está cargado');
}
