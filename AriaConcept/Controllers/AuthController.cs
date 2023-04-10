using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Autodesk.Forge;
using AriaConcept.Interfaces;

namespace AriaConcept.Controllers
{
    [ApiController]
    public class AuthController : ControllerBase
    {
        // As both internal & public tokens are used for all visitors
        // we don't need to request a new token on every request, so let's
        // cache them using static variables. Note we still need to refresh
        // them after the expires_in time (in seconds)
        public record AccessToken(string access_token, long expires_in);

        private readonly IForgeAuthService _forgeAuthService;

        public AuthController(IForgeAuthService forgeAuthService)
        {
            _forgeAuthService = forgeAuthService;
        }
        [HttpGet]
        [Route("/api/auth/token")]
        public async Task<AccessToken> GetAccessToken()
        {
            var token = await _forgeAuthService.GetPublicToken();
            return new AccessToken(token.AccessToken, (long)Math.Round((token.ExpiresAt - DateTime.UtcNow).TotalSeconds));
        }
    }
}

