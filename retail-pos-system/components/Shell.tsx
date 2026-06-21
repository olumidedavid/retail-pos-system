'use client';
import Link from 'next/link';
import { useEffect,useState } from 'react';
import { getUser,logout,AppUser } from '@/lib/auth';

export default function Shell({children}:{children:React.ReactNode}){
  const[user,setUser]=useState<AppUser|null>(null);
  useEffect(()=>{const u=getUser();if(!u) window.location.href='/login'; else setUser(u)},[]);
  if(!user) return <div className="login-bg"><div className="login-card">Checking login...</div></div>;
  return <div className="layout"><aside className="sidebar"><h2>Retail POS</h2>
    <p style={{color:'#9db7dc'}}>Logged in as<br/><b>{user.full_name}</b><br/>{user.role.toUpperCase()}</p>
    <nav className="nav"><Link href="/dashboard">Dashboard</Link><Link href="/cashier">Cashier Sales</Link>
    {user.role==='admin'&&<><Link href="/products">Products</Link><Link href="/sales">Sales Records</Link><Link href="/reports">Reports</Link><Link href="/expenses">Expenses</Link><Link href="/users">Users</Link><Link href="/settings">Shop Settings</Link></>}
    <button onClick={logout}>Logout</button></nav>
  </aside><main className="main"><div className="topbar"><div><h1 style={{margin:0}}>DEMO Phone Electronics</h1><span>Phones & Accessories Inventory POS</span></div><b>{new Date().toLocaleDateString()}</b></div>{children}</main></div>
}
