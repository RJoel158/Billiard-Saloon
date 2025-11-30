
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_active TINYINT NOT NULL DEFAULT 1
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE table_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL
);


CREATE TABLE billiard_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1=available,2=occupied,3=maintenance',
    FOREIGN KEY (category_id) REFERENCES table_categories(id)
);


CREATE TABLE dynamic_pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    type TINYINT NOT NULL COMMENT '1=peak_hour,2=weekend,3=high_demand,4=promotion,5=event',
    percentage DECIMAL(5,2) NOT NULL,
    time_start TIME NULL,
    time_end TIME NULL,
    weekday TINYINT NULL COMMENT '1=Mon ... 7=Sun',
    date_start DATE NULL,
    date_end DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES table_categories(id)
);


CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    table_id INT NOT NULL,
    reservation_date DATETIME NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1=pending,2=confirmed,3=cancelled,4=expired',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (table_id) REFERENCES billiard_tables(id)
);

CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    reservation_id INT NULL,
    table_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    session_type TINYINT NOT NULL COMMENT '1=reservation,2=walk_in',
    final_cost DECIMAL(10,2) DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1=active,2=closed,3=cancelled',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (table_id) REFERENCES billiard_tables(id)
);


CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method TINYINT NOT NULL COMMENT '1=cash,2=card,3=qr,4=other',
    is_active TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);





