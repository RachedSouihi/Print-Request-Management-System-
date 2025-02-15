package com.microservices.user_service.service;


import com.microservices.user_service.utils.VerificationCodeUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;



    /**
     * Sends a verification email using custom HTML content.
     *
     * @param to                 Recipient's email address
     * @param verificationCode
     * @param firstname
     //* @param subject           Email subject
     // * @param verificationLink   The link to verify the email address
     // * @param unsubscribeLink    Link for unsubscribing
     // * @param privacyPolicyLink  Link to the privacy policy
     // * @throws MessagingException if there is a failure in sending the email
     */
    public void sendVerificationEmail(String to, String verificationCode, String firstname) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        // Set to true for multipart message (HTML content)
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("no-reply@eduplatform.com");
        helper.setTo(to);
        helper.setSubject("Verification code");

        // Your custom HTML email content with inline CSS
        String htmlContent = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <style>\n" +
                "        /* Email-safe inline CSS */\n" +
                "        body {\n" +
                "            margin: 0;\n" +
                "            padding: 0;\n" +
                "            background-color: #F8FAFC;\n" +
                "            font-family: 'Montserrat', sans-serif;\n" +
                "        }\n" +
                "        .container {\n" +
                "            max-width: 600px;\n" +
                "            margin: 0 auto;\n" +
                "            background: #FFFFFF;\n" +
                "        }\n" +
                "        .header {\n" +
                "            background: #4A55A2;\n" +
                "            padding: 2rem;\n" +
                "            text-align: center;\n" +
                "        }\n" +
                "        .logo {\n" +
                "            color: #FFFFFF;\n" +
                "            font-size: 1.5rem;\n" +
                "            font-weight: 600;\n" +
                "        }\n" +
                "        .content {\n" +
                "            padding: 2rem;\n" +
                "            color: #2D3250;\n" +
                "        }\n" +
                "        .verification-code {\n" +
                "            background: #F8FAFC;\n" +
                "            padding: 1.5rem;\n" +
                "            text-align: center;\n" +
                "            margin: 2rem 0;\n" +
                "            border-radius: 8px;\n" +
                "            font-size: 2.5rem;\n" +
                "            font-weight: 600;\n" +
                "            color: #4A55A2;\n" +
                "            letter-spacing: 0.1em;\n" +
                "        }\n" +
                "        .cta-button {\n" +
                "            display: inline-block;\n" +
                "            background: linear-gradient(135deg, #4A55A2, #8A4FFF);\n" +
                "            color: white !important;\n" +
                "            padding: 1rem 2rem;\n" +
                "            border-radius: 8px;\n" +
                "            text-decoration: none;\n" +
                "            font-weight: 600;\n" +
                "            margin: 1rem 0;\n" +
                "        }\n" +
                "        .support-section {\n" +
                "            border-top: 1px solid #e2e8f0;\n" +
                "            padding-top: 2rem;\n" +
                "            margin-top: 2rem;\n" +
                "            font-size: 0.9rem;\n" +
                "            color: #666666;\n" +
                "        }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <!-- Header -->\n" +
                "        <div class=\"header\">\n" +
                "            <div class=\"logo\">EduPlatform</div>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- Main Content -->\n" +
                "        <div class=\"content\">\n" +
                "            <h2>Verify Your Email Address</h2>\n" +
                "            <p>Hi "+ firstname + ", welcome to EduPlatform! To complete your registration, please enter this verification code:</p>\n" +
                "            \n" +
                "            <div class=\"verification-code\">\n" +
                "                " + verificationCode + "\n" +
                "            </div>\n" +
                "\n" +
                "            <p>This code will expire in 30 minutes. If you didn't request this code, you can safely ignore this email.</p>\n" +
                "\n" +
                "            <a href=\"" + " " + "\" class=\"cta-button\">Verify Email Address</a>\n" +
                "\n" +
                "            <!-- Support Section -->\n" +
                "            <div class=\"support-section\">\n" +
                "                <p>Need help? Contact our support team at \n" +
                "                    <a href=\"mailto:support@eduplatform.com\" style=\"color: #4A55A2; text-decoration: none;\">\n" +
                "                        support@eduplatform.com\n" +
                "                    </a>\n" +
                "                </p>\n" +
                "                <p>Best regards,<br>The EduPlatform Team</p>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "\n" +
                "        <!-- Footer -->\n" +
                "        <div style=\"padding: 1rem; text-align: center; color: #666666; font-size: 0.8rem;\">\n" +
                "            <p>© 2024 EduPlatform. All rights reserved.</p>\n" +
                "            <p>\n" +
                "                <a href=\"" + " " + "\" style=\"color: #666666; text-decoration: none;\">Unsubscribe</a> | \n" +
                "                <a href=\"" + " s" + "\" style=\"color: #666666; text-decoration: none;\">Privacy Policy</a>\n" +
                "            </p>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
