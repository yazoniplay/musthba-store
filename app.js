const fallbackProducts=[
{id:"demo-1",brand:"Nike",name:"Dri-FIT Training Tee",price:449,img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85"},
{id:"demo-2",brand:"Under Armour",name:"Tech 2.0 T-Shirt",price:399,img:"https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85"},
{id:"demo-3",brand:"Nike",name:"Air Max Essential",price:1299,img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"},
{id:"demo-4",brand:"Under Armour",name:"Sportstyle Hoodie",price:699,img:"https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85"},
{id:"demo-5",brand:"Nike",name:"Academy Training Pants",price:649,img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85"},
{id:"demo-6",brand:"Under Armour",name:"Velocity Shorts",price:499,img:"https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=85"},
{id:"demo-7",brand:"Nike",name:"BridgeWay Runner",price:1099,img:"https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=85"},
{id:"demo-8",brand:"Under Armour",name:"Rival Fleece Crew",price:749,img:"https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=85"}];
let products=[...fallbackProducts];
let cart=JSON.parse(localStorage.getItem("musthba-cart")||"[]");
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("sv-SE").format(n)+" kr";
const supaConfig=window.MUSTHBA_SUPABASE||{};
const supabaseClient=window.supabase&&supaConfig.url&&supaConfig.publishableKey?window.supabase.createClient(supaConfig.url,supaConfig.publishableKey):null;

async function loadProducts(){
  if(!supabaseClient){render();renderCart();return}
  const {data,error}=await supabaseClient.from("products").select("*").eq("status","Active").order("featured",{ascending:false}).order("created_at",{ascending:false});
  if(error||!data?.length){console.warn("MUSTHBA catalog fallback:",error?.message||"no products");render();renderCart();return}
  products=data.map(p=>({id:p.id,brand:p.brand,name:p.name,price:Number(p.price),img:p.images?.[0]||"",images:p.images||[],sizes:p.sizes||[],stock:p.stock,badge:p.badge,featured:p.featured}));
  render();renderCart();
}
function card(p){return '<article class="product"><div class="product-image"><img loading="lazy" src="'+p.img+'" alt="'+p.brand+' '+p.name+'"><button class="quick" data-add="'+p.id+'">Add to cart +</button></div><div class="product-info"><div class="product-brand">'+p.brand+'</div><div class="product-name">'+p.name+'</div><div class="product-price">'+money(p.price)+'</div></div></article>'}
function render(filter="All"){const list=filter==="All"?products:products.filter(p=>p.brand===filter);const grid=$("#productGrid");const featured=$("#featuredGrid");if(grid)grid.innerHTML=list.map(card).join("");if(featured)featured.innerHTML=products.filter(p=>p.featured).slice(0,4).map(card).join("")||products.slice(0,4).map(card).join("");bindAdd()}
function bindAdd(){document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{const p=products.find(x=>x.id==b.dataset.add);if(!p)return;cart.push(p);save();openCart()})}
function save(){localStorage.setItem("musthba-cart",JSON.stringify(cart));renderCart()}
function renderCart(){const el=$("#cartItems");const count=$("#cartCount");if(!el||!count)return;count.textContent=cart.length;if(!cart.length){el.innerHTML='<div class="empty">Your cart is empty.</div>';$("#cartTotal").textContent="0 kr";return}el.innerHTML=cart.map((p,i)=>'<div class="cart-row"><img src="'+p.img+'"><div><strong>'+p.name+'</strong><small>'+p.brand+' · '+money(p.price)+'</small><button class="remove" data-remove="'+i+'">Remove</button></div></div>').join("");$("#cartTotal").textContent=money(cart.reduce((a,p)=>a+p.price,0));document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{cart.splice(+b.dataset.remove,1);save()})}
function openCart(){$("#cartDrawer").classList.add("open");$("#overlay").classList.add("open");renderCart()}
function closeCart(){$("#cartDrawer").classList.remove("open");$("#overlay").classList.remove("open")}
if($("#cartBtn"))$("#cartBtn").onclick=openCart;if($("#closeCart"))$("#closeCart").onclick=closeCart;if($("#overlay"))$("#overlay").onclick=closeCart;
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.filter)});
document.querySelectorAll("[data-brand]").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===b.dataset.brand));render(b.dataset.brand)});
if($("#searchBtn"))$("#searchBtn").onclick=()=>{$("#searchModal").classList.add("open");$("#searchInput").focus()};if($("#closeSearch"))$("#closeSearch").onclick=()=>$("#searchModal").classList.remove("open");
if($("#searchInput"))$("#searchInput").oninput=e=>{const q=e.target.value.toLowerCase();$("#searchResults").innerHTML=products.filter(p=>(p.name+" "+p.brand).toLowerCase().includes(q)).map(p=>'<div class="search-result"><span>'+p.brand+'</span><b>'+p.name+" — "+money(p.price)+'</b></div>').join("")};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();$("#searchModal").classList.remove("open")}});
loadProducts();