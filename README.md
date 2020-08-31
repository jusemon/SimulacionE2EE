# Simulación E2EE
Demostración de cifrado end-to-end mediante el desarrollo de un chat

El presente proyecto fue desarrollado como ejemplo con el proposito de demostrar la implementación de cifrado de extremo a extremo, el proyecto fue desarrollado con .NET Core y Angular 7, usando RSA para cifrar los mensajes del chat en cada extremo, el proceso de cifrado se realiza en Angular para evitar centralizar las claves privadas.

El proyecto fue desarrollado por: 
- Juan Daniel Colorado Molina
- Juan Sebastián Montoya
- Sebastián Camilo Cortés Gómez

Para la Fundación Universitaria Católica del Norte, Electiva III - Criptografía.

Instrucciones de instalación y ejecución:

El proyecto requiere .net core instalado en el computador, se debe compilar y ejecutar, puede ser desde linea de comandos o con la ayuda de Visual Studio

- Se ejecuta el proyecto.
- Se abrirá una ventana, normalmente con la url localhost:5000
- Abrimos otra ventana en privado u otro navegador apuntando a la misma url que se abrió al ejecutar el proyecto, este proceso se puede repetir para obtener más usuarios concurrentes.
- Se puede ver una pantalla donde a la izquierda se encuentran la lista de usuarios disponibles con los cuales chatear.
- Click en cualquiera de esos usuarios y se podrá chatear en tiempo real, si se examinan las peticiones se notará que la comunicación es cifrada

¿Cómo se logró?

- Cuando se abre una ventana se genera un usuario aleatorio con su propio nombre, clave pública y clave privada (ver app.component.ts, líneas 33, 34 y 35)
- El sistema inmediatamente envía el nombre del usuario al servidor, para así mostrar este usuario a los demás disponibles
- El usuario da click sobre cualquiera de los demás usuarios disponibles, esta acción activa un evento donde se comparte la clave pública entre ambos usuarios (ver ChatHub.cs, líneas 33 y 34)
- Se reciben las respectivas claves públicas y se almacenan localmente (ver app.component.ts, líneas 101 al 111)
- Ahora la comunicación es segura, internamente cada usuario antes de enviar un mensaje lo cifra con la clave pública del destinatario (ver app.component.ts, línea 148)
- Cuando el destinatario recibe el mensaje, este es decifrado con su clave privada (ver app.component.ts, línea 74)
