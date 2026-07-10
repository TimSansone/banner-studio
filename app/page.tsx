"use client";

import { useRef, useState } from "react";

type Item = { id: number; type: "text" | "image"; x: number; y: number; w: number; h: number; rotation: number; text?: string; src?: string; color?: string; fontSize?: number; font?: string };
const SIZES = [[36,24],[48,24],[60,36],[72,40],[90,40]];
const FONTS = ["Arial", "Georgia", "Impact", "Trebuchet MS", "Courier New"];
const COLORS = ["#ffffff","#000000","#d62828","#155eef","#16823b","#ffd21c","#7d3fc1","#7b4b2a","#ff6b1a"];

export default function Home() {
  const [size, setSize] = useState([36,24]);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape");
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [zoom, setZoom] = useState(64);
  const [saved, setSaved] = useState(false);
  const [guides, setGuides] = useState({x:false,y:false});
  const drag = useRef<{id:number; sx:number; sy:number; x:number; y:number}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const active = items.find(i => i.id === selected);
  const chooseSize = (preset: number[]) => setSize(orientation === "landscape" ? preset : [preset[1], preset[0]]);
  const changeOrientation = (next: "landscape" | "portrait") => { if (next !== orientation) setSize(([w,h]) => [h,w]); setOrientation(next); };
  const update = (patch: Partial<Item>) => setItems(v => v.map(i => i.id === selected ? {...i,...patch} : i));
  const setRgb = (value:string) => { const parts=value.split(/[ ,]+/).map(Number); if(parts.length===3&&parts.every(n=>Number.isFinite(n)&&n>=0&&n<=255)) update({color:`#${parts.map(n=>Math.round(n).toString(16).padStart(2,"0")).join("")}`}); };

  const addText = () => { const id=Date.now(); setItems(v=>[...v,{id,type:"text",x:18,y:38,w:64,h:18,rotation:0,text:"YOUR MESSAGE",color:"#15191e",fontSize:42,font:"Arial"}]); setSelected(id); };
  const upload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file, n) => { const reader=new FileReader(); reader.onload=()=>{ const id=Date.now()+n; setItems(v=>[...v,{id,type:"image",x:25+n*3,y:25+n*3,w:50,h:40,rotation:0,src:String(reader.result)}]); setSelected(id); }; reader.readAsDataURL(file); });
  };
  const remove = () => { setItems(v=>v.filter(i=>i.id!==selected)); setSelected(null); };
  const duplicate = () => { if(!active)return; const id=Date.now(); setItems(v=>[...v,{...active,id,x:active.x+3,y:active.y+3}]); setSelected(id); };
  const exportImage = () => {
    const scale=20, w=size[0]*scale, h=size[1]*scale; const c=document.createElement("canvas"); c.width=w;c.height=h;const ctx=c.getContext("2d")!;ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);
    const draw=(idx:number)=>{if(idx>=items.length){const a=document.createElement("a");a.download=`banner-${size[0]}x${size[1]}.png`;a.href=c.toDataURL("image/png");a.click();return;}const i=items[idx];ctx.save();const x=i.x/100*w,y=i.y/100*h,iw=i.w/100*w,ih=i.h/100*h;ctx.translate(x+iw/2,y+ih/2);ctx.rotate(i.rotation*Math.PI/180);if(i.type==="text"){ctx.fillStyle=i.color!;ctx.font=`700 ${Math.max(14,(i.fontSize||42)*scale/4)}px ${i.font}`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(i.text||"",0,0,iw);ctx.restore();draw(idx+1);}else{const img=new Image();img.onload=()=>{ctx.drawImage(img,-iw/2,-ih/2,iw,ih);ctx.restore();draw(idx+1)};img.src=i.src!;}};draw(0);
  };
  const pointerDown=(e:React.PointerEvent,item:Item)=>{e.stopPropagation();setSelected(item.id);drag.current={id:item.id,sx:e.clientX,sy:e.clientY,x:item.x,y:item.y};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)};
  const pointerMove=(e:React.PointerEvent)=>{if(!drag.current||!canvasRef.current)return;const r=canvasRef.current.getBoundingClientRect(),d=drag.current;setItems(v=>v.map(i=>{if(i.id!==d.id)return i;let x=Math.max(-10,Math.min(100-i.w,d.x+(e.clientX-d.sx)/r.width*100)),y=Math.max(-10,Math.min(100-i.h,d.y+(e.clientY-d.sy)/r.height*100));const snapX=Math.abs(x+i.w/2-50)<1.5,snapY=Math.abs(y+i.h/2-50)<1.5;if(snapX)x=50-i.w/2;if(snapY)y=50-i.h/2;setGuides({x:snapX,y:snapY});return {...i,x,y}}))};

  return <main className="app">
    <header><div className="brand"><span className="mark">B</span><span>Banner Studio</span><em>MOCKUP TOOL</em></div><nav className="site-links" aria-label="Sambodi Creations"><a href="https://www.sambodicreations.com/">Home</a><a href="https://www.sambodicreations.com/product-page-static">Products</a><a href="https://www.sambodicreations.com/cart-page">My Cart</a><a href="https://www.sambodicreations.com/custom-stores">Custom Stores</a></nav><div className="header-actions"><button className="quiet" onClick={()=>{setItems([]);setSelected(null)}}>New design</button><button className="save" onClick={()=>{localStorage.setItem("banner-design",JSON.stringify({size,items}));setSaved(true);setTimeout(()=>setSaved(false),1400)}}>{saved?"Saved ✓":"Save design"}</button><button className="download" onClick={exportImage}>↓ Download PNG</button></div></header>
    <section className="workspace">
      <aside className="left-panel">
        <div className="step"><span>01</span><div><b>Choose a size</b><small>Banner dimensions</small></div></div>
        <div className="orientation" role="group" aria-label="Banner orientation"><button className={orientation==="landscape"?"active":""} onClick={()=>changeOrientation("landscape")}><span>▭</span> Landscape</button><button className={orientation==="portrait"?"active":""} onClick={()=>changeOrientation("portrait")}><span>▯</span> Portrait</button></div>
        <div className="size-grid">{SIZES.map(s=>{const shown=orientation==="landscape"?s:[s[1],s[0]];return <button key={s.join("x")} className={size[0]===shown[0]&&size[1]===shown[1]?"selected":""} onClick={()=>chooseSize(s)}><strong>{shown[0]} × {shown[1]}</strong><small>INCHES</small></button>})}</div>
        <div className="step"><span>02</span><div><b>Add your design</b><small>Build your banner</small></div></div>
        <button className="tool upload" onClick={()=>fileRef.current?.click()}><i>↥</i><span><b>Upload artwork</b><small>PNG, JPG or WEBP · multiple allowed</small></span></button><input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={e=>upload(e.target.files)}/>
        <button className="tool" onClick={addText}><i>T</i><span><b>Add text</b><small>Create a new text layer</small></span><strong>＋</strong></button>
        <div className="layers"><div className="layers-title"><b>Layers</b><small>{items.length} {items.length===1?"item":"items"}</small></div>{items.length===0?<div className="empty">Your artwork and text<br/>will appear here</div>:items.slice().reverse().map((i,n)=><button key={i.id} className={selected===i.id?"layer active":"layer"} onClick={()=>setSelected(i.id)}><span>{i.type==="text"?"T":"▧"}</span><div><b>{i.type==="text"?(i.text||"Text").slice(0,20):`Artwork ${items.length-n}`}</b><small>{i.type==="text"?i.font:"Uploaded image"}</small></div><em>••</em></button>)}</div>
      </aside>
      <section className="stage" onPointerMove={pointerMove} onPointerUp={()=>{drag.current=null;setGuides({x:false,y:false})}}>
        <div className="stage-top"><div><span className="dot"></span><b>DESIGN CANVAS</b><small>{size[0]} × {size[1]} inches</small></div><div className="zoom"><button onClick={()=>setZoom(z=>Math.max(35,z-10))}>−</button><span>{zoom}%</span><button onClick={()=>setZoom(z=>Math.min(100,z+10))}>＋</button></div></div>
        <div className="canvas-wrap"><div className="ruler horizontal"><span>0</span><span>{size[0]/2}</span><span>{size[0]}</span></div><div className="ruler vertical"><span>0</span><span>{size[1]/2}</span><span>{size[1]}</span></div><div ref={canvasRef} className="banner" style={{aspectRatio:`${size[0]}/${size[1]}`,height:`min(${zoom}vh, calc(100vw - 650px))`}} onPointerDown={()=>setSelected(null)}>
          {guides.x&&<span className="alignment-guide vertical-guide"/>}{guides.y&&<span className="alignment-guide horizontal-guide"/>}{items.map(i=><div key={i.id} className={`canvas-item ${selected===i.id?"item-selected":""}`} style={{left:`${i.x}%`,top:`${i.y}%`,width:`${i.w}%`,height:`${i.h}%`,transform:`rotate(${i.rotation}deg)`}} onPointerDown={e=>pointerDown(e,i)}>{i.type==="image"?<img src={i.src} alt="Uploaded artwork" draggable={false}/>:<div style={{color:i.color,fontFamily:i.font,fontSize:`clamp(12px,${(i.fontSize||42)/12}vw,60px)`}}>{i.text}</div>}{selected===i.id&&<><span className="handle tl"></span><span className="handle tr"></span><span className="handle bl"></span><span className="handle br"></span></>}</div>)}
          {items.length===0&&<div className="hint"><span>＋</span><b>Start creating your banner</b><small>Upload artwork or add text from the left panel</small></div>}
        </div><div className="safe">KEEP IMPORTANT CONTENT INSIDE THE DOTTED SAFE AREA</div></div>
      </section>
      <aside className="right-panel"><div className="properties-head"><b>Properties</b><small>{active?active.type==="text"?"TEXT LAYER":"ARTWORK LAYER":"NO SELECTION"}</small></div>{!active?<div className="no-selection"><span>↖</span><b>Select an item</b><small>Click artwork or text on the canvas to edit its properties.</small></div>:<div className="properties">
        {active.type==="text"&&<><label>TEXT</label><textarea value={active.text} onChange={e=>update({text:e.target.value})}/><label>FONT</label><select value={active.font} onChange={e=>update({font:e.target.value})}>{FONTS.map(f=><option key={f}>{f}</option>)}</select><label>QUICK COLORS</label><div className="color-swatches">{COLORS.map(c=><button key={c} aria-label={`Set color ${c}`} className={active.color===c?"chosen":""} style={{background:c}} onClick={()=>update({color:c})}/>)}</div><div className="two"><div><label>SIZE</label><div className="input-suffix"><input type="number" min="10" max="160" value={active.fontSize} onChange={e=>update({fontSize:+e.target.value})}/><span>PX</span></div></div><div><label>RGB COLOR</label><input className="rgb-input" placeholder="255, 0, 0" onBlur={e=>setRgb(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")setRgb(e.currentTarget.value)}}/></div></div></>}
        <label>SIZE & POSITION</label><div className="two"><div><small>Width</small><input type="number" value={Math.round(active.w)} onChange={e=>update({w:+e.target.value})}/></div><div><small>Height</small><input type="number" value={Math.round(active.h)} onChange={e=>update({h:+e.target.value})}/></div></div><label>ROTATION</label><input type="range" min="-180" max="180" value={active.rotation} onChange={e=>update({rotation:+e.target.value})}/><div className="object-actions"><button onClick={duplicate}>Duplicate</button><button className="danger" onClick={remove}>Delete</button></div>
      </div>}<div className="tip"><b>PRINT TIP</b><p>For best results, use high-resolution artwork and keep essential content inside the safe area.</p></div></aside>
    </section><footer><span>WHITE VINYL BANNER · FULL-COLOR PRINT</span><span>ARTWORK SAVES TO THIS DEVICE</span></footer>
  </main>
}
