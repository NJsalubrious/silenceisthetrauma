/* SITT memory world · scene renderer.
 * Draws one memory: any number of layers (background, mid, top and any extra elements), each with
 * its own depth map, the way depth-map-test does. The layer shader is depth-map-test's
 * (assets/layered-world/lab-world.js) with two additions: each layer can be moved, sized and faded,
 * and a camera can rest at different stops inside the picture. The final pass is depth-map-test's
 * cut between scenes plus Walk Left's finish: motion blur and trail from movement, warmth or
 * coolness, vignette and grain. Every value comes from the memory's own memory.json.
 */
(() => {
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const ease=n=>n*n*(3-2*n);
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
 // depth-map-test's layer shader; added: xform (move and size the layer) and alpha (fade it)
 const layerFragment=`precision mediump float;
 varying vec2 uv;uniform sampler2D colorMap,depthMap,foregroundMask;
 uniform vec4 crop,feather,trim;uniform vec2 pointer,lsize;uniform vec3 xform;uniform float plane,hasDepth,rigid,passage,light,depthPass,alpha,edgeM;
 uniform float enhanced,depthTravel,layerParallax,backgroundFallback,seamLock,perspX,plim,edges;
 uniform float early;   // ERA: 1 for a memory of the earlier story (memory.json "era":"earlier"): its own pointer, search jitter and margin
 uniform float blurR,focusD;uniform vec4 haze;uniform vec2 focusAt;uniform sampler2D marksMap;uniform float marksOn;   // STORYTELLING multiplane: out-of-focus radius for this layer, and the haze between the planes (rgb, amount)
 // edges: the WORKING VERSION (the default). The storytelling engine's finer depth search, so the edges of Mid and Top layers don't smear.
 // The old search stays beside it on purpose, to compare (studio "Edges of cut-outs", the E key, or ?edges=old). Later this is stripped down to optimised basics; the author decides then.
 #ifdef GL_FRAGMENT_PRECISION_HIGH
 #define HP highp
 #else
 #define HP mediump
 #endif
 // perspX: a camera in the room (memory.json "perspective"): the depth maps spread from the middle of the view, the near more than the far, so a pan crosses the room in 3D; plim: the tilt's own reach
 // seamLock: near a strip tile's left and right edges the depth eases to one shared value, so neighbouring pictures move together where they meet and never pull apart
 float mappedDepth(vec2 q){float d=texture2D(depthMap,q).r;if(backgroundFallback>.5)d=mix(d,plane,smoothstep(.05,.85,texture2D(foregroundMask,q).a));if(seamLock>0.)d=mix(.3,d,smoothstep(0.,seamLock,min(q.x,1.-q.x)));return d;}
 float depthAt(vec2 q){vec2 d=vec2(.0015);return (mappedDepth(q)*4.+mappedDepth(q+d)+mappedDepth(q-d))/6.;}
 // trim: the part of the picture that holds anything (the empty margin is not kept in memory)
 vec4 col(vec2 q){vec2 t=(q-trim.xy)/trim.zw;if(t.x<0.||t.x>1.||t.y<0.||t.y>1.)return vec4(0.);return texture2D(colorMap,t);}
 bool occupied(vec2 q){return q.x>=0.&&q.x<=1.&&q.y>=0.&&q.y<=1.&&col(q).a>.01;}
 bool inside(vec2 q){return q.x>=0.&&q.x<=1.&&q.y>=0.&&q.y<=1.;}
 // edges: a cut-out's soft (faded) edge pixel takes the depth of the solid part beside it, so the edge moves with its object and never peels off
 float cutDepth(vec2 q,float a){float d=mappedDepth(q);if(rigid>.5&&a<.98){float m=-1.;for(int k=0;k<16;k++){float an=float(k)*.785398;vec2 o=vec2(cos(an),sin(an))*(k<8?.0012:.0026);if(col(q+o).a>.5)m=max(m,mappedDepth(q+o));}if(m>=0.)d=max(d,m);}return d;}
 // edges: each spot of the picture starts its search at a slightly different step, so no bands line up; tied to the picture (not the screen), so it slides with it
 float jitAt(vec2 q){HP vec2 p=floor(q*2048.);return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){
  vec2 P=early>.5?pointer:vec2(clamp(pointer.x-perspX*(uv.x*2.-1.),-plim,plim),pointer.y);   // the hand's tilt and the camera's perspective add up, never past the tilt's reach (ERA: earlier: the hand's tilt alone)
  vec2 q=(uv-.5)*crop.xy+.5+crop.zw;
  q=(q-vec2(.5+xform.x,.5-xform.y))/(xform.z*lsize)+.5;   // lsize: this picture's size against the background's
  if(edgeM<=0.){vec2 o=P*(.002+layerParallax),tr=P*depthTravel;
   if(edges>.5){bool seen=col(q).a>=.004;for(int k=0;k<12;k++){if(col(q+o+tr*(float(k)/11.)).a>=.004)seen=true;}if(!seen){gl_FragColor=vec4(0.);return;}}   // edges: 12 looks along the whole shift, so a thin shape (a finger, a key) can't fall between them
   else if(col(q+o).a<.004&&col(q+o+tr).a<.004&&col(q+o+tr*.5).a<.004&&col(q).a<.004){gl_FragColor=vec4(0.);return;}}
  float d=mix(plane,depthAt(q),hasDepth);
  float legacy=mix(.004+d*.013,.003+plane*.012,rigid);
  bool hit=true;
  if(enhanced<.5){q+=P*legacy;}
  else if(hasDepth<.5){q+=P*(.002+(plane*depthTravel+layerParallax));}
  else if(length(P*depthTravel)<.000001){q+=P*(.002+layerParallax);}
  else {
   vec2 origin=q+P*(.002+layerParallax),travel=P*depthTravel;
   float lower=0.,upper=1.;hit=false;
   if(edges>.5){float jit=early>.5?fract(sin(dot(uv,vec2(12.9898,78.233)))*43758.5453):jitAt(q);   // ERA: earlier: the jitter is tied to the screen. edges:32 steps (not 16), each spot offset, then 6 halvings (not 4); a faded pixel counts, with its object's depth
    for(int i=0;i<33;i++){
     float z=max(0.,1.-(float(i)+jit)/32.);vec2 sampleUV=origin+travel*z;float a=inside(sampleUV)?col(sampleUV).a:0.;
     if(a>.01&&cutDepth(sampleUV,a)>=z){lower=z;upper=min(1.,z+1./32.);hit=true;break;}
    }
    if(hit){
     for(int i=0;i<6;i++){
      float z=(lower+upper)*.5;vec2 sampleUV=origin+travel*z;float a=inside(sampleUV)?col(sampleUV).a:0.;
      if(a>.01&&cutDepth(sampleUV,a)>=z)lower=z;else upper=z;
     }
     q=origin+travel*lower;
    }
   }
   else{
   for(int i=0;i<17;i++){
    float z=1.-float(i)/16.;vec2 sampleUV=origin+travel*z;
    if(occupied(sampleUV)&&mappedDepth(sampleUV)>=z){lower=z;upper=min(1.,z+1./16.);hit=true;break;}
   }
   if(hit){
    for(int i=0;i<4;i++){
     float z=(lower+upper)*.5;vec2 sampleUV=origin+travel*z;
     if(occupied(sampleUV)&&mappedDepth(sampleUV)>=z)lower=z;else upper=z;
    }
    q=origin+travel*lower;
   }}
  }
  q.x+=passage*plane*.12;
  // the seam pass of a strip: stretch this tile's edge a little way out, under its neighbour
  bool inMargin=edgeM>0.&&q.x>-edgeM&&q.x<1.+edgeM;
  vec4 color;
  if(early<.5&&inMargin&&(q.x<0.||q.x>1.)){   // ERA: earlier: clamped at the edge (below). Past the edge: the picture mirrored back on itself and softened the further out it reaches, not its last column smeared into streaks
   float o=q.x<0.?-q.x:q.x-1.,r=o*.5;q.x=q.x<0.?o:1.-o;vec2 m=vec2(q.x,clamp(q.y,.002,.998)),ry=vec2(0.,r*1.5);
   color=(col(m)*2.+col(m+vec2(r,0.))+col(m-vec2(r,0.))+col(clamp(m+ry,0.,1.))+col(clamp(m-ry,0.,1.))+col(clamp(m+vec2(r,0.)*.7+ry*.7,0.,1.))+col(clamp(m-vec2(r,0.)*.7-ry*.7,0.,1.))+col(clamp(m+vec2(r,0.)*.7-ry*.7,0.,1.))+col(clamp(m-vec2(r,0.)*.7+ry*.7,0.,1.)))/10.;
  }else{if(inMargin)q.x=clamp(q.x,.0005,.9995);color=col(q);}
  float fd=focusD;if(focusAt.x>-.5){vec2 qc=(focusAt-.5)*crop.xy+.5+crop.zw;qc=(qc-vec2(.5+xform.x,.5-xform.y))/(xform.z*lsize)+.5;fd=mix(plane,(depthAt(qc)+depthAt(qc+vec2(.02,0.))+depthAt(qc-vec2(.02,0.))+depthAt(qc+vec2(0.,.02)))/4.,hasDepth);}   // EXPLORE: the lens focuses on what is under the viewer's hand
  float rr=blurR*smoothstep(.06,.4,abs(mix(plane,depthAt(q),hasDepth)-fd));   // how far this point is from where the lens is focused, by the depth map
  if(rr>.0002){vec4 acc=color;float n=1.;for(int i=0;i<12;i++){float a=float(i)*2.39996,r=rr*sqrt((float(i)+.5)/12.);acc+=col(q+vec2(cos(a),sin(a))*r*vec2(1.,lsize.x/lsize.y));n+=1.;}color=acc/n;}   // STORYTELLING: the lens is focused on another plane (off: blurR 0)
  if(!hit||q.x<0.||q.x>1.||q.y<0.||q.y>1.)color.a=0.;
  vec2 grad=vec2(depthAt(q+vec2(.002,0.))-depthAt(q-vec2(.002,0.)),depthAt(q+vec2(0.,.002))-depthAt(q-vec2(0.,.002)));
  float relief=clamp(dot(grad,P)*light,-.025,.025)*(1.-rigid)*hasDepth;
  color.rgb*=1.+relief;color.rgb*=vec3(.98,1.,.99);if(haze.a>0.)color.rgb=mix(color.rgb,haze.rgb,haze.a*clamp(1.-mix(plane,d,hasDepth),0.,1.));color.a*=alpha;
  if(marksOn>0.&&depthPass<.5){vec4 mk=texture2D(marksMap,q);color.rgb+=(1.-color.rgb)*mk.r*marksOn;color.rgb*=1.-mk.g*marksOn*vec3(.84,.87,.91);color.rgb*=1.-mk.b*marksOn*vec3(.41,.59,.76);}   // STORYTELLING aged print: this picture's own scratches and specks, at their place in the picture, so they move with what they are on (off unless the aged test sets them)
  if(feather.x>0.)color.a*=smoothstep(0.,feather.x,q.x);if(feather.y>0.)color.a*=smoothstep(1.,1.-feather.y,q.x);if(feather.z>0.)color.a*=smoothstep(1.,1.-feather.z,q.y);if(feather.w>0.)color.a*=smoothstep(0.,feather.w,q.y);   // soft sides, so pictures melt into each other
  gl_FragColor=depthPass>.5?vec4(vec3(mix(plane,depthAt(q),hasDepth)),color.a):color;
 }`;
 // depth-map-test's cut and finish, plus Walk Left's motion blur, trail, warmth, deep vignette and grain
 const finishFragment=`precision mediump float;
 varying vec2 uv;uniform sampler2D fromMap,toMap,depthMap,sceneDepth,prevMap;
 uniform float edgeBlur,radialBlur;uniform vec2 dragFocus,dragVelocity;uniform vec2 filmCamera,filmAnchor;
 uniform float progress,kind,clock,streak,ghost,warm,cold,vignette,deepVignette,grain,cutting,seed,settle;uniform vec2 streakDir,focal;uniform vec4 drift;uniform vec4 light;uniform float aspect;uniform vec4 air;uniform vec3 airColor;uniform vec2 hand;   // STORYTELLING: light moving over the picture's own depth (x, y, strength, softness)
 uniform float fromEarly,toEarly;   // ERA: 1 where the memory going (from) or arriving (to) is of the earlier story
 float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 float mask;
 // ERA: the earlier film camera always reframes (and keeps off the very edge); a later memory is read as it is unless the film camera moves
 vec2 filmUV(vec2 p,float e){if(e<.5&&filmCamera.x==0.&&filmCamera.y==0.)return p;return clamp((p-filmAnchor)*exp(-filmCamera.y)+filmAnchor+vec2(filmCamera.x,0.),vec2(.001),vec2(.999));}
 vec3 pick(vec2 p){return mix(texture2D(fromMap,filmUV(p,fromEarly)).rgb,texture2D(toMap,filmUV(p,toEarly)).rgb,mask);}
 // ---- the dream cuts: a memory does not swipe, it slips, burns, fractures or floods into the next ----
 float h1(float n){return fract(sin(n*127.1+seed*311.7)*43758.5453);}
 float vnoise(vec2 p){p+=seed*17.;vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(noise(i),noise(i+vec2(1.,0.)),f.x),mix(noise(i+vec2(0.,1.)),noise(i+vec2(1.,1.)),f.x),f.y);}
 float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vnoise(p);p=p*2.03+1.7;a*=.5;}return v;}
 float lum(vec3 c){return dot(c,vec3(.299,.587,.114));}
 vec3 F(vec2 p){return texture2D(fromMap,filmUV(p,fromEarly)).rgb;}
 vec3 T(vec2 p){p=(p-.5)/(1.+settle*(1.-progress))+.5;return texture2D(toMap,filmUV(p,toEarly)).rgb;}   // the new memory arrives a little large and settles
 float jit;   // a tiny random offset per pixel, so blurs made of a few copies melt into a smooth smear instead of stepping
 float dsoft(vec2 p){float a=texture2D(depthMap,p).r*.2;for(int i=0;i<8;i++){float t=float(i)*.785+jit*.6;a+=texture2D(depthMap,p+vec2(cos(t),sin(t)*1.6)*.022).r*.1;}return a;}   // depth, softened: the cut follows the picture's depth without the hard edges of cut-out layers
 vec3 dream(float k,vec2 uv){
  float p=progress,s=sin(3.14159*p),d=dsoft(uv);
  if(k>11.5){mask=p;return mix(F(uv),T(uv),p);}   // blend (kind 12, the earlier story's "blend" cut): a plain crossfade; the later story never asks for it
  if(k>10.5){  // drift: the view keeps travelling like a sequence; the next memory comes through the motion as a double exposure
   vec2 dir=normalize(drift.xy);float a=dot(uv-.5,dir)+.5,n=fbm(uv*vec2(2.6,2.)+dir*p*.6);
   float th=mix(a,n*.95,drift.z)*.8+(1.-d)*.2;mask=smoothstep(th-.24,th+.24,p*1.55-.28);
   vec3 fa=vec3(0.),tb=vec3(0.);for(int i=0;i<6;i++){float f=(float(i)+jit)/6.;vec2 o=dir*f*.04*s;fa+=F(uv+o);tb+=T(uv-o*.6);}fa/=6.;tb/=6.;
   vec3 c=mix(fa,tb,mask);float mid=4.*mask*(1.-mask);c=mix(c,1.-(1.-fa)*(1.-tb),.55*mid);
   c=mix(c,vec3(lum(c)),.22*s);return c+vec3(.055,.048,.04)*s*drift.w;}
  if(k<4.5){   // ink in water: the new memory blooms through in blots, nearest things first
   float n=fbm(uv*vec2(3.2,2.4)*(.8+h1(1.)*.6)+p*.35);vec2 w=(vec2(fbm(uv*4.+7.),fbm(uv*4.+3.))-.5)*.04*s;
   float th=n*.62+(1.-d)*.38;mask=smoothstep(th-.07,th+.07,p*1.25-.12);
   float edge=4.*mask*(1.-mask);return mix(F(uv+w),T(uv-w*.6),mask)*(1.+edge*.3)+vec3(.06,.035,.01)*edge;}
  if(k<5.5){   // flare: the memory overexposes, bleaches, and the next one burns up out of the white
   mask=smoothstep(.36,.64,p);vec3 c=mix(F(uv),T(uv),mask);float e=s*s;c=mix(c,vec3(lum(c)),e*.65);return 1.-exp(-c*(1.+e*3.4));}
  if(k<6.5){   // double exposure: the new memory's light comes first, its shadows last
   vec3 a=F(uv),b=T(uv);float th=1.-lum(b);mask=smoothstep(th-.2,th+.2,p*1.4-.2);
   return mix(mix(a,1.-(1.-a)*(1.-b),smoothstep(0.,.35,p)*(1.-mask)),b,mask);}
  if(k<7.5){   // fracture: bands of the picture slip out of time, each on its own beat
   float rows=10.+floor(h1(3.)*16.),band=floor(uv.y*rows),t0=h1(band)*.62,l=clamp((p-t0)/.3,0.,1.),sl=sin(3.14159*l);
   vec2 q=uv+vec2((h1(band+40.)-.5)*.14*sl,0.);float ca=.008*sl;
   vec3 a=vec3(F(q+vec2(ca,0.)).r,F(q).g,F(q-vec2(ca,0.)).b),b=vec3(T(q+vec2(ca,0.)).r,T(q).g,T(q-vec2(ca,0.)).b);
   mask=step(.5,l);return mix(a,b,mask)*(1.-.3*sl);}
  if(k<8.5){   // pulled in: the old memory smears toward a face, the new one opens out from it
   vec2 dir=uv-focal;float r=length(dir*vec2(1.,.8));vec3 acc=vec3(0.);
   for(int i=0;i<8;i++){float f=(float(i)+jit)/8.;acc+=F(uv-dir*f*.24*s);}
   float th=r*1.5+(1.-d)*.25;mask=smoothstep(th-.12,th+.12,p*2.-.25);return mix(acc/8.,T(uv+dir*.05*(1.-p)),mask);}
  if(k<9.5){   // flicker: it keeps slipping back to where it was, dark between
   float st=floor(p*11.),back=step(h1(st+9.),.42)*step(p,.82)*step(.12,p);mask=smoothstep(.15,.85,p)*(1.-back);
   return mix(F(uv),T(uv),mask)*(1.-.6*s*(.45+.55*h1(st)));}
  // under water: everything swims, cools, and settles into the new memory
  vec2 w=vec2(sin(uv.y*18.+p*9.+seed*6.),cos(uv.x*14.-p*7.))*.013*s;mask=smoothstep(d*.4+.22,d*.4+.46,p);
  vec3 c=mix(F(uv+w),T(uv-w),mask);return mix(c,c*vec3(.84,.95,1.05),s*.6);}
 void main(){
  jit=noise(gl_FragCoord.xy+fract(clock*7.)*61.);
  float depth=dsoft(uv);
  float threshold;
  if(kind<.5)threshold=depth*.6+uv.x*.32+uv.y*.08;
  else if(kind<1.5)threshold=uv.x*.82+depth*.18;
  else if(kind<2.5)threshold=uv.y*.7+depth*.3;
  else threshold=(1.-uv.x)*.82+depth*.18;
  mask=smoothstep(threshold-.045,threshold+.045,progress*1.12-.06);
  if(progress<.001)mask=0.;if(progress>.999)mask=1.;
  vec3 color=pick(uv);
  if(kind>3.5&&cutting>.5)color=dream(kind,uv);
  if(streak>0.){float d=texture2D(sceneDepth,filmUV(uv,fromEarly)).r;vec3 acc=color;for(int i=1;i<10;i++){float f=(float(i)-1.+jit)/9.;acc+=pick(uv+streakDir*streak*f*(.25+d*d*1.4));}color=acc/10.;}
  if(edgeBlur>0.){
   float edge=smoothstep(.18,.49,max(abs(uv.x-.5),abs(uv.y-.5)));
   vec3 acc=vec3(0.);float weight=0.;
   for(int i=-6;i<=6;i++){float f=float(i)/6.,w=exp(-f*f*2.);vec2 q=clamp(uv+vec2(f*edgeBlur*edge,0.),vec2(.001),vec2(.999));acc+=pick(q)*w;weight+=w;}
   color=mix(color,acc/weight,edge);
  }
  // Directional zoom streaks: clear around the subject, long exposure away from it.
  if(radialBlur>0.){
   vec2 ray=uv-dragFocus;
   float radius=length(ray*vec2(1.,.8));
   float spread=smoothstep(.055,.34,radius);
   float d=texture2D(sceneDepth,uv).r;
   // Screen-space velocity from the same dolly/truck that renders the layers.
   // Dolly is centred on the camera, while the clear region follows the subject.
   vec2 flow=((uv-filmAnchor)*dragVelocity.y+vec2(dragVelocity.x,0.))*(.9+.1*d);
   vec2 smear=flow*radialBlur;
   float extent=length(smear);if(extent>.085)smear*=.085/extent;
   vec3 acc=vec3(0.);float weight=0.;
   for(int i=0;i<24;i++){
    float f=(float(i)+jit)/24.,w=1.-.55*f;
    vec2 q=clamp(uv-smear*f,vec2(.001),vec2(.999));
    acc+=pick(q)*w;weight+=w;
   }
   color=mix(color,acc/weight,spread*.96);
  }
  float seam=4.*mask*(1.-mask)*sin(progress*3.14159);
  color*=1.-seam*.19*cutting*step(kind,3.5);
  color=mix(color,texture2D(prevMap,uv).rgb,ghost);
  if(light.z>0.){float e=.004,c0=texture2D(sceneDepth,uv).r,jr=texture2D(sceneDepth,uv+vec2(e,0.)).r,jl=texture2D(sceneDepth,uv-vec2(e,0.)).r,ju=texture2D(sceneDepth,uv+vec2(0.,e)).r,jd=texture2D(sceneDepth,uv-vec2(0.,e)).r;jr=abs(jr-c0)>.06?c0:jr;jl=abs(jl-c0)>.06?c0:jl;ju=abs(ju-c0)>.06?c0:ju;jd=abs(jd-c0)>.06?c0:jd;float dzx=jr-jl,dzy=ju-jd;   // STORYTELLING: a sample across a cut-out edge (a jump in depth) is ignored, so silhouettes are not lit as steep slopes (no halo)
   vec3 n=normalize(vec3(-dzx*9.,-dzy*9.,1.));vec2 lp=vec2(light.x,1.-light.y)-uv;lp.x*=aspect;vec3 ld=normalize(vec3(lp,.55));
   float lam=clamp(dot(n,ld),0.,1.),pool=exp(-dot(lp,lp)/(light.w*light.w));color*=mix(1.-light.z*.55,1.+light.z*.35,pool*(.55+.45*lam));}   // STORYTELLING: the light falls on the real surfaces
  if(air.x>0.){   // EXPLORE: motes of dust at three real depths; the picture's own depth hides them behind what is nearer
   float sd=texture2D(sceneDepth,uv).r;vec3 add=vec3(0.);
   for(int i=0;i<3;i++){float z=.3+float(i)*.27,cell=mix(.05,.022,z)*air.z;
    vec2 p=uv*vec2(aspect,1.)+hand*z*.035+vec2(sin(clock*.07+float(i))*.04,-clock*.006*(1.+z))*air.w;
    vec2 c=floor(p/cell),f=fract(p/cell);float h=fract(sin(dot(c+float(i)*17.,vec2(127.1,311.7)))*43758.5),h2=fract(h*91.7),h3=fract(h*13.3);
    if(h3<.32){vec2 o=vec2(h,h2)*.8+.1+vec2(sin(clock*.3+h*30.),cos(clock*.23+h2*30.))*.06;float r=mix(.035,.09,h2)*mix(.6,1.4,z);
     float m=smoothstep(r,0.,length(f-o))*smoothstep(sd-.03,sd+.08,z);   // a mote shows only where it is nearer than the surface behind it
     float pool=light.z>0.?exp(-dot((uv-vec2(light.x,1.-light.y))*vec2(aspect,1.),(uv-vec2(light.x,1.-light.y))*vec2(aspect,1.))/(light.w*light.w)):1.;
     add+=airColor*m*air.x*(.35+.65*h)*mix(.25,1.,pool)*(.55+.45*sin(clock*.5+h*40.));}}
   color+=add;}
  color*=mix(vec3(1.),vec3(1.08,.98,.86),warm);color*=mix(vec3(1.),vec3(.84,.95,1.08),cold);
  color*=1.-vignette*smoothstep(.22,.84,length((uv-.5)*vec2(1.,.82)));
  color*=1.-deepVignette*smoothstep(.3,1.,length((uv-.5)*vec2(1.,.8)));
  color+=(noise(gl_FragCoord.xy+floor(clock*12.))-.5)*grain;
  gl_FragColor=vec4(color,1.);
 }`;
 const blitFragment=`precision mediump float;varying vec2 uv;uniform sampler2D map;void main(){gl_FragColor=vec4(texture2D(map,uv).rgb,1.);}`;
 // the house look (Walk Left's motion, depth-map-test's finish); a memory's own "look" overrides these
 const LOOK={blur:1,trail:1,warm:0,cold:0,vignette:.13,deepVignette:0,grain:.011,glide:260,landWait:480,landEase:650};
 function create(canvas){
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});
  if(!gl)throw Error('WebGL unavailable');
  const DS=window.SITT_DEPTH_SETTINGS;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const S={pan:0,cam:{x:0,y:0,zoom:1},motion:{amt:0,dir:1},look:{...LOOK},
   profile:DS.defaultProfile,strength:1,opening:1,vertical:DS.presets[DS.defaultProfile].verticalScale,framing:'cover',view:'scene',light:2,response:null,overscan:null,
   edges:(()=>{const q=new URLSearchParams(location.search).get('edges');if(q)return q;try{return localStorage.getItem('sitt-edges')||'new';}catch{return 'new';}})(),   // 'new' (the working version) or 'old' (to compare); this browser remembers the choice, it is not saved into any memory (ERA: an earlier memory always draws its own search)
   maxSide:null};   // phones: a picture whose longest side is over this many pixels is decoded smaller (null: every picture at its own size)
  const early=d=>d?.scene?.era==='earlier';   // ERA: a memory of the earlier story (memory.json "era":"earlier") is drawn by the earlier engine's rules; any other by the later's
  let width=1,height=1,targets=[],current=null,transition=null,dirty=true,last=0,px=0,py=0,tx=0,ty=0,revision=0,frames=0,pp=0,ghostLeft=0;
  const U=new Map();let pid=0;const uniform=(p,n)=>{const k=p.__id+n;if(!U.has(k))U.set(k,gl.getUniformLocation(p,n));return U.get(k);};
  function program(fragment){
   const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
   const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vertex));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p);
   if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));p.__id=(pid++)+':';return p;}
  const layerProgram=program(layerFragment),finishProgram=program(finishFragment),blitProgram=program(blitFragment);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  function use(p){gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const a=gl.getAttribLocation(p,'position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);}
  function bind(p,name,t,unit){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);gl.uniform1i(uniform(p,name),unit);}
  function params(){for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);}
  // grey: a depth map, kept as one grey channel (a quarter of the memory of a colour picture)
  function texture(image,grey=false){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);params();
   for(let i=0;i<8&&gl.getError();i++);   // FLOW: clear old errors, then check this upload took
   const f=grey?gl.LUMINANCE:gl.RGBA;gl.texImage2D(gl.TEXTURE_2D,0,f,f,gl.UNSIGNED_BYTE,image);
   const err=gl.getError();if(err&&err!==gl.CONTEXT_LOST_WEBGL){gl.deleteTexture(t);throw Error('the graphics card refused the picture (error '+err+')');}   // a texture that failed draws as a black box
   return t;}
  // pictures reach the graphics card a few at a time (a frame's worth each), so moving never stutters while they arrive
  const uploads=[];
  const upload=(image,grey)=>new Promise((res,rej)=>uploads.push(()=>{try{res(texture(image,grey));}catch(e){rej(e);}}));
  function pump(){const t0=performance.now();while(uploads.length){uploads.shift()();if(performance.now()-t0>6)break;}}
  const wc=document.createElement('canvas');wc.width=wc.height=1;const c2=wc.getContext('2d');c2.fillStyle='white';c2.fillRect(0,0,1,1);const white=texture(wc);
  // STORYTELLING aged print: each picture's marks (red = pale specks and scratches, green = dark dust, blue = foxing), set by the aged test only
  const marksTex=new Map();function setMarks(id,image){const o=marksTex.get(id);if(o){gl.deleteTexture(o);marksTex.delete(id);}if(image){marksTex.set(id,texture(image));while(marksTex.size>3){const [k,t]=marksTex.entries().next().value;gl.deleteTexture(t);marksTex.delete(k);}}dirty=true;}
  /* ---- where pictures come from ----
     Each picture folder (desktop, mobile) can carry a files.json: every picture's size, a fingerprint
     (the version, so a browser never shows an old copy), the box that holds anything, and a small
     preview. publish writes it; the story's own preview server makes it live from the folder. A name in
     memory.json can say .png while the file is .webp (or the other way): the file that exists is used. */
  const manifests=new Map();
  const manifest=dir=>{if(!manifests.has(dir))manifests.set(dir,fetch(dir+'files.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>j?.files||null).catch(()=>null));return manifests.get(dir);};
  const stem=n=>n.replace(/\.(png|webp|jpe?g)$/i,'');
  const setDir=(memory,folder,set)=>(window.SITT_MEMDIR?window.SITT_MEMDIR(folder):'memories/'+folder)+'/'+(set==='mobile'?(memory.mobileFolder||'mobile'):(memory.desktopFolder||'desktop'))+'/';
  /* picture paths (the new site): a name with a "/" in it is the picture's path under story/pictures, e.g.
     "2_Later_Story/24_Delivery_To_Dominics_House/24_..._06_Background.webp", always the .webp. Its size and version come
     from pictures/index.json (fetched once; the version keeps a changed file from being served stale). No preview, no box. */
  let pindex=null;
  const pictureIndex=()=>pindex||(pindex=fetch('pictures/index.json'+(revision?'?r='+revision:''),{cache:revision?'no-store':'no-cache'}).then(r=>r.ok?r.json():null).then(j=>j?(j.files||j):null).catch(()=>{pindex=null;return null;}));   // a failed fetch is tried again next time
  async function resolve(memory,folder,name,set,source){
   if(typeof name==='string'&&name.includes('/')){const k=stem(name)+'.webp',f=(await pictureIndex())?.[k]||null;
    return {url:'pictures/'+k+(f?.v?'?v='+f.v:''),info:f,low:null};}   // not in the index (added since): the file itself, its size read from its header
   if(source==='originals'&&memory.source)return {url:memory.source+name,info:null};
   const order=set==='mobile'?['mobile','desktop']:['desktop'];
   for(const k of order){const dir=setDir(memory,folder,k),files=await manifest(dir);
    if(!files){if(k==='desktop')return {url:dir+stem(name)+'.webp',alt:dir+name,info:null};continue;}
    for(const n of [name,stem(name)+'.webp',stem(name)+'.png',stem(name)+'.jpg',stem(name)+'.jpeg'])if(files[n]){const f=files[n];
     return {url:dir+(f.path||n)+(f.v?'?v='+f.v:''),info:f,low:f.low?dir+f.low+(f.v?'?v='+f.v:''):null};}}
   const dir=setDir(memory,folder,'desktop');return {url:dir+stem(name)+'.webp',alt:dir+name,info:null};}   // not listed (added since the last publish): try the file itself
  const tuning=/[?&]tune=(1|true)/.test(location.search)||/^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname);
  // a picture's file, fetched (so it can be stopped half way and its size checked) and decoded off the main thread
  async function decode(url,job,tries=3){const u=url+(revision?(url.includes('?')?'&':'?')+'mapRevision='+revision:'')+(tries<3?(url.includes('?')||revision?'&':'?')+'retry='+tries:'');
   const ac=window.AbortController?new AbortController():null;if(job)job.abort=()=>ac?.abort();
   try{const r=await fetch(u,{signal:ac?.signal,cache:revision?'no-store':'default'});if(!r.ok)throw Error(url.split('/').pop()+' '+r.status);const buf=await r.arrayBuffer(),blob=new Blob([buf],{type:r.headers.get('content-type')||''});
    if(S.maxSide>0){const sm=await shrink(blob,buf,S.maxSide);if(sm){sm.px=pixelBytes(buf);return sm;}}   // phones: a large picture decoded smaller (off unless settings.maxSide is set)
    const img=new Image();img.decoding='async';const ou=URL.createObjectURL(blob);img.src=ou;try{await img.decode();}finally{URL.revokeObjectURL(ou);}img.px=pixelBytes(buf);return img;}
   catch(e){if(job?.cancelled||/404/.test(e.message))throw e;if(tries>1){await new Promise(r=>setTimeout(r,400));return decode(url,job,tries-1);}throw e;}}   // a dropped download is tried again
  // how many bytes of a file make the picture itself (metadata left out): matched against files.json to know the file is the one publish measured
  function pixelBytes(buf){const b=new DataView(buf),A=new Set(['VP8X','VP8 ','VP8L','ALPH','ANIM','ANMF','IHDR','PLTE','tRNS','IDAT']);let n=0;const tag=p=>String.fromCharCode(b.getUint8(p),b.getUint8(p+1),b.getUint8(p+2),b.getUint8(p+3));
   try{if(tag(0)==='RIFF'&&tag(8)==='WEBP'){for(let p=12;p+8<=b.byteLength;){const L=b.getUint32(p+4,true);if(A.has(tag(p)))n+=L;p+=8+L+(L&1);}}
    else if(b.getUint32(0)===0x89504e47){for(let p=8;p+8<=b.byteLength;){const L=b.getUint32(p);if(A.has(tag(p+4)))n+=L;p+=12+L;}}else n=buf.byteLength;}catch{}return n;}
  // a picture's size from its file's first bytes (PNG or WebP), or null
  function headSize(b){if(b.getUint32(12)===0x49484452)return [b.getUint32(16),b.getUint32(20)];   // PNG
   if(b.getUint32(0)===0x52494646&&b.getUint32(8)===0x57454250){const t=String.fromCharCode(b.getUint8(12),b.getUint8(13),b.getUint8(14),b.getUint8(15));   // WebP
    if(t==='VP8X')return [1+(b.getUint8(24)|b.getUint8(25)<<8|b.getUint8(26)<<16),1+(b.getUint8(27)|b.getUint8(28)<<8|b.getUint8(29)<<16)];
    if(t==='VP8 ')return [b.getUint16(26,true)&0x3fff,b.getUint16(28,true)&0x3fff];
    if(t==='VP8L'){const v=b.getUint32(21,true);return [(v&0x3fff)+1,((v>>14)&0x3fff)+1];}}
   return null;}
  /* phones (settings.maxSide): a picture whose longest side is over the cap is decoded smaller, straight from the file
     (the full size never sits in memory when the header tells it). fullW/fullH keep the file's true size, so the layout,
     the framing and the depth map's pairing are measured exactly as at full size. Nothing returned: small enough, decode as usual. */
  async function shrink(blob,buf,max){let s=null;try{s=headSize(new DataView(buf));}catch{}
   const dec=async()=>{const im=new Image();im.decoding='async';const ou=URL.createObjectURL(blob);im.src=ou;try{await im.decode();}finally{URL.revokeObjectURL(ou);}return im;};
   let img=null;if(!s){img=await dec();s=[img.naturalWidth,img.naturalHeight];}   // a file whose header is not read here (JPEG): decoded first, then made smaller
   const [w,h]=s,k=max/Math.max(w,h);if(!(k<1))return img;
   const rw=Math.max(1,Math.round(w*k)),rh=Math.max(1,Math.round(h*k));let out=null;
   if(window.createImageBitmap){try{const b=await createImageBitmap(img||blob,{resizeWidth:rw,resizeHeight:rh,resizeQuality:'high'});if(b.width===rw&&b.height===rh)out=b;else b.close?.();}catch{}}
   if(!out){if(!img)img=await dec();const cv=document.createElement('canvas');cv.width=rw;cv.height=rh;const g=cv.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,0,0,rw,rh);out=cv;}   // a browser without the resize: drawn smaller
   out.fullW=w;out.fullH=h;return out;}
  // the box that holds anything (alpha above zero), found on a small copy and padded so nothing at the edge is lost (in the file's own pixels, also for a picture decoded smaller)
  function scanBox(img){const nw=img.fullW||img.naturalWidth,nh=img.fullH||img.naturalHeight,k=Math.min(1,1600/Math.max(nw,nh)),w=Math.max(1,Math.round(nw*k)),h=Math.max(1,Math.round(nh*k));
   const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,0,0,w,h);
   const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
   for(let y=0;y<h;y++){const r=y*w*4;for(let x=0;x<w;x++)if(d[r+x*4+3]){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}}
   if(x1<0)return [0,0,Math.min(nw,8),Math.min(nh,8)];
   const pad=3+Math.round(Math.max(w,h)*.01);x0=Math.max(0,x0-pad);y0=Math.max(0,y0-pad);x1=Math.min(w-1,x1+pad);y1=Math.min(h-1,y1+pad);
   const X0=Math.floor(x0/k),Y0=Math.floor(y0/k);return [X0,Y0,Math.min(nw,Math.ceil((x1+1)/k))-X0,Math.min(nh,Math.ceil((y1+1)/k))-Y0];}
  /* one picture, ready for the graphics card: trimmed to what it holds, no larger than this screen can show
     (opt.needH: the most pixels of height it will ever cover), and a depth map flattened to grey */
  async function picture(ref,{maxW=null,scale=1,grey=false,trim=false,needH=0,job=null}={}){
   let img;try{img=await decode(ref.url,job);}catch(e){if(ref.alt&&!job?.cancelled)img=await decode(ref.alt,job);else throw e;}
   const sm=!!img.fullW,nw=sm?img.fullW:img.naturalWidth,nh=sm?img.fullH:img.naturalHeight,sx=sm?img.width/nw:1,sy=sm?img.height/nh:1,cap=gl.getParameter(gl.MAX_TEXTURE_SIZE)||2000;   // sm: decoded smaller (settings.maxSide); nw, nh stay the file's own size
   // the box from files.json is used only while the file is the one it was measured on (same size, same picture bytes)
   let box=null;
   if(trim&&!grey){const f=ref.info;box=f?.box&&f.w===nw&&f.h===nh&&f.px===img.px?f.box:scanBox(img);if(box[2]*box[3]>nw*nh*.86)box=null;}
   const [bx,by,bw,bh]=box||[0,0,nw,nh];
   const limit=Math.min(maxW??(width<700?1400:2000),cap);
   let k=Math.min(1,scale,limit/bw,limit/bh);
   if(needH>0&&!tuning)k=Math.min(k,Math.max(.12,needH/nh));
   if(sm)k=Math.min(k,sx,sy);   // never more pixels than were decoded; and such a picture is always redrawn below (an ImageBitmap would go up unflipped)
   let out=img;
   if(box||grey||k<.999||sm){const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(bw*k));cv.height=Math.max(1,Math.round(bh*k));const g=cv.getContext('2d');
    if(grey){g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);}   // a depth map with a stray alpha channel: flattened onto black (far)
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(img,bx*sx,by*sy,bw*sx,bh*sy,0,0,cv.width,cv.height);if(g.isContextLost?.())throw Error('the browser dropped a drawing surface');out=cv;if(sm)img.close?.();}
   out.nw=nw;out.nh=nh;out.trim=box?[bx/nw,1-(by+bh)/nh,bw/nw,bh/nh]:null;   // in texture space (the picture is flipped on upload: y runs up)
   return out;}
  // a tiny copy kept after the full picture is let go, so a fast pass through the story never shows black
  function lowCopy(src){const k=Math.min(1,320/Math.max(src.width,src.height)),cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(src.width*k));cv.height=Math.max(1,Math.round(src.height*k));
   const g=cv.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(src,0,0,cv.width,cv.height);return cv;}
  function makeTarget(w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);params();
   const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return {texture:t,framebuffer:f};}
  function resize(){dirty=true;const r=canvas.getBoundingClientRect();width=r.width||1;height=r.height||1;
   const ratio=Math.min(devicePixelRatio||1,width<700?1.5:1.25,2000/Math.max(width,height));
   canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));
   for(const t of targets){gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);}targets=Array.from({length:6},()=>makeTarget(canvas.width,canvas.height));}
  const profile=(st=S)=>DS.presets[st.profile]||DS.presets[DS.defaultProfile];
  // during a cut each memory keeps its own settings; otherwise the live (studio) settings apply
  const settingsFor0=data=>transition&&data?.scene?.depth?{...S,...data.scene.depth,view:S.view}:S;
  // a phone's tilt (settings.tiltGain): more depth, given as the depth's own strength, so the margins that keep edges and tile joins hidden (the guard, the reach) grow with it
  const settingsFor=data=>{const st=settingsFor0(data);return tilting&&S.tiltGain>0&&S.tiltGain!==1?{...st,strength:(st.strength??1)*S.tiltGain}:st;};
  // depth-map-test's movement: depth travel and whole-layer travel, scaled by "opening depth"
  function motion(scene,st=S){const p=profile(st),o=st.opening??1;
   return {enhanced:p.enhanced,travel:(p.depthTravel||0)*o,layer:Math.max(p.layerParallax||0,...(scene.layers||[]).map(l=>Math.abs(l.travel||0)))*o,o};}
  // depth-map-test's framing ("full" or "cover", the homepage framing), then the camera stop and the visitor's push
  function cover(scene,st=S,panOverride,camOverride){
   const aspect=width/height,sourceAspect=scene._shape||scene.aspect||4/3,zoom=Math.max(1,scene.zoom||1);   // the shape is read from the background picture itself
   const pan=panOverride??S.pan??0,cam=camOverride||S.cam;
   if(st.framing==='full'){const x=Math.max(1,aspect/sourceAspect)/zoom,y=Math.max(1,sourceAspect/aspect)/zoom;return [x,y,pan*x,0];}
   let x=aspect<sourceAspect?aspect/sourceAspect:1,y=aspect>sourceAspect?sourceAspect/aspect:1;
   const m=motion(scene,st),guard=profile(st).enhanced?1/Math.max(.75,1-2*(.002+m.travel+m.layer)*st.strength)+.005:1;
   const overscan=Math.max(st.overscan??profile(st).overscan,guard);x/=overscan*zoom*(cam.zoom||1);y/=overscan*zoom*(cam.zoom||1);
   const fx=(scene.focal||[.5,.5])[0]+(cam.x||0),fy=1-((scene.focal||[.5,.5])[1]+(cam.y||0));
   return [x,y,clamp(fx,x/2,1-x/2)-.5+pan*x,clamp(fy,y/2,1-y/2)-.5];}
  // soft sides: [across, down] or [left, right, top, bottom], as shares of the picture
  const fe=f=>!f?[0,0,0,0]:f.length===2?[f[0],f[0],f[1],f[1]]:[f[0]||0,f[1]||0,f[2]||0,f[3]||0];
  function renderScene(data,target,passage,depthPass=false){
   if(data.strip)return renderStrip(data,target,passage,depthPass);
   gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.025,.04,.043,1);gl.clear(gl.COLOR_BUFFER_BIT);
   use(layerProgram);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   const st=settingsFor(data),m=motion(data.scene,st),view=S.view,E=early(data);
   gl.uniform1f(uniform(layerProgram,'enhanced'),m.enhanced?1:0);gl.uniform1f(uniform(layerProgram,'depthTravel'),m.travel);gl.uniform1f(uniform(layerProgram,'edges'),E||S.edges==='new'?1:0);gl.uniform1f(uniform(layerProgram,'early'),E?1:0);   // ERA: an earlier memory always takes the fine search (it had no switch)
   if(!E)gl.uniform1f(uniform(layerProgram,'marksOn'),0);   // ERA: a later picture never carries aged marks (the earlier engine left them as the last strip set them)
   bind(layerProgram,'foregroundMask',data.layers.at(-1).colorTexture,2);
   const showDepth=depthPass||view.includes('depth');
   gl.uniform4fv(uniform(layerProgram,'crop'),cover(data.scene,st,data.pan,data.cam));
   gl.uniform2f(uniform(layerProgram,'pointer'),px*st.strength,py*st.strength*st.vertical);gl.uniform1f(uniform(layerProgram,'light'),st.light??2);gl.uniform1f(uniform(layerProgram,'depthPass'),showDepth?1:0);
   data.layers.forEach((l,i)=>{
    if(l.hidden)return;
    const travel=(Number.isFinite(l.travel)?l.travel:l.plane*(profile(st).layerParallax||0))*m.o;
    gl.uniform1f(uniform(layerProgram,'layerParallax'),travel);
    // "Image / map to inspect": the whole scene, the combined depth, or one layer's picture or map
    if(view!=='scene'&&view!=='depth'&&view!=='layer:'+i&&view!=='layer-depth:'+i)return;
    const fallback=!l.depthTexture&&!l.rigid&&!!data.fullDepth;
    bind(layerProgram,'colorMap',l.colorTexture,0);bind(layerProgram,'depthMap',l.depthTexture||(fallback?data.fullDepth:white),1);gl.uniform4f(uniform(layerProgram,'trim'),0,0,1,1);
    gl.uniform1f(uniform(layerProgram,'backgroundFallback'),m.enhanced&&fallback?1:0);
    gl.uniform3f(uniform(layerProgram,'xform'),l.x||0,l.y||0,l.scale||1);gl.uniform2f(uniform(layerProgram,'lsize'),l.size?.[0]||1,l.size?.[1]||1);gl.uniform1f(uniform(layerProgram,'alpha'),l.opacity??1);
    gl.uniform1f(uniform(layerProgram,'blurR'),0);gl.uniform4f(uniform(layerProgram,'haze'),0,0,0,0);gl.uniform2f(uniform(layerProgram,'focusAt'),-1,-1);
    gl.uniform1f(uniform(layerProgram,'plane'),l.plane);gl.uniform1f(uniform(layerProgram,'hasDepth'),(l.depthTexture||fallback)?1:0);gl.uniform1f(uniform(layerProgram,'rigid'),l.rigid?1:0);
    gl.uniform1f(uniform(layerProgram,'passage'),l.rigid?passage:0);gl.uniform1f(uniform(layerProgram,'edgeM'),0);gl.uniform1f(uniform(layerProgram,'seamLock'),0);gl.uniform1f(uniform(layerProgram,'perspX'),0);gl.uniform1f(uniform(layerProgram,'plim'),99);gl.uniform4f(uniform(layerProgram,'feather'),...fe(l.layer.feather));gl.drawArrays(gl.TRIANGLE_STRIP,0,4);});
   gl.disable(gl.BLEND);}
  // ---- a strip: sections side by side in one world, like Walk Left (world units: pixels at the strip's height) ----
  /* a strip's camera is a frame (a rectangle of the strip), shown the way depth-map-test's homepage framing shows
     a picture: it fills the screen, with the same overscan margin so the depth never shows an edge */
  function stripView(data,cam){const H=data.H,sa=width/height,st=settingsFor(data),m=motion(data.scene,st);
   const f=cam.frame||[(cam.x??H)-H*.7,0,H*1.4,H];
   const guard=profile(st).enhanced?1/Math.max(.75,1-2*(.002+m.travel+m.layer)*st.strength)+.005:1,ov=Math.max(st.overscan??profile(st).overscan,guard);
   let vw,vh;
   if(early(data)){   // ERA: earlier: the margin kept top and bottom only needs to be as big as the depth moves up and down (vertical is a fraction of the sideways movement)
    const guardY=profile(st).enhanced?1/Math.max(.75,1-2*(.002+m.travel+m.layer)*st.strength*(st.vertical??1))+.005:1,ovy=Math.min(ov,Math.max(1.015,guardY));
    if(sa>f[2]/f[3]){vw=f[2]/ov;vh=vw/sa;if(vh>f[3]/ovy){vh=f[3]/ovy;vw=vh*sa;}}else{vh=f[3]/ovy;vw=vh*sa;if(vw>f[2]/ov){vw=f[2]/ov;vh=vw/sa;}}}
   else if(sa>f[2]/f[3]){vw=f[2]/ov;vh=vw/sa;}else{vh=f[3]/ov;vw=vh*sa;}
   // "fit": 0 fills the screen (crops a picture narrower than the screen), 1 shows the whole picture with its sides in the dark
   const fit=Number.isFinite(cam.fit)?cam.fit:(data.scene.fit||0);
   if(fit>0&&sa>f[2]/f[3]){const ch=f[3]/ov;vh=vh+(ch-vh)*fit;vw=vh*sa;}
   let cx=clamp(f[0]+f[2]/2,vw/2,Math.max(vw/2,data.total-vw/2));
   const K=cam.keep;if(K&&(K.a||K.b)){const kc=k=>k?(k[1]-k[0]<=vw?(k[0]+k[1])/2:clamp(cx,k[0]+vw/2,k[1]-vw/2)):cx;cx=kc(K.a)+(kc(K.b)-kc(K.a))*(K.t||0);}   // a stop's "keep": the view stays inside that picture
   cx+=(data.pan??S.pan??0)*vw;const cy=vh>=H?H/2:clamp(f[1]+f[3]/2,vh/2,H-vh/2);return {vw,vh,cx,cy,H};}
  const camOf=data=>data.cam||(data===current||!transition?S.cam:S.cam);
  function renderStrip(data,target,passage,depthPass){
   gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(.025,.04,.043,1);gl.clear(gl.COLOR_BUFFER_BIT);
   use(layerProgram);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
   const st=settingsFor(data),m=motion(data.scene,st),E=early(data);
   gl.uniform1f(uniform(layerProgram,'enhanced'),m.enhanced?1:0);gl.uniform1f(uniform(layerProgram,'depthTravel'),m.travel);gl.uniform1f(uniform(layerProgram,'edges'),E||S.edges==='new'?1:0);gl.uniform1f(uniform(layerProgram,'early'),E?1:0);   // ERA: as in renderScene
   gl.uniform1f(uniform(layerProgram,'light'),st.light??2);gl.uniform1f(uniform(layerProgram,'backgroundFallback'),0);
   const mo=data===current&&!transition?S.moment:null;
   if(mo){drawWorld(data,st,m,mo.a,1,passage,depthPass);drawWorld(data,st,m,mo.b,mo.t,passage,depthPass);}
   else drawWorld(data,st,m,data.cam||S.cam,1,passage,depthPass);
   gl.disable(gl.BLEND);}
  /* where a strip layer is right now, and how visible (Walk Left's choreography, from memory.json):
     "rect" [x,y,w,h] places it anywhere in the strip; "stops" [..] shows it only at those stops, crossfading
     between them ("fade" [a,b] narrows the crossfade); "follow" {from,to,k} lets it travel with the view
     between two stops (k .85: a touch slower than the room); "insert" {stop,...} is a different angle that
     fills the screen as the view passes that stop, then dissolves away again. */
  const stopX=(data,k)=>{const p=(data.scene.stops||[])[k];if(!p)return NaN;return stripView(data,{frame:showMore(p.frame||[(p.x??data.H)-data.H*.7,0,data.H*1.4,data.H],p.show),keep:p.keep?{a:p.keep,b:p.keep,t:0}:null}).cx;};
  const showMore=(f,k)=>!k||k===1?f:[f[0]+f[2]/2-f[2]*k/2,f[1]+f[3]/2-f[3]*k/2,f[2]*k,f[3]*k];
  function visAt(data,L,s){const n=(data.scene.stops||[]).length;if(n<2||!Number.isFinite(s))return 1;const c=clamp(s,0,n-1),i=Math.min(n-2,Math.floor(c)),on=k=>L.stops.includes(k)?1:0,a=on(i),b=on(i+1);
   if(a===b)return a;const f=L.fade||[0,1];let p=clamp((ease(c-i)-f[0])/Math.max(.001,f[1]-f[0]),0,1);p=ease(p);return a+(b-a)*p;}
  function geo(data,l,v,s){const L=l.layer;let X0=l.X0,W=l.W,Y0=l.Y0||0,Hh=l.Hh||data.H,a=1;
   if(Array.isArray(L.stops))a*=visAt(data,L,s);
   if(L.follow){const f=L.follow;
    if(Number.isFinite(f.at)){const c=stopX(data,f.at),nb=[stopX(data,f.at-1),stopX(data,f.at+1)].filter(Number.isFinite),lo=Math.min(c,...nb),hi=Math.max(c,...nb),cl=clamp(v.cx,lo,hi);
     const k=Array.isArray(f.k)?(cl<c?f.k[0]:f.k[1]):(f.k??.85);X0+=k*(cl-c);}   // "at": a picture that drifts with the view toward either neighbour (k: [toward the left, toward the right])
    else{const c=stopX(data,f.from??0),d=stopX(data,f.to??0);X0+=(f.k??.85)*(clamp(v.cx,Math.min(c,d),Math.max(c,d))-c);}}
   if(L.insert){const I=L.insert,mid=stopX(data,I.stop??0),dist=Math.abs(v.cx-mid);a*=ease(clamp(1-(dist-(I.hold??80))/(I.fade??480),0,1));
    const ar=I.aspect||(l.nw&&l.nh?l.nw/l.nh:4/3),wide=v.vw/v.vh>ar,w=wide?v.vw:v.vh*ar,h=wide?v.vw/ar:v.vh,ccx=v.cx+(mid-v.cx)*(I.drift??.35),w2=w*(I.grow??1.04)+dist*(I.spread??.7)+60,h2=w2*h/w;
    X0=ccx-w2/2;W=w2;Y0=v.cy-h2/2;Hh=h2;}
   return {X0,W,Y0,Hh,a};}
  function drawWorld(data,st,m,cam,alphaMul,passage,depthPass){
   const V=stripView(data,cam),{vw,vh,cx,cy,H}=V,view=S.view,showDepth=depthPass||view.includes('depth'),E=early(data);
   gl.uniform1f(uniform(layerProgram,'depthPass'),showDepth?1:0);
   // a camera in the room (memory.json "perspective" {layers, depth}): each layer is drawn as a camera at the middle of the view would see it
   // at its distance, the near a little larger around that middle, so a pan carries the near across the screen faster than the far.
   // Every layer and every tile follows the same rule, so joined pictures stay joined; the depth maps do the same per pixel (perspX)
   const PV=data.scene.perspective&&!reduced.matches?data.scene.perspective:null,sw=data===current&&S.sway&&!reduced.matches?S.sway:{x:0,y:0};
   const order=data.layers.map((l,i)=>{const g=geo(data,l,V,cam.s);if(PV?.layers){const f=1+PV.layers*(l.plane-.16);g.X0=cx+(g.X0-cx)*f;g.W*=f;g.Y0=cy+(g.Y0-cy)*f;g.Hh*=f;}return [l,i,g];}).filter(([l,,g])=>(l.state==='ready'||l.low)&&!l.hidden&&g.a>.002&&g.X0<cx+vw/2+200&&g.X0+g.W>cx-vw/2-200).sort((a,b)=>a[0].plane-b[0].plane||a[0].section-b[0].section);
   const one=view!=='scene'&&view!=='depth';
   const W2=canvas.width,H2=canvas.height,sx=X=>Math.round(((X-(cx-vw/2))/vw)*W2),mg=vw*.06;
   gl.enable(gl.SCISSOR_TEST);const now=performance.now();
   // two different shots side by side: only the one drawn later fades in; the one under it stays solid to its edge
   // (when both faded, nothing was left at the join but the two stretched edges meeting in a hard line)
   // the one fading in needs no stretched edge of its own there (it showed through as a bright hairline when depth pulled the solid edge in)
   const tol=vw*.002,feathers=order.map(([l])=>fe(l.layer.feather)),noEdge=order.map(()=>[false,false]);
   if(!E)order.forEach(([l,,g],k)=>{if(l.rigid||l.plane>=.3)return;   // ERA: an earlier strip keeps every picture's own soft sides at a join
    for(let j=k+1;j<order.length;j++){const [n,,h]=order[j];if(n.rigid||n.plane>=.3)continue;const nf=feathers[j];
     if(nf[0]>0&&Math.abs(h.X0-(g.X0+g.W))<tol){feathers[k][1]=0;noEdge[j][0]=true;}if(nf[1]>0&&Math.abs(h.X0+h.W-g.X0)<tol){feathers[k][0]=0;noEdge[j][1]=true;}}});
   const clip=(a,b)=>{const x0=clamp(sx(a),0,W2),x1=clamp(sx(b),0,W2);if(x1<=x0)return false;gl.scissor(x0,0,x1-x0,H2);return true;};
   const MK=marksTex.get(data.scene?.id);bind(layerProgram,'marksMap',MK||white,3);gl.uniform1f(uniform(layerProgram,'marksOn'),MK?(S.marksOn||0):0);   // STORYTELLING aged print
   const EG=E?2:12;   // ERA: how far a stretched edge (pass 0) reaches back inside its own tile: earlier 2, later 12
   for(const pass of [0,1])for(const [k,[l,i,g]] of order.entries()){
    if(one&&view!=='layer:'+i&&view!=='layer-depth:'+i)continue;
    const back=!l.rigid&&l.plane<.3&&(!l.layer.feather||l.layer.underlay);   // "underlay": a soft-edged background that still stretches its edges under its neighbours (film strip seams, no dark gap)if(pass===0&&(!back||one))continue;
    gl.uniform4f(uniform(layerProgram,'feather'),...(pass===0?[0,0,0,0]:feathers[k]));      // pass 0: background tiles' edges, stretched under their neighbours
    const travel=(Number.isFinite(l.travel)?l.travel:l.plane*(profile(st).layerParallax||0))*m.o;
    gl.uniform1f(uniform(layerProgram,'layerParallax'),travel*vw/g.W);
    // STORYTELLING multiplane: the camera physically moves. Dolly: near planes grow faster than far ones. Truck: near planes pass faster. (off: no dolly, truck, focus or haze set)
    const MP=S.poolDrag?S:(transition&&data===transition.to&&S.enter)?S.enter:(transition&&data===transition.to?{}:S),DL=MP.dolly||0,TRK=MP.truck||0,LK=1/Math.max(.35,1-DL*l.plane);
    gl.uniform4f(uniform(layerProgram,'crop'),vw/g.W/LK,vh/g.Hh/LK,(cx-g.X0)/g.W-.5+TRK*(l.plane-.16)*vw/g.W,.5-(cy-g.Y0)/g.Hh);
    const FE=S.feel?.focus&&(!transition||data!==transition.to)?S.feel.focus:null;gl.uniform2f(uniform(layerProgram,'focusAt'),FE?(px+1)/2:-1,FE?(py+1)/2:-1);
    gl.uniform1f(uniform(layerProgram,'blurR'),FE?Math.min(.02,(FE.blur??.005)*vw/g.W):MP.focus==null?0:Math.min(.02,(MP.blur??.006)*vw/g.W/LK));gl.uniform1f(uniform(layerProgram,'focusD'),MP.focus??.5);
    const HZ=MP.haze;gl.uniform4f(uniform(layerProgram,'haze'),HZ?HZ[0]:0,HZ?HZ[1]:0,HZ?HZ[2]:0,HZ?HZ[3]:0);
    const hx=E&&!sw.x?px:clamp(px+sw.x,-1,1),hy=E&&!sw.y?py:clamp(py+sw.y,-1,1);   // ERA: earlier: the hand alone, unclamped (as it was) unless a sway is on
    gl.uniform2f(uniform(layerProgram,'pointer'),hx*st.strength*vw/g.W,hy*st.strength*st.vertical*vh/g.Hh);   // sway (a beat's slow tilt) adds to the hand's
    gl.uniform1f(uniform(layerProgram,'perspX'),(PV?.depth||0)*st.strength*vw/g.W);gl.uniform1f(uniform(layerProgram,'plim'),st.strength*vw/g.W);
    gl.uniform3f(uniform(layerProgram,'xform'),l.x||0,l.y||0,l.scale||1);gl.uniform2f(uniform(layerProgram,'lsize'),1,1);
    gl.uniform1f(uniform(layerProgram,'plane'),l.plane);gl.uniform1f(uniform(layerProgram,'rigid'),l.rigid?1:0);
    gl.uniform1f(uniform(layerProgram,'passage'),l.rigid?passage:0);gl.uniform1f(uniform(layerProgram,'edgeM'),pass===0?250/g.W:0);
    gl.uniform1f(uniform(layerProgram,'seamLock'),(!l.rigid&&l.plane<.3)?(data.scene.seamLock??.06):0);
    // the full picture once it is in; until then its small preview (flat); when it arrives it melts in over the preview
    const full=l.state==='ready',f=full&&l.low?clamp((now-(l.readyAt||0))/FADE,0,1):1;
    const looks=!full?[[l.low,1]]:(f<1&&pass===1?[[l.low,1],[null,ease(f)]]:[[null,1]]);
    for(const [lo,am] of looks){const tex=lo?lo.texture:l.colorTexture,dt=lo?null:l.depthTexture;
     bind(layerProgram,'colorMap',tex,0);bind(layerProgram,'depthMap',dt||white,1);bind(layerProgram,'foregroundMask',tex,2);
     gl.uniform4f(uniform(layerProgram,'trim'),...((lo?lo.trim:l.trim)||[0,0,1,1]));
     gl.uniform1f(uniform(layerProgram,'alpha'),(l.opacity??1)*alphaMul*g.a*am);gl.uniform1f(uniform(layerProgram,'hasDepth'),pass===0?0:(dt?1:0));
     if(pass===0){if(!noEdge[k][0]&&clip(g.X0-250,g.X0+EG))gl.drawArrays(gl.TRIANGLE_STRIP,0,4);if(!noEdge[k][1]&&clip(g.X0+g.W-EG,g.X0+g.W+250))gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
     else if(clip(g.X0-mg,g.X0+g.W+mg))gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}}
   gl.disable(gl.SCISSOR_TEST);}
  /* ---- which pictures are in memory ----
     A picture loads when the view is near it, or near where the view is heading (aim: where the visitor
     will land). While the view is racing past (streaming through), only the landing place loads in full;
     everything passed on the way shows its small preview. Far pictures are let go (their preview stays).
     At most three download at once, nearest to the landing first; one no longer wanted is dropped. */
  let aim=null,speed=0,lastV=null;
  const NEAR=1.5,FAR=3.2,BUSY=3;
  function ensure(data){if(!data?.strip)return Promise.resolve();
   const own=data===current&&S.moment?[S.moment.a,S.moment.b]:[data.cam||S.cam];
   const views=own.map(c=>stripView(data,c)),aims=data===current&&aim&&!data.cam?[stripView(data,aim)]:[];
   if(data===current){const v=views[0],t=performance.now();if(!lastV||lastV.data!==data||t-lastV.t>1000)lastV={cx:v.cx,t,data};else if(t-lastV.t>=30){const sp=Math.abs(v.cx-lastV.cx)/v.vw/((t-lastV.t)/1000);speed+=(sp-speed)*.35;lastV={cx:v.cx,t,data};}}   // how fast the view is crossing the story (screens a second)
   const racing=data===current&&speed>1.4&&aims.length;
   const dist=(l,v)=>{const G=l.layer.insert?{X0:v.cx-v.vw,W:v.vw*2}:geo(data,l,v,NaN);return Math.max(0,G.X0-(v.cx+v.vw/2),(v.cx-v.vw/2)-(G.X0+G.W))/v.vw;};
   // TESTING: a joined strip at rest also loads the shot before and the shot after, so a slide never waits for its pictures
   const nb=[];if(data===current&&data.scene.joinSpec&&!transition&&speed<.1){const st=data.scene.stops||[],k0=Math.round((data.cam||S.cam)?.s??0);
    for(const k of [k0+1,k0-1]){const p=st[k];if(p)nb.push(stripView(data,{frame:showMore(p.frame||[(p.x??data.H)-data.H*.7,0,data.H*1.4,data.H],p.show),keep:p.keep?{a:p.keep,b:p.keep,t:0}:null}));}}
   const wanted=[];
   for(const l of data.layers){if(l.state==='gone')continue;
    const dn=Math.min(...views.map(v=>dist(l,v))),da=aims.length?dist(l,aims[0]):Infinity,db=nb.length?Math.min(...nb.map(v=>dist(l,v))):Infinity,d=Math.min(dn,da,db);
    const want=da<NEAR||(!racing&&dn<NEAR)||db<.02,keep=d<FAR;
    l.pri=Math.min(da,racing?dn+2:dn,db+1);   // the neighbouring shots come after the shot on screen
    if(want){wanted.push(l);if(l.state==='none'){l.state='queued';l.ready=new Promise(r=>l.done=r);}}
    else if(!keep)drop(l);
    if(!l.low&&!l.lowLoading&&d<FAR*2)lowLoad(data,l);}
   for(const l of data.layers)if(l.state==='queued'&&!wanted.includes(l)&&l.pri>FAR)drop(l);
   let active=data.layers.filter(l=>l.state==='loading').length;
   const q=data.layers.filter(l=>l.state==='queued').sort((x,y)=>x.pri-y.pri);
   while(active<BUSY&&q.length){loadStripLayer(data,q.shift());active++;}
   return Promise.all(wanted.map(l=>l.ready||null));}
  function drop(l){if(l.state==='loading'&&l.job){l.job.cancelled=true;l.job.abort?.();}
   if(l.state==='ready'){for(const t of [l.colorTexture,l.depthTexture])if(t)gl.deleteTexture(t);l.colorTexture=l.depthTexture=null;}
   if(l.state==='loading'||l.state==='queued'||l.state==='ready'){l.state='none';l.done?.();}}
  // the small preview: publish makes one for every picture; without it the first full load leaves one behind
  async function lowLoad(data,l){if(!l.lowRef)return;l.lowLoading=true;
   try{const c=await picture({url:l.lowRef},{trim:true,maxW:512});if(l.state==='gone')return;const t=await upload(c);if(l.state==='gone'){gl.deleteTexture(t);return;}
    if(!l.low){if(!l.nw){l.nw=l.info?.w||c.nw;l.nh=l.info?.h||c.nh;place(data,l);}l.low={texture:t,trim:c.trim};dirty=true;}else gl.deleteTexture(t);}catch{}}
  // where a picture sits in the strip. Pinned pictures ("extended_left" pins to the right of its section,
  // "extended_right" to the left) keep their true size
  function place(data,l){const sec=data.sections[l.section]||data.sections[0],R=l.layer.rect;
   const pin=l.layer.pin||(/extended_left/i.test(l.layer.image)?'right':/extended_right/i.test(l.layer.image)?'left':null);
   if(R){l.X0=R[0];l.Y0=R[1];l.W=R[2];l.Hh=R[3];}
   else if(pin&&l.nw){l.W=l.nw*data.H/l.nh;l.X0=pin==='right'?sec.x0+sec.w-l.W:sec.x0;l.Y0=0;l.Hh=data.H;}else{l.W=sec.w;l.X0=sec.x0;l.Y0=0;l.Hh=data.H;}
   return pin;}
  async function loadStripLayer(data,l){l.state='loading';const job=l.job={cancelled:false};const m=data.scene,o=data.opt,sec=data.sections[l.section];
   const live=()=>!job.cancelled&&l.state==='loading';
   try{const maxW=Math.min(8192,gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096);
    const fo=l.layer.folder||o.folder,mm=l.layer.folder?{...m,desktopFolder:l.layer.desktopFolder,mobileFolder:l.layer.mobileFolder,source:l.layer.source}:m;   // "folder": the picture lives in another memory's folder
    // the most height this picture will ever cover on this screen (closest stop, inserts fill the screen), with room for the depth to move
    const vmin=Math.min(...((m.stops||[]).length?m.stops:[{}]).map(p=>stripView(data,{frame:showMore(p.frame||[0,0,data.H*1.4,data.H],p.show)}).vh));
    const shown=l.layer.insert?vmin*1.3:(l.layer.rect?l.layer.rect[3]:data.H),needH=canvas.height*shown/vmin*1.2;
    const [cr,dr]=await Promise.all([resolve(mm,fo,l.layer.image,o.set,o.source),l.layer.depth?resolve(mm,fo,l.layer.depth,o.set,o.source).catch(()=>null):null]);
    const [c,d]=await Promise.all([picture(cr,{maxW,trim:true,needH,job}),dr?picture(dr,{maxW,scale:.5,grey:true,needH:needH*.6}).catch(()=>null):null]);
    if(!live())return;
    l.nw=c.nw;l.nh=c.nh;l.trim=c.trim;const pin=place(data,l),R=l.layer.rect;
    let depthSrc=null;
    if(d){const dw=d.nw,dh=d.nh,same=Math.abs((dw/dh)/(l.nw/l.nh)-1)<.01;
     if(same)depthSrc=d;
     else if(pin&&!R&&Math.abs(dh/l.nh-1)<.02){
      // same height, different width: line the map up with whichever edge of the picture it matches
      // (checked against the picture's outline), or the edge set by hand ("depthAnchor": left / right)
      const edge=l.layer.depthAnchor||matchEdge(c,d);
      const cv=document.createElement('canvas');const H2=d.height,W2=Math.round(H2*l.nw/l.nh),dW=d.width;cv.width=W2;cv.height=H2;const g=cv.getContext('2d');
      const x=edge==='right'?W2-dW:0;g.drawImage(d,x,0,dW,H2);
      if(x>0)g.drawImage(d,0,0,1,d.height,0,0,x,H2);else if(dW<W2)g.drawImage(d,d.width-1,0,1,d.height,dW,0,W2-dW,H2);
      depthSrc=cv;l.depthEdge=edge;l.note='depth map is '+dw+' px wide, picture '+l.nw+' px: lined up with the '+edge+' edge'+(l.layer.depthAnchor?' (set by hand)':' (matched to the picture)')+', the rest stretched';}
     else l.note='depth map shape ('+dw+'×'+dh+') does not match the picture ('+l.nw+'×'+l.nh+'): drawn flat until fixed';}
    const ct=await upload(c),dt=depthSrc?await upload(depthSrc,true):null;
    if(!live()){gl.deleteTexture(ct);if(dt)gl.deleteTexture(dt);return;}
    l.colorTexture=ct;l.depthTexture=dt;
    if(!l.low){try{l.low={texture:await upload(lowCopy(c)),trim:c.trim};}catch{}}   // FLOW: a preview that fails does not undo the picture
    l.state='ready';l.readyAt=performance.now();fadeUntil=l.readyAt+FADE;dirty=true;}
   catch(e){if(live()){l.state='failed';l.note='could not load: '+e.message;l.tries=(l.tries||0)+1;if(l.tries<4)setTimeout(()=>{if(l.state==='failed'){l.state='none';dirty=true;}},1500*l.tries);}}   // FLOW: a failed picture is tried again (three times)
   finally{l.job=null;l.done?.();if(l.state!=='gone'&&(data===current||data.cam))ensure(data);}}
  const FADE=380;let fadeUntil=0;
  // which edge a narrower (or wider) depth map belongs to: compare where things are, column by column
  function matchEdge(c,d){try{const prof=(img,w,h,isDepth,tr)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d',{willReadFrequently:true});
     if(tr){g.drawImage(img,tr[0]*w,(1-tr[1]-tr[3])*h,tr[2]*w,tr[3]*h);}else g.drawImage(img,0,0,w,h);
     const px=g.getImageData(0,0,w,h).data;const out=new Float32Array(w);let bg=0;if(isDepth){const hist=new Uint32Array(256);for(let i=0;i<px.length;i+=4)hist[px[i]]++;for(let v=1;v<256;v++)if(hist[v]>hist[bg])bg=v;}   // the map's background: its most common grey
     for(let x=0;x<w;x++){let v=0;for(let y=0;y<h;y++){const i=(y*w+x)*4;v+=isDepth?(Math.abs(px[i]-bg)>8?1:0):(px[i+3]>40?1:0);}out[x]=v/h;}return out;};
    const k=8,h=Math.max(8,Math.round(c.nh/k)),cw=Math.round(c.nw/k),dw=Math.round(d.nw/k);
    const C=prof(c,cw,h,false,c.trim),D=prof(d,dw,h,true,null),n=Math.min(cw,dw);
    const score=off=>{let s=0;for(let i=0;i<n;i++)s-=Math.abs(C[i+(cw>dw?off:0)]-D[i+(dw>cw?off:0)]);return s;};
    return score(Math.abs(cw-dw))>score(0)?'right':'left';}catch{return 'left';}}
  // a picture's size: from files.json, or read from the file's first bytes (PNG or WebP), so re-exported sizes just work
  async function pictureSize(ref){if(ref.info?.w)return [ref.info.w,ref.info.h];
   for(const u of [ref.url,ref.alt].filter(Boolean)){try{const r=await fetch(u,{headers:{Range:'bytes=0-63'},cache:'no-store'});if(!r.ok)continue;const s=headSize(new DataView(await r.arrayBuffer()));if(s)return s;}catch{}}
   return null;}
  function draw(now){
   requestAnimationFrame(draw);
   if(lost)return;pump();
   if(!current||document.hidden)return;
   if(now-last<25)return;
   const moving=S.motion.amt>.0005||ghostLeft>0;
   if(current?.strip)ensure(current);
   if(!dirty&&!transition&&!moving&&now>fadeUntil&&Math.abs(tx-px)+Math.abs(ty-py)<.00015)return;      // nothing moved: draw nothing (saves the phone)
   const dt=Math.min(60,now-(last||now));last=now;
   const resp=S.response??profile().responseMs;const k=resp>0?1-Math.exp(-dt/resp):1;px+=(tx-px)*k;py+=(ty-py)*k;
   if(reduced.matches){px=0;py=0;}
   const cut=transition,t=cut?(Number.isFinite(window.SITT_CUT_T)?window.SITT_CUT_T:clamp((now-cut.began)/cut.duration,0,1)):1;   // SITT_CUT_T holds a cut still (for checking one frame)
   if(cut&&cut.travel){const e=ease(t);cut.from.pan=cut.pan0+cut.travel*e;cut.to.pan=-cut.travel*(1-e);}
   if(cut&&cut.zoomTo){const e=ease(Math.min(1,t*1.4));
    if(cut.from.strip){const H0=cut.from.H,F=cut.cam0.frame||[(cut.cam0.x??H0)-H0*.7,0,H0*1.4,H0],z=Math.pow(cut.zoomTo.zoom,e),cx0=F[0]+F[2]/2,cy0=F[1]+F[3]/2,zx=cx0+(cut.zoomTo.x-cx0)*e,zy=cy0+(cut.zoomTo.y-cy0)*e;
     cut.from.cam={frame:[zx-F[2]/2/z,zy-F[3]/2/z,F[2]/z,F[3]/z],s:cut.cam0.s};}   // a strip pushes in on its own frame
    else cut.from.cam={x:cut.cam0.x+(cut.zoomTo.x-cut.cam0.x)*e,y:cut.cam0.y+(cut.zoomTo.y-cut.cam0.y)*e,zoom:(cut.cam0.zoom||1)*Math.pow(cut.zoomTo.zoom/(cut.cam0.zoom||1),e)};}
   const L=S.look,v=reduced.matches?0:S.motion.amt;
   const streak=v>0?clamp(v*.2*(L.blur??1),0,.035*(L.blur??1)):0,ghost=Math.max(v>0?clamp(v*.3*(L.trail??1),0,.25):0,reduced.matches?0:clamp(L.echo||0,0,.85));   // echo (a memory's look): an afterimage that never leaves, so every movement trails (shock, a mind a beat behind)
   ghostLeft=ghost>0?6:Math.max(0,ghostLeft-1);
   const dx=cut?.drift?.[0]||0,ee=cut?t*t*(3-2*t):0;
   renderScene(cut?cut.from:current,targets[0],cut&&(cut.kind===1||cut.kind===3)?Math.sin(t*Math.PI)*.5*(cut.kind===3?-1:1):cut?.kind===11?dx*ee*.7:0);
   if(cut){renderScene(cut.to,targets[1],cut.kind===11?-dx*(1-ee)*.7:0);renderScene(cut.to,targets[3],0,true);}
   const FL=S.feel?.light;if(FL)S.relight={x:(px+1)/2,y:(1-py)/2,k:FL.k??.8,soft:FL.soft??.35};   // EXPLORE: the light is in the viewer's hand
   const AIR=S.feel?.air;if(AIR)dirty=true;
   const LI=S.relight&&S.relight.k>0?S.relight:null;   // STORYTELLING (off: no relight, air, radial blur set)
   if(streak>0||S.radialBlur>0||LI||AIR)renderScene(cut?cut.from:current,targets[2],0,true);
   const out=targets[4+pp],prev=targets[5-pp];
   gl.bindFramebuffer(gl.FRAMEBUFFER,out.framebuffer);gl.viewport(0,0,canvas.width,canvas.height);use(finishProgram);
   bind(finishProgram,'fromMap',targets[0].texture,0);bind(finishProgram,'toMap',cut?targets[1].texture:targets[0].texture,1);
   bind(finishProgram,'depthMap',cut?targets[3].texture:targets[0].texture,2);bind(finishProgram,'sceneDepth',targets[2].texture,3);bind(finishProgram,'prevMap',prev.texture,4);
   const lk=cut?{...LOOK,...(cut.to.scene.look||{})}:L,f=cut?ease(t):1;
   gl.uniform1f(uniform(finishProgram,'progress'),cut?(cut.kind>3.5?t*t*(3-2*t):ease(t)):1);gl.uniform1f(uniform(finishProgram,'seed'),cut?.seed??0);gl.uniform1f(uniform(finishProgram,'settle'),cut?.settle??0);gl.uniform2f(uniform(finishProgram,'focal'),...(cut?.focal||[.5,.55]));gl.uniform4f(uniform(finishProgram,'drift'),...(cut?.drift||[1,0,.45,.6]));gl.uniform1f(uniform(finishProgram,'kind'),cut?.kind||0);gl.uniform1f(uniform(finishProgram,'cutting'),cut?1:0);
   gl.uniform1f(uniform(finishProgram,'fromEarly'),early(cut?cut.from:current)?1:0);gl.uniform1f(uniform(finishProgram,'toEarly'),early(cut?cut.to:current)?1:0);   // ERA: each side of a cut read by its own memory's rules
   gl.uniform1f(uniform(finishProgram,'radialBlur'),reduced.matches?0:(S.radialBlur||0));
   gl.uniform2f(uniform(finishProgram,'filmAnchor'),...(S.filmAnchor||[.5,.5]));
   gl.uniform2f(uniform(finishProgram,'filmCamera'),reduced.matches?0:(S.filmPan||0),reduced.matches?0:(S.filmZoom||0));
   gl.uniform2f(uniform(finishProgram,'dragVelocity'),...(S.dragVelocity||[0,0]));
   gl.uniform2f(uniform(finishProgram,'dragFocus'),...(S.dragFocus||[.5,.5]));
   gl.uniform1f(uniform(finishProgram,'edgeBlur'),reduced.matches?0:(S.edgeBlur||0));
   gl.uniform1f(uniform(finishProgram,'clock'),reduced.matches?0:now/1000);
   gl.uniform4f(uniform(finishProgram,'light'),LI?LI.x:0,LI?LI.y:0,LI?LI.k:0,LI?(LI.soft||.5):.5);gl.uniform1f(uniform(finishProgram,'aspect'),canvas.width/canvas.height);
   gl.uniform4f(uniform(finishProgram,'air'),AIR?AIR.amount??.5:0,0,AIR?AIR.size??1:1,AIR?AIR.drift??1:1);gl.uniform3f(uniform(finishProgram,'airColor'),...(AIR?.color||[1,.96,.88]));gl.uniform2f(uniform(finishProgram,'hand'),px,py);
   gl.uniform1f(uniform(finishProgram,'streak'),streak);gl.uniform2f(uniform(finishProgram,'streakDir'),S.motion.dir,0);gl.uniform1f(uniform(finishProgram,'ghost'),frames?ghost:0);
   const mixL=k=>cut?(cut.fromLook[k]??LOOK[k])+((lk[k]??LOOK[k])-(cut.fromLook[k]??LOOK[k]))*f:(L[k]??LOOK[k]);
   for(const k of ['warm','cold','vignette','deepVignette','grain'])gl.uniform1f(uniform(finishProgram,k),mixL(k));
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);use(blitProgram);bind(blitProgram,'map',out.texture,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   pp=1-pp;frames++;dirty=false;
   if(cut&&t===1){destroy(cut.from);delete cut.to.pan;delete cut.to.cam;current=cut.to;transition=null;cut.done?.();}}
  function destroy(data){if(!data)return;for(const t of data.textures)gl.deleteTexture(t);
   if(data.strip)for(const l of data.layers){drop(l);if(l.low)gl.deleteTexture(l.low.texture);l.low=null;l.state='gone';}}
  // a single picture (not a strip): every layer at once, depth as grey
  async function loadImage(memory,folder,name,set,source,o={}){return picture(await resolve(memory,folder,name,set,source),o);}
  // a strip's layout (sizes come from files.json or the files' headers); no picture is loaded yet
  async function layout(memory,opt){
   const H=memory.height||1500,secs=memory.sections||[];
   // widths from each section's background picture (its first layer); a section whose pictures live in another memory's folder keeps its written width
   const sizes=await Promise.all(secs.map((s,k)=>{const bg=memory.layers.find(l=>l.section===k);return bg&&!bg.folder?resolve(memory,opt.folder,bg.image,'desktop',opt.source).then(pictureSize).catch(()=>null):null;}));
   // a section can also be placed by hand ("x"), for tiles that overlap like Walk Left's panorama
   let x=0;const sections=secs.map((s,k)=>{const sz=sizes[k];const w=sz?sz[0]*H/sz[1]:(s.width||H*1.6);s.width=Math.round(w);const x0=Number.isFinite(s.x)?s.x:x;const o={x0,w};x=Math.max(x,x0+w);return o;});
   if(Number.isFinite(memory.extent))x=Math.max(x,memory.extent);   // "extent": the strip reaches past its sections (pictures placed beyond them)
   if(!sections.length){for(const l of memory.layers)if(l.rect&&!l.insert)x=Math.max(x,l.rect[0]+l.rect[2]);sections.push({x0:0,w:x||H});}   // a strip ends where its sections end (a reel, with none, where its pictures end)
   const layers=memory.layers.map(l=>{const sec=sections[l.section||0]||sections[0],R=l.rect;return {layer:l,section:l.section||0,X0:R?R[0]:sec.x0,W:R?R[2]:sec.w,Y0:R?R[1]:0,Hh:R?R[3]:H,state:'none',colorTexture:null,depthTexture:null,low:null,
    get role(){return l.role;},get plane(){return l.plane;},get rigid(){return l.rigid;},get travel(){return l.travel;},get x(){return l.x;},get y(){return l.y;},get scale(){return l.scale;},get opacity(){return l.opacity;},get hidden(){return l.hidden;}};});
   Object.defineProperty(memory,'_total',{value:x,writable:true,configurable:true,enumerable:false});
   Object.defineProperty(memory,'_sections',{value:sections,writable:true,configurable:true,enumerable:false});
   const data={scene:memory,strip:true,H,total:x,sections,layers,textures:[],opt};
   // previews named in files.json
   await Promise.all(layers.map(async l=>{try{const fo=l.layer.folder||opt.folder,mm=l.layer.folder?{...memory,desktopFolder:l.layer.desktopFolder,mobileFolder:l.layer.mobileFolder}:memory;const r=await resolve(mm,fo,l.layer.image,opt.set,opt.source);l.lowRef=r.low;l.info=r.info;if(r.info?.w){l.nw=r.info.w;l.nh=r.info.h;place(data,l);}}catch{}}));
   return data;}
  async function loadStrip(memory,opt){const data=await layout(memory,opt);const H=data.H,sections=data.sections;
   const st=(memory.stops||[])[memory.startStop||0];data.cam=opt.cam?.frame?opt.cam:{frame:st?.frame||[sections[0].x0,0,sections[0].w,H],s:memory.startStop||0};
   await ensure(data);delete data.cam;return data;}
  async function load(memory,opt){
   if(memory.kind==='strip')return loadStrip(memory,opt);
   const textures=[];
   const layers=await Promise.all(memory.layers.map(async l=>{
    const [c,d]=await Promise.all([loadImage(memory,opt.folder,l.image,opt.set,opt.source),l.depth?loadImage(memory,opt.folder,l.depth,opt.set,opt.source,{grey:true}).catch(()=>null):null]);
    const colorTexture=await upload(c);textures.push(colorTexture);let depthTexture=null;if(d){depthTexture=await upload(d,true);textures.push(depthTexture);}
    return {layer:l,colorTexture,depthTexture,nw:c.nw||c.width,nh:c.nh||c.height,get role(){return l.role;},get plane(){return l.plane;},get rigid(){return l.rigid;},get travel(){return l.travel;},
     get x(){return l.x;},get y(){return l.y;},get scale(){return l.scale;},get opacity(){return l.opacity;},get hidden(){return l.hidden;}};}));
   // the memory's shape comes from its background; every other picture is measured against it
   const bg=layers[0];Object.defineProperty(memory,'_shape',{value:bg.nw/bg.nh,writable:true,configurable:true,enumerable:false});
   // every picture lines up with the background as one canvas, whatever its size (the default);
   // move it, size it or fade it with its own settings. fit:"size" draws it at its true size instead.
   for(const l of layers){const fit=l.layer.fit||'canvas';
    l.fitUsed=fit;l.size=fit==='canvas'?[1,1]:[l.nw/bg.nw,l.nh/bg.nh];}
   let fullDepth=null;if(memory.depthMap){try{fullDepth=await upload(await loadImage(memory,opt.folder,memory.depthMap,opt.set,opt.source,{grey:true}),true);textures.push(fullDepth);}catch{}}
   return {scene:memory,layers,fullDepth,textures};}
  /* the next memory, fetched ahead into the browser's cache (not decoded, not on the graphics card):
     its previews, and the pictures where the visitor will land */
  async function warm(memory,opt,stopsToWarm){try{
   if(memory.kind!=='strip'){for(const l of memory.layers)for(const n of [l.image,l.depth])if(n)resolve(memory,opt.folder,n,opt.set,opt.source).then(r=>fetch(r.url,{priority:'low'})).catch(()=>{});return;}
   const data=await layout(memory,opt);for(const l of data.layers)if(l.lowRef)fetch(l.lowRef,{priority:'low'}).catch(()=>{});
   // (the preview server answers "unchanged" for a picture already fetched, so warming works on your computer too)
   for(const s of stopsToWarm){const p=(memory.stops||[])[s];if(!p)continue;const v=stripView(data,{frame:p.frame||[0,0,data.H*1.4,data.H],s});
    for(const l of data.layers){const G=geo(data,l,v,s);if(G.a<.01||G.X0>v.cx+v.vw||G.X0+G.W<v.cx-v.vw)continue;
     const fo=l.layer.folder||opt.folder,mm=l.layer.folder?{...memory,desktopFolder:l.layer.desktopFolder,mobileFolder:l.layer.mobileFolder}:memory;
     for(const n of [l.layer.image,l.layer.depth])if(n)resolve(mm,fo,n,opt.set,opt.source).then(r=>fetch(r.url,{priority:'low'})).catch(()=>{});}}}catch{}}
  /* show a memory. With a duration it cuts from the one on screen using depth-map-test's cut:
     kind 0 through the depth, 1 a sweep from the left, 3 a sweep from the right, 2 from the top.
     travel slides both memories sideways (negative: everything moves right); zoomTo pushes the
     camera into the old memory (a door). */
  // STORYTELLING pool sequence: memories loaded onto the graphics card ahead, so a run of hard cuts never waits (used only by that test)
  const pre=new Map();
  function preload(memory,opt){const k=memory.id;if(!pre.has(k))pre.set(k,load(memory,opt).catch(e=>{pre.delete(k);throw e;}));return pre.get(k);}
  function dropPreloaded(){for(const [k,p] of pre){pre.delete(k);p.then(d=>{if(d!==current&&d!==transition?.to)destroy(d);}).catch(()=>{});}}
  async function show(memory,opt={},{kind=0,duration=0,travel=0,zoomTo=null,focal=null,settle=0,drift=null}={}){
   const P=pre.get(memory.id);pre.delete(memory.id);const next=P?await P:await load(memory,opt);dirty=true;
   if(opt.cam)next.cam=opt.cam;   // during the cut the arriving memory is seen from where the visitor will land in it
   if(transition){destroy(transition.from);delete transition.to.cam;current=transition.to;transition=null;}
   if(!current||!duration||reduced.matches){destroy(current);delete next.cam;current=next;return next;}
   return new Promise(res=>{transition={from:current,to:next,kind,duration,travel,zoomTo,focal,settle,drift,seed:drift?.[4]??Math.random()*10,pan0:S.pan||0,cam0:{...S.cam},fromLook:{...S.look},began:performance.now(),done:()=>res(next)};});}
  // a fresh copy of every picture of the memory on screen (after saving in Photoshop)
  async function reload(memory,opt){revision=Date.now();manifests.clear();pindex=null;const r=await show(memory,opt);return r;}
  /* every picture fresh from the server (the author saved a web image over its file): forgets files.json, pictures/index.json
     and every memory loaded ahead, and from now on fetches past the browser's cache. The pictures on screen stay until the
     next show or reload replaces them, so call: scene.reloadPictures(); await scene.reload(memory,{...opt,cam:scene.settings.cam}); */
  function reloadPictures(){revision=Date.now();manifests.clear();pindex=null;dropPreloaded();dirty=true;}
  // screen point to picture point (0..1 from the top left of the memory's canvas), for placing and hit tests
  function toImage(clientX,clientY){const r=canvas.getBoundingClientRect();if(!current)return null;
   if(current.strip){const v=stripView(current,S.cam);return [(v.cx+((clientX-r.left)/r.width-.5)*v.vw)/current.total,(v.cy+((clientY-r.top)/r.height-.5)*v.vh)/current.H];}
   const c=cover(current.scene);const u=(clientX-r.left)/r.width,v=1-(clientY-r.top)/r.height;
   return [(u-.5)*c[0]+.5+c[2],1-((v-.5)*c[1]+.5+c[3])];}
  function fromImage(ix,iy){const r=canvas.getBoundingClientRect();if(!current)return null;
   if(current.strip){const v=stripView(current,S.cam);return [r.left+((ix*current.total-v.cx)/v.vw+.5)*r.width,r.top+((iy*current.H-v.cy)/v.vh+.5)*r.height];}
   const c=cover(current.scene);
   const u=((ix-.5-c[2])/c[0])+.5,v=(((1-iy)-.5-c[3])/c[1])+.5;return [r.left+u*r.width,r.top+(1-v)*r.height];}
  // a lost graphics context (the phone reclaiming memory, a driver reset): start again where the visitor was
  let lost=false;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;});canvas.addEventListener('webglcontextrestored',()=>{try{sessionStorage.setItem('sitt-resume','1');}catch{}location.reload();});
  const main=canvas.parentElement;
  let tilting=false;   // a phone's tilt drives the depth (scene.tilt); the mouse and touch are left alone meanwhile
  const pointer=e=>{if(tilting||window.SITTWorldState?.poolDetached||reduced.matches||e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();tx=clamp((e.clientX-r.left)/r.width*2-1,-1,1);ty=clamp(1-(e.clientY-r.top)/r.height*2,-1,1);};   // (poolDetached: the earlier pool test holds the hand)
  main.addEventListener('pointermove',pointer,{passive:true});
  main.addEventListener('pointerleave',e=>{if(!tilting&&!e.relatedTarget?.closest?.('.studio')){tx=0;ty=0;}});
  main.addEventListener('pointerup',e=>{if(!tilting&&(e.pointerType==='touch'||matchMedia('(pointer:coarse)').matches)){tx=0;ty=0;}});
  main.addEventListener('pointercancel',e=>{if(!tilting&&e.pointerType==='touch'){tx=0;ty=0;}});
  // the device's tilt, x and y in -1..1 like the mouse (right, up), eased the same way; tilt(null) hands back to the mouse
  function tilt(x,y){if(x==null){if(tilting){tilting=false;tx=0;ty=0;}return;}tilting=true;tx=clamp(+x||0,-1,1);ty=clamp(+y||0,-1,1);}
  // re-measure whenever the picture's own area changes size (the studio opening, a rotated phone), not only the window
  if(window.ResizeObserver)new ResizeObserver(()=>resize()).observe(canvas);else addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{last=0;dirty=true;});
  resize();requestAnimationFrame(draw);
  return {settings:S,LOOK,show,reload,reloadPictures,tilt,setMarks,preload,dropPreloaded,getCam:()=>JSON.parse(JSON.stringify(current?.cam||S.cam||{})),setCam:c=>{if(current){current.cam=c;dirty=true;}},   // STORYTELLING pool test: a zoom inside the picture being shown
  warm,resolve,forget:()=>{manifests.clear();pindex=null;},view:c=>current?.strip?stripView(current,c):null,aim:c=>{aim=c;},memoryUse:()=>{let n=0,b=0;const each=d=>{if(d?.strip)for(const l of d.layers){if(l.state==='ready')n++;}};each(current);return {loaded:n,queued:uploads.length,speed};},toImage,fromImage,changed:()=>{dirty=true;},
   crop:()=>current?(current.strip?(v=>[v.vw,v.vh,0,0])(stripView(current,S.cam)):cover(current.scene)):[1,1,0,0],
   layerCrop:i=>{if(!current)return [1,1];if(!current.strip)return cover(current.scene);const v=stripView(current,S.cam),l=current.layers[i];return [v.vw/l.W,v.vh/current.H];},
   current:()=>current,busy:()=>!!transition,
   point:(x,y)=>{tx=clamp(x,-1,1);ty=clamp(y,-1,1);},
   state:()=>({memory:current?.scene.id,pointer:[px,py],settings:{...S},frames,width,height})};
 }
 window.SITTScene={create};
})();
