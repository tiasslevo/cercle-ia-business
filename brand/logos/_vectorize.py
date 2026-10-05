import math, io
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
INK='#141C2C'; GOLD='#B98B3E'
OUT='/home/juniro/side-quest/cercle-ia-business/brand/logos/'
_cache={}
def font(name,w):
    k=(name,w)
    if k not in _cache:
        f=TTFont(f'/tmp/fonts/{name}[wght].ttf'); _cache[k]=instantiateVariableFont(f,{'wght':w})
    return _cache[k]
def text(name,w,s,size,ls=0.0):
    """renvoie (path d, largeur) pour un texte à la ligne de base y=0, x=0"""
    f=font(name,w); gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f['head'].unitsPerEm; sc=size/upm
    hmtx=f['hmtx']; x=0; ds=[]
    for i,ch in enumerate(s):
        g=cmap.get(ord(ch))
        if ch==' ': x+=hmtx[cmap[32]][0]*sc+ls*size; continue
        pen=SVGPathPen(gs); tp=TransformPen(pen,(sc,0,0,-sc,x,0)); gs[g].draw(tp); ds.append(pen.getCommands())
        x+=hmtx[g][0]*sc+(ls*size if i<len(s)-1 else 0)
    return ' '.join(ds), x
def tpath(d,x,y,fill): return f'<path transform="translate({x:.2f} {y:.2f})" fill="{fill}" d="{d}"/>'
def capH(name,w,size):
    f=font(name,w); return f['OS/2'].sCapHeight/f['head'].unitsPerEm*size
def spark(cx,cy,s,k=0.16):
    p=[(cx,cy-s),(cx+s,cy),(cx,cy+s),(cx-s,cy)]; d=f'M{p[0][0]:.2f} {p[0][1]:.2f}'
    for i in range(4):
        a=p[i]; b=p[(i+1)%4]; d+=f'Q{cx+(a[0]+b[0]-2*cx)*k:.2f} {cy+(a[1]+b[1]-2*cy)*k:.2f} {b[0]:.2f} {b[1]:.2f}'
    return d+'Z'
def hexd(cx,cy,r):
    return 'M'+' L'.join(f'{cx+r*math.cos(math.radians(60*i-90)):.2f} {cy+r*math.sin(math.radians(60*i-90)):.2f}' for i in range(6))+'Z'
# ---- symboles (repère : boîte 0..W, 0..H) ----
def ruche(x,y,size,ink=INK,gold=GOLD,cls=True):
    R=size/5.9; s=1.17; cx=x+size/2; cy=y+size/2; out=''
    offs=[(0,0)]+[(math.sqrt(3)*R*math.cos(math.radians(60*i))*s, math.sqrt(3)*R*math.sin(math.radians(60*i))*s) for i in range(6)]
    for i,(dx,dy) in enumerate(offs):
        out+=f'<path data-part="{"core" if i==0 else "cell"}" fill="{gold if i==0 else ink}" d="{hexd(cx+dx,cy+dy,R)}"/>'
    return out
def seuil(x,y,h,detailed=True,ink=INK,gold=GOLD):
    k=h/110; X=lambda v:x+v*k; Y=lambda v:y+v*k
    o=f'<path data-part="arch" fill="none" stroke="{ink}" stroke-width="{18*k:.2f}" d="M{X(9):.2f} {Y(110):.2f}V{Y(50):.2f}A{41*k:.2f} {41*k:.2f} 0 0 1 {X(91):.2f} {Y(50):.2f}V{Y(110):.2f}"/>'
    if detailed:
        o+=f'<path data-part="inner" fill="none" stroke="{ink}" stroke-width="{3.2*k:.2f}" d="M{X(25):.2f} {Y(104):.2f}V{Y(52):.2f}A{25*k:.2f} {25*k:.2f} 0 0 1 {X(75):.2f} {Y(52):.2f}V{Y(104):.2f}"/>'
        o+=f'<path data-part="spark" fill="{gold}" d="{spark(X(50),Y(60),14*k)}"/>'
        for i,(w,t) in enumerate([(26,86),(38,94),(50,102)]):
            o+=f'<path data-part="step" fill="{gold}" d="M{X(50-w/2+2):.2f} {Y(t):.2f}H{X(50+w/2-2):.2f}L{X(50+w/2):.2f} {Y(t+6):.2f}H{X(50-w/2):.2f}Z"/>'
    else:
        o+=f'<path data-part="spark" fill="{gold}" d="{spark(X(50),Y(66),17*k)}"/>'
    return o
def svgdoc(body,w,h,pad=24):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {w+2*pad:.1f} {h+2*pad:.1f}">{body}</svg>'
def save(name,body,w,h,pad=24):
    open(OUT+name+'.svg','w').write(svgdoc(body,w,h,pad))
    open(OUT+name+'-dark.svg','w').write(svgdoc(body.replace(INK,'#F3ECDD').replace(GOLD,'#E2C27F'),w,h,pad))

# ---- textes ----
def stacked(symbol_fn, name, sym_h, gap=26):
    d1,w1=text('Montserrat',600,'LE CERCLE',64,0.06); d2,w2=text('Montserrat',600,'IA BUSINESS',21,0.42)
    W=max(w1,w2,sym_h); c1=capH('Montserrat',600,64); c2=capH('Montserrat',600,21)
    sym=symbol_fn((W-sym_h)/2,0,sym_h)
    y1=sym_h+gap+c1; y2=y1+16+c2
    body=f'<g data-part="symbol">{sym}</g><g data-part="word">{tpath(d1,(W-w1)/2,y1,INK)}</g><g data-part="tag">{tpath(d2,(W-w2)/2,y2,GOLD)}</g>'
    save(name,body,W,y2)
