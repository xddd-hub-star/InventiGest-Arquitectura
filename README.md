# InventiGest — Sistema Web de Gestión de Inventario y Ventas

Proyecto Integrador · Arquitectura de Software.

Sistema web para centralizar la gestión de inventario y ventas de una PyME: registro de productos y existencias, ventas con descuento automático de stock, control de acceso por roles y reportes básicos.

## Arquitectura
Arquitectura en cuatro capas: Presentación → Aplicación → Dominio → Infraestructura. Las reglas del negocio residen en el Dominio; la persistencia se comunica mediante interfaces/contratos (DIP).

## Tecnología
- Frontend: React (SPA)
- Backend: Node.js + Express (API REST)
- Base de datos: PostgreSQL
- Autenticación: JWT
