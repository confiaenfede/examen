(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#yr').textContent=new Date().getFullYear();

  var nav=$('#nav');
  var app=$('.stage .app');

  // titular que se escribe solo: cambia la segunda línea por frases de 3 o 4 palabras y repite
  var tw=$('#tw'),tw0=$('#tw0'),caret=$('.caret'),hero=$('.hero');
  if(tw&&tw0&&!reduce){
    var frases=['en un solo lugar','ordenada y controlada','siempre conectada','lista para crecer','a un click de todo'];
    var fi=0,ci=frases[0].length,fase='espera';
    // arranque: todo se escribe desde cero (primero "Tu inmobiliaria," y después la frase)
    var fijo=tw0.textContent;
    tw0.textContent='';tw.textContent='';
    tw0.after(caret);caret.classList.add('typing');
    hero.classList.add('typing');
    (function intro(){
      var i=0,j=0;
      function l1(){
        i++;tw0.textContent=fijo.slice(0,i);
        if(i<fijo.length){setTimeout(l1,72+Math.random()*40)}
        else{tw.after(caret);hero.classList.remove('typing');setTimeout(l2,320)}
      }
      function l2(){
        j++;tw.textContent=frases[0].slice(0,j);
        if(j<frases[0].length){setTimeout(l2,72+Math.random()*40)}
        else{caret.classList.remove('typing');hero.classList.remove('typing');setTimeout(twStep,200)}
      }
      setTimeout(l1,500);
    })();
    function twStep(){
      var f=frases[fi],delay=70;
      if(fase==='espera'){        // se queda titilando
        fase='borra';delay=2200;caret.classList.remove('typing');
      }else if(fase==='borra'){   // borra la frase actual
        caret.classList.add('typing');
        ci--;tw.textContent=f.slice(0,Math.max(ci,0));
        delay=34;
        if(ci<=0){fi=(fi+1)%frases.length;fase='escribe';delay=380}
      }else{                       // escribe la siguiente
        caret.classList.add('typing');
        ci++;tw.textContent=frases[fi].slice(0,ci);
        delay=62+Math.random()*50;
        if(ci>=frases[fi].length){fase='espera';delay=250}
      }
      setTimeout(twStep,delay);
    }
  }

  // texto que va apareciendo palabra por palabra al scrollear
  // (letra por letra, como si se estuviera tipeando; las palabras no se cortan al saltar de línea)
  // divide en letras todos los textos de un elemento sin perder el formato interno (puntos naranjas, resaltados)
  function splitLetters(el){
    var txt=el.textContent.trim().replace(/\s+/g,' ');
    el.setAttribute('aria-label',txt);
    var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[],n;
    while((n=tw.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      var t=node.nodeValue.replace(/\s+/g,' ');
      if(!t.trim()){return}
      var frag=document.createDocumentFragment();
      t.split(/( )/).forEach(function(part){
        if(part===' '){frag.appendChild(document.createTextNode(' '));return}
        if(!part) return;
        var w=document.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
        part.split('').forEach(function(c){var i=document.createElement('i');i.textContent=c;w.appendChild(i)});
        frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag,node);
    });
    return {el:el,chars:$$('i',el),last:[]};
  }
    var wrs=$$('.wr').map(splitLetters);
  // los títulos no se escriben: aparecen con un fade suave al entrar
  $$('main section h2, main section .head .sub').forEach(function(el){if(!el.classList.contains('rv')&&!el.closest('.rv'))el.classList.add('rv')});

  // organigrama: se arma al scrollear hacia abajo y se desarma al volver hacia arriba
  var orgBox=$('.org'),orgTree=$('.tree'),orgLis=$$('.tree li'),orgUls=$$('.tree ul'),orgShown=-1;
  function setOrg(n){
    if(n===orgShown) return;
    // FLIP: guardamos dónde estaba cada nodo visible para que se deslice al nuevo lugar
    var before=[];
    if(orgShown>=0&&!reduce){
      orgLis.forEach(function(li,i){
        if(li.classList.contains('on')){var nd=li.firstElementChild;before.push({nd:nd,r:nd.getBoundingClientRect()})}
      });
    }
    orgShown=n;
    orgLis.forEach(function(li,i){li.classList.toggle('on',i<n)});
    // conectores según los hermanos visibles de cada nivel
    orgUls.forEach(function(ul){
      var vis=[].filter.call(ul.children,function(c){return c.classList.contains('on')});
      ul.classList.toggle('empty',vis.length===0);
      [].forEach.call(ul.children,function(c){c.classList.remove('vf','vl2','so')});
      if(vis.length){vis[0].classList.add('vf');vis[vis.length-1].classList.add('vl2');if(vis.length===1)vis[0].classList.add('so')}
    });
    fitOrg();
    // al principio se ve grande y se achica a medida que se arma
    var k=Math.min(Math.max((n-1)/(orgLis.length-1),0),1);
    orgTree.style.transform=window.innerWidth>900?'scale('+(1.28-.28*k).toFixed(3)+')':'none';
    // ...y los que ya estaban visibles se mueven (y se achican) hasta su nueva posición
    before.forEach(function(b){
      if(!b.nd.parentNode.classList.contains('on')) return;
      var a=b.nd.getBoundingClientRect(),ratio=a.width/b.nd.offsetWidth||1;
      var dx=(b.r.left-a.left)/ratio,dy=(b.r.top-a.top)/ratio,sc=b.r.width/a.width||1;
      if(Math.abs(dx)<1&&Math.abs(dy)<1&&Math.abs(sc-1)<.01) return;
      b.nd.animate([{transformOrigin:'0 0',transform:'translate('+dx+'px,'+dy+'px) scale('+sc+')'},{transformOrigin:'0 0',transform:'none'}],{duration:650,easing:'cubic-bezier(.22,.7,.2,1)'});
    });
  }
  // acerca las sucursales entre sí según lo que esté visible, sin que se pisen
  function fitOrg(){
    var row=$('.tree>li>ul');if(!row) return;
    var sucs=[].slice.call(row.children);
    sucs.forEach(function(li){li.style.marginLeft='';li.style.removeProperty('--aw');li.style.removeProperty('--bw')});
    if(sucs.length<2) return;
    var vis=sucs.filter(function(li){return li.classList.contains('on')});
    for(var i=1;i<vis.length;i++){
      var prev=vis[i-1],cur=vis[i],pw=prev.offsetWidth,cw=cur.offsetWidth;
      var dnode=cur.firstElementChild;
      // ancho del primer nivel de hijos de la rama actual (lo más angosto que la ocupa a la altura de los hermanos)
      var inner=cur.querySelector(':scope>ul>li.on>.nd');
      var g=inner?inner.offsetWidth+12:dnode.offsetWidth+12;
      var hasKids=!!cur.querySelector(':scope>ul');
      var pull=Math.min(hasKids?(cw-g)/2-30:9999,(pw+cw)/2-(dnode.offsetWidth+prev.firstElementChild.offsetWidth)/2-28);
      if(pull>0) cur.style.marginLeft=(-Math.round(pull))+'px';
      // los conectores horizontales no pueden pasarse del centro del hermano vecino
      var dist=(pw+cw)/2-Math.max(pull,0);
      prev.style.setProperty('--aw',Math.max(Math.min(pw/2,dist),0)+'px');
      cur.style.setProperty('--bw',Math.max(Math.min(cw/2,dist),0)+'px');
    }
  }
  function fixOrgHeight(){
    // fija el alto del bloque con todo armado, para que no salte la página
    orgBox.style.minHeight='0px';
    orgLis.forEach(function(li){li.classList.add('on')});
    orgUls.forEach(function(ul){ul.classList.remove('empty')});
    orgTree.style.transform='none';
    orgBox.style.minHeight=orgTree.offsetHeight+'px';
    orgShown=-1;
  }
  if(orgBox){
    fixOrgHeight();
    if(reduce){setOrg(orgLis.length+1)}else{setOrg(0)}
    window.addEventListener('resize',function(){fixOrgHeight();req()});
  }

  var pathEl=$('#path'),pStops=pathEl?$$('.stop',pathEl):[];
  // Hoy / 2027: se arma solo apenas se ve, sin depender del scroll
  if(pathEl){
    var pDone=false;
    function pathPlay(){
      if(pDone) return;pDone=true;pathEl.classList.add('go');
      pStops.forEach(function(st,k){
        var lis=$$('li',st),t0=k*1500;
        setTimeout(function(){st.classList.add('on')},t0+100);
        lis.forEach(function(li,i){setTimeout(function(){li.classList.add('on')},t0+450+i*260)});
      });
    }
    if(reduce){pathEl.classList.add('go');pStops.forEach(function(x){x.classList.add('on');$$('li',x).forEach(function(l){l.classList.add('on')})})}
    else{new IntersectionObserver(function(es,ob){if(es[0].isIntersecting){pathPlay();ob.disconnect()}},{threshold:.35}).observe(pathEl)}
  }

  // recorrido: la etapa activa depende de cuánto se scrolleó dentro del bloque fijo
  var recRun=$('.rec__run'),recPin=$('.rec__pin'),recSteps=$$('#recStepper li'),recTxt=$$('.rec__txt .st'),recPn=$$('.rec__card .pn'),recNow=-1;
  function setRec(i){
    if(i===recNow) return;recNow=i;
    recSteps.forEach(function(el,k){el.classList.toggle('done',k<i);el.classList.toggle('now',k===i)});
    recTxt.forEach(function(el,k){el.classList.toggle('on',k===i)});
    recPn.forEach(function(el,k){el.classList.toggle('on',k===i)});
  }
  if(recRun){setRec(0)}
  // el recorrido avanza solo cada unos segundos (mientras se ve en pantalla) y también se puede tocar cada etapa
  var recTimer=null,recPause=0,recVisible=false,RECMS=4600;
  function recTick(){
    if(!recVisible||Date.now()<recPause) return;
    setRec((recNow+1)%recSteps.length);
  }
  function recGo(i,user){setRec(i);if(user)recPause=Date.now()+14000}
  recSteps.forEach(function(li,k){
    li.setAttribute('role','button');li.setAttribute('tabindex','0');
    li.addEventListener('click',function(){recGo(k,true)});
    li.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();recGo(k,true)}});
  });
  if(recRun&&!reduce){
    new IntersectionObserver(function(es){
      recVisible=es[0].isIntersecting;
      if(recVisible&&!recTimer){recTimer=setInterval(recTick,RECMS)}
    },{threshold:.35}).observe(recPin);
  }
  // mapa de cierres (MapLibre + estilo claro de CARTO, como mapcn)
  var mapEl=$('#map'),mapStarted=false;
  // pines de ejemplo (inventados): grupos alrededor de zonas del Gran Buenos Aires, con una semilla fija
  var zonas=[[-58.4258,-34.5807,40],[-58.4417,-34.6186,30],[-58.4546,-34.5627,26],[-58.6198,-34.6509,24],[-58.6425,-34.6522,14],[-58.3680,-34.6620,20],[-58.3910,-34.8000,18],[-58.5105,-34.8967,14],[-58.5276,-34.4710,22],[-58.4863,-34.5736,20],[-58.5600,-34.5350,12],[-58.3480,-34.6100,16],[-58.3000,-34.7300,10]];
  var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
  var pines=[];
  zonas.forEach(function(z){for(var i=0;i<z[2];i++){var r=(rnd()+rnd()+rnd()-1.5)*.045,t=(rnd()+rnd()+rnd()-1.5)*.04;pines.push([z[0]+r,z[1]+t])}});
  // se mezclan para que aparezcan de a uno en distintos lugares
  for(var q=pines.length-1;q>0;q--){var w=Math.floor(rnd()*(q+1)),tmp=pines[q];pines[q]=pines[w];pines[w]=tmp}
  function geo(n){return {type:'FeatureCollection',features:pines.slice(0,n).map(function(c){return {type:'Feature',geometry:{type:'Point',coordinates:c},properties:{}}})}}
  function startMap(){
    if(mapStarted||!mapEl) return;mapStarted=true;
    if(!window.maplibregl){mapEl.innerHTML='<p style="padding:40px;text-align:center;color:#63787e">No se pudo cargar el mapa.</p>';return}
    var map=new maplibregl.Map({container:mapEl,style:'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',center:[-58.50,-34.65],zoom:9.4,attributionControl:{compact:true},cooperativeGestures:true});
    map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
    // botones de zona: la cámara viaja de una a otra
    var vistas={gba:{c:[-58.50,-34.65],z:9.4},caba:{c:[-58.44,-34.60],z:11.3}};
    $$('#mapTabs button').forEach(function(b){
      b.addEventListener('click',function(){
        var v=vistas[b.getAttribute('data-z')];
        $$('#mapTabs button').forEach(function(x){x.classList.toggle('on',x===b)});
        map.flyTo({center:v.c,zoom:v.z,duration:reduce?0:2200,essential:true});
      });
    });
    map.on('load',function(){
      map.addSource('cierres',{type:'geojson',data:geo(0)});
      map.addLayer({id:'halo',type:'circle',source:'cierres',paint:{'circle-radius':['interpolate',['linear'],['zoom'],5,8,10,14],'circle-color':'#e06538','circle-opacity':.18,'circle-blur':.6}});
      map.addLayer({id:'pin',type:'circle',source:'cierres',paint:{'circle-radius':['interpolate',['linear'],['zoom'],5,3.5,10,6.5],'circle-color':'#e06538','circle-stroke-width':['interpolate',['linear'],['zoom'],5,1.2,10,2.5],'circle-stroke-color':'#ffffff'}});
      // los pines van apareciendo de a poco
      var n=0,total=pines.length,src=map.getSource('cierres');
      if(reduce){src.setData(geo(total));counter(total)}else{
        var iv=setInterval(function(){n=Math.min(n+7,total);src.setData(geo(n));counter(n);if(n>=total)clearInterval(iv)},95);
      }
      var pop=new maplibregl.Popup({offset:14,closeButton:false,className:'pp-lock'});
      map.on('mouseenter','pin',function(){map.getCanvas().style.cursor='pointer'});
      map.on('mouseleave','pin',function(){map.getCanvas().style.cursor=''});
      // al tocar un pin se ve el detalle... borroso: es solo para usuarios
      map.on('click','pin',function(e){
        pop.setLngLat(e.features[0].geometry.coordinates).setHTML('<div class="pp pp--lock"><div class="pp__blur"><b>Operación cerrada</b><dl><dt>Publicación</dt><dd>US$ 000.000</dd><dt>Cierre</dt><dd>US$ 000.000</dd><dt>Días</dt><dd>00</dd><dt>Margen</dt><dd>0 %</dd></dl></div><div class="pp__lk"><span>🔒</span><b>Disponible para usuarios de Tueria®</b><a href="#acceso">Solicitá acceso</a></div></div>').addTo(map);
      });
    });
  }
  // importación de propiedades + calendario: se repite mientras la tarjeta está en pantalla
  var impEl=$('#imp');
  if(impEl){
    var iBar=$('#impBar'),iN=$('#impN'),iSt=$('#impState'),iRows=$$('#impList li'),iEv=$$('#impCal li'),iCal=$('#impCal'),iTimers=[],iOn=false;
    function iClear(){iTimers.forEach(clearTimeout);iTimers=[]}
    function iAt(ms,fn){iTimers.push(setTimeout(fn,ms))}
    function iReset(){iBar.style.transition='none';iBar.style.width='0';iN.textContent='0';iSt.textContent='Importando…';iSt.className='pill';iRows.concat(iEv).forEach(function(e){e.classList.remove('on')});iCal.classList.remove('on')}
    function iFinal(){iBar.style.transition='none';iBar.style.width='100%';iN.textContent='174';iSt.textContent='Listo';iSt.className='pill ok';iRows.concat(iEv).forEach(function(e){e.classList.add('on')});iCal.classList.add('on')}
    function iRun(){
      if(!iOn) return;iClear();iReset();
      iAt(60,function(){iBar.style.transition='width 3.2s cubic-bezier(.4,.1,.2,1)';iBar.style.width='100%'});
      var t0=Date.now();
      for(var k=1;k<=32;k++){(function(k){var p=k/32;iAt(100+p*3300,function(){iN.textContent=Math.round(174*(1-Math.pow(1-p,2.2)))})})(k)}
      iRows.forEach(function(r,i){iAt(700+i*650,function(){r.classList.add('on')})});
      iAt(3500,function(){iSt.textContent='Listo';iSt.className='pill ok'});
      iAt(4000,function(){iCal.classList.add('on')});
      iEv.forEach(function(e,i){iAt(4300+i*450,function(){e.classList.add('on')})});
      iAt(10500,iRun);
    }
    if(reduce){iFinal()}else{
      new IntersectionObserver(function(es){
        var v=es[0].isIntersecting;
        if(v&&!iOn){iOn=true;iRun()}else if(!v&&iOn){iOn=false;iClear()}
      },{threshold:.4}).observe(impEl);
    }
  }
  var cntEl=$('#mapCount');
  function counter(n){if(cntEl)cntEl.textContent=n}
  if(mapEl){new IntersectionObserver(function(es,ob){if(es[0].isIntersecting){startMap();ob.disconnect()}},{rootMargin:'300px'}).observe(mapEl)}

  var darkSecs=$$('.rubro,.acceso,.foot');
  // en pantallas chicas el organigrama se desliza: arranca centrado
  (function orgScroll(){var o=$('.org');if(o&&window.innerWidth<=900){o.scrollLeft=(o.scrollWidth-o.clientWidth)/2}})();
  var tick=false;
  function frame(){
    tick=false;
    var y=window.scrollY||0;
    nav.classList.toggle('scrolled',y>8);
    var nr=nav.getBoundingClientRect(),ny=nr.top+nr.height/2,dark=darkSecs.some(function(s){var r=s.getBoundingClientRect();return r.top<=ny&&r.bottom>=ny});
    nav.classList.toggle('nav--dark',dark);
    if(reduce) return;
    if(hero&&window.innerWidth>900){
      // el contenido del inicio sube más despacio que la página y se va aclarando
      var hp=Math.min(Math.max(y/(window.innerHeight*.9),0),1);
      hero.style.transform='translateY('+(y*.28).toFixed(1)+'px)';
      hero.style.opacity=(1-.85*hp).toFixed(3);
    }else if(hero){hero.style.transform='none';hero.style.opacity='1'}
    if(orgBox){
      var run=$('.roles__run'),pin=$('.roles__pin'),show;
      if(window.innerWidth<=900||!run){
        show=orgLis.length+1;
      }else{
        // el bloque queda fijo mientras se arma: el avance depende de cuánto se scrolleó dentro de su tramo
        var rr=run.getBoundingClientRect(),pr=pin.getBoundingClientRect(),z=pr.height/pin.offsetHeight||1;
        // empieza a armarse apenas el bloque asoma en pantalla (no cuando ya está fijo) y termina un poco antes de soltarse
        var startTop=window.innerHeight*.7,endTop=(64*z-(rr.height-pr.height))+(rr.height-pr.height)*.15;
        var op=(startTop-rr.top)/Math.max(startTop-endTop,1);
        show=Math.ceil(Math.min(Math.max(op,0),1)*(orgLis.length+1)-1e-6);
      }
      setOrg(show);
    }
    if(app){
      var p=Math.min(Math.max(y/520,0),1);
      app.style.transform='rotateX('+(7*(1-p))+'deg) scale('+(.93+.07*p)+')';
    }
    var vh=window.innerHeight;
    wrs.forEach(function(w){
      var r=w.el.getBoundingClientRect();
      if(r.bottom<-50||r.top>vh+50) return;           // fuera de pantalla: no hace falta tocarlo
      var n=w.chars.length,pr=(vh*.82-r.top)/(r.height+vh*.37);
      var rev=Math.min(Math.max(pr,0),1)*(n+4);          // cuántas letras ya "se escribieron"
      for(var i=0;i<n;i++){
        var o=Math.round((.16+.84*Math.min(Math.max((rev-i)/4,0),1))*50)/50;
        if(w.last[i]!==o){w.chars[i].style.opacity=o;w.last[i]=o}
      }
    });
  }
  function req(){if(!tick){tick=true;requestAnimationFrame(frame)}}
  window.addEventListener('scroll',req,{passive:true});
  window.addEventListener('resize',req);
  frame();

  // reveal
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.15});
  $$('.rv').forEach(function(el){io.observe(el)});

  // contadores
  // cuentan hasta el valor y después siguen sumando de a poco mientras estén en pantalla
  function show(n,v){n.textContent=(n.getAttribute('data-pre')||'')+v.toLocaleString('es-AR')}
  function startTick(n){
    var every=+n.getAttribute('data-every')||0,range=(n.getAttribute('data-step')||'1').split('-');
    if(!every||n._timer||reduce) return;
    var lo=+range[0],hi=+(range[1]||range[0]);
    n._timer=setInterval(function(){
      n._v+=lo+Math.floor(Math.random()*(hi-lo+1));
      show(n,n._v);
      n.classList.remove('bump');void n.offsetWidth;n.classList.add('bump');
    },every);
  }
  function stopTick(n){if(n._timer){clearInterval(n._timer);n._timer=null}}
  function count(n){
    var end=+n.getAttribute('data-count');
    if(reduce){n._v=end;return}
    if(n._v!==undefined){startTick(n);return}   // ya contó: sigue desde donde estaba
    n._v=0;
    var t0=performance.now(),d=1400;
    (function step(t){
      var p=Math.min((t-t0)/d,1);
      n._v=Math.round(end*(1-Math.pow(1-p,3)));
      show(n,n._v);
      if(p<1) requestAnimationFrame(step); else startTick(n);
    })(t0);
  }
  var cio=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){count(e.target)}else{stopTick(e.target)}});
  },{threshold:.4});
  $$('[data-count]').forEach(function(n){cio.observe(n)});

  // formulario: arma un mail (sitio estático, sin backend)
  var form=$('#accesoForm'),msg=$('#formMsg');
  form.addEventListener('submit',function(ev){
    ev.preventDefault();
    var f=new FormData(form),nombre=(f.get('nombre')||'').trim(),email=(f.get('email')||'').trim(),empresa=(f.get('empresa')||'').trim();
    if(!nombre||!/^\S+@\S+\.\S+$/.test(email)){msg.textContent='Completá tu nombre y un email válido.';return}
    if(!form.ok.checked){msg.textContent='Necesitamos que aceptes el uso de tus datos para responderte.';return}
    var body='Hola, quiero probar Tueria con mi equipo.%0D%0A%0D%0ANombre: '+encodeURIComponent(nombre)+'%0D%0AEmail: '+encodeURIComponent(email)+'%0D%0AInmobiliaria o equipo: '+encodeURIComponent(empresa||'-');
    window.location.href='mailto:federico@tueria.com?subject='+encodeURIComponent('Solicitud de acceso a Tueria')+'&body='+body;
    msg.textContent='Se abrió tu correo con la solicitud lista para enviar. Si no, escribinos a federico@tueria.com.';
  });
})();
