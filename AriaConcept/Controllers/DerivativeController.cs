using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using AriaConcept.Interfaces;
using AriaConcept.Services;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using static AriaConcept.Controllers.OSSController;

namespace AriaConcept.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DerivativeController : ControllerBase
    {
        public record BucketObject(string name, string urn);

        private readonly IForgeDerivativeService _forgeDerivativeService;
        private readonly IForgeOSSService _forgeOSSService;

        public DerivativeController(IForgeDerivativeService forgeDerivativeService, IForgeOSSService forgeOSSService)
        {
            _forgeDerivativeService = forgeDerivativeService;
            _forgeOSSService = forgeOSSService;
        }

        [HttpGet()]
        public async Task<IEnumerable<BucketObject>> GetModels()
        {
            var objects = await _forgeOSSService.GetObjects();
            return from o in objects
                   select new BucketObject(o.ObjectKey, Base64Encode(o.ObjectId));
        }

        [HttpGet("{urn}/status")]
        public async Task<TranslationStatus> GetModelStatus(string urn)
        {
            try
            {
                var status = await _forgeDerivativeService.GetTranslationStatus(urn);
                return status;
            }
            catch (Autodesk.Forge.Client.ApiException ex)
            {
                if (ex.ErrorCode == 404)
                    return new TranslationStatus("n/a", "", new List<string>());
                else
                    throw ex;
            }
        }

        public class UploadModelForm
        {
            [FromForm(Name = "model-zip-entrypoint")]
            public string? Entrypoint { get; set; }

            [FromForm(Name = "model-urn")]
            public string? ObjectUrn { get; set; }

            [FromForm(Name = "model-id")]
            public string? ObjectId { get; set; }
        }

        [HttpPost()]
        public async Task<BucketObject> TranslateModel([FromForm] UploadModelForm form)
        {
            var job = await _forgeDerivativeService.TranslateModel(form.ObjectUrn, form.Entrypoint);
            return new BucketObject(form.ObjectId, form.ObjectUrn);
        }
    }
}
