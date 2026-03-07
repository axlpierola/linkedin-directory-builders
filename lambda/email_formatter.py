def format_otp_email(email, otp_code):
    """Format the OTP verification email.

    Returns a dict with ``subject``, ``body_html``, and ``body_text``.
    """
    subject = "Builders Directory - Your Verification Code"

    body_text = (
        f"Your Builders Directory verification code is: {otp_code}\n\n"
        "This code expires in 10 minutes.\n\n"
        "Do not share this code with anyone. "
        "If you did not request this code, please ignore this email."
    )

    body_html = f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f4f4f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background-color:#232f3e;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;">Builders Directory</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 24px;">
            <p style="margin:0 0 16px;font-size:16px;color:#333333;">
              Here is your verification code:
            </p>
            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;font-size:36px;font-weight:bold;letter-spacing:8px;color:#232f3e;background:#f0f0f0;padding:16px 32px;border-radius:8px;">
                {otp_code}
              </span>
            </div>
            <p style="margin:0 0 16px;font-size:14px;color:#555555;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            <p style="margin:0;font-size:14px;color:#cc0000;font-weight:bold;">
              Do not share this code with anyone.
            </p>
            <p style="margin:16px 0 0;font-size:13px;color:#888888;">
              If you did not request this code, please ignore this email.
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
