-- Crear tabla de usuarios (Administradores y Mecánicos)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'mecanico') DEFAULT 'mecanico',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de personas (Dueños y Conductores)
CREATE TABLE IF NOT EXISTS personas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rut VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de buses
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patente VARCHAR(20) UNIQUE NOT NULL,
    marca_carroceria VARCHAR(100),
    modelo_carroceria VARCHAR(100),
    marca_chasis VARCHAR(100),
    modelo_chasis VARCHAR(100),
    ano_fabricacion INT,
    
    dueno_id INT NOT NULL,
    conductor_id INT,
    
    detalles_visuales JSON, -- ['Espejo roto', 'Pintura lado izquierdo']
    
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dueno_id) REFERENCES personas(id) ON DELETE RESTRICT,
    FOREIGN KEY (conductor_id) REFERENCES personas(id) ON DELETE SET NULL
);

-- Crear tabla de reservaciones
CREATE TABLE IF NOT EXISTS reservaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    fecha_reserva DATETIME NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE
);

-- Crear tabla de inspecciones (Worklist de revisión técnica)
CREATE TABLE IF NOT EXISTS inspecciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    inspector_id INT NOT NULL, -- El admin/mecánico que realizó la inspección
    items JSON NOT NULL, -- [{ nombre_item: 'Luces', estado: 'aprobado'|'rechazado'|'pendiente' }]
    notas_examen TEXT,
    fecha_inspeccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Insertar un administrador por defecto para pruebas
INSERT IGNORE INTO usuarios (nombre_completo, rut, correo, contrasena, rol) VALUES 
('Administrador Taller', '12345678-9', 'administrador@gmail.com', '$2a$10$lsa7jjcY6MC.qNm2LQ1uDuJGmSCHZnEgrkV5dqLYWVYdiI7UowvDy', 'admin'); 
-- pass: admin123

-- Crear tabla de reparaciones
CREATE TABLE IF NOT EXISTS reparaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    mecanico_id INT NOT NULL,
    descripcion TEXT NOT NULL,
    repuestos_utilizados JSON, -- [{ repuesto: 'Filtro', cantidad: 1, costo: 15000 }]
    estado ENUM('en_proceso', 'completado') DEFAULT 'en_proceso',
    fecha_reparacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (mecanico_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
