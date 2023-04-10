using AriaConcept.Services;

using Autodesk.Forge.Model;

using System.Threading.Tasks;

namespace AriaConcept.Interfaces
{
    public interface IForgeDerivativeService
    {
        Task<TranslationStatus> GetTranslationStatus(string urn);
        Task<Job> TranslateModel(string objectUrn, string rootFilename);
    }
}