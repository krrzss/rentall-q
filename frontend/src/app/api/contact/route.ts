import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/server/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, countryCode, phone, businessName, city, message } = body;

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Full name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const formattedSubject = `New Contact Inquiry: ${fullName} (${businessName || 'RentallQ Visitor'})`;
    const formattedMessage = `
New Contact Inquiry from RentallQ Website:
------------------------------------------
Name: ${fullName}
Email: ${email}
Phone: ${countryCode || '+91'} ${phone || 'N/A'}
Business / Shop Name: ${businessName || 'N/A'}
City / Location: ${city || 'N/A'}

Message:
${message}

------------------------------------------
Submitted at: ${new Date().toISOString()}
`;

    let emailSent = false;
    let emailMethod = 'none';

    // 1. Try sending via Nodemailer (Gmail / SMTP) if credentials configured
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.GMAIL_USER || process.env.SMTP_USER || 'rentallq.support@gmail.com';
    const smtpPass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

    if (smtpPass) {
      try {
        // @ts-ignore
        const nodemailerModule = await import('nodemailer').catch(() => null);
        if (nodemailerModule) {
          const nodemailer = (nodemailerModule as any).default || nodemailerModule;
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          await transporter.sendMail({
          from: `"RentallQ Contact Form" <${smtpUser}>`,
          to: 'rentallq.support@gmail.com',
          replyTo: email, // Sets reply-to directly to visitor's email
          subject: formattedSubject,
          text: formattedMessage,
          html: `
            <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
                New Contact Form Inquiry
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
                <tr><td style="padding: 6px 0; font-weight: bold; width: 140px; color: #475569;">Full Name:</td><td style="color: #0f172a; font-weight: 600;">${fullName}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Email:</td><td><a href="mailto:${email}" style="color: #2563eb; font-weight: 600; text-decoration: none;">${email}</a></td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Phone:</td><td style="color: #0f172a;">${countryCode || '+91'} ${phone || 'N/A'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">Business / Shop:</td><td style="color: #0f172a;">${businessName || 'N/A'}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: bold; color: #475569;">City / Location:</td><td style="color: #0f172a;">${city || 'N/A'}</td></tr>
              </table>
              <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin-top: 12px;">
                <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Message Content:</h4>
                <p style="margin: 0; white-space: pre-wrap; color: #1e293b; line-height: 1.6; font-size: 14px;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                💡 <strong>Tip:</strong> Simply click <strong>Reply</strong> in Gmail to answer <strong>${fullName}</strong> at <code>${email}</code>.
              </p>
            </div>
          `,
        });
        emailSent = true;
        emailMethod = 'smtp';
        }
      } catch (err: any) {
        console.error('SMTP Email sending error:', err);
      }
    }

    // 2. Fallback: Web3Forms contact form service (if access key provided)
    if (!emailSent && process.env.WEB3FORMS_ACCESS_KEY) {
      try {
        const web3res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: process.env.WEB3FORMS_ACCESS_KEY,
            to: 'rentallq.support@gmail.com',
            from_name: fullName,
            subject: formattedSubject,
            email: email,
            phone: `${countryCode || '+91'} ${phone || ''}`,
            message: `Business: ${businessName || 'N/A'}\nCity: ${city || 'N/A'}\n\n${message}`,
          }),
        });

        const web3data = await web3res.json();
        if (web3data.success) {
          emailSent = true;
          emailMethod = 'web3forms';
        }
      } catch (err: any) {
        console.error('Web3Forms sending error:', err);
      }
    }

    // 3. Store in Supabase database for backup record
    try {
      const supabase = createClient();
      await supabase.from('contact_submissions').insert({
        full_name: fullName,
        email,
        phone: `${countryCode || '+91'} ${phone}`,
        business_name: businessName,
        city,
        message,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      // Table may not exist yet in Supabase SQL schema, suppress harmless error
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailMethod,
      message: emailSent
        ? 'Your message has been sent directly to rentallq.support@gmail.com.'
        : 'Your contact form request was received successfully.',
    });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact form.' },
      { status: 500 }
    );
  }
}
