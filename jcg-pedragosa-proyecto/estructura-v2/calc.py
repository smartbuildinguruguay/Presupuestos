import math
E=210000.;fy=235.;g=1.5
def rhs(d,b,t):  # d = depth in bending direction (mm), b = width
    I=(b*d**3-(b-2*t)*(d-2*t)**3)/12.;A=2*(b+d)*t-4*t*t;return dict(I=I,W=I/(d/2),A=A,kg=A*7.85e-3)
SEC={'RHS 100x50x3 (50 de prof.)':rhs(50,100,3),'RHS 120x60x4 (120 de prof.)':rhs(120,60,4),
 'RHS 160x80x4 (160 de prof.)':rhs(160,80,4),'RHS 200x100x5':rhs(200,100,5),'RHS 200x100x6':rhs(200,100,6),
 'IPE200 acostada':dict(I=1943e4,W=194e3,A=2850,kg=22.4,Wz=28.5e3,Iz=142e4),'IPE160 acostada':dict(I=869e4,W=109e3,A=2010,kg=15.8,Wz=16.7e3,Iz=68.3e4),
 'IPE160 parada(horiz.)':dict(I=68.3e4,W=16.7e3,A=2010,kg=15.8)}
def beam(name,sec,L,s,p=1.0,k=8.,extra_v=0):
    w=p*s   # kN/m = N/mm
    M=g*w*L**2/k
    cap=sec['W']*fy/1e6
    d=5*w*(L*1000)**4/(384*E*sec['I'])
    return M,cap,M/cap,d,L*1000/d
rows=[]
def chk(tag,secn,L,s,p=1.0,k=8.):
    M,cap,u,d,r=beam(tag,SEC[secn],L,s,p,k);rows.append((tag,secn,L,s,M,cap,u,r));return rows[-1]
# 1 originales
chk('Clavadera original (long. wall, s=1.2 m, luz 6.7 m)','RHS 100x50x3 (50 de prof.)',6.7,1.2)
chk('Clavadera original en piñón (s=1.2 m, luz 3.1 m)','RHS 100x50x3 (50 de prof.)',3.1,1.2)
chk('Poste piñón original 160x80x4 (trib. 2.4 m, h=7.8 m)','RHS 160x80x4 (160 de prof.)',7.8,2.4)
chk('Poste piñón nuevo 200x100x6 (trib. 2.4 m, h=7.8)','RHS 200x100x6',7.8,2.4)
chk('Poste piñón nuevo 200x100x6 trasero (trib. 2.85, h=7.8)','RHS 200x100x6',7.8,2.85)
chk('Viga dintel IPE200 acostada (luz 6.5, trib. 2.8)','IPE200 acostada',6.5,2.8)
chk('Viga alero IPE160 acostada (luz 6.5, trib. 1.4)','IPE160 acostada',6.5,1.4)
chk('Clavadera piñón RHS120x60x4 (luz 3.2, trib. 2.2)','RHS 120x60x4 (120 de prof.)',3.2,2.2)
chk('Jamba RHS100x50x3 (h=2.9, trib. 1.2)','RHS 100x50x3 (50 de prof.)',2.9,1.2)
for r in rows: print('%-62s %-28s L=%.1f  M=%5.1f cap=%5.1f  u=%.2f  L/%.0f'%(r[0],r[1],r[2],r[4],r[5],r[6],r[7]))
# vertical load check on lying IPE
for n,w in(('IPE200',0.224+0.0),('IPE160',0.158)):
    s=SEC[n+' acostada'];L=6.5;Mv=1.35*w*L**2/8;capv=s['Wz']*fy/1e6;print(n,'Mv=%.2f capv=%.2f'%(Mv,capv))
print('biax IPE200:',(beam('',SEC['IPE200 acostada'],6.5,2.8)[0]/ (SEC['IPE200 acostada']['W']*fy/1e6)) + 1.35*0.224*6.5**2/8/(28.5e3*fy/1e6))
print('biax IPE160:',(beam('',SEC['IPE160 acostada'],6.5,1.4)[0]/ (SEC['IPE160 acostada']['W']*fy/1e6)) + 1.35*0.158*6.5**2/8/(16.7e3*fy/1e6))
# sensibilidad viento: carga admisible clavadera original
for p in (0.4,0.6,0.8,1.0):
    r=beam('',SEC['RHS 100x50x3 (50 de prof.)'],6.7,1.2,p);print('clav orig p=%.1f  u=%.2f L/%.0f'%(p,r[2],r[4]))
for n,s in SEC.items(): print(n,'kg/m %.1f W=%.1f cm3'%(s['kg'],s['W']/1e3))
