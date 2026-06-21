'use client';
import { useEffect,useState } from 'react';
import Shell from '@/components/Shell';
import { supabase } from '@/lib/supabase';
import { formatNaira,getUser } from '@/lib/auth';

type StoreSettings={shop_name:string;address:string;phone:string;receipt_footer:string;receipt_width_mm:number};
const defaultSettings:StoreSettings={shop_name:'DEMO RETAIL POS',address:'',phone:'',receipt_footer:'Thank you for your patronage.',receipt_width_mm:58};

export default function Cashier(){
  const[query,setQuery]=useState('');
  const[products,setProducts]=useState<any[]>([]);
  const[cart,setCart]=useState<any[]>([]);
  const[payment,setPayment]=useState('Cash');
  const[customer,setCustomer]=useState('');
  const[receipt,setReceipt]=useState<any>(null);
  const[settings,setSettings]=useState<StoreSettings>(defaultSettings);

  useEffect(()=>{search();loadSettings()},[]);
  async function loadSettings(){const{data}=await supabase.from('store_settings').select('*').eq('id',1).maybeSingle(); if(data) setSettings({...defaultSettings,...data});}
  async function search(){let q=supabase.from('products').select('*').gt('stock',0).limit(30); if(query) q=q.or(`code.ilike.%${query}%,name.ilike.%${query}%,model.ilike.%${query}%`); const{data}=await q;setProducts(data||[])}
  function add(p:any){const ex=cart.find(i=>i.id===p.id); if(ex) setCart(cart.map(i=>i.id===p.id?{...i,qty:Math.min(Number(i.stock),Number(i.qty)+1)}:i)); else setCart([...cart,{...p,qty:1}])}
  function qty(id:string,n:number){setCart(cart.map(i=>i.id===id?{...i,qty:Math.min(Number(i.stock),Math.max(1,n))}:i))}
  function remove(id:string){setCart(cart.filter(i=>i.id!==id))}
  const total=cart.reduce((a,b)=>a+Number(b.selling_price)*Number(b.qty),0);

  async function complete(){
    const user=getUser(); if(!user||!cart.length)return;
    for(const item of cart){ if(Number(item.qty)>Number(item.stock)){ alert(`${item.name} stock is not enough`); return; } }
    const inv='INV-'+Date.now();
    const sale={invoice_no:inv,cashier_id:user.id,cashier_name:user.full_name,total,payment_method:payment,customer_name:customer||'Walk-in Customer'};
    const{data:saleData,error}=await supabase.from('sales').insert(sale).select().single();
    if(error){alert(error.message);return}
    for(const item of cart){
      await supabase.from('sale_items').insert({sale_id:saleData.id,product_id:item.id,product_code:item.code,product_name:item.name+' '+(item.model||''),quantity:item.qty,unit_price:item.selling_price,total:Number(item.selling_price)*Number(item.qty)});
      await supabase.from('products').update({stock:Number(item.stock)-Number(item.qty)}).eq('id',item.id);
      await supabase.from('stock_movements').insert({product_id:item.id,movement_type:'sale',quantity:-Number(item.qty),note:inv,created_by:user.full_name});
    }
    setReceipt({invoice_no:inv,cashier:user.full_name,customer:customer||'Walk-in Customer',items:cart,total,payment,date:new Date().toLocaleString(),settings});
    setCart([]);setCustomer('');search();
  }

  return <Shell><div className="cashier-grid"><div className="card"><h2>Record Sale</h2>
    <div style={{display:'flex',gap:10}}><input className="input" placeholder="Search code, name or model" value={query} onChange={e=>setQuery(e.target.value)}/><button className="btn" onClick={search}>Search</button></div>
    <table className="table"><thead><tr><th>Code</th><th>Item</th><th>Price</th><th>Stock</th><th></th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.code}</td><td>{p.name} {p.model}</td><td>{formatNaira(p.selling_price)}</td><td>{p.stock}</td><td><button className="btn green" onClick={()=>add(p)}>Add</button></td></tr>)}</tbody></table>
  </div><div className="card"><h2>Cart</h2>
    <input className="input" placeholder="Customer name (optional)" value={customer} onChange={e=>setCustomer(e.target.value)}/>
    {cart.map(i=><div className="receipt-row" key={i.id}><span>{i.name}<br/><small>{formatNaira(i.selling_price)} | Stock: {i.stock}</small></span><input style={{width:60}} type="number" value={i.qty} onChange={e=>qty(i.id,Number(e.target.value))}/><button className="btn danger" onClick={()=>remove(i.id)}>x</button></div>)}
    <h2>Total: {formatNaira(total)}</h2><select className="input" value={payment} onChange={e=>setPayment(e.target.value)}><option>Cash</option><option>Transfer</option><option>POS</option><option>Card</option></select><button className="btn" style={{width:'100%'}} onClick={complete}>Complete Sale</button>
  </div></div>
  {receipt&&<div className="card print-card"><div className="receipt" style={{width:`${receipt.settings.receipt_width_mm||58}mm`,maxWidth:`${receipt.settings.receipt_width_mm||58}mm`}}>
    <h2>{receipt.settings.shop_name}</h2><p style={{textAlign:'center'}}>{receipt.settings.address}<br/>{receipt.settings.phone}<br/>Sales Receipt<br/>{receipt.date}<br/>Invoice: {receipt.invoice_no}<br/>Customer: {receipt.customer}<br/>Cashier: {receipt.cashier}</p>
    {receipt.items.map((i:any)=><div className="receipt-row" key={i.id}><span>{i.name} x{i.qty}</span><b>{formatNaira(i.qty*i.selling_price)}</b></div>)}
    <h3 className="receipt-row"><span>TOTAL</span><span>{formatNaira(receipt.total)}</span></h3><p>Payment: {receipt.payment}</p><p style={{textAlign:'center'}}>{receipt.settings.receipt_footer}</p></div><button className="btn no-print" onClick={()=>window.print()}>Print Receipt</button></div>}
  </Shell>
}
