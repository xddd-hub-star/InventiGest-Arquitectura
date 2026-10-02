-- InventiGest · Paso 2: tablas, claves y restricciones (ejecutar conectado a "inventigest")
-- psql -U postgres -d inventigest -f Database/02_Crear_Tablas.sql

CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'vendedor')),
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE productos (
    id           SERIAL PRIMARY KEY,
    codigo       VARCHAR(30)    NOT NULL UNIQUE,
    nombre       VARCHAR(120)   NOT NULL,
    precio       NUMERIC(10, 2) NOT NULL CHECK (precio > 0),
    stock        INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER        NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
    activo       BOOLEAN        NOT NULL DEFAULT TRUE,
    creado_en    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE TABLE ventas (
    id         SERIAL PRIMARY KEY,
    usuario_id INTEGER        NOT NULL REFERENCES usuarios (id),
    fecha      TIMESTAMPTZ    NOT NULL DEFAULT now(),
    subtotal   NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    descuento  NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    total      NUMERIC(12, 2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE detalle_venta (
    id              SERIAL PRIMARY KEY,
    venta_id        INTEGER        NOT NULL REFERENCES ventas (id) ON DELETE CASCADE,
    producto_id     INTEGER        NOT NULL REFERENCES productos (id),
    cantidad        INTEGER        NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario > 0),
    subtotal        NUMERIC(12, 2) NOT NULL CHECK (subtotal > 0)
);

CREATE INDEX idx_ventas_fecha ON ventas (fecha);
CREATE INDEX idx_detalle_venta_venta ON detalle_venta (venta_id);
