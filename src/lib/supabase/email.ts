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
    console.error("Error fetching email template:", error);
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
    // 1. Get the email template
    const template = await getEmailTemplate(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    // 2. Replace variables in subject and body
    const subject = replaceTemplateVariables(template.subject_template, variables);
    const body = replaceTemplateVariables(template.body_template, variables);

    // 3. For now, we'll just log the email (we'll implement actual sending later)
    console.log("[email/sendEmailNotification] 📧 Would send email:", {
      subject,
      body,
      ticketId,
      templateId: template.id,
      recipientEmail: variables.customer_email
    });

    // 4. Log the email attempt
    const { error: logError } = await supabase.from("email_logs").insert({
      ticket_id: ticketId,
      template_id: template.id,
      status: "SENT", // We'll update this when we implement actual sending
      recipient_email: variables.customer_email || "",
    });

    if (logError) {
      throw logError;
    }

    return true;
  } catch (error) {
    console.error("Error sending email notification:", error);
    return false;
  }
}; 