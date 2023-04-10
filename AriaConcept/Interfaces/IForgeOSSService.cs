using Autodesk.Forge.Model;

using AriaConcept.Controllers;

using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace AriaConcept.Interfaces
{
    public interface IForgeOSSService
    {
        Task EnsureBucketExists(string bucketKey);
        Task<IList<OSSController.TreeNode>> GetAllBuckets(string id);
        Task<IEnumerable<ObjectDetails>> GetObjects();
        Task<ObjectDetails> UploadModel(string objectName, Stream content, long contentLength);
    }
}