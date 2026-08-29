# InventiGest — Sistema Web de Gestión de Inventario y Ventas[cite: 1]

**Autor:** Ragami Perez[cite: 1]

## Descripción del Proyecto
InventiGest es un sistema web que centraliza la gestión de inventario y ventas de una PyME[cite: 1]. El sistema sustituye el control manual en hojas de cálculo por una única fuente de datos consistente y consultable en tiempo real[cite: 1]. Permite registrar productos y existencias, procesar ventas descontando stock, controlar el acceso por roles y generar reportes[cite: 1].

## Arquitectura Base
El proyecto utiliza una estructura de Monorepo con dos aplicaciones: una API REST (Express) independiente y una SPA (React) que la consume[cite: 1]. 

El backend está diseñado bajo una arquitectura en capas[cite: 1]:
* **Presentación:** Interfaz de usuario sin reglas de negocio ni consultas directas a la base de datos[cite: 1].
* **Aplicación:** Orquesta casos de uso (como reservar una venta o reponer stock) y coordina el Dominio con la Infraestructura[cite: 1].
* **Dominio:** Contiene el núcleo del sistema, incluyendo las entidades (Producto, Venta, Usuario) y las reglas de negocio, manteniéndose independiente de la tecnología[cite: 1].
* **Datos / Infraestructura:** Persiste y recupera datos utilizando PostgreSQL e implementa los contratos definidos en el Dominio[cite: 1].

## Decisiones Arquitectónicas Justificadas
1. **Base de datos relacional transaccional (PostgreSQL):** Se utiliza para registrar las ventas dentro de una transacción atómica, garantizando la consistencia e integridad del inventario[cite: 1].
2. **API REST desacoplada del frontend:** Permite desplegar y escalar el frontend y el backend por separado, flexibilizando el sistema y facilitando la futura integración de una aplicación móvil[cite: 1].
3. **Repositorios detrás de interfaces (DIP):** El Dominio define interfaces (como IProductoRepository o IVentaRepository) que la Infraestructura implementa e inyecta, garantizando un bajo acoplamiento con la tecnología de base de datos[cite: 1].