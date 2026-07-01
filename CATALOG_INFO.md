# ChinaBuyHub — Catálogo: Estado y Mantenimiento

**Última actualización:** 2026-06-25  
**Total productos:** 9,829  
**Productos con imagen válida:** 9,829 (100%)  
**Descripciones SEO:** 9,829 (100%)

---

## Categorías

| Categoría | Count | Contenido |
|-----------|-------|-----------|
| T-SHIRTS | 3,144 | Camisetas, polos, jerseys, longsleeves |
| ACCESSORIES | 1,679 | Cinturones, gafas, relojes, joyería, sets, legos, perfumes |
| SNEAKERS | 1,520 | Zapatillas, botas, sandalias (sin tacones) |
| HOODIES | 938 | Hoodies, sweatshirts, crewnecks, sweaters |
| PANTS | 749 | Jeans, joggers, sweatpants, trousers |
| JACKETS | 624 | Chaquetas, abrigos, puffers, parkas, blazers |
| SHORTS | 351 | Shorts, bermudas |
| WOMAN | 320 | Vestidos (264), faldas (25), tacones (18), bikinis (6), bras (3) |
| BAGS | 313 | Mochilas, totes, bolsos, carteras |
| CAPS | 96 | Gorras, beanies, sombreros |
| ELECTRONICS | 95 | Fundas, gadgets, auriculares |

---

## Género (clasificación por IA)

| Género | Count |
|--------|-------|
| Unisex | ~9,200 |
| Women | ~500 |
| Men | ~400 |

**Pendiente:** ~2,717 productos de ropa/zapatillas por clasificar (límite diario de Groq alcanzado hoy — **~99K/100K tokens usados**).  
**Procesados hoy:** +1,300 (total acumulado: 4,520).  
**Reanudar mañana:** `node scripts/ai-gender-text.mjs`

---

## Scripts de mantenimiento

### 1. Clasificador de género por IA (texto)
```bash
node scripts/ai-gender-text.mjs
```
- Clasifica `men`/`women`/`unisex` por nombre y descripción
- Modelo: Groq llama-3.3-70b-versatile
- Procesa 20 productos por lote, guarda progreso automático
- **Ejecutar diariamente** hasta completar los 4,106 restantes
- Log: `scripts/ai-gender-text-log.json`

### 2. Clasificador de género por IA (visión — más lento)
```bash
node scripts/ai-gender-sneakers.mjs
```
- Analiza la IMAGEN del producto para clasificar género
- Modelo: Groq llama-4-scout-17b-16e (visión)
- Útil para zapatillas donde el nombre no revela el género
- **MUY lento** en tier gratuito (~1 lote/minuto). Usar solo si el de texto no basta.
- Log: `scripts/ai-gender-log.json`

### 3. Clasificador de categorías por IA (visión)
```bash
node scripts/ai-catalog-cleaner.mjs
```
- Analiza la IMAGEN para verificar/ corregir la categoría
- Escanea keywords primero, luego usa IA visión para confirmar
- Log: `scripts/ai-catalog-cleaner-log.json`

### 4. Mantenimiento general del catálogo
```bash
node scripts/fix-catalog.mjs
```
- Mueve relojes de ELECTRONICS → ACCESSORIES
- Mueve productos de peluquería a ACCESSORIES
- Aplica gender tags por keywords básicas
- Sincroniza `subcategory` con `category`
- Crea backup en `products_backup.js`

### 6. Generador de descripciones (plantillas — sin API)
```bash
node scripts/desc-generator.mjs
```
- Genera descripciones SEO variadas con +5 plantillas por categoría
- Detecta y corrige placeholders sin reemplazar (`{Quality}`, `{Brand}`)
- No usa API — instantáneo
- Ideal para regenerar tras cambios masivos de categoría

### 7. Generador de descripciones (IA — con API)
```bash
node scripts/ai-desc-generator.mjs
```
- Usa Groq llama-3.3-70b para descripciones ultra-personalizadas
- 15 productos por lote, resumible
- **Requiere tokens disponibles** (límite diario 100K)
- Log: `scripts/ai-desc-log.json`
```bash
php cron-featured.php
```
- Regenera `featured.json` con 5 productos rotativos

---

## Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `products.js` | Base de datos (9,829 productos, 6.7 MB) |
| `products_backup.js` | Backup automático antes de cada cambio |
| `featured.json` | 5 productos destacados (rota cada 12h) |
| `catalog.html` | Página del catálogo con filtros y búsqueda |
| `js/catalog-app.js` | Lógica del catálogo (Fuse.js, paginación, likes) |
| `ai-config.php` | API key de Groq (no compartir) |

---

## Cambios realizados (2026-06-25)

1. **+700 recategorizaciones** con heurísticas de keywords:
   - ~43 Alo Pants de ACCESSORIES → PANTS
   - ~20 Number Nine shirts de ACCESSORIES → T-SHIRTS
   - ~66 Zara Dresses de T-SHIRTS → WOMAN
   - ~121 camisetas long sleeve de PANTS → T-SHIRTS
   - ~18 Alo Coats → JACKETS
   - ~35 Alo Long Tees → T-SHIRTS

2. **105 productos eliminados** por imágenes rotas (`resources/cellImage_*.jpg` sin URL de CDN)

3. **WOMAN expandido** de 17 → 320 productos:
   - +264 vestidos (Zara, Skims, Princess Polly, Lululemon)
   - +25 faldas (Alo, Lululemon, Vivienne Westwood)
   - +18 tacones (YSL, Dior, Valentino, Prada, Gucci)
   - +6 bikinis, +3 bras

4. **3,220 productos clasificados por género** con IA de texto

5. **Corrección de falsos positivos** (Jordan "Top", "Boot Cut Jeans", Nike Blazer, etc.)

---

## Notas

- Las imágenes están alojadas en CDNs externos (`si.geilicdn.com`, `postimg.cc`, `asmrhauler.com`). Si alguna se rompe, no hay backup local.
- El límite diario de Groq es 100K tokens. El clasificador de texto procesa ~40 productos/minuto consumiendo ~1-2K tokens por lote.
- Para forzar una regeneración completa del log de género, borrar `scripts/ai-gender-text-log.json`.
