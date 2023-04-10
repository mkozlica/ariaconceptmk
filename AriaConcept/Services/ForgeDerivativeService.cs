﻿using System.Collections.Generic;
using System.Threading.Tasks;

using AriaConcept.Interfaces;

using Autodesk.Forge;
using Autodesk.Forge.Model;

namespace AriaConcept.Services
{
    public record TranslationStatus(string Status, string Progress, IEnumerable<string>? Messages);
    public class ForgeDerivativeService : IForgeDerivativeService
    {
        private readonly IForgeAuthService _forgeAuthService;
        public ForgeDerivativeService(IForgeAuthService  forgeAuthService)
        {
            _forgeAuthService = forgeAuthService;
        }
        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes).TrimEnd('=');
        }

        public async Task<Job> TranslateModel(string objectUrn, string rootFilename)
        {
            var token = await _forgeAuthService.GetInternalToken();
            var api = new DerivativesApi();
            api.Configuration.AccessToken = token.AccessToken;
            var formats = new List<JobPayloadItem> {
            new JobPayloadItem (JobPayloadItem.TypeEnum.Svf,
                                new List<JobPayloadItem.ViewsEnum> { JobPayloadItem.ViewsEnum._2d, JobPayloadItem.ViewsEnum._2d })
        };
            var payload = new JobPayload(
                new JobPayloadInput(objectUrn),
                new JobPayloadOutput(formats)
            );
            if (!string.IsNullOrEmpty(rootFilename))
            {
                payload.Input.RootFilename = rootFilename;
                payload.Input.CompressedUrn = true;
            }
            var job = (await api.TranslateAsync(payload)).ToObject<Job>();
            return job;
        }

        public async Task<TranslationStatus> GetTranslationStatus(string urn)
        {
            var token = await _forgeAuthService.GetInternalToken();
            var api = new DerivativesApi();
            api.Configuration.AccessToken = token.AccessToken;
            var json = (await api.GetManifestAsync(urn)).ToJson();
            var messages = new List<string>();
            foreach (var message in json.SelectTokens("$.derivatives[*].messages[?(@.type == 'error')].message"))
            {
                if (message.Type == Newtonsoft.Json.Linq.JTokenType.String)
                    messages.Add((string)message);
            }
            foreach (var message in json.SelectTokens("$.derivatives[*].children[*].messages[?(@.type == 'error')].message"))
            {
                if (message.Type == Newtonsoft.Json.Linq.JTokenType.String)
                    messages.Add((string)message);
            }
            return new TranslationStatus((string)json["status"], (string)json["progress"], messages);
        }
    }
}
