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

interface SendChatNotificationParams {
  ticketId: string;
  customerEmail: string;
  messageContent: string;
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

/**
 * Sends an email notification for a chat message
 */
export const sendChatNotification = async ({
  ticketId,
  customerEmail,
  messageContent,
}: SendChatNotificationParams): Promise<boolean> => {
  try {
    // Get and verify session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('[email/sendChatNotification] Session check:', {
      hasSession: !!sessionData?.session,
      sessionError
    });

    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }

    if (!sessionData?.session) {
      throw new Error('No session available');
    }

    // Call Edge Function
    console.log('[email/sendChatNotification] Calling Edge Function:', {
      to: customerEmail,
      messageContent,
      ticketId
    });

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: customerEmail,
        subject: `New Message on Ticket #${ticketId}`,
        body: messageContent,
        ticketId
      },
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`
      }
    });

    if (error) {
      console.error('[email/sendChatNotification] Edge Function error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }

    console.log('[email/sendChatNotification] Edge Function response:', data);

    // Log the email attempt
    const { error: logError } = await supabase.from("email_logs").insert({
      ticket_id: ticketId,
      status: "SENT",
      recipient_email: customerEmail,
    });

    if (logError) {
      console.error('[email/sendChatNotification] Error logging email:', logError);
    }

    return true;
  } catch (err) {
    const error = err as Error;
    console.error('[email/sendChatNotification] Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
}; 