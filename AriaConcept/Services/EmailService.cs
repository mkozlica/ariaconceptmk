using AriaConcept.Interfaces;

using MailKit.Security;
using MimeKit.Text;
using MimeKit;
using Newtonsoft.Json.Linq;
using AriaConcept.Models;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;

namespace AriaConcept.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }
        public void SendEmail(JObject emailData)
        {
            string[] to = emailData["to"].Value<string>().Split(';');
            string subject = emailData["subject"].Value<string>();
            string body = emailData["body"].Value<string>();
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_config.GetSection("EmailUsername").Value));
            foreach (string item in to)
            {
                email.To.Add(MailboxAddress.Parse(item));
            }
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = body };

            using var smtp = new SmtpClient();
            smtp.Connect(_config.GetSection("EmailHost").Value, 587, SecureSocketOptions.StartTls);
            smtp.Authenticate(_config.GetSection("EmailUsername").Value, _config.GetSection("EmailPassword").Value);
            smtp.Send(email);
            smtp.Disconnect(true);
        }
    }
}
