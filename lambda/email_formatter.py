def format_otp_email(email, otp_code):
    """Format the OTP verification email.

    Returns a dict with ``subject``, ``body_html``, and ``body_text``.
    """
    subject = "Directorio AWS LATAM - Codigo de verificacion"

    body_text = (
        f"Tu codigo de verificacion es: {otp_code}\n\n"
        "Este codigo expira en 10 minutos.\n\n"
        "No compartas este codigo con nadie. "
        "Si no solicitaste este codigo, ignora este correo."
    )

    body_html = f"""<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:48px 16px;">
    <tr><td align="center">
      <table width="440" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 20px;text-align:center;border-bottom:1px solid #f3f4f6;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="width:28px;height:28px;background:#ea580c;border-radius:6px;text-align:center;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:14px;line-height:28px;">&#9650;</span>
                </td>
                <td style="padding-left:10px;font-size:16px;font-weight:700;color:#111827;letter-spacing:-0.3px;">
                  Directorio AWS LATAM
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 28px;">
            <p style="margin:0 0 6px;font-size:20px;font-weight:600;color:#111827;">
              Codigo de verificacion
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.5;">
              Usa el siguiente codigo para verificar tu identidad. Es valido por 10 minutos.
            </p>

            <!-- OTP Code -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td align="center">
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 24px;display:inline-block;">
                    <span style="font-size:32px;font-weight:700;color:#111827;font-family:'SF Mono',Monaco,Consolas,monospace;letter-spacing:12px;">{otp_code}</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Warning -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
              <tr>
                <td style="padding:12px 16px;">
                  <p style="margin:0;font-size:13px;color:#991b1b;font-weight:500;">
                    No compartas este codigo con nadie.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
              Si no solicitaste este codigo, ignora este correo.
            </p>
            <p style="margin:0;font-size:11px;color:#d1d5db;">
              awsbuilder.dev
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    return {
        "subject": subject,
        "body_html": body_html,
        "body_text": body_text,
    }