def horizontal(symbol_fn, name, sym_h, gap=30):
    d1,w1=text('Jost',600,'LE CERCLE',66,0.02); d2,w2=text('Jost',300,'IA BUSINESS',30,0.2)
    c1=capH('Jost',600,66); c2=capH('Jost',300,30)
    block=c1+18+c2; top=(sym_h-block)/2; x0=sym_h*(sym_w_ratio.get(name,1))+gap
    sym=symbol_fn(0,0,sym_h)
    y1=top+c1; y2=y1+18+c2
    body=f'<g data-part="symbol">{sym}</g><g data-part="word">{tpath(d1,x0,y1,INK)}</g><g data-part="tag">{tpath(d2,x0,y2,INK)}</g>'
    save(name,body,x0+max(w1,w2),sym_h)
sym_w_ratio={'seuil-geometrique':100/110,'seuil-geometrique-petit':100/110}

stacked(lambda x,y,s: ruche(x,y,s), 'ruche-grotesque', 150)
horizontal(lambda x,y,s: ruche(x,y,s), 'ruche-geometrique', 140)
stacked(lambda x,y,s: seuil(x+ (s-s*100/110)/2,y,s,True), 'seuil-grotesque', 170)
stacked(lambda x,y,s: seuil(x+ (s-s*100/110)/2,y,s,False), 'seuil-grotesque-petit', 120)
horizontal(lambda x,y,s: seuil(x,y,s,True), 'seuil-geometrique', 150)
horizontal(lambda x,y,s: seuil(x,y,s,False), 'seuil-geometrique-petit', 150)

def sous_arche(name, variant):
    d1,w1=text('PlayfairDisplay',500,'LE CERCLE',72,0.02); d2,w2=text('Montserrat',500,'IA BUSINESS',19,0.55)
    c1=capH('PlayfairDisplay',500,72); c2=capH('Montserrat',500,19)
    W=w1+120; R=W/2; RY=R*0.58; cx=W/2
    spring=RY+30   # hauteur où l'arche rejoint les jambages
    y1=spring+30+c1; y2=y1+24+c2; base=y2+34
    body=''
    if variant=='marches':
        for off,sw in ((0,2.2),(9,1.2)):
            r=R-off; ry=RY-off; body+=f'<path data-part="arch" fill="none" stroke="{INK}" stroke-width="{sw}" d="M{cx-r:.2f} {base:.2f}V{spring:.2f}A{r:.2f} {ry:.2f} 0 0 1 {cx+r:.2f} {spring:.2f}V{base:.2f}"/>'
        for i,w in enumerate([w2*0.42,w2*0.62,w2*0.82]):
            yy=y2+18+i*8; body+=f'<path data-part="step" stroke="{GOLD}" stroke-width="2.2" d="M{cx-w/2:.2f} {yy:.2f}H{cx+w/2:.2f}"/>'
        base2=base
    else:
        colw=14; capw=26; ch=base-spring
        for sx in (cx-R, cx+R):
            body+=f'<g data-part="column"><rect fill="{INK}" x="{sx-colw/2:.2f}" y="{spring+12:.2f}" width="{colw}" height="{ch-24:.2f}"/><rect fill="{INK}" x="{sx-capw/2:.2f}" y="{spring:.2f}" width="{capw}" height="6"/><rect fill="{INK}" x="{sx-capw/2+3:.2f}" y="{spring+7:.2f}" width="{capw-6}" height="3"/><rect fill="{INK}" x="{sx-capw/2:.2f}" y="{base-8:.2f}" width="{capw}" height="8"/><rect fill="{INK}" x="{sx-capw/2+3:.2f}" y="{base-13:.2f}" width="{capw-6}" height="3"/></g>'
        body+=f'<path data-part="arch" fill="none" stroke="{INK}" stroke-width="2.6" d="M{cx-R:.2f} {spring:.2f}A{R:.2f} {RY:.2f} 0 0 1 {cx+R:.2f} {spring:.2f}"/>'
        body+=f'<path data-part="step" stroke="{GOLD}" stroke-width="3" d="M{cx-R-30:.2f} {base+3:.2f}H{cx+R+30:.2f}"/>'
    # clé de voûte : on dégage l'arche autour de l'étincelle
    body+=f'<circle cx="{cx}" cy="{spring-RY:.2f}" r="20" fill="#F7F3EC" data-part="mask"/><path data-part="spark" fill="{GOLD}" d="{spark(cx,spring-RY,17)}"/>'
    body+=f'<g data-part="word">{tpath(d1,cx-w1/2,y1,INK)}</g><g data-part="tag">{tpath(d2,cx-w2/2,y2,INK)}</g>'
    top=spring-RY-20
    open(OUT+name+'.svg','w').write(svgdoc(body,W,base+10,24).replace('viewBox="-24 -24',f'viewBox="{-60 if variant!="marches" else -24} {top-24:.1f}').replace(f'{W+48:.1f} {base+10+48:.1f}',f'{W+(120 if variant!="marches" else 48):.1f} {base+10-top+48:.1f}'))
    open(OUT+name+'-dark.svg','w').write(open(OUT+name+'.svg').read().replace(INK,'#F3ECDD').replace(GOLD,'#E2C27F').replace('#F7F3EC','#141C2C'))
sous_arche('sous-arche-marches','marches')
sous_arche('sous-arche-colonnes','colonnes')
print('ok')
