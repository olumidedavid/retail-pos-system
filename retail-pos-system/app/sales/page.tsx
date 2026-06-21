'use client';
import { useEffect,useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { formatNaira,getUser } from '@/lib/auth';

export default function Sales(){
  const[sales,setSales]=useState<any[]>([]);const[from,setFrom]=useState('');const[to,setTo]=useState('');
  useEffect(()=>{if(getUser()?.role!=='admin') location.href='/cashier';load()},[]);
  async function load(){let q=supabase.from('sales').select('*, sale_items(*)').order('created_at',{ascending:false}); if(from) q=q.gte('created_at',from+'T00:00:00'); if(to) q=q.lte('created_at',to+'T23:59:59'); const{data}=await q;setSales(data||[])}
  async function del(id:string){if(!confirm('Delete this sale record? This will remove the receipt record but will NOT automatically return stock.')) return; await supabase.from('sales').delete().eq('id',id); load();}
  const total=sales.reduce((a,b)=>a+Number(b.total||0),0);
  return <Shell><div className="card"><h2>All Sales Records</h2><div className="filter-row"><input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="btn" onClick={load}>Filter</button><button className="btn secondary" onClick={()=>{setFrom('');setTo('');setTimeout(load,50)}}>Clear</button><button className="btn green" onClick={()=>window.print()}>Print</button></div><h3>Total in range: {formatNaira(total)}</h3><table className="table"><thead><tr><th>Date</th><th>Invoice</th><th>Customer</th><th>Cashier</th><th>Payment</th><th>Total</th><th>Items</th><th className="no-print">Action</th></tr></thead><tbody>{sales.map(s=><tr key={s.id}><td>{new Date(s.created_at).toLocaleString()}</td><td>{s.invoice_no}</td><td>{s.customer_name||'Walk-in Customer'}</td><td>{s.cashier_name}</td><td>{s.payment_method}</td><td>{formatNaira(s.total)}</td><td>{s.sale_items?.map((i:any)=>`${i.product_name} x${i.quantity}`).join(', ')}</td><td className="no-print"><button className="btn danger" onClick={()=>del(s.id)}>Delete</button></td></tr>)}</tbody></table></div></Shell>
}
