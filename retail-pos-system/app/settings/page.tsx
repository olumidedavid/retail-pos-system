'use client';
import { useEffect,useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { getUser } from '@/lib/auth';

const defaults={id:1,shop_name:'DEMO RETAIL POS',address:'',phone:'',receipt_footer:'Thank you for your patronage.',receipt_width_mm:58};
export default function Settings(){
  const[form,setForm]=useState<any>(defaults);const[msg,setMsg]=useState('');
  useEffect(()=>{if(getUser()?.role!=='admin') location.href='/cashier';load()},[]);
  async function load(){const{data}=await supabase.from('store_settings').select('*').eq('id',1).maybeSingle(); if(data)setForm({...defaults,...data});}
  async function save(e:any){e.preventDefault();setMsg('Saving...');const{error}=await supabase.from('store_settings').upsert(form);setMsg(error?error.message:'Settings saved successfully');}
  async function clearSales(){if(!confirm('Delete ALL sales, sale items and stock movements? This is for clearing test data only.'))return; await supabase.from('sale_items').delete().neq('id','00000000-0000-0000-0000-000000000000'); await supabase.from('sales').delete().neq('id','00000000-0000-0000-0000-000000000000'); await supabase.from('stock_movements').delete().neq('id','00000000-0000-0000-0000-000000000000'); alert('Sales test data deleted. Product stock was not reset automatically.');}
  async function clearProducts(){if(!confirm('Delete ALL products? Only do this for test database cleanup.'))return; await supabase.from('sale_items').delete().neq('id','00000000-0000-0000-0000-000000000000'); await supabase.from('stock_movements').delete().neq('id','00000000-0000-0000-0000-000000000000'); await supabase.from('products').delete().neq('id','00000000-0000-0000-0000-000000000000'); alert('Products deleted.');}
  return <Shell><div className="card"><h2>Shop & Receipt Settings</h2><form onSubmit={save} className="form-grid"><input className="input" placeholder="Shop name" value={form.shop_name} onChange={e=>setForm({...form,shop_name:e.target.value})}/><input className="input" placeholder="Phone number" value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})}/><select className="input" value={form.receipt_width_mm} onChange={e=>setForm({...form,receipt_width_mm:Number(e.target.value)})}><option value={58}>58mm POS printer</option><option value={80}>80mm POS printer</option></select><textarea className="input" placeholder="Shop address" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})}/><textarea className="input" placeholder="Receipt footer" value={form.receipt_footer||''} onChange={e=>setForm({...form,receipt_footer:e.target.value})}/><button className="btn green">Save Settings</button></form>{msg&&<p className="success">{msg}</p>}</div><div className="card"><h2>Database Cleanup</h2><p className="notice">Use these buttons only to remove test data. Admin only.</p><button className="btn danger" onClick={clearSales}>Delete All Sales Test Data</button> <button className="btn danger" onClick={clearProducts}>Delete All Products</button></div></Shell>
}
