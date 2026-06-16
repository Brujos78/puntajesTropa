# Sistema Tropa 78 con MongoDB

Proyecto inicial completo para puntajes de la Tropa 78 Escazú.

## Incluye

- Un solo login de dirigente.
- Modo scout de solo lectura.
- Patrullas dinámicas por nombre y color.
- Actividades dinámicas.
- Puntajes por patrulla.
- Guardado de reuniones en MongoDB.
- Bitácora histórica.
- Reporte mensual.
- Reporte anual.
- Exportación CSV.
- Envío de ranking por WhatsApp.

## Instalación local

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Crear archivo .env

Windows:

```bash
copy .env.example .env
```

Mac/Linux:

```bash
cp .env.example .env
```

### 3. Verificar MongoDB

Debe estar corriendo localmente en:

```text
mongodb://127.0.0.1:27017
```

Si usas MongoDB Atlas, cambia `MONGODB_URI` en `.env`.

### 4. Crear usuario y patrullas iniciales

```bash
npm run seed
```

Credenciales por defecto:

```text
Usuario: dirigente
Contraseña: 7878
```

### 5. Ejecutar servidor

```bash
npm start
```

Abrir:

```text
http://localhost:3000
```

## Estructura

```text
Tropa78_Sistema_MongoDB/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── index.html
    ├── css/
    └── js/
```

## Nota

No migra datos anteriores de localStorage. Es una base limpia conectada a MongoDB.
