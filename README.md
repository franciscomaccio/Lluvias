# Lluvias

Registro personal de mm de lluvia, con el historial público y la carga de
registros protegida con login (Supabase Auth).

## 1. Proyecto en Supabase (ya creado)

El proyecto **Lluvias** ya está creado en tu organización de Supabase
(región São Paulo, plan free) y la tabla `rain_entries` ya tiene aplicado
el esquema de [`supabase/schema.sql`](supabase/schema.sql): lectura
pública, escritura solo para usuarios autenticados. `config.js` en este
repo ya tiene la URL y la anon key de ese proyecto. La anon key es segura
para publicar: solo sirve para leer/escribir a través de las políticas de
RLS del paso anterior, no da acceso administrativo.

Te falta un solo paso manual, porque requiere tu contraseña y no puede
hacerse desde acá:

1. Entrá al [dashboard de Supabase](https://supabase.com/dashboard),
   proyecto **Lluvias**.
2. Andá a **Authentication > Users** > **Add user** y creá tu propio
   usuario (tu email + una contraseña). Ese va a ser tu login para cargar
   registros.
3. Opcional pero recomendado: en **Authentication > Settings**, desactivá
   **"Allow new users to sign up"**. Esta app no tiene pantalla de
   registro a propósito: la idea es que exista un único usuario, vos.

## 2. Configurar el proyecto local

`config.js` ya está creado con la URL y la anon key del proyecto. Si
alguna vez necesitás recrearlo (por ejemplo en otra máquina), copiá
`config.example.js` a `config.js` y completá los valores desde
**Project Settings > API** en el dashboard de Supabase.

## 3. Correrlo localmente

Los módulos y `fetch` de Supabase necesitan que la página se sirva por
`http://`, no abierta directo como archivo. Cualquiera de estas opciones
sirve:

```bash
npx serve .
# o
python -m http.server 8000
```

Después abrí `http://localhost:3000` (o el puerto que te indique) en el
navegador.

## Cómo funciona

- **Historial, gráfico mensual y estadísticas**: visibles para cualquiera
  que abra la página, sin login.
- **Cargar, editar o eliminar un registro**: requiere iniciar sesión con el
  usuario que creaste en el paso 1. Sin sesión iniciada, la app solo
  muestra el formulario de login.
- Los datos se guardan en la tabla `rain_entries` de tu proyecto de
  Supabase y se actualizan en tiempo real si tenés la página abierta en más
  de un dispositivo.

## Publicada online

El sitio está publicado con GitHub Pages en
**https://franciscomaccio.github.io/Lluvias/**, servido directo desde la
rama `master`. Cualquier push a `master` (o el merge de un PR) actualiza
el sitio en un par de minutos.
