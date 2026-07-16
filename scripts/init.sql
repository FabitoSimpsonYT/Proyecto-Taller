
-- Crear tabla de usuarios (Sólo Administradores)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de buses (Contiene datos del dueño y chofer embebidos)
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patente VARCHAR(20) UNIQUE NOT NULL,
    marca_carroceria VARCHAR(100),
    modelo_carroceria VARCHAR(100),
    marca_chasis VARCHAR(100),
    modelo_chasis VARCHAR(100),
    ano_fabricacion INT,
    
    owner_rut VARCHAR(20) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    owner_email VARCHAR(100) NOT NULL,
    owner_phone VARCHAR(20),
    
    driver_rut VARCHAR(20),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    
    reservation_date DATETIME, -- Fecha y hora para la cual se reservó la atención
    status ENUM('pending', 'in_process', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de inspecciones (Worklist de revisión técnica)
CREATE TABLE IF NOT EXISTS inspections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    inspector_id INT NOT NULL, -- El admin que realizó la inspección
    items JSON NOT NULL, -- [{ item_name: 'Luces', status: 'pass'|'fail'|'pending' }]
    exams_notes TEXT,
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar un administrador por defecto para pruebas
INSERT IGNORE INTO users (full_name, email, password, role) VALUES 
('Administrador Taller', 'administrador@gmail.com', '$2a$10$lsa7jjcY6MC.qNm2LQ1uDuJGmSCHZnEgrkV5dqLYWVYdiI7UowvDy', 'admin'); 
-- pass: admin123

-- Crear tabla de reparaciones
CREATE TABLE IF NOT EXISTS repairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    mechanic_id INT NOT NULL,
    description TEXT NOT NULL,
    repuestos_utilizados JSON, -- [{ repuesto: 'Filtro', cantidad: 1, costo: 15000 }]
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    repair_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (mechanic_id) REFERENCES users(id) ON DELETE CASCADE
);
