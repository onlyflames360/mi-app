
-- Tabla de Usuarios
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    rol TEXT DEFAULT 'usuario',
    activo BOOLEAN DEFAULT true,
    genero TEXT,
    avatar_seed TEXT,
    avatar_url TEXT,
    skills JSONB DEFAULT '[]'
);

-- Tabla de Turnos (Shifts)
CREATE TABLE shifts (
    id TEXT PRIMARY KEY,
    fecha DATE NOT NULL,
    inicio TEXT NOT NULL,
    fin TEXT NOT NULL,
    lugar TEXT NOT NULL,
    franja TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    asignado_a TEXT REFERENCES users(id) ON DELETE CASCADE,
    motivo_rechazo TEXT
);

-- Tabla de Disponibilidades
CREATE TABLE availabilities (
    id_usuario TEXT REFERENCES users(id) ON DELETE CASCADE,
    mes TEXT NOT NULL,
    semanas JSONB NOT NULL,
    estado TEXT DEFAULT 'borrador',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_usuario, mes)
);

-- Tabla de Notificaciones
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    color TEXT DEFAULT 'normal',
    ref_turno_id TEXT,
    destinatarios JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    leida BOOLEAN DEFAULT false
);

-- Insertar Usuario Coordinador Inicial (Contraseña: 1914 se maneja en el front)
INSERT INTO users (id, nombre, apellidos, rol, activo, genero)
VALUES ('admin-1', 'Coordinador', 'Barbera', 'coordinador', true, 'masculino');
