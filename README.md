# Directorio AWS LATAM Builders

Directorio abierto de AWS Community Builders y Heroes en Latinoamerica. Permite a los miembros de la comunidad registrar su perfil, sincronizar datos desde LinkedIn y conectar con otros builders de la region.

Sitio en produccion: [awsbuilder.dev](https://awsbuilder.dev)

## Funcionalidades

### Registro y autenticacion
- Verificacion por email con codigo OTP (via Amazon SES)
- Sesiones con token temporal
- Flujo: email > OTP > formulario de edicion

### Perfiles
- Sincronizacion automatica de datos desde LinkedIn (nombre, foto, empresa)
- Resincronizacion manual de foto desde LinkedIn
- Resincronizacion automatica diaria de fotos (4:00 AM UTC via EventBridge + SQS)
- Vista previa del perfil antes de publicar
- Edicion de perfil con re-verificacion de identidad

### Directorio
- Busqueda por nombre
- Filtro por programa AWS (Community Builder, Hero)
- Filtro por categoria
- Filtro por pais (20 paises de LATAM)
- Paginacion

### Categorias soportadas
- **AWS Community Builder**: AI Engineering, Cloud Operations, Containers, Data, Dev Tools, Machine Learning, Networking & Content Delivery, Security, Serverless
- **AWS Hero**: AI, Community, Container, Data, DevTools, Security, Serverless

### Links sociales
LinkedIn, AWS Builder Center, GitHub, Twitter/X, Medium, Dev.to, YouTube, Website

### Otros
- Formulario de sugerencias y feedback
- Modo oscuro / claro
- Interfaz completamente en espanol

## Seguridad

- AWS WAF en CloudFront (rate limiting por IP)
- AWS WAF en API Gateway (rate limiting + AWS Managed Rules)
- Rate limiting por IP y por email en la API
- CORS restringido a dominios autorizados
- Autenticacion por sesion para endpoints protegidos
- Respuestas sanitizadas (sin datos sensibles)
- UUID en partition key para prevenir colisiones

## Resiliencia

- DynamoDB Point-in-Time Recovery (PITR) habilitado
- Lambda alias "live" para rollback inmediato
- CloudWatch Alarm: alerta por >= 3 errores en 5 minutos
- Notificaciones via SNS
- Tags en todos los recursos para trazabilidad de costos

## Ambientes

| | Produccion | Desarrollo |
|---|---|---|
| URL | awsbuilder.dev | dev.awsbuilder.dev |
| Stack CDK | SpaDirectoryStack | SpaDirectoryStackDev |

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | AWS Lambda (Python 3.9) |
| Base de datos | Amazon DynamoDB |
| Hosting | Amazon S3 + CloudFront |
| Email | Amazon SES |
| Seguridad | AWS WAF (CloudFront + API Gateway) |
| Cola de mensajes | Amazon SQS |
| Scheduler | Amazon EventBridge |
| Monitoreo | CloudWatch Alarms + Amazon SNS |
| Infraestructura | AWS CDK (Python) |
| DNS | Amazon Route 53 |
| Certificado | AWS Certificate Manager |

## Estructura del proyecto

```
app.py                  # Entry point de CDK
infrastructure.py       # Stack completo (DynamoDB, Lambda, API GW, S3, CloudFront, WAF, SQS, EventBridge, SNS)
lambda/
  main.py              # Handler principal de la API
  validators.py        # Validaciones de datos
  email_formatter.py   # Template del email OTP
  session.py           # Manejo de sesiones
  bi_service.py        # Registro de eventos de BI
  rate_limiter.py      # Rate limiting por IP y email
  constants.py         # Constantes (tipos, categorias, paises)
frontend/
  src/
    App.jsx            # Aplicacion completa (SPA)
    constants.js       # Constantes del frontend
    main.jsx           # Entry point de React
    index.css          # Estilos base con Tailwind
```

## Setup local

```bash
# Backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cp .env.example .env
# Editar .env con tu API Gateway URL (variable VITE_API_URL)
npm run dev
```

## Deploy

```bash
# Infraestructura
source .venv/bin/activate
CDK_DEFAULT_ACCOUNT=TU_ACCOUNT CDK_DEFAULT_REGION=us-east-1 cdk deploy --app "python3 app.py" --require-approval never

# Frontend
cd frontend
VITE_API_URL=TU_API_URL npm run build
aws s3 sync dist/ s3://TU_BUCKET --delete
aws cloudfront create-invalidation --distribution-id TU_DIST_ID --paths "/*"
```

## Contribuir

1. Fork este repositorio
2. Crea un branch con tu mejora (`git checkout -b feature/mi-mejora`)
3. Haz commit de tus cambios
4. Abre un Pull Request

Toda contribucion es bienvenida. Si tienes ideas o encuentras bugs, abre un issue.

## Arquitectura

Este proyecto corre 100% en AWS con arquitectura serverless, sostenido por los creditos que brinda el programa AWS Community Builder.

```
Usuario -> CloudFront (WAF) -> S3 (SPA)
                |
                v
         API Gateway (WAF) -> Lambda (alias: live) -> DynamoDB
                                  |
                                  +-> SES (emails OTP)
                                  +-> SQS (photo resync queue)
                                  
EventBridge (cron 4AM UTC) -> Lambda -> SQS -> Lambda (resync fotos)

CloudWatch Alarm -> SNS -> Email
```

## Licencia

MIT
