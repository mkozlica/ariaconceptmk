using MailKit.Net.Smtp;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using MimeKit;
using MimeKit.Text;
using MailKit.Security;
using Newtonsoft.Json.Linq;
using AriaConcept.Models;
using AriaConcept.Interfaces;

namespace AriaConcept.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _email;

        public EmailController(IEmailService email)
        {
            _email = email;
        }
        [HttpPost]
        public IActionResult SendEmail([FromForm] EmailData body)
        {
            JObject email = JObject.Parse(body.Email);
            _email.SendEmail(email);
            return Ok();
        }
        public class EmailData
        {
            public string From { get; set; } = "Nedeljko Sovljanski";
            public string Email { get; set; }
        }
    }
}
