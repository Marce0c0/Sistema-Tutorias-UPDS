const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Bienvenido al Sistema de Tutorías y Cursos Universitarios");
});

app.get("/info", (req, res) => {
  res.send("Este es un sistema web diseñado para gestionar reservas de tutorías y organizar cursos universitarios.");
});

app.get("/contacto", (req, res) => {
  res.send("Correo: contacto@tutorias-universidad.edu");
});

app.get("/cursos", (req, res) => {
  res.send("Módulo de cursos");
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
