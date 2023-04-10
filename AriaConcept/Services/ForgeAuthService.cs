using System;
using System.Threading.Tasks;

using Autodesk.Forge;

using AriaConcept.Interfaces;

namespace AriaConcept.Services
{
    public record Token(string AccessToken, DateTime ExpiresAt);
    public class ForgeAuthService : IForgeAuthService
    {
        private Token _internalTokenCache;
        private Token _publicTokenCache;
        private string _clientSecret;
        private string _clientId;

        public string ClientID => _clientId;
        public ForgeAuthService(IConfiguration configuration)
        {
            _clientId =  configuration.GetSection("FORGE_CLIENT_ID").Value;
            _clientSecret =  configuration.GetSection("FORGE_CLIENT_SECRET").Value;
        }
        private async Task<Token> GetToken(Scope[] scopes)
        {
            dynamic auth = await new TwoLeggedApi().AuthenticateAsync(ClientID, _clientSecret, "client_credentials", scopes);
            return new Token(auth.access_token, DateTime.UtcNow.AddSeconds(auth.expires_in));
        }

        /// <summary>
        /// Get access token with internal (write) scope
        /// </summary>
        public async Task<Token> GetPublicToken()
        {
            if (_publicTokenCache == null || _publicTokenCache.ExpiresAt < DateTime.UtcNow)
                _publicTokenCache = await GetToken(new Scope[] { Scope.ViewablesRead });
            return _publicTokenCache;
        }
        /// <summary>
        /// Get access token with internal (write) scope
        /// </summary>
        public async Task<Token> GetInternalToken()
        {
            if (_internalTokenCache == null || _internalTokenCache.ExpiresAt < DateTime.UtcNow)
                _internalTokenCache = await GetToken(new Scope[]
                {
                    Scope.BucketCreate,
                    Scope.BucketRead,
                    Scope.BucketDelete,
                    Scope.DataRead,
                    Scope.DataWrite,
                    Scope.DataCreate,
                    Scope.CodeAll
                });
            return _internalTokenCache;
        }
    }
}
