import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY no está configurado. Los emails no se enviarán.');
}

export const resend = new Resend(process.env.RESEND_API_KEY || '');

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
