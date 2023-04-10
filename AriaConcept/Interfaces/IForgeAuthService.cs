using System.Threading.Tasks;
using AriaConcept.Services;

namespace AriaConcept.Interfaces
{
    public interface IForgeAuthService
    {
        string ClientID { get; }
        Task<Token> GetInternalToken();
        Task<Token> GetPublicToken();
    }
}