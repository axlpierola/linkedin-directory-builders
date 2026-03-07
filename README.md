# Directorio AWS LATAM Builders

Directorio abierto de AWS Community Builders y Heroes en Latinoamerica. Permite a los miembros de la comunidad registrar su perfil, sincronizar datos desde LinkedIn y conectar con otros builders de la region.

Sitio en produccion: [awsbuilder.dev](https://awsbuilder.dev)

## Que hace

- Registro de perfil con verificacion por email (OTP via SES)
- Sincronizacion automatica de datos desde LinkedIn (nombre, foto, empresa)
- Directorio con busqueda por nombre, programa AWS, categoria y pais
- Edicion de perfil con re-verificacion de identidad
- Formulario de sugerencias para feedback de la comunidad
- Modo oscuro / claro

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | AWS Lambda (Python 3.9) |
| Base de datos | Amazon DynamoDB |
| Hosting | Amazon S3 + CloudFront |
| Email | Amazon SES |
| Seguridad | AWS WAF |
| Infraestructura | AWS CDK |

## Estructura del proyecto

```
app.py                  # Entry point de CDK
infrastructure.py       # Definicion del stack (DynamoDB, Lambda, API GW, S3, CloudFront, WAF)
lambda/
  main.py              # Handler principal de la API
  validators.py        # Validaciones de datos
  email_formatter.py   # Template del email OTP
  session.py           # Manejo de sesiones
  bi_service.py        # Registro de eventos de BI
  rate_limiter.py      # Rate limiting por IP
  constants.py         # Constantes compartidas (tipos, categorias, paises)
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
# Editar .env con tu API Gateway URL
npm run dev
```

## Deploy

```bash
# Infraestructura
CDK_DEFAULT_ACCOUNT=TU_ACCOUNT CDK_DEFAULT_REGION=us-east-1 cdk deploy --app "python3 app.py"

# Frontend
cd frontend
npm run build
aws s3 sync dist/ s3://TU_BUCKET --delete
aws cloudfront create-invalidation --distribution-id TU_DIST_ID --paths "/*"
```

## Contribuir

1. Fork este repositorio
2. Crea un branch con tu mejora (`git checkout -b feature/mi-mejora`)
3. Haz commit de tus cambios
4. Abre un Pull Request

Toda contribucion es bienvenida. Si tienes ideas o encuentras bugs, abre un issue.

## Infraestructura

Este proyecto corre 100% en AWS, sostenido por los creditos que brinda el programa AWS Community Builder.

## Licencia

MIT
