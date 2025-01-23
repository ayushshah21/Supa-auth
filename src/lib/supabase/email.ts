import { supabase } from "./client";

interface EmailTemplate {
  id: string;
  name: string;
  subject_template: string;
  body_template: string;
}

interface SendEmailParams {
  ticketId: string;
  templateName: string;
  variables: Record<string, string>;
}

/**
 * Fetches an email template by name
 */
export const getEmailTemplate = async (
  templateName: string
): Promise<EmailTemplate | null> => {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("name", templateName)
    .single();

  if (error) {
    console.error("[email/getEmailTemplate] Error:", error);
    return null;
  }

  return data;
};

/**
 * Replaces template variables with actual values
 */
const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  return Object.entries(variables).reduce(
    (text, [key, value]) => text.replace(`{{${key}}}`, value),
    template
  );
};

/**
 * Sends an email using a template
 */
export const sendEmailNotification = async ({
  ticketId,
  templateName,
  variables,
}: SendEmailParams): Promise<boolean> => {
  try {
    // 1. Get and verify session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('[email/sendEmailNotification] Session check:', {
      hasSession: !!sessionData?.session,
      sessionError
    });

    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }

    if (!sessionData?.session) {
      throw new Error('No session available');
    }

    // 2. Get email template
    const template = await getEmailTemplate(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // 3. Replace variables in subject and body
    const subject = replaceTemplateVariables(template.subject_template, variables);
    const body = replaceTemplateVariables(template.body_template, variables);

    // 4. Call Edge Function
    console.log('[email/sendEmailNotification] Calling Edge Function:', {
      to: variables.customer_email,
      subject,
      bodyLength: body.length,
      ticketId
    });

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: variables.customer_email,
        subject,
        body,
        ticketId
      },
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`
      }
    });

    if (error) {
      console.error('[email/sendEmailNotification] Edge Function error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }

    console.log('[email/sendEmailNotification] Edge Function response:', data);

    // 5. Log the email attempt
    const { error: logError } = await supabase.from("email_logs").insert({
      ticket_id: ticketId,
      template_id: template.id,
      status: "SENT",
      recipient_email: variables.customer_email || "",
    });

    if (logError) {
      console.error('[email/sendEmailNotification] Error logging email:', logError);
    }

    return true;
  } catch (err) {
    const error = err as Error;
    console.error('[email/sendEmailNotification] Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
}; 