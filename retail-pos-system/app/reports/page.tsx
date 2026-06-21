'use client';
import { useEffect,useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { formatNaira,getUser } from '@/lib/auth';

export default function Reports(){
  const today=new Date().toISOString().slice(0,10);
  const[from,setFrom]=useState(today);const[to,setTo]=useState(today);
  const[sales,setSales]=useState<any[]>([]);const[items,setItems]=useState<any[]>([]);const[products,setProducts]=useState<any[]>([]);const[expenses,setExpenses]=useState<any[]>([]);
  useEffect(()=>{if(getUser()?.role!=='admin') location.href='/cashier';load()},[]);
  async function load(){
    const start=from+'T00:00:00', end=to+'T23:59:59';
    const{data:s}=await supabase.from('sales').select('*, sale_items(*)').gte('created_at',start).lte('created_at',end).order('created_at',{ascending:false});
    const{data:p}=await supabase.from('products').select('*').order('name');
    const{data:e}=await supabase.from('expenses').select('*').gte('created_at',start).lte('created_at',end).order('created_at',{ascending:false});
    setSales(s||[]);setProducts(p||[]);setExpenses(e||[]);setItems((s||[]).flatMap((x:any)=>x.sale_items||[]));
  }
  const totalSales=sales.reduce((a,b)=>a+Number(b.total||0),0);
  const totalExpenses=expenses.reduce((a,b)=>a+Number(b.amount||0),0);
  const stockQty=products.reduce((a,b)=>a+Number(b.stock||0),0);
  const stockValue=products.reduce((a,b)=>a+(Number(b.stock||0)*Number(b.cost_price||0)),0);
  const soldQty=items.reduce((a,b)=>a+Number(b.quantity||0),0);
  const byCashier=Object.values(sales.reduce((acc:any,s:any)=>{const k=s.cashier_name||'Unknown';acc[k]??={cashier:k,count:0,total:0};acc[k].count++;acc[k].total+=Number(s.total||0);return acc},{}));
  const byItem=Object.values(items.reduce((acc:any,i:any)=>{const k=i.product_name||'Unknown';acc[k]??={item:k,qty:0,total:0};acc[k].qty+=Number(i.quantity||0);acc[k].total+=Number(i.total||0);return acc},{})).sort((a:any,b:any)=>b.total-a.total);
  return <Shell><div className="card"><h2>Date Range Report</h2><div className="filter-row"><input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="btn" onClick={load}>Generate Report</button><button className="btn green" onClick={()=>window.print()}>Print Report</button></div></div>
  <div className="grid"><div className="card stat"><h3>Total Sales</h3><p>{formatNaira(totalSales)}</p></div><div className="card stat"><h3>Expenses</h3><p>{formatNaira(totalExpenses)}</p></div><div className="card stat"><h3>Net Sales</h3><p>{formatNaira(totalSales-totalExpenses)}</p></div><div className="card stat"><h3>Sold Qty</h3><p>{soldQty}</p></div><div className="card stat"><h3>Stock Qty Left</h3><p>{stockQty}</p></div><div className="card stat"><h3>Stock Cost Value</h3><p>{formatNaira(stockValue)}</p></div></div>
  <div className="card"><h2>Cashier Performance</h2><table className="table"><thead><tr><th>Cashier</th><th>No. of Sales</th><th>Total</th></tr></thead><tbody>{byCashier.map((c:any)=><tr key={c.cashier}><td>{c.cashier}</td><td>{c.count}</td><td>{formatNaira(c.total)}</td></tr>)}</tbody></table></div>
  <div className="card"><h2>Items Sold</h2><table className="table"><thead><tr><th>Item</th><th>Qty Sold</th><th>Total</th></tr></thead><tbody>{byItem.map((i:any)=><tr key={i.item}><td>{i.item}</td><td>{i.qty}</td><td>{formatNaira(i.total)}</td></tr>)}</tbody></table></div>
  <div className="card"><h2>Remaining Stock</h2><table className="table"><thead><tr><th>Code</th><th>Item</th><th>Stock</th><th>Cost Value</th><th>Selling Value</th></tr></thead><tbody>{products.map((p:any)=><tr key={p.id}><td>{p.code}</td><td>{p.name} {p.model}</td><td>{p.stock}</td><td>{formatNaira(Number(p.stock||0)*Number(p.cost_price||0))}</td><td>{formatNaira(Number(p.stock||0)*Number(p.selling_price||0))}</td></tr>)}</tbody></table></div>
  </Shell>
}
