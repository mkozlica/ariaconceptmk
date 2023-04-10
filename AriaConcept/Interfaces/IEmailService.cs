using Newtonsoft.Json.Linq;

namespace AriaConcept.Interfaces
{
    public interface IEmailService
    {
        void SendEmail(JObject email);
    }
}
