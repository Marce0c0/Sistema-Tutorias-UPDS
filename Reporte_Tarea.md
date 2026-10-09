# Trabajo Práctico: Mi Primera Aplicación Web Moderna

**Materia:** Tecnología Web II  
**Estudiante:** Sammy Marcelo Sivila Sanchez  
**Proyecto:** Sistema de Tutorías y Cursos Universitarios  

---

## 1. ¿De qué trata mi proyecto?
Para esta materia decidí trabajar en un **Sistema de Tutorías y Cursos Universitarios**. La idea principal es tener una plataforma donde los estudiantes puedan reservar horarios de tutorías y organizar sus cursos de la universidad de una manera mucho más fácil.

Algunas de las cosas que quiero incluir en el sistema son:
- Un calendario para reservar tutorías (individuales o grupales) en tiempo real.
- Diferentes tipos de usuarios (estudiantes, tutores y administradores).
- Un módulo para ver todos los cursos, docentes asignados y material de estudio.
- Foros por materia para que los alumnos puedan sacar sus dudas.
- Notificaciones para que nadie se olvide de sus clases.

## 2. Desarrollo del Servidor
Para esta primera tarea, preparé el entorno de trabajo y levanté mi primer servidor usando **Node.js** y la librería **Express**. 

Creé un archivo `server.js` que se ejecuta en el puerto `3000` de mi computadora (`localhost`), y le configuré las siguientes rutas personalizadas relacionadas con la temática de mi proyecto:

- **Ruta principal (`/`):** Imprime en pantalla *"Bienvenido al Sistema de Tutorías y Cursos Universitarios"*.
- **Ruta de información (`/info`):** Explica de qué trata la plataforma: *"Este es un sistema web diseñado para gestionar reservas de tutorías..."*.
- **Ruta de contacto (`/contacto`):** Muestra el correo *"contacto@tutorias-universidad.edu"*.
- **Ruta principal del sistema (`/cursos`):** Imprime *"Módulo de cursos"*.

*(Nota para Word: Aquí puedes pegar un par de capturas de tu navegador y tu Visual Studio Code)*

## 3. Repositorio en GitHub
Todo mi código, incluyendo la estructura de carpetas (`backend` y `frontend`), el archivo `.gitignore` y el `README.md`, ya está bajo control de versiones con **Git**.

Trabajé creando la rama `develop` además de la principal, y ya subí todo el proyecto a mi repositorio personal en GitHub. El enlace para revisar mi avance es el siguiente:
👉 [https://github.com/Marce0c0/Sistema-Tutorias-UPDS](https://github.com/Marce0c0/Sistema-Tutorias-UPDS)

---

## 4. Cuestionario Teórico

**1. ¿Qué es Node.js?**
Es un entorno que nos permite correr JavaScript directamente en nuestra computadora (fuera del navegador web). Lo usamos un montón para crear el backend de nuestras aplicaciones.

**2. ¿Qué es Express?**
Es una herramienta o "framework" para Node.js que nos hace la vida mucho más fácil al momento de levantar un servidor y crear rutas sin tener que escribir tanto código desde cero.

**3. ¿Qué es un servidor?**
Es básicamente un programa que se queda "escuchando" peticiones. Cuando el navegador o alguien le pide algo (un request), hace su trabajo y devuelve una respuesta.

**4. ¿Qué es localhost?**
Es la forma en que le decimos a la computadora que se conecte a sí misma. Significa que el servidor está corriendo localmente en nuestra propia máquina y no en internet.

**5. ¿Qué es una ruta?**
Es la dirección o URL a la que entramos para pedirle algo específico a nuestra aplicación (como por ejemplo `/cursos` o `/contacto`).

**6. ¿Qué es Git?**
Es un programa que nos ayuda a guardar el historial de cambios de nuestro código. Es como ir tomándole "fotos" al proyecto para saber qué hicimos y no perder nada.

**7. ¿Qué es GitHub?**
Es una plataforma web donde podemos subir y guardar esos historiales de Git en la nube. Nos sirve como portafolio y para trabajar en equipo.

**8. Explica qué sucede cuando escribes `http://localhost:3000`**
Cuando pongo esa dirección en mi navegador, este le manda una petición al servidor que yo acabo de encender en mi computadora en el puerto 3000. El servidor recibe la orden, busca qué código le dijimos que ejecute para esa ruta vacía (`/`) y me devuelve el texto en la pantalla para que yo lo lea.
