import { Resend } from 'resend';

// Created on first use: `new Resend()` throws without an API key, which
// would break `next build` when RESEND_API_KEY is not set.
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

// Helper function para enviar emails con manejo de errores
export async function sendEmail({
  to,
  subject,
  react,
  from = 'Porkyrios <onboarding@resend.dev>', // Cambia esto cuando tengas dominio verificado
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
  from?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY no está configurado. Los emails no se enviarán.');
    return { success: false, error: new Error('RESEND_API_KEY no está configurado') };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, error };
    }

    console.log('✅ Email enviado exitosamente:', data?.id);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error inesperado enviando email:', error);
    return { success: false, error };
  }
}
