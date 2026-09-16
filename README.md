# Pluviómetro

Registro personal de mm de lluvia, con el historial público y la carga de
registros protegida con login (Supabase Auth).

## 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com), creá una cuenta si no tenés,
   y creá un proyecto nuevo (plan free).
2. Andá a **SQL Editor** > **New query**, pegá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo. Esto crea la
   tabla `rain_entries` con lectura pública y escritura solo para usuarios
   autenticados.
3. Andá a **Authentication > Providers** y confirmá que **Email** esté
   habilitado (viene activado por defecto).
4. Andá a **Authentication > Settings** y desactivá **"Allow new users to
   sign up"** (o equivalente según la versión del dashboard). Esta app no
   tiene pantalla de registro a propósito: la idea es que exista un único
   usuario, vos.
5. Andá a **Authentication > Users** > **Add user** y create tu propio
   usuario (tu email + una contraseña). Ese va a ser tu login.
6. Andá a **Project Settings > API** y copiá:
   - **Project URL**
   - **anon public key**

## 2. Configurar el proyecto local

```bash
cp config.example.js config.js
```

Abrí `config.js` y pegá la URL y la clave anónima que copiaste en el paso
anterior. Este archivo no se sube a git (está en `.gitignore`) porque es
específico de tu proyecto de Supabase.

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
  usuario que creaste en el paso 1.5. Sin sesión iniciada, la app solo
  muestra el formulario de login.
- Los datos se guardan en la tabla `rain_entries` de tu proyecto de
  Supabase y se actualizan en tiempo real si tenés la página abierta en más
  de un dispositivo.

## Publicar la web

Este proyecto es HTML/CSS/JS estático: se puede publicar en GitHub Pages,
Netlify, Vercel o cualquier hosting estático. Solo asegurate de subir
también un `config.js` con tus credenciales de Supabase en el servidor
(no lo sube git, así que lo tenés que crear ahí a mano o mediante variables
de entorno del hosting que armen ese archivo al build).
