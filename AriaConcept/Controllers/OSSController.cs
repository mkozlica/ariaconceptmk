using Autodesk.Forge.Model;
using Autodesk.Forge;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AriaConcept.Interfaces;
//using Autodesk.Forge.Core;

namespace AriaConcept.Controllers
{
    [ApiController]
    public class OSSController : ControllerBase
    {
        public record BucketObject(string name, string urn);

        private IWebHostEnvironment _env;
        private  IForgeOSSService _forgeService;
        private  IForgeAuthService _forgeAuthService;

        public OSSController(IWebHostEnvironment env, IForgeOSSService forgeService, IForgeAuthService forgeAuthService)
        {
            _env = env;
            _forgeService = forgeService;
            _forgeAuthService = forgeAuthService;
        }
        /// <summary>
        /// Return list of buckets (id=#) or list of objects (id=bucketKey)
        /// </summary>
        [HttpGet]
        [Route("api/forge/oss/buckets")]
        public async Task<IList<TreeNode>> GetOSSAsync(string id)
        {
            return await _forgeService.GetAllBuckets(id);
        }       
        /// <summary>
        /// Create a new bucket 
        /// </summary>
        [HttpPost]
        [Route("api/forge/oss/buckets")]
        public async Task CreateBucket([FromBody] CreateBucketModel bucket)
        {
            await _forgeService.EnsureBucketExists(string.Format("{0}-{1}", _forgeAuthService.ClientID.ToLower(), bucket.bucketKey.ToLower()));
        }
        /// <summary>
        /// Input model for CreateBucket method
        /// </summary>
        public class CreateBucketModel
        {
            public string bucketKey { get; set; }
        }
        /// <summary>
        /// Receive a file from the client and upload to the bucket
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        [Route("api/forge/oss/objects")]
        public async Task<dynamic> UploadObject([FromForm] UploadFile input)
        {
            // save the file on the server
            var fileSavePath = Path.Combine(_env.WebRootPath, Path.GetFileName(input.fileToUpload.FileName));
            using (var stream = new FileStream(fileSavePath, FileMode.Create))
                await input.fileToUpload.CopyToAsync(stream);

            // upload the file/object, which will create a new object
            dynamic uploadedObj;
            using (StreamReader streamReader = new StreamReader(fileSavePath))
            {
                uploadedObj = await _forgeService.UploadModel(Path.GetFileName(input.fileToUpload.FileName), streamReader.BaseStream, (int)streamReader.BaseStream.Length);
            }
            // cleanup
            System.IO.File.Delete(fileSavePath);

            return uploadedObj;
        }

        public class UploadFile
        {
            public string bucketKey { get; set; }
            public IFormFile fileToUpload { get; set; }
        }

        /// <summary>
        /// Base64 enconde a string
        /// </summary>
        public static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        /// <summary>
        /// Model data for jsTree used on GetOSSAsync
        /// </summary>
        public class TreeNode
        {
            public TreeNode(string id, string text, string type, bool children)
            {
                this.id = id;
                this.text = text;
                this.type = type;
                this.children = children;
            }

            public string id { get; set; }
            public string text { get; set; }
            public string type { get; set; }
            public bool children { get; set; }
        }
    }
}
