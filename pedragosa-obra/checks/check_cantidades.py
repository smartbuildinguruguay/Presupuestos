"""Valida computo/cantidades.json: planilla original y geometría medida. Ejecutar: python3 checks/check_cantidades.py"""
import json, pathlib, sys
raiz = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((raiz / "computo" / "cantidades.json").read_text(encoding="utf-8"))
errores = []
def suma(bloque, clave):
    return sum(v[clave] for k, v in bloque.items() if k.startswith("N"))
PLANILLA = {
    ("sanitaria", "inodoros"): 10, ("sanitaria", "lavatorios"): 10, ("sanitaria", "duchas"): 10,
    ("sanitaria", "desagues_kitchenette"): 6, ("sanitaria", "termotanques"): 6,
    ("electrica", "tableros"): 7, ("electrica", "medidores"): 7, ("electrica", "tomas"): 74,
    ("electrica", "bocas"): 74, ("electrica", "tomas_20A"): 16, ("electrica", "carteles_C7"): 6,
}
for (rubro, clave), esperado in PLANILLA.items():
    total = suma(d[rubro], clave)
    if total != esperado:
        errores.append(f"{rubro}.{clave}: suma {total} != planilla {esperado}")
n = d["nave"]
if n["porticos"] != 5: errores.append("porticos != 5")
if abs(n["separacion_m"] * (n["porticos"] - 1) - 20.48) > 0.01: errores.append("vano total != 20,48")
dados = d["cimentacion"]["dados_por_nave"]["cant"]
if dados != 2 * n["porticos"]: errores.append("dados != 2 x porticos")
if d["cimentacion"]["riostres_por_nave"]["cant"] != n["porticos"]: errores.append("riostres != porticos")
if abs(d["cimentacion"]["riostres_por_nave"]["long_m"] - n["distancia_columnas_m"]) > 0.01: errores.append("riostre != distancia columnas")
if errores:
    print("FALLAS:"); [print(" -", e) for e in errores]; sys.exit(1)
print("OK: cantidades coinciden con planilla y geometría medida")
