/* Original resolution-independent isometric architecture: brick, limestone and ink. */
(function () {
    const thumbs = new Map();
    const palette = { ink: '#45554d', cream: '#ede8d8', roof: '#426f65', brick: '#c58e6e', darkBrick: '#a66e52', grass: '#55916b', grass2: '#4b8661', white: '#fff9e8' };
    function renderAsset(ctx, type, level, x, y, width, alpha = 1, building) {
        ctx.save(); ctx.translate(x, y); ctx.scale(width / 200, width / 200); ctx.globalAlpha = alpha;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const p = (a, b, z = 0) => [(a - b) * .5, (a + b) * .25 - z];
        function poly(points, fill, stroke = palette.ink, weight = 1) { ctx.beginPath(); points.forEach((v, i) => i ? ctx.lineTo(...v) : ctx.moveTo(...v)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = weight; ctx.stroke(); } }
        function plane(a, b, w, d, z, color, stroke) { poly([p(a,b,z),p(a+w,b,z),p(a+w,b+d,z),p(a,b+d,z)], color, stroke); }
        function shade(color, amount) { const n=parseInt(color.slice(1),16); return '#' + [n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*amount))).toString(16).padStart(2,'0')).join(''); }
        function stroke(points,color,width=1) {ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
        function box(a,b,w,d,h,color=palette.brick) {
            // Each facade has its own light value. Cast shadows share a northwest light.
            poly([p(a+w,b+d),p(a+w+h*.52,b+d+h*.24),p(a+h*.52,b+d+h*.24),p(a,b+d)],'#263e3020',null);
            const front=ctx.createLinearGradient(...p(a,b+d,h),...p(a,b+d));front.addColorStop(0,color);front.addColorStop(1,shade(color,.88));
            poly([p(a,b+d),p(a+w,b+d),p(a+w,b+d,h),p(a,b+d,h)],front,null);
            poly([p(a+w,b),p(a+w,b+d),p(a+w,b+d,h),p(a+w,b,h)],shade(color,.72),null);
            plane(a,b,w,d,h,shade(color,1.08),null);
            stroke([p(a,b+d,h),p(a+w,b+d,h),p(a+w,b,h)],'#ffffff66',.7);
            if(h>18 && w>40){for(let z=5;z<h;z+=6)stroke([p(a,b+d+.1,z),p(a+w,b+d+.1,z)],shade(color,.8),.35);}
        }
        function roof(a,b,w,d,h) {
            plane(a-2,b-2,w+4,d+4,h+2,palette.roof,null);
            for(let i=6;i<w;i+=8)stroke([p(a+i,b,h+2),p(a+i,b+d,h+2)],'#79a293',.6);
            stroke([p(a-2,b+d+2,h+2),p(a+w+2,b+d+2,h+2)],'#294d44',2);
            if(w>55&&d>50){box(a+8,b+8,14,17,h+5,'#c6cabe');plane(a+9,b+9,12,15,h+6,'#8b9c92',null);}
        }
        function tree(a,b) {const q=p(a,b,4);environment(ctx,q[0],q[1],.66,'tree');}
        function windows(a,b,w,d,h) {
            for(let floor=8;floor<h-6;floor+=13) {
                for(let i=7;i<w-7;i+=13){poly([p(a+i,b+d+.3,floor),p(a+i+7,b+d+.3,floor),p(a+i+7,b+d+.3,floor+8),p(a+i,b+d+.3,floor+8)],'#456971',null);stroke([p(a+i,b+d+.4,floor+8),p(a+i+7,b+d+.4,floor+8)],'#fff4d5',1);stroke([p(a+i+1,b+d+.4,floor+1),p(a+i+1,b+d+.4,floor+7)],'#8bb5b2',1.2);}
                for(let i=7;i<d-7;i+=14)poly([p(a+w+.2,b+i,floor),p(a+w+.2,b+i+7,floor),p(a+w+.2,b+i+7,floor+8),p(a+w+.2,b+i,floor+8)],'#365458',null);
            }
        }
        function field(a,b,w,d) {
            plane(a-2,b-2,w+4,d+4,4,'#365846',null);plane(a,b,w,d,5,palette.grass,null);
            for(let i=0;i<8;i++)if(i%2===0)plane(a+i*w/8,b,w/8,d,5,palette.grass2,null);
            const line='#f6ffe0c0';stroke([p(a+3,b+3,6),p(a+w-3,b+3,6),p(a+w-3,b+d-3,6),p(a+3,b+d-3,6),p(a+3,b+3,6)],line,.8);
            stroke([p(a+w/2,b+3,6),p(a+w/2,b+d-3,6)],line,.7);
            const circle=[];for(let i=0;i<=40;i++)circle.push(p(a+w/2+Math.cos(i/40*Math.PI*2)*d*.13,b+d/2+Math.sin(i/40*Math.PI*2)*d*.13,6));stroke(circle,line,.7);
            for(const side of [0,1]){const x=a+(side?w-3:3),dir=side?-1:1;stroke([p(x,b+d*.25,6),p(x+dir*w*.15,b+d*.25,6),p(x+dir*w*.15,b+d*.75,6),p(x,b+d*.75,6)],line,.7);stroke([p(x,b+d*.4,6),p(x,b+d*.4,12),p(x,b+d*.6,12),p(x,b+d*.6,6)],'#fffbea',1.4);}
        }
        function oval(a,b,rx,ry,z,color) { poly(Array.from({length:56},(_,i)=>p(a+Math.cos(i/56*Math.PI*2)*rx,b+Math.sin(i/56*Math.PI*2)*ry,z)),color); }
        function gable(a,b,w,d,h,color='#7b8f7c') { poly([p(a-3,b-3,h),p(a+w+3,b-3,h),p(a+w+3,b+d/2,h+14),p(a-3,b+d/2,h+14)],color);poly([p(a-3,b+d/2,h+14),p(a+w+3,b+d/2,h+14),p(a+w+3,b+d+3,h),p(a-3,b+d+3,h)],'#4c675c');poly([p(a+w+3,b-3,h),p(a+w+3,b+d/2,h+14),p(a+w+3,b+d+3,h)],palette.cream); }
        // Raised limestone parcel, legible at every zoom.
        poly([[-91,9],[14,60],[111,9],[14,-40]],'#263d3128',null);
        box(-92,-92,184,184,4,'#cfceba'); plane(-88,-88,176,176,4,'#b7c7a2',null);
        // Cut stone pavements and a path to each plot's entrance.
        for(let i=-88;i<88;i+=16){plane(i,74,15,13,4.2,'#e3e0ce',null);plane(74,i,13,15,4.2,'#ddd9c6',null);}
        plane(-11,35,22,39,4.5,'#e6e0cd',null);
        const lv=Math.max(1,level), tall=22+lv*6;
        if(type==='stadium') {
            // Four covered stands, tiered seating and cantilever roofs.
            plane(-84,-75,168,150,5,'#bec5b6',null);
            box(-83,-76,166,20,22,'#dddacb');
            box(65,-56,19,112,20,'#cdcbbd');
            field(-59,-43,118,86);
            for(let tier=0;tier<6;tier++){
                const z=7+tier*2.7;
                plane(-64,-47-tier*4,128,3.5,z,tier%2?'#b87059':'#d5b596',null);
                plane(-64,44+tier*4,128,3.5,z,tier%2?'#b87059':'#d5b596',null);
                plane(-63-tier*3.2,-43,2.8,86,z,'#cfad90',null);
                plane(61+tier*3.2,-43,2.8,86,z,'#b98669',null);
                for(let seat=-58;seat<60;seat+=6){plane(seat,-47-tier*4,3,2,z+.3,'#f0dbc1',null);plane(seat,44+tier*4,3,2,z+.3,'#e4c4a5',null);}
            }
            for(let i=0;i<11;i++){const a=-85+i*16;
                poly([p(a,-78,32),p(a+15,-78,32),p(a+15,-48,38),p(a,-48,38)],i%2?'#e7ece1':'#cddbd0',null);
                poly([p(a,48,38),p(a+15,48,38),p(a+15,78,32),p(a,78,32)],i%2?'#b0c6b8':'#cad7c8',null);
            }
            for(const side of [-1,1])for(let i=0;i<7;i++){
                const y=-48+i*14;
                poly([p(side*85,y,32),p(side*85,y+13,32),p(side*64,y+13,36),p(side*64,y,36)],side===1?'#b9cfc0':'#d7e0d2',null);
            }
            for(const a of [-81,81])for(const b of [-69,69]){
                stroke([p(a,b),p(a,b,48)],'#52675b',1.6);
                const q=p(a,b,50);ctx.fillStyle='#faf6d8';ctx.fillRect(q[0]-5,q[1]-3,10,4);
                ctx.strokeStyle='#728477';ctx.lineWidth=.6;ctx.strokeRect(q[0]-5,q[1]-3,10,4);
            }
            plane(-28,79,56,9,5,'#e9dfc6',null);
        } else if(type==='training'||type==='academy'||type==='track') {
            if(type==='track') {oval(0,0,87,73,3,'#b87959');oval(0,0,77,63,4,'#e2c8a0');oval(0,0,74,60,5,'#b87959');oval(0,0,65,51,6,'#e2c8a0');oval(0,0,62,48,7,'#91a675');field(-43,-29,86,58);box(-65,-78,127,14,17,palette.cream);}
            else if(type==='training'){field(-78,-65,74,115);field(13,-65,65,93);box(12,41,65,29,16,palette.cream);gable(12,41,65,29,16);for(let i=0;i<6;i++)plane(-67+i*11,62,5,5,3,'#c38745');}
            else {box(-76,-70,145,30,25);windows(-76,-70,145,30,25);gable(-76,-70,145,30,25);box(-76,-36,30,100,24,palette.cream);windows(-76,-36,30,100,24);gable(-76,-36,30,100,24);field(-29,-18,98,81);box(40,-70,30,30,tall+14);gable(40,-70,30,30,tall+14);}
        } else if(type==='pool') {
            plane(-73,-57,125,121,5,palette.cream);plane(-64,-48,104,102,6,'#6b9e9a');for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(...p(-64+i*21,-48,7));ctx.lineTo(...p(-64+i*21,54,7));ctx.strokeStyle='#e9e7c5';ctx.lineWidth=1;ctx.stroke();}box(47,-62,27,70,18);roof(47,-62,27,70,18);
        } else if(type==='statue'||type==='fountain') {
            if(type==='statue'){box(-28,-28,56,56,10,palette.cream);box(-16,-16,32,32,28,palette.cream);const q=p(0,0,40);ctx.fillStyle='#8d764b';ctx.beginPath();ctx.arc(q[0],q[1]-13,5,0,Math.PI*2);ctx.fill();poly([[q[0]-6,q[1]-8],[q[0]+6,q[1]-8],[q[0]+9,q[1]+12],[q[0]-9,q[1]+12]],'#8d764b');}
            else{oval(0,0,67,67,4,'#cfbea0');oval(0,0,55,55,9,palette.cream);oval(0,0,46,46,10,'#87b5b1');box(-7,-7,14,14,29,palette.cream);oval(0,0,25,25,30,palette.cream);oval(0,0,20,20,31,'#87b5b1');box(-3,-3,6,6,43,palette.cream);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.beginPath();ctx.moveTo(...p(0,0,43));ctx.quadraticCurveTo(...p(Math.cos(a)*23,Math.sin(a)*23,48),...p(Math.cos(a)*38,Math.sin(a)*38,10));ctx.strokeStyle='#daeee0';ctx.lineWidth=1;ctx.stroke();}}
            tree(-65,52);tree(62,-53);tree(60,54);
        } else if(type==='medical') {
            box(-21,-73,42,146,24,'#e9e7d8');box(-73,-24,146,48,24,'#e9e7d8');plane(-8,-25,16,55,25,'#b8594b');plane(-28,-6,56,17,25,'#b8594b');windows(-21,29,42,44,24);box(43,48,28,16,9,'#f8efd5');plane(49,49,11,14,10,'#89aaaf');tree(-62,58);
        } else if(type==='hotel') {
            box(-75,-61,62,107,45+lv*4,palette.cream);windows(-75,-61,62,107,45+lv*4);roof(-75,-61,62,107,45+lv*4);box(-5,-70,80,51,27);windows(-5,-70,80,51,27);gable(-5,-70,80,51,27);plane(0,1,76,73,4,palette.cream);plane(9,10,53,52,5,'#87b5b1');for(let i=0;i<4;i++)plane(-67,53+i*6,36,4,4,palette.cream);
        } else if(type==='scout') {
            oval(-5,-12,58,58,1,'#ad9c7c');oval(-5,-12,58,58,25,palette.cream);const q=p(-5,-12,25);ctx.beginPath();ctx.ellipse(q[0],q[1],41,34,0,Math.PI,Math.PI*2);ctx.fillStyle='#71887b';ctx.fill();ctx.strokeStyle='#415e52';ctx.stroke();ctx.beginPath();ctx.moveTo(q[0]-3,q[1]-33);ctx.lineTo(q[0]+10,q[1]-2);ctx.strokeStyle=palette.cream;ctx.lineWidth=5;ctx.stroke();box(19,28,43,47,13,palette.cream);roof(19,28,43,47,13);tree(-64,57);
        } else if(type==='media') {
            box(-76,-69,96,78,26,palette.cream);windows(-76,-69,96,78,26);roof(-76,-69,96,78,26);ctx.strokeStyle='#52685b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(...p(19,40));ctx.lineTo(...p(47,40,106));ctx.lineTo(...p(76,40));ctx.stroke();for(let i=0;i<7;i++){const h=i*13,w=28*(1-h/106);ctx.beginPath();ctx.moveTo(...p(47-w,40,h));ctx.lineTo(...p(47+w,40,h));ctx.lineTo(...p(47-w*.8,40,h+13));ctx.stroke();}const q=p(-31,-25,32);ctx.beginPath();ctx.ellipse(q[0],q[1],19,11,-.4,0,Math.PI);ctx.fillStyle=palette.cream;ctx.fill();ctx.stroke();
        } else if(type==='museum') {
            box(-73,-62,146,95,27,palette.cream);for(let i=0;i<7;i++){box(-66+i*21,33,7,15,31,palette.cream);plane(-69+i*21,31,13,18,32,palette.cream);}gable(-76,-64,152,111,33);poly([p(-80,50,33),p(80,50,33),p(0,50,52)],palette.cream);for(let i=0;i<4;i++)plane(-77-i*2,52+i*6,154+i*4,6,8-i*2,palette.cream);
        } else if(type==='clubhq') {
            box(-67,-49,134,81,29,palette.cream);windows(-67,-49,134,81,29);gable(-67,-49,134,81,29);box(-21,-13,42,48,55,palette.cream);gable(-21,-13,42,48,55);const q=p(0,35,45);ctx.beginPath();ctx.arc(q[0],q[1],6,0,Math.PI*2);ctx.fillStyle=palette.white;ctx.fill();ctx.strokeStyle=palette.ink;ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.moveTo(q[0],q[1]-4);ctx.lineTo(q[0],q[1]);ctx.lineTo(q[0]+3,q[1]+1);ctx.stroke();for(let i=0;i<4;i++)plane(-24-i*6,37+i*7,48+i*12,7,8-i*2,palette.cream);tree(-71,66);tree(69,67);
        } else if(type==='restaurant') {
            box(-71,-68,103,70,22);windows(-71,-68,103,70,22);gable(-71,-68,103,70,22,'#a77650');box(18,-66,11,12,49);for(const [a,b] of [[-49,31],[1,31],[53,31],[-27,69],[30,69]]){const q=p(a,b,16);ctx.beginPath();ctx.ellipse(q[0],q[1],13,7,0,0,Math.PI*2);ctx.fillStyle='#ba7c56';ctx.fill();ctx.strokeStyle=palette.ink;ctx.lineWidth=.7;ctx.stroke();ctx.beginPath();ctx.moveTo(...p(a,b));ctx.lineTo(...p(a,b,16));ctx.stroke();}
        } else {
            const w=type==='media'?75:112, d=type==='hotel'?105:78;
            box(-64,-60,w,d,tall);windows(-64,-60,w,d,tall);roof(-64,-60,w,d,tall);
            // Secondary wing and storefront arcades distinguish purpose and upgrade tiers.
            if(lv>=2||type==='hotel'){box(51,-44,30,92,tall-8);windows(51,-44,30,92,tall-8);roof(51,-44,30,92,tall-8);}
            if(type==='fanshop'||type==='restaurant'){for(let i=0;i<6;i++)plane(-64+i*18,18,18,17,16,i%2?'#eee1bb':'#a45b43'); for(const a of [-40,12])box(a,49,20,17,8,palette.cream);}
            if(type==='medical'){const q=p(-8,-16,tall+5);ctx.fillStyle='#9b4236';ctx.fillRect(q[0]-3,q[1]-10,6,20);ctx.fillRect(q[0]-10,q[1]-3,20,6);}
            if(type==='media'){const q=p(8,-10,tall);ctx.beginPath();ctx.moveTo(q[0]-9,q[1]);ctx.lineTo(q[0],q[1]-45);ctx.lineTo(q[0]+9,q[1]);ctx.strokeStyle=palette.ink;ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.arc(q[0],q[1]-42,10,.5,2.7);ctx.stroke();}
            if(type==='museum'){for(let i=0;i<5;i++)box(-57+i*21,19,5,9,tall-6,palette.cream);plane(-65,14,115,17,tall+3,palette.cream);}
            if(type==='scout'){const q=p(-9,-17,tall+5);ctx.beginPath();ctx.arc(q[0],q[1]-5,12,0,Math.PI,true);ctx.fillStyle=palette.cream;ctx.fill();ctx.stroke();}
            if(type==='clubhq'){box(-9,-9,20,20,tall+15);roof(-9,-9,20,20,tall+15);}
            tree(-74,65);tree(70,65);
        }
        if(building?.construction){
            ctx.fillStyle='#e5bd59';ctx.strokeStyle=palette.ink;ctx.lineWidth=1;ctx.fillRect(-55,13,110,13);ctx.strokeRect(-55,13,110,13);for(let i=-51;i<52;i+=13){ctx.beginPath();ctx.moveTo(i,25);ctx.lineTo(i+8,14);ctx.stroke();}
            ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillStyle=palette.ink;ctx.fillText('İNŞAAT',0,10);
        }
        const short={stadium:'STADYUM',training:'ANTRENMAN',academy:'AKADEMİ',medical:'REVİR',track:'KOŞU PİSTİ',pool:'HAVUZ',clubhq:'İDARE',hotel:'KAMP OTELİ',scout:'SCOUT',media:'BASIN EVİ',museum:'MÜZE',restaurant:'LOKANTA',fanshop:'MAĞAZA',statue:'ANIT',fountain:'ÇEŞME'}[type];
        if(building){ctx.font='600 7px sans-serif';ctx.textAlign='center';ctx.fillStyle='#f8f5e8ee';ctx.fillRect(-45,52,90,12);ctx.fillStyle='#43564a';ctx.fillText(`${short} · ${building?.paused?'KAPALI':level===0?'YENİ':level}`,0,60);}
        ctx.restore();
    }
    const sprites = new Map();
    function sprite(type,level,building) {
        const key=[type,level,!!building,!!building?.paused,!!building?.construction].join(':');
        if(!sprites.has(key)){
            const c=document.createElement('canvas');c.width=640;c.height=520;
            renderAsset(c.getContext('2d'),type,level,320,300,520,1,building);
            sprites.set(key,c);
        }
        return sprites.get(key);
    }
    function draw(ctx,type,level,x,y,width,alpha=1,building) {
        const c=sprite(type,level,building),scale=width/520;
        ctx.save();ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.drawImage(c,x-320*scale,y-300*scale,640*scale,520*scale);ctx.restore();
    }
    function thumbnail(type) {
        if(!thumbs.has(type))thumbs.set(type,sprite(type,2).toDataURL());
        return thumbs.get(type);
    }
    function environment(ctx,x,y,s,type){
        ctx.save();ctx.translate(x,y);ctx.scale(s,s);
        ctx.fillStyle='#24372324';ctx.beginPath();ctx.ellipse(8,4,13,5,.3,0,Math.PI*2);ctx.fill();
        if(type==='lamp'){
            ctx.fillStyle='#3f5851';ctx.fillRect(-1,-27,2,27);ctx.fillRect(-3,-2,6,3);
            ctx.strokeStyle='#3f5851';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-26);ctx.quadraticCurveTo(0,-33,8,-31);ctx.stroke();
            ctx.fillStyle='#f9e8b7';ctx.fillRect(5,-31,6,3);ctx.fillStyle='#3f5851';ctx.fillRect(4,-33,8,2);
        } else {
            ctx.fillStyle='#796550';ctx.fillRect(-2,-24,4,25);
            for(const [a,b,r,c] of [[3,-19,11,'#345f48'],[-7,-23,9,'#437451'],[7,-26,10,'#4b8058'],[-2,-32,12,'#609867'],[-5,-37,7,'#82b27e']]){
                const g=ctx.createRadialGradient(a-3,b-4,1,a,b,r);g.addColorStop(0,c);g.addColorStop(1,c==='#345f48'?'#2f5641':c);
                ctx.beginPath();ctx.arc(a,b,r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
            }
            for(let i=0;i<8;i++){ctx.fillStyle='#b5d18a55';ctx.beginPath();ctx.ellipse(Math.sin(i*8)*8-2,-29+Math.cos(i*3)*8,2.3,1.4,-.5,0,Math.PI*2);ctx.fill();}
        }
        ctx.restore();
    }
    function vehicle(ctx,x,y,scale,bus,alongColumn) {
        ctx.save();ctx.translate(x,y);ctx.scale(alongColumn?scale:-scale,scale);
        const poly=(points,color,stroke)=>{ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.65;ctx.stroke();}};
        const len=bus?18:12, body=bus?'#c99b55':'#ba604c', side=bus?'#987244':'#864538';
        ctx.fillStyle='#1d2c2740';ctx.beginPath();ctx.ellipse(4,4,len+10,5,.12,0,Math.PI*2);ctx.fill();
        poly([[-len,-3],[4,5],[len+8,-2],[-1,-10]],body,'#30443e');
        poly([[-len,-3],[4,5],[4,1],[-len,-7]],side,'#30443e');
        poly([[4,5],[len+8,-2],[len+8,-6],[4,1]],bus?'#765735':'#68352f','#30443e');
        poly([[-len+2,-7],[4,-2],[len-1,-6],[-1,-12]],'#d7e1d7','#30443e');
        poly([[-len+3,-7],[4,-2],[4,-5],[-len+2,-10]],'#527d83');
        poly([[5,-2],[len-1,-6],[len-1,-9],[5,-5]],'#355f67');
        if(bus){for(let i=-11;i<3;i+=6)poly([[i,-7],[i+4,-5],[i+4,-8],[i,-10]],'#436c70');poly([[-4,-3],[3,1],[3,-5],[-4,-8]],'#f1d397');}
        for(const [a,b]of[[-len+5,-1],[1,4],[len+3,-2]]){ctx.beginPath();ctx.ellipse(a,b,2,2.35,0,0,Math.PI*2);ctx.fillStyle='#26322e';ctx.fill();ctx.beginPath();ctx.arc(a,b,0.75,0,Math.PI*2);ctx.fillStyle='#c8b98f';ctx.fill();}
        ctx.fillStyle='#fff4b3';ctx.beginPath();ctx.arc(len+5,-4,1.4,0,Math.PI*2);ctx.fill();
        ctx.restore();
    }
    function pedestrian(ctx,x,y,scale,variant=0) {
        ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
        const coats=['#bb604b','#416c69','#c69c55','#615878'];
        ctx.fillStyle='#26372f2e';ctx.beginPath();ctx.ellipse(1,2,4,1.4,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#e4b68f';ctx.beginPath();ctx.arc(0,-8,2.2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=coats[variant%coats.length];ctx.beginPath();ctx.moveTo(-3,-5);ctx.lineTo(3,-5);ctx.lineTo(2,1);ctx.lineTo(-2,1);ctx.closePath();ctx.fill();
        ctx.strokeStyle='#30423b';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-1,1);ctx.lineTo(-2,4);ctx.moveTo(1,1);ctx.lineTo(2,4);ctx.stroke();
        ctx.restore();
    }
    window.TycoonArchitecture={draw,thumbnail,environment,vehicle,pedestrian};
})();
