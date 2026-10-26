# ==============================================================================
# Dockerfile — Frontend SPA con Nginx Alpine (UPDS)
# Servidor web ligero, rápido y seguro para producción (Punto 10)
# ==============================================================================

FROM nginx:1.27-alpine

# Eliminar configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copiar la configuración personalizada con compresión gzip y headers seguros
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos de la aplicación SPA
COPY . /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
