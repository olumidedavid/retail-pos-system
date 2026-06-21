'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { saveUser } from '@/lib/auth';

export default function Login(){
  const[username,setUsername]=useState('');
  const[password,setPassword]=useState('');
  const[msg,setMsg]=useState('');

  async function login(e:any){
    e.preventDefault();
    setMsg('Checking...');
    const cleanUsername=username.trim();
    const {data,error}=await supabase
      .from('app_users')
      .select('id,username,full_name,role,is_active')
      .eq('username',cleanUsername)
      .eq('password',password)
      .limit(1)
      .maybeSingle();
    if(error||!data){setMsg('Invalid username or password');return}
    if(!data.is_active){setMsg('This account has been disabled');return}
    saveUser({id:data.id,username:data.username,full_name:data.full_name,role:data.role});
    window.location.href='/dashboard';
  }

  return <div className="login-bg"><form className="login-card" onSubmit={login}>
    <div className="brand"><h1>Retail POS Login</h1><p>Admin and cashiers must login before using the system.</p></div>
    <label>Username</label><input className="input" value={username} onChange={e=>setUsername(e.target.value)} required autoComplete="username"/>
    <label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
    <button className="btn" style={{width:'100%'}}>Login</button>{msg&&<p className={msg==='Checking...'?'':'error'}>{msg}</p>}
  </form></div>
}
