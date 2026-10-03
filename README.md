# InventiGest — Sistema Web de Gestión de Inventario y Ventas

Proyecto Integrador · Arquitectura de Software · Hito II (II Parcial)
Autor: Ragami Perez

Sistema web para centralizar la gestión de inventario y ventas de una PyME: registro de productos y existencias, ventas con descuento automático de stock, control de acceso por roles y reportes básicos.

## Arquitectura

Cuatro capas. Las dependencias apuntan hacia el Dominio: Infraestructura implementa los contratos que el Dominio define (DIP).

```
Presentación ──> Aplicación ──> Dominio <── Infraestructura ──> PostgreSQL
```

| Capa | Carpeta (`backend/src/`) | Responsabilidad |
|---|---|---|
| Presentación | `presentation/` | Rutas Express, autenticación por token y roles, traducción de errores a HTTP. Sin SQL ni reglas de negocio. |
| Aplicación | `application/services`, `dtos`, `interfaces` | Orquesta los casos de uso con DTO de entrada y salida. |
| Dominio | `domain/entities`, `rules`, `interfaces`, `errors.js` | Entidades con estado encapsulado, reglas de negocio y contratos de repositorios. |
| Infraestructura | `infrastructure/repositories`, `database`, `services` | Repositorios PostgreSQL con `pg`, bcrypt + JWT y notificador. |

`compositionRoot.js` es el único lugar donde se conectan las implementaciones con los contratos.

### Casos de uso implementados
1. Registrar producto (admin)
2. Consultar productos, con búsqueda por nombre o código
3. Actualizar stock (admin)
4. Registrar venta, con descuento de stock, descuento por volumen y transacción
5. Consultar ventas y su detalle
6. Iniciar sesión (JWT) y reporte de resumen (admin)

### Reglas de negocio (Dominio)
- Precio mayor que cero, stock y stock mínimo enteros no negativos (`Producto`).
- El stock nunca queda negativo; la venta falla completa si algún producto no alcanza (`ReglasStock`, `Venta.crear`).
- Descuento por volumen: 5 % si el subtotal llega a 1000 y 10 % si llega a 5000 (`ReglasVenta`).
- Las líneas repetidas de un mismo producto se consolidan; las cantidades deben ser enteros positivos.
- Alerta de stock bajo cuando el stock es menor o igual al mínimo (`INotificacionService`).

### Principios de diseño aplicados
- **SRP:** cada servicio cubre un caso de uso, y las reglas viven en clases propias (`ReglasStock`, `ReglasVenta`).
- **DIP:** los servicios dependen de `IProductoRepository`, `IVentaRepository`, `IUsuarioRepository`, `INotificacionService` e `IAutenticador`, no de PostgreSQL ni de bcrypt.
- **OCP:** cambiar el notificador (consola a correo) o la base de datos no modifica Dominio ni Aplicación.

## Base de datos (PostgreSQL)

Scripts en `Database/`, para ejecutar en orden:

```
01_Crear_Base_Datos.sql      -- CREATE DATABASE inventigest
02_Crear_Tablas.sql          -- tablas, PK, FK y restricciones CHECK
03_Datos_Prueba.sql          -- usuarios y productos de prueba
04_Consultas_Verificacion.sql
```

Tablas: `usuarios`, `productos`, `ventas`, `detalle_venta`. Los usuarios de demostración y sus contraseñas están documentados en el encabezado de `03_Datos_Prueba.sql`.

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior y PostgreSQL.

```bash
# 1. Base de datos
psql -U postgres -f Database/01_Crear_Base_Datos.sql
psql -U postgres -d inventigest -f Database/02_Crear_Tablas.sql
psql -U postgres -d inventigest -f Database/03_Datos_Prueba.sql

# 2. Backend (copiar backend/.env.example a backend/.env y completarlo)
cd backend
npm install
npm start          # http://localhost:3000

# 3. Frontend, en otra terminal
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Pruebas

```bash
cd backend
npm test
```

Las 23 pruebas recorren las cuatro capas: caso correcto, datos inválidos (por ejemplo, producto con precio -50), reglas de negocio, persistencia, permisos por rol y reversión de la transacción cuando falta stock. Usan una base PostgreSQL en memoria (`pg-mem`) creada con los mismos scripts de `Database/`.

## Tecnología
- Frontend: React + Vite
- Backend: Node.js + Express 5 (API REST)
- Base de datos: PostgreSQL
- Autenticación: JWT + bcrypt

## Limitaciones conocidas
- La alerta de stock bajo se registra en la consola del servidor; el envío por correo queda para el siguiente hito.
- No hay límite de intentos de inicio de sesión.
