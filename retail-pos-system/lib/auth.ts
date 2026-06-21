export type Role = 'admin' | 'cashier';
export type AppUser = { id:string; username:string; full_name:string; role:Role };

export function saveUser(user: AppUser){ if(typeof window !== 'undefined') localStorage.setItem('app_user', JSON.stringify(user)); }
export function getUser(): AppUser | null { if(typeof window === 'undefined') return null; try { return JSON.parse(localStorage.getItem('app_user') || 'null'); } catch { return null; } }
export function logout(){ if(typeof window !== 'undefined') { localStorage.removeItem('app_user'); window.location.href='/login'; } }
export function formatNaira(n:any){ return new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(Number(n||0)); }
