# Directorio AWS LATAM Builders

Directorio de AWS Community Builders y Heroes en Latinoamerica.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: AWS Lambda (Python)
- Base de datos: DynamoDB
- Infraestructura: AWS CDK
- Hosting: S3 + CloudFront
- Email: AWS SES
- Seguridad: AWS WAF

## Requisitos

- Python 3.9+
- Node.js 18+
- AWS CLI configurado
- AWS CDK CLI (`npm install -g aws-cdk`)

## Setup

1. Instalar dependencias:
```bash
pip install -r requirements.txt
cd frontend && npm install
```

2. Desplegar infraestructura:
```bash
CDK_DEFAULT_ACCOUNT=TU_ACCOUNT_ID CDK_DEFAULT_REGION=us-east-1 cdk deploy --app "python3 app.py"
```

3. Configurar frontend:
   - Copiar el `ApiEndpoint` del output de CDK
   - Crear `frontend/.env` basado en `frontend/.env.example`
   - Pegar la URL del API

4. Build y deploy del frontend:
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://TU_BUCKET_NAME --delete
```

5. Invalidar cache de CloudFront:
```bash
aws cloudfront create-invalidation --distribution-id TU_DISTRIBUTION_ID --paths "/*"
```

## Desarrollo local

```bash
cd frontend
npm run dev
```

## Estructura

```
app.py                  # CDK app entry point
infrastructure.py       # Stack de infraestructura CDK
lambda/
  main.py              # Lambda handler principal
  validators.py        # Validaciones de datos
  email_formatter.py   # Templates de email OTP
  session.py           # Manejo de sesiones
  bi_service.py        # Eventos de BI
  rate_limiter.py      # Rate limiting
  constants.py         # Constantes compartidas
frontend/
  src/
    App.jsx            # Aplicacion principal
    constants.js       # Constantes (tipos, categorias, paises)
```

## Contribuir

1. Fork el repositorio
2. Crea un branch (`git checkout -b feature/mi-mejora`)
3. Commit tus cambios
4. Push al branch
5. Abre un Pull Request
