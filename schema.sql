CREATE DATABASE GDPR;

USE GDPR;

CREATE TABLE users (
    id int AUTO_INCREMENT PRIMARY KEY,
    first_name varchar(50) NOT NULL,
    last_name varchar(50) NOT NULL,
    username varchar(50) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL
);